import { apiClient } from './axios-client';
import { normalizeListResult, type ListResult } from './pagination';
import type {
  ClasseCatalogo,
  ClaCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  OrigemCatalogo,
  HabilidadeCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  TecnicaAmaldicoadaCatalogo,
  CondicaoCatalogo,
  EquipamentoResumoDto,
  EquipamentoDetalhadoDto,
  CreateClassePayload,
  UpdateClassePayload,
  CreateClaPayload,
  UpdateClaPayload,
  CreateTrilhaPayload,
  UpdateTrilhaPayload,
  CreateCaminhoPayload,
  UpdateCaminhoPayload,
  CreateOrigemPayload,
  UpdateOrigemPayload,
  CreateProficienciaPayload,
  UpdateProficienciaPayload,
  CreateTipoGrauPayload,
  UpdateTipoGrauPayload,
  CreateCondicaoPayload,
  UpdateCondicaoPayload,
  CreateHabilidadePayload,
  UpdateHabilidadePayload,
  CreateEquipamentoPayload,
  UpdateEquipamentoPayload,
  CreateTecnicaPayload,
  UpdateTecnicaPayload,
  HabilidadeTecnicaCatalogo,
  VariacaoHabilidadeTecnicaCatalogo,
  CreateHabilidadeTecnicaPayload,
  UpdateHabilidadeTecnicaPayload,
  CreateVariacaoHabilidadeTecnicaPayload,
  UpdateVariacaoHabilidadeTecnicaPayload,
  ExportarTecnicasJsonFilters,
  ExportarTecnicasJsonResponse,
  GuiaImportacaoTecnicasJsonResponse,
  ImportarTecnicasJsonPayload,
  ImportarTecnicasJsonResultado,
  ListHabilidadesFilters,
  ListEquipamentosFilters,
  ListTecnicasFilters,
} from '@/lib/types';

const appendIfString = (params: URLSearchParams, key: string, value?: string): void => {
  if (value) params.append(key, value);
};

const appendIfNumber = (params: URLSearchParams, key: string, value?: number): void => {
  if (value !== undefined) params.append(key, value.toString());
};

const appendIfBoolean = (params: URLSearchParams, key: string, value?: boolean): void => {
  if (value !== undefined) params.append(key, value.toString());
};

// =============================
// CLASSES
// =============================

export async function apiAdminGetClasses(): Promise<ClasseCatalogo[]> {
  const { data } = await apiClient.get('/classes');
  return data;
}

export async function apiAdminGetClasse(id: number): Promise<ClasseCatalogo> {
  const { data } = await apiClient.get(`/classes/${id}`);
  return data;
}

export async function apiAdminCreateClasse(payload: CreateClassePayload): Promise<ClasseCatalogo> {
  const { data } = await apiClient.post('/classes', payload);
  return data;
}

export async function apiAdminUpdateClasse(
  id: number,
  payload: UpdateClassePayload,
): Promise<ClasseCatalogo> {
  const { data } = await apiClient.patch(`/classes/${id}`, payload);
  return data;
}

// =============================
// CLAS
// =============================

export async function apiAdminGetClas(): Promise<ClaCatalogo[]> {
  const { data } = await apiClient.get('/clas');
  return data;
}

export async function apiAdminGetCla(id: number): Promise<ClaCatalogo> {
  const { data } = await apiClient.get(`/clas/${id}`);
  return data;
}

export async function apiAdminCreateCla(payload: CreateClaPayload): Promise<ClaCatalogo> {
  const { data } = await apiClient.post('/clas', payload);
  return data;
}

export async function apiAdminUpdateCla(id: number, payload: UpdateClaPayload): Promise<ClaCatalogo> {
  const { data } = await apiClient.patch(`/clas/${id}`, payload);
  return data;
}

// =============================
// TRILHAS E CAMINHOS
// =============================

export async function apiAdminGetTrilhas(classeId?: number): Promise<TrilhaCatalogo[]> {
  const params = new URLSearchParams();
  appendIfNumber(params, 'classeId', classeId);
  const query = params.toString();
  const { data } = await apiClient.get(`/trilhas${query ? `?${query}` : ''}`);
  return data;
}

export async function apiAdminGetTrilha(id: number): Promise<TrilhaCatalogo> {
  const { data } = await apiClient.get(`/trilhas/${id}`);
  return data;
}

export async function apiAdminCreateTrilha(payload: CreateTrilhaPayload): Promise<TrilhaCatalogo> {
  const { data } = await apiClient.post('/trilhas', payload);
  return data;
}

export async function apiAdminUpdateTrilha(
  id: number,
  payload: UpdateTrilhaPayload,
): Promise<TrilhaCatalogo> {
  const { data } = await apiClient.patch(`/trilhas/${id}`, payload);
  return data;
}

