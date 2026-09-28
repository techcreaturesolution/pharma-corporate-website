import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['product', 'general', 'partnership', 'career'], default: 'general', index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, maxlength: 30 },
    country: { type: String, trim: true, maxlength: 100 },
    subject: { type: String, trim: true, maxlength: 200 },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    productName: { type: String, trim: true },
    quantity: { type: String, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'in_progress', 'responded', 'closed', 'spam'], default: 'new', index: true },
    notes: { type: String, trim: true, maxlength: 5000 },
    consent: { type: Boolean, default: false },
    sourcePage: { type: String, trim: true, maxlength: 300 },
    source: { ip: String, userAgent: String },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
