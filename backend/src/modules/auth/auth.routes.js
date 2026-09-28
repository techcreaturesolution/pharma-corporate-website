import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate, requireAuth, loginLimiter } from '../../middleware/index.js';
import * as controller from './auth.controller.js';
import { loginSchema, changePasswordSchema } from './auth.validation.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));
router.patch('/change-password', requireAuth, validate(changePasswordSchema), asyncHandler(controller.changePassword));

export default router;
