// lib/api/modificacoes.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type { FiltrarModificacoesDto, ModificacaoCatalogo } from '@/lib/types';

const MODIFICACOES_DEFAULT_PAGE = 1;
const MODIFICACOES_DEFAULT_LIMIT = 50;

type RawRestricoesModificacao = {
  apenasAmaldicoados?: boolean;
  complexidadeMinima?: string | null;
};

type RawModificacao = Partial<ModificacaoCatalogo> & {
  id?: number;
  codigo?: string;
  nome?: string;
  tipo?: string;
  descricao?: string | null;
  incrementoEspacos?: number;
  restricoes?: RawRestricoesModificacao | null;
  efeitosMecanicos?: unknown;
  requisitos?: unknown;
  fonte?: string;
  suplementoId?: number | null;
};

function buildModificacoesQuery(filtros?: FiltrarModificacoesDto): string {
  const params = new URLSearchParams();

  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.fontes?.length) params.append('fontes', filtros.fontes.join(','));
  if (filtros?.suplementoId !== undefined) params.append('suplementoId', filtros.suplementoId.toString());
  if (filtros?.busca) params.append('busca', filtros.busca);

  params.append('pagina', (filtros?.pagina ?? MODIFICACOES_DEFAULT_PAGE).toString());
  params.append('limite', (filtros?.limite ?? MODIFICACOES_DEFAULT_LIMIT).toString());

  return params.toString();
}

export async function apiGetModificacoes(
  filtros?: FiltrarModificacoesDto,
): Promise<ListResult<ModificacaoCatalogo>> {
  const query = buildModificacoesQuery(filtros);
  const { data } = await apiClient.get(`/modificacoes?${query}`);
  const normalized = normalizeListResult<RawModificacao>(data);

  const items: ModificacaoCatalogo[] = normalized.items.map((mod) => ({
    id: mod.id ?? 0,
    codigo: mod.codigo ?? '',
    nome: mod.nome ?? '',
    tipo: mod.tipo ?? 'DESCONHECIDO',
    descricao: mod.descricao ?? null,
    incrementoEspacos: mod.incrementoEspacos ?? 0,
    apenasAmaldicoadas: mod.restricoes?.apenasAmaldicoados ?? false,
    requerComplexidade: mod.restricoes?.complexidadeMinima ?? null,
    efeitosMecanicos: mod.efeitosMecanicos,
    requisitos: mod.requisitos,
    fonte: mod.fonte,
    suplementoId: mod.suplementoId ?? null,
  }));

  return { ...normalized, items };
}

export async function apiGetModificacaoDetalhada(id: number): Promise<ModificacaoCatalogo> {
  const { data } = await apiClient.get(`/modificacoes/${id}`);

  return {
    id: data.id,
    codigo: data.codigo,
    nome: data.nome,
    tipo: data.tipo,
    descricao: data.descricao ?? null,
    incrementoEspacos: data.incrementoEspacos ?? 0,
    apenasAmaldicoadas: data.restricoes?.apenasAmaldicoados ?? false,
    requerComplexidade: data.restricoes?.complexidadeMinima ?? null,
    efeitosMecanicos: data.efeitosMecanicos,
    requisitos: data.requisitos,
    fonte: data.fonte,
    suplementoId: data.suplementoId ?? null,
  };
}

export async function apiGetModificacoesCompativeis(
  equipamentoId: number,
): Promise<ModificacaoCatalogo[]> {
  const { data } = await apiClient.get(`/modificacoes/equipamento/${equipamentoId}/compativeis`);
  const lista = Array.isArray(data) ? data : [];

  return lista.map((mod: RawModificacao) => ({
    id: mod.id ?? 0,
    codigo: mod.codigo ?? '',
    nome: mod.nome ?? '',
    tipo: mod.tipo ?? 'DESCONHECIDO',
    descricao: mod.descricao ?? null,
    incrementoEspacos: mod.incrementoEspacos ?? 0,
    apenasAmaldicoadas: mod.restricoes?.apenasAmaldicoados ?? false,
    requerComplexidade: mod.restricoes?.complexidadeMinima ?? null,
    efeitosMecanicos: mod.efeitosMecanicos,
    requisitos: mod.requisitos,
    fonte: mod.fonte,
    suplementoId: mod.suplementoId ?? null,
  }));
}
