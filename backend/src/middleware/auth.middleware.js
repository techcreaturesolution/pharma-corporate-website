import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../modules/auth/user.model.js';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[ACCESS_COOKIE] || null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();
    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw ApiError.unauthorized('Session expired or invalid token');
    }
    const user = await User.findById(payload.sub).select('+tokenVersion');
    if (!user || !user.isActive) throw ApiError.unauthorized('Account is inactive');
    if (payload.tv !== user.tokenVersion) throw ApiError.unauthorized('Session has been revoked');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };

export const ROLES = ['superadmin', 'admin', 'editor'];

/** Content management: editors may manage website content and media. */
export const contentAccess = [requireAuth, requireRole('superadmin', 'admin', 'editor')];

/** Sensitive data (enquiries, applications, settings, users): admins only. */
export const adminOnly = [requireAuth, requireRole('superadmin', 'admin')];
