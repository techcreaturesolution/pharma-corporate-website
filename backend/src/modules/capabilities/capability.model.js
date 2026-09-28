import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

const capabilitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true },
    icon: { type: String, trim: true, maxlength: 60 },
    highlights: [{ type: String, trim: true, maxlength: 300 }],
    images: [imageSchema],
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    seo: seoSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Capability = mongoose.model('Capability', capabilitySchema);
