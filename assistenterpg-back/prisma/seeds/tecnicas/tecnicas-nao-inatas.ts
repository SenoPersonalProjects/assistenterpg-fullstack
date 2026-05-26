import type { PrismaClient } from '@prisma/client';
import {
  AreaEfeito,
  Prisma,
  TipoEscalonamentoHabilidade,
  TipoExecucao,
  TipoFonte,
  TipoTecnicaAmaldicoada,
} from '@prisma/client';
import { jsonOrNull } from '../_helpers';

function duracaoEhSustentada(duracao?: string | null): boolean {
  if (!duracao) return false;
  const normalizado = duracao.toUpperCase();
  return (
    normalizado.includes('SUSTENTAD') ||
    normalizado.includes('SUSTENTAC') ||
    normalizado.includes('SUSTAIN') ||
    normalizado.includes('CONCENTRACAO')
  );
}

function resolverCustoSustentacaoPadrao(
  duracao: string | null | undefined,
  custoSustentacaoEA?: number | null,
  custoSustentacaoPE?: number | null,
): { custoSustentacaoEA: number | null; custoSustentacaoPE: number | null } {
  if (!duracaoEhSustentada(duracao)) {
    return {
      custoSustentacaoEA: custoSustentacaoEA ?? null,
      custoSustentacaoPE: custoSustentacaoPE ?? null,
    };
  }
  const temCustoDefinido =
    typeof custoSustentacaoEA === 'number' ||
    typeof custoSustentacaoPE === 'number';
  if (!temCustoDefinido) {
    return { custoSustentacaoEA: 1, custoSustentacaoPE: null };
  }
  return {
    custoSustentacaoEA: custoSustentacaoEA ?? null,
    custoSustentacaoPE: custoSustentacaoPE ?? null,
  };
}

type SeedVariacaoTecnica = {
  nome: string;
  descricao: string;
  substituiCustos?: boolean;
  custoPE?: number | null;
  custoEA?: number | null;
  custoSustentacaoEA?: number | null;
  custoSustentacaoPE?: number | null;
  execucao?: TipoExecucao | null;
  area?: AreaEfeito | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
  resistencia?: string | null;
  dtResistencia?: string | null;
  efeitoAdicional?: string | null;
  requisitos?: Prisma.InputJsonValue | null;
  ordem: number;
  escalonaPorGrau?: boolean | null;
  escalonamentoCustoEA?: number | null;
  escalonamentoCustoPE?: number | null;
  escalonamentoTipo?: TipoEscalonamentoHabilidade | null;
  escalonamentoEfeito?: Prisma.InputJsonValue | null;
  escalonamentoDano?: Prisma.InputJsonValue | null;
};

type SeedHabilidadeTecnica = {
  codigo: string;
  nome: string;
  descricao: string;
  execucao: TipoExecucao;
  area?: AreaEfeito | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
  custoPE?: number;
  custoEA?: number;
  custoSustentacaoEA?: number | null;
  custoSustentacaoPE?: number | null;
  efeito: string;
  requisitos?: Prisma.InputJsonValue | null;
  escalonaPorGrau?: boolean;
  grauTipoGrauCodigo?: string | null;
  escalonamentoCustoEA?: number;
  escalonamentoCustoPE?: number;
  escalonamentoTipo?: TipoEscalonamentoHabilidade;
  escalonamentoEfeito?: Prisma.InputJsonValue | null;
  escalonamentoDano?: Prisma.InputJsonValue | null;
  variacoes?: SeedVariacaoTecnica[];
  ordem: number;
};

type SeedTecnicaNaoInata = {
  codigo: string;
  nome: string;
  descricao: string;
  requisitos?: Prisma.InputJsonValue | null;
  habilidades: SeedHabilidadeTecnica[];
};

