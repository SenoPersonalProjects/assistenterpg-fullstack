// lib/api/modificacoes.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type { ModificacaoCatalogo, FiltrarModificacoesDto } from '@/lib/types';

const MODIFICACOES_DEFAULT_PAGE = 1;
const MODIFICACOES_DEFAULT_LIMIT = 50;

type RawModificacao = Partial<ModificacaoCatalogo> & {
  id?: number;
  codigo?: string;
  nome?: string;
  tipo?: string;
  descricao?: string | null;
  incrementoEspacos?: number;
  apenasAmaldicoadas?: boolean;
  requerComplexidade?: string | null;
  efeitosMecanicos?: unknown;
  requisitos?: unknown;
};

function buildModificacoesQuery(filtros?: FiltrarModificacoesDto): string {
  const params = new URLSearchParams();

  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.apenasAmaldicoadas) params.append('apenasAmaldicoadas', 'true');
  if (filtros?.requerComplexidade) params.append('requerComplexidade', filtros.requerComplexidade);
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
  const normalized = normalizeListResult<any>(data);

  const items: ModificacaoCatalogo[] = normalized.items.map((mod: any) => ({
    id: mod.id,
    codigo: mod.codigo,
    nome: mod.nome,
    tipo: mod.tipo,
    descricao: mod.descricao ?? null,
    incrementoEspacos: mod.incrementoEspacos ?? 0,
    apenasAmaldicoadas: mod.apenasAmaldicoadas ?? false,
    requerComplexidade: mod.requerComplexidade ?? null,
    efeitosMecanicos: mod.efeitosMecanicos,
    requisitos: mod.requisitos,
  }));

  return { ...normalized, items };
}

export async function apiGetModificacaoDetalhada(id: number): Promise<ModificacaoCatalogo> {
  const { data } = await apiClient.get(`/modificacoes/${id}`);
  return data;
}

export async function apiGetModificacoesCompativeis(
  equipamentoId: number,
): Promise<ModificacaoCatalogo[]> {
  const { data } = await apiClient.get(`/modificacoes/equipamento/${equipamentoId}/compativeis`);
  return data;
}
