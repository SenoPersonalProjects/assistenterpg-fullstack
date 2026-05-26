// prisma/seeds/suplementos/sobrevivendo-ao-jujutsu.ts

import type { PrismaClient, Prisma } from '@prisma/client';
import {
  StatusPublicacao,
  TipoFonte,
  CategoriaEquipamento,
  TipoEquipamento,
  TipoAcessorio,
  TipoExplosivo,
  TipoAmaldicoado,
  ComplexidadeMaldicao,
  TipoUsoEquipamento,
  TipoDano,
  TipoArma,
  SubtipoArmaDistancia,
  ProficienciaArma,
  EmpunhaduraArma,
  AlcanceArma,
  TipoModificacao,
} from '@prisma/client';
import { createLookupCache, jsonOrNull } from '../_helpers';
import { TRILHAS_SOBREVIVENDO_TEXTOS } from './sobrevivendo-ao-jujutsu-textos';

export const SUPLEMENTO_CODIGO = 'SOBREVIVENDO_AO_JUJUTSU';
export const SUPLEMENTO_NOME = 'Sobrevivendo ao Jujutsu';
const PREFIXO = '[Suplemento: Sobrevivendo ao Jujutsu] ';
const PERICIAS_EXCETO_LUTA_PONTARIA = [
  'ACROBACIA',
  'ADESTRAMENTO',
  'ARTES',
  'ATLETISMO',
  'ATUALIDADES',
  'CIENCIAS',
  'CRIME',
  'DIPLOMACIA',
  'ENGANACAO',
  'FORTITUDE',
  'FURTIVIDADE',
  'INICIATIVA',
  'INTIMIDACAO',
  'INTUICAO',
  'INVESTIGACAO',
  'MEDICINA',
  'JUJUTSU',
  'PERCEPCAO',
  'PROFISSAO',
  'REFLEXOS',
  'RELIGIAO',
  'TATICA',
  'TECNOLOGIA',
  'SOBREVIVENCIA',
  'VONTADE',
  'PILOTAGEM',
];

export const DESCRICAO_SUPLEMENTO =
  'Conteúdo adaptado do suplemento "Sobrevivendo ao Horror" para o sistema de Jujutsu.';

function toCategoria(
  valor: '0' | 'I' | 'II' | 'III' | 'IV' | 'ESPECIAL',
): CategoriaEquipamento {
  switch (valor) {
    case '0':
      return CategoriaEquipamento.CATEGORIA_0;
    case 'I':
      return CategoriaEquipamento.CATEGORIA_4;
    case 'II':
      return CategoriaEquipamento.CATEGORIA_3;
    case 'III':
      return CategoriaEquipamento.CATEGORIA_2;
    case 'IV':
      return CategoriaEquipamento.CATEGORIA_1;
    case 'ESPECIAL':
      return CategoriaEquipamento.ESPECIAL;
    default:
      return CategoriaEquipamento.CATEGORIA_0;
  }
}

const ORDEM_CATEGORIAS: CategoriaEquipamento[] = [
  CategoriaEquipamento.CATEGORIA_0,
  CategoriaEquipamento.CATEGORIA_4,
  CategoriaEquipamento.CATEGORIA_3,
  CategoriaEquipamento.CATEGORIA_2,
  CategoriaEquipamento.CATEGORIA_1,
  CategoriaEquipamento.ESPECIAL,
];

function subirCategoria(
  categoria: CategoriaEquipamento,
  passos = 1,
): CategoriaEquipamento {
  const indice = ORDEM_CATEGORIAS.indexOf(categoria);
  if (indice < 0) return CategoriaEquipamento.CATEGORIA_0;
  const indiceFinal = Math.min(indice + passos, ORDEM_CATEGORIAS.length - 1);
  return ORDEM_CATEGORIAS[indiceFinal];
}

export type OrigemSuplemento = {
  nome: string;
  descricao: string;
  requisitosTexto?: string | null;
  pericias: Array<{
    codigo: string;
    tipo: 'FIXA' | 'ESCOLHA';
    grupoEscolha?: number;
  }>;
  habilidade: {
    nome: string;
    descricao: string;
    mecanicasEspeciais?: Prisma.InputJsonValue | null;
  };
};

export type PoderSuplemento = {
  nome: string;
  descricao: string;
  requisitos?: Prisma.InputJsonValue | null;
  mecanicasEspeciais?: Prisma.InputJsonValue | null;
};

export type TrilhaSuplemento = {
  classe: string;
  nome: string;
  descricao: string;
  requisitos?: Prisma.InputJsonValue | null;
  caminhos?: Array<{ nome: string; descricao?: string | null }>;
  habilidades: Array<{
    nome: string;
    descricao: string;
    nivel: number;
    codigo?: string;
    caminho?: string;
    mecanicasEspeciais?: Prisma.InputJsonValue | null;
  }>;
};

export type EquipamentoArmaSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  proficienciaArma: ProficienciaArma;
  empunhaduras: EmpunhaduraArma[];
  tipoArma: TipoArma;
  subtipoDistancia?: SubtipoArmaDistancia | null;
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
};

export type EquipamentoAcessorioSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoAcessorio: TipoAcessorio;
  periciaBonificada?: string;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  efeito?: string;
  maxVestimentas?: number;
  tipoUso?: TipoUsoEquipamento;
  efeitoConsumo?: Prisma.InputJsonValue;
};

export type EquipamentoExplosivoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoExplosivo: TipoExplosivo;
  efeito: string;
  tipoUso?: TipoUsoEquipamento;
  efeitoConsumo?: Prisma.InputJsonValue;
};

export type EquipamentoOperacionalSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  periciaBonificada?: string;
  bonusPericia?: number;
  efeito?: string;
  tipoUso?: TipoUsoEquipamento;
  efeitoConsumo?: Prisma.InputJsonValue;
};

export type EquipamentoAmaldicoadoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoAmaldicoado?: TipoAmaldicoado;
  tipoUso?: TipoUsoEquipamento;
  efeito: string;
  efeitoConsumo?: Prisma.InputJsonValue;
};

export type EquipamentoArtefatoAmaldicoadoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  efeito: string;
  efeitoConsumo?: Prisma.InputJsonValue;
  artefato: {
    tipoBase: string;
    proficienciaRequerida?: boolean;
    efeito?: string;
    custoUso?: string | null;
    manutencao?: string | null;
  };
};

const consumoManual = (motivo: string): Prisma.InputJsonValue => ({
  automatizado: false,
  motivo,
});

const consumoRecurso = (
  recurso: 'PV' | 'EA' | 'PE' | 'SAN',
  dados: string,
  bonus = 0,
  usosPorUnidade = 1,
): Prisma.InputJsonValue => ({
  automatizado: true,
  efeitos: [
    {
      tipo: 'RECURSO',
      recurso,
      dados,
      bonus,
      usosPorUnidade,
      permiteConsumirComCalma: true,
    },
  ],
});

const CONSUMO_MANUAL_AREA = consumoManual(
  'Efeito de área, condição, teste de resistência ou decisão tática. Resolva manualmente com o mestre.',
);

const CONSUMO_MANUAL_NARRATIVO = consumoManual(
  'Efeito narrativo ou tático sem automação segura nesta versão. Resolva manualmente com o mestre.',
);

