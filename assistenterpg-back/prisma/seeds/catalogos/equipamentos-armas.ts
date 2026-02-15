// prisma/seeds/catalogos/equipamentos-armas.ts

import type { PrismaClient } from '@prisma/client';
import {
  TipoEquipamento,
  TipoDano,
  TipoArma,
  ProficienciaArma,
  EmpunhaduraArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  TipoAmaldicoado,
  TipoUsoEquipamento,
  CategoriaEquipamento,
  TipoFonte, // ✅ NOVO
} from '@prisma/client';

// ========================================
// ✅ TIPOS AUXILIARES PARA SEED
// ========================================

interface EquipamentoArmaSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  proficienciaArma: ProficienciaArma;
  empunhaduras: EmpunhaduraArma[];
  tipoArma: TipoArma;
  subtipoDistancia?: SubtipoArmaDistancia;
  agil: boolean;
  danos: Array<{
    empunhadura?: EmpunhaduraArma;
    tipoDano: TipoDano;
    rolagem: string;
    valorFlat?: number;
  }>;
  criticoValor: number;
  criticoMultiplicador: number;
  alcance: AlcanceArma;
  tipoMunicaoCodigo?: string | null;
  habilidadeEspecial?: string | null;
  tipoUso: TipoUsoEquipamento;
  tipoAmaldicoado?: TipoAmaldicoado | null;
}

// ========================================
// ✅ CATÁLOGO DE ARMAS - SEEDS
// ========================================

