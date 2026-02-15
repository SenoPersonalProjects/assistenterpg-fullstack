// src/lib/api/suplementos.ts

import { apiClient } from './axios-client';
import type { SuplementoCatalogo, SuplementoStatus } from '@/lib/types/suplemento.types';
export type { SuplementoCatalogo, SuplementoStatus } from '@/lib/types/suplemento.types';

/**
 * DTO de Suplemento (baseado no backend)
 */

/**
 * Filtros para listagem
 */
export type FiltrarSuplementosDto = {
  nome?: string;
  codigo?: string;
  status?: SuplementoStatus;
  autor?: string;
  apenasAtivos?: boolean;
};

/**
 * ✅ Listar todos os suplementos (com filtros)
 */
export async function apiGetSuplementos(
  filtros?: FiltrarSuplementosDto
): Promise<SuplementoCatalogo[]> {
  const params = new URLSearchParams();
  
  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.codigo) params.append('codigo', filtros.codigo);
  if (filtros?.status) params.append('status', filtros.status);
  if (filtros?.autor) params.append('autor', filtros.autor);
  if (filtros?.apenasAtivos) params.append('apenasAtivos', 'true');

  const { data } = await apiClient.get(
    `/suplementos?${params.toString()}`
  );
  return data;
}

/**
 * ✅ Buscar suplemento por ID
 */
export async function apiGetSuplemento(id: number): Promise<SuplementoCatalogo> {
  const { data } = await apiClient.get(`/suplementos/${id}`);
  return data;
}

/**
 * ✅ Buscar suplemento por código
 */
export async function apiGetSuplementoByCodigo(codigo: string): Promise<SuplementoCatalogo> {
  const { data } = await apiClient.get(`/suplementos/codigo/${codigo}`);
  return data;
}

/**
 * ✅ Listar suplementos ativos do usuário logado
 */
export async function apiGetMeusSuplementosAtivos(): Promise<SuplementoCatalogo[]> {
  const { data } = await apiClient.get('/suplementos/me/ativos');
  return data;
}

/**
 * ✅ Ativar suplemento
 */
export async function apiAtivarSuplemento(id: number): Promise<void> {
  await apiClient.post(`/suplementos/${id}/ativar`);
}

/**
 * ✅ Desativar suplemento
 */
export async function apiDesativarSuplemento(id: number): Promise<void> {
  await apiClient.delete(`/suplementos/${id}/desativar`);
}

/**
 * ✅ ADMIN: Criar suplemento
 */
export async function apiCreateSuplemento(payload: {
  codigo: string;
  nome: string;
  descricao?: string;
  versao?: string;
  status?: SuplementoStatus;
  icone?: string;
  banner?: string;
  tags?: string[];
  autor?: string;
}): Promise<SuplementoCatalogo> {
  const { data } = await apiClient.post('/suplementos', payload);
  return data;
}

/**
 * ✅ ADMIN: Atualizar suplemento
 */
export async function apiUpdateSuplemento(
  id: number,
  payload: Partial<{
    nome: string;
    descricao?: string;
    versao?: string;
    status?: SuplementoStatus;
    icone?: string;
    banner?: string;
    tags?: string[];
    autor?: string;
  }>
): Promise<SuplementoCatalogo> {
  const { data } = await apiClient.patch(`/suplementos/${id}`, payload);
  return data;
}

/**
 * ✅ ADMIN: Deletar suplemento
 */
export async function apiDeleteSuplemento(id: number): Promise<void> {
  await apiClient.delete(`/suplementos/${id}`);
}
