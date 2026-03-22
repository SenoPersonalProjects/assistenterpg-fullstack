// prisma/seeds/catalogos/equipamentos-ferramentas-amaldicoadas.ts
// ARQUIVO COMPLETO E CORRIGIDO - SEM ERROS DE TIPO

import type { PrismaClient } from '@prisma/client';

import {
  TipoEquipamento,
  TipoDano,
  TipoReducaoDano,
  TipoArma,
  AlcanceArma,
  EmpunhaduraArma,
  ProficienciaArma,
  ComplexidadeMaldicao,
  TipoUsoEquipamento,
  CategoriaEquipamento,
} from '@prisma/client';

// ============================================================
// TIPOS AUXILIARES
// ============================================================

interface DanoData {
  empunhadura?: EmpunhaduraArma | null;
  tipoDano: TipoDano;
  rolagem: string;
  valorFlat: number;
}

interface ReducaoDanoData {
  tipoReducao: TipoReducaoDano;
  valor: number;
}

interface ArmaAmaldicoadaData {
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito: string;
  empunhaduras: EmpunhaduraArma[];
  danos: DanoData[];
}

interface ProtecaoAmaldicoadaData {
  tipoBase: string;
  bonusDefesa: number;
  penalidadeCarga: number;
  proficienciaRequerida: boolean;
  efeito: string;
  reducoesDano: ReducaoDanoData[];
}

interface ArtefatoAmaldicoadoData {
  tipoBase: string;
  proficienciaRequerida: boolean;
  efeito: string;
  custoUso: string;
  manutencao: string;
}

interface EquipamentoComArmaData {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  proficienciaArma?: ProficienciaArma;
  tipoArma?: TipoArma;
  alcance?: AlcanceArma;
  agil?: boolean;
  tipoUso: TipoUsoEquipamento; // ✅ ADICIONAR
  armaAmaldicoada: ArmaAmaldicoadaData;
}

interface EquipamentoComProtecaoData {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoUso: TipoUsoEquipamento; // ✅ ADICIONAR
  protecaoAmaldicoada: ProtecaoAmaldicoadaData;
}

interface EquipamentoComArtefatoData {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoUso: TipoUsoEquipamento; // ✅ ADICIONAR
  artefatoAmaldicoado: ArtefatoAmaldicoadoData;
}


// ============================================================
// ARMAS COM MALDIÇÕES SIMPLES
// ============================================================

