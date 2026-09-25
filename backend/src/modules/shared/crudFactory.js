import { Router } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendCreated, sendNoContent, buildMeta } from '../../utils/ApiResponse.js';
import { parsePagination, parseSort, escapeRegex } from '../../utils/pagination.js';
import { uniqueSlug } from '../../utils/slug.js';
import { validate, contentAccess } from '../../middleware/index.js';
import { optionalAuth, isAdminRequest } from './optionalAuth.js';
import { idParams, statusBody, listQuery } from './schemas.js';

const isObjectId = (value) => mongoose.isValidObjectId(value) && String(new mongoose.Types.ObjectId(value)) === value;

/**
 * Generic service + router for "content" collections that share the same shape:
 * list (public filtered / admin all), detail by slug or id, create, update, status toggle, delete.
 *
 * @param {object} cfg
 * @param {mongoose.Model} cfg.Model
 * @param {string} cfg.label            Human label used in messages ("Capability")
 * @param {string|null} cfg.slugSource  Field used to auto-generate slug (null = no slug)
 * @param {string} cfg.statusField      e.g. "status"
 * @param {string[]} cfg.statusValues   e.g. ["draft","published"]
 * @param {string[]} cfg.publicStatuses Statuses visible to the public
 * @param {string[]} cfg.searchFields   Regex-searched fields
 * @param {string[]} cfg.sortable       Whitelisted sort fields
 * @param {string} cfg.defaultSort
 * @param {string|object} [cfg.populate]
 * @param {object} cfg.validation       { create: Joi, update: Joi }
 * @param {Function} [cfg.extraFilters] (query, filter, isAdmin) => void  — adds module-specific filters
 * @param {Function} [cfg.beforeDelete] async (doc) => void — throw to block deletion
 * @param {Function} [cfg.beforeSave]   async (payload, existingDoc|null) => payload
 * @param {string} [cfg.listSelect]     Projection for list endpoint
 */
export const createCrudModule = (cfg) => {
  const {
    Model,
    label,
    slugSource = null,
    statusField = 'status',
    statusValues = ['draft', 'published', 'archived'],
    publicStatuses = ['published'],
    searchFields = [],
    sortable = ['createdAt'],
    defaultSort = '-createdAt',
    populate,
    validation,
    extraFilters,
    beforeDelete,
    beforeSave,
    listSelect,
    defaultLimit = 12,
  } = cfg;

  const applyPopulate = (query) => (populate ? query.populate(populate) : query);

  /* ---------------- service ---------------- */

  const service = {
    async list(query, isAdmin) {
      const { page, limit, skip } = parsePagination(query, { defaultLimit });
      const filter = {};
      if (!isAdmin || !query.includeAll) {
        filter[statusField] = { $in: publicStatuses };
      } else if (query.status) {
        filter[statusField] = query.status;
      }
      if (query.search && searchFields.length) {
        const rx = new RegExp(escapeRegex(query.search), 'i');
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      if (extraFilters) extraFilters(query, filter, isAdmin);
      const sort = parseSort(query, sortable, defaultSort);
      const [items, total] = await Promise.all([
        applyPopulate(Model.find(filter).sort(sort).skip(skip).limit(limit).select(listSelect || '')).lean(),
        Model.countDocuments(filter),
      ]);
      return { items, meta: buildMeta({ page, limit, total }) };
    },

    async getByIdentifier(identifier, isAdmin) {
      const filter = isObjectId(identifier) ? { _id: identifier } : { slug: identifier };
      if (!isAdmin) filter[statusField] = { $in: publicStatuses };
      const doc = await applyPopulate(Model.findOne(filter)).lean();
      if (!doc) throw ApiError.notFound(`${label} not found`);
      return doc;
    },

    async create(payload, user) {
      let data = { ...payload };
      if (slugSource) data.slug = await uniqueSlug(Model, data.slug || data[slugSource]);
      if (user) data.createdBy = user._id;
      if (beforeSave) data = await beforeSave(data, null);
      const doc = await Model.create(data);
      return applyPopulate(Model.findById(doc._id)).lean();
    },

    async update(id, payload) {
      const existing = await Model.findById(id);
      if (!existing) throw ApiError.notFound(`${label} not found`);
      let data = { ...payload };
      if (slugSource && (data.slug || data[slugSource]) && data.slug !== existing.slug) {
        data.slug = await uniqueSlug(Model, data.slug || data[slugSource], existing._id);
      }
      if (beforeSave) data = await beforeSave(data, existing);
      existing.set(data);
      await existing.save();
      return applyPopulate(Model.findById(id)).lean();
    },

    async setStatus(id, status) {
      const doc = await Model.findById(id);
      if (!doc) throw ApiError.notFound(`${label} not found`);
      doc[statusField] = status;
      if (statusField === 'status' && status === 'published' && 'publishedAt' in doc.toObject() && !doc.publishedAt) {
        doc.publishedAt = new Date();
      }
      await doc.save();
      return applyPopulate(Model.findById(id)).lean();
    },

    async remove(id) {
      const doc = await Model.findById(id);
      if (!doc) throw ApiError.notFound(`${label} not found`);
      if (beforeDelete) await beforeDelete(doc);
      await doc.deleteOne();
    },
  };

  /* ---------------- controller ---------------- */

  const controller = {
    list: asyncHandler(async (req, res) => {
      const { items, meta } = await service.list(req.query, isAdminRequest(req));
      return sendSuccess(res, { message: `${label} list retrieved successfully`, data: items, meta });
    }),
    detail: asyncHandler(async (req, res) => {
      const doc = await service.getByIdentifier(req.params.identifier, isAdminRequest(req));
      return sendSuccess(res, { message: `${label} retrieved successfully`, data: doc });
    }),
    create: asyncHandler(async (req, res) => {
      const doc = await service.create(req.body, req.user);
      return sendCreated(res, `${label} created successfully`, doc);
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await service.update(req.params.id, req.body);
      return sendSuccess(res, { message: `${label} updated successfully`, data: doc });
    }),
    setStatus: asyncHandler(async (req, res) => {
      const doc = await service.setStatus(req.params.id, req.body.status);
      return sendSuccess(res, { message: `${label} status updated successfully`, data: doc });
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      return sendNoContent(res);
    }),
  };

  /* ---------------- router ---------------- */

  const router = Router();
  router.get('/', optionalAuth, validate({ query: listQuery }), controller.list);
  router.post('/', ...contentAccess, validate({ body: validation.create }), controller.create);
  router.get('/:identifier', optionalAuth, validate({ params: Joi.object({ identifier: Joi.string().max(150) }) }), controller.detail);
  router.put('/:id', ...contentAccess, validate({ ...idParams, body: validation.update }), controller.update);
  router.patch('/:id/status', ...contentAccess, validate(statusBody(statusValues)), controller.setStatus);
  router.delete('/:id', ...contentAccess, validate(idParams), controller.remove);

  return { router, service, controller };
};
