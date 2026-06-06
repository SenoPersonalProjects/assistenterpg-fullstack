import { SECURITY_RATE_LIMIT_POLICIES } from 'src/common/security/security-rate-limit.policies';
import {
  AUTH_JWT_SECRET_MIN_LENGTH,
  AUTH_PASSWORD_MAX_BYTES,
  AUTH_PASSWORD_MIN_LENGTH,
  resolveJwtSecret,
} from './auth-security.config';

function criarConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

describe('auth-security.config', () => {
  it('mantem politica de senha entre 8 caracteres e 72 bytes', () => {
    expect(AUTH_PASSWORD_MIN_LENGTH).toBe(8);
    expect(AUTH_PASSWORD_MAX_BYTES).toBe(72);
  });

  it('usa politicas SecurityRateLimit multidimensionais nos endpoints sensiveis', () => {
    expect(SECURITY_RATE_LIMIT_POLICIES.login.dimensions).toEqual([
      { dimension: 'ip', limit: 60, windowMs: 15 * 60_000 },
      { dimension: 'email', limit: 5, windowMs: 15 * 60_000 },
    ]);
    expect(SECURITY_RATE_LIMIT_POLICIES.resetPassword.dimensions).toEqual([
      { dimension: 'ip', limit: 60, windowMs: 60 * 60_000 },
      { dimension: 'token', limit: 5, windowMs: 15 * 60_000 },
    ]);
  });

  it('permite fallback dev-secret apenas fora de producao', () => {
    const config = criarConfig({ NODE_ENV: 'development' });

    expect(resolveJwtSecret(config)).toBe('dev-secret');
  });

  it('exige JWT_SECRET forte em producao', () => {
    const configSemSecret = criarConfig({ NODE_ENV: 'production' });
    const configFraco = criarConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'curto',
    });
    const configForte = criarConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'x'.repeat(AUTH_JWT_SECRET_MIN_LENGTH),
    });

    expect(() => resolveJwtSecret(configSemSecret)).toThrow(
      /JWT_SECRET.*obrigat/,
    );
    expect(() => resolveJwtSecret(configFraco)).toThrow(
      `${AUTH_JWT_SECRET_MIN_LENGTH} caracteres`,
    );
    expect(resolveJwtSecret(configForte)).toBe(
      'x'.repeat(AUTH_JWT_SECRET_MIN_LENGTH),
    );
  });
});
