import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate, contentAccess } from '../../middleware/index.js';
import { optionalAuth } from '../shared/optionalAuth.js';
import { idParams, statusBody } from '../shared/schemas.js';
import * as controller from './product.controller.js';
import { createProductSchema, updateProductSchema, productListQuery } from './product.validation.js';

const router = Router();

router.get('/', optionalAuth, validate({ query: productListQuery }), asyncHandler(controller.list));
router.get('/featured', asyncHandler(controller.featured));
router.get('/therapeutic-areas', asyncHandler(controller.therapeuticAreas));
router.get('/related/:id', validate(idParams), asyncHandler(controller.related));
router.get('/:slug', optionalAuth, validate({ params: Joi.object({ slug: Joi.string().max(150) }) }), asyncHandler(controller.detail));

router.post('/', ...contentAccess, validate({ body: createProductSchema }), asyncHandler(controller.create));
router.put('/:id', ...contentAccess, validate({ ...idParams, body: updateProductSchema }), asyncHandler(controller.update));
router.patch('/:id/status', ...contentAccess, validate(statusBody(['draft', 'published', 'archived'])), asyncHandler(controller.setStatus));
router.delete('/:id', ...contentAccess, validate(idParams), asyncHandler(controller.remove));

export default router;
