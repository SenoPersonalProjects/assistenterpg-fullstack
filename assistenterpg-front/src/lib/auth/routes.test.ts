import { describe, expect, it } from 'vitest';
import {
  AUTH_PAGE_PATHS,
  isPublicAuthApiPath,
  isPublicAuthPagePath,
  isPublicTokenPagePath,
  isVisitorOnlyPagePath,
  shouldAttemptAuthRecoveryForPath,
  shouldRedirectUnauthorizedPath,
} from './routes';

describe('auth route policies', () => {
  it('separates visitor-only pages from public token pages', () => {
    expect(isVisitorOnlyPagePath(AUTH_PAGE_PATHS.login)).toBe(true);
    expect(isVisitorOnlyPagePath(AUTH_PAGE_PATHS.resetPassword)).toBe(false);
    expect(isPublicTokenPagePath(AUTH_PAGE_PATHS.resetPassword)).toBe(true);
    expect(isPublicTokenPagePath(AUTH_PAGE_PATHS.verifyEmailChange)).toBe(true);
    expect(isPublicAuthPagePath(AUTH_PAGE_PATHS.verifyEmail)).toBe(true);
  });

  it('keeps unknown auth pages protected', () => {
    expect(isPublicAuthPagePath('/auth/internal-admin')).toBe(false);
  });

  it('disables refresh and redirect recovery for public auth endpoints', () => {
    expect(isPublicAuthApiPath('/auth/reset-password')).toBe(true);
    expect(shouldAttemptAuthRecoveryForPath('/auth/reset-password')).toBe(false);
    expect(shouldRedirectUnauthorizedPath('/auth/verify-email')).toBe(false);
    expect(shouldAttemptAuthRecoveryForPath('/usuarios/me')).toBe(true);
  });
});
