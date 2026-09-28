import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { User } from './user.model.js';

const signAccess = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, tv: user.tokenVersion }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

const signRefresh = (user) =>
  jwt.sign({ sub: user._id.toString(), tv: user.tokenVersion, type: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account is inactive');
  user.lastLoginAt = new Date();
  await user.save();
  return { user, accessToken: signAccess(user), refreshToken: signRefresh(user) };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw ApiError.unauthorized('Refresh token expired or invalid');
  }
  if (payload.type !== 'refresh') throw ApiError.unauthorized();
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
    throw ApiError.unauthorized('Session has been revoked');
  }
  return { user, accessToken: signAccess(user), refreshToken: signRefresh(user) };
};

/** Bumps tokenVersion so every previously-issued token becomes invalid. */
export const revokeAll = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash +tokenVersion');
  if (!user) throw ApiError.notFound('User not found');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.validation([{ field: 'currentPassword', message: 'Current password is incorrect' }]);
  }
  await user.setPassword(newPassword);
  user.tokenVersion += 1;
  await user.save();
  return { user, accessToken: signAccess(user), refreshToken: signRefresh(user) };
};
