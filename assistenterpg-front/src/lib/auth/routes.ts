export const AUTH_PAGE_PATHS = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resendVerification: '/auth/resend-verification',
  reactivateAccount: '/auth/reactivate-account',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  verifyEmailChange: '/auth/verify-email-change',
} as const;

const VISITOR_ONLY_PAGE_PATHS = new Set<string>([
  '/',
  AUTH_PAGE_PATHS.login,
  AUTH_PAGE_PATHS.register,
  AUTH_PAGE_PATHS.forgotPassword,
  AUTH_PAGE_PATHS.resendVerification,
  AUTH_PAGE_PATHS.reactivateAccount,
]);

const PUBLIC_TOKEN_PAGE_PATHS = new Set<string>([
  AUTH_PAGE_PATHS.resetPassword,
  AUTH_PAGE_PATHS.verifyEmail,
  AUTH_PAGE_PATHS.verifyEmailChange,
]);

const PUBLIC_AUTH_API_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification-email',
  '/auth/reactivate-account',
  '/auth/verify-email-change',
]);

const SESSION_AUTH_API_PATHS = new Set(['/auth/csrf', '/auth/refresh']);

export function isVisitorOnlyPagePath(pathname: string): boolean {
  return VISITOR_ONLY_PAGE_PATHS.has(pathname);
}

export function isPublicTokenPagePath(pathname: string): boolean {
  return PUBLIC_TOKEN_PAGE_PATHS.has(pathname);
}

export function isPublicAuthPagePath(pathname: string): boolean {
  return isVisitorOnlyPagePath(pathname) || isPublicTokenPagePath(pathname);
}

export function isPublicAuthApiPath(pathname: string): boolean {
  return PUBLIC_AUTH_API_PATHS.has(pathname);
}

export function shouldAttemptAuthRecoveryForPath(pathname: string): boolean {
  return (
    !isPublicAuthApiPath(pathname) && !SESSION_AUTH_API_PATHS.has(pathname)
  );
}

export function shouldRedirectUnauthorizedPath(pathname: string): boolean {
  return shouldAttemptAuthRecoveryForPath(pathname);
}
