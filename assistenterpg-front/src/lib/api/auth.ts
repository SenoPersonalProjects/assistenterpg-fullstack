// src/lib/api/auth.ts
import { apiClient } from './axios-client';
import type { LoginResponse } from '@/lib/types'; // ✅ ATUALIZADO

/**
 * ✅ Type de retorno de apiGetMe
 */
export type UsuarioMe = {
  id: number;
  apelido: string;
  email: string;
  role: string;
};

/**
 * ✅ Registrar novo usuário
 */
export async function apiRegister(apelido: string, email: string, senha: string) {
  const { data } = await apiClient.post('/auth/register', {
    apelido,
    email,
    senha,
  });
  return data;
}

/**
 * ✅ Fazer login
 */
export async function apiLogin(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    senha,
  });
  return data;
}

/**
 * ✅ Buscar dados do usuário logado
 */
export async function apiGetMe(): Promise<UsuarioMe> {
  const { data } = await apiClient.get<UsuarioMe>('/usuarios/me');
  return data;
}
