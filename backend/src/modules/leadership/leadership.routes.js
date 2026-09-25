import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi } from '../shared/schemas.js';
import { Leader } from './leadership.model.js';

const base = {
  name: Joi.string().trim().max(150),
  designation: Joi.string().trim().max(150),
  biography: Joi.string().allow('').max(20000),
  photo: imageJoi,
  linkedinUrl: Joi.string().uri().allow(''),
  email: Joi.string().email().allow(''),
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
};

const leadershipModule = createCrudModule({
  Model: Leader,
  label: 'Leadership profile',
  slugSource: null,
  searchFields: ['name', 'designation'],
  sortable: ['name', 'sortOrder', 'createdAt'],
  defaultSort: 'sortOrder',
  defaultLimit: 50,
  validation: {
    create: Joi.object({ ...base, name: base.name.required(), designation: base.designation.required() }),
    update: Joi.object(base).min(1),
  },
});

export default leadershipModule.router;
