import Joi from 'joi';
import { imageJoi, documentJoi, seoJoi, slugJoi, objectId } from '../shared/schemas.js';

const technicalInformationJoi = Joi.object({
  molecularFormula: Joi.string().allow('').max(120),
  molecularWeight: Joi.string().allow('').max(60),
  grade: Joi.string().allow('').max(120),
  storageConditions: Joi.string().allow('').max(300),
  packaging: Joi.string().allow('').max(300),
  shelfLife: Joi.string().allow('').max(120),
  purity: Joi.string().allow('').max(120),
  appearance: Joi.string().allow('').max(300),
});

const base = {
  name: Joi.string().trim().max(200),
  slug: slugJoi,
  productCode: Joi.string().trim().allow('', null).max(60),
  casNumber: Joi.string()
    .trim()
    .allow('', null)
    .pattern(/^\d{2,7}-\d{2}-\d$/, 'CAS number (e.g. 50-78-2)'),
  categoryId: objectId,
  therapeuticArea: Joi.string().allow('').max(120),
  shortDescription: Joi.string().allow('').max(500),
  description: Joi.string().allow('').max(50000),
  applications: Joi.array().items(Joi.string().max(300)).max(50),
  technicalInformation: technicalInformationJoi,
  image: imageJoi,
  gallery: Joi.array().items(imageJoi).max(20),
  documents: Joi.array().items(documentJoi).max(20),
  seo: seoJoi,
  featured: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
};

export const createProductSchema = Joi.object({
  ...base,
  name: base.name.required(),
  categoryId: base.categoryId.required(),
});

export const updateProductSchema = Joi.object(base).min(1);

export const productListQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('').max(100),
  category: Joi.string().max(150),
  therapeuticArea: Joi.string().max(120),
  featured: Joi.boolean(),
  sort: Joi.string().valid('name', 'createdAt', 'sortOrder', 'productCode'),
  order: Joi.string().valid('asc', 'desc'),
  status: Joi.string().valid('draft', 'published', 'archived'),
  includeAll: Joi.boolean(),
});
