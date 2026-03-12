// lib/types/personagem.types.ts
/**
 * Types relacionados a personagens base
 */

import type { AtributoBaseCodigo, AtributoChaveEA } from './common.types';
import type { ItemInventarioDto } from './inventario.types';
import type { TecnicaAmaldicoadaCatalogo } from './catalogo.types';

/* ============================================================================ */
/* RESISTÊNCIAS E ATRIBUTOS DERIVADOS */
/* ============================================================================ */

export type ResistenciaDetalhadaDto = {
  codigo: string;
  nome: string;
  descricao: string | null;
  habilidades: number;
  equipamentos: number;
  total: number;
};

export type ResistenciaSimplificadaDto = {
  codigo: string;
  nome: string;
  descricao: string | null;
  valor: number;
};

export type AtributosDerivados = {
  pvMaximo: number;
  peMaximo: number;
  eaMaximo: number;
  sanMaximo: number;

  // Defesa
  defesaBase: number;
  defesaEquipamento: number;
  defesaTotal: number;
  defesa: number; // Retrocompatibilidade (= defesaTotal)

  deslocamento: number;
  limitePeEaPorTurno: number;
  reacoesBasePorTurno: number;
  turnosMorrendo: number;
  turnosEnlouquecendo: number;
  bloqueio: number;
  esquiva: number;

  // Resistências
  resistencias?: ResistenciaSimplificadaDto[];
  resistenciasDetalhadas?: Record<string, ResistenciaDetalhadaDto>;
};

/* ============================================================================ */
/* PASSIVAS E PODERES */
/* ============================================================================ */

export type PassivaIntelectoConfigFront = {
  periciasCodigos?: string[];
  proficienciasCodigos?: string[];
  periciaCodigoTreino?: string;
  tipoGrauCodigoAprimoramento?: string;
};

export type PassivasAtributoConfigFront = {
  INT_I?: PassivaIntelectoConfigFront;
  INT_II?: PassivaIntelectoConfigFront;
  passivaIdToIndex?: Record<number, number>;
};

export type PoderGenericoInstanciaPayload = {
  habilidadeId: number;
  config?: Record<string, unknown>;
};

/* ============================================================================ */
/* TREINAMENTO */
/* ============================================================================ */

export type MelhoriaTreinamento = {
  periciaCodigo: string;
  grauAnterior: number;
  grauNovo: number;
};

export type GrauTreinamento = {
  nivel: number;
  melhorias: MelhoriaTreinamento[];
};

export type InfoGrausTreinamento = {
  niveisDisponiveis: Array<{ nivel: number; maxMelhorias: number }>;
  limitesGrau: { graduado: number; veterano: number; expert: number };
};

export type PericiaElegivelTreinamento = {
  codigo: string;
  nome: string;
  atributoBase: string;
  grauAtual: number;
};

/* ============================================================================ */
/* INVENTÁRIO (PAYLOAD) */
/* ============================================================================ */

export type ItemInventarioPayload = {
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;
  modificacoesIds?: number[];
  nomeCustomizado?: string | null;
  notas?: string | null;
};

/* ============================================================================ */
/* RESUMO E PREVIEW */
/* ============================================================================ */

export type PersonagemBaseResumo = {
  id: number;
  nome: string;
  nivel: number;
  cla: string;
  classe: string;
};

export type PersonagemBaseCriado = {
  id: number;
  nome: string;
  nivel: number;
  cla: string;
  origem: string;
  classe: string;
  trilha: string | null;
  caminho: string | null;
};

type ReferenciaImportExport = {
  id?: number;
  nome?: string | null;
  codigo?: string | null;
} | null;

