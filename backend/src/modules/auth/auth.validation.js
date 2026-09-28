import Joi from 'joi';

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(10)
      .max(128)
      .pattern(/[A-Z]/, 'uppercase letter')
      .pattern(/[0-9]/, 'number')
      .required(),
  }),
};
