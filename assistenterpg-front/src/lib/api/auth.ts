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

function publicAuthConfig(): AuthAxiosConfig {
  return {
    _skipAuthRefresh: true,
    _skipAuthRedirect: true,
    _skipCsrf: true,
  };
}

export async function apiRegister(
  apelido: string,
  email: string,
  senha: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/register',
    { apelido, email, senha },
    publicAuthConfig(),
  );
  return data;
}

export async function apiLogin(
  email: string,
  senha: string,
  rememberMe = true,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login',
    { email, senha, rememberMe },
    publicAuthConfig(),
  );
  return data;
}

export async function apiLogout(): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>('/auth/logout');
  return data;
}

export async function apiForgotPassword(email: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/forgot-password',
    { email },
    publicAuthConfig(),
  );
  return data;
}

export async function apiResetPassword(
  token: string,
  novaSenha: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/reset-password',
    { token, novaSenha },
    publicAuthConfig(),
  );
  return data;
}

export async function apiVerifyEmail(token: string): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/verify-email',
    { token },
    publicAuthConfig(),
  );
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
    publicAuthConfig(),
  );
  return data;
}

export async function apiVerifyEmailChange(
  token: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/verify-email-change',
    { token },
    publicAuthConfig(),
  );
  return data;
}

export async function apiReactivateAccount(
  email: string,
  senha: string,
): Promise<ApiMensagemAuth> {
  const { data } = await apiClient.post<ApiMensagemAuth>(
    '/auth/reactivate-account',
    { email, senha },
    publicAuthConfig(),
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
