import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { validate, adminOnly } from '../../middleware/index.js';
import { imageJoi, seoJoi } from '../shared/schemas.js';
import { Settings } from './settings.model.js';

const str = (max = 300) => Joi.string().allow('').max(max);

const addressJoi = Joi.object({
  label: str(100),
  line1: str(200),
  line2: str(200),
  city: str(100),
  state: str(100),
  postalCode: str(20),
  country: str(100),
  phone: str(30),
  email: Joi.string().email().allow(''),
  mapEmbedUrl: Joi.string().uri().allow(''),
});

const settingsSchema = Joi.object({
  company: Joi.object({
    name: str(150),
    tagline: str(200),
    legalName: str(200),
    foundedYear: Joi.number().integer().min(1800).max(2100).allow(null),
    description: str(2000),
    logo: imageJoi,
    logoDark: imageJoi,
    favicon: imageJoi,
  }),
  contact: Joi.object({
    email: Joi.string().email().allow(''),
    salesEmail: Joi.string().email().allow(''),
    careersEmail: Joi.string().email().allow(''),
    phone: str(30),
    alternatePhone: str(30),
    whatsapp: str(30),
    workingHours: str(200),
    addresses: Joi.array().items(addressJoi).max(10),
  }),
  social: Joi.object({
    linkedin: Joi.string().uri().allow(''),
    twitter: Joi.string().uri().allow(''),
    facebook: Joi.string().uri().allow(''),
    instagram: Joi.string().uri().allow(''),
    youtube: Joi.string().uri().allow(''),
  }),
  seo: seoJoi,
  analytics: Joi.object({
    googleAnalyticsId: str(30),
    googleTagManagerId: str(30),
    googleSiteVerification: str(200),
  }),
  notifications: Joi.object({
    enquiryRecipients: Joi.array().items(Joi.string().email()).max(10),
    careersRecipients: Joi.array().items(Joi.string().email()).max(10),
    sendVisitorConfirmation: Joi.boolean(),
  }),
  footer: Joi.object({ text: str(500), disclaimer: str(2000) }),
  maintenanceMode: Joi.boolean(),
});

/** Strips admin-only fields (notification recipients, internal flags) for the public site. */
const toPublic = (doc) => {
  const { company, contact, social, seo, analytics, footer, maintenanceMode } = doc.toObject();
  return { company, contact, social, seo, analytics, footer, maintenanceMode };
};

export const getPublicSettings = async (req, res) => {
  const doc = await Settings.getSingleton();
  res.set('Cache-Control', 'public, max-age=300');
  return sendSuccess(res, { message: 'Settings retrieved successfully', data: toPublic(doc) });
};

const getAdminSettings = async (req, res) => {
  const doc = await Settings.getSingleton();
  return sendSuccess(res, { message: 'Settings retrieved successfully', data: doc });
};

const updateSettings = async (req, res) => {
  const doc = await Settings.getSingleton();
  doc.set({ ...req.body, updatedBy: req.user._id });
  await doc.save();
  return sendSuccess(res, { message: 'Settings updated successfully', data: doc });
};

export const publicRouter = Router();
publicRouter.get('/public', asyncHandler(getPublicSettings));

export const adminRouter = Router();
adminRouter.use(...adminOnly);
adminRouter.get('/', asyncHandler(getAdminSettings));
adminRouter.put('/', validate({ body: settingsSchema }), asyncHandler(updateSettings));
