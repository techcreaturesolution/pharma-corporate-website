import { requireAuth, ROLES } from '../../middleware/auth.middleware.js';

/**
 * Attaches req.user when a valid admin token is present, but never rejects the request.
 * Used on public list endpoints so the admin panel can request drafts via `includeAll=true`.
 */
export const optionalAuth = (req, res, next) => {
  const hasToken = req.headers.authorization || req.cookies?.access_token;
  if (!hasToken) return next();
  return requireAuth(req, res, () => next());
};

export const isAdminRequest = (req) => Boolean(req.user && ROLES.includes(req.user.role));