export async function apiAdminGetCaminhosDaTrilha(trilhaId: number): Promise<CaminhoCatalogo[]> {
  const { data } = await apiClient.get(`/trilhas/${trilhaId}/caminhos`);
  return data;
}

export async function apiAdminCreateCaminho(payload: CreateCaminhoPayload): Promise<CaminhoCatalogo> {
  const { data } = await apiClient.post('/trilhas/caminhos', payload);
  return data;
}

export async function apiAdminUpdateCaminho(
  id: number,
  payload: UpdateCaminhoPayload,
): Promise<CaminhoCatalogo> {
  const { data } = await apiClient.patch(`/trilhas/caminhos/${id}`, payload);
  return data;
}

// =============================
// ORIGENS
// =============================

export async function apiAdminGetOrigens(): Promise<OrigemCatalogo[]> {
  const { data } = await apiClient.get('/origens');
  return data;
}

export async function apiAdminGetOrigem(id: number): Promise<OrigemCatalogo> {
  const { data } = await apiClient.get(`/origens/${id}`);
  return data;
}

export async function apiAdminCreateOrigem(payload: CreateOrigemPayload): Promise<OrigemCatalogo> {
  const { data } = await apiClient.post('/origens', payload);
  return data;
}

export async function apiAdminUpdateOrigem(
  id: number,
  payload: UpdateOrigemPayload,
): Promise<OrigemCatalogo> {
  const { data } = await apiClient.patch(`/origens/${id}`, payload);
  return data;
}

// =============================
// PROFICIENCIAS
// =============================

export async function apiAdminGetProficiencias(): Promise<ProficienciaCatalogo[]> {
  const { data } = await apiClient.get('/proficiencias');
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetProficiencia(id: number): Promise<ProficienciaCatalogo> {
  const { data } = await apiClient.get(`/proficiencias/${id}`);
  return data;
}

export async function apiAdminCreateProficiencia(
  payload: CreateProficienciaPayload,
): Promise<ProficienciaCatalogo> {
  const { data } = await apiClient.post('/proficiencias', payload);
  return data;
}

export async function apiAdminUpdateProficiencia(
  id: number,
  payload: UpdateProficienciaPayload,
): Promise<ProficienciaCatalogo> {
  const { data } = await apiClient.patch(`/proficiencias/${id}`, payload);
  return data;
}

export async function apiAdminDeleteProficiencia(id: number): Promise<{ sucesso: boolean }> {
  const { data } = await apiClient.delete(`/proficiencias/${id}`);
  return data;
}

// =============================
// TIPOS DE GRAU
// =============================

export async function apiAdminGetTiposGrau(): Promise<TipoGrauCatalogo[]> {
  const { data } = await apiClient.get('/tipos-grau');
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetTipoGrau(id: number): Promise<TipoGrauCatalogo> {
  const { data } = await apiClient.get(`/tipos-grau/${id}`);
  return data;
}

export async function apiAdminCreateTipoGrau(
  payload: CreateTipoGrauPayload,
): Promise<TipoGrauCatalogo> {
  const { data } = await apiClient.post('/tipos-grau', payload);
  return data;
}

export async function apiAdminUpdateTipoGrau(
  id: number,
  payload: UpdateTipoGrauPayload,
): Promise<TipoGrauCatalogo> {
  const { data } = await apiClient.patch(`/tipos-grau/${id}`, payload);
  return data;
}

export async function apiAdminDeleteTipoGrau(id: number): Promise<{ sucesso: boolean }> {
  const { data } = await apiClient.delete(`/tipos-grau/${id}`);
  return data;
}

// =============================
// CONDICOES
// =============================

export async function apiAdminGetCondicoes(): Promise<CondicaoCatalogo[]> {
  const { data } = await apiClient.get('/condicoes');
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetCondicao(id: number): Promise<CondicaoCatalogo> {
  const { data } = await apiClient.get(`/condicoes/${id}`);
  return data;
}

export async function apiAdminCreateCondicao(
  payload: CreateCondicaoPayload,
): Promise<CondicaoCatalogo> {
  const { data } = await apiClient.post('/condicoes', payload);
  return data;
}

export async function apiAdminUpdateCondicao(
  id: number,
  payload: UpdateCondicaoPayload,
): Promise<CondicaoCatalogo> {
  const { data } = await apiClient.patch(`/condicoes/${id}`, payload);
  return data;
}

export async function apiAdminDeleteCondicao(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/condicoes/${id}`);
  return data;
}

// =============================
// HABILIDADES
// =============================

function buildHabilidadesQuery(filtros?: ListHabilidadesFilters): string {
  const params = new URLSearchParams();

  appendIfString(params, 'tipo', filtros?.tipo);
  appendIfString(params, 'origem', filtros?.origem);
  appendIfString(params, 'fonte', filtros?.fonte);
  appendIfNumber(params, 'suplementoId', filtros?.suplementoId);
  appendIfString(params, 'busca', filtros?.busca);
  appendIfNumber(params, 'pagina', filtros?.pagina);
  appendIfNumber(params, 'limite', filtros?.limite);

  return params.toString();
}

export async function apiAdminGetHabilidades(
  filtros?: ListHabilidadesFilters,
): Promise<ListResult<HabilidadeCatalogo>> {
  const query = buildHabilidadesQuery(filtros);
  const { data } = await apiClient.get(`/habilidades${query ? `?${query}` : ''}`);
  return normalizeListResult<HabilidadeCatalogo>(data);
}

export async function apiAdminGetHabilidade(id: number): Promise<HabilidadeCatalogo> {
  const { data } = await apiClient.get(`/habilidades/${id}`);
  return data;
}

export async function apiAdminCreateHabilidade(
  payload: CreateHabilidadePayload,
): Promise<HabilidadeCatalogo> {
  const { data } = await apiClient.post('/habilidades', payload);
  return data;
}

export async function apiAdminUpdateHabilidade(
  id: number,
  payload: UpdateHabilidadePayload,
): Promise<HabilidadeCatalogo> {
  const { data } = await apiClient.patch(`/habilidades/${id}`, payload);
  return data;
}

// =============================
// EQUIPAMENTOS
// =============================

function buildEquipamentosQuery(filtros?: ListEquipamentosFilters): string {
  const params = new URLSearchParams();

  appendIfString(params, 'tipo', filtros?.tipo);
  if (filtros?.fontes?.length) params.append('fontes', filtros.fontes.join(','));
  appendIfNumber(params, 'suplementoId', filtros?.suplementoId);
  appendIfString(params, 'complexidadeMaldicao', filtros?.complexidadeMaldicao);
  appendIfString(params, 'proficienciaArma', filtros?.proficienciaArma);
  appendIfString(params, 'proficienciaProtecao', filtros?.proficienciaProtecao);
  appendIfString(params, 'alcance', filtros?.alcance);
  appendIfString(params, 'tipoAcessorio', filtros?.tipoAcessorio);
  appendIfNumber(params, 'categoria', filtros?.categoria);
  appendIfBoolean(params, 'apenasAmaldicoados', filtros?.apenasAmaldicoados);
  appendIfString(params, 'busca', filtros?.busca);
  appendIfNumber(params, 'pagina', filtros?.pagina);
  appendIfNumber(params, 'limite', filtros?.limite);

  return params.toString();
}

export async function apiAdminGetEquipamentos(
  filtros?: ListEquipamentosFilters,
): Promise<ListResult<EquipamentoResumoDto>> {
  const query = buildEquipamentosQuery(filtros);
  const { data } = await apiClient.get(`/equipamentos${query ? `?${query}` : ''}`);
  return normalizeListResult<EquipamentoResumoDto>(data);
}

export async function apiAdminGetEquipamento(id: number): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/${id}`);
  return data;
}

export async function apiAdminGetEquipamentoPorCodigo(
  codigo: string,
): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.get(`/equipamentos/codigo/${codigo}`);
  return data;
}

export async function apiAdminCreateEquipamento(
  payload: CreateEquipamentoPayload,
): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.post('/equipamentos', payload);
  return data;
}

