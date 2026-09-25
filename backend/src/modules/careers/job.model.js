import mongoose from 'mongoose';
import { seoSchema } from '../shared/schemas.js';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, trim: true, maxlength: 120, index: true },
    location: { type: String, trim: true, maxlength: 200 },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    experience: { type: String, trim: true, maxlength: 100 },
    qualification: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    responsibilities: [{ type: String, trim: true, maxlength: 500 }],
    requirements: [{ type: String, trim: true, maxlength: 500 }],
    status: { type: String, enum: ['draft', 'open', 'closed', 'archived'], default: 'draft', index: true },
    closingDate: { type: Date, default: null },
    seo: seoSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

jobSchema.methods.isAcceptingApplications = function isAcceptingApplications() {
  if (this.status !== 'open') return false;
  if (this.closingDate && this.closingDate < new Date()) return false;
  return true;
};

export const Job = mongoose.model('Job', jobSchema, 'careers');