export const equipamentosArmasSeed: EquipamentoArmaSeed[] = [
  // ============================================================
  // CORPO A CORPO - LEVES (Categoria 0)
  // ============================================================
  {
    codigo: 'FACA',
    nome: 'Faca',
    descricao: 'Uma lâmina afiada, como uma navalha, uma faca de churrasco ou uma faca militar. É uma arma ágil e pode ser arremessada.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '1d4' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Pode ser arremessada',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'CORONHADA',
    nome: 'Coronhada',
    descricao: 'Ataque improvisado com a coronha de uma arma de fogo. ',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 0,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.IMPACTO, rolagem: '1d4' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MARTELO',
    nome: 'Martelo',
    descricao: 'Esta ferramenta comum pode ser usada como arma na falta de opções melhores.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.IMPACTO, rolagem: '1d4' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'PUNHAL',
    nome: 'Punhal',
    descricao: 'Uma faca de lâmina longa e pontiaguda, usada por cultistas em seus rituais. É uma arma ágil.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.PERFURANTE, rolagem: '1d4' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MACHADINHA',
    nome: 'Machadinha',
    descricao: 'Ferramenta útil para cortar madeira, muito comum em fazendas e canteiros de obras. Pode ser arremessada.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Pode ser arremessada',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // CORPO A CORPO - UMA MÃO (Categoria 0-1)
  // ============================================================
  {
    codigo: 'BASTAO',
    nome: 'Bastão',
    descricao: 'Um cilindro de madeira maciça. Pode ser um taco de beisebol, um cassetete, uma tonfa ou uma clava. Pode ser empunhado com uma mão (dano 1d6) ou com as duas (dano 1d8).',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d6' },
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d8' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MACHETE',
    nome: 'Machete',
    descricao: 'Uma lâmina longa e larga, muito usada como ferramenta para abrir trilhas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d6' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'LANCA',
    nome: 'Lança',
    descricao: 'Uma haste de madeira com uma ponta metálica afiada. Arma arcaica ainda usada por artistas marciais. Pode ser arremessada.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.PERFURANTE, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Pode ser arremessada',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'CORRENTE',
    nome: 'Corrente',
    descricao: 'Um pedaço de corrente grossa pode ser usado como arma. Fornece +2 em testes para desarmar e derrubar.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d8' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: '+2 em testes para desarmar e derrubar',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'ESPADA',
    nome: 'Espada',
    descricao: 'Uma arma medieval, como uma espada longa dos cavaleiros europeus ou uma cimitarra sarracena. Pode ser empunhada com uma mão (dano 1d8) ou com as duas (dano 1d10).',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8' },
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d10' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'FLORETE',
    nome: 'Florete',
    descricao: 'Esta espada de lâmina fina e comprida é usada por esgrimistas. É uma arma ágil.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.PERFURANTE, rolagem: '1d6' }
    ],
    criticoValor: 18,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MACHADO',
    nome: 'Machado',
    descricao: 'Uma ferramenta importante para lenhadores e bombeiros. Um machado pode causar ferimentos terríveis.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MACA',
    nome: 'Maça',
    descricao: 'Bastão com uma cabeça metálica cheia de protuberâncias.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '2d4' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MARRETA',
    nome: 'Marreta',
    descricao: 'Normalmente usada para demolir paredes, também pode ser usada para demolir pessoas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'NUNCHAKU',
    nome: 'Nunchaku',
    descricao: 'Dois bastões curtos de madeira ligados por uma corrente. É uma arma ágil.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d8' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // CORPO A CORPO - DUAS MÃOS (Categoria 0-2)
  // ============================================================
  {
    codigo: 'CAJADO',
    nome: 'Cajado',
    descricao: 'Um cabo de madeira ou barra de ferro longos. Inclui o bo usado em artes marciais. É uma arma ágil e pode ser usada com Combater com Duas Armas para fazer ataques adicionais.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Pode ser usado com Combater com Duas Armas',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'ACHA',
    nome: 'Acha',
    descricao: 'Um machado grande e pesado, usado no corte de árvores largas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d12' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'GADANHO',
    nome: 'Gadanho',
    descricao: 'Uma ferramenta agrícola, o gadanho é uma versão maior da foice. Pode ceifar cereais e vidas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '2d4' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 4,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'KATANA',
    nome: 'Katana',
    descricao: 'Originária do Japão, esta espada longa e levemente curvada transcendeu os séculos. É uma arma ágil.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO, EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      { empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.CORTANTE, rolagem: '1d8' },
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '1d10' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Veteranos em Luta: podem usar com uma mão apenas',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MONTANTE',
    nome: 'Montante',
    descricao: 'Enorme e pesada, esta espada de 1,5 m de comprimento foi uma das armas mais poderosas em seu tempo.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '3d4' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'MOTOSSERRA',
    nome: 'Motosserra',
    descricao: 'Uma ferramenta capaz de causar ferimentos profundos. Sempre que rolar um 6 em um dado de dano, role um dado adicional. Desajeitada, impõe penalidade -0 nos testes de ataque. Requer ação de movimento para ligar.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      { empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.CORTANTE, rolagem: '3d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    tipoMunicaoCodigo: null,
    habilidadeEspecial: 'Reroll 6s em dano; Penalidade -0 em ataque; Requer ação movimento ligar',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // ARMAS À DISTÂNCIA - ARCO (Categoria 0-1)
  // ============================================================
  {
    codigo: 'ARCO',
    nome: 'Arco',
    descricao: 'Um arco e flecha comum, próprio para tiro ao alvo.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.DISPARO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.PERFURANTE, rolagem: '1d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'FLECHAS_ARCO',
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'BESTA',
    nome: 'Besta',
    descricao: 'Esta arma da antiguidade exige uma ação de movimento para ser recarregada a cada disparo.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.DISPARO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.PERFURANTE, rolagem: '1d8' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'FLECHAS_BESTA',
    habilidadeEspecial: 'Requer ação movimento para recarregar',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'ARCO_COMPOSTO',
    nome: 'Arco Composto',
    descricao: 'Este arco moderno usa materiais de alta tensão e um sistema de roldanas. Permite aplicar seu valor de Força às rolagens de dano.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.DISPARO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.PERFURANTE, rolagem: '1d10' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'FLECHAS_ARCO',
    habilidadeEspecial: 'Adiciona FOR ao dano',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'BALESTRA',
    nome: 'Balestra',
    descricao: 'Uma besta pesada, capaz de disparos poderosos. Exige ação de movimento para recarregar a cada disparo.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.DISPARO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.PERFURANTE, rolagem: '1d12' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'FLECHAS_BALESTRA',
    habilidadeEspecial: 'Requer ação movimento para recarregar',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // ARMAS À DISTÂNCIA - PISTOLA/REVÓLVER (Categoria 1)
  // ============================================================
  {
    codigo: 'PISTOLA',
    nome: 'Pistola',
    descricao: 'Uma arma de mão comum entre policiais e militares. Facilmente recarregável.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '1d12' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'BALAS_CURTAS',
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'REVOLVER',
    nome: 'Revólver',
    descricao: 'A arma de fogo mais comum, e uma das mais confiáveis.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d6' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'BALAS_CURTAS',
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'SUBMETRALHADORA',
    nome: 'Submetralhadora',
    descricao: 'Esta arma de fogo automática pode ser empunhada com apenas uma mão.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d6' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'BALAS_CURTAS',
    habilidadeEspecial: 'Automática',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // ARMAS À DISTÂNCIA - FUZIL/ESPINGARDA (Categoria 1-2)
  // ============================================================
  {
    codigo: 'FUZIL_CACA',
    nome: 'Fuzil de Caça',
    descricao: 'Esta arma de fogo é bastante popular entre fazendeiros, caçadores e atiradores esportistas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d8' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'BALAS_LONGAS',
    habilidadeEspecial: null,
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'ESPINGARDA',
    nome: 'Espingarda',
    descricao: 'Arma de fogo longa e com cano liso. Causa apenas metade do dano em alcance médio ou maior.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '4d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'CARTUCHOS',
    habilidadeEspecial: 'Meia dano em alcance médio ou maior',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'FUZIL_ASSALTO',
    nome: 'Fuzil de Assalto',
    descricao: 'A arma de fogo padrão da maioria dos exércitos modernos. É uma arma automática.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d10' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'BALAS_LONGAS',
    habilidadeEspecial: 'Automática',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'FUZIL_PRECISAO',
    nome: 'Fuzil de Precisão',
    descricao: 'Esta arma de fogo de uso militar é projetada para disparos longos e precisos. Veteranos em Pontaria ganham +5 na margem de ameaça.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d10' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.LONGO,
    tipoMunicaoCodigo: 'BALAS_LONGAS',
    habilidadeEspecial: 'Veteranos em Pontaria: +5 margem ameaça',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'METRALHADORA',
    nome: 'Metralhadora',
    descricao: 'Uma arma de fogo pesada, de uso militar. É uma arma automática. Requer FOR 4+ ou suporte de tripé.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.BALISTICO, rolagem: '2d12' }
    ],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'BALAS_LONGAS',
    habilidadeEspecial: 'Automática; FOR 4+ ou penalidade -5 sem suporte',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  // ============================================================
  // ARMAS À DISTÂNCIA - LANÇA-CHAMAS/BAZUCA (Categoria 2)
  // ============================================================
  {
    codigo: 'LANCA_CHAMAS',
    nome: 'Lança-chamas',
    descricao: 'Equipamento militar que esguicha líquido inflamável incandescente. Atinge todos em linha de 1,5m com alcance curto. Alvos ficarão em chamas.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.FOGO, rolagem: '6d6' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'COMBUSTIVEL',
    habilidadeEspecial: 'Linha 1,5m; Alvos em chamas',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },

  {
    codigo: 'BAZUCA',
    nome: 'Bazuca',
    descricao: 'Este lança-foguetes foi concebido como arma anti-tanques. Causa dano no alvo e em raio de 3m. Alvos podem fazer teste de Reflexos para meia dano. Requer ação de movimento para recarregar.',
    tipo: TipoEquipamento.ARMA,
    categoria: CategoriaEquipamento.CATEGORIA_2,
    espacos: 2,
    proficienciaArma: ProficienciaArma.PESADA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [
      { tipoDano: TipoDano.FOGO, rolagem: '10d8' }
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.MEDIO,
    tipoMunicaoCodigo: 'FOGUETE',
    habilidadeEspecial: 'Raio 3m; Reflexos (DT AGI) meia dano; 1 ação movimento recarregar',
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },
];

// ========================================
// ✅ FUNÇÃO SEED - EQUIPAMENTOS E DANOS
// ========================================

export async function seedEquipamentosArmas(prisma: PrismaClient) {
  console.log('📌 Cadastrando equipamentos de armas...');

  for (const armaData of equipamentosArmasSeed) {
    const { danos, ...equipamentoData } = armaData;

    const empunhadurasJson = armaData.empunhaduras?.length
      ? JSON.stringify(armaData.empunhaduras)
      : undefined;

    // 1️⃣ Criar ou atualizar o equipamento
    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: armaData.codigo },
      update: {
        ...equipamentoData,
        empunhaduras: empunhadurasJson,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...equipamentoData,
        empunhaduras: empunhadurasJson,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });

    // 2️⃣ Deletar danos antigos (para evitar duplicatas)
    await prisma.equipamentoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    // 3️⃣ Criar novos registros de dano
    for (let ordem = 0; ordem < danos.length; ordem++) {
      const danoDados = danos[ordem];

      await prisma.equipamentoDano.create({
        data: {
          equipamentoId: equipamento.id,
          empunhadura: danoDados.empunhadura || null,
          tipoDano: danoDados.tipoDano,
          rolagem: danoDados.rolagem,
          valorFlat: danoDados.valorFlat || 0,
          ordem,
        },
      });
    }

    console.log(`  ✓ ${armaData.nome}`);
  }

  console.log(`✅ ${equipamentosArmasSeed.length} armas cadastradas!\n`);
}
