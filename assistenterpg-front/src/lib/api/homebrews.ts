// src/lib/api/homebrews.ts

import { apiClient } from "./axios-client";
import { normalizeListResult, type ListResult } from "./pagination";

// ============================================================================
// ✅ IMPORTS DE ENUMS (sincronizados)
// ============================================================================

import {
  TipoHomebrewConteudo,
  StatusPublicacao,
  TipoEquipamento,
  CategoriaEquipamento,
  TipoUsoEquipamento,
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  TipoDano,
  ProficienciaProtecao,
  TipoProtecao,
  TipoReducaoDano,
  TipoAcessorio,
  TipoExplosivo,
  TipoAmaldicoado,
  TipoTecnicaAmaldicoada,
  TipoExecucao,
  AreaEfeito,
} from "@/lib/types/homebrew-enums";

// ============================================================================
// TIPOS BASE
// ============================================================================

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

/**
 * Homebrew resumido (para listagem)
 */
export type HomebrewResumo = {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: TipoHomebrewConteudo;
  status: StatusPublicacao;
  tags?: string[];
  versao: string;
  criadoEm: string;
  atualizadoEm: string;
  usuarioId: number;
  usuarioApelido?: string;
};

/**
 * Homebrew detalhado
 */
export type HomebrewDetalhado = HomebrewResumo & {
  dados: JsonValue; // JSON - estrutura varia por tipo
};

/**
 * Filtros para listagem
 */
export type FiltrarHomebrewsDto = {
  nome?: string;
  tipo?: TipoHomebrewConteudo;
  status?: StatusPublicacao;
  usuarioId?: number;
  apenasPublicados?: boolean;
  pagina?: number;
  limite?: number;
};

/**
 * Resposta paginada
 */
export type HomebrewsPaginados = ListResult<HomebrewResumo>;

/**
 * Payload para criar homebrew
 */
export type CreateHomebrewDto = {
  nome: string;
  descricao?: string;
  tipo: TipoHomebrewConteudo;
  status?: StatusPublicacao;
  tags?: string[];
  versao?: string;
  dados: JsonValue; // Estrutura varia por tipo
};

/**
 * Payload para atualizar homebrew
 */
export type UpdateHomebrewDto = Partial<CreateHomebrewDto>;

// ============================================================================
// FUNÇÕES DA API
// ============================================================================

type HomebrewListQueryParam =
  | "nome"
  | "tipo"
  | "status"
  | "usuarioId"
  | "apenasPublicados"
  | "pagina"
  | "limite";

const HOMEBREWS_QUERY_PARAMS = {
  nome: "nome",
  tipo: "tipo",
  status: "status",
  usuarioId: "usuarioId",
  apenasPublicados: "apenasPublicados",
  pagina: "pagina",
  limite: "limite",
} as const satisfies Record<HomebrewListQueryParam, HomebrewListQueryParam>;

type HomebrewsListFilters = Pick<
  FiltrarHomebrewsDto,
  | "nome"
  | "tipo"
  | "status"
  | "usuarioId"
  | "apenasPublicados"
  | "pagina"
  | "limite"
>;

function appendHomebrewQueryParam(
  params: URLSearchParams,
  key: HomebrewListQueryParam,
  value: string,
): void {
  params.append(key, value);
}

function buildHomebrewsQuery(filtros?: HomebrewsListFilters): string {
  const params = new URLSearchParams();

  if (filtros?.nome)
    appendHomebrewQueryParam(params, HOMEBREWS_QUERY_PARAMS.nome, filtros.nome);
  if (filtros?.tipo)
    appendHomebrewQueryParam(params, HOMEBREWS_QUERY_PARAMS.tipo, filtros.tipo);
  if (filtros?.status)
    appendHomebrewQueryParam(
      params,
      HOMEBREWS_QUERY_PARAMS.status,
      filtros.status,
    );
  if (filtros?.usuarioId !== undefined)
    appendHomebrewQueryParam(
      params,
      HOMEBREWS_QUERY_PARAMS.usuarioId,
      filtros.usuarioId.toString(),
    );
  if (filtros?.apenasPublicados)
    appendHomebrewQueryParam(
      params,
      HOMEBREWS_QUERY_PARAMS.apenasPublicados,
      "true",
    );
  if (filtros?.pagina !== undefined)
    appendHomebrewQueryParam(
      params,
      HOMEBREWS_QUERY_PARAMS.pagina,
      filtros.pagina.toString(),
    );
  if (filtros?.limite !== undefined)
    appendHomebrewQueryParam(
      params,
      HOMEBREWS_QUERY_PARAMS.limite,
      filtros.limite.toString(),
    );

  return params.toString();
}

/**
 * Contrato: `GET /homebrews` aceita apenas paginação em PT-BR (`pagina`, `limite`) na matriz de contrato.
 * Exemplo final de query: `nome=katana&status=PUBLICADO&apenasPublicados=true&pagina=1&limite=12`
 */
