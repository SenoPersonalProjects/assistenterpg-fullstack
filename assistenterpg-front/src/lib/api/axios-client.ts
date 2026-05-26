// src/lib/api/axios-client.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorBody } from '@/lib/types';
import {
  clearClientAuthMarkers,
  setAuthHintCookie,
} from '../utils/auth';
import { corrigirMojibakeDeep } from '../utils/encoding';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification-email',
]);
const SESSION_AUTH_PATHS = new Set(['/auth/csrf', '/auth/refresh']);

let isRedirectingToLogin = false;
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let refreshPromise: Promise<void> | null = null;
let lastAuthRefreshAt = 0;

const REFRESH_CHANNEL_NAME = 'assistenterpg_auth_refresh';
const REFRESH_LOCK_KEY = 'assistenterpg_refresh_lock';
const REFRESH_LOCK_TTL_MS = 10_000;
const REFRESH_WAIT_MS = 3_000;

type RefreshLock = {
  owner: string;
  expiresAt: number;
};

type RefreshBroadcastMessage = {
  type: 'refresh-ok' | 'refresh-failed';
  at: number;
};

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _retryCsrf?: boolean;
  _skipCsrf?: boolean;
  _skipAuthRefresh?: boolean;
  _skipAuthRedirect?: boolean;
};

export type AuthAxiosConfig = AxiosRequestConfig & {
  _skipCsrf?: boolean;
  _skipAuthRefresh?: boolean;
  _skipAuthRedirect?: boolean;
};

type CsrfResponse = {
  csrfToken: string;
};

