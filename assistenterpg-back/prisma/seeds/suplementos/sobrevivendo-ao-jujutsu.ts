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

const SUPLEMENTO_CODIGO = 'SOBREVIVENDO_AO_JUJUTSU';
const SUPLEMENTO_NOME = 'Sobrevivendo ao Jujutsu';
const PREFIXO = '[Suplemento: Sobrevivendo ao Jujutsu] ';

const DESCRICAO_SUPLEMENTO =
  'Conteudo adaptado do suplemento "Sobrevivendo ao Horror" para o sistema de Jujutsu.';

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

type OrigemSuplemento = {
  nome: string;
  descricao: string;
  requisitosTexto?: string | null;
  pericias: Array<{ codigo: string; tipo: 'FIXA' | 'ESCOLHA'; grupoEscolha?: number }>;
  habilidade: {
    nome: string;
    descricao: string;
    mecanicasEspeciais?: Prisma.InputJsonValue | null;
  };
};

type PoderSuplemento = {
  nome: string;
  descricao: string;
  requisitos?: Prisma.InputJsonValue | null;
  mecanicasEspeciais?: Prisma.InputJsonValue | null;
};

type TrilhaSuplemento = {
  classe: string;
  nome: string;
  descricao: string;
  requisitos?: Prisma.InputJsonValue | null;
  habilidades: Array<{ nome: string; descricao: string; nivel: number }>;
};

type EquipamentoArmaSeed = {
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

type EquipamentoAcessorioSeed = {
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
};

type EquipamentoExplosivoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoExplosivo: TipoExplosivo;
  efeito: string;
  tipoUso?: TipoUsoEquipamento;
};

type EquipamentoOperacionalSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  periciaBonificada?: string;
  bonusPericia?: number;
  efeito?: string;
  tipoUso?: TipoUsoEquipamento;
};

type EquipamentoAmaldicoadoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoAmaldicoado?: TipoAmaldicoado;
  tipoUso?: TipoUsoEquipamento;
  efeito: string;
};

type EquipamentoArtefatoAmaldicoadoSeed = {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoUso?: TipoUsoEquipamento;
  efeito: string;
  artefato: {
    tipoBase: string;
    proficienciaRequerida?: boolean;
    efeito?: string;
    custoUso?: string | null;
    manutencao?: string | null;
  };
};

