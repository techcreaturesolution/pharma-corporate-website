import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi, seoJoi, slugJoi } from '../shared/schemas.js';
import { Facility } from './facility.model.js';

const base = {
  name: Joi.string().trim().max(200),
  slug: slugJoi,
  location: Joi.string().allow('').max(200),
  type: Joi.string().allow('').max(100),
  summary: Joi.string().allow('').max(500),
  description: Joi.string().allow('').max(50000),
  highlights: Joi.array().items(Joi.string().max(300)).max(30),
  images: Joi.array().items(imageJoi).max(20),
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
  seo: seoJoi,
};

const facilityModule = createCrudModule({
  Model: Facility,
  label: 'Facility',
  slugSource: 'name',
  searchFields: ['name', 'location', 'type'],
  sortable: ['name', 'sortOrder', 'createdAt'],
  defaultSort: 'sortOrder',
  defaultLimit: 50,
  validation: {
    create: Joi.object({ ...base, name: base.name.required() }),
    update: Joi.object(base).min(1),
  },
});

export default facilityModule.router;