const tecnicasNaoInatasSeed: SeedTecnicaNaoInata[] = [
  {
    codigo: 'NAOINATA_TECNICA_AMALDICOADA',
    nome: 'Técnica Amaldiçoada',
    descricao:
      'Aplicacoes básicas de energia amaldiçoada usadas por feiticeiros jujutsu.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_REVESTIMENTO_OFENSIVO',
        nome: 'Revestimento Ofensivo',
        descricao:
          'Reveste corpo ou arma com energia amaldiçoada para ampliar dano e permitir ferir maldições.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você ou sua arma',
        duracao: 'Sustentado',
        custoEA: 2,
        efeito:
          'Concede 1d6 de dano adicional OU +3 no teste de ataque. Acumulável até +4 acúmulos conforme grau de aprimoramento, com +1 EA por acúmulo. Sustentação de revestimentos custa 1 EA/turno por revestimento ativo.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Revestimento Momentaneo',
            descricao:
              'Aplica o revestimento em um unico ataque, escolhendo dano ou teste.',
            substituiCustos: true,
            custoEA: 1,
            execucao: TipoExecucao.AO_ATACAR,
            duracao: 'Instantanea',
            efeitoAdicional:
              'O efeito escolhido e aplicado somente no ataque que ativou a variação.',
            ordem: 10,
          },
          {
            nome: 'Revestimento em Munição',
            descricao:
              'Reveste municao de arma de fogo/disparo para permitir ferir maldicoes.',
            substituiCustos: true,
            custoEA: 2,
            efeitoAdicional:
              'Custo dobrado (2 EA por acúmulo). Mantem a escolha entre dano ou teste.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_DEFENSIVO',
        nome: 'Revestimento Defensivo',
        descricao:
          'Reveste o próprio corpo com energia amaldiçoada para reforco defensivo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 2,
        efeito:
          'Concede +2 de Defesa ou RD. Acumulavel até +4 acúmulos conforme grau de aprimoramento, com +1 EA por acúmulo.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
        escalonamentoEfeito: {
          label: 'Defesa ou RD',
          incremento: 2,
          unidade: 'pontos',
        },
        ordem: 20,
        variacoes: [
          {
            nome: 'Revestimento Momentaneo',
            descricao: 'Ativa o revestimento defensivo como resposta imediata.',
            substituiCustos: true,
            custoEA: 1,
            execucao: TipoExecucao.REACAO,
            duracao: 'Instantanea',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_VELOCIDADE_AMALDICOADA',
        nome: 'Velocidade Amaldiçoada',
        descricao:
          'Canaliza energia amaldiçoada para acelerar movimento e reacao do corpo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentada',
        custoEA: 1,
        custoPE: 1,
        efeito:
          'Concede +3m de deslocamento por rodada e +1 reacao especial. Cada acúmulo adicional concede +3m de deslocamento e +1 reacao especial. Acumulavel até 5 vezes conforme grau de aprimoramento.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo: '+3m deslocamento e +1 reacao especial',
        },
        ordem: 30,
      },
      {
        codigo: 'NAOINATA_FULGOR_NEGRO',
        nome: 'Fulgor Negro (Kokusen)',
        descricao:
          'Fenômeno raro em que energia amaldiçoada sincroniza com golpe físico em um instante quase impossível.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo-a-corpo',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        custoEA: 1,
        custoPE: 2,
        efeito:
          'Você precisa usar a habilidade e gastar os pontos antes de saber se o ataque vai gerar crítico natural. Se acertar um crítico natural no ataque corpo a corpo, ativa o Fulgor Negro: adiciona +2 dados de dano que não entram no crítico, aumenta o multiplicador de crítico em +1 passo e recebe Produção Acelerada 1 até o fim da cena. Cada Kokusen adicional aumenta essa Produção Acelerada em +1, até o limite 5 pela fonte Kokusen.',
        ordem: 40,
      },
      {
        codigo: 'NAOINATA_VOTO_VINCULATIVO',
        nome: 'Voto Vinculativo',
        descricao:
          'Contrato com energia amaldiçoada que cria obrigações, trocas e consequências entre as partes.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alcance: 'Variavel',
        alvo: 'Seres',
        duracao: 'Até conclusão ou rescisão do voto',
        custoEA: 0,
        custoPE: 0,
        efeito:
          'Técnica flexivel e negociada com o mestre. O custo pode incluir SAN e EA conforme complexidade. Violacoes causam dano direto ou consequências narrativas.',
        ordem: 50,
        variacoes: [
          {
            nome: 'Voto Simples',
            descricao:
              'Exemplos: informacao por silencio, promessa de lealdade temporaria.',
            requisitos: {
              dtVontade: '10-20',
              danoSanidade: '1d3',
              custoEA: 0,
            },
            ordem: 10,
          },
          {
            nome: 'Voto Complexo',
            descricao:
              'Exemplos: troca de poder por sacrifício, restricao de habilidade, compulsao.',
            requisitos: {
              dtVontade: '20-30',
              danoSanidade: '2d4',
              custoEA: 5,
            },
            ordem: 20,
          },
          {
            nome: 'Voto Extremo',
            descricao:
              'Exemplos: sacrifício de parte do corpo, imortalidade condicional, sobrevivencia extrema.',
            requisitos: {
              dtVontade: '30+',
              danoSanidade: '4d8',
              custoEA: 20,
            },
            ordem: 30,
          },
          {
            nome: 'Violacao de Voto',
            descricao:
              'Quebrar voto aplica dano direto conforme tipo e pode gerar consequencia inesperada.',
            requisitos: {
              danoSimples: '1d6',
              danoComplexo: '2d10',
              danoExtremo: '4d12 + consequencia do mestre',
            },
            ordem: 40,
          },
        ],
      },
      {
        codigo: 'NAOINATA_DISPARAR_EA',
        nome: 'Disparar Energia Amaldiçoada',
        descricao:
          'Dispara energia amaldiçoada em projéteis, lasers ou ondas destrutivas.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto (9m)',
        alvo: '1 ser ou objeto',
        duracao: 'Instantaneo',
        custoEA: 1,
        efeito:
          'Causa 1d3 de dano de energia amaldiçoada por acúmulo (até 5 acúmulos conforme grau). Usa teste de ataque com Jujutsu contra Defesa.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          quantidade: 1,
          dado: 'd3',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        ordem: 60,
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_BARREIRA',
    nome: 'Técnica de Barreira',
    descricao:
      'Construção de barreiras para ocultar, conter, impor regras e manipular área.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_BARREIRA_SIMPLES',
        nome: 'Barreira Simples',
        descricao:
          'Ergue barreira com regras simples para ocultar, conter ou restringir entrada.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alcance: 'Area adjacente (variavel)',
        alvo: 'Todos no alcance',
        duracao: 'Sustentado (requer concentração)',
        custoEA: 2,
        efeito:
          'Define de 0 a 5 regras simples simultâneas conforme grau de aprimoramento (ex.: bloquear entrada, ocultar para não-feiticeiros, revelar maldições).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_BARREIRA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.REGRAS,
        escalonamentoEfeito: {
          incrementoRegras: 1,
          label: 'Regras simultâneas da barreira',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Cortina',
            descricao:
              'Barreira vasta em forma de casca esférica que oculta atividades internas para não-feiticeiros.',
            substituiCustos: true,
            custoEA: 2,
            duracao: 'Sustentada sem concentração',
            efeitoAdicional:
              'Muda o céu interno para noite e induz espíritos amaldiçoados a se revelarem.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_EXPANSAO_DOMINIO',
        nome: 'Expansao de Domínio',
        descricao:
          'Manifesta domínio inato dentro de barreira imbuida com técnica inata.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.ESFERA,
        alcance: 'Raio curto (9m)',
        alvo: 'Todos no alcance',
        duracao: 'Sustentado',
        custoEA: 6,
        custoPE: 2,
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 }],
          exigeTecnicaInata: true,
          exigeDominioInato: true,
          exigeMudra: true,
        },
        efeito:
          'Acerto garantido para técnicas selecionadas dentro do domínio. Tipos comuns: letal, aperfeicoado e restritivo. Custos e refinamento variam até 20 EA.',
        ordem: 20,
      },
      {
        codigo: 'NAOINATA_EXPANSAO_DOMINIO_ABERTA',
        nome: 'Expansao de Domínio Aberta',
        descricao:
          'Domínio sem fechamento completo de barreira, com ponto focal para acerto garantido.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.OUTROS,
        alcance: 'Area ampliada a partir do totem',
        alvo: 'Todos na área',
        duracao: 'Sustentado',
        custoEA: 12,
        custoPE: 4,
        requisitos: {
          graus: [
            { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 3 },
            { tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 },
            { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 },
          ],
        },
        efeito:
          'Permite rota de fuga, mas amplia alcance e poder com acerto garantido se expandindo do centro até a borda por turnos.',
        ordem: 30,
      },
      {
        codigo: 'NAOINATA_BARREIRA_VAZIA',
        nome: 'Barreira Vazia',
        descricao:
          'Zonas delimitadas por estruturas flexiveis para criar caminhos e obstaculos.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.OUTROS,
        alcance: 'Area configuravel',
        alvo: 'Area',
        duracao: 'Sustentado',
        custoEA: 4,
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 3 }],
        },
        efeito:
          'Sem técnica inata imbuída. Permite alterar forma/tamanho em tempo real e aplicar modificadores de -2/+2 dados em perícias.',
        ordem: 40,
      },
      {
        codigo: 'NAOINATA_BARREIRA_PURA',
        nome: 'Barreira Pura',
        descricao:
          'Versão superior de barreira usada como estrutura permanente por especialistas.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.OUTROS,
        alcance: 'Area configuravel',
        alvo: 'Area',
        duracao: 'Permanente',
        custoEA: 8,
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 5 }],
        },
        efeito:
          'Barreira permanente sem técnica inata imbuida, usada como fundação para estruturas maiores.',
        ordem: 50,
      },
      {
        codigo: 'NAOINATA_BARREIRA_BON',
        nome: 'Barreira Bon',
        descricao:
          'Barreira superior, erguida sobre barreiras puras como alicerce.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.OUTROS,
        alcance: 'Area massiva',
        alvo: 'Area',
        duracao: 'Sustentado',
        custoEA: 8,
        custoPE: 3,
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 4 }],
          exigeBarreiraPuraNoLocal: true,
        },
        efeito:
          'Comporta grande volume de regras simultâneas, com alta complexidade.',
        ordem: 60,
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_ANTI_BARREIRA',
    nome: 'Técnica Anti-Barreira',
    descricao:
      'Técnicas para neutralizar acerto garantido de domínios e efeitos automaticos.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_ANTI_BARREIRA', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_CESTA_OCA',
        nome: 'Cesta Oca',
        descricao:
          'Barreira esférica defensiva que anula acerto garantido de domínios.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 1,
        efeito:
          'Neutraliza acerto garantido de domínios imbuido com técnica amaldiçoada. Exige duas mãos livres e pode ser quebrada por ataques diretos de energia amaldiçoada.',
        ordem: 10,
      },
      {
        codigo: 'NAOINATA_DOMINIO_SIMPLES',
        nome: 'Domínio Simples',
        descricao:
          'Pequeno domínio defensivo ao redor do usuário, focado em sobrevivencia.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Até curto',
        alvo: 'Zona pessoal',
        duracao: 'Sustentado',
        custoEA: 2,
        requisitos: {
          narrativo: 'Requer ensino de alguém que possua Domínio Simples.',
        },
        efeito:
          'Concede +5 Defesa contra ataques externos e anula acerto garantido de domínios enquanto sustentado.',
        ordem: 20,
        variacoes: [
          {
            nome: 'Foco Ofensivo',
            descricao:
              'Converte o domínio simples para postura agressiva controlada.',
            efeitoAdicional:
              'Todos os seus ataques no Domínio Simples recebem +5.',
            ordem: 10,
          },
          {
            nome: 'Foco Defensivo',
            descricao:
              'Prioriza mitigacao de técnicas amaldiçoadas contra o usuário.',
            efeitoAdicional:
              'Concede RD 5 contra dano Jujutsu enquanto estiver dentro do Domínio Simples.',
            ordem: 20,
          },
          {
            nome: 'Flexibilidade',
            descricao:
              'Permite incluir regras reduzidas e imbuição limitada de técnica amaldiçoada.',
            efeitoAdicional:
              'Funciona como versao reduzida de Expansao de Domínio.',
            ordem: 30,
          },
        ],
      },
      {
        codigo: 'NAOINATA_AMPLIFICACAO_DOMINIO',
        nome: 'Amplificacao de Domínio',
        descricao:
          'Reveste corpo com veu vazio de domínio para enfraquecer técnicas ao contato.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 1,
        requisitos: {
          graus: [
            { tipoGrauCodigo: 'TECNICA_ANTI_BARREIRA', valorMinimo: 2 },
            { tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 },
          ],
        },
        efeito:
          'Anula ou enfraquece técnicas amaldiçoadas em contato. Enquanto ativa, usuário não pode usar própria técnica inata. Contra dano recebido, concede RD 6 base.',
        ordem: 30,
        variacoes: [
          {
            nome: 'Contencao de Danos',
            descricao:
              'Concentra a amplificacao para ampliar resistencia no impacto.',
            substituiCustos: false,
            custoEA: 2,
            execucao: TipoExecucao.REACAO,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
            escalonamentoEfeito: {
              label: 'RD adicional',
              incremento: 6,
              unidade: 'pontos',
            },
            requisitos: {
              exigeAmplificacaoAtiva: true,
            },
            efeitoAdicional:
              'Acumula +6 RD adicional por acúmulo durante a reacao.',
            ordem: 10,
          },
        ],
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_REVERSA',
    nome: 'Técnica Amaldiçoada Reversa',
    descricao:
      'Processa energia amaldiçoada negativa em energia positiva para cura e reversao.',
    requisitos: {
      graus: [
        { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 },
        { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 },
      ],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_RCT_CURA_RAPIDA',
        nome: 'Energia Amaldiçoada Reversa (Cura Rápida)',
        descricao:
          'Canaliza energia reversa para curar o próprio corpo com ativação imediata.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Instantanea',
        custoEA: 2,
        efeito:
          'Cura 3 + 1d6 PV. Cada +2 EA adiciona +1d6, até 5d6, conforme grau em Técnica Reversa.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_REVERSA',
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.CURA,
        escalonamentoEfeito: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'PV',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Cura Sustentada',
            descricao:
              'Mantem fluxo de energia reversa para cura recorrente.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_PADRAO,
            duracao: 'Sustentada (por rodada)',
            custoEA: 2,
            custoSustentacaoEA: 2,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.CURA,
            escalonamentoEfeito: {
              quantidade: 1,
              dado: 'd8',
              tipo: 'PV',
            },
            efeitoAdicional:
        'Cura 5 + 1d8 PV por rodada enquanto mantiver concentração. Acumulável até o limite do grau; cada acúmulo adicional custa +2 EA e adiciona +1d8 de cura.',
            ordem: 10,
          },
          {
            nome: 'Empatia - Cura Rápida',
            descricao: 'Aplica a cura rápida em outro alvo por toque.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Toque',
            alvo: '1 ser',
            duracao: 'Instantanea',
            custoEA: 2,
            requisitos: {
              graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 }],
            },
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.CURA,
            escalonamentoEfeito: {
              quantidade: 1,
              dado: 'd6',
              tipo: 'PV',
            },
            efeitoAdicional:
              'Cura 3 + 1d6 no alvo; cada +2 EA adicionais concede +1d6 de cura, até o limite do grau.',
            ordem: 20,
          },
          {
            nome: 'Empatia - Cura Sustentada',
            descricao:
              'Mantém cura sustentada em alvo tocado ou com condição definida pelo mestre.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Toque',
            alvo: '1 ser',
            duracao: 'Sustentada (por rodada)',
            custoEA: 2,
            custoSustentacaoEA: 2,
            requisitos: {
              graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 }],
            },
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.CURA,
            escalonamentoEfeito: {
              quantidade: 1,
              dado: 'd8',
              tipo: 'PV',
            },
            efeitoAdicional:
              'Cura 5 + 1d8 PV por rodada no alvo enquanto a sustentacao for mantida. Acumulavel até o limite do grau; cada acúmulo adicional custa +2 EA e adiciona +1d8 de cura.',
            ordem: 30,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVERSAO_FEITICO',
        nome: 'Reversao de Feitico',
        descricao:
          'Inverte o efeito de uma técnica amaldiçoada para seu oposto funcional.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Igual a técnica alvo',
        alvo: 'Conforme técnica original',
        duracao: 'Instantanea',
        custoEA: 0,
        efeito:
          'Custa o dobro do EA da técnica original. Exige teste oposto de Jujutsu (Reversa): se vencer, inverte o efeito.',
        ordem: 20,
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_OFENSIVO_POSITIVO',
        nome: 'Revestimento Ofensivo Positivo',
        descricao:
          'Reveste corpo/arma com energia positiva para dano elevado contra maldicoes.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você ou sua arma',
        duracao: 'Sustentado',
        custoEA: 3,
        custoPE: 1,
        efeito:
        'Concede +2d8 de dano contra maldições. Acumulável até limite de grau (conforme mesa). Sustentação segue regra de revestimentos.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_REVERSA',
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          quantidade: 2,
          dado: 'd8',
          tipo: 'ENERGIA_POSITIVA',
        },
        ordem: 30,
        variacoes: [
          {
            nome: 'Revestimento Ofensivo Positivo Momentaneo',
            descricao:
              'Aplica revestimento positivo em um unico ataque.',
            substituiCustos: true,
            execucao: TipoExecucao.AO_ATACAR,
            duracao: 'Instantanea',
            custoEA: 3,
            custoPE: 1,
            efeitoAdicional:
              'Concede +2d8 de dano de energia positiva no ataque disparador. Acumulavel até o limite do grau; cada acúmulo adicional custa +2 EA.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_DEFENSIVO_POSITIVO',
        nome: 'Revestimento Defensivo Positivo',
        descricao:
          'Camada de energia positiva que protege e punem maldições que atacam o usuário.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Concede +2 Defesa ou RD contra maldições (acumulavel por grau). Espiritos que atacarem o usuário sofrem 1d8 de energia positiva por acúmulo.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_REVERSA',
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo:
            '+2 Defesa/RD contra maldicoes e +1d8 de retaliacao para espiritos que atacarem',
        },
        ordem: 40,
        variacoes: [
          {
            nome: 'Revestimento Defensivo Positivo Momentaneo',
            descricao:
              'Ativa o efeito defensivo positivo apenas para o ataque que disparou a reacao.',
            substituiCustos: true,
            execucao: TipoExecucao.REACAO,
            duracao: 'Instantanea',
            custoEA: 3,
            custoPE: 1,
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_DISPARAR_EA_POSITIVA',
        nome: 'Disparar Energia Positiva',
        descricao:
          'Projeta energia positiva para desestabilizar e exorcizar maldições.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto (9m)',
        alvo: '1 ser',
        duracao: 'Instantanea',
        custoEA: 5,
        custoPE: 1,
        efeito:
          'Causa 10 + 2d8 de dano base. Cada +2 EA adicionais adiciona +2d8 de dano, até o limite do grau. Requer teste de Pontaria com Jujutsu contra Defesa do alvo.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_REVERSA',
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          quantidade: 2,
          dado: 'd8',
          tipo: 'ENERGIA_POSITIVA',
        },
        ordem: 50,
        variacoes: [
          {
            nome: 'Disparo Concentrado',
            descricao:
              'Dispara energia positiva em um feixe concentrado constante.',
            substituiCustos: true,
            execucao: TipoExecucao.AO_ATACAR,
            area: AreaEfeito.LINHA,
            alcance: 'Curto (9m)',
            alvo: '1 ser',
            duracao: 'Sustentado',
            custoEA: 5,
            custoPE: 1,
            custoSustentacaoEA: 0,
            custoSustentacaoPE: 2,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              quantidade: 2,
              dado: 'd8',
              tipo: 'ENERGIA_POSITIVA',
            },
            efeitoAdicional:
              'Mantem a formula de dano 10 + 2d8 por acúmulo. Exige uma mao livre para manter o feixe e consome 2 PE por turno sustentado.',
            ordem: 10,
          },
        ],
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_SHIKIGAMI',
    nome: 'Técnica de Shikigami',
    descricao:
      'Invocacao e controle de shikigamis com apoio de talismas, ritos ou ferramentas.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_SHIKIGAMI', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_INVOCAR_SHIKIGAMI',
        nome: 'Invocar Shikigami',
        descricao:
          'Manifesta um shikigami em espaço adjacente usando talismã associado.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alcance: '1,5m (adjacente)',
        alvo: 'Você',
        duracao: 'Cena',
        custoEA: 1,
        efeito:
          'Custo base 1 EA, +1 EA por habilidade do shikigami e +1 EA a cada 2 níveis do personagem (arredonda para baixo).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_SHIKIGAMI',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo:
            '+1 EA por habilidade do shikigami e +1 EA a cada 2 níveis do personagem',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Liberar Shikigami',
            descricao:
              'Finaliza a invocacao ativa, removendo um ou mais shikigamis.',
            substituiCustos: true,
            custoEA: 0,
            execucao: TipoExecucao.ACAO_LIVRE,
            alcance: 'Ilimitado',
            alvo: '1 ou mais shikigamis',
            efeitoAdicional:
              'Pode ocorrer forcadamente se o usuário ficar inconsciente ou perder controle de energia.',
            ordem: 10,
          },
          {
            nome: 'Invocar Sem Talisma e/ou Ritual',
            descricao:
              'Permite invocacao direta sem suporte externo de talismas ou ritos.',
            substituiCustos: false,
            execucao: TipoExecucao.ACAO_PADRAO,
            requisitos: {
              graus: [{ tipoGrauCodigo: 'TECNICA_SHIKIGAMI', valorMinimo: 3 }],
            },
            efeitoAdicional:
              'Mantem a mesma regra de custo de Invocar Shikigami.',
            ordem: 20,
          },
        ],
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_CORPOS_AMALDICOADOS',
    nome: 'Técnica de Corpos Amaldiçoados',
    descricao:
      'Animacao de objetos inanimados por núcleo amaldiçoado para gerar autocontrole.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_CADAVERES', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_CRIAR_CORPO_AMALDICOADO',
        nome: 'Criar Corpo Amaldiçoado',
        descricao:
          'Ritual de etapas que implanta núcleo amaldiçoado em objeto inanimado.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        alcance: '1,5m (adjacente)',
        alvo: 'Objeto inanimado',
        duracao: 'Instantanea',
        custoEA: 1,
        efeito:
          'O corpo amaldiçoado adquire consciência funcional para seguir diretrizes do criador. Custo escala por habilidades e nível (1 EA por habilidade + 1 EA a cada 2 níveis).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_CADAVERES',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo:
            '+1 EA por habilidade do corpo amaldiçoado e +1 EA a cada 2 níveis do personagem',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Descarregar Corpo Amaldiçoado',
            descricao:
              'Desliga corpos amaldiçoados em alcance curto, preservando memória no núcleo.',
            substituiCustos: true,
            custoEA: 0,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Curto (9m)',
            alvo: 'Quantidade igual ao Intelecto',
            ordem: 10,
          },
        ],
      },
    ],
  },
];

