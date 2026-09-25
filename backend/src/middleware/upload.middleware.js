import multer from 'multer';
import path from 'node:path';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
export const DOCUMENT_TYPES = { 'application/pdf': ['.pdf'] };
export const RESUME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

/** Magic-byte signatures, checked in addition to the declared mimetype. */
const SIGNATURES = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/msword': [[0xd0, 0xcf, 0x11, 0xe0]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4b, 0x03, 0x04]],
};

export const matchesSignature = (buffer, mimetype) => {
  const sigs = SIGNATURES[mimetype];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
};

const makeUploader = (allowed) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 5 },
    fileFilter: (req, file, cb) => {
      const exts = allowed[file.mimetype];
      const ext = path.extname(file.originalname).toLowerCase();
      if (!exts || !exts.includes(ext)) {
        return cb(ApiError.badRequest(`Unsupported file type: ${file.originalname}`));
      }
      return cb(null, true);
    },
  });

export const uploadImage = makeUploader(IMAGE_TYPES);
export const uploadMedia = makeUploader({ ...IMAGE_TYPES, ...DOCUMENT_TYPES });
export const uploadResume = makeUploader(RESUME_TYPES);

/** Runs after multer: rejects files whose bytes do not match the declared type. */
export const verifySignatures = (req, res, next) => {
  const files = [...(req.files || []), ...(req.file ? [req.file] : [])];
  for (const file of files) {
    if (!matchesSignature(file.buffer, file.mimetype)) {
      return next(ApiError.badRequest(`File content does not match its type: ${file.originalname}`));
    }
  }
  return next();
};
