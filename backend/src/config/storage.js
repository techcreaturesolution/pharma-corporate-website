import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from './env.js';

/**
 * Storage abstraction. The default `local` provider writes files to disk and serves
 * public files from `/uploads`. Private files (resumes) live in a separate directory
 * that is never mounted statically; they are streamed through an authenticated route.
 *
 * To use S3/GCS/Cloudinary, implement the same `save`/`remove`/`readPrivate` contract
 * and select it via STORAGE_PROVIDER.
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

const providers = { local: localProvider };

export const storage = providers[env.storage.provider] || localProvider;