function mapHabilidadeData(
  tecnicaId: number,
  habilidade: SeedHabilidadeTecnica,
)
{
  const custosSustentacao = resolverCustoSustentacaoPadrao(
    habilidade.duracao ?? null,
    habilidade.custoSustentacaoEA,
    habilidade.custoSustentacaoPE,
  );
  return {
    tecnicaId,
    codigo: habilidade.codigo,
    nome: habilidade.nome,
    descricao: habilidade.descricao,
    requisitos: jsonOrNull(habilidade.requisitos ?? null),
    execucao: habilidade.execucao,
    area: habilidade.area ?? null,
    alcance: habilidade.alcance ?? null,
    alvo: habilidade.alvo ?? null,
    duracao: habilidade.duracao ?? null,
    custoPE: habilidade.custoPE ?? 0,
    custoEA: habilidade.custoEA ?? 0,
    custoSustentacaoEA: custosSustentacao.custoSustentacaoEA,
    custoSustentacaoPE: custosSustentacao.custoSustentacaoPE,
    efeito: habilidade.efeito,
    escalonaPorGrau: habilidade.escalonaPorGrau ?? false,
    grauTipoGrauCodigo: habilidade.grauTipoGrauCodigo ?? null,
    escalonamentoCustoEA: habilidade.escalonamentoCustoEA ?? 0,
    escalonamentoCustoPE: habilidade.escalonamentoCustoPE ?? 0,
    escalonamentoTipo: habilidade.escalonamentoTipo ?? 'OUTRO',
    escalonamentoEfeito: jsonOrNull(
      habilidade.escalonamentoEfeito ?? habilidade.escalonamentoDano ?? null,
    ),
    escalonamentoDano: jsonOrNull(habilidade.escalonamentoDano ?? null),
    ordem: habilidade.ordem,
  };
}

