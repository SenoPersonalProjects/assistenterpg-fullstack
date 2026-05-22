import type { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request } from 'express';

export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_JWT_SECRET_MIN_LENGTH = 32;
export const AUTH_ACCESS_COOKIE = 'assistenterpg_access';
export const AUTH_REFRESH_COOKIE = 'assistenterpg_refresh';
export const AUTH_CSRF_COOKIE = 'assistenterpg_csrf';
export const AUTH_CSRF_HEADER = 'x-csrf-token';
export const AUTH_ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
export const AUTH_REFRESH_TOKEN_TTL_REMEMBER_SECONDS = 60 * 60 * 24 * 7;
export const AUTH_REFRESH_TOKEN_TTL_SESSION_SECONDS = 60 * 60 * 8;

export const AUTH_THROTTLE_LIMITS = {
  login: {
    default: {
      limit: 5,
      ttl: 60_000,
      blockDuration: 60_000,
    },
  },
  register: {
    default: {
      limit: 3,
      ttl: 300_000,
      blockDuration: 300_000,
    },
  },
  forgotPassword: {
    default: {
      limit: 3,
      ttl: 300_000,
      blockDuration: 300_000,
    },
  },
  resetPassword: {
    default: {
      limit: 5,
      ttl: 300_000,
      blockDuration: 300_000,
    },
  },
  resendVerificationEmail: {
    default: {
      limit: 3,
      ttl: 300_000,
      blockDuration: 300_000,
    },
  },
} as const;

export function resolveJwtSecret(
  configService: Pick<ConfigService, 'get'>,
): string {
  const secret = configService.get<string>('JWT_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv === 'production') {
    if (!secret) {
      throw new Error('JWT_SECRET e obrigatorio em producao.');
    }

    if (secret === 'dev-secret' || secret.length < AUTH_JWT_SECRET_MIN_LENGTH) {
      throw new Error(
        `JWT_SECRET deve ter pelo menos ${AUTH_JWT_SECRET_MIN_LENGTH} caracteres em producao.`,
      );
    }
  }

  return secret || 'dev-secret';
}

export function isBearerFallbackEnabled(
  configService: Pick<ConfigService, 'get'>,
): boolean {
  return (
    configService.get<string>('AUTH_BEARER_FALLBACK_ENABLED') === 'true' ||
    configService.get<string>('NODE_ENV') !== 'production'
  );
}

export function resolveAuthCookieOptions(
  configService: Pick<ConfigService, 'get'>,
  httpOnly: boolean,
  maxAgeSeconds?: number,
): CookieOptions {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const configuredSameSite = configService
    .get<string>('AUTH_COOKIE_SAME_SITE')
    ?.toLowerCase();
  const sameSite =
    configuredSameSite === 'strict' ||
    configuredSameSite === 'lax' ||
    configuredSameSite === 'none'
      ? configuredSameSite
      : nodeEnv === 'production'
        ? 'none'
        : 'lax';

  const secure =
    configService.get<string>('AUTH_COOKIE_SECURE') === 'true' ||
    (nodeEnv === 'production' && sameSite === 'none');

  if (sameSite === 'none' && !secure) {
    throw new Error('AUTH_COOKIE_SECURE=true e obrigatorio com SameSite=None.');
  }

  return {
    httpOnly,
    secure,
    sameSite,
    path: '/',
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds * 1000 } : {}),
  };
}

export function getCookieValue(request: Request, name: string): string | null {
  const cookies = request.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[name];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

export function parseCookieHeader(header: unknown): Record<string, string> {
  if (typeof header !== 'string') return {};

  return header
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const separatorIndex = entry.indexOf('=');
      if (separatorIndex <= 0) return acc;

      const key = entry.slice(0, separatorIndex).trim();
      const rawValue = entry.slice(separatorIndex + 1).trim();
      if (!key) return acc;

      try {
        acc[key] = decodeURIComponent(rawValue);
      } catch {
        acc[key] = rawValue;
      }

      return acc;
    }, {});
}
