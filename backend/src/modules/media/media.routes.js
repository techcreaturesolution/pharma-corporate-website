import { Router } from 'express';
import Joi from 'joi';
import path from 'node:path';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendCreated, sendNoContent, buildMeta } from '../../utils/ApiResponse.js';
import { parsePagination, escapeRegex } from '../../utils/pagination.js';
import { storage } from '../../config/storage.js';
import { validate, contentAccess, uploadMedia, verifySignatures } from '../../middleware/index.js';
import { idParams } from '../shared/schemas.js';
import { Media } from './media.model.js';

const FOLDERS = ['products', 'categories', 'gallery', 'news', 'certificates', 'facilities', 'leadership', 'pages', 'documents', 'misc'];

const upload = async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.validation([{ field: 'files', message: 'At least one file is required' }]);
  const folder = FOLDERS.includes(req.body.folder) ? req.body.folder : 'misc';
  const created = [];
  for (const file of files) {
    const stored = await storage.save({ buffer: file.buffer, originalName: file.originalname, visibility: 'public', folder });
    created.push(
      await Media.create({
        url: stored.url,
        key: stored.key,
        filename: path.basename(stored.key),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        kind: file.mimetype.startsWith('image/') ? 'image' : 'document',
        folder,
        alt: req.body.alt || path.parse(file.originalname).name,
        uploadedBy: req.user._id,
      }),
    );
  }
  return sendCreated(res, `${created.length} file(s) uploaded successfully`, created.length === 1 ? created[0] : created);
};

const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  kind: Joi.string().valid('image', 'document'),
  folder: Joi.string().valid(...FOLDERS),
  search: Joi.string().allow('').max(100),
});

const list = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 40 });
  const filter = {};
  if (req.query.kind) filter.kind = req.query.kind;
  if (req.query.folder) filter.folder = req.query.folder;
  if (req.query.search) filter.originalName = new RegExp(escapeRegex(req.query.search), 'i');
  const [items, total] = await Promise.all([
    Media.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  return sendSuccess(res, { message: 'Media retrieved successfully', data: items, meta: buildMeta({ page, limit, total }) });
};

const updateAlt = async (req, res) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { alt: req.body.alt }, { new: true }).lean();
  if (!media) throw ApiError.notFound('Media not found');
  return sendSuccess(res, { message: 'Media updated successfully', data: media });
};

const remove = async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('Media not found');
  await storage.remove({ key: media.key, visibility: 'public' });
  await media.deleteOne();
  return sendNoContent(res);
};

const router = Router();
router.use(...contentAccess);
router.post('/upload', uploadMedia.array('files', 5), verifySignatures, asyncHandler(upload));
router.get('/', validate({ query: listQuery }), asyncHandler(list));
router.patch('/:id', validate({ ...idParams, body: Joi.object({ alt: Joi.string().allow('').max(200).required() }) }), asyncHandler(updateAlt));
router.delete('/:id', validate(idParams), asyncHandler(remove));

export default router;
