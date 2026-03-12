// src/lib/api/axios-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, clearToken } from '../utils/auth';
import type { ApiErrorBody } from '@/lib/types';
import { corrigirMojibakeDeep } from '../utils/encoding';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let isRedirectingToLogin = false;

/** Cliente axios com interceptors configurados. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Classe de erro customizada. */
export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;
  code?: string;
  method?: string;
  endpoint?: string;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    body: ApiErrorBody | null,
    context?: {
      method?: string;
      endpoint?: string;
      requestId?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.code = body?.code;
    this.method = context?.method;
    this.endpoint = context?.endpoint;
    this.requestId = context?.requestId;
  }
}

/** Request interceptor: adiciona token automaticamente. */
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

/** Response interceptor: trata 401 globalmente. */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = corrigirMojibakeDeep(response.data);
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    const hadToken = Boolean(getToken());
    const method = error.config?.method?.toUpperCase();
    const endpoint = error.config?.url;
    // 1) Erro de rede (offline)
    if (!error.response) {
      throw new ApiError(
        'Erro de conexao',
        0,
        { statusCode: 0, message: 'Erro de conexao', error: 'NETWORK_ERROR', code: 'NETWORK_ERROR' },
        { method, endpoint },
      );
    }

    const status = error.response.status;
    const body = error.response.data;
    const headers = error.response.headers ?? {};
    const requestIdHeaderRaw =
      headers['x-request-id'] ??
      headers['x-correlation-id'] ??
      headers['X-Request-Id'] ??
      headers['X-Correlation-Id'];
    const requestIdHeader =
      typeof requestIdHeaderRaw === 'string'
        ? requestIdHeaderRaw
        : Array.isArray(requestIdHeaderRaw) && requestIdHeaderRaw.length > 0
          ? requestIdHeaderRaw[0]
          : undefined;
    const requestIdBody =
      body?.details && typeof body.details.requestId === 'string'
        ? body.details.requestId
        : undefined;
    const requestId = requestIdHeader ?? requestIdBody;

    // 2) 401: Token expirou ou invalido
    if (status === 401 && hadToken) {
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

    // 3) Criar ApiError com corpo estruturado
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : String(body?.message || 'Erro desconhecido');

    throw new ApiError(message, status, body || null, {
      method,
      endpoint,
      requestId,
    });
  },
);

