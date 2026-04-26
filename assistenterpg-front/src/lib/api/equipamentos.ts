// lib/api/equipamentos.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  EquipamentoCatalogo,
  EquipamentoDetalhadoDto,
  FiltrarEquipamentosDto,
} from '@/lib/types';

const EQUIPAMENTOS_DEFAULT_PAGE = 1;
const EQUIPAMENTOS_DEFAULT_LIMIT = 20;

type FiltrarTodosEquipamentosDto = Omit<FiltrarEquipamentosDto, 'pagina' | 'limite'> & {
  limitePorPagina?: number;
};

function buildEquipamentosQuery(filtros?: FiltrarEquipamentosDto): string {
  const params = new URLSearchParams();

  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.complexidadeMaldicao) params.append('complexidadeMaldicao', filtros.complexidadeMaldicao);
  if (filtros?.proficienciaArma) params.append('proficienciaArma', filtros.proficienciaArma);
  if (filtros?.proficienciaProtecao) params.append('proficienciaProtecao', filtros.proficienciaProtecao);
  if (filtros?.alcance) params.append('alcance', filtros.alcance);
  if (filtros?.tipoAcessorio) params.append('tipoAcessorio', filtros.tipoAcessorio);
  if (filtros?.categoria !== undefined) params.append('categoria', filtros.categoria.toString());
  if (filtros?.apenasAmaldicoados) params.append('apenasAmaldicoados', 'true');
  if (filtros?.fontes?.length) params.append('fontes', filtros.fontes.join(','));
  if (filtros?.suplementoId !== undefined) params.append('suplementoId', filtros.suplementoId.toString());
  if (filtros?.busca) params.append('busca', filtros.busca);

  params.append('pagina', (filtros?.pagina ?? EQUIPAMENTOS_DEFAULT_PAGE).toString());
  params.append('limite', (filtros?.limite ?? EQUIPAMENTOS_DEFAULT_LIMIT).toString());

  return params.toString();
}

export async function apiGetEquipamentos(
  filtros?: FiltrarEquipamentosDto,
): Promise<ListResult<EquipamentoCatalogo>> {
  const query = buildEquipamentosQuery(filtros);
  const { data } = await apiClient.get(`/equipamentos?${query}`);
  return normalizeListResult<EquipamentoCatalogo>(data);
}

export async function apiGetMeusEquipamentosHomebrew(): Promise<EquipamentoCatalogo[]> {
  const { data } = await apiClient.get('/equipamentos/meus-homebrew');
  return Array.isArray(data) ? data : [];
}

export async function apiGetTodosEquipamentos(
  filtros?: FiltrarTodosEquipamentosDto,
): Promise<EquipamentoCatalogo[]> {
  const { limitePorPagina = 100, ...filtrosBase } = filtros ?? {};
  const primeiraPagina = await apiGetEquipamentos({
    ...filtrosBase,
    pagina: 1,
    limite: limitePorPagina,
  });

  const itens = Array.isArray(primeiraPagina.items) ? [...primeiraPagina.items] : [];
  const totalPages = Math.max(1, primeiraPagina.totalPages || 1);

  if (totalPages <= 1) {
    return itens;
  }

  const promessasPaginas: Promise<ListResult<EquipamentoCatalogo>>[] = [];
  for (let pagina = 2; pagina <= totalPages; pagina++) {
    promessasPaginas.push(
      apiGetEquipamentos({
        ...filtrosBase,
        pagina,
        limite: limitePorPagina,
      }),
    );
  }

  const respostas = await Promise.all(promessasPaginas);
  for (const resposta of respostas) {
    if (Array.isArray(resposta.items) && resposta.items.length > 0) {
      itens.push(...resposta.items);
    }
  }

  return itens;
}

export async function apiGetEquipamentoDetalhado(id: number): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/${id}`);
  return data;
}

export async function apiGetEquipamentoPorCodigo(codigo: string): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/codigo/${codigo}`);
  return data;
}
