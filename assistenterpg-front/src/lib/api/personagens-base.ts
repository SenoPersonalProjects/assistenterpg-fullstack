// lib/api/personagens-base.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  PersonagemBaseResumo,
  PersonagemBaseCriado,
  PersonagemBasePreview,
  PersonagemBaseDetalhe,
  PersonagemBaseExportResponse,
  PersonagemBaseImportRequest,
  PersonagemBaseImportResponse,
  CreatePersonagemBasePayload,
  UpdatePersonagemBasePayload,
  InfoGrausTreinamento,
  PericiaElegivelTreinamento,
} from '@/lib/types';

type MeusPersonagensQuery = {
  page?: number;
  limit?: number;
};

type GetPersonagemBaseOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type PersonagemBaseCacheEntry = {
  data: PersonagemBaseDetalhe;
  expiresAt: number;
};

const PERSONAGEM_BASE_CACHE_TTL_MS = 30_000;
const personagemBaseCache = new Map<string, PersonagemBaseCacheEntry>();
const personagemBaseInFlight = new Map<string, Promise<PersonagemBaseDetalhe>>();

function personagemBaseCacheKey(id: number, incluirInventario: boolean): string {
  return `${id}:${incluirInventario ? 'inventario' : 'basico'}`;
}

export function apiInvalidatePersonagemBaseCache(id?: number): void {
  if (id === undefined) {
    personagemBaseCache.clear();
    personagemBaseInFlight.clear();
    return;
  }

  const prefix = `${id}:`;
  for (const key of personagemBaseCache.keys()) {
    if (key.startsWith(prefix)) {
      personagemBaseCache.delete(key);
    }
  }

  for (const key of personagemBaseInFlight.keys()) {
    if (key.startsWith(prefix)) {
      personagemBaseInFlight.delete(key);
    }
  }
}

export async function apiGetMeusPersonagensBase(
  query?: MeusPersonagensQuery,
): Promise<ListResult<PersonagemBaseResumo>> {
  const params = new URLSearchParams();
  if (query?.page) params.set('page', String(query.page));
  if (query?.limit) params.set('limit', String(query.limit));

  const url =
    params.size > 0
      ? `/personagens-base/meus?${params.toString()}`
      : '/personagens-base/meus';
  const { data } = await apiClient.get(url);
  return normalizeListResult<PersonagemBaseResumo>(data);
}

export async function apiGetPersonagemBase(
  id: number,
  incluirInventario = true,
  options: GetPersonagemBaseOptions = {},
): Promise<PersonagemBaseDetalhe> {
  const key = personagemBaseCacheKey(id, incluirInventario);
  const ttlMs = options.cacheTtlMs ?? PERSONAGEM_BASE_CACHE_TTL_MS;

  if (options.forceRefresh) {
    personagemBaseCache.delete(key);
  } else {
    const cacheEntry = personagemBaseCache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
  }

  const requestInFlight = personagemBaseInFlight.get(key);
  if (requestInFlight) {
    return requestInFlight;
  }

  const params = new URLSearchParams();
  if (incluirInventario) {
    params.append('incluirInventario', 'true');
  }

  const query = params.toString();
  const url = query ? `/personagens-base/${id}?${query}` : `/personagens-base/${id}`;

  const request = apiClient
    .get(url)
    .then(({ data }) => {
      personagemBaseCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data as PersonagemBaseDetalhe;
    })
    .finally(() => {
      personagemBaseInFlight.delete(key);
    });

  personagemBaseInFlight.set(key, request);
  return request;
}

export async function apiCreatePersonagemBase(
  payload: CreatePersonagemBasePayload,
): Promise<PersonagemBaseCriado> {
  const { data } = await apiClient.post('/personagens-base', payload);
  return data;
}

export async function apiUpdatePersonagemBase(
  id: number,
  payload: UpdatePersonagemBasePayload,
): Promise<PersonagemBaseResumo> {
  const { data } = await apiClient.patch(`/personagens-base/${id}`, payload);
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiDeletePersonagemBase(id: number): Promise<void> {
  await apiClient.delete(`/personagens-base/${id}`);
  apiInvalidatePersonagemBaseCache(id);
}

export async function apiExportarPersonagemBase(id: number): Promise<PersonagemBaseExportResponse> {
  const { data } = await apiClient.get(`/personagens-base/${id}/exportar`);
  return data;
}

export async function apiImportarPersonagemBase(
  payload: PersonagemBaseImportRequest,
): Promise<PersonagemBaseImportResponse> {
  const { data } = await apiClient.post('/personagens-base/importar', {
    ...payload,
    nomeSobrescrito: payload.nomeSobrescrito?.trim() || undefined,
  });
  return data;
}

export async function apiPreviewPersonagemBase(
  payload: CreatePersonagemBasePayload,
): Promise<PersonagemBasePreview> {
  const { data } = await apiClient.post('/personagens-base/preview', payload);
  return data;
}

export async function apiGetInfoGrausTreinamento(
  nivel: number,
  intelecto: number,
): Promise<InfoGrausTreinamento> {
  const { data } = await apiClient.get(
    `/personagens-base/graus-treinamento/info?nivel=${nivel}&intelecto=${intelecto}`,
  );
  return data;
}

export async function apiGetPericiasElegiveisTreinamento(
  periciasComGrauInicial: string[],
): Promise<PericiaElegivelTreinamento[]> {
  const { data } = await apiClient.post('/personagens-base/graus-treinamento/pericias-elegiveis', {
    periciasComGrauInicial,
  });
  return data;
}
