import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi, documentJoi } from '../shared/schemas.js';
import { Certification } from './certification.model.js';

const base = {
  name: Joi.string().trim().max(200),
  authority: Joi.string().allow('').max(200),
  certificateNumber: Joi.string().allow('').max(100),
  description: Joi.string().allow('').max(2000),
  issuedAt: Joi.date().allow(null, ''),
  expiresAt: Joi.date().allow(null, ''),
  image: imageJoi,
  document: documentJoi,
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
};

const certificationModule = createCrudModule({
  Model: Certification,
  label: 'Certification',
  slugSource: null,
  searchFields: ['name', 'authority', 'certificateNumber'],
  sortable: ['name', 'sortOrder', 'issuedAt', 'createdAt'],
  defaultSort: 'sortOrder',
  defaultLimit: 50,
  validation: {
    create: Joi.object({ ...base, name: base.name.required() }),
    update: Joi.object(base).min(1),
  },
});

export default certificationModule.router;