export async function apiAdminUpdateEquipamento(
  id: number,
  payload: UpdateEquipamentoPayload,
): Promise<EquipamentoDetalhadoDto> {
  const { data } = await apiClient.put(`/equipamentos/${id}`, payload);
  return data;
}

// =============================
// TECNICAS AMALDICOADAS
// =============================

function buildTecnicasQuery(filtros?: ListTecnicasFilters): string {
  const params = new URLSearchParams();

  appendIfString(params, 'nome', filtros?.nome);
  appendIfString(params, 'codigo', filtros?.codigo);
  appendIfString(params, 'tipo', filtros?.tipo);
  appendIfBoolean(params, 'hereditaria', filtros?.hereditaria);
  appendIfNumber(params, 'claId', filtros?.claId);
  appendIfString(params, 'claNome', filtros?.claNome);
  appendIfString(params, 'fonte', filtros?.fonte);
  appendIfNumber(params, 'suplementoId', filtros?.suplementoId);
  appendIfBoolean(params, 'incluirHabilidades', filtros?.incluirHabilidades);
  appendIfBoolean(params, 'incluirClas', filtros?.incluirClas);

  return params.toString();
}

function buildExportTecnicasJsonQuery(filtros?: ExportarTecnicasJsonFilters): string {
  const params = new URLSearchParams(buildTecnicasQuery(filtros));

  appendIfNumber(params, 'id', filtros?.id);
  appendIfBoolean(params, 'incluirIds', filtros?.incluirIds);

  return params.toString();
}

