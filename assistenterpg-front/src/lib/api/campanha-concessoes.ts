import { apiClient } from './axios-client';

const base = (campanhaId: number, personagemId: number) =>
  `/campanhas/${campanhaId}/personagens/${personagemId}`;

export type ConcessoesCampanha = {
  poderesGenericos: Array<{ id: number; config?: Record<string, unknown> | null; habilidade: { id: number; nome: string; descricao: string | null; mecanicasEspeciais?: unknown } }>;
  proficienciasConcedidas: Array<{ proficiencia: { id: number; nome: string; tipo: string; categoria: string } }>;
  habilidadesPersonalizadas: Array<{ id: number; nome: string; descricao: string }>;
};

export async function apiGetConcessoesCampanha(campanhaId: number, personagemId: number) {
  const { data } = await apiClient.get<ConcessoesCampanha>(`${base(campanhaId, personagemId)}/concessoes`);
  return data;
}
export async function apiConcederPoderGenericoCampanha(campanhaId: number, personagemId: number, habilidadeId: number, config?: Record<string, unknown>) {
  const { data } = await apiClient.post(`${base(campanhaId, personagemId)}/poderes-genericos`, { habilidadeId, ...(config ? { config } : {}) });
  return data;
}
export async function apiRemoverPoderGenericoCampanha(campanhaId: number, personagemId: number, poderId: number) {
  await apiClient.delete(`${base(campanhaId, personagemId)}/poderes-genericos/${poderId}`);
}
export async function apiConcederProficienciaCampanha(campanhaId: number, personagemId: number, proficienciaId: number) {
  const { data } = await apiClient.post(`${base(campanhaId, personagemId)}/proficiencias`, { proficienciaId });
  return data;
}
export async function apiRemoverProficienciaCampanha(campanhaId: number, personagemId: number, proficienciaId: number) {
  await apiClient.delete(`${base(campanhaId, personagemId)}/proficiencias/${proficienciaId}`);
}
export async function apiCriarHabilidadePersonalizadaCampanha(campanhaId: number, personagemId: number, nome: string, descricao: string) {
  const { data } = await apiClient.post(`${base(campanhaId, personagemId)}/habilidades-personalizadas`, { nome, descricao });
  return data;
}
export async function apiRemoverHabilidadePersonalizadaCampanha(campanhaId: number, personagemId: number, habilidadeId: number) {
  await apiClient.delete(`${base(campanhaId, personagemId)}/habilidades-personalizadas/${habilidadeId}`);
}
