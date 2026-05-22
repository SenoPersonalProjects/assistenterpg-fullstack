import {
  AUTH_JWT_SECRET_MIN_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_THROTTLE_LIMITS,
  resolveJwtSecret,
} from './auth-security.config';

function criarConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

describe('auth-security.config', () => {
  it('mantem politica minima de senha em 8 caracteres', () => {
    expect(AUTH_PASSWORD_MIN_LENGTH).toBe(8);
  });

  it('define rate limit para endpoints sensiveis de auth', () => {
    expect(AUTH_THROTTLE_LIMITS.login.default.limit).toBeGreaterThan(0);
    expect(AUTH_THROTTLE_LIMITS.register.default.limit).toBeGreaterThan(0);
    expect(AUTH_THROTTLE_LIMITS.forgotPassword.default.limit).toBeGreaterThan(
      0,
    );
    expect(AUTH_THROTTLE_LIMITS.resetPassword.default.limit).toBeGreaterThan(0);
    expect(
      AUTH_THROTTLE_LIMITS.resendVerificationEmail.default.limit,
    ).toBeGreaterThan(0);
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
      'JWT_SECRET e obrigatorio em producao.',
    );
    expect(() => resolveJwtSecret(configFraco)).toThrow(
      `${AUTH_JWT_SECRET_MIN_LENGTH} caracteres`,
    );
    expect(resolveJwtSecret(configForte)).toBe(
      'x'.repeat(AUTH_JWT_SECRET_MIN_LENGTH),
    );
  });
});