function mapVariacaoData(
  habilidadeTecnicaId: number,
  variacao: SeedVariacaoTecnica,
)
{
  const custosSustentacao = resolverCustoSustentacaoPadrao(
    variacao.duracao ?? null,
    variacao.custoSustentacaoEA,
    variacao.custoSustentacaoPE,
  );
  return {
    habilidadeTecnicaId,
    nome: variacao.nome,
    descricao: variacao.descricao,
    substituiCustos: variacao.substituiCustos ?? false,
    custoPE: variacao.custoPE ?? null,
    custoEA: variacao.custoEA ?? null,
    custoSustentacaoEA: custosSustentacao.custoSustentacaoEA,
    custoSustentacaoPE: custosSustentacao.custoSustentacaoPE,
    execucao: variacao.execucao ?? null,
    area: variacao.area ?? null,
    alcance: variacao.alcance ?? null,
    alvo: variacao.alvo ?? null,
    duracao: variacao.duracao ?? null,
    resistencia: variacao.resistencia ?? null,
    dtResistencia: variacao.dtResistencia ?? null,
    escalonaPorGrau: variacao.escalonaPorGrau ?? null,
    escalonamentoCustoEA: variacao.escalonamentoCustoEA ?? null,
    escalonamentoCustoPE: variacao.escalonamentoCustoPE ?? null,
    escalonamentoTipo: variacao.escalonamentoTipo ?? null,
    escalonamentoEfeito: jsonOrNull(variacao.escalonamentoEfeito ?? null),
    escalonamentoDano: jsonOrNull(variacao.escalonamentoDano ?? null),
    efeitoAdicional: variacao.efeitoAdicional ?? null,
    requisitos: jsonOrNull(variacao.requisitos ?? null),
    ordem: variacao.ordem,
  };
}

