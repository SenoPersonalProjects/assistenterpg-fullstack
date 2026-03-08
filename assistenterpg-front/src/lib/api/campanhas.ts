// lib/api/campanhas.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type { CampanhaResumo, ConviteCampanha } from '@/lib/types'; // ✅ ATUALIZADO

type MinhasCampanhasQuery = {
  page?: number;
  limit?: number;
};

type CampanhaByIdOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type CampanhaDetalheCacheEntry = {
  data: unknown;
  expiresAt: number;
};

const CAMPANHA_DETALHE_CACHE_TTL_MS = 30_000;
const campanhaDetalheCache = new Map<string, CampanhaDetalheCacheEntry>();
const campanhaDetalheInFlight = new Map<string, Promise<unknown>>();

export function apiInvalidateCampanhaDetalheCache(id?: number | string): void {
  if (id === undefined) {
    campanhaDetalheCache.clear();
    campanhaDetalheInFlight.clear();
    return;
  }

  const key = String(id);
  campanhaDetalheCache.delete(key);
  campanhaDetalheInFlight.delete(key);
}

export async function apiGetMinhasCampanhas(
  query?: MinhasCampanhasQuery,
): Promise<ListResult<CampanhaResumo>> {
  const params = new URLSearchParams();
  if (query?.page) params.set('page', String(query.page));
  if (query?.limit) params.set('limit', String(query.limit));

  const url =
    params.size > 0 ? `/campanhas/minhas?${params.toString()}` : '/campanhas/minhas';
  const { data } = await apiClient.get(url);
  return normalizeListResult<CampanhaResumo>(data);
}

export async function apiCreateCampanha(payload: {
  nome: string;
  descricao?: string;
}): Promise<CampanhaResumo> {
  const { data } = await apiClient.post('/campanhas', payload);
  return data;
}

export async function apiDeleteCampanha(id: number): Promise<void> {
  await apiClient.delete(`/campanhas/${id}`);
  apiInvalidateCampanhaDetalheCache(id);
}

export async function apiGetCampanhaById<T = unknown>(
  id: number | string,
  options: CampanhaByIdOptions = {},
): Promise<T> {
  const key = String(id);
  const ttlMs = options.cacheTtlMs ?? CAMPANHA_DETALHE_CACHE_TTL_MS;

  if (options.forceRefresh) {
    apiInvalidateCampanhaDetalheCache(key);
  } else {
    const cacheEntry = campanhaDetalheCache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data as T;
    }
  }

  const requestInFlight = campanhaDetalheInFlight.get(key);
  if (requestInFlight) {
    return (await requestInFlight) as T;
  }

  const request = apiClient
    .get(`/campanhas/${id}`)
    .then(({ data }) => {
      campanhaDetalheCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    })
    .finally(() => {
      campanhaDetalheInFlight.delete(key);
    });

  campanhaDetalheInFlight.set(key, request);
  return (await request) as T;
}

export async function apiCriarConvite(
  campanhaId: number,
  payload: { email: string; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' },
): Promise<ConviteCampanha> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/convites`, payload);
  return data;
}

export async function apiListarConvitesPendentes(): Promise<ConviteCampanha[]> {
  const { data } = await apiClient.get('/campanhas/convites/pendentes');
  return data;
}

export async function apiAceitarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/aceitar`);
}

export async function apiRecusarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/recusar`);
}
