// lib/api/inventario.ts
import { apiClient } from './axios-client';
import type {
  InventarioCompletoDto,
  ItemInventarioDto,
  PreviewItemDto,
  PreviewAdicionarItemResponse,
  PreviewItensInventarioPayload,
  PreviewItensInventarioResponse,
  AdicionarItemDto,
  AtualizarItemDto,
  AplicarModificacaoDto,
  RemoverModificacaoDto,
} from '@/lib/types';

type PreviewItensInventarioOptions = {
  forceRefresh?: boolean;
  cacheTtlMs?: number;
};

type PreviewItensInventarioRequest = Omit<PreviewItensInventarioPayload, 'itens'> & {
  itens: Array<{
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    modificacoes?: number[];
    nomeCustomizado?: string;
    estado?: {
      periciaCodigo?: string | null;
    };
  }>;
};

type PreviewItensInventarioCacheEntry = {
  data: PreviewItensInventarioResponse;
  expiresAt: number;
};

const PREVIEW_ITENS_INVENTARIO_CACHE_TTL_MS = 10_000;
const PREVIEW_ITENS_INVENTARIO_CACHE_MAX_ENTRIES = 50;
const previewItensInventarioCache = new Map<string, PreviewItensInventarioCacheEntry>();
const previewItensInventarioInFlight = new Map<string, Promise<PreviewItensInventarioResponse>>();

function previewItensInventarioCacheKey(payload: PreviewItensInventarioPayload): string | null {
  try {
    return JSON.stringify(payload);
  } catch {
    return null;
  }
}

function limparCachePreviewInventarioLimite(): void {
  while (previewItensInventarioCache.size > PREVIEW_ITENS_INVENTARIO_CACHE_MAX_ENTRIES) {
    const firstKey = previewItensInventarioCache.keys().next().value;
    if (!firstKey) break;
    previewItensInventarioCache.delete(firstKey);
  }
}

export function apiInvalidatePreviewItensInventarioCache(): void {
  previewItensInventarioCache.clear();
  previewItensInventarioInFlight.clear();
}

export async function apiGetInventarioCompleto(
  personagemBaseId: number,
): Promise<InventarioCompletoDto> {
  const { data } = await apiClient.get(`/inventario/personagem/${personagemBaseId}`);
  return data;
}

export async function apiPreviewAdicionarItem(
  dto: PreviewItemDto,
): Promise<PreviewAdicionarItemResponse> {
  const { data } = await apiClient.post('/inventario/preview-adicionar', dto);
  return data;
}

export async function apiPreviewItensInventario(
  payload: PreviewItensInventarioPayload,
  options: PreviewItensInventarioOptions = {},
): Promise<PreviewItensInventarioResponse> {
  const payloadSanitizado: PreviewItensInventarioRequest = {
    ...payload,
    itens: payload.itens.map((item) => ({
      equipamentoId: item.equipamentoId,
      quantidade: item.quantidade,
      equipado: item.equipado,
      modificacoes: (item as { modificacoes?: number[] }).modificacoes
        ? (item as { modificacoes?: number[] }).modificacoes
        : (item as { modificacoesIds?: number[] }).modificacoesIds ?? [],
      nomeCustomizado: item.nomeCustomizado ?? undefined,
      estado: item.estado ?? undefined,
    })),
  };

  const key = previewItensInventarioCacheKey(payload);
  const ttlMs = options.cacheTtlMs ?? PREVIEW_ITENS_INVENTARIO_CACHE_TTL_MS;

  if (!key) {
    const { data } = await apiClient.post('/inventario/preview', payloadSanitizado);
    return data;
  }

  if (options.forceRefresh) {
    previewItensInventarioCache.delete(key);
    previewItensInventarioInFlight.delete(key);
  } else {
    const cacheEntry = previewItensInventarioCache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
  }

  const requestInFlight = previewItensInventarioInFlight.get(key);
  if (requestInFlight) {
    return requestInFlight;
  }

  const request = apiClient
    .post('/inventario/preview', payloadSanitizado)
    .then(({ data }) => {
      previewItensInventarioCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      limparCachePreviewInventarioLimite();
      return data as PreviewItensInventarioResponse;
    })
    .finally(() => {
      previewItensInventarioInFlight.delete(key);
    });

  previewItensInventarioInFlight.set(key, request);
  return request;
}

export async function apiAdicionarItem(dto: AdicionarItemDto): Promise<ItemInventarioDto> {
  const { data } = await apiClient.post('/inventario/adicionar', dto);
  return data;
}

export async function apiAtualizarItem(
  itemId: number,
  dto: AtualizarItemDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.patch(`/inventario/item/${itemId}`, dto);
  return data;
}

export async function apiRemoverItem(itemId: number): Promise<void> {
  await apiClient.delete(`/inventario/item/${itemId}`);
}

export async function apiAplicarModificacao(
  dto: AplicarModificacaoDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.post('/inventario/aplicar-modificacao', dto);
  return data;
}

export async function apiRemoverModificacao(
  dto: RemoverModificacaoDto,
): Promise<ItemInventarioDto> {
  const { data } = await apiClient.post('/inventario/remover-modificacao', dto);
  return data;
}
