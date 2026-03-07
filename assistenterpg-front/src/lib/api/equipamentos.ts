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

export async function apiGetEquipamentoDetalhado(id: number): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/${id}`);
  return data;
}

export async function apiGetEquipamentoPorCodigo(codigo: string): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/codigo/${codigo}`);
  return data;
}
