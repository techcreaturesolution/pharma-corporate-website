import mongoose from 'mongoose';
import Joi from 'joi';

/* ---------- Mongoose sub-schemas ---------- */

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  },
  { _id: false },
);

export const documentSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 200 },
    url: { type: String, trim: true },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  },
  { _id: false },
);

export const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 70 },
    description: { type: String, trim: true, maxlength: 160 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

/* ---------- Joi validators ---------- */

export const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

export const imageJoi = Joi.object({
  url: Joi.string().uri({ allowRelative: true }).allow('').max(2000),
  alt: Joi.string().allow('').max(200),
  mediaId: objectId.allow(null, ''),
});

export const documentJoi = Joi.object({
  title: Joi.string().allow('').max(200),
  url: Joi.string().uri({ allowRelative: true }).allow('').max(2000),
  mediaId: objectId.allow(null, ''),
});

export const seoJoi = Joi.object({
  title: Joi.string().allow('').max(70),
  description: Joi.string().allow('').max(160),
  keywords: Joi.array().items(Joi.string().max(50)).max(20),
  canonicalUrl: Joi.string().uri().allow(''),
  ogImage: Joi.string().uri({ allowRelative: true }).allow(''),
  noIndex: Joi.boolean(),
});

export const slugJoi = Joi.string()
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug')
  .max(150);

export const idParams = { params: Joi.object({ id: objectId.required() }) };

export const statusBody = (values) => ({
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ status: Joi.string().valid(...values).required() }),
});

export const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('').max(100),
  sort: Joi.string().max(40),
  order: Joi.string().valid('asc', 'desc'),
  status: Joi.string().max(30),
  includeAll: Joi.boolean(),
}).unknown(true);
