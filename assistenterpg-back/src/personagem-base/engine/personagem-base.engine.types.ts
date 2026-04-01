// src/personagem-base/engine/personagem-base.engine.types.ts
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AtributoBase } from '@prisma/client';

import {
  CreatePersonagemBaseDto,
  GrauTreinamentoDto,
  PassivasAtributoConfigDto,
} from '../dto/create-personagem-base.dto';

export type PrismaLike = PrismaService | Prisma.TransactionClient;

export type PericiaState = {
  grauTreinamento: number;
  periciaId: number;
  bonusExtra: number;
};

export type PericiaComCodigo = { codigo: string; grauTreinamento: number };
export type GrauFinal = { tipoGrauCodigo: string; valor: number };

export type PassivasResolvidas = {
  ativos: AtributoBase[];
  passivaIds: number[];
  passivaCodigos: string[];
  needsChoice?: boolean;
  elegiveis?: unknown;
};

export type HabilidadeComEfeitos = Array<{
  habilidadeId: number;
  habilidade: {
    nome: string;
    tipo?: string;
    mecanicasEspeciais?: Prisma.JsonValue | null;
    efeitosGrau: Array<{
      tipoGrauCodigo: string;
      valor: number;
      escalonamentoPorNivel: Prisma.JsonValue | null;
    }>;
  };
}>;

export type ModDerivados = {
  pvPorNivelExtra: number;
  pvExtra: number;
  peBaseExtra: number;
  limitePeEaExtra: number;
  defesaExtra: number;
  sanPorNivelExtra: number;
  sanMultiplicador: number;
  espacosInventarioExtra: number;
  inventarioSomarIntelecto: boolean;
  inventarioReduzirItensLeves: boolean;
  inventarioReduzirCategoriaEm: number;
  inventarioReduzirCategoriaExcetoTipos: string[];
  creditoCategoriaBonus: number;
};

export type EngineParams = {
  donoId?: number;
  dto: CreatePersonagemBaseDto;
  strictPassivas: boolean;
  // ✅ NOVO: ID do personagem (para buscar inventário)
  personagemBaseId?: number;
};

// ✅ NOVO: Tipo para item de inventário calculado
export type ItemInventarioCalculado = {
  equipamentoId: number;
  equipamento: {
    id: number;
    codigo: string;
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
    codigo: string;
    nome: string;
    incrementoEspacos: number;
  }>;
  espacosPorUnidade: number;
  espacosTotal: number;
  nomeCustomizado?: string | null;
  notas?: string | null;
};

export type EngineResult = {
  dtoNormalizado: CreatePersonagemBaseDto;
  passivasResolvidas: PassivasResolvidas;

  passivasAtributosConfigLimpo?: PassivasAtributoConfigDto | null;

  poderesGenericosNormalizados: Array<{
    habilidadeId: number;
    config: Prisma.JsonValue;
  }>;

  // Perícias
  periciasMapCodigo: Map<string, PericiaState>;
  periciasComCodigo: PericiaComCodigo[];

  // Habilidades
  habilidades: HabilidadeComEfeitos;
  habilidadesParaPersistir: Array<{ habilidadeId: number }>;

  // Proficiências
  profsFinais: string[];

  // Graus
  grausFinais: GrauFinal[];
  grausTreinamento?: GrauTreinamentoDto[] | undefined;

  // Derivados finais (já com mods)
  derivadosFinais: {
    pvMaximo: number;
    peMaximo: number;
    eaMaximo: number;
    sanMaximo: number;
    defesaBase: number; // ✅ RENOMEADO (antes era 'defesa')
    defesaEquipamento: number; // ✅ NOVO
    defesaTotal: number; // ✅ NOVO (base + equipamento)
    deslocamento: number;
    limitePeEaPorTurno: number;
    reacoesBasePorTurno: number;
    turnosMorrendo: number;
    turnosEnlouquecendo: number;
    bloqueio: number;
    esquiva: number;
  };

  // ✅ NOVO: Barras de PV (Corpo Amaldiçoado Independente)
  pvBarrasTotal: number;

  // Espaços de inventário
  espacosInventario: {
    base: number;
    extra: number;
    total: number;
  };

  // ✅ NOVO: Resistências
  resistenciasFinais: Map<string, number>; // codigo → valor total
  resistenciasDetalhadas: {
    deEquipamentos: Map<string, number>;
    deHabilidades: Map<string, number>;
  };

  // ✅ NOVO: Itens do inventário calculados (com detalhes completos)
  itensInventarioCalculados?: ItemInventarioCalculado[];

  // Auxiliares úteis (para resposta do preview)
  bonusHabilidades: Array<{
    habilidadeNome: string;
    tipoGrauCodigo: string;
    valor: number;
    escalonamentoPorNivel: Prisma.JsonValue | null;
  }>;

  // Info p/ UI (preview)
  grausLivresInfo: {
    base: number;
    deHabilidades: number;
    deIntelecto: number;
    total: number;
    gastos: number;
  };

  periciasLivresInfo: {
    base: number;
    deIntelecto: number;
    total: number;
  };
};
