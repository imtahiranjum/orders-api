import * as Joi from 'joi';

export default Joi.object({
  // ────────────────────────────────────────────────
  // Server
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'stage', 'local')
    .required(),
  PORT: Joi.number().default(8000),
  ALLOWED_ORIGINS: Joi.string().allow(''),

  // ────────────────────────────────────────────────
  // Auth
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRY: Joi.required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRY: Joi.required(),
  RESET_PASSWORD_TOKEN_SECRET: Joi.string().required(),
  RESET_PASSWORD_TOKEN_EXPIRY: Joi.required(),

  // ────────────────────────────────────────────────
  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_SYNC: Joi.boolean().required(),

  // ────────────────────────────────────────────────
  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_USER: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
});
