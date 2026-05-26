import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { HelmetOptions } from 'helmet';

const DEV_CORS_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function resolveCorsOrigins(): string[] {
  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (isProduction()) {
    throw new Error('CORS_ORIGINS é obrigatório em produção.');
  }

  return DEV_CORS_ORIGINS;
}

export function createCorsOptions(origins = resolveCorsOrigins()): CorsOptions {
  return {
    origin: origins,
    credentials: true,
  };
}

export function isSwaggerEnabled(): boolean {
  return process.env.SWAGGER_ENABLED === 'true';
}

export function createHelmetOptions(swaggerEnabled: boolean): HelmetOptions {
  if (!swaggerEnabled) {
    return {};
  }

  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  };
}