export const origensSuplemento: OrigemSuplemento[] = [
  {
    nome: 'Amigo dos Animais',
    descricao:
      PREFIXO +
      'Você desenvolveu uma conexão forte com animais e aprendeu a confiar neles para sobreviver a maldições.',
    pericias: [
      { codigo: 'ADESTRAMENTO', tipo: 'FIXA' },
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Companheiro Animal (Amigo dos Animais)',
      descricao:
        PREFIXO +
        'Você entende as intenções de animais e pode usar Adestramento para mudar a atitude deles. Além disso, possui um companheiro animal que concede +2 em uma perícia escolhida (aprovada pelo mestre). No nível 7 ele concede o bônus de um aliado do tipo escolhido, e no nível 14 concede a habilidade desse aliado. Se o companheiro morrer, você perde 10 de Sanidade permanentemente e fica perturbado até o fim da cena.',
      mecanicasEspeciais: {
        escolha: { tipo: 'PERICIAS', quantidade: 1 },
        periciasBonusEscolha: 2,
      },
    },
  },
  {
    nome: 'Astronauta',
    descricao:
      PREFIXO +
      'Explorador espacial acostumado à pressão e isolamento, que viu o sobrenatural fora da Terra.',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Acostumado ao Extremo (Astronauta)',
      descricao:
        PREFIXO +
        'Quando sofre dano de fogo, frio ou mental, você pode gastar 1 PE para reduzir o dano em 5. A cada novo uso na mesma cena, o custo aumenta em +1 PE.',
    },
  },
  {
    nome: 'Chef das Maldições',
    descricao:
      PREFIXO +
      'Um cozinheiro que aprendeu a preparar ingredientes amaldiçoados, transformando o tabu em arma.',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Fome das Maldições (Chef das Maldições)',
      descricao:
        PREFIXO +
        'Você pode usar partes de maldições como ingredientes culinários. No início de cada missão, pode solicitar partes como itens de categoria I (0,5 espaço). Em combate, cada maldição Pequena ou maior fornece 1 ingrediente. Com uma ação de interlúdio e 1 ingrediente, faz um prato especial: teste de Profissão (cozinheiro) DT 15. Sucesso concede RD 10 contra o tipo de dano associado a energia da maldição; falha causa vulnerabilidade. Efeitos duram até o fim da próxima cena. A cada refeição, você perde 1 ponto permanente de Sanidade. Se usar regra de nível/exposição, trate cada parte diferente como +3% de exposição (ou ajuste equivalente).',
    },
  },
  {
    nome: 'Colegial',
    descricao:
      PREFIXO +
      'Um jovem estudante que descobriu as maldições e encontrou força nos amigos.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Poder da Amizade (Colegial)',
      descricao:
        PREFIXO +
        'Escolha um personagem para ser seu melhor amigo. Se estiver em alcance médio e puderem trocar olhares, você recebe +2 em testes de perícia. Se ele morrer, seu total de PE e reduzido em -1 para cada 5 níveis até o fim da missão. Se perder o amigo, pode escolher outro no início da próxima missão.',
    },
  },
  {
    nome: 'Cosplayer',
    descricao:
      PREFIXO +
      'Fa de cosplay que transformou sua arte em proteção contra o sobrenatural.',
    pericias: [
      { codigo: 'ARTES', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Não e Fantasia, e Cosplay! (Cosplayer)',
      descricao:
        PREFIXO +
        'Você pode fazer testes de disfarce usando Artes em vez de Enganação. Além disso, se estiver usando um cosplay relacionado ao teste, recebe +2.',
    },
  },
  {
    nome: 'Diplomata',
    descricao:
      PREFIXO +
      'Um negociador que aprendeu que algumas entidades não aceitam acordos.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'DIPLOMACIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Conexoes (Diplomata)',
      descricao:
        PREFIXO +
        'Recebe +2 em Diplomacia. Além disso, se puder contatar um NPC capaz de auxiliar, pode gastar 10 minutos e 2 PE para substituir um teste de perícia relacionado ao conhecimento desse NPC por um teste de Diplomacia.',
      mecanicasEspeciais: { periciasBonus: { DIPLOMACIA: 2 } },
    },
  },
  {
    nome: 'Explorador',
    descricao:
      PREFIXO +
      'Aventureiro que aprendeu a suportar clima, fome e perigos para seguir pistas de maldições.',
    pericias: [
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Manual do Sobrevivente (Explorador)',
      descricao:
        PREFIXO +
        'Quando faz um teste para resistir a armadilhas, clima, doenças, fome, sede, fumaca, sono, sufocamento ou veneno (inclusive com origem sobrenatural), pode gastar 2 PE para receber +5. Em cenas de interlúdio, condições de sono precárias contam como normais.',
    },
  },
  {
    nome: 'Experimento',
    descricao:
      PREFIXO +
      'Sobreviveu a experimentos e carrega marcas que concedem capacidades extraordinarias.',
    pericias: [
      { codigo: 'ATLETISMO', tipo: 'FIXA' },
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Mutação (Experimento)',
      descricao:
        PREFIXO +
        'Você recebe resistência a dano 2 e +2 em uma perícia a escolha baseada em Força, Agilidade ou Vigor. Entretanto sofre -1d20 em Diplomacia.',
      mecanicasEspeciais: {
        resistencias: { DANO: 2 },
        escolha: {
          tipo: 'PERICIAS',
          quantidade: 1,
          atributosBasePermitidos: ['FOR', 'AGI', 'VIG'],
        },
        periciasBonusEscolha: 2,
      },
    },
  },
  {
    nome: 'Fanatico por Maldições',
    descricao:
      PREFIXO +
      'Obcecado pelo sobrenatural, você se tornou um caçador de maldições.',
    pericias: [
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Conhecimento Oculto (Fanatico por Maldições)',
      descricao:
        PREFIXO +
        'Você pode usar Jujutsu para identificar maldições a partir de pistas. Se passar, descobre características e recebe +2 em testes contra a maldição até o fim da missão.',
    },
  },
  {
    nome: 'Fotografo',
    descricao:
      PREFIXO +
      'Um artista visual que encontrou o sobrenatural através de suas lentes.',
    pericias: [
      { codigo: 'ARTES', tipo: 'FIXA' },
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Atraves da Lente (Fotografo)',
      descricao:
        PREFIXO +
        'Quando faz um teste de Investigação ou Percepção para adquirir pistas olhando por uma câmera, pode gastar 2 PE para receber +5. Um personagem que se move olhando através da lente anda a metade do deslocamento.',
    },
  },
  {
    nome: 'Inventor Amaldiçoado',
    descricao:
      PREFIXO +
      'Inventor que aplica energia amaldiçoada em dispositivos e prototipos.',
    pericias: [
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Invencao Amaldiçoada (Inventor Amaldiçoado)',
      descricao:
        PREFIXO +
        'Escolha uma técnica amaldiçoada não inata de nível 1. Você possui um invento (categoria 0, 1 espaço) que permite executar o efeito básico dessa técnica sem custo de PE. Para ativar, gasta uma ação padrão e testa Profissão (engenheiro) DT 15 +5 para cada ativação na mesma missão. Se falhar, o item enguiça. Uma ação de interlúdio para manutenção redefine a DT para 15. Você pode trocar a técnica do invento no início de cada missão.',
    },
  },
  {
    nome: 'Jovem Mistico',
    descricao:
      PREFIXO +
      'Uma pessoa guiada pela espiritualidade que encontrou o Jujutsu cedo.',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'RELIGIAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'A Culpa e das Estrelas (Jovem Mistico)',
      descricao:
        PREFIXO +
        'Escolha um numero da sorte entre 1 e 6. No início de cada cena, você pode gastar 1 PE e rolar 1d6. Se cair no seu numero, recebe +2 em testes de perícia até o fim da cena. Caso contrario, na próxima vez que usar esta habilidade, escolha mais um numero. Quando acertar, volta a 1 numero.',
    },
  },
  {
    nome: 'Legista do Turno da Noite',
    descricao:
      PREFIXO +
      'Um profissional acostumado a lidar com morte e a perceber sinais sobrenaturais.',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'MEDICINA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Luto Habitual (Legista do Turno da Noite)',
      descricao:
        PREFIXO +
        'Você sofre apenas metade do dano mental ao presenciar cenas ligadas a sua rotina (cadaveres, necropsias etc). Além disso, ao fazer testes de Medicina para primeiros socorros ou necropsia, pode gastar 2 PE para receber +5.',
    },
  },
  {
    nome: 'Mateiro',
    descricao:
      PREFIXO +
      'Guia da natureza que aprendeu a ler sinais do ambiente e do sobrenatural.',
    pericias: [
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Mapa Celeste (Mateiro)',
      descricao:
        PREFIXO +
        'Desde que possa ver o céu, você sempre sabe as direções dos pontos cardeais e consegue chegar sem se perder em lugares visitados. Quando faz um teste de Sobrevivência, pode gastar 2 PE para rolar novamente e ficar com o melhor. Em cenas de interlúdio, sono precário conta como normal.',
    },
  },
  {
    nome: 'Mergulhador',
    descricao:
      PREFIXO +
      'Explorador subaquatico que aprendeu a sobreviver a grandes profundidades.',
    pericias: [
      { codigo: 'ATLETISMO', tipo: 'FIXA' },
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Folego de Nadador (Mergulhador)',
      descricao:
        PREFIXO +
        'Você recebe +5 PV e pode prender a respiração por rodadas iguais ao dobro do seu Vigor. Ao passar em testes de Atletismo para natação, avança deslocamento normal.',
      mecanicasEspeciais: { pvExtra: 5 },
    },
  },
  {
    nome: 'Motorista',
    descricao:
      PREFIXO + 'Condutor profissional que encarou o sobrenatural na estrada.',
    pericias: [
      { codigo: 'PILOTAGEM', tipo: 'FIXA' },
      { codigo: 'REFLEXOS', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Mãos no Volante (Motorista)',
      descricao:
        PREFIXO +
        'Você não sofre penalidades de ataque por estar em um veículo em movimento. Sempre que estiver pilotando e tiver que fazer um teste de Pilotagem ou resistência, pode gastar 2 PE para receber +5 nesse teste.',
    },
  },
  {
    nome: 'Nerd Entusiasta',
    descricao:
      PREFIXO +
      'Curioso e obstinado, domina temas tecnicos e culturais para enfrentar maldições.',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'O Inteligentao (Nerd Entusiasta)',
      descricao:
        PREFIXO +
        'O bônus da ação de interlúdio ler aumenta em +1 dado (de +1d6 para +2d6).',
    },
  },
  {
    nome: 'Profetizado',
    descricao:
      PREFIXO +
      'Você pressentiu sua morte e aprendeu a usar isso como impulso.',
    requisitosTexto:
      'Escolha uma perícia adicional relacionada a sua premonicao.',
    pericias: [
      { codigo: 'VONTADE', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'ESCOLHA', grupoEscolha: 1 },
    ],
    habilidade: {
      nome: 'Luta ou Fuga (Profetizado)',
      descricao:
        PREFIXO +
        'Você recebe +2 em Vontade. Quando uma referência direta a sua premonicao aparece, você recebe +2 PE temporarios até o fim da cena.',
      mecanicasEspeciais: { periciasBonus: { VONTADE: 2 } },
    },
  },
  {
    nome: 'Psicologo',
    descricao:
      PREFIXO +
      'Especialista em mente humana que lida com traumas causados por maldições.',
    pericias: [
      { codigo: 'INTUICAO', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Terapia (Psicologo)',
      descricao:
        PREFIXO +
        'Você pode usar Profissão (psicólogo) como Diplomacia. Além disso, uma vez por rodada, quando você ou um aliado em alcance curto falha em um teste de resistência contra dano mental, pode gastar 2 PE para fazer um teste de Profissão (psicólogo) e usar o resultado no lugar do teste falho.',
    },
  },
  {
    nome: 'Reporter Investigativo',
    descricao:
      PREFIXO +
      'Jornalista que usa investigação para descobrir a verdade por trás do sobrenatural.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Encontrar a Verdade (Reporter Investigativo)',
      descricao:
        PREFIXO +
        'Você pode usar Investigação no lugar de Diplomacia ao persuadir e mudar atitude. Ao fazer um teste de Investigação, pode gastar 2 PE para receber +5.',
    },
  },
];

