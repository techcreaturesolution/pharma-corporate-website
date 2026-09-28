import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi } from '../shared/schemas.js';
import { GalleryItem } from './gallery.model.js';

const base = {
  title: Joi.string().trim().max(200),
  image: imageJoi,
  category: Joi.string().allow('').max(100),
  caption: Joi.string().allow('').max(500),
  sortOrder: Joi.number().integer().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
};

const galleryModule = createCrudModule({
  Model: GalleryItem,
  label: 'Gallery item',
  slugSource: null,
  searchFields: ['title', 'category', 'caption'],
  sortable: ['title', 'sortOrder', 'createdAt'],
  defaultSort: 'sortOrder -createdAt',
  defaultLimit: 24,
  extraFilters: (query, filter) => {
    if (query.category) filter.category = query.category;
  },
  validation: {
    create: Joi.object({
      ...base,
      title: base.title.required(),
      image: imageJoi.keys({ url: Joi.string().uri({ allowRelative: true }).required() }).required(),
    }),
    update: Joi.object(base).min(1),
  },
});

export default galleryModule.router;