const armasSimplesMaldadas: EquipamentoComArmaData[] = [
  {
    codigo: 'FACA_AMALDICOADA_SIMPLES',
    nome: 'Faca Amaldiçoada',
    descricao:
      'Uma faca afiada com maldição simples imbuída. Acrescenta +1 dado de dano em energia amaldiçoada e permite exorcizar espíritos amaldiçoados.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (FACA: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'FACA',
      proficienciaRequerida: false,
      efeito: '+1d4 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '1d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d4', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MARTELO_AMALDICOADA_SIMPLES',
    nome: 'Martelo Amaldiçoado',
    descricao: 'Martelo com maldição simples imbuída.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRIGIDO (MARTELO: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MARTELO',
      proficienciaRequerida: false,
      efeito: '+1d4 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.IMPACTO, rolagem: '1d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d4', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'PUNHAL_AMALDICOADA_SIMPLES',
    nome: 'Punhal Amaldiçoado',
    descricao: 'Punhal com maldição simples imbuída.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (PUNHAL: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'PUNHAL',
      proficienciaRequerida: false,
      efeito: '+1d4 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.PERFURANTE, rolagem: '1d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d4', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'SOQUEIRA_AMALDICOADA_SIMPLES',
    nome: 'Soqueira Amaldiçoada',
    descricao:
      'Uma soqueira com maldição simples imbuída. Acrescenta +1d6 de dano em energia amaldiçoada e permite exorcizar espíritos amaldiçoados.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (SOQUEIRA: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    tipoArma: TipoArma.CORPO_A_CORPO,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'SOQUEIRA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        {
          empunhadura: EmpunhaduraArma.LEVE,
          tipoDano: TipoDano.IMPACTO,
          rolagem: '1d4',
          valorFlat: 1,
        },
        {
          empunhadura: EmpunhaduraArma.LEVE,
          tipoDano: TipoDano.ENERGIA_AMALDICOADA,
          rolagem: '1d6',
          valorFlat: 0,
        },
      ],
    },
  },
  {
    codigo: 'MACHADINHA_AMALDICOADA_SIMPLES',
    nome: 'Machadinha Amaldiçoada',
    descricao: 'Machadinha com maldição simples. Pode ser arremessada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (MACHADINHA: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.CURTO,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MACHADINHA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos. Pode arremessar.',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'BASTAO_AMALDICOADA_SIMPLES',
    nome: 'Bastão Amaldiçoado',
    descricao: 'Bastão com maldição simples. 1 mão: 1d6+1d6 amaldiçoado | 2 mãos: 1d8+1d8 amaldiçoado.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (BASTAO: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'BASTAO',
      proficienciaRequerida: false,
      efeito: '+1d6 energia (1 mão) ou +1d8 (2 mãos). Exorciza.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MACHETE_AMALDICOADA_SIMPLES',
    nome: 'Machete Amaldiçoado',
    descricao: 'Machete com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (MACHETE: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MACHETE',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'LANCA_AMALDICOADA_SIMPLES',
    nome: 'Lança Amaldiçoada',
    descricao: 'Lança com maldição simples. Pode ser arremessada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (LANCA: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'LANCA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza. Pode arremessar.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.PERFURANTE, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'CORRENTE_AMALDICOADA_SIMPLES',
    nome: 'Corrente Amaldiçoada',
    descricao: 'Corrente com maldição simples. +2 desarmar/derrubar.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (CORRENTE: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'CORRENTE',
      proficienciaRequerida: false,
      efeito: '+1d8 energia. Exorciza. +2 desarmar/derrubar.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ESPADA_AMALDICOADA_SIMPLES',
    nome: 'Espada Amaldiçoada',
    descricao: 'Espada com maldição simples. 1 mão: 1d8+1d8 | 2 mãos: 1d10+1d10.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRETO (ESPADA: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'ESPADA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia (1 mão) ou +1d10 (2 mãos). Exorciza.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d10', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d10', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'FLORETE_AMALDICOADA_SIMPLES',
    nome: 'Florete Amaldiçoado',
    descricao: 'Florete com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRETO (FLORETE: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'FLORETE',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.PERFURANTE, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MACHADO_AMALDICOADA_SIMPLES',
    nome: 'Machado Amaldiçoado',
    descricao: 'Machado com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRETO (MACHADO: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MACHADO',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MACA_AMALDICOADA_SIMPLES',
    nome: 'Maça Amaldiçoada',
    descricao: 'Maça com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRETO (MACA: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MACA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '2d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MARRETA_AMALDICOADA_SIMPLES',
    nome: 'Marreta Amaldiçoada',
    descricao: 'Marreta com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRETO (MARRETA: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MARRETA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'NUNCHAKU_AMALDICOADA_SIMPLES',
    nome: 'Nunchaku Amaldiçoado',
    descricao: 'Nunchaku com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (NUNCHAKU: 0 → 4)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'NUNCHAKU',
      proficienciaRequerida: false,
      efeito: '+1d8 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'CAJADO_AMALDICOADA_SIMPLES',
    nome: 'Cajado Amaldiçoado',
    descricao: 'Cajado com maldição simples. Combater Duas Armas.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (CAJADO: 0 → 4)
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'CAJADO',
      proficienciaRequerida: false,
      efeito: '+1d6 energia. Exorciza. Combater Duas Armas.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ACHA_AMALDICOADA_SIMPLES',
    nome: 'Acha Amaldiçoada',
    descricao: 'Acha com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (ACHA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'ACHA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d12', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'GADANHO_AMALDICOADA_SIMPLES',
    nome: 'Gadanho Amaldiçoado',
    descricao: 'Gadanho com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (GADANHO: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'GADANHO',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '2d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'KATANA_AMALDICOADA_SIMPLES',
    nome: 'Katana Amaldiçoada',
    descricao: 'Katana com maldição simples. Luta: 1 mão.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (KATANA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'KATANA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia amaldiçoada. Exorciza. Luta: 1 mão.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d10', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MONTANTE_AMALDICOADA_SIMPLES',
    nome: 'Montante Amaldiçoado',
    descricao: 'Montante com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (MONTANTE: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MONTANTE',
      proficienciaRequerida: false,
      efeito: '+1d8 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '3d4', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MOTOSSERRA_AMALDICOADA_SIMPLES',
    nome: 'Motosserra Amaldiçoada',
    descricao: 'Motosserra com maldição simples. Reroll 6s em dano.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (MOTOSSERRA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'MOTOSSERRA',
      proficienciaRequerida: false,
      efeito: '+2d6 energia. Exorciza. Reroll 6s. Penalidade -0.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '3d6', valorFlat: 0 },
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '2d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ARCO_AMALDICOADA_SIMPLES',
    nome: 'Arco Amaldiçoado',
    descricao: 'Arco com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4, // ✅ CORRETO (ARCO: 0 → 4)
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.MEDIO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'ARCO',
      proficienciaRequerida: false,
      efeito: '+1d4 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.PERFURANTE, rolagem: '1d6', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d4', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'BESTA_AMALDICOADA_SIMPLES',
    nome: 'Besta Amaldiçoada',
    descricao: 'Besta com maldição simples. Requer ação movimento recarregar.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (BESTA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.MEDIO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'BESTA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia. Exorciza. 1 ação movimento recarregar.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.PERFURANTE, rolagem: '1d8', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ARCO_COMPOSTO_AMALDICOADA_SIMPLES',
    nome: 'Arco Composto Amaldiçoado',
    descricao: 'Arco composto com maldição simples. +FOR ao dano.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (ARCO_COMPOSTO: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.LONGO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'ARCO_COMPOSTO',
      proficienciaRequerida: false,
      efeito: '+1d6 energia. Exorciza. +FOR ao dano.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.PERFURANTE, rolagem: '1d10', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'BALESTRA_AMALDICOADA_SIMPLES',
    nome: 'Balestra Amaldiçoada',
    descricao: 'Balestra com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (BALESTRA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.LONGO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'BALESTRA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia. Exorciza. 1 ação movimento recarregar.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.PERFURANTE, rolagem: '1d12', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'PISTOLA_AMALDICOADA_SIMPLES',
    nome: 'Pistola Amaldiçoada',
    descricao: 'Pistola com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (PISTOLA: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'PISTOLA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '1d12', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'REVOLVER_AMALDICOADA_SIMPLES',
    nome: 'Revólver Amaldiçoado',
    descricao: 'Revólver com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (REVOLVER: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'REVOLVER',
      proficienciaRequerida: false,
      efeito: '+1d6 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d6', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'SUBMETRALHADORA_AMALDICOADA_SIMPLES',
    nome: 'Submetralhadora Amaldiçoada',
    descricao: 'Submetralhadora com maldição simples. Automática.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (SUBMETRALHADORA: 4 → 3)
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'SUBMETRALHADORA',
      proficienciaRequerida: false,
      efeito: '+1d6 energia. Exorciza. Automática.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d6', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'FUZIL_CACA_AMALDICOADA_SIMPLES',
    nome: 'Fuzil de Caça Amaldiçoado',
    descricao: 'Fuzil de caça com maldição simples.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (FUZIL_CACA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.MEDIO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'FUZIL_CACA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia amaldiçoada. Exorciza espíritos.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d8', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ESPINGARDA_AMALDICOADA_SIMPLES',
    nome: 'Espingarda Amaldiçoada',
    descricao: 'Espingarda com maldição simples. Meia dano em alcance médio+.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (ESPINGARDA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'ESPINGARDA',
      proficienciaRequerida: false,
      efeito: '+1d8 energia. Exorciza. Meia dano alcance médio+.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '4d6', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'FUZIL_ASSALTO_AMALDICOADA_SIMPLES',
    nome: 'Fuzil de Assalto Amaldiçoado',
    descricao: 'Fuzil de assalto com maldição simples. Automática.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2, // ✅ CORRIGIDO (FUZIL_ASSALTO: 3 → 2)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.MEDIO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'FUZIL_ASSALTO',
      proficienciaRequerida: false,
      efeito: '+1d8 energia. Exorciza. Automática.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d10', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'FUZIL_PRECISAO_AMALDICOADA_SIMPLES',
    nome: 'Fuzil de Precisão Amaldiçoado',
    descricao: 'Fuzil de precisão com maldição simples. +5 margem ameaça (Pontaria).',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_1, // ✅ CORRETO (FUZIL_PRECISAO: 2 → 1)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.EXTREMO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'FUZIL_PRECISAO',
      proficienciaRequerida: false,
      efeito: '+1d8 energia. Exorciza. +5 margem ameaça (Pontaria).',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d10', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'METRALHADORA_AMALDICOADA_SIMPLES',
    nome: 'Metralhadora Amaldiçoada',
    descricao: 'Metralhadora com maldição simples. Automática. FOR 4+ ou tripé.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3, // ✅ CORRIGIDO (METRALHADORA: 4 → 3)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.LONGO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'METRALHADORA',
      proficienciaRequerida: false,
      efeito: '+1d10 energia. Exorciza. Automática. FOR 4+ ou tripé.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.BALISTICO, rolagem: '2d12', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d10', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'LANCA_CHAMAS_AMALDICOADA_SIMPLES',
    nome: 'Lança-chamas Amaldiçoado',
    descricao: 'Lança-chamas com maldição simples. Linha 1,5m. Alvos em chamas.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_1, // ✅ CORRETO (LANCA_CHAMAS: 2 → 1)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'LANCA_CHAMAS',
      proficienciaRequerida: false,
      efeito: '+1d10 energia. Exorciza. Linha 1,5m. Alvos em chamas.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.FOGO, rolagem: '6d6', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '1d10', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'BAZUCA_AMALDICOADA_SIMPLES',
    nome: 'Bazuca Amaldiçoada',
    descricao: 'Bazuca com maldição simples. Raio 3m. Reflexos meia dano.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_1, // ✅ CORRETO (BAZUCA: 2 → 1)
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.LONGO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {
      tipoBase: 'BAZUCA',
      proficienciaRequerida: false,
      efeito: '+2d8 energia. Exorciza. Raio 3m. Reflexos meia.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { tipoDano: TipoDano.FOGO, rolagem: '10d8', valorFlat: 0 },
        { tipoDano: TipoDano.ENERGIA_AMALDICOADA, rolagem: '2d8', valorFlat: 0 },
      ],
    },
  },
];


