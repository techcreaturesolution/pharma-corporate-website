import { Router } from 'express';
import Joi from 'joi';
import path from 'node:path';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendNoContent, buildMeta } from '../../utils/ApiResponse.js';
import { parsePagination, parseSort, escapeRegex } from '../../utils/pagination.js';
import { storage } from '../../config/storage.js';
import { validate, adminOnly } from '../../middleware/index.js';
import { idParams, objectId } from '../shared/schemas.js';
import { Application } from './application.model.js';

const STATUSES = ['received', 'in_review', 'shortlisted', 'interview', 'rejected', 'hired', 'archived'];
const POPULATE = { path: 'jobId', select: 'title slug department location status' };

const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('').max(100),
  status: Joi.string().valid(...STATUSES),
  jobId: objectId,
  sort: Joi.string().valid('createdAt', 'name', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

const list = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.jobId) filter.jobId = req.query.jobId;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const sort = parseSort(req.query, ['createdAt', 'name', 'status'], '-createdAt');
  const [items, total] = await Promise.all([
    Application.find(filter).sort(sort).skip(skip).limit(limit).select('-resume.key -source').populate(POPULATE).lean(),
    Application.countDocuments(filter),
  ]);
  return sendSuccess(res, { message: 'Applications retrieved successfully', data: items, meta: buildMeta({ page, limit, total }) });
};

const detail = async (req, res) => {
  const doc = await Application.findById(req.params.id).select('-resume.key').populate(POPULATE).lean();
  if (!doc) throw ApiError.notFound('Application not found');
  return sendSuccess(res, { message: 'Application retrieved successfully', data: doc });
};

const setStatus = async (req, res) => {
  const doc = await Application.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Application not found');
  doc.status = req.body.status;
  if (req.body.notes !== undefined) doc.notes = req.body.notes;
  await doc.save();
  return sendSuccess(res, { message: 'Application status updated', data: { _id: doc._id, status: doc.status, notes: doc.notes } });
};

/** Streams the private resume to an authenticated admin. Never exposed as a public URL. */
const downloadResume = async (req, res) => {
  const doc = await Application.findById(req.params.id).select('resume').lean();
  if (!doc) throw ApiError.notFound('Application not found');
  const filePath = storage.privatePath(doc.resume.key);
  res.setHeader('Content-Type', doc.resume.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(doc.resume.originalName).replace(/"/g, '')}"`);
  return res.sendFile(filePath);
};

const remove = async (req, res) => {
  const doc = await Application.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Application not found');
  await storage.remove({ key: doc.resume.key, visibility: 'private' });
  await doc.deleteOne();
  return sendNoContent(res);
};

const router = Router();
router.use(...adminOnly);
router.get('/', validate({ query: listQuery }), asyncHandler(list));
router.get('/:id', validate(idParams), asyncHandler(detail));
router.get('/:id/resume', validate(idParams), asyncHandler(downloadResume));
router.patch(
  '/:id/status',
  validate({
    ...idParams,
    body: Joi.object({ status: Joi.string().valid(...STATUSES).required(), notes: Joi.string().allow('').max(5000) }),
  }),
  asyncHandler(setStatus),
);
router.delete('/:id', validate(idParams), asyncHandler(remove));

export default router;
