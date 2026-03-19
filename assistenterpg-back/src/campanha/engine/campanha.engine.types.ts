// src/campanha/engine/campanha.engine.types.ts
import { CampoModificadorPersonagemCampanha } from '@prisma/client';

export const MAX_TENTATIVAS_CODIGO_CONVITE = 5;

export type PapelCampanha = 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';

export type PrismaUniqueErrorLike = {
  code?: string;
  meta?: {
    target?: string | string[];
  };
};

export type CampoPersonagemCampanhaNumerico =
  | 'pvMax'
  | 'peMax'
  | 'eaMax'
  | 'sanMax'
  | 'defesaBase'
  | 'defesaEquipamento'
  | 'defesaOutros'
  | 'esquiva'
  | 'bloqueio'
  | 'deslocamento'
  | 'limitePeEaPorTurno'
  | 'prestigioGeral'
  | 'prestigioCla';

export type CampoRecursoAtual = 'pvAtual' | 'peAtual' | 'eaAtual' | 'sanAtual';

export type FiltrosListarModificadoresCampanha = {
  sessaoId?: number;
  cenaId?: number;
};

export type ConfigCampoModificador = {
  campoBanco: CampoPersonagemCampanhaNumerico;
  campoRecursoAtual?: CampoRecursoAtual;
  minimo?: number;
};

export const CONFIG_MODIFICADOR_CAMPO: Record<
  CampoModificadorPersonagemCampanha,
  ConfigCampoModificador
> = {
  PV_MAX: {
    campoBanco: 'pvMax',
    campoRecursoAtual: 'pvAtual',
    minimo: 0,
  },
  PE_MAX: {
    campoBanco: 'peMax',
    campoRecursoAtual: 'peAtual',
    minimo: 0,
  },
  EA_MAX: {
    campoBanco: 'eaMax',
    campoRecursoAtual: 'eaAtual',
    minimo: 0,
  },
  SAN_MAX: {
    campoBanco: 'sanMax',
    campoRecursoAtual: 'sanAtual',
    minimo: 0,
  },
  DEFESA_BASE: {
    campoBanco: 'defesaBase',
    minimo: 0,
  },
  DEFESA_EQUIPAMENTO: {
    campoBanco: 'defesaEquipamento',
  },
  DEFESA_OUTROS: {
    campoBanco: 'defesaOutros',
  },
  ESQUIVA: {
    campoBanco: 'esquiva',
  },
  BLOQUEIO: {
    campoBanco: 'bloqueio',
  },
  DESLOCAMENTO: {
    campoBanco: 'deslocamento',
    minimo: 0,
  },
  LIMITE_PE_EA_POR_TURNO: {
    campoBanco: 'limitePeEaPorTurno',
    minimo: 0,
  },
  PRESTIGIO_GERAL: {
    campoBanco: 'prestigioGeral',
  },
  PRESTIGIO_CLA: {
    campoBanco: 'prestigioCla',
  },
};