// ============================================================
// PROTEÇÕES COM MALDIÇÕES SIMPLES
// ============================================================

const protecoesSimplesMaldadas: EquipamentoComProtecaoData[] = [
  {
    codigo: 'PROTECAO_LEVE_AMALDICOADA_SIMPLES',
    nome: 'Proteção Leve Amaldiçoada',
    descricao:
      'Jaqueta de couro pesada ou colete de kevlar com maldição simples. +5 DEF. Acumula com proteção normal. +5 RD contra energia amaldiçoada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    protecaoAmaldicoada: {
      tipoBase: 'PROTECAO_LEVE',
      bonusDefesa: 5,
      penalidadeCarga: 0,
      proficienciaRequerida: false,
      efeito: 'Acumula com proteção normal. +3 RD contra energia amaldiçoada.',
      reducoesDano: [
        { tipoReducao: TipoReducaoDano.ENERGIA_AMALDICOADA, valor: 3 } // ✅ CORRIGIDO
      ],
    },
  },
  {
    codigo: 'PROTECAO_PESADA_AMALDICOADA_SIMPLES',
    nome: 'Proteção Pesada Amaldiçoada',
    descricao:
      'Equipamento de forças especiais com maldição simples. RD 2 física + 5 RD energia amaldiçoada. +10 DEF. Penalidade -5 perícias carga.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 5,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    protecaoAmaldicoada: {
      tipoBase: 'PROTECAO_PESADA',
      bonusDefesa: 10,
      penalidadeCarga: -5,
      proficienciaRequerida: false,
      efeito: 'RD 2 dano físico + RD 5 energia amaldiçoada. Penalidade -5 perícias carga.',
      reducoesDano: [
        { tipoReducao: TipoReducaoDano.FISICO, valor: 2 },                    // ✅ Termo guarda-chuva
        { tipoReducao: TipoReducaoDano.ENERGIA_AMALDICOADA, valor: 5 },      // ✅ CORRIGIDO
      ],
    },
  },
  {
    codigo: 'ESCUDO_AMALDICOADA_SIMPLES',
    nome: 'Escudo Amaldiçoado',
    descricao: 'Escudo medieval/moderno com maldição simples. +2 DEF. Acumula com proteção. +5 RD energia amaldiçoada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoUso: TipoUsoEquipamento.GERAL,
    protecaoAmaldicoada: {
      tipoBase: 'ESCUDO',
      bonusDefesa: 2,
      penalidadeCarga: 0,
      proficienciaRequerida: false,
      efeito: 'Acumula com proteção. +5 RD contra energia amaldiçoada.',
      reducoesDano: [
        { tipoReducao: TipoReducaoDano.ENERGIA_AMALDICOADA, valor: 5 } // ✅ CORRIGIDO
      ],
    },
  },

  // ✅ UNIFORMES DA ESCOLA TÉCNICA
  {
    codigo: 'UNIFORME_ESCOLA_TECNICA_DEFESA',
    nome: 'Uniforme de Aluno (Escola Técnica) - Defesa',
    descricao: 'Uniforme personalizado para alunos da Escola Técnica Jujutsu. +4 DEF.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    protecaoAmaldicoada: {
      tipoBase: 'PROTECAO_LEVE',
      bonusDefesa: 4,
      penalidadeCarga: 0,
      proficienciaRequerida: false,
      efeito: 'Uniforme padrão da Escola Técnica Jujutsu. Fornece +4 na Defesa.',
      reducoesDano: [],
    },
  },
  {
    codigo: 'UNIFORME_ESCOLA_TECNICA_RD',
    nome: 'Uniforme de Aluno (Escola Técnica) - Resistência',
    descricao: 'Uniforme personalizado para alunos da Escola Técnica Jujutsu. +2 RD contra energia amaldiçoada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    protecaoAmaldicoada: {
      tipoBase: 'PROTECAO_LEVE',
      bonusDefesa: 0,
      penalidadeCarga: 0,
      proficienciaRequerida: false,
      efeito: 'Uniforme padrão da Escola Técnica Jujutsu. Fornece +2 RD contra energia amaldiçoada.',
      reducoesDano: [
        { tipoReducao: TipoReducaoDano.ENERGIA_AMALDICOADA, valor: 2 } // ✅ CORRIGIDO
      ],
    },
  },
];

