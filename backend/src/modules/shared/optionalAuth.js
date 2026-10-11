import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../auth/user.model.js';
import { ROLES, extractToken } from '../../middleware/auth.middleware.js';

/**
 * Attaches req.user when a valid admin token is present, but never rejects the request.
 * Used on public endpoints so the admin panel can preview drafts via `includeAll=true`.
 * If token is missing, expired, revoked, or invalid, it gracefully continues without setting req.user.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      // Expired, invalid or malformed token: ignore silently for public visitors
      return next();
    }

    if (payload?.sub) {
      const user = await User.findById(payload.sub).select('+tokenVersion');
      if (user && user.isActive && payload.tv === user.tokenVersion) {
        req.user = user;
      }
    }
  } catch {
    // Failsafe: never block public requests due to optional authentication errors
  }
  return next();
};

export const isAdminRequest = (req) => Boolean(req.user && ROLES.includes(req.user.role));

