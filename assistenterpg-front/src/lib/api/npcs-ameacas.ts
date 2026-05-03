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

export type ImportarNpcAmeacaJsonPayload = {
  exportType: 'npc-ameaca' | 'npc-ameaca-group';
  schemaVersion: number;
  exportedAt?: string;
  item?: Record<string, unknown>;
  group?: Record<string, unknown>;
  items?: Record<string, unknown>[];
};

export type ImportacaoNpcAmeacaResultado = {
  importType: 'npc-ameaca' | 'npc-ameaca-group';
  importedCount: number;
  ids: number[];
  item?: {
    id: number;
    nome: string;
  };
  group?: {
    id: number;
    nome: string;
  };
  items?: Array<{
    id: number;
    nome: string;
  }>;
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

type NpcAmeacaGrupoApiResponse = {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  quantidadeItens?: number;
  itens?: NpcAmeacaResumo[];
};

function mapearGrupoNpcAmeaca(
  grupo: NpcAmeacaGrupoApiResponse,
): NpcAmeacaGrupoDetalhe {
  const npcsAmeacas = Array.isArray(grupo.itens) ? grupo.itens : [];
  return {
    id: grupo.id,
    nome: grupo.nome,
    descricao: grupo.descricao ?? null,
    criadoEm: grupo.criadoEm,
    atualizadoEm: grupo.atualizadoEm,
    quantidadeItens: grupo.quantidadeItens ?? npcsAmeacas.length,
    npcAmeacaIds: npcsAmeacas.map((item) => item.id),
    npcsAmeacas,
  };
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
  return Array.isArray(data)
    ? data.map((grupo) => mapearGrupoNpcAmeaca(grupo as NpcAmeacaGrupoApiResponse))
    : [];
}

export async function apiGetGrupoNpcAmeaca(
  id: number,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.get(`/npcs-ameacas/grupos/${id}`);
  return mapearGrupoNpcAmeaca(data as NpcAmeacaGrupoApiResponse);
}

export async function apiCreateGrupoNpcAmeaca(
  payload: CreateNpcAmeacaGrupoDto,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.post('/npcs-ameacas/grupos', payload);
  return mapearGrupoNpcAmeaca(data as NpcAmeacaGrupoApiResponse);
}

export async function apiUpdateGrupoNpcAmeaca(
  id: number,
  payload: UpdateNpcAmeacaGrupoDto,
): Promise<NpcAmeacaGrupoDetalhe> {
  const { data } = await apiClient.patch(`/npcs-ameacas/grupos/${id}`, payload);
  return mapearGrupoNpcAmeaca(data as NpcAmeacaGrupoApiResponse);
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

export async function apiImportarNpcAmeacaJson(
  payload: ImportarNpcAmeacaJsonPayload,
): Promise<ImportacaoNpcAmeacaResultado> {
  const { data } = await apiClient.post('/npcs-ameacas/importar', payload);
  return data;
}
