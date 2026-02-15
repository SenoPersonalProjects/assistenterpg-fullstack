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
} from '@/lib/types'; // ✅ ATUALIZADO

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
): Promise<PreviewItensInventarioResponse> {
  console.log('[apiPreviewItensInventario] ============ ENTRADA ============');
  console.log('[apiPreviewItensInventario] Payload:', payload);

  const { data } = await apiClient.post('/inventario/preview', payload);

  console.log('[apiPreviewItensInventario] ============ RESPOSTA ============');
  console.log('[apiPreviewItensInventario] Data:', data);

  return data;
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
