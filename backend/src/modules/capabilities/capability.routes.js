import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi, seoJoi, slugJoi } from '../shared/schemas.js';
import { Capability } from './capability.model.js';

const base = {
  title: Joi.string().trim().max(200),
  slug: slugJoi,
  summary: Joi.string().allow('').max(500),
  description: Joi.string().allow('').max(50000),
  icon: Joi.string().allow('').max(60),
  highlights: Joi.array().items(Joi.string().max(300)).max(30),
  images: Joi.array().items(imageJoi).max(20),
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
  seo: seoJoi,
};

const capabilityModule = createCrudModule({
  Model: Capability,
  label: 'Capability',
  slugSource: 'title',
  searchFields: ['title', 'summary'],
  sortable: ['title', 'sortOrder', 'createdAt'],
  defaultSort: 'sortOrder',
  defaultLimit: 50,
  validation: {
    create: Joi.object({ ...base, title: base.title.required() }),
    update: Joi.object(base).min(1),
  },
});

export default capabilityModule.router;
