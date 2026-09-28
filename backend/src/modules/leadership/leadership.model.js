import mongoose from 'mongoose';
import { imageSchema } from '../shared/schemas.js';

const leaderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    designation: { type: String, required: true, trim: true, maxlength: 150 },
    biography: { type: String, trim: true },
    photo: imageSchema,
    linkedinUrl: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Leader = mongoose.model('Leader', leaderSchema, 'leadership');
