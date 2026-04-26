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
  TecnicaAmaldicoadaCatalogo,
} from '@/lib/types';

type MeusPersonagensQuery = {
  page?: number;
  limit?: number;
};

type GetPersonagemBaseOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type PreviewPersonagemBaseOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type PersonagemBaseCacheEntry = {
  data: PersonagemBaseDetalhe;
  expiresAt: number;
};

type PersonagemBasePreviewCacheEntry = {
  data: PersonagemBasePreview;
  expiresAt: number;
};

const PERSONAGEM_BASE_CACHE_TTL_MS = 30_000;
const PERSONAGEM_BASE_PREVIEW_CACHE_TTL_MS = 10_000;
const PERSONAGEM_BASE_PREVIEW_CACHE_MAX_ENTRIES = 40;
const personagemBaseCache = new Map<string, PersonagemBaseCacheEntry>();
const personagemBaseInFlight = new Map<string, Promise<PersonagemBaseDetalhe>>();
const personagemBasePreviewCache = new Map<string, PersonagemBasePreviewCacheEntry>();
const personagemBasePreviewInFlight = new Map<string, Promise<PersonagemBasePreview>>();

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

export function apiInvalidatePersonagemBasePreviewCache(): void {
  personagemBasePreviewCache.clear();
  personagemBasePreviewInFlight.clear();
}

function personagemBasePreviewCacheKey(payload: CreatePersonagemBasePayload): string | null {
  try {
    return JSON.stringify(payload);
  } catch {
    return null;
  }
}

function limparCachePreviewLimite(): void {
  while (personagemBasePreviewCache.size > PERSONAGEM_BASE_PREVIEW_CACHE_MAX_ENTRIES) {
    const firstKey = personagemBasePreviewCache.keys().next().value;
    if (!firstKey) break;
    personagemBasePreviewCache.delete(firstKey);
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
  apiInvalidatePersonagemBasePreviewCache();
  return data;
}

export async function apiUpdatePersonagemBase(
  id: number,
  payload: UpdatePersonagemBasePayload,
): Promise<PersonagemBaseResumo> {
  const { data } = await apiClient.patch(`/personagens-base/${id}`, payload);
  apiInvalidatePersonagemBaseCache(id);
  apiInvalidatePersonagemBasePreviewCache();
  return data;
}

export async function apiGetTecnicaInataPropriaPersonagemBase(
  id: number,
): Promise<TecnicaAmaldicoadaCatalogo | null> {
  const { data } = await apiClient.get(`/personagens-base/${id}/tecnica-inata-propria`);
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiCriarHabilidadeTecnicaInataPropria(
  id: number,
  payload: Record<string, unknown>,
): Promise<TecnicaAmaldicoadaCatalogo | null> {
  const { data } = await apiClient.post(
    `/personagens-base/${id}/tecnica-inata-propria/habilidades`,
    payload,
  );
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiAtualizarHabilidadeTecnicaInataPropria(
  id: number,
  habilidadeId: number,
  payload: Record<string, unknown>,
): Promise<TecnicaAmaldicoadaCatalogo | null> {
  const { data } = await apiClient.patch(
    `/personagens-base/${id}/tecnica-inata-propria/habilidades/${habilidadeId}`,
    payload,
  );
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiCriarVariacaoTecnicaInataPropria(
  id: number,
  habilidadeId: number,
  payload: Record<string, unknown>,
): Promise<TecnicaAmaldicoadaCatalogo | null> {
  const { data } = await apiClient.post(
    `/personagens-base/${id}/tecnica-inata-propria/habilidades/${habilidadeId}/variacoes`,
    payload,
  );
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiAtualizarVariacaoTecnicaInataPropria(
  id: number,
  variacaoId: number,
  payload: Record<string, unknown>,
): Promise<TecnicaAmaldicoadaCatalogo | null> {
  const { data } = await apiClient.patch(
    `/personagens-base/${id}/tecnica-inata-propria/variacoes/${variacaoId}`,
    payload,
  );
  apiInvalidatePersonagemBaseCache(id);
  return data;
}

export async function apiDeletePersonagemBase(id: number): Promise<void> {
  await apiClient.delete(`/personagens-base/${id}`);
  apiInvalidatePersonagemBaseCache(id);
  apiInvalidatePersonagemBasePreviewCache();
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
  options: PreviewPersonagemBaseOptions = {},
): Promise<PersonagemBasePreview> {
  const key = personagemBasePreviewCacheKey(payload);
  const ttlMs = options.cacheTtlMs ?? PERSONAGEM_BASE_PREVIEW_CACHE_TTL_MS;

  if (!key) {
    const { data } = await apiClient.post('/personagens-base/preview', payload);
    return data;
  }

  if (options.forceRefresh) {
    personagemBasePreviewCache.delete(key);
    personagemBasePreviewInFlight.delete(key);
  } else {
    const cacheEntry = personagemBasePreviewCache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
  }

  const requestInFlight = personagemBasePreviewInFlight.get(key);
  if (requestInFlight) {
    return requestInFlight;
  }

  const request = apiClient
    .post('/personagens-base/preview', payload)
    .then(({ data }) => {
      personagemBasePreviewCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      limparCachePreviewLimite();
      return data as PersonagemBasePreview;
    })
    .finally(() => {
      personagemBasePreviewInFlight.delete(key);
    });

  personagemBasePreviewInFlight.set(key, request);
  return request;
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