// ============================================================
// ARMAS AMALDIÇOADAS (MALDIÇÕES COMPLEXAS)
// ============================================================

const armasAmaldicoadasComplexas: EquipamentoComArmaData[] = [
  {
    codigo: 'CACADORA_CABECAS',
    nome: 'Caçadora de Cabeças',
    descricao:
      'Um rifle de precisão Blaser R93 Luxus amaldiçoado. Quando você tem um alvo na mente e sabe onde ele está, seus tiros passam através de qualquer obstáculo.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.EXTREMO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'RIFLE',
      proficienciaRequerida: true,
      efeito: 'Ignora cobertura contra alvo específico na mente',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.BALISTICO, rolagem: '2d10', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'ESPADA_VIDA_APODRECIDA',
    nome: 'Espada de Vida Apodrecida',
    descricao: 'Espada curta que dispara projéteis após acertos críticos com ovos de insetos.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'ESPADA_CURTA',
      proficienciaRequerida: true,
      efeito: 'Após crítico: lança projéteis + ovos de insetos (explodem 4 rodadas causando 1d6 por ovo)',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'KATANA_DEVORADORA_ALMAS',
    nome: 'Katana Devoradora de Almas',
    descricao: 'Katana que ignora RD e o dano não pode ser curado durante combate.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'KATANA',
      proficienciaRequerida: true,
      efeito: 'Ignora RD. Dano não curado em combate. Veteranos Luta: 1 mão.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '2d12', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'LAMINA_INVERTIDA_PARAISO',
    nome: 'Lâmina Invertida do Paraíso',
    descricao: 'Faca que interrompe feitiços e encantamentos Jujutsu instantaneamente.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'FACA',
      proficienciaRequerida: true,
      efeito: 'Interrompe feitiços e encantamentos Jujutsu instantaneamente',
      empunhaduras: [EmpunhaduraArma.LEVE],
      danos: [
        { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '2d6', valorFlat: 2 },
      ],
    },
  },
  {
    codigo: 'MACHADO_EXECUTOR',
    nome: 'Machado do Executor',
    descricao: 'Machado imenso (1,80m). Exige Força 3 sem penalidade.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'MACHADO',
      proficienciaRequerida: true,
      efeito: 'Exige Força 3 para usar sem penalidade',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '2d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'MAO_INIMIGA',
    nome: 'Mão Inimiga',
    descricao: 'Lâmina que age com vontade própria. Pode atacar sem ser empunhada (2 EA por ação).',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'KATANA',
      proficienciaRequerida: true,
      efeito: 'Age própria vontade (2 EA/ação). Sentir presenças (2 PE).',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d10', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'NUVEM_BRINCALHONA',
    nome: 'Nuvem Brincalhona',
    descricao: 'Bastão que fornece +3 ataque. Dano = 1d8 por Força + 2 ataque por Agilidade.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'BASTAO',
      proficienciaRequerida: true,
      efeito: 'Dano = 1d8 por Força + 2 ataque por Agilidade',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d8', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'OSSO_DRAGAO',
    nome: 'Osso de Dragão',
    descricao: 'Espada que fornece +4 ataque. Ganha 1 carga por ataque. 2 PE + 1 carga = +5 ataque ou dano.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'ESPADA_GRANDE',
      proficienciaRequerida: true,
      efeito: 'Ganha 1 carga/ataque. 2 PE + 1 carga = +5 ataque/dano. Veteranos: 1 mão.',
      empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
      danos: [
        { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '2d12', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'REVOLVER_TRAPACEIRO',
    nome: 'Revólver do Trapaceiro',
    descricao:
      'Revólver que forma bala especial (crítico garantido + 1d) ao gastar 6 balas (1 PE + 1 EA).',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.CURTO,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'REVOLVER',
      proficienciaRequerida: true,
      efeito: 'Bala especial (1 PE + 1 EA): crítico garantido + 1d dano.',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.BALISTICO, rolagem: '2d6', valorFlat: 0 },
      ],
    },
  },
  {
    codigo: 'TOZANA',
    nome: 'Tozana',
    descricao: 'Facão que ganha +3 dano fixo quando imbuído com energia amaldiçoada.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    alcance: AlcanceArma.ADJACENTE,
    agil: false,
    tipoUso: TipoUsoEquipamento.GERAL,
    armaAmaldicoada: {

      tipoBase: 'FACAO',
      proficienciaRequerida: true,
      efeito: '+3 dano fixo quando imbuída com energia amaldiçoada',
      empunhaduras: [EmpunhaduraArma.UMA_MAO],
      danos: [
        { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8', valorFlat: 3 },
      ],
    },
  },
];


