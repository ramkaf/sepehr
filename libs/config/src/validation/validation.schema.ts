import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging', 'test')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  // PostgreSQL Configuration
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
  POSTGRES_LOGGING: Joi.string().valid('true', 'false').default('false'),

  // Redis Configuration
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().required(),

  // Elasticsearch Configuration
  ELASTIC_NODE: Joi.string().uri().required(),
  ELASTIC_USERNAME: Joi.string().required(),
  ELASTIC_PASSWORD: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  OTP_EXPIRES_IN: Joi.number().default(120000),

  // External APIs
  WEATHER_API_KEY: Joi.string().required(),
  RECAPTCHA_KEY: Joi.string().required(),

  ARCAPTCHA_SITE_KEY: Joi.string().required(),
  ARCAPTCHA_SECRET_KEY: Joi.string().required(),

  PASSWORD_SALT_ROUNDS: Joi.number().required().default(10),
  PR_EXPIRES_IN: Joi.number().required().default(180000),
});
