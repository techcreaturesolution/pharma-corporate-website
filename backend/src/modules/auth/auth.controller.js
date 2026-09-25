import { env } from '../../config/env.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../middleware/auth.middleware.js';
import * as authService from './auth.service.js';

const cookieBase = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
  path: '/',
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieBase,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, cookieBase);
  res.clearCookie(REFRESH_COOKIE, { ...cookieBase, path: '/api/v1/auth' });
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result);
  return sendSuccess(res, {
    message: 'Login successful',
    data: { user: result.user.toSafeJSON(), accessToken: result.accessToken },
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  const result = await authService.refresh(token);
  setAuthCookies(res, result);
  return sendSuccess(res, {
    message: 'Token refreshed',
    data: { user: result.user.toSafeJSON(), accessToken: result.accessToken },
  });
};

export const logout = async (req, res) => {
  await authService.revokeAll(req.user._id);
  clearAuthCookies(res);
  return sendSuccess(res, { message: 'Logged out successfully' });
};

export const me = async (req, res) => sendSuccess(res, { message: 'Profile retrieved', data: req.user.toSafeJSON() });

export const changePassword = async (req, res) => {
  const result = await authService.changePassword(req.user._id, req.body);
  setAuthCookies(res, result);
  return sendSuccess(res, { message: 'Password changed successfully', data: { accessToken: result.accessToken } });
};
