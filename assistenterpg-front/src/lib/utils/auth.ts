// src/lib/utils/auth.ts
/**
 * Utilitários de autenticação (SPA + Bearer)
 * Estratégia oficial do front: token salvo apenas no localStorage.
 */

const TOKEN_KEY = 'assistenterpg_token';

/**
 * ✅ Salva token no localStorage
 */
export function saveToken(token: string) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * ✅ Busca token do localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * ✅ Limpa token do localStorage
 */
export function clearToken() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
}