export async function apiGetHomebrews(
  filtros?: FiltrarHomebrewsDto,
): Promise<HomebrewsPaginados> {
  const query = buildHomebrewsQuery(filtros);
  const { data } = await apiClient.get(`/homebrews?${query}`);
  return normalizeListResult<HomebrewResumo>(data);
}

/**
 * Contrato: `GET /homebrews/meus` reutiliza os mesmos params em PT-BR da matriz (`pagina`, `limite`) sem alias `page/limit`.
 * Exemplo final de query: `tipo=EQUIPAMENTO&status=RASCUNHO&pagina=1&limite=10`
 */
export async function apiGetMeusHomebrews(
  filtros?: Omit<FiltrarHomebrewsDto, "usuarioId">,
): Promise<HomebrewsPaginados> {
  const query = buildHomebrewsQuery(filtros);
  const { data } = await apiClient.get(`/homebrews/meus?${query}`);
  return normalizeListResult<HomebrewResumo>(data);
}

/**
 * ✅ Buscar homebrew por ID
 */
export async function apiGetHomebrew(id: number): Promise<HomebrewDetalhado> {
  const { data } = await apiClient.get(`/homebrews/${id}`);
  return data;
}

/**
 * ✅ Buscar homebrew por código
 */
export async function apiGetHomebrewByCodigo(
  codigo: string,
): Promise<HomebrewDetalhado> {
  const { data } = await apiClient.get(`/homebrews/codigo/${codigo}`);
  return data;
}

/**
 * ✅ Criar homebrew
 */
export async function apiCreateHomebrew(
  payload: CreateHomebrewDto,
): Promise<HomebrewDetalhado> {
  const { data } = await apiClient.post("/homebrews", payload);
  return data;
}

/**
 * ✅ Atualizar homebrew
 */
export async function apiUpdateHomebrew(
  id: number,
  payload: UpdateHomebrewDto,
): Promise<HomebrewDetalhado> {
  const { data } = await apiClient.patch(`/homebrews/${id}`, payload);
  return data;
}

/**
 * ✅ Deletar homebrew
 */
export async function apiDeleteHomebrew(id: number): Promise<void> {
  await apiClient.delete(`/homebrews/${id}`);
}

/**
 * ✅ Publicar homebrew
 */
export async function apiPublicarHomebrew(id: number): Promise<HomebrewResumo> {
  const { data } = await apiClient.patch(`/homebrews/${id}/publicar`);
  return data;
}

/**
 * ✅ Arquivar homebrew
 */
export async function apiArquivarHomebrew(id: number): Promise<HomebrewResumo> {
  const { data } = await apiClient.patch(`/homebrews/${id}/arquivar`);
  return data;
}

// ============================================================================
// TIPOS DETALHADOS PARA EQUIPAMENTOS
// ============================================================================

export type DadosDanoArma = {
  empunhadura?: EmpunhaduraArma;
  tipoDano: TipoDano;
  rolagem: string;
  valorFlat?: number;
};

/**
 * ✅ CORRIGIDO: tipo (TipoEquipamento) e categoria (CategoriaEquipamento)
 */
export type DadosArma = {
  tipo: TipoEquipamento.ARMA; // ✅ tipo do equipamento
  categoria: CategoriaEquipamento; // ✅ categoria de raridade/poder
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  proficienciaArma: ProficienciaArma;
  empunhaduras: EmpunhaduraArma[];
  tipoArma: TipoArma;
  subtipoDistancia?: SubtipoArmaDistancia;
  agil: boolean;
  danos: DadosDanoArma[];
  criticoValor: number;
  criticoMultiplicador: number;
  alcance: AlcanceArma;
  tipoMunicaoCodigo?: string;
  habilidadeEspecial?: string;
};

export type DadosReducaoDano = {
  tipoReducao: TipoReducaoDano;
  valor: number;
};

export type DadosProtecao = {
  tipo: TipoEquipamento.PROTECAO; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  proficienciaProtecao: ProficienciaProtecao;
  tipoProtecao: TipoProtecao;
  bonusDefesa: number;
  penalidadeCarga: number;
  reducoesDano: DadosReducaoDano[];
};

export type DadosAcessorio = {
  tipo: TipoEquipamento.ACESSORIO; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  tipoAcessorio: TipoAcessorio;
  periciaBonificada?: string;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  efeito?: string;
  maxVestimentas?: number;
};

export type DadosMunicao = {
  tipo: TipoEquipamento.MUNICAO; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  duracaoCenas: number;
  recuperavel: boolean;
};

export type DadosExplosivo = {
  tipo: TipoEquipamento.EXPLOSIVO; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  tipoExplosivo: TipoExplosivo;
  efeito: string;
};

type DadosArmaAmaldicoadaBase = Omit<
  DadosArma,
  "tipo" | "categoria" | "espacos" | "tipoUso"
>;

