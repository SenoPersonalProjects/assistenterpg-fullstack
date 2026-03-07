// lib/types/catalogo.types.ts
/**
 * Types de catálogos do sistema (classes, clãs, origens, etc)
 */

import type { AtributoBaseCodigo } from './common.types';
import type { TipoFonte, TipoTecnicaAmaldicoada } from './homebrew-enums';

export type TipoHabilidadeCatalogo =
  | 'RECURSO_CLASSE'
  | 'EFEITO_GRAU'
  | 'PODER_GENERICO'
  | 'MECANICA_ESPECIAL'
  | 'HABILIDADE_ORIGEM'
  | 'HABILIDADE_TRILHA'
  | 'ESCOLA_TECNICA';

/* ============================================================================ */
/* HABILIDADES */
/* ============================================================================ */

export type HabilidadeCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: TipoHabilidadeCatalogo | string;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  [key: string]: unknown;
};

export type OrigemHabilidadeRel = {
  habilidade: HabilidadeCatalogo;
  [key: string]: unknown;
};

/* ============================================================================ */
/* CLASSES */
/* ============================================================================ */

export type ClassePericiaCatalogo = {
  id: number;
  tipo: string;
  grupoEscolha: number | null;
  pericia: {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
  };
};

export type ClasseProficienciaCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  categoria: string;
  subtipo: string | null;
};

export type ClasseCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  periciasLivresBase: number;
  pericias: ClassePericiaCatalogo[];
  proficiencias?: ClasseProficienciaCatalogo[];
  habilidadesIniciais?: HabilidadeCatalogo[];
};

/* ============================================================================ */
/* CLÃS */
/* ============================================================================ */

export type ClaCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  grandeCla: boolean;
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

/* ============================================================================ */
/* ORIGENS */
/* ============================================================================ */

export type OrigemPericiaCatalogo = {
  id: number;
  tipo: 'FIXA' | 'ESCOLHA';
  grupoEscolha: number | null;
  pericia: {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
  };
};

export type OrigemCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  fonte?: TipoFonte;
  suplementoId?: number | null;

  requisitosTexto?: string | null;
  requerGrandeCla: boolean;
  requerTecnicaHeriditaria: boolean;
  bloqueiaTecnicaHeriditaria: boolean;

  pericias: OrigemPericiaCatalogo[];

  habilidadesIniciais?: HabilidadeCatalogo[];

  habilidadesOrigem?: OrigemHabilidadeRel[];
};

/* ============================================================================ */
/* OUTROS CATÁLOGOS */
/* ============================================================================ */

export type ProficienciaCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  categoria: string;
  subtipo: string | null;
};

export type TipoGrauCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
};

export type TrilhaCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  classeId: number;
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

export type CaminhoCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  trilhaId: number;
};

export type TecnicaInataCatalogo = {
  id: number;
  codigo?: string;
  nome: string;
  descricao: string | null;
  tipo?: TipoTecnicaAmaldicoada;
  hereditaria: boolean;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  clasHereditarios: { claId: number; claNome: string }[];
};

export type TecnicaAmaldicoadaCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: TipoTecnicaAmaldicoada;
  hereditaria?: boolean;
  linkExterno?: string | null;
  requisitos?: unknown;
  fonte?: TipoFonte;
  suplementoId?: number | null;
  clasHereditarios?: Array<{ id: number; nome: string }>;
  habilidades?: unknown[];
};

export type AlinhamentoCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
};

export type PericiaCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  atributoBase: AtributoBaseCodigo;
  somenteTreinada: boolean;
  penalizaPorCarga: boolean;
  precisaKit: boolean;
};

export type PoderGenericoCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  origem: string | null;
  requisitos: unknown;
  mecanicasEspeciais?: unknown;
  fonte?: TipoFonte;
  suplementoId?: number | null;
};

export type PassivaAtributoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  atributo: 'AGILIDADE' | 'FORCA' | 'INTELECTO' | 'PRESENCA' | 'VIGOR';
  nivel: number;
  requisito: number;
  descricao: string;
  efeitos: unknown;
};

export type PassivasDisponiveisResponse = {
  AGILIDADE: PassivaAtributoCatalogo[];
  FORCA: PassivaAtributoCatalogo[];
  INTELECTO: PassivaAtributoCatalogo[];
  PRESENCA: PassivaAtributoCatalogo[];
  VIGOR: PassivaAtributoCatalogo[];
};
