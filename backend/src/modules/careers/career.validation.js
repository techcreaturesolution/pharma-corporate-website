import Joi from 'joi';
import { seoJoi, slugJoi } from '../shared/schemas.js';

const base = {
  title: Joi.string().trim().max(200),
  slug: slugJoi,
  department: Joi.string().allow('').max(120),
  location: Joi.string().allow('').max(200),
  employmentType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Internship'),
  experience: Joi.string().allow('').max(100),
  qualification: Joi.string().allow('').max(300),
  description: Joi.string().allow('').max(50000),
  responsibilities: Joi.array().items(Joi.string().max(500)).max(50),
  requirements: Joi.array().items(Joi.string().max(500)).max(50),
  status: Joi.string().valid('draft', 'open', 'closed', 'archived'),
  closingDate: Joi.date().allow(null, ''),
  seo: seoJoi,
};

export const createJobSchema = Joi.object({ ...base, title: base.title.required() });
export const updateJobSchema = Joi.object(base).min(1);

export const applicationBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .trim()
    .allow('')
    .pattern(/^\+?[0-9\s\-()]{7,20}$/, 'phone number'),
  qualification: Joi.string().allow('').max(300),
  experience: Joi.string().allow('').max(100),
  coverLetter: Joi.string().allow('').max(5000),
  consent: Joi.boolean().truthy('true', '1', 'on').valid(true).required().messages({
    'any.only': 'Consent to the privacy notice is required',
  }),
  captchaToken: Joi.string().allow(''),
  jobId: Joi.any().strip(),
});
