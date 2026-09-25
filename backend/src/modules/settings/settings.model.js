import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 100 },
    line1: { type: String, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, maxlength: 150 },
    mapEmbedUrl: { type: String, trim: true },
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    company: {
      name: { type: String, trim: true, default: 'Pharma Company' },
      tagline: { type: String, trim: true },
      legalName: { type: String, trim: true },
      foundedYear: { type: Number },
      description: { type: String, trim: true },
      logo: imageSchema,
      logoDark: imageSchema,
      favicon: imageSchema,
    },
    contact: {
      email: { type: String, trim: true },
      salesEmail: { type: String, trim: true },
      careersEmail: { type: String, trim: true },
      phone: { type: String, trim: true },
      alternatePhone: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      workingHours: { type: String, trim: true },
      addresses: [addressSchema],
    },
    social: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
      youtube: String,
    },
    seo: seoSchema,
    analytics: {
      googleAnalyticsId: { type: String, trim: true },
      googleTagManagerId: { type: String, trim: true },
      googleSiteVerification: { type: String, trim: true },
    },
    notifications: {
      enquiryRecipients: [{ type: String, trim: true }],
      careersRecipients: [{ type: String, trim: true }],
      sendVisitorConfirmation: { type: Boolean, default: true },
    },
    footer: {
      text: { type: String, trim: true },
      disclaimer: { type: String, trim: true },
    },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) doc = await this.create({ key: 'site' });
  return doc;
};

export const Settings = mongoose.model('Settings', settingsSchema);
