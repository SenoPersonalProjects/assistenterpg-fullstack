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

export type NpcAmeacaGrupoResumo = {
  id: number;
  nome: string;
  descricao?: string | null;
  quantidadeItens: number;
  npcAmeacaIds: number[];
  criadoEm?: string;
  atualizadoEm?: string;
};

export type NpcAmeacaGrupoDetalhe = NpcAmeacaGrupoResumo & {
  npcsAmeacas: NpcAmeacaResumo[];
};

export type CreateNpcAmeacaGrupoDto = {
  nome: string;
  descricao?: string;
  npcAmeacaIds?: number[];
};

export type UpdateNpcAmeacaGrupoDto = Partial<CreateNpcAmeacaGrupoDto>;

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

export async function apiListarGruposNpcAmeaca(): Promise<NpcAmeacaGrupoResumo[]> {
  const { data } = await apiClient.get('/npcs-ameacas/grupos');
  return Array.isArray(data) ? data : [];
}

export async function apiGetGrupoNpcAmeaca(
  id: number,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.get(`/npcs-ameacas/grupos/${id}`);
  return data;
}

export async function apiCreateGrupoNpcAmeaca(
  payload: CreateNpcAmeacaGrupoDto,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.post('/npcs-ameacas/grupos', payload);
  return data;
}

export async function apiUpdateGrupoNpcAmeaca(
  id: number,
  payload: UpdateNpcAmeacaGrupoDto,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.patch(`/npcs-ameacas/grupos/${id}`, payload);
  return data;
}

export async function apiDeleteGrupoNpcAmeaca(id: number): Promise<void> {
  await apiClient.delete(`/npcs-ameacas/grupos/${id}`);
}

export async function apiExportarNpcAmeaca(id: number): Promise<unknown> {
  const { data } = await apiClient.get(`/npcs-ameacas/${id}/exportar`);
  return data;
}

export async function apiExportarGrupoNpcAmeaca(id: number): Promise<unknown> {
  const { data } = await apiClient.get(`/npcs-ameacas/grupos/${id}/exportar`);
  return data;
}
