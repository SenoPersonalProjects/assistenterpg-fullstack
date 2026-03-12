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
  emailVerificadoEm?: string | null;
};

export type ApiMensagemAuth = {
  mensagem: string;
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
 * Solicita recuperacao de senha por email.
 */
export async function apiForgotPassword(email: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/forgot-password', {
    email,
  });
  return data;
}

/**
 * Redefine senha usando token de recuperacao.
 */
export async function apiResetPassword(
  token: string,
  novaSenha: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/reset-password', {
    token,
    novaSenha,
  });
  return data;
}

/**
 * Verifica email com token de conta nova.
 */
export async function apiVerifyEmail(token: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/verify-email', {
    token,
  });
  return data;
}

/**
 * Reenvia email de verificacao.
 */
export async function apiResendVerificationEmail(
  email: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/resend-verification-email',
    {
      email,
    },
  );
  return data;
}

/**
 * ✅ Buscar dados do usuário logado
 */
export async function apiGetMe(): Promise<UsuarioMe> {
  const { data } = await apiClient.get<UsuarioMe>('/usuarios/me');
  return data;
}