// ============================================================
// PROTEÇÕES AMALDIÇOADAS (MALDIÇÕES COMPLEXAS)
// ============================================================

const protecoesAmaldicoadasComplexas: EquipamentoComProtecaoData[] = [
  {
    codigo: 'UNIFORME_ESQUADRAO_EXTERMINIO_PRETO',
    nome: 'Uniforme do Esquadrão de Extermínio Preto',
    descricao: 'Uniforme da central 92. +5 DEF, +5 RD contra qualquer dano, +10 Intimidação.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    protecaoAmaldicoada: {
      tipoBase: 'VESTIVEL',
      bonusDefesa: 5,
      penalidadeCarga: 0,
      proficienciaRequerida: true,
      efeito: '+5 RD contra qualquer dano, +10 Intimidação',
      reducoesDano: [
        { tipoReducao: TipoReducaoDano.DANO, valor: 5 } // ✅ CORRIGIDO (termo guarda-chuva máximo)
      ],
    },
  },
];

// ============================================================
// ARTEFATOS AMALDIÇOADOS
// ============================================================

const artefatosAmaldicoadasSeed: EquipamentoComArtefatoData[] = [
  {
    codigo: 'CORACAO_MALDITO',
    nome: 'Coração Maldito',
    descricao: 'Coração pulsando que reduz dano pela metade como reação. Deve ser drenado 1x dia.',
    tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.GERAL,
    artefatoAmaldicoado: {
      tipoBase: 'ARTEFATO_CONSUMIVEL',
      proficienciaRequerida: true,
      efeito: 'Reduz dano metade (1 reação). Deve drenar 1x/dia.',
      custoUso: 'Teste Fortitude (DT 15 + 5 por uso extra/dia). Falha: item destruído.',
      manutencao: 'Drenar 1x/dia ou sangue danificará compartimentos.',
    },
  },
];

