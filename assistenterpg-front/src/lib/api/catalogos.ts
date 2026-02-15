// lib/api/catalogos.ts
import { apiClient } from './axios-client';
import type {
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  ProficienciaCatalogo,
  PericiaCatalogo,
  TipoGrauCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  TecnicaInataCatalogo,
  AlinhamentoCatalogo,
  PoderGenericoCatalogo,
  PassivasDisponiveisResponse,
} from '@/lib/types'; // ✅ ATUALIZADO

export async function apiGetClasses(): Promise<ClasseCatalogo[]> {
  const { data } = await apiClient.get('/classes');
  return data;
}

export async function apiGetClas(): Promise<ClaCatalogo[]> {
  const { data } = await apiClient.get('/clas');
  return data;
}

export async function apiGetOrigens(): Promise<OrigemCatalogo[]> {
  const { data } = await apiClient.get('/origens');
  return data;
}

export async function apiGetProficiencias(): Promise<ProficienciaCatalogo[]> {
  const { data } = await apiClient.get('/proficiencias');
  return data;
}

export async function apiGetPericias(): Promise<PericiaCatalogo[]> {
  const { data } = await apiClient.get('/pericias');
  return data;
}

export async function apiGetTiposGrau(): Promise<TipoGrauCatalogo[]> {
  const { data } = await apiClient.get('/tipos-grau');
  return data;
}

export async function apiGetTrilhasDaClasse(classeId: number): Promise<TrilhaCatalogo[]> {
  const { data } = await apiClient.get(`/classes/${classeId}/trilhas`);
  return data;
}

export async function apiGetCaminhosDaTrilha(trilhaId: number): Promise<CaminhoCatalogo[]> {
  const { data } = await apiClient.get(`/trilhas/${trilhaId}/caminhos`);
  return data;
}

export async function apiGetTecnicasInatas(): Promise<TecnicaInataCatalogo[]> {
  const { data } = await apiClient.get('/tecnicas-amaldicoadas?tipo=INATA');

  return data.map((tecnica: any) => ({
    id: tecnica.id,
    nome: tecnica.nome,
    descricao: tecnica.descricao,
    hereditaria: tecnica.hereditaria,
    clasHereditarios: tecnica.clasHereditarios.map((cla: any) => ({
      claId: cla.id,
      claNome: cla.nome,
    })),
  }));
}

export async function apiGetAlinhamentos(): Promise<AlinhamentoCatalogo[]> {
  const { data } = await apiClient.get('/alinhamentos');
  return data;
}

export async function apiGetPoderesGenericos(): Promise<PoderGenericoCatalogo[]> {
  const { data } = await apiClient.get('/habilidades/poderes-genericos');
  return data;
}

export async function apiGetPassivasDisponiveis(): Promise<PassivasDisponiveisResponse> {
  const { data } = await apiClient.get('/personagens-base/passivas-disponiveis');
  return data;
}