type DadosProtecaoAmaldicoadaBase = Omit<
  DadosProtecao,
  "tipo" | "categoria" | "espacos" | "tipoUso"
>;

export type DadosFerramentaAmaldicoada = {
  tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  tipoAmaldicoado:
    | TipoAmaldicoado.ARMA
    | TipoAmaldicoado.PROTECAO
    | TipoAmaldicoado.ARTEFATO;
  armaAmaldicoada?: {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    dadosArma: DadosArmaAmaldicoadaBase;
  };
  protecaoAmaldicoada?: {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    dadosProtecao: DadosProtecaoAmaldicoadaBase;
  };
  artefatoAmaldicoado?: {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    custoUso: string;
    manutencao: string;
  };
};

export type DadosItemOperacional = {
  tipo: TipoEquipamento.ITEM_OPERACIONAL; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  periciaBonificada?: string;
  bonusPericia?: number;
  efeito?: string;
};

export type DadosItemAmaldicado = {
  tipo: TipoEquipamento.ITEM_AMALDICOADO; // ✅ CORRIGIDO
  categoria: CategoriaEquipamento; // ✅ CORRIGIDO
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  tipoAmaldicoado: TipoAmaldicoado.ITEM;
  efeito: string;
};

export type DadosEquipamentoGenerico = {
  tipo: TipoEquipamento.GENERICO;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  efeito?: string;
};
export type DadosEquipamento =
  | DadosArma
  | DadosProtecao
  | DadosAcessorio
  | DadosMunicao
  | DadosExplosivo
  | DadosFerramentaAmaldicoada
  | DadosItemOperacional
  | DadosItemAmaldicado
  | DadosEquipamentoGenerico;

// ============================================================================
// TIPOS DETALHADOS PARA TÉCNICAS
// ============================================================================

export type DadoDanoTecnica = {
  quantidade: number;
  dado: string;
  tipo: TipoDano;
};

export type EscalonamentoDano = {
  quantidade: number;
  dado: string;
  tipo: TipoDano;
};

export type VariacaoHabilidade = {
  nome: string;
  descricao: string;
  substituiCustos?: boolean;
  custoPE?: number;
  custoEA?: number;
  execucao?: TipoExecucao;
  area?: AreaEfeito;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: TipoDano;
  dadosDano?: DadoDanoTecnica[];
  escalonaPorGrau?: boolean;
  escalonamentoCustoEA?: number;
  escalonamentoDano?: EscalonamentoDano;
  efeitoAdicional?: string;
  requisitos?: JsonValue;
  ordem?: number;
};

export type HabilidadeTecnica = {
  codigo: string;
  nome: string;
  descricao: string;
  requisitos?: JsonValue;
  execucao: TipoExecucao;
  area?: AreaEfeito;
  alcance?: string;
  alvo?: string;
  duracao?: string;
  resistencia?: string;
  dtResistencia?: string;
  custoPE: number;
  custoEA: number;
  testesExigidos?: string[];
  criticoValor?: number;
  criticoMultiplicador?: number;
  danoFlat?: number;
  danoFlatTipo?: TipoDano;
  dadosDano?: DadoDanoTecnica[];
  escalonaPorGrau?: boolean;
  grauTipoGrauCodigo?: string;
  escalonamentoCustoEA?: number;
  escalonamentoDano?: EscalonamentoDano;
  efeito: string;
  variacoes?: VariacaoHabilidade[];
  ordem?: number;
};

export type DadosTecnicaAmaldicoada = {
  tipo: TipoTecnicaAmaldicoada;
  hereditaria?: boolean;
  linkExterno?: string;
  requisitos?: JsonValue;
  habilidades: HabilidadeTecnica[];
};

// ============================================================================
// TIPOS OUTROS
// ============================================================================

export type DadosCla = {
  tecnicaInataId?: number;
  caracteristicas?: JsonValue[];
  requisitos?: JsonValue;
};

export type DadosOrigem = {
  pericias: string[];
  habilidades?: JsonValue[];
};

export type DadosTrilha = {
  classeId: number;
  nivelRequisito?: number;
  habilidades: JsonValue[];
};

export type DadosCaminho = {
  requisitos?: JsonValue;
  habilidades: JsonValue[];
};

export type DadosPoderGenerico = {
  requisitos?: JsonValue;
  efeitos: string;
  mecanicas?: JsonValue;
};

// ============================================================================
// ✅ RE-EXPORTS para compatibilidade
// ============================================================================

export type {
  TipoHomebrewConteudo,
  StatusPublicacao,
  TipoEquipamento,
  CategoriaEquipamento,
  TipoUsoEquipamento,
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  TipoDano,
  ProficienciaProtecao,
  TipoProtecao,
  TipoReducaoDano,
  TipoAcessorio,
  TipoExplosivo,
  TipoAmaldicoado,
  TipoTecnicaAmaldicoada,
  TipoExecucao,
  AreaEfeito,
};
