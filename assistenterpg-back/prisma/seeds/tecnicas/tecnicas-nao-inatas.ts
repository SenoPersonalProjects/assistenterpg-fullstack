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
    nome: 'Tecnica Amaldicoada',
    descricao:
      'Aplicacoes basicas de energia amaldicoada usadas por feiticeiros jujutsu.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_REVESTIMENTO_OFENSIVO',
        nome: 'Revestimento Ofensivo',
        descricao:
          'Reveste corpo ou arma com energia amaldicoada para ampliar dano e permitir ferir maldicoes.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce ou sua arma',
        duracao: 'Sustentado',
        custoEA: 2,
        efeito:
          'Concede 1d6 de dano adicional. Acumulavel ate +4 acumulos conforme grau de aprimoramento, com +1 EA por acumulo. Sustentacao de revestimentos custa 1 EA/turno por revestimento ativo.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 2,
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
            descricao: 'Aplica o revestimento em um unico ataque.',
            substituiCustos: true,
            custoEA: 1,
            execucao: TipoExecucao.AO_ATACAR,
            duracao: 'Instantanea',
            efeitoAdicional:
              'O efeito e aplicado somente no ataque que ativou a variacao.',
            ordem: 10,
          },
          {
            nome: 'Revestimento em Municao',
            descricao:
              'Reveste municao de arma de fogo/disparo para permitir ferir maldicoes.',
            substituiCustos: true,
            custoEA: 2,
            efeitoAdicional: 'Custo dobrado (2 EA por d6).',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_DEFENSIVO',
        nome: 'Revestimento Defensivo',
        descricao:
          'Reveste o proprio corpo com energia amaldicoada para reforco defensivo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Sustentado',
        custoEA: 2,
        efeito:
          'Concede +2 de Defesa ou RD. Acumulavel ate +4 acumulos conforme grau de aprimoramento, com +1 EA por acumulo.',
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
        nome: 'Velocidade Amaldicoada',
        descricao:
          'Canaliza energia amaldicoada para acelerar movimento e reacao do corpo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Sustentada',
        custoEA: 1,
        custoPE: 1,
        efeito:
          'Concede +3m de deslocamento por rodada e +2 em testes de ataque. Cada acumulo adicional concede +3m. Acumulavel ate 5 vezes conforme grau de aprimoramento.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
        escalonamentoEfeito: {
          label: 'Deslocamento',
          incremento: 3,
          unidade: 'm',
        },
        ordem: 30,
      },
      {
        codigo: 'NAOINATA_FULGOR_NEGRO',
        nome: 'Fulgor Negro (Kokusen)',
        descricao:
          'Fenomeno raro em que energia amaldicoada sincroniza com golpe fisico em um instante quase impossivel.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo-a-corpo',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        custoPE: 2,
        efeito:
          'Se o ataque gerar critico natural, adiciona +2 dados de dano, aumenta multiplicador de critico em +1 passo e recupera 1 EA. O custo deve ser pago antes da rolagem.',
        ordem: 40,
      },
      {
        codigo: 'NAOINATA_VOTO_VINCULATIVO',
        nome: 'Voto Vinculativo',
        descricao:
          'Contrato com energia amaldicoada que cria obrigacoes, trocas e consequencias entre as partes.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alcance: 'Variavel',
        alvo: 'Seres',
        duracao: 'Ate conclusao ou rescisao do voto',
        custoEA: 0,
        custoPE: 0,
        efeito:
          'Tecnica flexivel e negociada com o mestre. O custo pode incluir SAN e EA conforme complexidade. Violacoes causam dano direto ou consequencias narrativas.',
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
              'Exemplos: troca de poder por sacrificio, restricao de habilidade, compulsao.',
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
              'Exemplos: sacrificio de parte do corpo, imortalidade condicional, sobrevivencia extrema.',
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
        nome: 'Disparar Energia Amaldicoada',
        descricao:
          'Dispara energia amaldicoada em projeteis, lasers ou ondas destrutivas.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto (9m)',
        alvo: '1 ser ou objeto',
        duracao: 'Instantaneo',
        custoEA: 1,
        efeito:
          'Causa 1d3 de dano de energia amaldicoada por acumulo (ate 5 acumulos conforme grau). Usa teste de ataque com Jujutsu contra Defesa.',
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
    nome: 'Tecnica de Barreira',
    descricao:
      'Construcao de barreiras para ocultar, conter, impor regras e manipular area.',
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
        duracao: 'Sustentado (requer concentracao)',
        custoEA: 2,
        efeito:
          'Define de 0 a 5 regras simples simultaneas conforme grau de aprimoramento (ex.: bloquear entrada, ocultar para nao-feiticeiros, revelar maldicoes).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_BARREIRA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.REGRAS,
        escalonamentoEfeito: {
          incrementoRegras: 1,
          label: 'Regras simultaneas da barreira',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Cortina',
            descricao:
              'Barreira vasta em forma de casca esferica que oculta atividades internas para nao-feiticeiros.',
            substituiCustos: true,
            custoEA: 2,
            duracao: 'Sustentada sem concentracao',
            efeitoAdicional:
              'Muda o ceu interno para noite e induz espiritos amaldicoados a se revelarem.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_EXPANSAO_DOMINIO',
        nome: 'Expansao de Dominio',
        descricao:
          'Manifesta dominio inato dentro de barreira imbuida com tecnica inata.',
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
          'Acerto garantido para tecnicas selecionadas dentro do dominio. Tipos comuns: letal, aperfeicoado e restritivo. Custos e refinamento variam ate 20 EA.',
        ordem: 20,
      },
      {
        codigo: 'NAOINATA_EXPANSAO_DOMINIO_ABERTA',
        nome: 'Expansao de Dominio Aberta',
        descricao:
          'Dominio sem fechamento completo de barreira, com ponto focal para acerto garantido.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.OUTROS,
        alcance: 'Area ampliada a partir do totem',
        alvo: 'Todos na area',
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
          'Permite rota de fuga, mas amplia alcance e poder com acerto garantido se expandindo do centro ate a borda por turnos.',
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
          'Sem tecnica inata imbuida. Permite alterar forma/tamanho em tempo real e aplicar modificadores de -2/+2 dados em pericias.',
        ordem: 40,
      },
      {
        codigo: 'NAOINATA_BARREIRA_PURA',
        nome: 'Barreira Pura',
        descricao:
          'Versao superior de barreira usada como estrutura permanente por especialistas.',
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
          'Barreira permanente sem tecnica inata imbuida, usada como fundacao para estruturas maiores.',
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
          'Comporta grande volume de regras simultaneas, com alta complexidade.',
        ordem: 60,
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_ANTI_BARREIRA',
    nome: 'Tecnica Anti-Barreira',
    descricao:
      'Tecnicas para neutralizar acerto garantido de dominios e efeitos automaticos.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_ANTI_BARREIRA', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_CESTA_OCA',
        nome: 'Cesta Oca',
        descricao:
          'Barreira esferica defensiva que anula acerto garantido de dominios.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Sustentado',
        custoEA: 1,
        efeito:
          'Neutraliza acerto garantido de dominios imbuido com tecnica amaldicoada. Exige duas maos livres e pode ser quebrada por ataques diretos de energia amaldicoada.',
        ordem: 10,
      },
      {
        codigo: 'NAOINATA_DOMINIO_SIMPLES',
        nome: 'Dominio Simples',
        descricao:
          'Pequeno dominio defensivo ao redor do usuario, focado em sobrevivencia.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Ate curto',
        alvo: 'Zona pessoal',
        duracao: 'Sustentado',
        custoEA: 2,
        requisitos: {
          narrativo: 'Requer ensino de alguem que possua Dominio Simples.',
        },
        efeito:
          'Concede +5 Defesa contra ataques externos e anula acerto garantido de dominios enquanto sustentado.',
        ordem: 20,
        variacoes: [
          {
            nome: 'Foco Ofensivo',
            descricao:
              'Converte o dominio simples para postura agressiva controlada.',
            efeitoAdicional:
              'Todos os seus ataques no Dominio Simples recebem +5.',
            ordem: 10,
          },
          {
            nome: 'Foco Defensivo',
            descricao:
              'Prioriza mitigacao de tecnicas amaldicoadas contra o usuario.',
            efeitoAdicional:
              'Concede RD 5 contra dano Jujutsu enquanto estiver dentro do Dominio Simples.',
            ordem: 20,
          },
          {
            nome: 'Flexibilidade',
            descricao:
              'Permite incluir regras reduzidas e imbuicao limitada de tecnica amaldicoada.',
            efeitoAdicional:
              'Funciona como versao reduzida de Expansao de Dominio.',
            ordem: 30,
          },
        ],
      },
      {
        codigo: 'NAOINATA_AMPLIFICACAO_DOMINIO',
        nome: 'Amplificacao de Dominio',
        descricao:
          'Reveste corpo com veu vazio de dominio para enfraquecer tecnicas ao contato.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Sustentado',
        custoEA: 1,
        requisitos: {
          graus: [
            { tipoGrauCodigo: 'TECNICA_ANTI_BARREIRA', valorMinimo: 2 },
            { tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 },
          ],
        },
        efeito:
          'Anula ou enfraquece tecnicas amaldicoadas em contato. Enquanto ativa, usuario nao pode usar propria tecnica inata. Contra dano recebido, concede RD 6 base.',
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
              'Acumula +6 RD adicional por acumulo durante a reacao.',
            ordem: 10,
          },
        ],
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_REVERSA',
    nome: 'Tecnica Amaldicoada Reversa',
    descricao:
      'Processa energia amaldicoada negativa em energia positiva para cura e reversao.',
    requisitos: {
      graus: [
        { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 },
        { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 },
      ],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_RCT_CURA_RAPIDA',
        nome: 'Energia Amaldicoada Reversa (Cura Rapida)',
        descricao:
          'Canaliza energia reversa para curar o proprio corpo com ativacao imediata.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Instantanea',
        custoEA: 2,
        efeito:
          'Cura 3 + 1d6 PV. Cada +2 EA adiciona +1d6, ate 5d6, conforme grau em Tecnica Reversa.',
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
              'Cura 5 + 1d8 PV por rodada enquanto mantiver concentracao. Acumulavel ate o limite do grau; cada acumulo adicional custa +2 EA e adiciona +1d8 de cura.',
            ordem: 10,
          },
          {
            nome: 'Empatia - Cura Rapida',
            descricao: 'Aplica a cura rapida em outro alvo por toque.',
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
              'Cura 3 + 1d6 no alvo; cada +2 EA adicionais concede +1d6 de cura, ate o limite do grau.',
            ordem: 20,
          },
          {
            nome: 'Empatia - Cura Sustentada',
            descricao:
              'Mantem cura sustentada em alvo tocado ou com condicao definida pelo mestre.',
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
              'Cura 5 + 1d8 PV por rodada no alvo enquanto a sustentacao for mantida. Acumulavel ate o limite do grau; cada acumulo adicional custa +2 EA e adiciona +1d8 de cura.',
            ordem: 30,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVERSAO_FEITICO',
        nome: 'Reversao de Feitico',
        descricao:
          'Inverte o efeito de uma tecnica amaldicoada para seu oposto funcional.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Igual a tecnica alvo',
        alvo: 'Conforme tecnica original',
        duracao: 'Instantanea',
        custoEA: 0,
        efeito:
          'Custa o dobro do EA da tecnica original. Exige teste oposto de Jujutsu (Reversa): se vencer, inverte o efeito.',
        ordem: 20,
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_OFENSIVO_POSITIVO',
        nome: 'Revestimento Ofensivo Positivo',
        descricao:
          'Reveste corpo/arma com energia positiva para dano elevado contra maldicoes.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce ou sua arma',
        duracao: 'Sustentado',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Concede +2d8 de dano contra maldicoes. Acumulavel ate limite de grau (conforme mesa). Sustentacao segue regra de revestimentos.',
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
              'Concede +2d8 de dano de energia positiva no ataque disparador. Acumulavel ate o limite do grau; cada acumulo adicional custa +2 EA.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'NAOINATA_REVESTIMENTO_DEFENSIVO_POSITIVO',
        nome: 'Revestimento Defensivo Positivo',
        descricao:
          'Camada de energia positiva que protege e punem maldicoes que atacam o usuario.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Sustentado',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Concede +2 Defesa ou RD contra maldicoes (acumulavel por grau). Espiritos que atacarem o usuario sofrem 1d8 de energia positiva por acumulo.',
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
          'Projeta energia positiva para desestabilizar e exorcizar maldicoes.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto (9m)',
        alvo: '1 ser',
        duracao: 'Instantanea',
        custoEA: 5,
        custoPE: 1,
        efeito:
          'Causa 10 + 2d8 de dano base. Cada +2 EA adicionais adiciona +2d8 de dano, ate o limite do grau. Requer teste de Pontaria com Jujutsu contra Defesa do alvo.',
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
              'Mantem a formula de dano 10 + 2d8 por acumulo. Exige uma mao livre para manter o feixe e consome 2 PE por turno sustentado.',
            ordem: 10,
          },
        ],
      },
    ],
  },
  {
    codigo: 'NAOINATA_TECNICA_SHIKIGAMI',
    nome: 'Tecnica de Shikigami',
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
          'Manifesta um shikigami em espaco adjacente usando talisma associado.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alcance: '1,5m (adjacente)',
        alvo: 'Voce',
        duracao: 'Cena',
        custoEA: 1,
        efeito:
          'Custo base 1 EA, +1 EA por habilidade do shikigami e +1 EA a cada 2 niveis do personagem (arredonda para baixo).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_SHIKIGAMI',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo:
            '+1 EA por habilidade do shikigami e +1 EA a cada 2 niveis do personagem',
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
              'Pode ocorrer forcadamente se o usuario ficar inconsciente ou perder controle de energia.',
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
    nome: 'Tecnica de Corpos Amaldicoados',
    descricao:
      'Animacao de objetos inanimados por nucleo amaldicoado para gerar autocontrole.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_CADAVERES', valorMinimo: 1 }],
    },
    habilidades: [
      {
        codigo: 'NAOINATA_CRIAR_CORPO_AMALDICOADO',
        nome: 'Criar Corpo Amaldicoado',
        descricao:
          'Ritual de etapas que implanta nucleo amaldicoado em objeto inanimado.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        alcance: '1,5m (adjacente)',
        alvo: 'Objeto inanimado',
        duracao: 'Instantanea',
        custoEA: 1,
        efeito:
          'O corpo amaldicoado adquire consciencia funcional para seguir diretrizes do criador. Custo escala por habilidades e nivel (1 EA por habilidade + 1 EA a cada 2 niveis).',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_CADAVERES',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          descricaoPorAcumulo:
            '+1 EA por habilidade do corpo amaldicoado e +1 EA a cada 2 niveis do personagem',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Descarregar Corpo Amaldicoado',
            descricao:
              'Desliga corpos amaldicoados em alcance curto, preservando memoria no nucleo.',
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
    custoSustentacaoEA: habilidade.custoSustentacaoEA ?? null,
    custoSustentacaoPE: habilidade.custoSustentacaoPE ?? null,
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
  return {
    habilidadeTecnicaId,
    nome: variacao.nome,
    descricao: variacao.descricao,
    substituiCustos: variacao.substituiCustos ?? false,
    custoPE: variacao.custoPE ?? null,
    custoEA: variacao.custoEA ?? null,
    custoSustentacaoEA: variacao.custoSustentacaoEA ?? null,
    custoSustentacaoPE: variacao.custoSustentacaoPE ?? null,
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
  console.log('Cadastrando tecnicas amaldicoadas nao-inatas basicas...');

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
    console.log(
      `  OK ${tecnica.nome} (${tecnicaSeed.habilidades.length} habilidades)`,
    );
  }

  console.log(
    `OK ${tecnicasNaoInatasSeed.length} tecnicas nao-inatas basicas cadastradas.`,
  );
}

