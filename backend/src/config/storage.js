import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

/**
 * Storage abstraction. The default `local` provider writes files to disk and serves
 * public files from `/uploads`. Private files (resumes) live in a separate directory
 * that is never mounted statically; they are streamed through an authenticated route.
 *
 * Cloudinary provider streams public media directly to Cloudinary and returns secure_url,
 * while safely retaining private files (resumes) in authenticated local storage.
 */
const root = path.resolve(process.cwd(), env.storage.localDir);
export const PUBLIC_DIR = path.join(root, 'public');
export const PRIVATE_DIR = path.join(root, 'private');

const ensureDirs = async () => {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(PRIVATE_DIR, { recursive: true });
};

const safeName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
};

const localProvider = {
  async save({ buffer, originalName, visibility = 'public', folder = 'misc' }) {
    await ensureDirs();
    const base = visibility === 'private' ? PRIVATE_DIR : PUBLIC_DIR;
    const dir = path.join(base, folder);
    await fs.mkdir(dir, { recursive: true });
    const filename = safeName(originalName);
    await fs.writeFile(path.join(dir, filename), buffer);
    const key = `${folder}/${filename}`;
    const url =
      visibility === 'private'
        ? null
        : `${env.storage.publicBaseUrl || `${env.apiBaseUrl}/uploads`}/${key}`;
    return { key, url, visibility };
  },
  async remove({ key, visibility }) {
    const base = visibility === 'private' ? PRIVATE_DIR : PUBLIC_DIR;
    await fs.rm(path.join(base, key), { force: true });
  },
  privatePath(key) {
    const resolved = path.join(PRIVATE_DIR, key);
    if (!resolved.startsWith(PRIVATE_DIR)) throw new Error('Invalid file key');
    return resolved;
  },
};

// Configure Cloudinary SDK if credentials exist
if (
  env.storage.cloudinary?.cloudName &&
  env.storage.cloudinary?.apiKey &&
  env.storage.cloudinary?.apiSecret
) {
  cloudinary.config({
    cloud_name: env.storage.cloudinary.cloudName,
    api_key: env.storage.cloudinary.apiKey,
    api_secret: env.storage.cloudinary.apiSecret,
    secure: true,
  });
}

const cloudinaryProvider = {
  async save({ buffer, originalName, visibility = 'public', folder = 'misc' }) {
    // Private files (e.g. sensitive resumes) are stored in local private storage
    // so they remain protected and can be streamed through authenticated admin routes
    if (visibility === 'private') {
      return localProvider.save({ buffer, originalName, visibility, folder });
    }

    if (!env.storage.cloudinary?.cloudName || !env.storage.cloudinary?.apiKey) {
      throw new Error(
        'Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env'
      );
    }

    const isImage = /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff)$/i.test(originalName);
    const resourceType = isImage ? 'image' : 'raw';
    const folderPrefix = env.storage.cloudinary.folderPrefix || 'pharma-corporate';
    const targetFolder = `${folderPrefix}/${folder}`;
    const cleanBaseName = path
      .parse(originalName)
      .name.replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const publicId = `${cleanBaseName}-${Date.now()}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          public_id: publicId,
          resource_type: resourceType,
          overwrite: false,
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      Readable.from(buffer).pipe(uploadStream);
    });

    return {
      key: result.public_id,
      url: result.secure_url,
      visibility: 'public',
      width: result.width,
      height: result.height,
      format: result.format,
    };
  },

  async remove({ key, visibility }) {
    if (visibility === 'private') {
      return localProvider.remove({ key, visibility });
    }

    try {
      // Try destroying as image first; if not found, try raw
      const res = await cloudinary.uploader.destroy(key, { resource_type: 'image' });
      if (res?.result === 'not found') {
        await cloudinary.uploader.destroy(key, { resource_type: 'raw' });
      }
    } catch (err) {
      console.warn(`[Cloudinary] Could not delete remote asset (${key}):`, err.message);
    }
  },

  privatePath(key) {
    return localProvider.privatePath(key);
  },
};

const providers = {
  local: localProvider,
  cloudinary: cloudinaryProvider,
};

export const storage = providers[env.storage.provider] || localProvider;
