// src/lib/api/axios-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, clearToken } from '../utils/auth';
import type { ApiErrorBody } from '@/lib/types'; // ✅ ATUALIZADO

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let isRedirectingToLogin = false;

/**
 * ✅ Cliente axios com interceptors configurados
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ✅ Classe de erro customizada
 */
export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;
  code?: string;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.code = body?.code;
  }
}

/**
 * ✅ REQUEST INTERCEPTOR: Adiciona token automaticamente
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * ✅ RESPONSE INTERCEPTOR: Trata 401 globalmente
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // 1️⃣ Erro de rede (offline)
    if (!error.response) {
      throw new ApiError(
        'Erro de conexão',
        0,
        { statusCode: 0, message: 'Erro de conexão', error: 'NETWORK_ERROR', code: 'NETWORK_ERROR' },
      );
    }

    const status = error.response.status;
    const body = error.response.data;

    // 2️⃣ 401: Token expirou ou inválido
    if (status === 401) {
      clearToken();

      if (
        typeof window !== 'undefined' &&
        !isRedirectingToLogin &&
        window.location.pathname !== '/auth/login'
      ) {
        isRedirectingToLogin = true;
        window.location.assign('/auth/login');
      }
    }

    // 3️⃣ Criar ApiError com corpo estruturado
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : String(body?.message || 'Erro desconhecido');

    throw new ApiError(message, status, body || null);
  },
);
