import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'ValidationError' && err.errors) {
    error = ApiError.validation(
      Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    );
  } else if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid value for ${err.path}`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`A record with this ${field} already exists`);
  } else if (err.name === 'MulterError') {
    error = ApiError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? `File exceeds ${env.maxUploadMb}MB limit` : err.message);
  } else if (err.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Malformed JSON body');
  } else if (!err.isOperational) {
    console.error(err);
    error = new ApiError(500, env.isProd ? 'Internal server error' : err.message);
  }

  const body = { success: false, message: error.message };
  if (error.errors?.length) body.errors = error.errors;
  res.status(error.statusCode || 500).json(body);
};
