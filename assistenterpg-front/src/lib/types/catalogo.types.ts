// lib/types/catalogo.types.ts
/**
 * Types de catálogos do sistema (classes, clãs, origens, etc)
 */

import type { AtributoBaseCodigo } from './common.types';

/* ============================================================================ */
/* HABILIDADES */
/* ============================================================================ */

export type HabilidadeCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: string;
  [key: string]: any;
};

export type OrigemHabilidadeRel = {
  habilidade: HabilidadeCatalogo;
  [key: string]: any;
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
};

export type CaminhoCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  trilhaId: number;
};

export type TecnicaInataCatalogo = {
  id: number;
  nome: string;
  descricao: string | null;
  hereditaria: boolean;
  clasHereditarios: { claId: number; claNome: string }[];
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
  requisitos: any;
  mecanicasEspeciais?: any;
};

export type PassivaAtributoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  atributo: 'AGILIDADE' | 'FORCA' | 'INTELECTO' | 'PRESENCA' | 'VIGOR';
  nivel: number;
  requisito: number;
  descricao: string;
  efeitos: any;
};

export type PassivasDisponiveisResponse = {
  AGILIDADE: PassivaAtributoCatalogo[];
  FORCA: PassivaAtributoCatalogo[];
  INTELECTO: PassivaAtributoCatalogo[];
  PRESENCA: PassivaAtributoCatalogo[];
  VIGOR: PassivaAtributoCatalogo[];
};
