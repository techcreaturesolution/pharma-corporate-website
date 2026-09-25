import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['news', 'event', 'press-release'], default: 'news', index: true },
    summary: { type: String, trim: true, maxlength: 500 },
    content: { type: String, trim: true },
    featuredImage: imageSchema,
    eventDate: { type: Date },
    eventLocation: { type: String, trim: true, maxlength: 200 },
    publishedAt: { type: Date, index: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    seo: seoSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const News = mongoose.model('News', newsSchema);