const origensSuplemento: OrigemSuplemento[] = [
  {
    nome: 'Amigo dos Animais',
    descricao:
      PREFIXO +
      'Voce desenvolveu uma conexao forte com animais e aprendeu a confiar neles para sobreviver a maldicoes.',
    pericias: [
      { codigo: 'ADESTRAMENTO', tipo: 'FIXA' },
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Companheiro Animal (Amigo dos Animais)',
      descricao:
        PREFIXO +
        'Voce entende as intencoes de animais e pode usar Adestramento para mudar a atitude deles. Alem disso, possui um companheiro animal que concede +2 em uma pericia escolhida (aprovada pelo mestre). No nivel 7 ele concede o bonus de um aliado do tipo escolhido, e no nivel 14 concede a habilidade desse aliado. Se o companheiro morrer, voce perde 10 de Sanidade permanentemente e fica perturbado ate o fim da cena.',
    },
  },
  {
    nome: 'Astronauta',
    descricao:
      PREFIXO +
      'Explorador espacial acostumado a pressao e isolamento, que viu o sobrenatural fora da Terra.',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Acostumado ao Extremo (Astronauta)',
      descricao:
        PREFIXO +
        'Quando sofre dano de fogo, frio ou mental, voce pode gastar 1 PE para reduzir o dano em 5. A cada novo uso na mesma cena, o custo aumenta em +1 PE.',
    },
  },
  {
    nome: 'Chef das Maldicoes',
    descricao:
      PREFIXO +
      'Um cozinheiro que aprendeu a preparar ingredientes amaldicoados, transformando o tabu em arma.',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Fome das Maldicoes (Chef das Maldicoes)',
      descricao:
        PREFIXO +
        'Voce pode usar partes de maldicoes como ingredientes culinarios. No inicio de cada missao, pode solicitar partes como itens de categoria I (0,5 espaco). Em combate, cada maldicao Pequena ou maior fornece 1 ingrediente. Com uma acao de interludio e 1 ingrediente, faz um prato especial: teste de Profissao (cozinheiro) DT 15. Sucesso concede RD 10 contra o tipo de dano associado a energia da maldicao; falha causa vulnerabilidade. Efeitos duram ate o fim da proxima cena. A cada refeicao, voce perde 1 ponto permanente de Sanidade. Se usar regra de nivel/exposicao, trate cada parte diferente como +3% de exposicao (ou ajuste equivalente).',
    },
  },
  {
    nome: 'Colegial',
    descricao:
      PREFIXO +
      'Um jovem estudante que descobriu as maldicoes e encontrou forca nos amigos.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Poder da Amizade (Colegial)',
      descricao:
        PREFIXO +
        'Escolha um personagem para ser seu melhor amigo. Se estiver em alcance medio e puderem trocar olhares, voce recebe +2 em testes de pericia. Se ele morrer, seu total de PE e reduzido em -1 para cada 5 niveis ate o fim da missao. Se perder o amigo, pode escolher outro no inicio da proxima missao.',
    },
  },
  {
    nome: 'Cosplayer',
    descricao:
      PREFIXO +
      'Fa de cosplay que transformou sua arte em protecao contra o sobrenatural.',
    pericias: [
      { codigo: 'ARTES', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Nao e Fantasia, e Cosplay! (Cosplayer)',
      descricao:
        PREFIXO +
        'Voce pode fazer testes de disfarce usando Artes em vez de Enganacao. Alem disso, se estiver usando um cosplay relacionado ao teste, recebe +2.',
    },
  },
  {
    nome: 'Diplomata',
    descricao:
      PREFIXO +
      'Um negociador que aprendeu que algumas entidades nao aceitam acordos.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'DIPLOMACIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Conexoes (Diplomata)',
      descricao:
        PREFIXO +
        'Recebe +2 em Diplomacia. Alem disso, se puder contatar um NPC capaz de auxiliar, pode gastar 10 minutos e 2 PE para substituir um teste de pericia relacionado ao conhecimento desse NPC por um teste de Diplomacia.',
    },
  },
  {
    nome: 'Explorador',
    descricao:
      PREFIXO +
      'Aventureiro que aprendeu a suportar clima, fome e perigos para seguir pistas de maldicoes.',
    pericias: [
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Manual do Sobrevivente (Explorador)',
      descricao:
        PREFIXO +
        'Quando faz um teste para resistir a armadilhas, clima, doencas, fome, sede, fumaca, sono, sufocamento ou veneno (inclusive com origem sobrenatural), pode gastar 2 PE para receber +5. Em cenas de interludio, condicoes de sono precarias contam como normais.',
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
      nome: 'Mutacao (Experimento)',
      descricao:
        PREFIXO +
        'Voce recebe resistencia a dano 2 e +2 em uma pericia a escolha baseada em Forca, Agilidade ou Vigor. Entretanto sofre -1d20 em Diplomacia.',
    },
  },
  {
    nome: 'Fanatico por Maldicoes',
    descricao:
      PREFIXO +
      'Obcecado pelo sobrenatural, voce se tornou um cacador de maldicoes.',
    pericias: [
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Conhecimento Oculto (Fanatico por Maldicoes)',
      descricao:
        PREFIXO +
        'Voce pode usar Jujutsu para identificar maldicoes a partir de pistas. Se passar, descobre caracteristicas e recebe +2 em testes contra a maldicao ate o fim da missao.',
    },
  },
  {
    nome: 'Fotografo',
    descricao:
      PREFIXO +
      'Um artista visual que encontrou o sobrenatural atraves de suas lentes.',
    pericias: [
      { codigo: 'ARTES', tipo: 'FIXA' },
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Atraves da Lente (Fotografo)',
      descricao:
        PREFIXO +
        'Quando faz um teste de Investigacao ou Percepcao para adquirir pistas olhando por uma camera, pode gastar 2 PE para receber +5. Um personagem que se move olhando atraves da lente anda a metade do deslocamento.',
    },
  },
  {
    nome: 'Inventor Amaldicoado',
    descricao:
      PREFIXO +
      'Inventor que aplica energia amaldicoada em dispositivos e prototipos.',
    pericias: [
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Invencao Amaldicoada (Inventor Amaldicoado)',
      descricao:
        PREFIXO +
        'Escolha uma tecnica amaldicoada nao inata de nivel 1. Voce possui um invento (categoria 0, 1 espaco) que permite executar o efeito basico dessa tecnica sem custo de PE. Para ativar, gasta uma acao padrao e testa Profissao (engenheiro) DT 15 +5 para cada ativacao na mesma missao. Se falhar, o item enguica. Uma acao de interludio para manutencao redefine a DT para 15. Voce pode trocar a tecnica do invento no inicio de cada missao.',
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
        'Escolha um numero da sorte entre 1 e 6. No inicio de cada cena, voce pode gastar 1 PE e rolar 1d6. Se cair no seu numero, recebe +2 em testes de pericia ate o fim da cena. Caso contrario, na proxima vez que usar esta habilidade, escolha mais um numero. Quando acertar, volta a 1 numero.',
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
        'Voce sofre apenas metade do dano mental ao presenciar cenas ligadas a sua rotina (cadaveres, necropsias etc). Alem disso, ao fazer testes de Medicina para primeiros socorros ou necropsia, pode gastar 2 PE para receber +5.',
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
        'Desde que possa ver o ceu, voce sempre sabe as direcoes dos pontos cardeais e consegue chegar sem se perder em lugares visitados. Quando faz um teste de Sobrevivencia, pode gastar 2 PE para rolar novamente e ficar com o melhor. Em cenas de interludio, sono precario conta como normal.',
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
        'Voce recebe +5 PV e pode prender a respiracao por rodadas iguais ao dobro do seu Vigor. Ao passar em testes de Atletismo para natacao, avanca deslocamento normal.',
    },
  },
  {
    nome: 'Motorista',
    descricao:
      PREFIXO +
      'Condutor profissional que encarou o sobrenatural na estrada.',
    pericias: [
      { codigo: 'PILOTAGEM', tipo: 'FIXA' },
      { codigo: 'REFLEXOS', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Maos no Volante (Motorista)',
      descricao:
        PREFIXO +
        'Voce nao sofre penalidades de ataque por estar em um veiculo em movimento. Sempre que estiver pilotando e tiver que fazer um teste de Pilotagem ou resistencia, pode gastar 2 PE para receber +5 nesse teste.',
    },
  },
  {
    nome: 'Nerd Entusiasta',
    descricao:
      PREFIXO +
      'Curioso e obstinado, domina temas tecnicos e culturais para enfrentar maldicoes.',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'O Inteligentao (Nerd Entusiasta)',
      descricao:
        PREFIXO +
        'O bonus da acao de interludio ler aumenta em +1 dado (de +1d6 para +2d6).',
    },
  },
  {
    nome: 'Profetizado',
    descricao:
      PREFIXO +
      'Voce pressentiu sua morte e aprendeu a usar isso como impulso.',
    requisitosTexto: 'Escolha uma pericia adicional relacionada a sua premonicao.',
    pericias: [
      { codigo: 'VONTADE', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'ESCOLHA', grupoEscolha: 1 },
    ],
    habilidade: {
      nome: 'Luta ou Fuga (Profetizado)',
      descricao:
        PREFIXO +
        'Voce recebe +2 em Vontade. Quando uma referencia direta a sua premonicao aparece, voce recebe +2 PE temporarios ate o fim da cena.',
    },
  },
  {
    nome: 'Psicologo',
    descricao:
      PREFIXO +
      'Especialista em mente humana que lida com traumas causados por maldicoes.',
    pericias: [
      { codigo: 'INTUICAO', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Terapia (Psicologo)',
      descricao:
        PREFIXO +
        'Voce pode usar Profissao (psicologo) como Diplomacia. Alem disso, uma vez por rodada, quando voce ou um aliado em alcance curto falha em um teste de resistencia contra dano mental, pode gastar 2 PE para fazer um teste de Profissao (psicologo) e usar o resultado no lugar do teste falho.',
    },
  },
  {
    nome: 'Reporter Investigativo',
    descricao:
      PREFIXO +
      'Jornalista que usa investigacao para descobrir a verdade por tras do sobrenatural.',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
    ],
    habilidade: {
      nome: 'Encontrar a Verdade (Reporter Investigativo)',
      descricao:
        PREFIXO +
        'Voce pode usar Investigacao no lugar de Diplomacia ao persuadir e mudar atitude. Ao fazer um teste de Investigacao, pode gastar 2 PE para receber +5.',
    },
  },
];

