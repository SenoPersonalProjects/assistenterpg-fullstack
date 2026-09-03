// src/context/AuthContext.tsx

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  apiGetMe,
  apiGetMeSilencioso,
  apiLogin,
  apiLogout,
  apiRegister,
  LoginResponse,
} from '@/lib/api';
import {
  clearAuthClientState,
  getLastAuthRefreshAt,
  isRefreshAuthFailure,
  markAuthSessionFresh,
  refreshAuthSession,
} from '@/lib/api/axios-client';
import {
  clearLegacyAuthStorage,
  setAuthHintCookie,
} from '@/lib/utils/auth';
import { isVisitorOnlyPagePath } from '@/lib/auth/routes';

const SESSION_ACTIVE_TOKEN = 'cookie-session';
const PROACTIVE_REFRESH_INTERVAL_MS = 12 * 60 * 1000;

type Usuario = {
  id: number;
  apelido: string;
  email: string;
  role: string;
  emailVerificado?: boolean;
};

type AuthContextType = {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string, rememberMe?: boolean) => Promise<void>;
  register: (apelido: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  requireLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizarUsuario(u: {
  id: number;
  apelido: string;
  email: string;
  role: string;
  emailVerificado?: boolean;
  emailVerificadoEm?: string | null;
}): Usuario {
  return {
    id: u.id,
    apelido: u.apelido,
    email: u.email,
    role: u.role,
    emailVerificado: Boolean(u.emailVerificado ?? u.emailVerificadoEm),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requireLogin = useCallback(() => {
    clearAuthClientState();
    setToken(null);
    setUsuario(null);
    setLoading(false);
    router.replace('/auth/login');
  }, [router]);

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      clearLegacyAuthStorage();

      try {
        const u = await apiGetMeSilencioso();
        if (!active) return;

        setUsuario(normalizarUsuario(u));
        setToken(SESSION_ACTIVE_TOKEN);
        markAuthSessionFresh();
        setAuthHintCookie();

        if (isVisitorOnlyPagePath(pathname)) {
          router.replace('/home');
        }
      } catch {
        try {
          await refreshAuthSession();
          const u = await apiGetMe();
          if (!active) return;

          setUsuario(normalizarUsuario(u));
          setToken(SESSION_ACTIVE_TOKEN);
          markAuthSessionFresh();
          setAuthHintCookie();

          if (isVisitorOnlyPagePath(pathname)) {
            router.replace('/home');
          }
        } catch {
          clearAuthClientState();
          if (active) {
            setToken(null);
            setUsuario(null);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!usuario) return;

    let active = true;
    let running = false;

    const renovarSeNecessario = async (force = false) => {
      if (!active || running) return;
      const elapsed = Date.now() - getLastAuthRefreshAt();
      if (!force && elapsed < PROACTIVE_REFRESH_INTERVAL_MS) return;

      running = true;
      try {
        await refreshAuthSession();
      } catch (error) {
        if (isRefreshAuthFailure(error)) {
          requireLogin();
        }
        // Erros transitórios não derrubam a sessão.
      } finally {
        running = false;
      }
    };

    const interval = window.setInterval(
      () => void renovarSeNecessario(true),
      PROACTIVE_REFRESH_INTERVAL_MS,
    );
    const handleFocus = () => void renovarSeNecessario(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void renovarSeNecessario(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requireLogin, usuario]);

  const login = useCallback(
    async (email: string, senha: string, rememberMe = true) => {
      setLoading(true);
      try {
        const resp: LoginResponse = await apiLogin(email, senha, rememberMe);
        setToken(SESSION_ACTIVE_TOKEN);
        setUsuario(normalizarUsuario(resp.usuario));
        markAuthSessionFresh();
        setAuthHintCookie();
        router.push('/home');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (apelido: string, email: string, senha: string) => {
      await apiRegister(apelido, email, senha);
      router.push('/auth/login');
    },
    [router],
  );

  const logout = useCallback(() => {
    void apiLogout().finally(requireLogin);
  }, [requireLogin]);

  return (
    <AuthContext.Provider
      value={{ usuario, token, loading, login, register, logout, requireLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
