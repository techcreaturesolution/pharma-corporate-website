import mongoose from 'mongoose';
import { imageSchema } from '../shared/schemas.js';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: imageSchema, required: true },
    category: { type: String, trim: true, maxlength: 100, index: true },
    caption: { type: String, trim: true, maxlength: 500 },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const GalleryItem = mongoose.model('GalleryItem', gallerySchema, 'gallery');
