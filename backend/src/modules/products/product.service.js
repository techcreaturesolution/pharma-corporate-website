import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/ApiResponse.js';
import { parsePagination, parseSort, escapeRegex } from '../../utils/pagination.js';
import { uniqueSlug } from '../../utils/slug.js';
import { Product } from './product.model.js';
import { Category } from '../categories/category.model.js';

const CATEGORY_POPULATE = { path: 'categoryId', select: 'name slug' };
const LIST_SELECT = 'name slug productCode casNumber categoryId therapeuticArea shortDescription image featured status sortOrder createdAt updatedAt';

/** Exposes the populated category as `category` to match the API contract. */
const shape = (doc) => {
  if (!doc) return doc;
  const { categoryId, ...rest } = doc;
  return { ...rest, category: categoryId && typeof categoryId === 'object' ? categoryId : null, categoryId: categoryId?._id ?? categoryId };
};

const publicFilter = { status: 'published' };

const resolveCategoryFilter = async (category) => {
  if (!category) return null;
  if (mongoose.isValidObjectId(category)) return category;
  const cat = await Category.findOne({ slug: category }).select('_id').lean();
  return cat ? cat._id : new mongoose.Types.ObjectId();
};

export const listProducts = async (query, isAdmin) => {
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 12 });
  const filter = {};
  if (!isAdmin || !query.includeAll) Object.assign(filter, publicFilter);
  else if (query.status) filter.status = query.status;

  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { productCode: rx }, { casNumber: rx }, { therapeuticArea: rx }];
  }
  const categoryId = await resolveCategoryFilter(query.category);
  if (categoryId) filter.categoryId = categoryId;
  if (query.therapeuticArea) filter.therapeuticArea = new RegExp(`^${escapeRegex(query.therapeuticArea)}$`, 'i');
  if (query.featured !== undefined) filter.featured = query.featured;

  const sort = parseSort(query, ['name', 'createdAt', 'sortOrder', 'productCode'], 'sortOrder name');
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).select(LIST_SELECT).populate(CATEGORY_POPULATE).lean(),
    Product.countDocuments(filter),
  ]);
  return { items: items.map(shape), meta: buildMeta({ page, limit, total }) };
};

export const getFeatured = async (limit = 8) => {
  const items = await Product.find({ ...publicFilter, featured: true })
    .sort('sortOrder name')
    .limit(limit)
    .select(LIST_SELECT)
    .populate(CATEGORY_POPULATE)
    .lean();
  return items.map(shape);
};

export const getProduct = async (identifier, isAdmin) => {
  const byId = mongoose.isValidObjectId(identifier);
  const filter = byId ? { _id: identifier } : { slug: identifier };
  if (!isAdmin) Object.assign(filter, publicFilter);
  let doc = await Product.findOne(filter).populate(CATEGORY_POPULATE).lean();
  if (!doc && !byId) {
    // Slug changed after publication: tell the client where it moved.
    const moved = await Product.findOne({ previousSlugs: identifier, ...publicFilter }).select('slug').lean();
    if (moved) {
      const err = new ApiError(301, 'Product has moved');
      err.redirectTo = `/products/${moved.slug}`;
      throw err;
    }
  }
  if (!doc) throw ApiError.notFound('Product not found');
  return shape(doc);
};

export const getRelated = async (id, limit = 4) => {
  const product = await Product.findById(id).select('categoryId').lean();
  if (!product) throw ApiError.notFound('Product not found');
  const items = await Product.find({ ...publicFilter, categoryId: product.categoryId, _id: { $ne: id } })
    .sort('sortOrder name')
    .limit(limit)
    .select(LIST_SELECT)
    .populate(CATEGORY_POPULATE)
    .lean();
  return items.map(shape);
};

const assertCategory = async (categoryId) => {
  if (!categoryId) return;
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) throw ApiError.validation([{ field: 'categoryId', message: 'Category does not exist' }]);
};

const assertPublishable = (doc) => {
  if (doc.status === 'published' && !doc.description) {
    throw ApiError.validation([{ field: 'description', message: 'Description is required before publishing' }]);
  }
};

const normalize = (payload) => {
  const data = { ...payload };
  if (data.productCode === '') data.productCode = undefined;
  if (data.casNumber === '') data.casNumber = undefined;
  return data;
};

export const createProduct = async (payload, user) => {
  const data = normalize(payload);
  await assertCategory(data.categoryId);
  data.slug = await uniqueSlug(Product, data.slug || data.name);
  data.createdBy = user?._id;
  assertPublishable(data);
  const doc = await Product.create(data);
  return getProduct(doc._id, true);
};

export const updateProduct = async (id, payload) => {
  const existing = await Product.findById(id);
  if (!existing) throw ApiError.notFound('Product not found');
  const data = normalize(payload);
  await assertCategory(data.categoryId);
  const requestedSlug = data.slug || (data.name && !existing.slug ? data.name : null);
  if (requestedSlug && requestedSlug !== existing.slug) {
    data.slug = await uniqueSlug(Product, requestedSlug, existing._id);
    if (existing.status === 'published' && data.slug !== existing.slug) {
      existing.previousSlugs = [...new Set([...(existing.previousSlugs || []), existing.slug])];
    }
  }
  existing.set(data);
  if (data.productCode === undefined && 'productCode' in payload) existing.productCode = undefined;
  if (data.casNumber === undefined && 'casNumber' in payload) existing.casNumber = undefined;
  assertPublishable(existing);
  await existing.save();
  return getProduct(id, true);
};

export const setProductStatus = async (id, status) => {
  const doc = await Product.findById(id);
  if (!doc) throw ApiError.notFound('Product not found');
  doc.status = status;
  assertPublishable(doc);
  await doc.save();
  return getProduct(id, true);
};

export const deleteProduct = async (id) => {
  const doc = await Product.findByIdAndDelete(id);
  if (!doc) throw ApiError.notFound('Product not found');
};

export const listTherapeuticAreas = () =>
  Product.distinct('therapeuticArea', { ...publicFilter, therapeuticArea: { $nin: [null, ''] } });
