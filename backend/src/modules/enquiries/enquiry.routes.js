import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendCreated, sendNoContent, buildMeta } from '../../utils/ApiResponse.js';
import { parsePagination, parseSort, escapeRegex } from '../../utils/pagination.js';
import { env } from '../../config/env.js';
import { sendEmail, renderTable } from '../../utils/email.js';
import { verifyCaptcha } from '../../utils/captcha.js';
import { validate, adminOnly, formLimiter } from '../../middleware/index.js';
import { idParams, objectId } from '../shared/schemas.js';
import { Enquiry } from './enquiry.model.js';
import { Product } from '../products/product.model.js';

const STATUSES = ['new', 'in_progress', 'responded', 'closed', 'spam'];
const TYPES = ['product', 'general', 'partnership', 'career'];

const phone = Joi.string().trim().allow('').pattern(/^\+?[0-9\s\-()]{7,20}$/, 'phone number');

export const enquiryBodySchema = Joi.object({
  type: Joi.string().valid(...TYPES).default('general'),
  name: Joi.string().trim().min(2).max(150).required(),
  company: Joi.string()
    .trim()
    .allow('')
    .max(200)
    .when('type', { is: 'product', then: Joi.string().trim().min(1).required().messages({ 'string.empty': 'Company is required for product enquiries' }) }),
  email: Joi.string().email().required(),
  phone,
  country: Joi.string().allow('').max(100),
  subject: Joi.string().allow('').max(200),
  productId: objectId.when('type', { is: 'product', then: Joi.required() }),
  quantity: Joi.string().allow('').max(100),
  message: Joi.string().trim().min(5).max(5000).required(),
  consent: Joi.boolean().valid(true).required().messages({ 'any.only': 'Consent is required' }),
  sourcePage: Joi.string().allow('').max(300),
  captchaToken: Joi.string().allow(''),
  /** Honeypot: bots fill it, humans never see it. */
  website: Joi.string().allow('').max(200),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('').max(100),
  status: Joi.string().valid(...STATUSES),
  type: Joi.string().valid(...TYPES),
  sort: Joi.string().valid('createdAt', 'name', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

export const submitEnquiry = async (req, res) => {
  const { captchaToken, website, ...data } = req.body;
  if (website) {
    // Honeypot tripped: pretend success without storing or notifying.
    return sendCreated(res, 'Your enquiry has been submitted successfully', { enquiryId: null, status: 'new' });
  }
  await verifyCaptcha(captchaToken, req.ip);

  if (data.productId) {
    const product = await Product.findOne({ _id: data.productId, status: 'published' }).select('name').lean();
    if (!product) throw ApiError.validation([{ field: 'productId', message: 'Product does not exist' }]);
    data.productName = product.name;
  }

  const enquiry = await Enquiry.create({ ...data, source: { ip: req.ip, userAgent: req.headers['user-agent'] } });

  const sent = await sendEmail({
    to: env.enquiryEmail,
    subject: `New ${enquiry.type} enquiry from ${enquiry.name}${enquiry.productName ? ` — ${enquiry.productName}` : ''}`,
    html: `<h2>New website enquiry</h2>${renderTable([
      ['Type', enquiry.type],
      ['Name', enquiry.name],
      ['Company', enquiry.company],
      ['Email', enquiry.email],
      ['Phone', enquiry.phone],
      ['Country', enquiry.country],
      ['Product', enquiry.productName],
      ['Quantity', enquiry.quantity],
      ['Subject', enquiry.subject],
      ['Message', enquiry.message],
      ['Source page', enquiry.sourcePage],
    ])}`,
  });
  if (sent) await Enquiry.updateOne({ _id: enquiry._id }, { emailSent: true });

  sendEmail({
    to: enquiry.email,
    subject: 'We have received your enquiry',
    html: `<p>Dear ${enquiry.name},</p><p>Thank you for contacting us. Our team has received your enquiry and will respond shortly.</p>`,
  });

  return sendCreated(res, 'Your enquiry has been submitted successfully', { enquiryId: enquiry._id, status: enquiry.status });
};

const list = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { productName: rx }, { subject: rx }];
  }
  const sort = parseSort(req.query, ['createdAt', 'name', 'status'], '-createdAt');
  const [items, total] = await Promise.all([
    Enquiry.find(filter).sort(sort).skip(skip).limit(limit).select('-source').populate('productId', 'name slug').lean(),
    Enquiry.countDocuments(filter),
  ]);
  return sendSuccess(res, { message: 'Enquiries retrieved successfully', data: items, meta: buildMeta({ page, limit, total }) });
};

const detail = async (req, res) => {
  const doc = await Enquiry.findById(req.params.id).populate('productId', 'name slug').lean();
  if (!doc) throw ApiError.notFound('Enquiry not found');
  return sendSuccess(res, { message: 'Enquiry retrieved successfully', data: doc });
};

const setStatus = async (req, res) => {
  const doc = await Enquiry.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Enquiry not found');
  doc.status = req.body.status;
  if (req.body.notes !== undefined) doc.notes = req.body.notes;
  await doc.save();
  return sendSuccess(res, { message: 'Enquiry status updated', data: { _id: doc._id, status: doc.status, notes: doc.notes } });
};

const remove = async (req, res) => {
  const doc = await Enquiry.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound('Enquiry not found');
  return sendNoContent(res);
};

/* Public: POST /enquiries */
export const publicRouter = Router();
publicRouter.post('/', formLimiter, validate({ body: enquiryBodySchema }), asyncHandler(submitEnquiry));

/* Admin: /admin/enquiries */
export const adminRouter = Router();
adminRouter.use(...adminOnly);
adminRouter.get('/', validate({ query: listQuery }), asyncHandler(list));
adminRouter.get('/:id', validate(idParams), asyncHandler(detail));
adminRouter.patch(
  '/:id/status',
  validate({
    ...idParams,
    body: Joi.object({ status: Joi.string().valid(...STATUSES).required(), notes: Joi.string().allow('').max(5000) }),
  }),
  asyncHandler(setStatus),
);
adminRouter.delete('/:id', validate(idParams), asyncHandler(remove));

/* Public: POST /contact — general contact form (stored as a `general` enquiry) */
export const contactRouter = Router();
contactRouter.post(
  '/',
  formLimiter,
  (req, res, next) => {
    req.body = { ...req.body, type: 'general' };
    next();
  },
  validate({ body: enquiryBodySchema }),
  asyncHandler(submitEnquiry),
);
