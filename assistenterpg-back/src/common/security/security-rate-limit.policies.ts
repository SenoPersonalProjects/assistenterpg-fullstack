export type SecurityRateLimitDimension = 'ip' | 'email' | 'token' | 'usuario';

export type SecurityRateLimitPolicy = {
  action: string;
  dimensions: readonly {
    dimension: SecurityRateLimitDimension;
    limit: number;
    windowMs: number;
  }[];
};

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const SECURITY_RATE_LIMIT_POLICIES = {
  login: {
    action: 'login',
    dimensions: [
      { dimension: 'ip', limit: 60, windowMs: 15 * MINUTE_MS },
      { dimension: 'email', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  reactivateAccount: {
    action: 'reactivate-account',
    dimensions: [
      { dimension: 'ip', limit: 60, windowMs: 15 * MINUTE_MS },
      { dimension: 'email', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  register: {
    action: 'register',
    dimensions: [
      { dimension: 'ip', limit: 20, windowMs: HOUR_MS },
      { dimension: 'email', limit: 3, windowMs: HOUR_MS },
    ],
  },
  forgotPassword: {
    action: 'forgot-password',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'email', limit: 3, windowMs: HOUR_MS },
    ],
  },
  resendVerificationEmail: {
    action: 'resend-verification-email',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'email', limit: 3, windowMs: HOUR_MS },
    ],
  },
  resetPassword: {
    action: 'reset-password',
    dimensions: [
      { dimension: 'ip', limit: 60, windowMs: HOUR_MS },
      { dimension: 'token', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  verifyEmail: {
    action: 'verify-email',
    dimensions: [
      { dimension: 'ip', limit: 60, windowMs: HOUR_MS },
      { dimension: 'token', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  verifyEmailChange: {
    action: 'verify-email-change',
    dimensions: [
      { dimension: 'ip', limit: 60, windowMs: HOUR_MS },
      { dimension: 'token', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  changePassword: {
    action: 'change-password',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  changeEmail: {
    action: 'change-email',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  deactivateAccount: {
    action: 'deactivate-account',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  deleteAccount: {
    action: 'delete-account',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
  googleOAuthStart: {
    action: 'google-oauth-start',
    dimensions: [{ dimension: 'ip', limit: 60, windowMs: HOUR_MS }],
  },
  googleOAuthUserAction: {
    action: 'google-oauth-user-action',
    dimensions: [
      { dimension: 'ip', limit: 30, windowMs: HOUR_MS },
      { dimension: 'usuario', limit: 5, windowMs: 15 * MINUTE_MS },
    ],
  },
} as const satisfies Record<string, SecurityRateLimitPolicy>;

export type SecurityRateLimitPolicyName =
  keyof typeof SECURITY_RATE_LIMIT_POLICIES;
