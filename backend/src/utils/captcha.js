import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

/** Verifies a Google reCAPTCHA / hCaptcha style token when CAPTCHA_SECRET_KEY is configured. */
export const verifyCaptcha = async (token, remoteIp) => {
  if (!env.captchaSecret) return true;
  if (!token) throw ApiError.validation([{ field: 'captchaToken', message: 'CAPTCHA verification is required' }]);
  const params = new URLSearchParams({ secret: env.captchaSecret, response: token });
  if (remoteIp) params.set('remoteip', remoteIp);
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const result = await response.json();
  if (!result.success) throw ApiError.validation([{ field: 'captchaToken', message: 'CAPTCHA verification failed' }]);
  return true;
};
