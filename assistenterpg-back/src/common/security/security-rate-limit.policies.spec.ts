import { SECURITY_RATE_LIMIT_POLICIES } from './security-rate-limit.policies';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

describe('SECURITY_RATE_LIMIT_POLICIES', () => {
  it.each([
    ['login', 'login'],
    ['reactivateAccount', 'reactivate-account'],
  ] as const)('%s limita por IP e email', (policyName, action) => {
    expect(SECURITY_RATE_LIMIT_POLICIES[policyName]).toEqual({
      action,
      dimensions: [
        { dimension: 'ip', limit: 60, windowMs: 15 * MINUTE_MS },
        { dimension: 'email', limit: 5, windowMs: 15 * MINUTE_MS },
      ],
    });
  });

  it('registro e recuperacao usam limites separados por IP e email', () => {
    expect(SECURITY_RATE_LIMIT_POLICIES.register.dimensions).toEqual([
      { dimension: 'ip', limit: 20, windowMs: HOUR_MS },
      { dimension: 'email', limit: 3, windowMs: HOUR_MS },
    ]);
    expect(SECURITY_RATE_LIMIT_POLICIES.forgotPassword.dimensions).toEqual([
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'email', limit: 3, windowMs: HOUR_MS },
    ]);
  });

  it.each(['resetPassword', 'verifyEmail', 'verifyEmailChange'] as const)(
    '%s limita por IP e token',
    (policyName) => {
      expect(SECURITY_RATE_LIMIT_POLICIES[policyName].dimensions).toEqual([
        { dimension: 'ip', limit: 60, windowMs: HOUR_MS },
        { dimension: 'token', limit: 5, windowMs: 15 * MINUTE_MS },
      ]);
    },
  );

  it.each([
    'changePassword',
    'changeEmail',
    'deactivateAccount',
    'deleteAccount',
  ] as const)('%s limita por IP e usuario', (policyName) => {
    expect(SECURITY_RATE_LIMIT_POLICIES[policyName].dimensions).toEqual([
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ]);
  });
});