export async function apiAdminGetTecnicasAmaldicoadas(
  filtros?: ListTecnicasFilters,
): Promise<TecnicaAmaldicoadaCatalogo[]> {
  const query = buildTecnicasQuery(filtros);
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas${query ? `?${query}` : ''}`);
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetTecnicaAmaldicoada(
  id: number,
): Promise<TecnicaAmaldicoadaCatalogo> {
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas/${id}`);
  return data;
}

export async function apiAdminGetTecnicaAmaldicoadaPorCodigo(
  codigo: string,
): Promise<TecnicaAmaldicoadaCatalogo> {
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas/codigo/${codigo}`);
  return data;
}

export async function apiAdminCreateTecnicaAmaldicoada(
  payload: CreateTecnicaPayload,
): Promise<TecnicaAmaldicoadaCatalogo> {
  const { data } = await apiClient.post('/tecnicas-amaldicoadas', payload);
  return data;
}

export async function apiAdminUpdateTecnicaAmaldicoada(
  id: number,
  payload: UpdateTecnicaPayload,
): Promise<TecnicaAmaldicoadaCatalogo> {
  const { data } = await apiClient.patch(`/tecnicas-amaldicoadas/${id}`, payload);
  return data;
}

export async function apiAdminGetGuiaImportacaoTecnicasJson(): Promise<GuiaImportacaoTecnicasJsonResponse> {
  const { data } = await apiClient.get('/tecnicas-amaldicoadas/importar-json/guia');
  return data;
}

export async function apiAdminExportarTecnicasJson(
  filtros?: ExportarTecnicasJsonFilters,
): Promise<ExportarTecnicasJsonResponse> {
  const query = buildExportTecnicasJsonQuery(filtros);
  const { data } = await apiClient.get(
    `/tecnicas-amaldicoadas/exportar-json${query ? `?${query}` : ''}`,
  );
  return data;
}

export async function apiAdminImportarTecnicasJson(
  payload: ImportarTecnicasJsonPayload,
): Promise<ImportarTecnicasJsonResultado> {
  const { data } = await apiClient.post('/tecnicas-amaldicoadas/importar-json', payload);
  return data;
}

// =============================
// HABILIDADES DE TECNICA
// =============================

export async function apiAdminGetHabilidadesDaTecnica(
  tecnicaId: number,
): Promise<HabilidadeTecnicaCatalogo[]> {
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas/${tecnicaId}/habilidades`);
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetHabilidadeDaTecnica(
  id: number,
): Promise<HabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas/habilidades/${id}`);
  return data;
}

export async function apiAdminCreateHabilidadeDaTecnica(
  payload: CreateHabilidadeTecnicaPayload,
): Promise<HabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.post('/tecnicas-amaldicoadas/habilidades', payload);
  return data;
}

export async function apiAdminUpdateHabilidadeDaTecnica(
  id: number,
  payload: UpdateHabilidadeTecnicaPayload,
): Promise<HabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.patch(`/tecnicas-amaldicoadas/habilidades/${id}`, payload);
  return data;
}

export async function apiAdminDeleteHabilidadeDaTecnica(
  id: number,
): Promise<{ sucesso: boolean }> {
  const { data } = await apiClient.delete(`/tecnicas-amaldicoadas/habilidades/${id}`);
  return data;
}

// =============================
// VARIACOES DE HABILIDADE
// =============================

export async function apiAdminGetVariacoesDaHabilidadeTecnica(
  habilidadeId: number,
): Promise<VariacaoHabilidadeTecnicaCatalogo[]> {
  const { data } = await apiClient.get(
    `/tecnicas-amaldicoadas/habilidades/${habilidadeId}/variacoes`,
  );
  return Array.isArray(data) ? data : [];
}

export async function apiAdminGetVariacaoDaHabilidadeTecnica(
  id: number,
): Promise<VariacaoHabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.get(`/tecnicas-amaldicoadas/variacoes/${id}`);
  return data;
}

export async function apiAdminCreateVariacaoDaHabilidadeTecnica(
  payload: CreateVariacaoHabilidadeTecnicaPayload,
): Promise<VariacaoHabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.post('/tecnicas-amaldicoadas/variacoes', payload);
  return data;
}

export async function apiAdminUpdateVariacaoDaHabilidadeTecnica(
  id: number,
  payload: UpdateVariacaoHabilidadeTecnicaPayload,
): Promise<VariacaoHabilidadeTecnicaCatalogo> {
  const { data } = await apiClient.patch(`/tecnicas-amaldicoadas/variacoes/${id}`, payload);
  return data;
}

export async function apiAdminDeleteVariacaoDaHabilidadeTecnica(
  id: number,
): Promise<{ sucesso: boolean }> {
  const { data } = await apiClient.delete(`/tecnicas-amaldicoadas/variacoes/${id}`);
  return data;
}
