const LEGACY_TOKEN_KEY = 'assistenterpg_token';
export const AUTH_HINT_COOKIE = 'assistenterpg_auth_hint';
const AUTH_HINT_MAX_AGE = 60 * 60 * 24 * 7;

function secureCookieFlag() {
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

export function setAuthHintCookie() {
  if (typeof window === 'undefined') return;

  document.cookie = `${AUTH_HINT_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=${AUTH_HINT_MAX_AGE}${secureCookieFlag()}`;
}

export function clearAuthHintCookie() {
  if (typeof window === 'undefined') return;

  document.cookie = `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieFlag()}`;
}

export function clearLegacyAuthStorage() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  document.cookie = `${LEGACY_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieFlag()}`;
}

export function clearClientAuthMarkers() {
  clearLegacyAuthStorage();
  clearAuthHintCookie();
}
