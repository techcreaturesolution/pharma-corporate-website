import Joi from 'joi';
import { imageJoi, seoJoi, slugJoi } from '../shared/schemas.js';

const base = {
  name: Joi.string().trim().max(120),
  slug: slugJoi,
  description: Joi.string().allow('').max(2000),
  image: imageJoi,
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('active', 'inactive'),
  seo: seoJoi,
};

export const createCategorySchema = Joi.object({ ...base, name: base.name.required() });
export const updateCategorySchema = Joi.object(base).min(1);
