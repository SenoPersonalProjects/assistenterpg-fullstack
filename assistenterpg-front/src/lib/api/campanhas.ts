// lib/api/campanhas.ts
import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type { CampanhaResumo, ConviteCampanha } from '@/lib/types'; // ✅ ATUALIZADO

export async function apiGetMinhasCampanhas(): Promise<ListResult<CampanhaResumo>> {
  const { data } = await apiClient.get('/campanhas/minhas');
  return normalizeListResult<CampanhaResumo>(data);
}

export async function apiCreateCampanha(payload: {
  nome: string;
  descricao?: string;
}): Promise<CampanhaResumo> {
  const { data } = await apiClient.post('/campanhas', payload);
  return data;
}

export async function apiDeleteCampanha(id: number): Promise<void> {
  await apiClient.delete(`/campanhas/${id}`);
}

export async function apiGetCampanhaById<T = unknown>(id: number | string): Promise<T> {
  const { data } = await apiClient.get(`/campanhas/${id}`);
  return data as T;
}

export async function apiCriarConvite(
  campanhaId: number,
  payload: { email: string; papel: 'MESTRE' | 'JOGADOR' | 'OBSERVADOR' },
): Promise<ConviteCampanha> {
  const { data } = await apiClient.post(`/campanhas/${campanhaId}/convites`, payload);
  return data;
}

export async function apiListarConvitesPendentes(): Promise<ConviteCampanha[]> {
  const { data } = await apiClient.get('/campanhas/convites/pendentes');
  return data;
}

export async function apiAceitarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/aceitar`);
}

export async function apiRecusarConvite(codigo: string): Promise<void> {
  await apiClient.post(`/campanhas/convites/${codigo}/recusar`);
}
