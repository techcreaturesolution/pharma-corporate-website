import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse.js';
import { isAdminRequest } from '../shared/optionalAuth.js';
import * as service from './product.service.js';

export const list = async (req, res) => {
  const { items, meta } = await service.listProducts(req.query, isAdminRequest(req));
  return sendSuccess(res, { message: 'Products retrieved successfully', data: items, meta });
};

export const featured = async (req, res) => {
  const items = await service.getFeatured(Number(req.query.limit) || 8);
  return sendSuccess(res, { message: 'Featured products retrieved successfully', data: items });
};

export const related = async (req, res) => {
  const items = await service.getRelated(req.params.id, Number(req.query.limit) || 4);
  return sendSuccess(res, { message: 'Related products retrieved successfully', data: items });
};

export const therapeuticAreas = async (req, res) => {
  const items = await service.listTherapeuticAreas();
  return sendSuccess(res, { message: 'Therapeutic areas retrieved successfully', data: items.sort() });
};

export const detail = async (req, res) => {
  try {
    const product = await service.getProduct(req.params.slug, isAdminRequest(req));
    return sendSuccess(res, { message: 'Product retrieved successfully', data: product });
  } catch (err) {
    if (err.redirectTo) {
      return res.status(301).json({ success: false, message: err.message, redirectTo: err.redirectTo });
    }
    throw err;
  }
};

export const create = async (req, res) => {
  const product = await service.createProduct(req.body, req.user);
  return sendCreated(res, 'Product created successfully', product);
};

export const update = async (req, res) => {
  const product = await service.updateProduct(req.params.id, req.body);
  return sendSuccess(res, { message: 'Product updated successfully', data: product });
};

export const setStatus = async (req, res) => {
  const product = await service.setProductStatus(req.params.id, req.body.status);
  return sendSuccess(res, { message: `Product ${req.body.status === 'published' ? 'published' : 'updated'} successfully`, data: product });
};

export const remove = async (req, res) => {
  await service.deleteProduct(req.params.id);
  return sendNoContent(res);
};
