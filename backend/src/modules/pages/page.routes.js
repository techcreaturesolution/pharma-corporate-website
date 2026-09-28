import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse.js';
import { uniqueSlug } from '../../utils/slug.js';
import { validate, contentAccess } from '../../middleware/index.js';
import { optionalAuth, isAdminRequest } from '../shared/optionalAuth.js';
import { imageJoi, seoJoi, slugJoi, idParams } from '../shared/schemas.js';
import { Page } from './page.model.js';

const sectionJoi = Joi.object({
  key: Joi.string().allow('').max(60),
  type: Joi.string().max(40).required(),
  title: Joi.string().allow('').max(200),
  subtitle: Joi.string().allow('').max(300),
  content: Joi.string().allow('').max(100000),
  image: imageJoi,
  items: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().allow('').max(200),
        value: Joi.string().allow('').max(200),
        description: Joi.string().allow('').max(2000),
        icon: Joi.string().allow('').max(60),
        image: imageJoi,
        link: Joi.string().allow('').max(500),
      }),
    )
    .max(50),
  cta: Joi.object({ label: Joi.string().allow('').max(100), url: Joi.string().allow('').max(500) }),
  sortOrder: Joi.number().integer(),
});

const base = {
  title: Joi.string().trim().max(200),
  slug: slugJoi,
  pageType: Joi.string().valid('system', 'custom'),
  featuredImage: imageJoi,
  sections: Joi.array().items(sectionJoi).max(50),
  seo: seoJoi,
  status: Joi.string().valid('draft', 'published', 'archived'),
};

const getPublic = async (req, res) => {
  const filter = { slug: req.params.slug };
  if (!isAdminRequest(req)) filter.status = 'published';
  const page = await Page.findOne(filter).lean();
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, { message: 'Page retrieved successfully', data: page });
};

const list = async (req, res) => {
  const pages = await Page.find().sort('pageType title').select('title slug pageType status publishedAt updatedAt').lean();
  return sendSuccess(res, { message: 'Pages retrieved successfully', data: pages });
};

const detail = async (req, res) => {
  const page = await Page.findById(req.params.id).lean();
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, { message: 'Page retrieved successfully', data: page });
};

const create = async (req, res) => {
  const data = { ...req.body, updatedBy: req.user._id };
  data.slug = await uniqueSlug(Page, data.slug || data.title);
  const page = await Page.create(data);
  return sendCreated(res, 'Page created successfully', page);
};

const update = async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) throw ApiError.notFound('Page not found');
  const data = { ...req.body, updatedBy: req.user._id };
  if (page.pageType === 'system') delete data.slug;
  else if (data.slug && data.slug !== page.slug) data.slug = await uniqueSlug(Page, data.slug, page._id);
  page.set(data);
  await page.save();
  return sendSuccess(res, { message: 'Page updated successfully', data: page });
};

const publish = async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) throw ApiError.notFound('Page not found');
  page.status = req.body.status || 'published';
  if (page.status === 'published' && !page.publishedAt) page.publishedAt = new Date();
  page.updatedBy = req.user._id;
  await page.save();
  return sendSuccess(res, { message: `Page ${page.status}`, data: page });
};

const remove = async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) throw ApiError.notFound('Page not found');
  if (page.pageType === 'system') throw ApiError.forbidden('System pages cannot be deleted');
  await page.deleteOne();
  return sendNoContent(res);
};

export const publicRouter = Router();
publicRouter.get('/:slug', optionalAuth, validate({ params: Joi.object({ slug: slugJoi.required() }) }), asyncHandler(getPublic));

export const adminRouter = Router();
adminRouter.use(...contentAccess);
adminRouter.get('/', asyncHandler(list));
adminRouter.post('/', validate({ body: Joi.object({ ...base, title: base.title.required() }) }), asyncHandler(create));
adminRouter.get('/:id', validate(idParams), asyncHandler(detail));
adminRouter.put('/:id', validate({ ...idParams, body: Joi.object(base).min(1) }), asyncHandler(update));
adminRouter.patch(
  '/:id/publish',
  validate({ ...idParams, body: Joi.object({ status: Joi.string().valid('draft', 'published', 'archived') }) }),
  asyncHandler(publish),
);
adminRouter.delete('/:id', validate(idParams), asyncHandler(remove));
