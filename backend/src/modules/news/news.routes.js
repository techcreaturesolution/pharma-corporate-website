import Joi from 'joi';
import { createCrudModule } from '../shared/crudFactory.js';
import { imageJoi, seoJoi, slugJoi } from '../shared/schemas.js';
import { News } from './news.model.js';

const base = {
  title: Joi.string().trim().max(200),
  slug: slugJoi,
  type: Joi.string().valid('news', 'event', 'press-release'),
  summary: Joi.string().allow('').max(500),
  content: Joi.string().allow('').max(100000),
  featuredImage: imageJoi,
  eventDate: Joi.date().allow(null, ''),
  eventLocation: Joi.string().allow('').max(200),
  publishedAt: Joi.date().allow(null, ''),
  status: Joi.string().valid('draft', 'published', 'archived'),
  seo: seoJoi,
};

const newsModule = createCrudModule({
  Model: News,
  label: 'Article',
  slugSource: 'title',
  searchFields: ['title', 'summary'],
  sortable: ['title', 'publishedAt', 'createdAt', 'eventDate'],
  defaultSort: '-publishedAt',
  defaultLimit: 9,
  extraFilters: (query, filter) => {
    if (query.type) filter.type = query.type;
  },
  beforeSave: (data, existing) => {
    const publishing = data.status === 'published' && (!existing || existing.status !== 'published');
    if (publishing && !data.publishedAt && !existing?.publishedAt) data.publishedAt = new Date();
    return data;
  },
  validation: {
    create: Joi.object({ ...base, title: base.title.required() }),
    update: Joi.object(base).min(1),
  },
});

export default newsModule.router;