export const poderesSuplemento: PoderSuplemento[] = [
  {
    nome: 'Acrobatico',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Acrobacia ou, se já for treinado, recebe +2. Terreno difícil não reduz seu deslocamento nem impede investidas.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['ACROBACIA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'As do Volante',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Pilotagem ou, se já for treinado, recebe +2. Uma vez por rodada, quando um veículo pilotado por você sofre dano, pode testar Pilotagem para evitar o dano.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['PILOTAGEM'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Atletico',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Atletismo ou, se já for treinado, recebe +2. Além disso, recebe +3m de deslocamento.',
    requisitos: { atributos: { forca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['ATLETISMO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Atraente',
    descricao:
      PREFIXO +
      'Você recebe +5 em testes de Artes, Diplomacia, Enganação e Intimidação contra pessoas que possam se sentir atraidas por você.',
    requisitos: { atributos: { presenca: 2 } },
  },
  {
    nome: 'Dedos Ageis',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Crime ou, se ja for treinado, recebe +2. Além disso, pode arrombar com ação padrão, furtar com ação livre (1x/rodada) e sabotar com ação completa.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['CRIME'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Detector de Mentiras',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Intuição ou, se já for treinado, recebe +2. Outros sofrem -10 em Enganação para mentir para você.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['INTUICAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Especialista em Emergencias',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Medicina ou, se ja for treinado, recebe +2. Pode aplicar cicatrizantes e medicamentos como ação de movimento e sacar um deles como ação livre 1x/rodada.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['MEDICINA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Estigmatizado',
    descricao:
      PREFIXO +
      'Quando sofre dano mental de medo, pode converter esse dano em perda de PV.',
  },
  {
    nome: 'Foco em Perícia',
    descricao:
      PREFIXO +
      'Escolha uma perícia (exceto Luta e Pontaria). Quando faz um teste dessa perícia, rola +1d20. Pré-requisito: treinado na perícia escolhida.',
    mecanicasEspeciais: {
      escolha: {
        tipo: 'PERICIAS',
        quantidade: 1,
        periciasPermitidas: PERICIAS_EXCETO_LUTA_PONTARIA,
      },
    },
  },
  {
    nome: 'Inventario Organizado',
    descricao:
      PREFIXO +
      'Você soma seu Intelecto no limite de espaços de inventário. Itens muito leves (0,5) passam a ocupar 0,25. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      inventario: { somarIntelecto: true, reduzirItensLeves: true },
    },
  },
  {
    nome: 'Informado',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Atualidades ou, se já for treinado, recebe +2. Pode usar Atualidades no lugar de outra perícia para obter informações, com aprovação do mestre.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['ATUALIDADES'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Interrogador',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Intimidação ou, se ja for treinado, recebe +2. Pode coagir com ação padrão 1x/cena contra o mesmo alvo.',
    requisitos: { atributos: { forca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['INTIMIDACAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Mentiroso Nato',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Enganação ou, se já for treinado, recebe +2. Penalidade por mentiras implausiveis diminui para -1d20.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['ENGANACAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Observador',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Investigação ou, se já for treinado, recebe +2. Além disso, soma Intelecto em Intuição. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['INVESTIGACAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Pai de Pet',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Adestramento ou, se já for treinado, recebe +2. Possui um animal de estimação que concede +2 em duas perícias (exceto Luta ou Pontaria) aprovadas pelo mestre. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['ADESTRAMENTO'],
      bonusSeJaTreinado: 2,
      escolha: {
        tipo: 'PERICIAS',
        quantidade: 2,
        periciasPermitidas: PERICIAS_EXCETO_LUTA_PONTARIA,
      },
      periciasBonusEscolha: 2,
    },
  },
  {
    nome: 'Palavras de Devocao',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Religião ou, se já for treinado, recebe +2. Uma vez por cena, pode gastar 3 PE e uma ação completa para conceder RD mental 5 a um número de pessoas até o dobro da Presença.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['RELIGIAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Parceiro',
    descricao:
      PREFIXO +
      'Você possui um parceiro aliado de um tipo a sua escolha. Se perder, precisa gastar um periodo de descanso para obter outro. Pré-requisitos: treinado em Diplomacia, nível 6.',
    requisitos: {
      pericias: [{ codigo: 'DIPLOMACIA', grauMinimo: 1 }],
      nivelMinimo: 6,
    },
  },
  {
    nome: 'Pensamento Tatico',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Tatica ou, se já for treinado, recebe +2. Quando passa em teste de Tatica para analisar terreno, você e aliados em alcance médio recebem ação de movimento extra na primeira rodada do próximo combate. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['TATICA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Personalidade Esoterica',
    descricao:
      PREFIXO +
      'Você recebe +3 PE e treinamento em Jujutsu (ou +2 se já treinado). Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      recursos: { peBase: 3 },
      periciasTreinadas: ['JUJUTSU'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Persuasivo',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Diplomacia ou, se já for treinado, recebe +2. Penalidade por pedidos custosos diminui em -5. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['DIPLOMACIA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Pesquisador Cientifico',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Ciências ou, se já for treinado, recebe +2. Pode usar Ciências no lugar de Jujutsu e Sobrevivência para identificar maldições e animais. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['CIENCIAS'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Proativo',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Iniciativa ou, se já for treinado, recebe +2. Ao rolar 19 ou 20 em pelo menos um dado de Iniciativa, recebe uma ação padrão adicional no primeiro turno. Pré-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['INICIATIVA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Provisoes de Emergencia',
    descricao:
      PREFIXO +
      'Uma vez por missão, você pode recuperar equipamentos como se estivesse em uma nova fase de preparação.',
  },
  {
    nome: 'Racionalidade Inflexivel',
    descricao:
      PREFIXO +
      'Você pode usar Intelecto no lugar de Presença como atributo-chave de Vontade e para calcular seus PE. Pré-requisito: Int 3.',
    requisitos: { atributos: { intelecto: 3 } },
    mecanicasEspeciais: {
      recursos: { atributoChaveEa: 'INT' },
      periciasAtributoBase: { VONTADE: 'INT' },
    },
  },
  {
    nome: 'Rato de Computador',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Tecnologia ou, se já for treinado, recebe +2. Pode hackear e operar dispositivos como ação completa e, 1x por cena de investigação, buscar pistas sem gastar rodada. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['TECNOLOGIA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Resposta Rápida',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Reflexos ou, se já for treinado, recebe +2. Ao falhar em Percepção para evitar desprevenido, pode gastar 2 PE para rolar novamente com Reflexos. Pré-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['REFLEXOS'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Talentoso',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Artes ou, se já for treinado, recebe +2. Quando impressiona com Artes, o bônus em perícias aumenta em +1 para cada 5 pontos acima da DT. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ARTES'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Teimosia Obstinada',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Vontade ou, se já for treinado, recebe +2. Ao fazer teste de Vontade contra efeitos mentais ou de atitude, pode gastar 2 PE para receber +5. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['VONTADE'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Tenacidade',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Fortitude ou, se já for treinado, recebe +2. Quando estiver morrendo, mas consciente, pode fazer teste de Fortitude para encerrar a condição. Pré-requisito: Vig 2.',
    requisitos: { atributos: { vigor: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['FORTITUDE'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Sentidos Agucados',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Percepção ou, se já for treinado, recebe +2. Não fica desprevenido contra inimigos que não possa ver e pode rerrolar camuflagem. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['PERCEPCAO'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Sobrevivencialista',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Sobrevivência ou, se já for treinado, recebe +2. Recebe +2 em testes contra clima e terreno difícil natural não reduz seu deslocamento. Pré-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['SOBREVIVENCIA'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Sorrateiro',
    descricao:
      PREFIXO +
      'Você recebe treinamento em Furtividade ou, se já for treinado, recebe +2. Não sofre penalidades por se mover normalmente enquanto furtivo e por seguir alguém em ambientes abertos. Pré-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: {
      periciasTreinadas: ['FURTIVIDADE'],
      bonusSeJaTreinado: 2,
    },
  },
  {
    nome: 'Vitalidade Reforcada',
    descricao:
      PREFIXO +
      'Você recebe +1 PV por nível e +2 em Fortitude. Pré-requisito: Vig 2.',
    requisitos: { atributos: { vigor: 2 } },
    mecanicasEspeciais: { pvPorNivel: 1, periciasBonus: { FORTITUDE: 2 } },
  },
  {
    nome: 'Vontade Inabalavel',
    descricao:
      PREFIXO +
      'Você recebe +1 PE a cada 2 níveis e +2 em Vontade. Pré-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: {
      recursos: { pePorNivelImpar: 1 },
      periciasBonus: { VONTADE: 2 },
    },
  },
];

export const trilhasSuplemento: TrilhaSuplemento[] = [
  {
    classe: 'Combatente',
    nome: 'Agente Secreto',
    descricao:
      PREFIXO +
      'Agentes que operam em missoes discretas para proteger a sociedade jujutsu.',
    habilidades: [
      {
        nome: 'Carteirada (Agente Secreto)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Escolha Diplomacia ou Enganação. Recebe treinamento (ou +2 se já treinado). No início da missão, recebe documentos que garantem acesso e autoridade; contam como item operacional sem ocupar espaço.',
      },
      {
        nome: 'O Sorriso (Agente Secreto)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Recebe +2 em Diplomacia e Enganação. Ao falhar em um teste dessas perícias, pode gastar 2 PE para repetir (uma vez por teste). 1x por cena, pode fazer Diplomacia para se acalmar.',
      },
      {
        nome: 'Metodo Investigativo (Agente Secreto)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Em cenas de investigação, a urgência aumenta em 1 rodada. Quando o mestre rolar eventos de investigação, pode gastar 2 PE para transformar o resultado em "sem evento"; usos adicionais na mesma cena custam +2 PE.',
      },
      {
        nome: 'Multifacetado (Agente Secreto)',
        nivel: 20,
        descricao:
          PREFIXO +
          '1x por cena, pode gastar 5 de Sanidade para receber todas as habilidades de até nível 13 de uma trilha de Combatente ou Especialista a sua escolha (cumprindo requisitos). Duram até o fim da cena e não pode repetir a mesma trilha na mesma missão.',
      },
    ],
  },
  {
    classe: 'Combatente',
    nome: 'Caçador',
    descricao:
      PREFIXO +
      'Especialistas em rastrear e enfrentar maldições com método e informação.',
    habilidades: [
      {
        nome: 'Rastrear Maldições (Caçador)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em Sobrevivência (ou +2). Pode usar Sobrevivência no lugar de Jujutsu para identificar maldições e no lugar de Investigação e Percepção para rastros e pistas paranormais.',
      },
      {
        nome: 'Estudar Fraquezas (Caçador)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Gaste uma ação de interlúdio estudando um alvo usando uma pista ligada a ele. Você descobre uma informação útil e recebe +1 em testes de perícia contra o alvo por pista até o fim da missão.',
      },
      {
        nome: 'Atacar das Sombras (Caçador)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Não sofre penalidade em Furtividade por se mover no deslocamento normal. Se usar arma silenciosa, a penalidade por atacar na mesma rodada e reduzida. Em cenas de furtividade, sua visibilidade inicial e 1 ponto menor.',
      },
      {
        nome: 'Estudar a Presa (Caçador)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Ao usar Estudar Fraquezas em uma maldição ou cultista, pode definir esse tipo como "presa". Contra sua presa, recebe +1 em testes de perícia, +1 na margem e multiplicador de crítico e resistência a dano 5. Apenas um tipo por vez.',
      },
    ],
  },
  {
    classe: 'Especialista',
    nome: 'Bibliotecario',
    descricao:
      PREFIXO +
      'Leitor incansavel que usa conhecimento para sobreviver ao sobrenatural.',
    habilidades: [
      {
        nome: 'Conhecimento Pratico (Bibliotecario)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Ao fazer teste de perícia (exceto Luta e Pontaria), pode gastar 2 PE para trocar o atributo-base para Intelecto. Se possuir Conhecimento Aplicado, o custo reduz em 1 PE.',
      },
      {
        nome: 'Leitor Contumaz (Bibliotecario)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Cada dado de bônus da ação de interlúdio ler aumenta para 1d8 e pode ser aplicado em qualquer perícia. Ao usar esse bônus, pode gastar 2 PE para aumentar em +1 dado.',
      },
      {
        nome: 'Rato de Biblioteca (Bibliotecario)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Em ambientes com muitos livros, pode gastar alguns minutos (ou 1 rodada em investigação) para receber os benefícios de ler ou revisar caso. 1x por cena.',
      },
      {
        nome: 'A Força do Saber (Bibliotecario)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Intelecto +1. Soma Intelecto ao total de PE. Escolha uma perícia: seu atributo-base passa a ser Intelecto.',
      },
    ],
  },
  {
    classe: 'Especialista',
    nome: 'Perseverante',
    descricao:
      PREFIXO +
      'Sobrevivente resiliente que nunca desiste, mesmo nas piores situacoes.',
    habilidades: [
      {
        nome: 'Solucoes Improvisadas (Perseverante)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Pode gastar 2 PE para rerrolar 1 dos dados de um teste recem-realizado e ficar com o melhor resultado (1x por teste).',
      },
      {
        nome: 'Fuga Obstinada (Perseverante)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Recebe +1d20 em testes para fugir de inimigos. Em cenas de perseguição, se for a presa, pode acumular até 4 falhas antes de ser pego.',
      },
      {
        nome: 'Determinação Inquestionavel (Perseverante)',
        nivel: 13,
        descricao:
          PREFIXO +
          '1x por cena, pode gastar 5 PE e uma ação padrão para remover uma condição de medo, mental ou paralisia (a critério do mestre).',
      },
      {
        nome: 'So Mais um Passo (Perseverante)',
        nivel: 20,
        descricao:
          PREFIXO +
          '1x por rodada, quando sofrer dano que o levaria a 0 PV, pode gastar 5 PE para ficar com 1 PV. Não funciona contra dano massivo.',
      },
    ],
  },
  {
    classe: 'Especialista',
    nome: 'Muambeiro',
    descricao:
      PREFIXO +
      'Especialista em equipamentos, capaz de fabricar e improvisar o necessário.',
    habilidades: [
      {
        nome: 'Mascate (Muambeiro)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em uma Profissão (armeiro, engenheiro ou químico) e +5 na capacidade de carga. Ao fabricar item improvisado, a DT é reduzida em 10.',
      },
      {
        nome: 'Fabricação Própria (Muambeiro)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Leva metade do tempo para fabricar itens mundanos. Pode fabricar duas munições/explosivos por ação de manutenção e precisa apenas uma ação para armas, proteções e itens gerais.',
      },
      {
        nome: 'Laboratorio de Campo (Muambeiro)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Recebe treinamento em uma Profissão (armeiro, engenheiro ou químico) ou +5 se já treinado. Pode fabricar e consertar itens amaldiçoados em campo.',
      },
      {
        nome: 'Achado Conveniente (Muambeiro)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Pode gastar uma ação completa e 5 PE para "produzir" um item de até categoria III (exceto itens amaldiçoados). O item funciona até o fim da cena.',
      },
    ],
  },
  {
    classe: 'Sentinela',
    nome: 'Exorcista',
    descricao:
      PREFIXO +
      'Feiticeiro que usa fe e disciplina para enfrentar o amaldiçoado.',
    habilidades: [
      {
        nome: 'Revelação do Mal (Exorcista)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em Religião (ou +2). Pode usar Religião no lugar de Investigação e Percepção para rastros paranormais e no lugar de Jujutsu para identificar maldições.',
      },
      {
        nome: 'Poder da Fe (Exorcista)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Torna-se veterano em Religião (ou recebe +5). Ao falhar em um teste de resistência, pode gastar 2 PE para repetir usando Religião e aceitar o novo resultado.',
      },
      {
        nome: 'Parareligiosidade (Exorcista)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Ao usar uma técnica amaldiçoada, pode gastar +2 PE para adicionar um efeito equivalente a um catalisador amaldiçoado.',
      },
      {
        nome: 'Chagas da Resistência (Exorcista)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Quando sua Sanidade cair a 0, pode gastar 10 PV para ficar com SAN 1.',
      },
    ],
  },
  {
    classe: 'Sentinela',
    nome: 'Parapsicólogo',
    descricao:
      PREFIXO +
      'Estudioso da mente humana e dos efeitos do amaldiçoado sobre ela.',
    requisitos: {
      pericias: [{ codigo: 'PROFISSAO', treinada: true, detalhe: 'psicólogo' }],
    },
    habilidades: [
      {
        nome: 'Terapia (Parapsicólogo)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Pode usar Profissão (psicólogo) como Diplomacia. 1x por rodada, quando você ou aliado falhar em resistência a dano mental, pode gastar 2 PE e usar Profissão no lugar do teste falho. Se já possuir esta habilidade, o custo reduz em 1 PE e recebe +2 em Profissão (psicólogo).',
      },
      {
        nome: 'Palavras-chave (Parapsicólogo)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Ao passar em um teste para acalmar, pode gastar PE até seu limite. Para cada 1 PE gasto, o alvo recupera 1 ponto de Sanidade.',
      },
      {
        nome: 'Reprogramação Mental (Parapsicólogo)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Pode gastar 5 PE e uma ação de interlúdio para conceder temporariamente a outra pessoa um poder geral, da classe ou o primeiro poder de uma trilha (cumprindo requisitos) até o próximo interlúdio.',
      },
      {
        nome: 'A Sanidade Está Lá Fora (Parapsicólogo)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Pode gastar uma ação de movimento e 5 PE para remover todas as condições de medo ou mentais de uma pessoa adjacente (inclusive você).',
      },
    ],
  },
  {
    classe: 'Combatente',
    nome: 'Corpo Amaldiçoado Independente',
    descricao:
      TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.descricao,
    requisitos: { semTecnicaInata: true },
    habilidades: [
      {
        nome: 'Blefe Mortal (Corpo Amaldiçoado Independente)',
        codigo: 'SUP_CORPO_AMALDICOADO_BLEFE_MORTAL',
        nivel: 2,
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.habilidades
            .blefeMortal,
        mecanicasEspeciais: { recursos: { pvBarrasTotal: 3 } },
      },
      {
        nome: 'Núcleos Amaldiçoados (Corpo Amaldiçoado Independente)',
        codigo: 'SUP_CORPO_AMALDICOADO_NUCLEOS',
        nivel: 2,
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.habilidades
            .nucleos,
        mecanicasEspeciais: { pvPorNivel: 2 },
      },
      {
        nome: 'Adaptatividade (Corpo Amaldiçoado Independente)',
        codigo: 'SUP_CORPO_AMALDICOADO_ADAPTATIVIDADE',
        nivel: 8,
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.habilidades
            .adaptatividade,
      },
      {
        nome: 'Despertar dos Núcleos (Corpo Amaldiçoado Independente)',
        codigo: 'SUP_CORPO_AMALDICOADO_DESPERTAR',
        nivel: 13,
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.habilidades
            .despertar,
      },
      {
        nome: 'Ainda Bem que Eu Não Sou Humano (Corpo Amaldiçoado Independente)',
        codigo: 'SUP_CORPO_AMALDICOADO_ESTABILIDADE',
        nivel: 20,
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.corpoAmaldicoadoIndependente.habilidades
            .estabilidade,
        mecanicasEspeciais: { pvExtra: 30 },
      },
    ],
  },
  {
    classe: 'Especialista',
    nome: 'Receptáculo',
    descricao: TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.descricao,
    requisitos: { semTecnicaInata: true },
    caminhos: [
      {
        nome: 'Supressão',
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.caminhos.supressao,
      },
      {
        nome: 'Convergência',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.caminhos.convergencia,
      },
    ],
    habilidades: [
      {
        nome: 'Destino do Receptáculo',
        codigo: 'SUP_RECEPTACULO_DESTINO',
        nivel: 2,
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.destino,
        mecanicasEspeciais: {
          periciasBonus: { INTIMIDACAO: 5, DIPLOMACIA: -5 },
        },
      },
      {
        nome: 'Poder Roubado (Receptáculo - Supressão)',
        codigo: 'SUP_RECEPTACULO_SUPRESSAO_8',
        nivel: 8,
        caminho: 'Supressão',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.supressao8,
      },
      {
        nome: 'Concessão Desesperada (Receptáculo - Supressão)',
        codigo: 'SUP_RECEPTACULO_SUPRESSAO_13',
        nivel: 13,
        caminho: 'Supressão',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.supressao13,
      },
      {
        nome: 'Domínio Interno (Receptáculo - Supressão)',
        codigo: 'SUP_RECEPTACULO_SUPRESSAO_20',
        nivel: 20,
        caminho: 'Supressão',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.supressao20,
      },
      {
        nome: 'Poder Concedido (Receptáculo - Convergência)',
        codigo: 'SUP_RECEPTACULO_CONVERGENCIA_8',
        nivel: 8,
        caminho: 'Convergência',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.convergencia8,
      },
      {
        nome: 'Concessão Assistida (Receptáculo - Convergência)',
        codigo: 'SUP_RECEPTACULO_CONVERGENCIA_13',
        nivel: 13,
        caminho: 'Convergência',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.convergencia13,
      },
      {
        nome: 'Uniao Interna (Receptáculo - Convergência)',
        codigo: 'SUP_RECEPTACULO_CONVERGENCIA_20',
        nivel: 20,
        caminho: 'Convergência',
        descricao:
          TRILHAS_SOBREVIVENDO_TEXTOS.receptaculo.habilidades.convergencia20,
        mecanicasEspeciais: { resistencias: { ENERGIA_AMALDICOADA: 5 } },
      },
    ],
  },
  {
    classe: 'Sentinela',
    nome: 'Amaldiçoado',
    descricao: TRILHAS_SOBREVIVENDO_TEXTOS.amaldicoado.descricao,
    requisitos: { semTecnicaInata: true },
    habilidades: [
      {
        nome: 'Presença Amaldiçoada',
        codigo: 'SUP_AMALDICOADO_PRESENCA',
        nivel: 2,
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.amaldicoado.habilidades.presenca,
      },
      {
        nome: 'Ligação Inata',
        codigo: 'SUP_AMALDICOADO_LIGACAO',
        nivel: 8,
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.amaldicoado.habilidades.ligacao,
      },
      {
        nome: 'Conexao Sincera',
        codigo: 'SUP_AMALDICOADO_CONEXAO',
        nivel: 13,
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.amaldicoado.habilidades.conexao,
      },
      {
        nome: 'Vínculo Puro',
        codigo: 'SUP_AMALDICOADO_VINCULO',
        nivel: 20,
        descricao: TRILHAS_SOBREVIVENDO_TEXTOS.amaldicoado.habilidades.vinculo,
      },
    ],
  },
];

export const armasSuplemento: EquipamentoArmaSeed[] = [
  {
    codigo: 'BAIONETA_SUP',
    nome: 'Baioneta',
    descricao:
      PREFIXO +
      'Lammina fixavel em fuzis. Pode ser acoplada a arma de fogo de duas mãos com ação de movimento; ao acoplar, torna-se arma de duas mãos agil (dano 1d6) e ataques a distancia sofrem -1d20.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      {
        empunhadura: EmpunhaduraArma.LEVE,
        tipoDano: TipoDano.PERFURANTE,
        rolagem: '1d4',
      },
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial:
      'Pode ser acoplada em arma de fogo de duas mãos; dano 1d6 e ataques a distancia sofrem -1d20',
  },
  {
    codigo: 'BASTAO_POLICIAL_SUP',
    nome: 'Bastao Policial',
    descricao:
      PREFIXO +
      'Bastao de uso policial, util para aparar golpes. Ao usar esquiva com o bastao, o bônus na Defesa aumenta em +1.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      {
        empunhadura: EmpunhaduraArma.UMA_MAO,
        tipoDano: TipoDano.IMPACTO,
        rolagem: '1d6',
      },
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial: 'Esquiva com bastao concede +1 Defesa adicional',
  },
  {
    codigo: 'ESPINGARDA_CANODUPLO_SUP',
    nome: 'Espingarda de Cano Duplo',
    descricao:
      PREFIXO +
      'Espingarda com dois canos. Pode disparar ambos no mesmo alvo: -1d20 no ataque e dano 6d6. Precisa de ação de movimento para recarregar após os dois tiros.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [{ tipoDano: TipoDano.BALISTICO, rolagem: '4d6' }],
    criticoValor: 20,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'CARTUCHOS',
    habilidadeEspecial:
      'Pode disparar dois canos: -1d20 no ataque e dano 6d6; recarrega após 2 tiros',
  },
  {
    codigo: 'ESTILINGUE_SUP',
    nome: 'Estilingue',
    descricao:
      PREFIXO +
      'Arma simples que permite somar Força ao dano. Pode lancar granadas em alcance longo. Bolinhas duram a missão e podem ser reutilizadas.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.DISPARO,
    agil: false,
    danos: [{ tipoDano: TipoDano.IMPACTO, rolagem: '1d4' }],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.CURTO,
    habilidadeEspecial:
      'Soma Força ao dano; pode lancar granadas em alcance longo',
  },
  {
    codigo: 'FACA_TATICA_SUP',
    nome: 'Faça Tatica',
    descricao:
      PREFIXO +
      'Faça equilibrada para contra-ataques e bloqueios. Pode ser arremessada.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [
      {
        empunhadura: EmpunhaduraArma.LEVE,
        tipoDano: TipoDano.CORTANTE,
        rolagem: '1d4',
      },
    ],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial:
      'Contra-ataque +2; pode gastar 2 PE e sacrificar para +20 RD no bloqueio',
  },
  {
    codigo: 'GANCHO_CARNE_SUP',
    nome: 'Gancho de Carne',
    descricao:
      PREFIXO +
      'Gancho metálico usado para pendurar carne. Pode ser amarrado a corda/corrente, aumentando alcance para 4,5m e espaço para 2.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      {
        empunhadura: EmpunhaduraArma.UMA_MAO,
        tipoDano: TipoDano.PERFURANTE,
        rolagem: '1d6',
      },
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial:
      'Pode ser usado com corda/corrente: alcance 4,5m e espaços 2',
  },
  {
    codigo: 'PICARETA_SUP',
    nome: 'Picareta',
    descricao:
      PREFIXO +
      'Ferramenta de mineração usada como arma. Forte, lenta e perigosa.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [
      {
        empunhadura: EmpunhaduraArma.DUAS_MAOS,
        tipoDano: TipoDano.IMPACTO,
        rolagem: '1d8',
      },
    ],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial: null,
  },
  {
    codigo: 'PISTOLA_PESADA_SUP',
    nome: 'Pistola Pesada',
    descricao:
      PREFIXO +
      'Pistola de calibre superior. Sofre -1d20 em ataques; empunhar com duas mãos remove a penalidade.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [{ tipoDano: TipoDano.BALISTICO, rolagem: '2d8' }],
    criticoValor: 19,
    criticoMultiplicador: 3,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'BALAS_CURTAS',
    habilidadeEspecial:
      'Sofre -1d20; empunhar com duas mãos remove a penalidade',
  },
  {
    codigo: 'PREGADOR_PNEUMATICO_SUP',
    nome: 'Pregador Pneumatico',
    descricao:
      PREFIXO +
      'Ferramenta que dispara pregos sob pressão. Conta como arma de fogo para poderes que afetam esse tipo. Um rolo dura uma missão.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [{ tipoDano: TipoDano.PERFURANTE, rolagem: '2d6' }],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.CURTO,
    habilidadeEspecial: 'Conta como arma de fogo; rolo de pregos dura a missão',
  },
  {
    codigo: 'REVOLVER_COMPACTO_SUP',
    nome: 'Revólver Compacto',
    descricao:
      PREFIXO +
      'Revólver de baixo calibre e fácil de esconder. Treinados em Crime podem carregar sem ocupar espaço.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.TATICA,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.FOGO,
    agil: false,
    danos: [{ tipoDano: TipoDano.BALISTICO, rolagem: '1d10' }],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.CURTO,
    tipoMunicaoCodigo: 'BALAS_CURTAS',
    habilidadeEspecial:
      'Se for treinado em Crime, não ocupa espaço ao carregar',
  },
  {
    codigo: 'SHURIKEN_SUP',
    nome: 'Shuriken',
    descricao:
      PREFIXO +
      'Projéteis metálicos em forma de estrela. Se for veterano em Pontaria, 1x por rodada pode gastar 1 PE para fazer um ataque adicional de shuriken.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.A_DISTANCIA,
    subtipoDistancia: SubtipoArmaDistancia.ARREMESSO,
    agil: true,
    danos: [{ tipoDano: TipoDano.PERFURANTE, rolagem: '1d4' }],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.CURTO,
    habilidadeEspecial:
      'Veterano em Pontaria: 1x por rodada pode gastar 1 PE para ataque adicional',
  },
];

export const acessoriosSuplemento: EquipamentoAcessorioSeed[] = [
  {
    codigo: 'AMULETO_SAGRADO_SUP',
    nome: 'Amuleto Sagrado',
    descricao:
      PREFIXO + 'Utensílio especial que reforca a fe e protege o usuário.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Religião e Vontade',
    bonusPericia: 2,
    efeito: 'Concede +2 em Religião e Vontade',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CELULAR_SUP',
    nome: 'Celular',
    descricao:
      PREFIXO + 'Utensílio comum para comunicação e acesso a informações.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito:
      'Com acesso a internet, concede +2 em testes para obter informações; ilumina 4,5m',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CHAVE_FENDA_UNIVERSAL_SUP',
    nome: 'Chave de Fenda Universal',
    descricao: PREFIXO + 'Ferramenta versátil para criar ou reparar objetos.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito:
      '+2 em testes para criar ou reparar objetos; pode servir como item de apoio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CHAVES_SUP',
    nome: 'Chaves',
    descricao:
      PREFIXO + 'Molho de chaves usado para distrair ou abrir acessos comuns.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: 'Ao distrair com as chaves, +2 em Furtividade na mesma rodada',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'DOCUMENTOS_FALSOS_SUP',
    nome: 'Documentos Falsos',
    descricao: PREFIXO + 'Conjunto de documentos em identidade falsa.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito:
      '+2 em Diplomacia, Enganação e Intimidação para se passar pela identidade',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'MANUAL_OPERACIONAL_SUP',
    nome: 'Manual Operacional',
    descricao: PREFIXO + 'Livro com lições práticas sobre uma perícia.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito:
      'Ação de interlúdio lendo permite usar uma perícia como treinada até o próximo interlúdio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'NOTEBOOK_SUP',
    nome: 'Notebook',
    descricao: PREFIXO + 'Computador portátil para trabalho e entretenimento.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito:
      '+2 em testes para obter informações com internet; ao relaxar, recupera +1 SAN',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'OCULOS_VISAO_NOTURNA_SUP',
    nome: 'Óculos de Visao Noturna',
    descricao: PREFIXO + 'Óculos com bateria que permitem enxergar no escuro.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Concede visão no escuro; -1d20 contra ofuscado e efeitos de luz',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'OCULOS_ESCUROS_SUP',
    nome: 'Óculos Escuros',
    descricao: PREFIXO + 'Óculos que protegem contra luz forte.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Não pode ser ofuscado',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'PA_SUP',
    nome: 'Pa',
    descricao: PREFIXO + 'Ferramenta pesada para cavar e mover detritos.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: '+5 em testes de Força para cavar; pode ser usada como bastao',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'PARAQUEDAS_SUP',
    nome: 'Paraquedas',
    descricao: PREFIXO + 'Equipamento que reduz ou anula dano de queda.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Anula dano de queda; uso sem treinamento exige Reflexos DT 20',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'TRAJE_MERGULHO_SUP',
    nome: 'Traje de Mergulho',
    descricao:
      PREFIXO + 'Roupa impermeavel com tanque e mascara para mergulho.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito:
      'Resistência química 5 e +5 contra efeitos ambientais; 1h de oxigênio',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'TRAJE_ESPACIAL_SUP',
    nome: 'Traje Espacial',
    descricao: PREFIXO + 'Roupa completa para uso no vácuo espacial.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 5,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito:
      'Resistência química 20 e +10 contra efeitos ambientais; 8h de oxigênio',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
];

const explosivosSuplemento: EquipamentoExplosivoSeed[] = [
  {
    codigo: 'DINAMITE_SUP',
    nome: 'Dinamite',
    descricao:
      PREFIXO +
      'Explosivo com pavio. Pode ser aceso e arremessado na mesma ação.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FRAGMENTACAO,
    efeito:
      'Raio 6m; 4d6 impacto + 4d6 fogo; Reflexos evita metade e condição em chamas',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_AREA,
  },
  {
    codigo: 'EXPLOSIVO_PLASTICO_SUP',
    nome: 'Explosivo Plastico',
    descricao:
      PREFIXO +
      'Massa adesiva com detonador remoto ou ignição por fogo/eletricidade.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.MINA_ANTIPESSOAL,
    efeito:
      'Raio 3m; 16d6 impacto; Reflexos DT Int reduz metade; dano dobrado contra objetos',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_AREA,
  },
  {
    codigo: 'GALAO_VERMELHO_SUP',
    nome: 'Galao Vermelho',
    descricao:
      PREFIXO +
      'Galao de combustivel que explode ao sofrer dano de fogo ou balistico.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    tipoExplosivo: TipoExplosivo.GRANADA_INCENDIARIA,
    efeito:
      'Explosão em raio 6m: 12d6 fogo e condição em chamas; área fica em chamas',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'GRANADA_GAS_SONIFERO_SUP',
    nome: 'Granada de Gas Sonifero',
    descricao: PREFIXO + 'Granada que libera gás sonífero em uma área ampla.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_ATORDOAMENTO,
    efeito:
      'Raio 6m; alvos ficam inconscientes ou exaustos (Fortitude DT Agi reduz)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_AREA,
  },
  {
    codigo: 'GRANADA_PEM_SUP',
    nome: 'Granada de PEM',
    descricao:
      PREFIXO + 'Pulso eletromagnetico que desativa equipamentos eletronicos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FUMACA,
    efeito:
      'Raio 18m: desativa equipamentos até o fim da cena; maldições sofrem 6d6 impacto e paralisia 1 rodada',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_AREA,
  },
];

const itensOperacionaisSuplemento: EquipamentoOperacionalSeed[] = [
  {
    codigo: 'ALARME_MOVIMENTO_SUP',
    nome: 'Alarme de Movimento',
    descricao:
      PREFIXO +
      'Dispositivo que detecta movimento em cone de 30m e envia alerta.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito:
      'Detecta movimento em cone de 30m; pode sinalizar alerta discreto ou sonoro',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ALIMENTO_ENERGETICO_SUP',
    nome: 'Alimento Energetico',
    descricao:
      PREFIXO + 'Suplemento de alta energia para recuperar esforco mental.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    efeito: 'Consumir com ação padrão: recupera 1d4 PE',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: consumoRecurso('PE', '1d4'),
  },
  {
    codigo: 'APLICADOR_MEDICAMENTOS_SUP',
    nome: 'Aplicador de Medicamentos',
    descricao:
      PREFIXO + 'Adaptação portátil para aplicar substâncias rapidamente.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: 'Permite aplicar substâncias com ação de movimento (até 3 doses)',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'BRACADEIRA_REFORCADA_SUP',
    nome: 'Bracadeira Reforcada',
    descricao:
      PREFIXO + 'Proteção para antebracos que ajuda a bloquear golpes.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: '+2 na RD recebida por usar bloqueio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CAO_ADESTRADO_SUP',
    nome: 'Cão Adestrado',
    descricao: PREFIXO + 'Cão treinado para ajudar em investigação e combate.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    efeito:
      'Aliado: +2 em Investigação e Percepção; pode gastar 1 PE para +2 Defesa por 1 rodada',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'COLDRE_SAQUE_RAPIDO_SUP',
    nome: 'Coldre Saque Rápido',
    descricao:
      PREFIXO + 'Coldre que permite sacar arma de fogo leve rapidamente.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito:
      '1x por rodada pode sacar/guardar arma de fogo leve como ação livre',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'EQUIPAMENTO_ESCUTA_SUP',
    nome: 'Equipamento de Escuta',
    descricao:
      PREFIXO + 'Receptor e transmissores para captar conversas a distancia.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito:
      'Receptor alcance 90m e transmissores raio 9m; requer testes para instalar',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ESTREPES_SUP',
    nome: 'Estrepes',
    descricao: PREFIXO + 'Saco de estrepes para dificultar movimentação.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito:
      'Área 1,5m: 1d4 perfurante e lento (Reflexos evita); em perseguição reduz testes',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'FAIXA_PREGOS_SUP',
    nome: 'Faixa de Pregos',
    descricao: PREFIXO + 'Trilha de pregos usada para parar veículos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    efeito:
      'Funciona como estrepes em linha de 9m; pneus perfurados reduzem deslocamento',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ISQUEIRO_SUP',
    nome: 'Isqueiro',
    descricao:
      PREFIXO + 'Produz pequena chama para acender objetos e iluminar.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 0.5,
    efeito: 'Ação de movimento: chama e luz em raio 3m',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
];

const medicamentosSuplemento: EquipamentoOperacionalSeed[] = [
  {
    codigo: 'ANTIBIOTICO_SUP',
    nome: 'Antibiotico',
    descricao: PREFIXO + 'Medicamento para combater infecções.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 no próximo teste de Fortitude contra doença até o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'ANTIDOTO_SUP',
    nome: 'Antidoto',
    descricao: PREFIXO + 'Medicamento para neutralizar venenos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito:
      '+5 no próximo teste de Fortitude contra veneno até o fim do dia; pode remover veneno específico',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'ANTIEMETICO_SUP',
    nome: 'Antiemetico',
    descricao: PREFIXO + 'Reduz náuseas e efeitos similares.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito:
      'Remove condição enjoado e concede +5 contra náuseas até o fim da cena',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'ANTIHISTAMINICO_SUP',
    nome: 'Antihistaminico',
    descricao: PREFIXO + 'Reduz reações alérgicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 no próximo teste contra alergia até o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'ANTI_INFLAMATORIO_SUP',
    nome: 'Anti-inflamatorio',
    descricao: PREFIXO + 'Reduz dores e inflamações.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: 'Concede 1d8+2 PV temporarios',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: consumoManual(
      'PV temporario ainda nao tem automacao segura. Resolva manualmente com o mestre.',
    ),
  },
  {
    codigo: 'ANTITERMICO_SUP',
    nome: 'Antitermico',
    descricao: PREFIXO + 'Reduz febre e dores de cabeça.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: 'Permite novo teste contra condição mental (1x por cena)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'BRONCODILATADOR_SUP',
    nome: 'Broncodilatador',
    descricao: PREFIXO + 'Auxilia na respiração.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 em testes contra asfixiado ou fatigado até o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'COAGULANTE_SUP',
    nome: 'Coagulante',
    descricao: PREFIXO + 'Ajuda a estancar sangramento.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito:
      '+5 em testes para estabilizar sangrando e +5 em Medicina para remover morrendo',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
];

const itensAmaldicoadosSuplemento: EquipamentoAmaldicoadoSeed[] = [
  {
    codigo: 'CATALISADOR_AMPLIADOR_SUP',
    nome: 'Catalisador Ampliador',
    descricao:
      PREFIXO +
      'Catalisador amaldiçoado consumivel para técnicas. Aumenta alcance ou dobra área.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta alcance em 1 passo ou dobra área de efeito da técnica',
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'CATALISADOR_PERTURBADOR_SUP',
    nome: 'Catalisador Perturbador',
    descricao:
      PREFIXO +
      'Catalisador consumivel que aumenta a DT para resistir a técnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta a DT da técnica em +2',
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'CATALISADOR_POTENCIALIZADOR_SUP',
    nome: 'Catalisador Potencializador',
    descricao:
      PREFIXO + 'Catalisador consumivel que aumenta o dano de técnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta o dano da técnica em +1 dado do mesmo tipo',
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'CATALISADOR_PROLONGADOR_SUP',
    nome: 'Catalisador Prolongador',
    descricao:
      PREFIXO + 'Catalisador consumivel que prolonga efeitos de técnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Dobra duração de técnicas não instantaneas e não sustentadas',
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
  {
    codigo: 'PE_DE_MORTO_SUP',
    nome: 'Pe de Morto',
    descricao: PREFIXO + 'Botas amaldiçoadas que silenciam passos.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    efeito:
      '+5 em Furtividade; ações de movimento chamativas aumentam visibilidade apenas +1',
  },
  {
    codigo: 'PENDRIVE_SELADO_SUP',
    nome: 'Pendrive Selado',
    descricao:
      PREFIXO +
      'Dispositivo protegido contra técnicas amaldiçoadas e efeitos elétricos.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 0.5,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito:
      'Não pode ser afetado por técnicas; permite invadir sistemas sem contaminação',
  },
  {
    codigo: 'VALETE_SALVACAO_SUP',
    nome: 'Valete da Salvação',
    descricao: PREFIXO + 'Carta amaldiçoada que indica a melhor rota de fuga.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito:
      'Aponta rota de fuga em alcance médio; em perseguição, garante sucesso em cortar caminho',
    efeitoConsumo: CONSUMO_MANUAL_NARRATIVO,
  },
];

export const artefatosAmaldicoadosSuplemento: EquipamentoArtefatoAmaldicoadoSeed[] =
  [
    {
      codigo: 'LIGACAO_DIRETA_INFERNAL_SUP',
      nome: 'Ligação Direta Infernal',
      descricao:
        PREFIXO +
        'Fios amaldiçoados que animam veículos e fortalecem sua resistência.',
      categoria: CategoriaEquipamento.CATEGORIA_3,
      espacos: 1,
      tipoUso: TipoUsoEquipamento.GERAL,
      efeito:
        'Veiculo recebe RD 20 e +5 em Pilotagem, mas falhas são amplificadas',
      artefato: {
        tipoBase: 'ARTEFATO_GERAL',
        proficienciaRequerida: false,
        efeito:
          'Veiculo recebe RD 20 e +5 em Pilotagem, mas falhas são amplificadas',
      },
    },
    {
      codigo: 'MEDIDOR_CONDICAO_VERTEBRAL_SUP',
      nome: 'Medidor de Condição Vertebral',
      descricao:
        PREFIXO +
        'Dispositivo grotesco que monitora a saude e efeitos amaldiçoados.',
      categoria: CategoriaEquipamento.CATEGORIA_3,
      espacos: 1,
      tipoUso: TipoUsoEquipamento.VESTIVEL,
      efeito: '+2 em Fortitude; +5 em Medicina para auxiliar o usuário',
      artefato: {
        tipoBase: 'ARTEFATO_GERAL',
        proficienciaRequerida: false,
        efeito: '+2 em Fortitude; +5 em Medicina para auxiliar o usuário',
      },
    },
  ];

export type ModificacaoSuplemento = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoModificacao;
  incrementoEspacos: number;
  restricoes?: Prisma.InputJsonValue | null;
  efeitosMecanicos?: Prisma.InputJsonValue | null;
};

export const modificacoesSuplemento: ModificacaoSuplemento[] = [
  {
    codigo: 'MOD_BATERIA_POTENTE_SUP',
    nome: 'Bateria Potente',
    descricao:
      PREFIXO +
      'Modificação para objetos elétricos. Dobra duração da bateria e alcance da luz. Em tasers, dobra usos, aumenta dano para 1d8 e DT em +5.',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: 0,
    restricoes: { tiposEquipamento: [TipoEquipamento.ACESSORIO] },
    efeitosMecanicos: {
      descricao:
        'Dobra duração da bateria e alcance de luz. Em tasers: dobra usos, dano 1d8 e DT +5.',
    },
  },
];

async function upsertSuplemento(prisma: PrismaClient) {
  return prisma.suplemento.upsert({
    where: { codigo: SUPLEMENTO_CODIGO },
    update: {
      nome: SUPLEMENTO_NOME,
      descricao: DESCRICAO_SUPLEMENTO,
      status: StatusPublicacao.PUBLICADO,
      versao: '1.0.0',
      tags: jsonOrNull(['sobrevivendo', 'jujutsu', 'oficial']),
    },
    create: {
      codigo: SUPLEMENTO_CODIGO,
      nome: SUPLEMENTO_NOME,
      descricao: DESCRICAO_SUPLEMENTO,
      status: StatusPublicacao.PUBLICADO,
      versao: '1.0.0',
      tags: jsonOrNull(['sobrevivendo', 'jujutsu', 'oficial']),
    },
  });
}

async function seedOrigens(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando origens do suplemento...');

  const get = createLookupCache(prisma);

  for (const origem of origensSuplemento) {
    const origemRow = await prisma.origem.upsert({
      where: { nome: origem.nome },
      update: {
        descricao: origem.descricao,
        requisitosTexto: origem.requisitosTexto ?? null,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        nome: origem.nome,
        descricao: origem.descricao,
        requisitosTexto: origem.requisitosTexto ?? null,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    const habilidadeRow = await prisma.habilidade.upsert({
      where: { nome: origem.habilidade.nome },
      update: {
        tipo: 'ORIGEM',
        descricao: origem.habilidade.descricao,
        hereditaria: false,
        mecanicasEspeciais: jsonOrNull(
          origem.habilidade.mecanicasEspeciais ?? null,
        ),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        nome: origem.habilidade.nome,
        tipo: 'ORIGEM',
        descricao: origem.habilidade.descricao,
        hereditaria: false,
        mecanicasEspeciais: jsonOrNull(
          origem.habilidade.mecanicasEspeciais ?? null,
        ),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    await prisma.habilidadeOrigem.upsert({
      where: {
        origemId_habilidadeId: {
          origemId: origemRow.id,
          habilidadeId: habilidadeRow.id,
        },
      },
      update: {},
      create: { origemId: origemRow.id, habilidadeId: habilidadeRow.id },
    });

    await prisma.origemPericia.deleteMany({
      where: { origemId: origemRow.id },
    });
    for (const pericia of origem.pericias) {
      const periciaId = await get.periciaId(pericia.codigo);
      await prisma.origemPericia.create({
        data: {
          origemId: origemRow.id,
          periciaId,
          tipo: pericia.tipo,
          grupoEscolha: pericia.grupoEscolha ?? null,
        },
      });
    }
  }

  console.log(
    `OK: ${origensSuplemento.length} origens do suplemento cadastradas.`,
  );
}

async function seedPoderes(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando poderes genéricos do suplemento...');

  for (const poder of poderesSuplemento) {
    await prisma.habilidade.upsert({
      where: { nome: poder.nome },
      update: {
        tipo: 'PODER_GENERICO',
        origem: 'GERAL',
        descricao: poder.descricao,
        requisitos: jsonOrNull(poder.requisitos ?? null),
        mecanicasEspeciais: jsonOrNull(poder.mecanicasEspeciais ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        nome: poder.nome,
        tipo: 'PODER_GENERICO',
        origem: 'GERAL',
        descricao: poder.descricao,
        requisitos: jsonOrNull(poder.requisitos ?? null),
        mecanicasEspeciais: jsonOrNull(poder.mecanicasEspeciais ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  console.log(`OK: ${poderesSuplemento.length} poderes genéricos cadastrados.`);
}

async function seedTrilhas(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando trilhas do suplemento...');

  const get = createLookupCache(prisma);

  for (const trilha of trilhasSuplemento) {
    const classeId = await get.classeId(trilha.classe);

    const trilhaRow = await prisma.trilha.upsert({
      where: { nome: trilha.nome },
      update: {
        descricao: trilha.descricao,
        classeId,
        requisitos: jsonOrNull(trilha.requisitos ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        nome: trilha.nome,
        descricao: trilha.descricao,
        classeId,
        requisitos: jsonOrNull(trilha.requisitos ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    const caminhosMap = new Map<string, number>();
    if (trilha.caminhos?.length) {
      for (const caminho of trilha.caminhos) {
        const caminhoRow = await prisma.caminho.upsert({
          where: { nome: caminho.nome },
          update: {
            descricao: caminho.descricao ?? null,
            trilhaId: trilhaRow.id,
            fonte: TipoFonte.SUPLEMENTO,
            suplementoId,
          },
          create: {
            nome: caminho.nome,
            descricao: caminho.descricao ?? null,
            trilhaId: trilhaRow.id,
            fonte: TipoFonte.SUPLEMENTO,
            suplementoId,
          },
        });

        caminhosMap.set(caminho.nome, caminhoRow.id);
      }
    }

    for (const habilidade of trilha.habilidades) {
      const dataHabilidadeBase = {
        tipo: 'TRILHA',
        descricao: habilidade.descricao,
        hereditaria: false,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      };
      const dataHabilidadeUpdate = {
        ...dataHabilidadeBase,
        ...(habilidade.codigo ? { codigo: habilidade.codigo } : {}),
        ...(habilidade.mecanicasEspeciais !== undefined
          ? {
              mecanicasEspeciais: jsonOrNull(
                habilidade.mecanicasEspeciais ?? null,
              ),
            }
          : {}),
      };
      const dataHabilidadeCreate = {
        ...dataHabilidadeBase,
        codigo: habilidade.codigo ?? null,
        mecanicasEspeciais: jsonOrNull(habilidade.mecanicasEspeciais ?? null),
      };

      const habilidadeRow = await prisma.habilidade.upsert({
        where: { nome: habilidade.nome },
        update: dataHabilidadeUpdate,
        create: {
          nome: habilidade.nome,
          ...dataHabilidadeCreate,
        },
      });

      const caminhoId = habilidade.caminho
        ? (caminhosMap.get(habilidade.caminho) ?? null)
        : null;

      await prisma.habilidadeTrilha.upsert({
        where: {
          trilhaId_habilidadeId_nivelConcedido: {
            trilhaId: trilhaRow.id,
            habilidadeId: habilidadeRow.id,
            nivelConcedido: habilidade.nivel,
          },
        },
        update: { caminhoId },
        create: {
          trilhaId: trilhaRow.id,
          habilidadeId: habilidadeRow.id,
          nivelConcedido: habilidade.nivel,
          caminhoId,
        },
      });
    }
  }

  console.log(
    `OK: ${trilhasSuplemento.length} trilhas do suplemento cadastradas.`,
  );
}

async function seedEquipamentos(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando equipamentos do suplemento...');

  const nomesBase = new Set(
    (
      await prisma.equipamentoCatalogo.findMany({
        where: { fonte: TipoFonte.SISTEMA_BASE },
        select: { nome: true },
      })
    ).map((item) => item.nome),
  );

  const resolverNome = (nome: string) =>
    nomesBase.has(nome) ? `${nome} (Sobrevivendo)` : nome;

  for (const arma of armasSuplemento) {
    const nome = resolverNome(arma.nome);
    const empunhadurasJson = arma.empunhaduras?.length
      ? JSON.stringify(arma.empunhaduras)
      : undefined;

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: arma.codigo },
      update: {
        codigo: arma.codigo,
        nome,
        descricao: arma.descricao,
        tipo: TipoEquipamento.ARMA,
        categoria: arma.categoria,
        espacos: arma.espacos,
        proficienciaArma: arma.proficienciaArma,
        empunhaduras: empunhadurasJson,
        tipoArma: arma.tipoArma,
        subtipoDistancia: arma.subtipoDistancia ?? null,
        agil: arma.agil,
        criticoValor: arma.criticoValor,
        criticoMultiplicador: arma.criticoMultiplicador,
        alcance: arma.alcance,
        tipoMunicaoCodigo: arma.tipoMunicaoCodigo ?? null,
        habilidadeEspecial: arma.habilidadeEspecial ?? null,
        tipoUso: TipoUsoEquipamento.GERAL,
        tipoAmaldicoado: null,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        codigo: arma.codigo,
        nome,
        descricao: arma.descricao,
        tipo: TipoEquipamento.ARMA,
        categoria: arma.categoria,
        espacos: arma.espacos,
        proficienciaArma: arma.proficienciaArma,
        empunhaduras: empunhadurasJson,
        tipoArma: arma.tipoArma,
        subtipoDistancia: arma.subtipoDistancia ?? null,
        agil: arma.agil,
        criticoValor: arma.criticoValor,
        criticoMultiplicador: arma.criticoMultiplicador,
        alcance: arma.alcance,
        tipoMunicaoCodigo: arma.tipoMunicaoCodigo ?? null,
        habilidadeEspecial: arma.habilidadeEspecial ?? null,
        tipoUso: TipoUsoEquipamento.GERAL,
        tipoAmaldicoado: null,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    await prisma.equipamentoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (let ordem = 0; ordem < arma.danos.length; ordem++) {
      const dano = arma.danos[ordem];
      await prisma.equipamentoDano.create({
        data: {
          equipamentoId: equipamento.id,
          empunhadura: dano.empunhadura ?? null,
          tipoDano: dano.tipoDano,
          rolagem: dano.rolagem,
          valorFlat: dano.valorFlat ?? 0,
          ordem,
        },
      });
    }
  }

  for (const arma of armasSuplemento) {
    const codigo = `${arma.codigo}_AMALDICOADA_SIMPLES`;
    const nome = resolverNome(`${arma.nome} Amaldiçoada`);
    const empunhadurasJson = arma.empunhaduras?.length
      ? JSON.stringify(arma.empunhaduras)
      : undefined;
    const categoria = subirCategoria(arma.categoria, 1);

    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo },
      update: {
        codigo,
        nome,
        descricao:
          PREFIXO +
          `Versão amaldiçoada simples de ${arma.nome}. Acrescenta +1d6 de dano de energia amaldiçoada e permite exorcizar espíritos amaldiçoados.`,
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria,
        espacos: arma.espacos,
        proficienciaArma: arma.proficienciaArma,
        empunhaduras: empunhadurasJson,
        tipoArma: arma.tipoArma,
        subtipoDistancia: arma.subtipoDistancia ?? null,
        agil: arma.agil,
        criticoValor: arma.criticoValor,
        criticoMultiplicador: arma.criticoMultiplicador,
        alcance: arma.alcance,
        tipoMunicaoCodigo: arma.tipoMunicaoCodigo ?? null,
        habilidadeEspecial: arma.habilidadeEspecial ?? null,
        tipoUso: TipoUsoEquipamento.GERAL,
        tipoAmaldicoado: null,
        complexidadeMaldicao: ComplexidadeMaldicao.SIMPLES,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        codigo,
        nome,
        descricao:
          PREFIXO +
          `Versão amaldiçoada simples de ${arma.nome}. Acrescenta +1d6 de dano de energia amaldiçoada e permite exorcizar espíritos amaldiçoados.`,
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria,
        espacos: arma.espacos,
        proficienciaArma: arma.proficienciaArma,
        empunhaduras: empunhadurasJson,
        tipoArma: arma.tipoArma,
        subtipoDistancia: arma.subtipoDistancia ?? null,
        agil: arma.agil,
        criticoValor: arma.criticoValor,
        criticoMultiplicador: arma.criticoMultiplicador,
        alcance: arma.alcance,
        tipoMunicaoCodigo: arma.tipoMunicaoCodigo ?? null,
        habilidadeEspecial: arma.habilidadeEspecial ?? null,
        tipoUso: TipoUsoEquipamento.GERAL,
        tipoAmaldicoado: null,
        complexidadeMaldicao: ComplexidadeMaldicao.SIMPLES,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    await prisma.armaAmaldicoada.upsert({
      where: { equipamentoId: equipamento.id },
      update: {
        tipoBase: arma.codigo,
        proficienciaRequerida: false,
        efeito: '+1d6 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      },
      create: {
        equipamentoId: equipamento.id,
        tipoBase: arma.codigo,
        proficienciaRequerida: false,
        efeito: '+1d6 energia amaldiçoada. Exorciza espíritos amaldiçoados.',
      },
    });

    const danosComEnergia = arma.danos.flatMap((dano) => [
      dano,
      {
        empunhadura: dano.empunhadura,
        tipoDano: TipoDano.ENERGIA_AMALDICOADA,
        rolagem: '1d6',
        valorFlat: 0,
      },
    ]);

    await prisma.equipamentoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    for (let ordem = 0; ordem < danosComEnergia.length; ordem++) {
      const dano = danosComEnergia[ordem];
      await prisma.equipamentoDano.create({
        data: {
          equipamentoId: equipamento.id,
          empunhadura: dano.empunhadura ?? null,
          tipoDano: dano.tipoDano,
          rolagem: dano.rolagem,
          valorFlat: dano.valorFlat ?? 0,
          ordem,
        },
      });
    }
  }

  for (const acc of acessoriosSuplemento) {
    const nome = resolverNome(acc.nome);
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: acc.codigo },
      update: {
        ...acc,
        nome,
        tipo: TipoEquipamento.ACESSORIO,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        ...acc,
        nome,
        tipo: TipoEquipamento.ACESSORIO,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  for (const exp of explosivosSuplemento) {
    const nome = resolverNome(exp.nome);
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: exp.codigo },
      update: {
        ...exp,
        nome,
        tipo: TipoEquipamento.EXPLOSIVO,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        ...exp,
        nome,
        tipo: TipoEquipamento.EXPLOSIVO,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  for (const item of [
    ...itensOperacionaisSuplemento,
    ...medicamentosSuplemento,
  ]) {
    const nome = resolverNome(item.nome);
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: item.codigo },
      update: {
        ...item,
        nome,
        tipo: TipoEquipamento.ITEM_OPERACIONAL,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        ...item,
        nome,
        tipo: TipoEquipamento.ITEM_OPERACIONAL,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  for (const item of itensAmaldicoadosSuplemento) {
    const nome = resolverNome(item.nome);
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: item.codigo },
      update: {
        codigo: item.codigo,
        nome,
        descricao: item.descricao,
        tipo: TipoEquipamento.ITEM_AMALDICOADO,
        categoria: item.categoria,
        espacos: item.espacos,
        tipoAmaldicoado: item.tipoAmaldicoado ?? TipoAmaldicoado.ITEM,
        tipoUso: item.tipoUso ?? TipoUsoEquipamento.GERAL,
        efeito: item.efeito,
        efeitoConsumo: jsonOrNull(item.efeitoConsumo ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        codigo: item.codigo,
        nome,
        descricao: item.descricao,
        tipo: TipoEquipamento.ITEM_AMALDICOADO,
        categoria: item.categoria,
        espacos: item.espacos,
        tipoAmaldicoado: item.tipoAmaldicoado ?? TipoAmaldicoado.ITEM,
        tipoUso: item.tipoUso ?? TipoUsoEquipamento.GERAL,
        efeito: item.efeito,
        efeitoConsumo: jsonOrNull(item.efeitoConsumo ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  for (const item of artefatosAmaldicoadosSuplemento) {
    const nome = resolverNome(item.nome);
    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: item.codigo },
      update: {
        codigo: item.codigo,
        nome,
        descricao: item.descricao,
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria: item.categoria,
        espacos: item.espacos,
        tipoAmaldicoado: TipoAmaldicoado.ARTEFATO,
        tipoUso: item.tipoUso ?? TipoUsoEquipamento.GERAL,
        efeito: item.efeito,
        complexidadeMaldicao: ComplexidadeMaldicao.COMPLEXA,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        codigo: item.codigo,
        nome,
        descricao: item.descricao,
        tipo: TipoEquipamento.FERRAMENTA_AMALDICOADA,
        categoria: item.categoria,
        espacos: item.espacos,
        tipoAmaldicoado: TipoAmaldicoado.ARTEFATO,
        tipoUso: item.tipoUso ?? TipoUsoEquipamento.GERAL,
        efeito: item.efeito,
        complexidadeMaldicao: ComplexidadeMaldicao.COMPLEXA,
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });

    await prisma.artefatoAmaldicoado.upsert({
      where: { equipamentoId: equipamento.id },
      update: {
        equipamentoId: equipamento.id,
        tipoBase: item.artefato.tipoBase,
        proficienciaRequerida: item.artefato.proficienciaRequerida ?? false,
        efeito: item.artefato.efeito ?? item.efeito,
        custoUso: item.artefato.custoUso ?? null,
        manutencao: item.artefato.manutencao ?? null,
      },
      create: {
        equipamentoId: equipamento.id,
        tipoBase: item.artefato.tipoBase,
        proficienciaRequerida: item.artefato.proficienciaRequerida ?? false,
        efeito: item.artefato.efeito ?? item.efeito,
        custoUso: item.artefato.custoUso ?? null,
        manutencao: item.artefato.manutencao ?? null,
      },
    });
  }

  console.log('OK: equipamentos do suplemento cadastrados.');
}

async function seedModificacoes(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando modificações do suplemento...');

  for (const mod of modificacoesSuplemento) {
    await prisma.modificacaoEquipamento.upsert({
      where: { codigo: mod.codigo },
      update: {
        nome: mod.nome,
        descricao: mod.descricao,
        tipo: mod.tipo,
        incrementoEspacos: mod.incrementoEspacos,
        restricoes: jsonOrNull(mod.restricoes ?? null),
        efeitosMecanicos: jsonOrNull(mod.efeitosMecanicos ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        codigo: mod.codigo,
        nome: mod.nome,
        descricao: mod.descricao,
        tipo: mod.tipo,
        incrementoEspacos: mod.incrementoEspacos,
        restricoes: jsonOrNull(mod.restricoes ?? null),
        efeitosMecanicos: jsonOrNull(mod.efeitosMecanicos ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
    });
  }

  const totalModificacoes = modificacoesSuplemento.length;
  console.log(
    `OK: ${totalModificacoes} ${
      totalModificacoes === 1 ? 'modificação' : 'modificações'
    } do suplemento ${totalModificacoes === 1 ? 'cadastrada' : 'cadastradas'}.`,
  );
}

export async function seedEquipamentosSobrevivendoAoJujutsu(
  prisma: PrismaClient,
) {
  const suplemento = await upsertSuplemento(prisma);
  await seedEquipamentos(prisma, suplemento.id);
}

export async function seedSobrevivendoAoJujutsu(prisma: PrismaClient) {
  console.log('Seed do suplemento Sobrevivendo ao Jujutsu...');

  const suplemento = await upsertSuplemento(prisma);

  await seedOrigens(prisma, suplemento.id);
  await seedPoderes(prisma, suplemento.id);
  await seedTrilhas(prisma, suplemento.id);
  await seedEquipamentos(prisma, suplemento.id);
  await seedModificacoes(prisma, suplemento.id);

  console.log('OK: seed do suplemento concluído.');
}
