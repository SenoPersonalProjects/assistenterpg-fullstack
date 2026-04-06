// src/lib/utils/auth.ts
/**
 * Utilitários de autenticação (SPA + Bearer)
 * Estratégia oficial do front: token salvo no localStorage (lembrar) ou sessionStorage.
 */

const TOKEN_KEY = 'assistenterpg_token';

/**
 * ✅ Salva token no localStorage
 */
export function saveToken(token: string, persist = true) {
  if (typeof window === 'undefined') return;

  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * ✅ Busca token do localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * ✅ Limpa token do localStorage
 */
export function clearToken() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
