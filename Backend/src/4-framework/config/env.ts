import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // node env
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  // database
  DATABASE_URL: Joi.string().required(),
  // Http
  SERVER_PORT: Joi.number().required(),
  SERVER_HTTP_TIMEOUT_MS: Joi.number().required(),
  //JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('5h'),
});
