import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  CreateNpcAmeacaPayload,
  NpcAmeacaDetalhe,
  NpcAmeacaResumo,
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
  UpdateNpcAmeacaPayload,
} from '@/lib/types';

export type ListarNpcsAmeacasQuery = {
  page?: number;
  limit?: number;
  nome?: string;
  fichaTipo?: TipoFichaNpcAmeaca;
  tipo?: TipoNpcAmeaca;
  tamanho?: TamanhoNpcAmeaca;
};

function montarQueryString(query: ListarNpcsAmeacasQuery = {}): string {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.nome?.trim()) params.set('nome', query.nome.trim());
  if (query.fichaTipo) params.set('fichaTipo', query.fichaTipo);
  if (query.tipo) params.set('tipo', query.tipo);
  if (query.tamanho) params.set('tamanho', query.tamanho);

  return params.toString();
}

export async function apiGetMeusNpcsAmeacas(
  query?: ListarNpcsAmeacasQuery,
): Promise<ListResult<NpcAmeacaResumo>> {
  const search = montarQueryString(query);
  const url = search ? `/npcs-ameacas/meus?${search}` : '/npcs-ameacas/meus';
  const { data } = await apiClient.get(url);
  return normalizeListResult<NpcAmeacaResumo>(data);
}

export async function apiGetNpcAmeaca(id: number): Promise<NpcAmeacaDetalhe> {
  const { data } = await apiClient.get(`/npcs-ameacas/${id}`);
  return data;
}

export async function apiCreateNpcAmeaca(
  payload: CreateNpcAmeacaPayload,
): Promise<NpcAmeacaDetalhe> {
  const { data } = await apiClient.post('/npcs-ameacas', payload);
  return data;
}

export async function apiUpdateNpcAmeaca(
  id: number,
  payload: UpdateNpcAmeacaPayload,
): Promise<NpcAmeacaDetalhe> {
  const { data } = await apiClient.patch(`/npcs-ameacas/${id}`, payload);
  return data;
}

export async function apiDeleteNpcAmeaca(
  id: number,
): Promise<{ message: string; id: number }> {
  const { data } = await apiClient.delete(`/npcs-ameacas/${id}`);
  return data;
}
