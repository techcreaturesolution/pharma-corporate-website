import mongoose from 'mongoose';
import { imageSchema, seoSchema } from '../shared/schemas.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    image: imageSchema,
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    seo: seoSchema,
  },
  { timestamps: true },
);

categorySchema.index({ sortOrder: 1, name: 1 });

export const Category = mongoose.model('Category', categorySchema);