const poderesSuplemento: PoderSuplemento[] = [
  {
    nome: 'Acrobatico',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Acrobacia ou, se ja for treinado, recebe +2. Terreno dificil nao reduz seu deslocamento nem impede investidas.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ACROBACIA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'As do Volante',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Pilotagem ou, se ja for treinado, recebe +2. Uma vez por rodada, quando um veiculo pilotado por voce sofre dano, pode testar Pilotagem para evitar o dano.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['PILOTAGEM'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Atletico',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Atletismo ou, se ja for treinado, recebe +2. Alem disso, recebe +3m de deslocamento.',
    requisitos: { atributos: { forca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ATLETISMO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Atraente',
    descricao:
      PREFIXO +
      'Voce recebe +5 em testes de Artes, Diplomacia, Enganacao e Intimidacao contra pessoas que possam se sentir atraidas por voce.',
    requisitos: { atributos: { presenca: 2 } },
  },
  {
    nome: 'Dedos Ageis',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Crime ou, se ja for treinado, recebe +2. Alem disso, pode arrombar com acao padrao, furtar com acao livre (1x/rodada) e sabotar com acao completa.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['CRIME'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Detector de Mentiras',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Intuicao ou, se ja for treinado, recebe +2. Outros sofrem -10 em Enganacao para mentir para voce.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['INTUICAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Especialista em Emergencias',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Medicina ou, se ja for treinado, recebe +2. Pode aplicar cicatrizantes e medicamentos como acao de movimento e sacar um deles como acao livre 1x/rodada.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['MEDICINA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Estigmatizado',
    descricao:
      PREFIXO +
      'Quando sofre dano mental de medo, pode converter esse dano em perda de PV.',
  },
  {
    nome: 'Foco em Pericia',
    descricao:
      PREFIXO +
      'Escolha uma pericia (exceto Luta e Pontaria). Quando faz um teste dessa pericia, rola +1d20. Pre-requisito: treinado na pericia escolhida.',
  },
  {
    nome: 'Inventario Organizado',
    descricao:
      PREFIXO +
      'Voce soma seu Intelecto no limite de espacos de inventario. Itens muito leves (0,5) passam a ocupar 0,25. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { inventario: { somarIntelecto: true, reduzirItensLeves: true } },
  },
  {
    nome: 'Informado',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Atualidades ou, se ja for treinado, recebe +2. Pode usar Atualidades no lugar de outra pericia para obter informacoes, com aprovacao do mestre.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ATUALIDADES'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Interrogador',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Intimidacao ou, se ja for treinado, recebe +2. Pode coagir com acao padrao 1x/cena contra o mesmo alvo.',
    requisitos: { atributos: { forca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['INTIMIDACAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Mentiroso Nato',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Enganacao ou, se ja for treinado, recebe +2. Penalidade por mentiras implausiveis diminui para -1d20.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ENGANACAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Observador',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Investigacao ou, se ja for treinado, recebe +2. Alem disso, soma Intelecto em Intuicao. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['INVESTIGACAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Pai de Pet',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Adestramento ou, se ja for treinado, recebe +2. Possui um animal de estimacao que concede +2 em duas pericias (exceto Luta ou Pontaria) aprovadas pelo mestre. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ADESTRAMENTO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Palavras de Devocao',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Religiao ou, se ja for treinado, recebe +2. Uma vez por cena, pode gastar 3 PE e uma acao completa para conceder RD mental 5 a um numero de pessoas ate o dobro da Presenca.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['RELIGIAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Parceiro',
    descricao:
      PREFIXO +
      'Voce possui um parceiro aliado de um tipo a sua escolha. Se perder, precisa gastar um periodo de descanso para obter outro. Pre-requisitos: treinado em Diplomacia, nivel 6.',
    requisitos: { pericias: [{ codigo: 'DIPLOMACIA', grauMinimo: 1 }], nivelMinimo: 6 },
  },
  {
    nome: 'Pensamento Tatico',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Tatica ou, se ja for treinado, recebe +2. Quando passa em teste de Tatica para analisar terreno, voce e aliados em alcance medio recebem acao de movimento extra na primeira rodada do proximo combate. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['TATICA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Personalidade Esoterica',
    descricao:
      PREFIXO +
      'Voce recebe +3 PE e treinamento em Jujutsu (ou +2 se ja treinado). Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { recursos: { peBase: 3 }, periciasTreinadas: ['JUJUTSU'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Persuasivo',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Diplomacia ou, se ja for treinado, recebe +2. Penalidade por pedidos custosos diminui em -5. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['DIPLOMACIA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Pesquisador Cientifico',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Ciencias ou, se ja for treinado, recebe +2. Pode usar Ciencias no lugar de Jujutsu e Sobrevivencia para identificar maldicoes e animais. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['CIENCIAS'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Proativo',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Iniciativa ou, se ja for treinado, recebe +2. Ao rolar 19 ou 20 em pelo menos um dado de Iniciativa, recebe uma acao padrao adicional no primeiro turno. Pre-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['INICIATIVA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Provisoes de Emergencia',
    descricao:
      PREFIXO +
      'Uma vez por missao, voce pode recuperar equipamentos como se estivesse em uma nova fase de preparacao.',
  },
  {
    nome: 'Racionalidade Inflexivel',
    descricao:
      PREFIXO +
      'Voce pode usar Intelecto no lugar de Presenca como atributo-chave de Vontade e para calcular seus PE. Pre-requisito: Int 3.',
    requisitos: { atributos: { intelecto: 3 } },
  },
  {
    nome: 'Rato de Computador',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Tecnologia ou, se ja for treinado, recebe +2. Pode hackear e operar dispositivos como acao completa e, 1x por cena de investigacao, buscar pistas sem gastar rodada. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['TECNOLOGIA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Resposta Rapida',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Reflexos ou, se ja for treinado, recebe +2. Ao falhar em Percepcao para evitar desprevenido, pode gastar 2 PE para rolar novamente com Reflexos. Pre-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['REFLEXOS'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Talentoso',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Artes ou, se ja for treinado, recebe +2. Quando impressiona com Artes, o bonus em pericias aumenta em +1 para cada 5 pontos acima da DT. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['ARTES'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Teimosia Obstinada',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Vontade ou, se ja for treinado, recebe +2. Ao fazer teste de Vontade contra efeitos mentais ou de atitude, pode gastar 2 PE para receber +5. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['VONTADE'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Tenacidade',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Fortitude ou, se ja for treinado, recebe +2. Quando estiver morrendo, mas consciente, pode fazer teste de Fortitude para encerrar a condicao. Pre-requisito: Vig 2.',
    requisitos: { atributos: { vigor: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['FORTITUDE'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Sentidos Agucados',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Percepcao ou, se ja for treinado, recebe +2. Nao fica desprevenido contra inimigos que nao possa ver e pode rerrolar camuflagem. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['PERCEPCAO'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Sobrevivencialista',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Sobrevivencia ou, se ja for treinado, recebe +2. Recebe +2 em testes contra clima e terreno dificil natural nao reduz seu deslocamento. Pre-requisito: Int 2.',
    requisitos: { atributos: { intelecto: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['SOBREVIVENCIA'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Sorrateiro',
    descricao:
      PREFIXO +
      'Voce recebe treinamento em Furtividade ou, se ja for treinado, recebe +2. Nao sofre penalidades por se mover normalmente enquanto furtivo e por seguir alguem em ambientes abertos. Pre-requisito: Agi 2.',
    requisitos: { atributos: { agilidade: 2 } },
    mecanicasEspeciais: { periciasTreinadas: ['FURTIVIDADE'], bonusSeJaTreinado: 2 },
  },
  {
    nome: 'Vitalidade Reforcada',
    descricao:
      PREFIXO +
      'Voce recebe +1 PV por nivel e +2 em Fortitude. Pre-requisito: Vig 2.',
    requisitos: { atributos: { vigor: 2 } },
    mecanicasEspeciais: { pvPorNivel: 1 },
  },
  {
    nome: 'Vontade Inabalavel',
    descricao:
      PREFIXO +
      'Voce recebe +1 PE a cada 2 niveis e +2 em Vontade. Pre-requisito: Pre 2.',
    requisitos: { atributos: { presenca: 2 } },
    mecanicasEspeciais: { recursos: { pePorNivelImpar: 1 } },
  },
];

const trilhasSuplemento: TrilhaSuplemento[] = [
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
          'Escolha Diplomacia ou Enganacao. Recebe treinamento (ou +2 se ja treinado). No inicio da missao, recebe documentos que garantem acesso e autoridade; contam como item operacional sem ocupar espaco.',
      },
      {
        nome: 'O Sorriso (Agente Secreto)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Recebe +2 em Diplomacia e Enganacao. Ao falhar em um teste dessas pericias, pode gastar 2 PE para repetir (uma vez por teste). 1x por cena, pode fazer Diplomacia para se acalmar.',
      },
      {
        nome: 'Metodo Investigativo (Agente Secreto)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Em cenas de investigacao, a urgencia aumenta em 1 rodada. Quando o mestre rolar eventos de investigacao, pode gastar 2 PE para transformar o resultado em "sem evento"; usos adicionais na mesma cena custam +2 PE.',
      },
      {
        nome: 'Multifacetado (Agente Secreto)',
        nivel: 20,
        descricao:
          PREFIXO +
          '1x por cena, pode gastar 5 de Sanidade para receber todas as habilidades de ate nivel 13 de uma trilha de Combatente ou Especialista a sua escolha (cumprindo requisitos). Duram ate o fim da cena e nao pode repetir a mesma trilha na mesma missao.',
      },
    ],
  },
  {
    classe: 'Combatente',
    nome: 'Cacador',
    descricao:
      PREFIXO +
      'Especialistas em rastrear e enfrentar maldicoes com metodo e informacao.',
    habilidades: [
      {
        nome: 'Rastrear Maldicoes (Cacador)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em Sobrevivencia (ou +2). Pode usar Sobrevivencia no lugar de Jujutsu para identificar maldicoes e no lugar de Investigacao e Percepcao para rastros e pistas paranormais.',
      },
      {
        nome: 'Estudar Fraquezas (Cacador)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Gaste uma acao de interludio estudando um alvo usando uma pista ligada a ele. Voce descobre uma informacao util e recebe +1 em testes de pericia contra o alvo por pista ate o fim da missao.',
      },
      {
        nome: 'Atacar das Sombras (Cacador)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Nao sofre penalidade em Furtividade por se mover no deslocamento normal. Se usar arma silenciosa, a penalidade por atacar na mesma rodada e reduzida. Em cenas de furtividade, sua visibilidade inicial e 1 ponto menor.',
      },
      {
        nome: 'Estudar a Presa (Cacador)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Ao usar Estudar Fraquezas em uma maldicao ou cultista, pode definir esse tipo como "presa". Contra sua presa, recebe +1 em testes de pericia, +1 na margem e multiplicador de critico e resistencia a dano 5. Apenas um tipo por vez.',
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
          'Ao fazer teste de pericia (exceto Luta e Pontaria), pode gastar 2 PE para trocar o atributo-base para Intelecto. Se possuir Conhecimento Aplicado, o custo reduz em 1 PE.',
      },
      {
        nome: 'Leitor Contumaz (Bibliotecario)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Cada dado de bonus da acao de interludio ler aumenta para 1d8 e pode ser aplicado em qualquer pericia. Ao usar esse bonus, pode gastar 2 PE para aumentar em +1 dado.',
      },
      {
        nome: 'Rato de Biblioteca (Bibliotecario)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Em ambientes com muitos livros, pode gastar alguns minutos (ou 1 rodada em investigacao) para receber os beneficios de ler ou revisar caso. 1x por cena.',
      },
      {
        nome: 'A Forca do Saber (Bibliotecario)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Intelecto +1. Soma Intelecto ao total de PE. Escolha uma pericia: seu atributo-base passa a ser Intelecto.',
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
          'Recebe +1d20 em testes para fugir de inimigos. Em cenas de perseguicao, se for a presa, pode acumular ate 4 falhas antes de ser pego.',
      },
      {
        nome: 'Determinacao Inquestionavel (Perseverante)',
        nivel: 13,
        descricao:
          PREFIXO +
          '1x por cena, pode gastar 5 PE e uma acao padrao para remover uma condicao de medo, mental ou paralisia (a criterio do mestre).',
      },
      {
        nome: 'So Mais um Passo (Perseverante)',
        nivel: 20,
        descricao:
          PREFIXO +
          '1x por rodada, quando sofrer dano que o levaria a 0 PV, pode gastar 5 PE para ficar com 1 PV. Nao funciona contra dano massivo.',
      },
    ],
  },
  {
    classe: 'Especialista',
    nome: 'Muambeiro',
    descricao:
      PREFIXO +
      'Especialista em equipamentos, capaz de fabricar e improvisar o necessario.',
    habilidades: [
      {
        nome: 'Mascate (Muambeiro)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em uma Profissao (armeiro, engenheiro ou quimico) e +5 na capacidade de carga. Ao fabricar item improvisado, a DT e reduzida em 10.',
      },
      {
        nome: 'Fabricacao Propria (Muambeiro)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Leva metade do tempo para fabricar itens mundanos. Pode fabricar duas municoes/explosivos por acao de manutencao e precisa apenas uma acao para armas, protecoes e itens gerais.',
      },
      {
        nome: 'Laboratorio de Campo (Muambeiro)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Recebe treinamento em uma Profissao (armeiro, engenheiro ou quimico) ou +5 se ja treinado. Pode fabricar e consertar itens amaldicoados em campo.',
      },
      {
        nome: 'Achado Conveniente (Muambeiro)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Pode gastar uma acao completa e 5 PE para "produzir" um item de ate categoria III (exceto itens amaldicoados). O item funciona ate o fim da cena.',
      },
    ],
  },
  {
    classe: 'Sentinela',
    nome: 'Exorcista',
    descricao:
      PREFIXO +
      'Feiticeiro que usa fe e disciplina para enfrentar o amaldicoado.',
    habilidades: [
      {
        nome: 'Revelacao do Mal (Exorcista)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Recebe treinamento em Religiao (ou +2). Pode usar Religiao no lugar de Investigacao e Percepcao para rastros paranormais e no lugar de Jujutsu para identificar maldicoes.',
      },
      {
        nome: 'Poder da Fe (Exorcista)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Torna-se veterano em Religiao (ou recebe +5). Ao falhar em um teste de resistencia, pode gastar 2 PE para repetir usando Religiao e aceitar o novo resultado.',
      },
      {
        nome: 'Parareligiosidade (Exorcista)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Ao usar uma tecnica amaldicoada, pode gastar +2 PE para adicionar um efeito equivalente a um catalisador amaldicoado.',
      },
      {
        nome: 'Chagas da Resistencia (Exorcista)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Quando sua Sanidade cair a 0, pode gastar 10 PV para ficar com SAN 1.',
      },
    ],
  },
  {
    classe: 'Sentinela',
    nome: 'Parapsicologo',
    descricao:
      PREFIXO +
      'Estudioso da mente humana e dos efeitos do amaldicoado sobre ela.',
    requisitos: { pericias: [{ codigo: 'PROFISSAO', treinada: true, detalhe: 'psicologo' }] },
    habilidades: [
      {
        nome: 'Terapia (Parapsicologo)',
        nivel: 2,
        descricao:
          PREFIXO +
          'Pode usar Profissao (psicologo) como Diplomacia. 1x por rodada, quando voce ou aliado falhar em resistencia a dano mental, pode gastar 2 PE e usar Profissao no lugar do teste falho. Se ja possuir esta habilidade, o custo reduz em 1 PE e recebe +2 em Profissao (psicologo).',
      },
      {
        nome: 'Palavras-chave (Parapsicologo)',
        nivel: 8,
        descricao:
          PREFIXO +
          'Ao passar em um teste para acalmar, pode gastar PE ate seu limite. Para cada 1 PE gasto, o alvo recupera 1 ponto de Sanidade.',
      },
      {
        nome: 'Reprogramacao Mental (Parapsicologo)',
        nivel: 13,
        descricao:
          PREFIXO +
          'Pode gastar 5 PE e uma acao de interludio para conceder temporariamente a outra pessoa um poder geral, da classe ou o primeiro poder de uma trilha (cumprindo requisitos) ate o proximo interludio.',
      },
      {
        nome: 'A Sanidade Esta La Fora (Parapsicologo)',
        nivel: 20,
        descricao:
          PREFIXO +
          'Pode gastar uma acao de movimento e 5 PE para remover todas as condicoes de medo ou mentais de uma pessoa adjacente (inclusive voce).',
      },
    ],
  },
];

const armasSuplemento: EquipamentoArmaSeed[] = [
  {
    codigo: 'BAIONETA_SUP',
    nome: 'Baioneta',
    descricao:
      PREFIXO +
      'Lammina fixavel em fuzis. Pode ser acoplada a arma de fogo de duas maos com acao de movimento; ao acoplar, torna-se arma de duas maos agil (dano 1d6) e ataques a distancia sofrem -1d20.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [{ empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.PERFURANTE, rolagem: '1d4' }],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial: 'Pode ser acoplada em arma de fogo de duas maos; dano 1d6 e ataques a distancia sofrem -1d20',
  },
  {
    codigo: 'BASTAO_POLICIAL_SUP',
    nome: 'Bastao Policial',
    descricao:
      PREFIXO +
      'Bastao de uso policial, util para aparar golpes. Ao usar esquiva com o bastao, o bonus na Defesa aumenta em +1.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [{ empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.IMPACTO, rolagem: '1d6' }],
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
      'Espingarda com dois canos. Pode disparar ambos no mesmo alvo: -1d20 no ataque e dano 6d6. Precisa de acao de movimento para recarregar apos os dois tiros.',
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
    habilidadeEspecial: 'Pode disparar dois canos: -1d20 no ataque e dano 6d6; recarrega apos 2 tiros',
  },
  {
    codigo: 'ESTILINGUE_SUP',
    nome: 'Estilingue',
    descricao:
      PREFIXO +
      'Arma simples que permite somar Forca ao dano. Pode lancar granadas em alcance longo. Bolinhas duram a missao e podem ser reutilizadas.',
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
    habilidadeEspecial: 'Soma Forca ao dano; pode lancar granadas em alcance longo',
  },
  {
    codigo: 'FACA_TATICA_SUP',
    nome: 'Faca Tatica',
    descricao:
      PREFIXO +
      'Faca equilibrada para contra-ataques e bloqueios. Pode ser arremessada.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: true,
    danos: [{ empunhadura: EmpunhaduraArma.LEVE, tipoDano: TipoDano.CORTANTE, rolagem: '1d4' }],
    criticoValor: 19,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial: 'Contra-ataque +2; pode gastar 2 PE e sacrificar para +20 RD no bloqueio',
  },
  {
    codigo: 'GANCHO_CARNE_SUP',
    nome: 'Gancho de Carne',
    descricao:
      PREFIXO +
      'Gancho metalico usado para pendurar carne. Pode ser amarrado a corda/corrente, aumentando alcance para 4,5m e espaco para 2.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.UMA_MAO],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [{ empunhadura: EmpunhaduraArma.UMA_MAO, tipoDano: TipoDano.PERFURANTE, rolagem: '1d6' }],
    criticoValor: 20,
    criticoMultiplicador: 2,
    alcance: AlcanceArma.ADJACENTE,
    habilidadeEspecial: 'Pode ser usado com corda/corrente: alcance 4,5m e espacos 2',
  },
  {
    codigo: 'PICARETA_SUP',
    nome: 'Picareta',
    descricao:
      PREFIXO +
      'Ferramenta de mineracao usada como arma. Forte, lenta e perigosa.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.DUAS_MAOS],
    tipoArma: TipoArma.CORPO_A_CORPO,
    agil: false,
    danos: [{ empunhadura: EmpunhaduraArma.DUAS_MAOS, tipoDano: TipoDano.IMPACTO, rolagem: '1d8' }],
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
      'Pistola de calibre superior. Sofre -1d20 em ataques; empunhar com duas maos remove a penalidade.',
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
    habilidadeEspecial: 'Sofre -1d20; empunhar com duas maos remove a penalidade',
  },
  {
    codigo: 'PREGADOR_PNEUMATICO_SUP',
    nome: 'Pregador Pneumatico',
    descricao:
      PREFIXO +
      'Ferramenta que dispara pregos sob pressao. Conta como arma de fogo para poderes que afetam esse tipo. Um rolo dura uma missao.',
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
    habilidadeEspecial: 'Conta como arma de fogo; rolo de pregos dura a missao',
  },
  {
    codigo: 'REVOLVER_COMPACTO_SUP',
    nome: 'Revolver Compacto',
    descricao:
      PREFIXO +
      'Revolver de baixo calibre e facil de esconder. Treinados em Crime podem carregar sem ocupar espaco.',
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
    habilidadeEspecial: 'Se for treinado em Crime, nao ocupa espaco ao carregar',
  },
  {
    codigo: 'SHURIKEN_SUP',
    nome: 'Shuriken',
    descricao:
      PREFIXO +
      'Projeteis metalicos em forma de estrela. Se for veterano em Pontaria, 1x por rodada pode gastar 1 PE para fazer um ataque adicional de shuriken.',
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
    habilidadeEspecial: 'Veterano em Pontaria: 1x por rodada pode gastar 1 PE para ataque adicional',
  },
];

const acessoriosSuplemento: EquipamentoAcessorioSeed[] = [
  {
    codigo: 'AMULETO_SAGRADO_SUP',
    nome: 'Amuleto Sagrado',
    descricao:
      PREFIXO +
      'Utensilio especial que reforca a fe e protege o usuario.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Religiao e Vontade',
    bonusPericia: 2,
    efeito: 'Concede +2 em Religiao e Vontade',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CELULAR_SUP',
    nome: 'Celular',
    descricao:
      PREFIXO +
      'Utensilio comum para comunicacao e acesso a informacoes.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: 'Com acesso a internet, concede +2 em testes para obter informacoes; ilumina 4,5m',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CHAVE_FENDA_UNIVERSAL_SUP',
    nome: 'Chave de Fenda Universal',
    descricao:
      PREFIXO +
      'Ferramenta versatil para criar ou reparar objetos.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: '+2 em testes para criar ou reparar objetos; pode servir como item de apoio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CHAVES_SUP',
    nome: 'Chaves',
    descricao:
      PREFIXO +
      'Molho de chaves usado para distrair ou abrir acessos comuns.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: 'Ao distrair com as chaves, +2 em Furtividade na mesma rodada',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'DOCUMENTOS_FALSOS_SUP',
    nome: 'Documentos Falsos',
    descricao:
      PREFIXO +
      'Conjunto de documentos em identidade falsa.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: '+2 em Diplomacia, Enganacao e Intimidacao para se passar pela identidade',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'MANUAL_OPERACIONAL_SUP',
    nome: 'Manual Operacional',
    descricao:
      PREFIXO +
      'Livro com licoes praticas sobre uma pericia.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: 'Acao de interludio lendo permite usar uma pericia como treinada ate o proximo interludio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'NOTEBOOK_SUP',
    nome: 'Notebook',
    descricao:
      PREFIXO +
      'Computador portatil para trabalho e entretenimento.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: '+2 em testes para obter informacoes com internet; ao relaxar, recupera +1 SAN',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'OCULOS_VISAO_NOTURNA_SUP',
    nome: 'Oculos de Visao Noturna',
    descricao:
      PREFIXO +
      'Oculos com bateria que permitem enxergar no escuro.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Concede visao no escuro; -1d20 contra ofuscado e efeitos de luz',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'OCULOS_ESCUROS_SUP',
    nome: 'Oculos Escuros',
    descricao:
      PREFIXO +
      'Oculos que protegem contra luz forte.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Nao pode ser ofuscado',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'PA_SUP',
    nome: 'Pa',
    descricao:
      PREFIXO +
      'Ferramenta pesada para cavar e mover detritos.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    efeito: '+5 em testes de Forca para cavar; pode ser usada como bastao',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'PARAQUEDAS_SUP',
    nome: 'Paraquedas',
    descricao:
      PREFIXO +
      'Equipamento que reduz ou anula dano de queda.',
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
      PREFIXO +
      'Roupa impermeavel com tanque e mascara para mergulho.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Resistencia quimica 5 e +5 contra efeitos ambientais; 1h de oxigenio',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'TRAJE_ESPACIAL_SUP',
    nome: 'Traje Espacial',
    descricao:
      PREFIXO +
      'Roupa completa para uso no vacuo espacial.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 5,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    efeito: 'Resistencia quimica 20 e +10 contra efeitos ambientais; 8h de oxigenio',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
];

const explosivosSuplemento: EquipamentoExplosivoSeed[] = [
  {
    codigo: 'DINAMITE_SUP',
    nome: 'Dinamite',
    descricao:
      PREFIXO +
      'Explosivo com pavio. Pode ser aceso e arremessado na mesma acao.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FRAGMENTACAO,
    efeito: 'Raio 6m; 4d6 impacto + 4d6 fogo; Reflexos evita metade e condicao em chamas',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'EXPLOSIVO_PLASTICO_SUP',
    nome: 'Explosivo Plastico',
    descricao:
      PREFIXO +
      'Massa adesiva com detonador remoto ou ignicao por fogo/eletricidade.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.MINA_ANTIPESSOAL,
    efeito: 'Raio 3m; 16d6 impacto; Reflexos DT Int reduz metade; dano dobrado contra objetos',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
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
    efeito: 'Explosao em raio 6m: 12d6 fogo e condicao em chamas; area fica em chamas',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'GRANADA_GAS_SONIFERO_SUP',
    nome: 'Granada de Gas Sonifero',
    descricao:
      PREFIXO +
      'Granada que libera gas sonifero em uma area ampla.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_ATORDOAMENTO,
    efeito: 'Raio 6m; alvos ficam inconscientes ou exaustos (Fortitude DT Agi reduz)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'GRANADA_PEM_SUP',
    nome: 'Granada de PEM',
    descricao:
      PREFIXO +
      'Pulso eletromagnetico que desativa equipamentos eletronicos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FUMACA,
    efeito: 'Raio 18m: desativa equipamentos ate o fim da cena; maldicoes sofrem 6d6 impacto e paralisia 1 rodada',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
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
    efeito: 'Detecta movimento em cone de 30m; pode sinalizar alerta discreto ou sonoro',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ALIMENTO_ENERGETICO_SUP',
    nome: 'Alimento Energetico',
    descricao:
      PREFIXO +
      'Suplemento de alta energia para recuperar esforco mental.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    efeito: 'Consumir com acao padrao: recupera 1d4 PE',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'APLICADOR_MEDICAMENTOS_SUP',
    nome: 'Aplicador de Medicamentos',
    descricao:
      PREFIXO +
      'Adaptacao portatil para aplicar substancias rapidamente.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: 'Permite aplicar substancias com acao de movimento (ate 3 doses)',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'BRACADEIRA_REFORCADA_SUP',
    nome: 'Bracadeira Reforcada',
    descricao:
      PREFIXO +
      'Protecao para antebracos que ajuda a bloquear golpes.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: '+2 na RD recebida por usar bloqueio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CAO_ADESTRADO_SUP',
    nome: 'Cao Adestrado',
    descricao:
      PREFIXO +
      'Cao treinado para ajudar em investigacao e combate.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    efeito: 'Aliado: +2 em Investigacao e Percepcao; pode gastar 1 PE para +2 Defesa por 1 rodada',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'COLDRE_SAQUE_RAPIDO_SUP',
    nome: 'Coldre Saque Rapido',
    descricao:
      PREFIXO +
      'Coldre que permite sacar arma de fogo leve rapidamente.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: '1x por rodada pode sacar/guardar arma de fogo leve como acao livre',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'EQUIPAMENTO_ESCUTA_SUP',
    nome: 'Equipamento de Escuta',
    descricao:
      PREFIXO +
      'Receptor e transmissores para captar conversas a distancia.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: 'Receptor alcance 90m e transmissores raio 9m; requer testes para instalar',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ESTREPES_SUP',
    nome: 'Estrepes',
    descricao:
      PREFIXO +
      'Saco de estrepes para dificultar movimentacao.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Area 1,5m: 1d4 perfurante e lento (Reflexos evita); em perseguicao reduz testes',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'FAIXA_PREGOS_SUP',
    nome: 'Faixa de Pregos',
    descricao:
      PREFIXO +
      'Trilha de pregos usada para parar veiculos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    efeito: 'Funciona como estrepes em linha de 9m; pneus perfurados reduzem deslocamento',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ISQUEIRO_SUP',
    nome: 'Isqueiro',
    descricao:
      PREFIXO +
      'Produz pequena chama para acender objetos e iluminar.',
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 0.5,
    efeito: 'Acao de movimento: chama e luz em raio 3m',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
];

const medicamentosSuplemento: EquipamentoOperacionalSeed[] = [
  {
    codigo: 'ANTIBIOTICO_SUP',
    nome: 'Antibiotico',
    descricao: PREFIXO + 'Medicamento para combater infeccoes.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 no proximo teste de Fortitude contra doenca ate o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'ANTIDOTO_SUP',
    nome: 'Antidoto',
    descricao: PREFIXO + 'Medicamento para neutralizar venenos.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 no proximo teste de Fortitude contra veneno ate o fim do dia; pode remover veneno especifico',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'ANTIEMETICO_SUP',
    nome: 'Antiemetico',
    descricao: PREFIXO + 'Reduz nauseas e efeitos similares.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: 'Remove condicao enjoado e concede +5 contra nauseas ate o fim da cena',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'ANTIHISTAMINICO_SUP',
    nome: 'Antihistaminico',
    descricao: PREFIXO + 'Reduz reacoes alergicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 no proximo teste contra alergia ate o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'ANTI_INFLAMATORIO_SUP',
    nome: 'Anti-inflamatorio',
    descricao: PREFIXO + 'Reduz dores e inflamacoes.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: 'Concede 1d8+2 PV temporarios',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'ANTITERMICO_SUP',
    nome: 'Antitermico',
    descricao: PREFIXO + 'Reduz febre e dores de cabeca.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: 'Permite novo teste contra condicao mental (1x por cena)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'BRONCODILATADOR_SUP',
    nome: 'Broncodilatador',
    descricao: PREFIXO + 'Auxilia na respiracao.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 em testes contra asfixiado ou fatigado ate o fim do dia',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'COAGULANTE_SUP',
    nome: 'Coagulante',
    descricao: PREFIXO + 'Ajuda a estancar sangramento.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    efeito: '+5 em testes para estabilizar sangrando e +5 em Medicina para remover morrendo',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
];

const itensAmaldicoadosSuplemento: EquipamentoAmaldicoadoSeed[] = [
  {
    codigo: 'CATALISADOR_AMPLIADOR_SUP',
    nome: 'Catalisador Ampliador',
    descricao:
      PREFIXO +
      'Catalisador amaldicoado consumivel para tecnicas. Aumenta alcance ou dobra area.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta alcance em 1 passo ou dobra area de efeito da tecnica',
  },
  {
    codigo: 'CATALISADOR_PERTURBADOR_SUP',
    nome: 'Catalisador Perturbador',
    descricao:
      PREFIXO +
      'Catalisador consumivel que aumenta a DT para resistir a tecnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta a DT da tecnica em +2',
  },
  {
    codigo: 'CATALISADOR_POTENCIALIZADOR_SUP',
    nome: 'Catalisador Potencializador',
    descricao:
      PREFIXO +
      'Catalisador consumivel que aumenta o dano de tecnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aumenta o dano da tecnica em +1 dado do mesmo tipo',
  },
  {
    codigo: 'CATALISADOR_PROLONGADOR_SUP',
    nome: 'Catalisador Prolongador',
    descricao:
      PREFIXO +
      'Catalisador consumivel que prolonga efeitos de tecnicas.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Dobra duracao de tecnicas nao instantaneas e nao sustentadas',
  },
  {
    codigo: 'PE_DE_MORTO_SUP',
    nome: 'Pe de Morto',
    descricao:
      PREFIXO +
      'Botas amaldicoadas que silenciam passos.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    efeito: '+5 em Furtividade; acoes de movimento chamativas aumentam visibilidade apenas +1',
  },
  {
    codigo: 'PENDRIVE_SELADO_SUP',
    nome: 'Pendrive Selado',
    descricao:
      PREFIXO +
      'Dispositivo protegido contra tecnicas amaldicoadas e efeitos eletricos.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 0.5,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Nao pode ser afetado por tecnicas; permite invadir sistemas sem contaminacao',
  },
  {
    codigo: 'VALETE_SALVACAO_SUP',
    nome: 'Valete da Salvacao',
    descricao:
      PREFIXO +
      'Carta amaldicoada que indica a melhor rota de fuga.',
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0.5,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Aponta rota de fuga em alcance medio; em perseguicao, garante sucesso em cortar caminho',
  },
];

const artefatosAmaldicoadosSuplemento: EquipamentoArtefatoAmaldicoadoSeed[] = [
  {
    codigo: 'LIGACAO_DIRETA_INFERNAL_SUP',
    nome: 'Ligacao Direta Infernal',
    descricao:
      PREFIXO +
      'Fios amaldicoados que animam veiculos e fortalecem sua resistencia.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Veiculo recebe RD 20 e +5 em Pilotagem, mas falhas sao amplificadas',
    artefato: {
      tipoBase: 'ARTEFATO_GERAL',
      proficienciaRequerida: false,
      efeito:
        'Veiculo recebe RD 20 e +5 em Pilotagem, mas falhas sao amplificadas',
    },
  },
  {
    codigo: 'MEDIDOR_CONDICAO_VERTEBRAL_SUP',
    nome: 'Medidor de Condicao Vertebral',
    descricao:
      PREFIXO +
      'Dispositivo grotesco que monitora a saude e efeitos amaldicoados.',
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    efeito: '+2 em Fortitude; +5 em Medicina para auxiliar o usuario',
    artefato: {
      tipoBase: 'ARTEFATO_GERAL',
      proficienciaRequerida: false,
      efeito: '+2 em Fortitude; +5 em Medicina para auxiliar o usuario',
    },
  },
];

type ModificacaoSuplemento = {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoModificacao;
  incrementoEspacos: number;
  restricoes?: Prisma.InputJsonValue | null;
  efeitosMecanicos?: Prisma.InputJsonValue | null;
};

const modificacoesSuplemento: ModificacaoSuplemento[] = [
  {
    codigo: 'MOD_BATERIA_POTENTE_SUP',
    nome: 'Bateria Potente',
    descricao:
      PREFIXO +
      'Modificacao para objetos eletricos. Dobra duracao da bateria e alcance da luz. Em tasers, dobra usos, aumenta dano para 1d8 e DT em +5.',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: 0,
    restricoes: { tiposEquipamento: [TipoEquipamento.ACESSORIO] },
    efeitosMecanicos: {
      descricao:
        'Dobra duracao da bateria e alcance de luz. Em tasers: dobra usos, dano 1d8 e DT +5.',
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
        mecanicasEspeciais: jsonOrNull(origem.habilidade.mecanicasEspeciais ?? null),
        fonte: TipoFonte.SUPLEMENTO,
        suplementoId,
      },
      create: {
        nome: origem.habilidade.nome,
        tipo: 'ORIGEM',
        descricao: origem.habilidade.descricao,
        hereditaria: false,
        mecanicasEspeciais: jsonOrNull(origem.habilidade.mecanicasEspeciais ?? null),
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

    await prisma.origemPericia.deleteMany({ where: { origemId: origemRow.id } });
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

  console.log(`OK: ${origensSuplemento.length} origens do suplemento cadastradas.`);
}

async function seedPoderes(prisma: PrismaClient, suplementoId: number) {
  console.log('Cadastrando poderes genericos do suplemento...');

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

  console.log(`OK: ${poderesSuplemento.length} poderes genericos cadastrados.`);
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

    for (const habilidade of trilha.habilidades) {
      const habilidadeRow = await prisma.habilidade.upsert({
        where: { nome: habilidade.nome },
        update: {
          tipo: 'TRILHA',
          descricao: habilidade.descricao,
          hereditaria: false,
          fonte: TipoFonte.SUPLEMENTO,
          suplementoId,
        },
        create: {
          nome: habilidade.nome,
          tipo: 'TRILHA',
          descricao: habilidade.descricao,
          hereditaria: false,
          fonte: TipoFonte.SUPLEMENTO,
          suplementoId,
        },
      });

      await prisma.habilidadeTrilha.upsert({
        where: {
          trilhaId_habilidadeId_nivelConcedido: {
            trilhaId: trilhaRow.id,
            habilidadeId: habilidadeRow.id,
            nivelConcedido: habilidade.nivel,
          },
        },
        update: { caminhoId: null },
        create: {
          trilhaId: trilhaRow.id,
          habilidadeId: habilidadeRow.id,
          nivelConcedido: habilidade.nivel,
          caminhoId: null,
        },
      });
    }
  }

  console.log(`OK: ${trilhasSuplemento.length} trilhas do suplemento cadastradas.`);
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

    await prisma.equipamentoDano.deleteMany({ where: { equipamentoId: equipamento.id } });

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

  for (const item of [...itensOperacionaisSuplemento, ...medicamentosSuplemento]) {
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
  console.log('Cadastrando modificacoes do suplemento...');

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

  console.log(`OK: ${modificacoesSuplemento.length} modificacoes do suplemento cadastradas.`);
}

export async function seedSobrevivendoAoJujutsu(prisma: PrismaClient) {
  console.log('Seed do suplemento Sobrevivendo ao Jujutsu...');

  const suplemento = await upsertSuplemento(prisma);

  await seedOrigens(prisma, suplemento.id);
  await seedPoderes(prisma, suplemento.id);
  await seedTrilhas(prisma, suplemento.id);
  await seedEquipamentos(prisma, suplemento.id);
  await seedModificacoes(prisma, suplemento.id);

  console.log('OK: seed do suplemento concluido.');
}