/** Cliente axios com interceptors configurados. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sessionClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

export function clearAuthClientState() {
  csrfToken = null;
  csrfPromise = null;
  refreshPromise = null;
  lastAuthRefreshAt = 0;
  clearClientAuthMarkers();
}

export function resetCsrfToken() {
  csrfToken = null;
  csrfPromise = null;
}

export function markAuthSessionFresh() {
  lastAuthRefreshAt = Date.now();
  setAuthHintCookie();
}

export function getLastAuthRefreshAt() {
  return lastAuthRefreshAt;
}

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = sessionClient
    .get<CsrfResponse>('/auth/csrf')
    .then((response) => {
      csrfToken = response.data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

async function fetchFreshCsrfToken(): Promise<string> {
  resetCsrfToken();
  return ensureCsrfToken();
}

export async function refreshAuthSession(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshAuthSessionCoordinated().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function createRefreshChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }

  return new BroadcastChannel(REFRESH_CHANNEL_NAME);
}

function broadcastRefresh(message: RefreshBroadcastMessage) {
  const channel = createRefreshChannel();
  if (!channel) return;

  channel.postMessage(message);
  channel.close();
}

function readRefreshLock(): RefreshLock | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RefreshLock>;
    if (
      typeof parsed.owner !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }
    return { owner: parsed.owner, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function acquireRefreshLock(): string | null {
  if (typeof window === 'undefined') return 'server';

  const atual = readRefreshLock();
  if (atual && atual.expiresAt > Date.now()) return null;

  const owner =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  const lock: RefreshLock = {
    owner,
    expiresAt: Date.now() + REFRESH_LOCK_TTL_MS,
  };

  try {
    window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(lock));
    return readRefreshLock()?.owner === owner ? owner : null;
  } catch {
    return owner;
  }
}

function releaseRefreshLock(owner: string) {
  if (typeof window === 'undefined') return;

  try {
    const atual = readRefreshLock();
    if (atual?.owner === owner) {
      window.localStorage.removeItem(REFRESH_LOCK_KEY);
    }
  } catch {
    // Sem efeito: o lock expira sozinho.
  }
}

function waitForExternalRefresh(): Promise<boolean> {
  const channel = createRefreshChannel();
  if (!channel) {
    return new Promise((resolve) =>
      window.setTimeout(() => resolve(false), REFRESH_WAIT_MS),
    );
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      channel.close();
      resolve(false);
    }, REFRESH_WAIT_MS);

    channel.onmessage = (event: MessageEvent<RefreshBroadcastMessage>) => {
      if (event.data?.type === 'refresh-ok') {
        window.clearTimeout(timeout);
        channel.close();
        resetCsrfToken();
        markAuthSessionFresh();
        resolve(true);
      }

      if (event.data?.type === 'refresh-failed') {
        window.clearTimeout(timeout);
        channel.close();
        resolve(false);
      }
    };
  });
}

async function refreshAuthSessionCoordinated(): Promise<void> {
  const owner = acquireRefreshLock();

  if (!owner) {
    const refreshedByAnotherTab = await waitForExternalRefresh();
    if (refreshedByAnotherTab) return;
    return refreshAuthSessionCoordinated();
  }

  try {
    await performRefreshRequest();
    markAuthSessionFresh();
    broadcastRefresh({ type: 'refresh-ok', at: Date.now() });
  } catch (error) {
    broadcastRefresh({ type: 'refresh-failed', at: Date.now() });
    throw error;
  } finally {
    releaseRefreshLock(owner);
  }
}

async function performRefreshRequest(): Promise<void> {
  const token = await fetchFreshCsrfToken();
  const response = await sessionClient.post<CsrfResponse>(
    '/auth/refresh',
    undefined,
    {
      headers: { [CSRF_HEADER]: token },
    },
  );
  csrfToken = response.data.csrfToken;
}

function normalizarPath(url?: string): string {
  if (!url) return '';

  try {
    return new URL(url, API_BASE_URL).pathname;
  } catch {
    return url.split('?')[0] ?? '';
  }
}

function shouldAttachCsrf(config: AuthRequestConfig): boolean {
  if (config._skipCsrf) return false;

  const method = (config.method ?? 'GET').toUpperCase();
  if (!UNSAFE_METHODS.has(method)) return false;

  const path = normalizarPath(config.url);
  return !PUBLIC_AUTH_PATHS.has(path);
}

function shouldAttemptRefresh(error: AxiosError<ApiErrorBody>): boolean {
  const config = error.config as AuthRequestConfig | undefined;
  if (!config || config._retry) return false;
  if (config._skipAuthRefresh) return false;
  if (error.response?.status !== 401) return false;

  const path = normalizarPath(config.url);
  return !SESSION_AUTH_PATHS.has(path) && path !== '/auth/login';
}

function shouldAttemptCsrfRetry(error: AxiosError<ApiErrorBody>): boolean {
  const config = error.config as AuthRequestConfig | undefined;
  if (!config || config._retryCsrf) return false;
  if (error.response?.status !== 403) return false;

  const message = error.response.data?.message;
  const normalizedMessage = Array.isArray(message)
    ? message.join(' ')
    : String(message ?? '');

  return normalizedMessage.toLowerCase().includes('csrf');
}

function isRefreshAuthFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return (
    error.response?.status === 400 ||
    error.response?.status === 401 ||
    error.response?.status === 403
  );
}

function setHeader(
  config: InternalAxiosRequestConfig,
  key: string,
  value: string,
) {
  const headers = AxiosHeaders.from(config.headers);
  headers.set(key, value);
  config.headers = headers;
}

function redirectToLogin() {
  if (
    typeof window !== 'undefined' &&
    !isRedirectingToLogin &&
    window.location.pathname !== '/auth/login'
  ) {
    isRedirectingToLogin = true;
    window.location.assign('/auth/login');
  }
}

/** Request interceptor: adiciona CSRF automaticamente em mutacoes. */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authConfig = config as AuthRequestConfig;
    if (shouldAttachCsrf(authConfig)) {
      const token = await ensureCsrfToken();
      setHeader(config, CSRF_HEADER, token);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/** Response interceptor: normaliza dados e tenta refresh uma vez em 401. */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = corrigirMojibakeDeep(response.data);
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as AuthRequestConfig | undefined;

    if (shouldAttemptCsrfRetry(error) && config) {
      csrfToken = null;
      config._retryCsrf = true;
      const token = await ensureCsrfToken();
      setHeader(config, CSRF_HEADER, token);
      return apiClient(config);
    }

    if (shouldAttemptRefresh(error) && config) {
      try {
        config._retry = true;
        await refreshAuthSession();
        return apiClient(config);
      } catch (refreshError) {
        if (isRefreshAuthFailure(refreshError)) {
          clearAuthClientState();
          if (!config._skipAuthRedirect) {
            redirectToLogin();
          }
        }
        throw refreshError;
      }
    }

    const method = error.config?.method?.toUpperCase();
    const endpoint = error.config?.url;

    if (!error.response) {
      throw new ApiError(
        'Erro de conexão',
        0,
        {
          statusCode: 0,
          message: 'Erro de conexão',
          error: 'NETWORK_ERROR',
          code: 'NETWORK_ERROR',
        },
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

    if (status === 401 && !config?._skipAuthRedirect) {
      clearAuthClientState();
      redirectToLogin();
    }

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
