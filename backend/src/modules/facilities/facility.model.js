import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    location: { type: String, trim: true, maxlength: 200 },
    type: { type: String, trim: true, maxlength: 100 },
    summary: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true, maxlength: 300 }],
    images: [imageSchema],
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    seo: seoSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Facility = mongoose.model('Facility', facilitySchema);
