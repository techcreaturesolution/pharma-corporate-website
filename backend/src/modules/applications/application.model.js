import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, maxlength: 30 },
    qualification: { type: String, trim: true, maxlength: 300 },
    experience: { type: String, trim: true, maxlength: 100 },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    /** Private file: `key` is resolved through the storage provider, never exposed as a public URL. */
    resume: {
      key: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String },
      size: { type: Number },
    },
    status: {
      type: String,
      enum: ['received', 'in_review', 'shortlisted', 'interview', 'rejected', 'hired', 'archived'],
      default: 'received',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 5000 },
    consent: { type: Boolean, required: true },
    source: {
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);
