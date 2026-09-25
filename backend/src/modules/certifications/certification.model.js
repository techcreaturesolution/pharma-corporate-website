import mongoose from 'mongoose';
import { imageSchema, documentSchema } from '../shared/schemas.js';

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    authority: { type: String, trim: true, maxlength: 200 },
    certificateNumber: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
    issuedAt: { type: Date },
    expiresAt: { type: Date },
    image: imageSchema,
    document: documentSchema,
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Certification = mongoose.model('Certification', certificationSchema);
