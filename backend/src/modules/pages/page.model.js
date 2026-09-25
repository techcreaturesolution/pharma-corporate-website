import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

/**
 * A flexible content block. `type` drives rendering on the frontend:
 * hero | richText | stats | features | cta | timeline | imageText | faq | values
 */
const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, maxlength: 60 },
    type: { type: String, required: true, trim: true, maxlength: 40 },
    title: { type: String, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 300 },
    content: { type: String, trim: true },
    image: imageSchema,
    items: [
      {
        _id: false,
        title: { type: String, trim: true, maxlength: 200 },
        value: { type: String, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 2000 },
        icon: { type: String, trim: true, maxlength: 60 },
        image: imageSchema,
        link: { type: String, trim: true, maxlength: 500 },
      },
    ],
    cta: { _id: false, label: { type: String, trim: true }, url: { type: String, trim: true } },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    pageType: { type: String, enum: ['system', 'custom'], default: 'custom' },
    featuredImage: imageSchema,
    sections: [sectionSchema],
    seo: seoSchema,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    publishedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Page = mongoose.model('Page', pageSchema);
