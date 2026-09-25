import { ApiError } from '../utils/ApiError.js';

const options = { abortEarly: false, stripUnknown: true, convert: true };

/**
 * validate({ body: schema, query: schema, params: schema })
 * Replaces req[part] with the sanitized value.
 */
export const validate = (schemas) => (req, res, next) => {
  const errors = [];
  for (const [part, schema] of Object.entries(schemas)) {
    if (!schema) continue;
    const { error, value } = schema.validate(req[part], options);
    if (error) {
      errors.push(
        ...error.details.map((d) => ({ field: d.path.join('.') || part, message: d.message.replace(/"/g, '') })),
      );
    } else {
      req[part] = value;
    }
  }
  if (errors.length) return next(ApiError.validation(errors));
  return next();
};
