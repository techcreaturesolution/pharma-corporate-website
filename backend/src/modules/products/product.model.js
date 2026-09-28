import mongoose from 'mongoose';
import { imageSchema, documentSchema, seoSchema } from '../shared/schemas.js';

const technicalInformationSchema = new mongoose.Schema(
  {
    molecularFormula: { type: String, trim: true },
    molecularWeight: { type: String, trim: true },
    grade: { type: String, trim: true },
    storageConditions: { type: String, trim: true },
    packaging: { type: String, trim: true },
    shelfLife: { type: String, trim: true },
    purity: { type: String, trim: true },
    appearance: { type: String, trim: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    productCode: { type: String, trim: true, maxlength: 60 },
    casNumber: { type: String, trim: true, maxlength: 20 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    therapeuticArea: { type: String, trim: true, maxlength: 120 },
    shortDescription: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true },
    applications: [{ type: String, trim: true, maxlength: 300 }],
    technicalInformation: { type: technicalInformationSchema, default: () => ({}) },
    image: imageSchema,
    gallery: [imageSchema],
    documents: [documentSchema],
    seo: seoSchema,
    featured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    previousSlugs: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

productSchema.index({ productCode: 1 }, { unique: true, partialFilterExpression: { productCode: { $type: 'string' } } });
productSchema.index({ name: 'text', productCode: 'text', casNumber: 'text', therapeuticArea: 'text' });
productSchema.index({ status: 1, featured: 1, sortOrder: 1 });
productSchema.index({ previousSlugs: 1 });

export const Product = mongoose.model('Product', productSchema);
