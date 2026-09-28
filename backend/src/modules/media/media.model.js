import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true, index: true },
    size: { type: Number, required: true },
    kind: { type: String, enum: ['image', 'document'], required: true, index: true },
    folder: { type: String, default: 'misc', index: true },
    alt: { type: String, trim: true, maxlength: 200 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);
