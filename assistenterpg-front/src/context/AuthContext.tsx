// src/context/AuthContext.tsx

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiGetMe, apiLogin, apiRegister, LoginResponse } from '@/lib/api';
import { clearToken, getToken, saveToken } from '@/lib/utils/auth';
import { useRouter } from 'next/navigation';

type Usuario = {
  id: number;
  apelido: string;
  email: string;
  role: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (apelido: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const initialToken = getToken();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(Boolean(initialToken));

  // Estratégia oficial: autenticação SPA com Bearer em localStorage.
  useEffect(() => {
    if (!token) {
      return;
    }

    apiGetMe()
      .then((u) => setUsuario(u))
      .catch(() => {
        clearToken();
        setToken(null);
        setUsuario(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const resp: LoginResponse = await apiLogin(email, senha);
      saveToken(resp.access_token);
      setToken(resp.access_token);
      setUsuario(resp.usuario);
      router.push('/home');
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
    clearToken();
    setToken(null);
    setUsuario(null);
    router.push('/auth/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ usuario, token, loading, login, register, logout }}
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
