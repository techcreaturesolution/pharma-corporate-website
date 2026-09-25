import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse.js';
import { validate, requireAuth, requireRole } from '../../middleware/index.js';
import { idParams } from '../shared/schemas.js';
import { User } from '../auth/user.model.js';

/**
 * Admin account management. There is deliberately no public registration:
 * only a superadmin can create additional admin/editor accounts.
 */
const passwordJoi = Joi.string().min(10).max(128).pattern(/[A-Z]/, 'uppercase letter').pattern(/[0-9]/, 'number');

const list = async (req, res) => {
  const users = await User.find().sort('name').lean();
  return sendSuccess(res, { message: 'Users retrieved successfully', data: users });
};

const create = async (req, res) => {
  if (await User.exists({ email: req.body.email })) throw ApiError.conflict('A user with this email already exists');
  const user = new User({ name: req.body.name, email: req.body.email, role: req.body.role });
  await user.setPassword(req.body.password);
  await user.save();
  return sendCreated(res, 'User created successfully', user.toSafeJSON());
};

const update = async (req, res) => {
  const user = await User.findById(req.params.id).select('+tokenVersion');
  if (!user) throw ApiError.notFound('User not found');
  if (String(user._id) === String(req.user._id) && req.body.isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }
  const { password, ...rest } = req.body;
  user.set(rest);
  if (password) {
    await user.setPassword(password);
    user.tokenVersion += 1;
  }
  if (rest.isActive === false) user.tokenVersion += 1;
  await user.save();
  return sendSuccess(res, { message: 'User updated successfully', data: user.toSafeJSON() });
};

const remove = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  return sendNoContent(res);
};

const router = Router();
router.use(requireAuth, requireRole('superadmin'));
router.get('/', asyncHandler(list));
router.post(
  '/',
  validate({
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120).required(),
      email: Joi.string().email().required(),
      password: passwordJoi.required(),
      role: Joi.string().valid('superadmin', 'admin', 'editor').required(),
    }),
  }),
  asyncHandler(create),
);
router.put(
  '/:id',
  validate({
    ...idParams,
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120),
      role: Joi.string().valid('superadmin', 'admin', 'editor'),
      isActive: Joi.boolean(),
      password: passwordJoi,
    }).min(1),
  }),
  asyncHandler(update),
);
router.delete('/:id', validate(idParams), asyncHandler(remove));

export default router;