async function seedVariacoesDaHabilidade(
  prisma: PrismaClient,
  habilidadeId: number,
  variacoes: SeedVariacaoTecnica[],
) {
  const nomes = variacoes.map((variacao) => variacao.nome);
  if (nomes.length > 0) {
    await prisma.variacaoHabilidade.deleteMany({
      where: {
        habilidadeTecnicaId: habilidadeId,
        nome: { notIn: nomes },
      },
    });
  } else {
    await prisma.variacaoHabilidade.deleteMany({
      where: { habilidadeTecnicaId: habilidadeId },
    });
  }

  for (const variacao of variacoes) {
    const existente = await prisma.variacaoHabilidade.findFirst({
      where: {
        habilidadeTecnicaId: habilidadeId,
        nome: variacao.nome,
      },
      select: { id: true },
    });

    const data = mapVariacaoData(habilidadeId, variacao);

    if (existente) {
      await prisma.variacaoHabilidade.update({
        where: { id: existente.id },
        data,
      });
      continue;
    }

    await prisma.variacaoHabilidade.create({
      data,
    });
  }
}

async function seedHabilidadesDaTecnica(
  prisma: PrismaClient,
  tecnicaId: number,
  habilidades: SeedHabilidadeTecnica[],
) {
  const codigos = habilidades.map((habilidade) => habilidade.codigo);
  await prisma.habilidadeTecnica.deleteMany({
    where: {
      tecnicaId,
      codigo: { notIn: codigos },
    },
  });

  for (const habilidade of habilidades) {
    const data = mapHabilidadeData(tecnicaId, habilidade);

    const habilidadeDb = await prisma.habilidadeTecnica.upsert({
      where: { codigo: habilidade.codigo },
      update: data,
      create: data,
      select: { id: true },
    });

    await seedVariacoesDaHabilidade(
      prisma,
      habilidadeDb.id,
      habilidade.variacoes ?? [],
    );
  }
}