export type PersonagemBaseReferenciasImportExport = {
  cla?: ReferenciaImportExport;
  origem?: ReferenciaImportExport;
  classe?: ReferenciaImportExport;
  trilha?: ReferenciaImportExport;
  caminho?: ReferenciaImportExport;
  alinhamento?: ReferenciaImportExport;
  tecnicaInata?: ReferenciaImportExport;
  poderesGenericos?: ReferenciaImportExport[];
  passivas?: ReferenciaImportExport[];
  itensInventario?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type PersonagemBaseExportResponse = {
  schema: string;
  schemaVersion: number;
  exportadoEm: string;
  personagem: CreatePersonagemBasePayload;
  referencias?: PersonagemBaseReferenciasImportExport;
};

export type PersonagemBaseImportRequest = {
  schema: string;
  schemaVersion: number;
  exportadoEm?: string;
  personagem: CreatePersonagemBasePayload;
  referencias?: PersonagemBaseReferenciasImportExport;
  nomeSobrescrito?: string;
};

export type PersonagemBaseImportResponse = {
  id: number;
  nome: string;
  nivel: number;
  cla: string;
  origem: string;
  classe: string;
  trilha: string | null;
  caminho: string | null;
  importado: boolean;
  schema: string;
  schemaVersion: number;
  importadoEm: string;
};

export type PersonagemBasePreview = {
  nome: string;
  nivel: number;
  claId: number;
  origemId: number;
  classeId: number;
  trilhaId?: number | null;
  caminhoId?: number | null;

  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;

  estudouEscolaTecnica: boolean;
  tecnicaInataId?: number | null;

  idade?: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId?: number | null;
  background?: string | null;
  atributoChaveEa: AtributoChaveEA;

  passivasNeedsChoice?: boolean;
  passivasElegiveis?: AtributoBaseCodigo[];
  passivasAtributosAtivos?: AtributoBaseCodigo[];
  passivasAtributoIds?: number[];

  passivasAtributosConfig?: PassivasAtributoConfigFront;

  atributosDerivados: AtributosDerivados;

  pericias: Array<{
    codigo: string;
    nome: string;
    atributoBase: AtributoBaseCodigo;
    grauTreinamento: number;
    bonusExtra: number;
    bonusTotal: number;
  }>;

  grausAprimoramento: Array<{
    tipoGrauCodigo: string;
    tipoGrauNome: string;
    valor: number;
  }>;

  proficiencias: Array<{
    codigo: string;
    nome: string;
    tipo: string;
    categoria: string;
    subtipo: string | null;
  }>;

  habilidadesAtivas: string[];

  bonusHabilidades: Array<{
    habilidadeNome: string;
    tipoGrauCodigo: string;
    valor: number;
    escalonamentoPorNivel: unknown;
  }>;

  tecnicaInata?: TecnicaAmaldicoadaCatalogo | null;
  tecnicasNaoInatas?: TecnicaAmaldicoadaCatalogo[];

  grausLivresInfo?: {
    base: number;
    deHabilidades: number;
    deIntelecto: number;
    total: number;
    gastos: number;
  };

  periciasLivresInfo?: {
    base: number;
    deIntelecto: number;
    total: number;
  };

  poderesGenericos?: Array<PoderGenericoInstanciaPayload>;

  resistencias?: ResistenciaSimplificadaDto[];
  resistenciasDetalhadas?: Record<string, ResistenciaDetalhadaDto>;

  itensInventario?: Array<{
    equipamentoId: number;
    equipamento: {
      id: number;
      nome: string;
      tipo: string;
      espacos: number;
      descricao?: string | null;
    };
    quantidade: number;
    equipado: boolean;
    modificacoesIds: number[];
    modificacoes: Array<{
      id: number;
      nome: string;
      incrementoEspacos: number;
    }>;
    espacosPorUnidade: number;
    espacosTotal: number;
    nomeCustomizado?: string | null;
    notas?: string | null;
  }>;

  espacosInventario?: {
    base: number;
    extra: number;
    total: number;
    ocupados?: number;
    restantes?: number;
    sobrecarregado?: boolean;
    limitesPorCategoria?: Record<string, number>;
    itensPorCategoria?: Record<string, number>;
  };

  errosInventario?: string[];
  errosItens?: Array<
    | string
    | {
        index?: number;
        indice?: number;
        itemIndex?: number;
        equipamentoId?: number;
        mensagem?: string;
        message?: string;
        erro?: string;
      }
  >;
};

/* ============================================================================ */
/* PAYLOADS (CREATE/UPDATE) */
/* ============================================================================ */

export type CreatePersonagemBasePayload = {
  nome: string;
  nivel: number;
  claId: number;
  origemId: number;
  classeId: number;
  trilhaId?: number | null;
  caminhoId?: number | null;

  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;

  estudouEscolaTecnica: boolean;

  idade?: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId?: number | null;
  background?: string | null;
  atributoChaveEa: AtributoChaveEA;

  tecnicaInataId?: number | null;

  proficienciasCodigos: string[];
  grausAprimoramento: {
    tipoGrauCodigo: string;
    valor: number;
  }[];

  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos?: string[];
  periciasLivresCodigos: string[];

  periciasLivresExtras?: number;

  grausTreinamento?: GrauTreinamento[];

  poderesGenericos?: PoderGenericoInstanciaPayload[];

  poderesGenericosSelecionadosIds?: number[];

  passivasAtributosAtivos?: AtributoBaseCodigo[];

  passivasAtributosConfig?: PassivasAtributoConfigFront;

  passivasAtributoIds?: number[];

  itensInventario?: ItemInventarioPayload[];
};

export type UpdatePersonagemBasePayload = Partial<CreatePersonagemBasePayload>;

/* ============================================================================ */
/* DETALHE COMPLETO */
/* ============================================================================ */

export type PersonagemBaseDetalhe = {
  id: number;
  nome: string;
  nivel: number;

  claId: number;
  origemId: number;
  classeId: number;
  trilhaId: number | null;
  caminhoId: number | null;

  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;

  estudouEscolaTecnica: boolean;
  tecnicaInataId: number | null;

  idade: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId: number | null;
  background: string | null;
  atributoChaveEa: AtributoChaveEA;

  atributosDerivados: AtributosDerivados;

  tecnicaInata: TecnicaAmaldicoadaCatalogo | null;

  cla: { id: number; nome: string; grandeCla: boolean };
  origem: { id: number; nome: string };
  classe: { id: number; nome: string };
  trilha: { id: number; nome: string } | null;
  caminho: { id: number; nome: string } | null;

  proficiencias: Array<{
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    categoria: string;
    subtipo: string | null;
  }>;

  grausAprimoramento: Array<{
    tipoGrauCodigo: string;
    tipoGrauNome: string;
    valorTotal: number;
    valorLivre: number;
    bonus: number;
  }>;

  pericias: Array<{
    id: number;
    codigo: string;
    nome: string;
    atributoBase: AtributoBaseCodigo;
    somenteTreinada: boolean;
    penalizaPorCarga: boolean;
    precisaKit: boolean;
    grauTreinamento: number;
    bonusExtra: number;
  }>;

  periciasClasseEscolhidasCodigos?: string[];
  periciasOrigemEscolhidasCodigos?: string[];
  periciasLivresCodigos?: string[];

  grausTreinamento?: GrauTreinamento[];

  habilidades?: Array<{
    id: number;
    nome: string;
    tipo: string;
    descricao: string | null;
  }>;

  tecnicasNaoInatas: TecnicaAmaldicoadaCatalogo[];

  poderesGenericos?: Array<{
    id: number;
    habilidadeId: number;
    nome: string;
    config?: Record<string, unknown>;
  }>;

  poderesGenericosSelecionadosIds?: number[];

  passivas?: Array<{
    id: number;
    codigo: string;
    nome: string;
    atributo: string;
    nivel: number;
    descricao: string;
    efeitos: unknown;
  }>;

  passivasAtributoIds?: number[];
  passivasAtributosAtivos?: AtributoBaseCodigo[];

  passivasAtributosConfig?: PassivasAtributoConfigFront;

  espacosInventarioBase: number;
  espacosInventarioExtra: number;
  espacosOcupados: number;
  sobrecarregado: boolean;

  itensInventario?: ItemInventarioDto[]; // Importado de inventario.types.ts

  resistencias?: ResistenciaSimplificadaDto[];
  resistenciasDetalhadas?: Record<string, ResistenciaDetalhadaDto>;
};
