// lib/api/personagens-base.ts
import { apiClient } from './axios-client';
import type {
  PersonagemBaseResumo,
  PersonagemBaseCriado,
  PersonagemBasePreview,
  PersonagemBaseDetalhe,
  CreatePersonagemBasePayload,
  UpdatePersonagemBasePayload,
  InfoGrausTreinamento,
  PericiaElegivelTreinamento,
} from '@/lib/types'; // ✅ ATUALIZADO

export async function apiGetMeusPersonagensBase(): Promise<PersonagemBaseResumo[]> {
  const { data } = await apiClient.get('/personagens-base/meus');
  return data;
}

export async function apiGetPersonagemBase(
  id: number,
  incluirInventario = true,
): Promise<PersonagemBaseDetalhe> {
  const params = new URLSearchParams();
  if (incluirInventario) {
    params.append('incluirInventario', 'true');
  }

  const { data } = await apiClient.get(`/personagens-base/${id}?${params.toString()}`);
  return data;
}

export async function apiCreatePersonagemBase(
  payload: CreatePersonagemBasePayload,
): Promise<PersonagemBaseCriado> {
  const { data } = await apiClient.post('/personagens-base', payload);
  return data;
}

export async function apiUpdatePersonagemBase(
  id: number,
  payload: UpdatePersonagemBasePayload,
): Promise<PersonagemBaseResumo> {
  const { data } = await apiClient.patch(`/personagens-base/${id}`, payload);
  return data;
}

export async function apiDeletePersonagemBase(id: number): Promise<void> {
  await apiClient.delete(`/personagens-base/${id}`);
}

export async function apiPreviewPersonagemBase(
  payload: CreatePersonagemBasePayload,
): Promise<PersonagemBasePreview> {
  const { data } = await apiClient.post('/personagens-base/preview', payload);
  return data;
}

export async function apiGetInfoGrausTreinamento(
  nivel: number,
  intelecto: number,
): Promise<InfoGrausTreinamento> {
  const { data } = await apiClient.get(
    `/personagens-base/graus-treinamento/info?nivel=${nivel}&intelecto=${intelecto}`,
  );
  return data;
}

export async function apiGetPericiasElegiveisTreinamento(
  periciasComGrauInicial: string[],
): Promise<PericiaElegivelTreinamento[]> {
  const { data } = await apiClient.post('/personagens-base/graus-treinamento/pericias-elegiveis', {
    periciasComGrauInicial,
  });
  return data;
}
