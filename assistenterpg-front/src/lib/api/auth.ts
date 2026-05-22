// src/lib/api/auth.ts
import { apiClient, type AuthAxiosConfig } from './axios-client';
import type { LoginResponse } from '@/lib/types';

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

export async function apiRegister(apelido: string, email: string, senha: string) {
  const { data } = await apiClient.post('/auth/register', {
    apelido,
    email,
    senha,
  });
  return data;
}

export async function apiLogin(
  email: string,
  senha: string,
  rememberMe = true,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    senha,
    rememberMe,
  });
  return data;
}

export async function apiLogout(): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/logout');
  return data;
}

export async function apiForgotPassword(email: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/forgot-password',
    {
      email,
    },
  );
  return data;
}

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

export async function apiVerifyEmail(token: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/verify-email', {
    token,
  });
  return data;
}

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

export async function apiGetMe(): Promise<UsuarioMe> {
  const { data } = await apiClient.get<UsuarioMe>('/usuarios/me');
  return data;
}

export async function apiGetMeSilencioso(): Promise<UsuarioMe> {
  const config: AuthAxiosConfig = {
    _skipAuthRefresh: true,
    _skipAuthRedirect: true,
  };
  const { data } = await apiClient.get<UsuarioMe>('/usuarios/me', config);
  return data;
}
