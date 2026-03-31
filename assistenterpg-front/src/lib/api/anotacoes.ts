import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  AnotacaoResumo,
  CriarAnotacaoPayload,
  AtualizarAnotacaoPayload,
} from '@/lib/types';

export type FiltrarAnotacoesDto = {
  campanhaId?: number;
  sessaoId?: number;
  pagina?: number;
  limite?: number;
};

export async function apiListarAnotacoes(
  filtros: FiltrarAnotacoesDto = {},
): Promise<ListResult<AnotacaoResumo>> {
  const params = new URLSearchParams();
  if (filtros.campanhaId) params.set('campanhaId', String(filtros.campanhaId));
  if (filtros.sessaoId) params.set('sessaoId', String(filtros.sessaoId));
  if (filtros.pagina) params.set('page', String(filtros.pagina));
  if (filtros.limite) params.set('limit', String(filtros.limite));

  const url = params.size > 0 ? `/anotacoes?${params.toString()}` : '/anotacoes';
  const { data } = await apiClient.get(url);
  return normalizeListResult<AnotacaoResumo>(data);
}

export async function apiCriarAnotacao(
  payload: CriarAnotacaoPayload,
): Promise<AnotacaoResumo> {
  const { data } = await apiClient.post('/anotacoes', payload);
  return data;
}

export async function apiAtualizarAnotacao(
  id: number,
  payload: AtualizarAnotacaoPayload,
): Promise<AnotacaoResumo> {
  const { data } = await apiClient.patch(`/anotacoes/${id}`, payload);
  return data;
}

export async function apiExcluirAnotacao(id: number): Promise<void> {
  await apiClient.delete(`/anotacoes/${id}`);
}