// ============================================================
// HELPER
// ============================================================

type EquipamentoSeedData = EquipamentoComArmaData | EquipamentoComProtecaoData | EquipamentoComArtefatoData;

function criarEquipamentoCatalogoBase(
  equipamento: EquipamentoSeedData,
  complexidadeMaldicao: ComplexidadeMaldicao,
) {
  const equipData = { ...(equipamento as any) };

  delete (equipData as any).armaAmaldicoada;
  delete (equipData as any).protecaoAmaldicoada;
  delete (equipData as any).artefatoAmaldicoado;

  return {
    ...equipData,
    complexidadeMaldicao,
  };
}

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedFerramentasAmaldicoadas(prisma: PrismaClient) {
  console.log('📌 Cadastrando ferramentas amaldiçoadas...');

  // Armas com maldições simples
  console.log(
    ` → Cadastrando armas com maldições simples (${armasSimplesMaldadas.length} itens)...`,
  );

  for (const data of armasSimplesMaldadas) {
    const equipamentoBase = criarEquipamentoCatalogoBase(
      data,
      ComplexidadeMaldicao.SIMPLES,
    );

    const empunhadurasJson = data.armaAmaldicoada.empunhaduras
      ? JSON.stringify(data.armaAmaldicoada.empunhaduras)
      : null;

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...equipamentoBase,
        empunhaduras: empunhadurasJson,
      },
      create: {
        ...equipamentoBase,
        empunhaduras: empunhadurasJson,
      },
    });

    const armaData = {
      equipamentoId: equipamento.id,
      tipoBase: data.armaAmaldicoada.tipoBase,
      proficienciaRequerida: data.armaAmaldicoada.proficienciaRequerida,
      efeito: data.armaAmaldicoada.efeito,
    };

    await prisma.armaAmaldicoada.upsert({
      where: { equipamentoId: equipamento.id },
      update: armaData,
      create: armaData,
    });

    await prisma.equipamentoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (const dano of data.armaAmaldicoada.danos) {
      const empunhadura = dano.empunhadura ?? null;

      await prisma.equipamentoDano.create({
        data: {
          equipamentoId: equipamento.id,
          empunhadura,
          tipoDano: dano.tipoDano,
          rolagem: dano.rolagem,
          valorFlat: dano.valorFlat,
        },
      });
    }

    console.log(`  ✓ ${data.nome}`);
  }

  // Proteções com maldições simples
  console.log(
    ` → Cadastrando proteções com maldições simples (${protecoesSimplesMaldadas.length} itens)...`,
  );

  for (const data of protecoesSimplesMaldadas) {
    const equipamentoBase = criarEquipamentoCatalogoBase(
      data,
      ComplexidadeMaldicao.SIMPLES,
    );

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: equipamentoBase,
      create: equipamentoBase,
    });

    const protecaoData = {
      equipamentoId: equipamento.id,
      tipoBase: data.protecaoAmaldicoada.tipoBase,
      bonusDefesa: data.protecaoAmaldicoada.bonusDefesa,
      penalidadeCarga: data.protecaoAmaldicoada.penalidadeCarga,
      proficienciaRequerida: data.protecaoAmaldicoada.proficienciaRequerida,
      efeito: data.protecaoAmaldicoada.efeito,
    };

    await prisma.protecaoAmaldicoada.upsert({
      where: { equipamentoId: equipamento.id },
      update: protecaoData,
      create: protecaoData,
    });

    await prisma.equipamentoReducaoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (const reducao of data.protecaoAmaldicoada.reducoesDano) {
      await prisma.equipamentoReducaoDano.create({
        data: {
          equipamentoId: equipamento.id,
          tipoReducao: reducao.tipoReducao,
          valor: reducao.valor,
        },
      });
    }

    console.log(`  ✓ ${data.nome}`);
  }

  // Armas com maldições complexas
  console.log(
    ` → Cadastrando armas amaldiçoadas (maldições complexas - ${armasAmaldicoadasComplexas.length} itens)...`,
  );

  for (const data of armasAmaldicoadasComplexas) {
    const equipamentoBase = criarEquipamentoCatalogoBase(
      data,
      ComplexidadeMaldicao.COMPLEXA,
    );

    const empunhadurasJson = data.armaAmaldicoada.empunhaduras
      ? JSON.stringify(data.armaAmaldicoada.empunhaduras)
      : null;

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...equipamentoBase,
        empunhaduras: empunhadurasJson,
      },
      create: {
        ...equipamentoBase,
        empunhaduras: empunhadurasJson,
      },
    });

    const armaData = {
      equipamentoId: equipamento.id,
      tipoBase: data.armaAmaldicoada.tipoBase,
      proficienciaRequerida: data.armaAmaldicoada.proficienciaRequerida,
      efeito: data.armaAmaldicoada.efeito,
    };

    await prisma.armaAmaldicoada.upsert({
      where: { equipamentoId: equipamento.id },
      update: armaData,
      create: armaData,
    });

    await prisma.equipamentoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (const dano of data.armaAmaldicoada.danos) {
      const empunhadura = dano.empunhadura ?? null;

      await prisma.equipamentoDano.create({
        data: {
          equipamentoId: equipamento.id,
          empunhadura,
          tipoDano: dano.tipoDano,
          rolagem: dano.rolagem,
          valorFlat: dano.valorFlat,
        },
      });
    }

    console.log(`  ✓ ${data.nome}`);
  }

  // Proteções com maldições complexas
  console.log(
    ` → Cadastrando proteções amaldiçoadas (maldições complexas - ${protecoesAmaldicoadasComplexas.length} item)...`,
  );

  for (const data of protecoesAmaldicoadasComplexas) {
    const equipamentoBase = criarEquipamentoCatalogoBase(
      data,
      ComplexidadeMaldicao.COMPLEXA,
    );

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: equipamentoBase,
      create: equipamentoBase,
    });

    const protecaoData = {
      equipamentoId: equipamento.id,
      tipoBase: data.protecaoAmaldicoada.tipoBase,
      bonusDefesa: data.protecaoAmaldicoada.bonusDefesa,
      penalidadeCarga: data.protecaoAmaldicoada.penalidadeCarga,
      proficienciaRequerida: data.protecaoAmaldicoada.proficienciaRequerida,
      efeito: data.protecaoAmaldicoada.efeito,
    };

    await prisma.protecaoAmaldicoada.upsert({
      where: { equipamentoId: equipamento.id },
      update: protecaoData,
      create: protecaoData,
    });

    await prisma.equipamentoReducaoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (const reducao of data.protecaoAmaldicoada.reducoesDano) {
      await prisma.equipamentoReducaoDano.create({
        data: {
          equipamentoId: equipamento.id,
          tipoReducao: reducao.tipoReducao,
          valor: reducao.valor,
        },
      });
    }

    console.log(`  ✓ ${data.nome}`);
  }

  // Artefatos
  console.log(
    ` → Cadastrando artefatos amaldiçoados (${artefatosAmaldicoadasSeed.length} item)...`,
  );

  for (const data of artefatosAmaldicoadasSeed) {
    const equipamentoBase = criarEquipamentoCatalogoBase(
      data,
      ComplexidadeMaldicao.COMPLEXA,
    );

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: equipamentoBase,
      create: equipamentoBase,
    });

    const artefatoData = {
      equipamentoId: equipamento.id,
      tipoBase: data.artefatoAmaldicoado.tipoBase,
      proficienciaRequerida: data.artefatoAmaldicoado.proficienciaRequerida,
      efeito: data.artefatoAmaldicoado.efeito,
      custoUso: data.artefatoAmaldicoado.custoUso,
      manutencao: data.artefatoAmaldicoado.manutencao,
    };

    await prisma.artefatoAmaldicoado.upsert({
      where: { equipamentoId: equipamento.id },
      update: artefatoData,
      create: artefatoData,
    });

    console.log(`  ✓ ${data.nome}`);
  }

  const total =
    armasSimplesMaldadas.length +
    protecoesSimplesMaldadas.length +
    armasAmaldicoadasComplexas.length +
    protecoesAmaldicoadasComplexas.length +
    artefatosAmaldicoadasSeed.length;

  console.log(
    `✅ Ferramentas amaldiçoadas cadastradas com sucesso! (${total} itens totais)`,
  );
}