export async function seedTecnicasNaoInatas(prisma: PrismaClient) {
  console.log('Cadastrando técnicas amaldiçoadas não-inatas básicas...');

  for (const tecnicaSeed of tecnicasNaoInatasSeed) {
    const tecnica = await prisma.tecnicaAmaldicoada.upsert({
      where: { codigo: tecnicaSeed.codigo },
      update: {
        nome: tecnicaSeed.nome,
        descricao: tecnicaSeed.descricao,
        tipo: TipoTecnicaAmaldicoada.NAO_INATA,
        hereditaria: false,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
        requisitos: jsonOrNull(tecnicaSeed.requisitos ?? null),
      },
      create: {
        codigo: tecnicaSeed.codigo,
        nome: tecnicaSeed.nome,
        descricao: tecnicaSeed.descricao,
        tipo: TipoTecnicaAmaldicoada.NAO_INATA,
        hereditaria: false,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
        requisitos: jsonOrNull(tecnicaSeed.requisitos ?? null),
      },
      select: { id: true, nome: true },
    });

    await seedHabilidadesDaTecnica(prisma, tecnica.id, tecnicaSeed.habilidades);
    const totalHabilidades = tecnicaSeed.habilidades.length;
    console.log(
      `  OK ${tecnica.nome} (${totalHabilidades} ${
        totalHabilidades === 1 ? 'habilidade' : 'habilidades'
      })`,
    );
  }

  console.log(
    `OK ${tecnicasNaoInatasSeed.length} técnicas não inatas básicas cadastradas.`,
  );
}

