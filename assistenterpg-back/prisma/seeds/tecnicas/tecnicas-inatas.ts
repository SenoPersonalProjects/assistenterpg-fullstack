// prisma/seed/tecnicas/tecnicas-inatas.ts

import type { Prisma, PrismaClient } from '@prisma/client';
import {
  AreaEfeito,
  TipoDano,
  TipoEscalonamentoHabilidade,
  TipoExecucao,
  TipoFonte,
  TipoTecnicaAmaldicoada,
} from '@prisma/client';
import type { SeedTecnicaInata } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';
import {
  SURTO_TEMPORAL_HABILIDADES,
  TRIBUNAL_JULGAMENTO_HABILIDADES,
} from './tecnicas-inatas-surto-tribunal';

type SeedVariacaoTecnicaInata = {
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
  escalonaPorGrau?: boolean | null;
  escalonamentoCustoEA?: number | null;
  escalonamentoCustoPE?: number | null;
  escalonamentoTipo?: TipoEscalonamentoHabilidade | null;
  escalonamentoEfeito?: Prisma.InputJsonValue | null;
  escalonamentoDano?: Prisma.InputJsonValue | null;
  dadosDano?: Prisma.InputJsonValue | null;
  danoFlat?: number | null;
  danoFlatTipo?: TipoDano | null;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  ordem: number;
};

type SeedHabilidadeTecnicaInata = {
  codigo: string;
  nome: string;
  descricao: string;
  execucao: TipoExecucao;
  area?: AreaEfeito | null;
  alcance?: string | null;
  alvo?: string | null;
  duracao?: string | null;
  resistencia?: string | null;
  dtResistencia?: string | null;
  custoPE?: number;
  custoEA?: number;
  custoSustentacaoEA?: number | null;
  custoSustentacaoPE?: number | null;
  efeito: string;
  requisitos?: Prisma.InputJsonValue | null;
  testesExigidos?: Prisma.InputJsonValue | null;
  escalonaPorGrau?: boolean;
  grauTipoGrauCodigo?: string | null;
  escalonamentoCustoEA?: number;
  escalonamentoCustoPE?: number;
  escalonamentoTipo?: TipoEscalonamentoHabilidade;
  escalonamentoEfeito?: Prisma.InputJsonValue | null;
  escalonamentoDano?: Prisma.InputJsonValue | null;
  dadosDano?: Prisma.InputJsonValue | null;
  danoFlat?: number | null;
  danoFlatTipo?: TipoDano | null;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  variacoes?: SeedVariacaoTecnicaInata[];
  ordem: number;
};

type SeedTecnicaInataComHabilidades = SeedTecnicaInata & {
  codigosLegados?: string[];
  habilidades?: SeedHabilidadeTecnicaInata[];
};

const MOJIBAKE_PATTERN = /Ã.|Â.|â[\u0080-\u00BF]|�/;

function scoreMojibake(value: string): number {
  return (value.match(/Ã|Â|â|�/g) ?? []).length;
}

function corrigirMojibakeSeedTexto(
  value: string | null | undefined,
): string | null {
  if (typeof value !== 'string') return value ?? null;
  if (!MOJIBAKE_PATTERN.test(value)) return value;

  const reparado = Buffer.from(value, 'latin1').toString('utf8');
  return scoreMojibake(reparado) < scoreMojibake(value) ? reparado : value;
}

function corrigirMojibakeSeedJson(
  value: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    return corrigirMojibakeSeedTexto(value) as Prisma.InputJsonValue;
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      corrigirMojibakeSeedJson(item as Prisma.InputJsonValue),
    ) as Prisma.InputJsonValue;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(
      value as Record<string, Prisma.InputJsonValue>,
    ).map(([key, item]) => [key, corrigirMojibakeSeedJson(item)]);
    return Object.fromEntries(entries) as Prisma.InputJsonValue;
  }
  return value;
}

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

export const tecnicasInatasSeed: SeedTecnicaInataComHabilidades[] = [
  // ========================================
  // ✅ TÉCNICAS HEREDITÁRIAS
  // ========================================
  {
    codigo: 'CHAMAS_DESASTRE',
    nome: 'Chamas do Desastre',
    descricao: 'Permite criar e controlar chamas intensas.',
    hereditaria: true,
    clasHereditarios: ['Ryomen'],
  },
  {
    codigo: 'COPIAR',
    nome: 'Copiar',
    descricao: 'Permite copiar técnicas de outros feiticeiros.',
    hereditaria: true,
    clasHereditarios: ['Okkotsu', 'Gojo'],
  },
  {
    codigo: 'DEZ_SOMBRAS',
    nome: 'Dez Sombras',
    descricao: 'Invoca shikigami das sombras.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'FABRICACAO_AMALDICOADA',
    nome: 'Fabricação Amaldiçoada',
    descricao: 'Cria ferramentas amaldiçoadas.',
    hereditaria: true,
    clasHereditarios: ['Haganezuka'],
  },
  {
    codigo: 'FALA_AMALDICOADA',
    nome: 'Fala Amaldiçoada',
    descricao: 'Comandos verbais que afetam a realidade.',
    hereditaria: true,
    clasHereditarios: ['Inumaki'],
  },
  {
    codigo: 'FURIA_AGNI',
    nome: 'Fúria de Agni',
    descricao: 'Controle sobre chamas divinas.',
    hereditaria: true,
    clasHereditarios: ['Ram'],
  },
  {
    codigo: 'GRAVIDADE_ZERO',
    nome: 'Gravidade Zero',
    descricao: 'Manipula a gravidade ao redor.',
    hereditaria: true,
    clasHereditarios: ['Itadori'],
  },
  {
    codigo: 'ILIMITADO',
    nome: 'Ilimitado',
    descricao: 'Manipulacao do espaco atraves do conceito de infinito.',
    hereditaria: true,
    clasHereditarios: ['Gojo', 'Okkotsu'],
    codigosLegados: ['INFINITO'],
    requisitos: {
      observacao:
        'Tecnica inata baseada em manipulacao espacial, Lapso Azul, Reversao Vermelho, Vazio Roxo e Expansao de Dominio.',
      recursoOpcional:
        'Alguns efeitos citam os 6 Olhos; quando o usuario nao possuir esse recurso, aplique as penalidades descritas no efeito.',
    },
    habilidades: [
      {
        codigo: 'INATA_ILIMITADO_MUGEN',
        nome: 'Mugen',
        descricao:
          'Invoca um campo paradoxal que desacelera tudo que entra no alcance do usuario.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Pessoal',
        alvo: 'Voce',
        duracao: 'Instantaneo',
        custoEA: 3,
        custoPE: 2,
        efeito:
          'Voce pode gastar sua reacao para anular um dano que sofreria de um ataque ou tecnica, contanto que esse ataque precise viajar o espaco para te atingir. O espaco infinito gerado torna o usuario inatingivel contra esse efeito especifico.',
        ordem: 10,
        variacoes: [
          {
            nome: 'Superior',
            descricao:
              'Mantem o campo infinito ativo para barrar ataques fisicos e tecnicas Jujutsu.',
            substituiCustos: true,
            custoEA: 4,
            custoPE: 0,
            custoSustentacaoEA: 2,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Pessoal',
            alvo: 'Voce',
            duracao: 'Sustentado',
            efeitoAdicional:
              'Enquanto sustentado, voce fica inatingivel por ataques fisicos e tecnicas Jujutsu, exceto expansao de dominio, extensao de dominio e excecoes especificas no uso de tecnicas Jujutsu.',
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao:
              'Condensa o infinito ao redor do usuario em alcance corpo a corpo.',
            substituiCustos: true,
            custoEA: 4,
            custoPE: 2,
            custoSustentacaoEA: 2,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Corpo a corpo (1,5m)',
            alvo: 'Voce',
            duracao: 'Sustentado',
            efeitoAdicional:
              'Enquanto sustentado, funciona em alcance corpo a corpo, impedindo qualquer coisa de chegar a 1,5m de voce. Aumenta a efetividade do Mugen contra extensoes de dominio e tecnicas Jujutsu, mas nao impede o acerto garantido de uma expansao de dominio.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS',
        nome: 'Esferas do Lapso da Tecnica Amaldicoada: Azul',
        descricao:
          'Cria e sustenta uma esfera condensada de Azul, representando espaco negativo.',
        execucao: TipoExecucao.ACAO_MOVIMENTO,
        alcance: 'Curto',
        alvo: '1 esfera do Azul',
        duracao: 'Sustentado',
        custoEA: 1,
        custoSustentacaoEA: 1,
        efeito:
          'Cria e sustenta a esfera do Azul condensado. Uma vez por turno, voce pode mover a esfera como acao livre dentro do alcance curto. Apos usar uma das variacoes possiveis da esfera, ela desaparece, exceto quando o efeito disser o contrario.',
        ordem: 20,
        variacoes: [
          {
            nome: 'Liberacao Superior',
            descricao:
              'Cria multiplas esferas de Azul para controle espacial avancado.',
            substituiCustos: false,
            custoEA: 2,
            requisitos: {
              graus: [
                { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 },
              ],
            },
            efeitoAdicional:
              'Pode criar mais de uma esfera, ate o valor do atributo de calculo de energia amaldicoada (INT). O custo efetivo e 1 EA por esfera + 2 EA. Voce pode mover todas juntas para o mesmo lugar como acao livre, ou individualmente; cada esfera movida separadamente custa uma acao livre, e a partir da segunda tambem custa uma acao de movimento.',
            ordem: 10,
          },
          {
            nome: 'Liberacao Maxima',
            descricao:
              'Cria uma unica esfera massiva do Azul com tamanho 2x2 quadrados.',
            substituiCustos: true,
            custoEA: 3,
            custoPE: 2,
            requisitos: {
              graus: [
                { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 },
              ],
            },
            efeitoAdicional:
              'Cria uma esfera massiva de 2x2 quadrados (3x3m). Muda o funcionamento das tecnicas que consomem a esfera conforme a Liberacao Maxima de cada uma.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_AZUL_PERSEGUIR',
        nome: 'Azul - Perseguir',
        descricao:
          'Usa uma esfera do Azul para perseguir um alvo e puxar violentamente materia em sua direcao.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: 'Ser ou objeto',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos anula',
        custoEA: 1,
        requisitos: {
          requerSustentacao: 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS',
        },
        testesExigidos: ['Pontaria com Jujutsu'],
        dadosDano: [{ quantidade: 1, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' }],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano de Energia Amaldicoada por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        efeito:
          'Cria um vacuo onde o proprio mundo e forcado a corrigir o espaco negativo. A esfera persegue um alvo no alcance da tecnica, causando 1d6 de dano de Energia Amaldicoada e deixando-o FRACO por 1 rodada. A resistencia anula a condicao. O custo e 1 EA por esfera usada.',
        ordem: 30,
        variacoes: [
          {
            nome: 'Com Liberacao Maxima',
            descricao: 'A esfera massiva puxa e esmaga tudo em uma linha reta.',
            substituiCustos: true,
            custoEA: 3,
            execucao: TipoExecucao.ACAO_COMPLETA,
            area: AreaEfeito.LINHA,
            alcance: 'Curto, linha de 3m de largura',
            alvo: 'Seres na reta',
            duracao: 'Instantaneo',
            resistencia: 'Fortitude',
            requisitos: { requerVariacao: 'Liberacao Maxima' },
            danoFlat: 4,
            danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
            dadosDano: [
              { quantidade: 2, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' },
            ],
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoDano: {
              quantidade: 1,
              dado: 'd6',
              tipo: 'ENERGIA_AMALDICOADA',
            },
            efeitoAdicional:
              'A massa puxa e esmaga tudo para dentro de si, causando 4 + 2d6 de dano a todos os seres e objetos pegos e deixando-os DEBILITADOS por 1 rodada; resistencia reduz para FRACOS. A esfera nao desaparece apos o efeito, torna 6m ao redor TERRENO DIFICIL, nao pode ser movida como as outras e vira OBJETO ESTACIONARIO. Para desaparecer, basta parar de sustentar. Requisito para Vazio Roxo Irrestrito.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_AZUL_ATRAIR',
        nome: 'Azul - Atrair',
        descricao:
          'Faz a esfera do Azul atrair tudo ao redor do ponto onde foi posicionada.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Ponto da esfera em alcance curto',
        alvo: 'Seres ou objetos na area',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos',
        custoEA: 4,
        requisitos: {
          requerSustentacao: 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS',
        },
        dadosDano: [{ quantidade: 2, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' }],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano de Energia Amaldicoada por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        efeito:
          'Atrai tudo dentro de um circulo de 6m de raio ao redor da esfera, causando 2d6 de dano em todos os seres e objetos na area e deixando-os ENREDADOS por 1 rodada. A resistencia evita a condicao.',
        ordem: 40,
        variacoes: [
          {
            nome: 'Com Liberacao Maxima',
            descricao:
              'A massa maxima do Azul puxa e esmaga tudo dentro da area.',
            substituiCustos: true,
            custoEA: 5,
            execucao: TipoExecucao.ACAO_PADRAO,
            area: AreaEfeito.ESFERA,
            alcance: 'Ponto da esfera em alcance curto',
            alvo: 'Seres ou objetos na area',
            duracao: 'Instantaneo',
            resistencia: 'Fortitude',
            requisitos: { requerVariacao: 'Liberacao Maxima' },
            danoFlat: 4,
            danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
            dadosDano: [
              { quantidade: 4, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' },
            ],
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoDano: {
              quantidade: 1,
              dado: 'd6',
              tipo: 'ENERGIA_AMALDICOADA',
            },
            efeitoAdicional:
              'A massa puxa e esmaga tudo em um raio de 6m, causando 4 + 4d6 de dano e deixando os alvos ENREDADOS por 2 rodadas; a resistencia evita a condicao. A esfera nao desaparece apos o efeito, torna 6m ao redor TERRENO DIFICIL, pode ser movida como as outras e vira OBJETO ESTACIONARIO. Para desaparecer, basta parar de sustentar. Requisito para Vazio Roxo Irrestrito.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_AZUL_ATRACAO_LEVE',
        nome: 'Azul - Atracao Leve',
        descricao:
          'Usa a esfera do Azul para prender alvos sem causar dano direto.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.ESFERA,
        alcance: 'Ponto da esfera em alcance curto',
        alvo: 'Seres ou objetos na area',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos',
        dtResistencia: 'DT de tecnicas + 5',
        custoEA: 3,
        requisitos: {
          requerSustentacao: 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS',
        },
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.REGRAS,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 na DT para evitar a condicao por +1 EA',
        },
        efeito:
          'Atrai tudo dentro de um circulo de 6m de raio sem causar dano, deixando os alvos ENREDADOS por 1d3 rodadas. A resistencia evita a condicao. Pode adicionar +1d6 na DT para evitar a condicao para cada +1 EA gasto, ate o limite do Grau de Aprimoramento em Tecnica Amaldicoada.',
        ordem: 50,
      },
      {
        codigo: 'INATA_ILIMITADO_PUNHO_AZUL',
        nome: 'Variacao do Lapso: Punho Azul (Ao-Ken)',
        descricao:
          'Aplica o conceito de espaco negativo milimetricamente a frente dos punhos.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Toque',
        alvo: '1 ser atingido',
        duracao: 'Instantaneo',
        custoEA: 1,
        requisitos: { requerHabilidade: 'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS' },
        testesExigidos: ['Luta'],
        dadosDano: [{ quantidade: 1, dado: 'd6', tipo: 'Tipo do ataque' }],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano do tipo do ataque por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'Tipo do ataque',
        },
        efeito:
          'O vacuo criado puxa o alvo violentamente em direcao ao golpe no momento do impacto, adicionando +1d6 de dano do tipo do seu ataque. O ataque recebe a propriedade Impacto: se acertar, voce pode fazer a manobra Derrubar como acao livre usando seu teste de ataque como teste da manobra.',
        ordem: 60,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Intensifica a atracao para garantir precisao letal.',
            substituiCustos: true,
            custoEA: 2,
            dadosDano: [{ quantidade: 2, dado: 'd6', tipo: 'Tipo do ataque' }],
            efeitoAdicional:
              'O vacuo impede que o inimigo se esquive corretamente. Voce recebe +2 no teste de ataque e muda o bonus para +2d6 de dano do tipo do seu ataque.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_VERMELHO',
        nome: 'Reversao de Tecnica Amaldicoada: Vermelho',
        descricao:
          'Reverte o Azul com energia reversa, criando uma forca repulsiva extremamente poderosa.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Linha reta de 18m',
        alvo: 'Seres na linha reta',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude reduz metade',
        custoEA: 4,
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 }],
          requerTecnicaNaoInata: 'NAOINATA_TECNICA_REVERSA',
        },
        testesExigidos: ['Pontaria com Jujutsu'],
        danoFlat: 4,
        danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
        dadosDano: [{ quantidade: 2, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' }],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano de Energia Amaldicoada por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd6',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        efeito:
          'Apenas o primeiro ser na reta recebe o dano completo; os demais recebem metade. Alvos acertados recebem 4 + 2d6 de dano de Energia Amaldicoada e sao empurrados pelo deslocamento restante do raio. Se colidirem com objeto estacionario, recebem 1d6 de dano por quadrado deslocado, ate 6d6. Fortitude evita ser empurrado.',
        ordem: 70,
        variacoes: [
          {
            nome: 'Liberacao Superior',
            descricao:
              'Amplifica o Vermelho para uma repulsao ainda mais devastadora.',
            substituiCustos: true,
            custoEA: 6,
            custoPE: 2,
            danoFlat: 4,
            danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
            dadosDano: [
              { quantidade: 4, dado: 'd6', tipo: 'ENERGIA_AMALDICOADA' },
            ],
            efeitoAdicional:
              'Amplifica o dano para 4 + 4d6 e remove o limite de dano de colisao com objeto estacionario. Falhar no teste de resistencia tambem deixa o alvo CAIDO e DESPREVENIDO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_VAZIO_ROXO',
        nome: 'Convergencia de Tecnica Amaldicoada: Vazio Roxo',
        descricao:
          'Combina Azul e Vermelho em uma massa imaginaria que oblitera tudo em linha reta.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        area: AreaEfeito.LINHA,
        alcance: 'Longo',
        alvo: 'Linha reta de 3m de largura',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos',
        custoEA: 8,
        custoPE: 2,
        requisitos: {
          graus: [
            { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 3 },
            { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 },
          ],
          requerHabilidades: [
            'INATA_ILIMITADO_LAPSO_AZUL_ESFERAS',
            'INATA_ILIMITADO_VERMELHO',
          ],
        },
        testesExigidos: ['Pontaria com Jujutsu'],
        danoFlat: 10,
        danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
        dadosDano: [
          { quantidade: 6, dado: 'd12', tipo: 'ENERGIA_AMALDICOADA' },
        ],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d12 de dano de Energia Amaldicoada por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd12',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        efeito:
          'Exige 2 acoes padroes. Causa 6d12 + 10 de dano em uma linha reta de 3m de largura. Apos usar o Vazio Roxo sem possuir os 6 Olhos, o usuario fica FATIGADO ate o fim da cena. Se ficar inconsciente por usar a tecnica, fica FATIGADO ate o proximo descanso confortavel.',
        ordem: 80,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Aumenta a intensidade e a espessura do Vazio Roxo.',
            substituiCustos: true,
            custoEA: 10,
            custoPE: 4,
            danoFlat: 10,
            danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
            dadosDano: [
              { quantidade: 10, dado: 'd12', tipo: 'ENERGIA_AMALDICOADA' },
            ],
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoDano: {
              quantidade: 1,
              dado: 'd12',
              tipo: 'ENERGIA_AMALDICOADA',
            },
            efeitoAdicional:
              'Adiciona mais 1 quadrado na espessura da linha reta, +4d12 de dano e +5 no teste. E acumulativo ate o limite do Grau de Aprimoramento em Tecnica Amaldicoada. Sem possuir os 6 Olhos, usar esta versao deixa o usuario EXAUSTO ate o fim da cena.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_ILIMITADO_VAZIO_ROXO_IRRESTRITO',
        nome: 'Variacao: Vazio Roxo Irrestrito',
        descricao:
          'Ritual de detonacao remota que colide um Azul maximo ativo com um Vermelho superior.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        area: AreaEfeito.ESFERA,
        alcance: 'Explosao de 12m de raio',
        alvo: 'Seres e objetos na area',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos reduz metade',
        dtResistencia: 'DT de tecnicas + 5',
        custoEA: 3,
        custoPE: 1,
        requisitos: {
          graus: [
            { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 3 },
            { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 },
          ],
          requerHabilidades: [
            'INATA_ILIMITADO_AZUL_PERSEGUIR',
            'INATA_ILIMITADO_AZUL_ATRAIR',
            'INATA_ILIMITADO_VERMELHO',
          ],
          ritual:
            'Acao 1: lancar uma variacao com Liberacao Maxima do Azul. Acao 2: lancar a Liberacao Superior do Vermelho atingindo a Esfera Maxima do Azul. Acao 3: detonar a colisao como acao livre por 3 EA e 1 PE.',
        },
        danoFlat: 12,
        danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
        dadosDano: [
          { quantidade: 7, dado: 'd12', tipo: 'ENERGIA_AMALDICOADA' },
        ],
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d12 de dano de Energia Amaldicoada por +2 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd12',
          tipo: 'ENERGIA_AMALDICOADA',
        },
        efeito:
          'O custo total e o custo do Azul + custo do Vermelho + 3 EA e 1 PE do encantamento final. Detona a colisao entre um Azul e um Vermelho ativos para criar uma explosao omnidirecional de 12m de raio, causando 7d12 + 12 de dano. O usuario recebe metade do dano total por padrao; se passar no teste de Reflexos, tambem reduz esse dano pela metade. Seres que falham recebem dano total e ficam DEBILITADOS; se passarem, recebem metade e ficam FRACOS.',
        ordem: 90,
      },
      {
        codigo: 'INATA_ILIMITADO_EXPANSAO_VAZIO_INFINITO',
        nome: 'Expansao de Dominio: Vazio Infinito',
        descricao:
          'Dominio letal e restritivo que forca os alvos a processarem informacao infinita.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.ESFERA,
        alcance: 'Raio de 10m (barreira fechada)',
        alvo: 'Todos os seres dentro da area, exceto o usuario e quem ele estiver tocando fisicamente',
        duracao: 'Sustentado',
        resistencia:
          'Sem resistencia inicial; defesa apenas por tecnica anti-barreira no momento da ativacao',
        custoEA: 16,
        custoPE: 4,
        custoSustentacaoEA: 2,
        requisitos: {
          mudra:
            'O dedo medio da mao direita cruza sobre o indicador (Dedo de Indra).',
          tipoDominio: 'Letal / Restritivo',
        },
        dadosDano: [{ quantidade: 2, dado: 'd8', tipo: 'MENTAL' }],
        efeito:
          'O ambiente e substituido por um vacuo negro e branco preenchido por linhas de luz que representam o fluxo de informacao do universo. Como acerto garantido, inimigos dentro do dominio ficam ATORDOADOS e IMOVEIS, sem acoes, reacoes ou movimento. No inicio de cada turno de um inimigo dentro do dominio, ele sofre 2d8 de dano Mental/Sanidade; se for uma maldicao ou inimigo sem SANIDADE, recebe 2d6 de dano Jujutsu.',
        ordem: 100,
      },
    ],
  },
  {
    codigo: 'MANIPULACAO_SANGUE',
    nome: 'Manipulação de Sangue',
    descricao: 'Controle total sobre o próprio sangue e sangue alheio.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'MANIPULACAO_CEU',
    nome: 'Manipulação do Céu',
    descricao: 'Controle sobre fenômenos celestiais.',
    hereditaria: true,
    clasHereditarios: ['Fujiwara'],
  },
  {
    codigo: 'OCEANO_DESASTROSO',
    nome: 'Oceano Desastroso',
    descricao: 'Cria e controla massas de água destrutivas.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'PLANTAS_DESASTRE',
    nome: 'Plantas do Desastre',
    descricao: 'Controle sobre plantas amaldiçoadas.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'SANTUARIO',
    nome: 'Santuário',
    descricao: 'Expansão de Domínio destrutiva.',
    hereditaria: true,
    clasHereditarios: ['Ryomen', 'Itadori'],
    requisitos: {
      observacao:
        'Tecnica inata focada em cortes amaldicoados (Desmantelar/Clivar) e chamada de fogo condicional.',
      dominio:
        'Expansao de Dominio: Santuario da Execucao Marcial, com acerto garantido de cortes.',
    },
    habilidades: [
      {
        codigo: 'INATA_SANTUARIO_DESMANTELAR_UNICO',
        nome: 'Desmantelar Unico',
        descricao: 'Dispara um corte amaldicoado em linha reta contra um alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Curto (linha de 1m de largura)',
        alvo: '1 ser da linha',
        duracao: 'Instantaneo',
        resistencia: 'Reacao',
        custoEA: 1,
        testesExigidos: ['Pontaria com Jujutsu'],
        efeito:
          'Conta como disparo (Pontaria com Jujutsu). Causa 1 + 1d4 de dano de corte amaldicoado e crita no 20 natural. Se o alvo for eliminado ou perder membro, o dano pode seguir para o proximo alvo da linha.',
        dadosDano: [{ quantidade: 1, dado: 'd4', tipo: 'Corte Amaldiçoado' }],
        danoFlat: 1,
        danoFlatTipo: TipoDano.CORTANTE,
        criticoValor: 20,
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1 + 1d4 de dano de corte amaldicoado',
          observacao:
            'Acumula com o grau de aprimoramento em Tecnica Amaldicoada.',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd4',
          tipo: 'Corte Amaldiçoado',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Eleva o corte com maior precisao e dano.',
            substituiCustos: false,
            custoEA: 1,
            custoPE: 1,
            dadosDano: [
              { quantidade: 2, dado: 'd4', tipo: 'Corte Amaldiçoado' },
            ],
            danoFlat: 2,
            danoFlatTipo: TipoDano.CORTANTE,
            criticoValor: 19,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '2 + 2d4 de dano',
              porAcumulo: '+2d4 por +1 EA',
              criticoNatural: 19,
            },
            escalonamentoDano: {
              quantidade: 2,
              dado: 'd4',
              tipo: 'Corte Amaldiçoado',
            },
            efeitoAdicional:
              'Dano maximo de referencia informado: 52 (4 EA e 1 PE totais).',
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao:
              'Eleva ao limite da variacao, com multiplicacao de dano e maior faixa de critico.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            dadosDano: [
              { quantidade: 3, dado: 'd4', tipo: 'Corte Amaldiçoado' },
            ],
            danoFlat: 3,
            danoFlatTipo: TipoDano.CORTANTE,
            criticoValor: 18,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '3 + 3d4 de dano',
              porAcumulo: '+3d4 por +1 EA',
              criticoNatural: 18,
            },
            escalonamentoDano: {
              quantidade: 3,
              dado: 'd4',
              tipo: 'Corte Amaldiçoado',
            },
            efeitoAdicional:
              'Dano maximo de referencia informado: 78 (5 EA e 2 PE totais).',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_SANTUARIO_BARRAGEM_DESMANTELAR',
        nome: 'Barragem de Desmantelar',
        descricao:
          'Dispara uma rajada de cortes amaldicoados em area retangular.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.CUBO,
        alcance: 'Curto (retangulo 4x4m)',
        alvo: 'Seres na area',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos reduz metade',
        custoEA: 3,
        custoPE: 1,
        testesExigidos: ['Pontaria com Jujutsu'],
        efeito:
          'Exige teste de Pontaria com Jujutsu contra Defesa base dos alvos. Causa 3 + 3d4 de dano de corte amaldicoado em todos os afetados.',
        dadosDano: [{ quantidade: 3, dado: 'd4', tipo: 'Corte Amaldiçoado' }],
        danoFlat: 3,
        danoFlatTipo: TipoDano.CORTANTE,
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d4 de dano por +1 EA',
        },
        escalonamentoDano: {
          quantidade: 1,
          dado: 'd4',
          tipo: 'Corte Amaldiçoado',
        },
        ordem: 20,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Versao elevada com dados maiores.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 1,
            dadosDano: [
              { quantidade: 3, dado: 'd8', tipo: 'Corte Amaldiçoado' },
            ],
            danoFlat: 3,
            danoFlatTipo: TipoDano.CORTANTE,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '3 + 3d8 de dano',
              porAcumulo: '+1d8 por +1 EA',
            },
            escalonamentoDano: {
              quantidade: 1,
              dado: 'd8',
              tipo: 'Corte Amaldiçoado',
            },
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao: 'Versao de saturacao total da barragem.',
            substituiCustos: false,
            custoEA: 3,
            custoPE: 2,
            dadosDano: [
              { quantidade: 4, dado: 'd12', tipo: 'Corte Amaldiçoado' },
            ],
            danoFlat: 4,
            danoFlatTipo: TipoDano.CORTANTE,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '4 + 4d12 de dano',
              porAcumulo: '+1d12 por +1 EA',
            },
            escalonamentoDano: {
              quantidade: 1,
              dado: 'd12',
              tipo: 'Corte Amaldiçoado',
            },
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_SANTUARIO_CLIVAR',
        nome: 'Clivar',
        descricao:
          'Corte por toque que ajusta o dano de acordo com a resistencia do alvo analisado.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Toque',
        alvo: 'Ser tocado',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude reduz metade',
        custoEA: 1,
        custoPE: 1,
        testesExigidos: ['Percepcao com Jujutsu (analise previa)'],
        efeito:
          'Base: 1d8 de dano de corte. Apos analise (DT 25 + nivel do alvo), pode adicionar dados ao custo de +1 EA por faixa de resistencia/fortitude/nivel descrita na tecnica.',
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          porAcumuloEA:
            '+1 dado para cada faixa elegivel (Resistencia, Fortitude e Niveis do alvo)',
          observacao:
            'Toda tentativa sem analise previa reduz a DT em 5 (conforme texto enviado).',
        },
        ordem: 30,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Aumenta o passo de dano para d12.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            efeitoAdicional:
              'Mantem a logica de adicoes por alvo analisado, com dado base em d12.',
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao:
              'Aumenta quantidade e passo: base vira 2d10, incluindo adicoes.',
            substituiCustos: false,
            custoEA: 4,
            custoPE: 2,
            efeitoAdicional:
              'Mantem a logica de adicoes por alvo analisado, agora em 2d10 por incremento.',
            ordem: 20,
          },
          {
            nome: 'Variacao - Objeto Tocado',
            descricao:
              'Versao focada em objetos. Se for objeto amaldicoado/reforcado, requer analise previa.',
            substituiCustos: true,
            alvo: 'Objeto tocado',
            efeitoAdicional:
              'Base 2d8. Para cada 5 PV do objeto, adiciona 2 dados por +1 EA. Para cada 5 RD, adiciona 2 dados por +1 EA.',
            ordem: 30,
          },
          {
            nome: 'Golpe Combinado',
            descricao:
              'Permite executar ataque corpo a corpo basico junto com Clivar no mesmo movimento.',
            substituiCustos: false,
            efeitoAdicional:
              'Se o ataque basico acertar, aplica o dano de Clivar escolhido sem analise previa, mas sem bonus extras de resistencia/fortitude/nivel/PV/RD.',
            ordem: 40,
          },
          {
            nome: 'Teia de Aranha',
            descricao:
              'Variacao Superior orientada a destruir ambientes inorganicos.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            requisitos: {
              requerVariacao: 'Superior',
            },
            efeitoAdicional:
              'Causa 4d8 em ambiente/estrutura. Para cada 5 PV do objeto, +4 dados por +1 EA. Para cada 5 RD, +4 dados por +1 EA.',
            ordem: 50,
          },
        ],
      },
      {
        codigo: 'INATA_SANTUARIO_CHAMA_DIVINA',
        nome: 'Chama Divina',
        descricao:
          'Feitico ritualistico que converte residuos dos cortes do Santuario em flecha de fogo explosiva.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        area: AreaEfeito.LINHA,
        alcance: 'Longo (linha de 1m de largura)',
        alvo: '1 ser da linha',
        duracao: 'Instantaneo',
        resistencia: 'Reacao / Reflexos para area secundaria',
        custoEA: 4,
        custoPE: 2,
        requisitos: {
          condicaoUso: 'So pode ser usada apos Desmantelar e Clivar.',
          ritual:
            'Clivar/Desmantelar -> manipular residuo (acao completa) -> disparar flecha (acao padrao).',
        },
        efeito:
          'Causa 6d6 de dano de fogo no alvo principal e deixa seres em 3m do impacto EM CHAMAS (Reflexos evita condicao e reduz dano).',
        ordem: 40,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Aumenta dano e raio de ignicao.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            efeitoAdicional:
              'Causa 8d8 de dano de fogo e deixa seres em 6m EM CHAMAS.',
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao: 'Explosao massiva de fogo do Santuario.',
            substituiCustos: false,
            custoEA: 4,
            custoPE: 2,
            efeitoAdicional:
              'Causa 10d10 no alvo principal e 5d10 em todos no alcance curto. Todos os atingidos ficam EM CHAMAS.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_SANTUARIO_EXPANSAO_DOMINIO',
        nome: 'Expansao de Dominio: Santuario da Execucao Marcial',
        descricao:
          'Dominio inato que integra Clivar e Desmantelar com acerto garantido em uma zona de execucao.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.ESFERA,
        alcance: 'Raio de 12m',
        alvo: 'Seres no alcance',
        duracao: 'Sustentado',
        custoEA: 16,
        custoPE: 4,
        custoSustentacaoEA: 2,
        resistencia: 'Varia',
        requisitos: {
          mudra: 'Mudra da Execucao Marcial',
        },
        efeito:
          'No inicio de cada turno/rodada, aplica automaticamente 6 + 6d4 (Desmantelar) e 1d8 + 1d8 a cada 2 niveis do alvo (Clivar). Objetos e estruturas sao triturados por cortes recorrentes.',
        ordem: 50,
        variacoes: [
          {
            nome: 'Modo de Comando - Cao da Central 92',
            descricao:
              'Desativa ataque automatico para controle manual ofensivo total.',
            substituiCustos: true,
            efeitoAdicional:
              'Enquanto ativo: +1 FOR, +1 AGI, +5 Jujutsu. Tecnicas do Santuario tornam-se impossiveis de esquivar (apenas bloquear/contra-atacar).',
            ordem: 10,
          },
          {
            nome: 'Sinergia com Clivar/Desmantelar',
            descricao:
              'No Modo de Comando, o dominio auxilia a leitura dos alvos para Clivar.',
            efeitoAdicional:
              'A DT da analise de Percepcao com Jujutsu para Clivar pode ser reduzida entre 5 e 10, a criterio da mesa.',
            ordem: 20,
          },
        ],
      },
    ],
  },
  {
    codigo: 'BONECA_PALHA',
    nome: 'Técnica da Boneca de Palha',
    descricao: 'Transfere dano através de bonecos de palha.',
    hereditaria: true,
    clasHereditarios: ['Kugisaki'],
  },
  {
    codigo: 'PROJECAO',
    nome: 'Técnica de Projeção',
    descricao: 'Manipula o movimento através de projeções.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'TRANSFIGURACAO_OCIOSA',
    nome: 'Transfiguração Ociosa',
    descricao: 'Altera a forma da alma e corpo.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },

  // ========================================
  // ✅ TÉCNICAS NÃO HEREDITÁRIAS
  // ========================================
  {
    codigo: 'AMPLIFICACAO_SOM',
    nome: 'Amplificação Sonora',
    descricao:
      'Usa o corpo do usuário como um dispositivo de amplificação de som, amplificando as melodias que ele toca com algum instrumento e lançando-as em ondas de energia amaldiçoada.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ARMAMENTO_DIVINO',
    nome: 'Armamento Divino',
    descricao: 'Cria armas de energia divina.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'CARNE_EXPLOSIVA',
    nome: 'Carne Explosiva',
    descricao: 'Transforma partes do corpo em explosivos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'DADIVA_LAVOISIER',
    nome: 'Dádiva de Lavoisier',
    descricao: 'Manipulação de matéria através de reações químicas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'DESCARGA_EA',
    nome: 'Descarga de Energia Amaldiçoada',
    descricao: 'Libera rajadas de energia amaldiçoada.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENCANTAMENTO_INVERSO',
    nome: 'Encantamento do Inverso',
    descricao: 'Inverte propriedades de técnicas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'EA_ELETRIFICADA',
    nome: 'Energia Amaldiçoada Eletrificada',
    descricao: 'Energia amaldiçoada com propriedades elétricas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENVENENAMENTO',
    nome: 'Envenenamento',
    descricao: 'Cria e controla venenos amaldiçoados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FORMACAO_GELO',
    nome: 'Formação de Gelo',
    descricao: 'Cria e manipula gelo.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FURIA_ESTELAR',
    nome: 'Fúria Estelar',
    descricao: 'Energia cósmica destrutiva.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'IMORTALIDADE',
    nome: 'Imortalidade',
    descricao: 'Regeneração e ressurreição.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_FANTOCHES',
    nome: 'Manipulação de Fantoches',
    descricao: 'Controla fantoches amaldiçoados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_MALDICAO',
    nome: 'Manipulação de Maldição',
    descricao: 'Controle direto sobre maldições.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_TERRA',
    nome: 'Manipulação de Terra',
    descricao: 'Controle sobre terra e rochas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MILAGRES',
    nome: 'Milagres',
    descricao: 'Efeitos miraculosos imprevisíveis.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'NULIFICACAO_ESCADA_JACO',
    nome: 'Nulificação: Escada de Jacó',
    descricao: 'Anula técnicas inimigas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'OLHAR_PARALISANTE',
    nome: 'Olhar Paralisante',
    descricao: 'Paralisa alvos através do olhar.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ORQUIDEA_SARKICA',
    nome: 'Orquídea Sárkica',
    descricao: 'Manipulação de carne e ossos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'PUNHOS_MISSEIS',
    nome: 'Punhos de Mísseis',
    descricao: 'Ataques perfurantes explosivos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SEM_TECNICA',
    nome: 'Sem Técnica Amaldiçoada',
    descricao: 'Não possui técnica amaldiçoada inata.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SETE_CAMINHOS_MUNDANOS',
    nome: 'Sete Caminhos Mundanos',
    descricao:
      'Roleta amaldiçoada que concede um dos Caminhos Mundanos durante a cena.',
    hereditaria: false,
    clasHereditarios: [],
    requisitos: {
      roleta:
        'Ao ativar a técnica, o usuário recebe aleatoriamente 1 Caminho Mundano que permanece até o fim da cena.',
      primeiroUso:
        'Na primeira roleta da cena, o usuário pode excluir 1 caminho indesejado e duplicar 1 caminho desejado na roleta.',
      novoGiro:
        'Para roletar novamente, precisa esperar ao menos 1 rodada e pagar 2 EA e 2 PE.',
      trocaDeCaminho:
        'Sempre remove o caminho atualmente ativo antes do novo giro, podendo reintroduzir caminhos removidos ao alterar a duplicação.',
      estadoAtual:
        'Atualização atual contempla Belianorr, Indivar, Saadnar, Grandier, Moxtar e Vazark.',
    },
    habilidades: [
      {
        codigo: 'INATA_SETE_CAMINHOS_ROLETA',
        nome: 'Roleta dos Caminhos',
        descricao:
          'Gira a roleta amaldiçoada e define qual Caminho Mundano ficará ativo na cena.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Cena',
        custoEA: 1,
        custoPE: 1,
        efeito:
          'Ativa aleatoriamente 1 Caminho Mundano. O primeiro giro da cena pode excluir 1 caminho e duplicar outro. Para girar novamente, aguarde 1 rodada e pague 2 EA e 2 PE, removendo obrigatoriamente o caminho atual da roleta.',
        ordem: 10,
        variacoes: [
          {
            nome: 'Belianorr (Preguiça)',
            descricao:
              'Correntes amaldiçoadas revestem o corpo do usuário e drenam a determinação do alvo.',
            efeitoAdicional:
              'Personalidade: sonolento e sem determinação. Correntes: espaço 1, 1d8 x2 de impacto contra alvos comuns e exorciza maldições. Concede +2 em testes para derrubar e desarmar enquanto este Caminho estiver ativo.',
            requisitos: { caminhoAtivo: 'BELIANORR' },
            ordem: 10,
          },
          {
            nome: 'Indivar (Inveja)',
            descricao:
              'Um terceiro olho se abre e busca apropriar-se de aspectos admiráveis de outras criaturas.',
            efeitoAdicional:
              'Desejo de Indivar: rouba fragmentos da identidade amaldiçoada em vez de copiar técnicas. Olhar de Indivar: percebe instintivamente o aspecto mais admirável de cada alvo observado.',
            requisitos: { caminhoAtivo: 'INDIVAR' },
            ordem: 20,
          },
          {
            nome: 'Saadnar (Gula)',
            descricao:
              'Seis orbes negros orbitam o usuário e representam a fome de devorar energia, condições e existência.',
            efeitoAdicional:
              'Ao entrar no Caminho, recebe 6 orbes. Sem orbes, o usuário sai de Saadnar. Orbes da Fome: 1d4 x2 de impacto e exorciza maldições.',
            requisitos: { caminhoAtivo: 'SAADNAR' },
            ordem: 30,
          },
          {
            nome: 'Grandier (Avareza)',
            descricao:
              'Uma algema dourada prende o usuário ao Crânio do Contador e impõe as leis da posse.',
            efeitoAdicional:
              'Crânio do Contador: cajado amaldiçoado feito de crânio humano e coluna vertebral, adornado com ouro e preso ao pulso esquerdo do usuário.',
            requisitos: { caminhoAtivo: 'GRANDIER' },
            ordem: 40,
          },
          {
            nome: 'Moxtar (Orgulho)',
            descricao:
              'Fragmentos do corpo divino de Moxtar descem sobre o usuário e alimentam sua arrogância.',
            efeitoAdicional:
              'Enquanto Moxtar estiver ativo, o usuário tende a recusar ajuda, ignorar conselhos e correr riscos para provar superioridade.',
            requisitos: { caminhoAtivo: 'MOXTAR' },
            ordem: 50,
          },
          {
            nome: 'Vazark (Raiva)',
            descricao:
              'O usuário é invadido pela mente livre e insana de Vazark, trocando razão por impulso destrutivo.',
            efeitoAdicional:
              'Patas de Vazark: espaço 2, 3d6 + Força de dano cortante, crítico 20 x3. Enquanto ativo, o usuário deve atacar um alvo em sua rodada sempre que possível.',
            requisitos: { caminhoAtivo: 'VAZARK' },
            ordem: 60,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_BELIANORR_CORRENTES',
        nome: 'Correntes de Belianorr',
        descricao:
          'Usa as correntes de Belianorr como arma amaldiçoada para ataque corpo a corpo.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo a corpo',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        testesExigidos: ['Luta'],
        dadosDano: [{ quantidade: 1, dado: 'd8', tipo: 'IMPACTO' }],
        criticoValor: 20,
        criticoMultiplicador: 2,
        efeito:
          'Requer Belianorr ativo. As correntes exorcizam maldições e concedem +2 em testes para derrubar e desarmar.',
        requisitos: { caminhoAtivo: 'BELIANORR' },
        ordem: 20,
      },
      {
        codigo: 'INATA_SETE_BELIANORR_PERTURBACAO',
        nome: 'Belianorr - Perturbação',
        descricao:
          'Cada golpe acertado com as correntes deixa uma Marca que sela a força de vontade do alvo.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo a corpo',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        resistencia: 'Vontade',
        custoEA: 1,
        efeito:
          'Cada golpe corpo a corpo que acertar com as correntes deixa 1 Marca na parte atingida. Cada Marca isolada não causa efeito por si só, mas pode ser ativada depois. O alvo pode gastar 1 ação padrão para fazer teste de Vontade e remover as Marcas.',
        requisitos: { caminhoAtivo: 'BELIANORR' },
        ordem: 30,
      },
      {
        codigo: 'INATA_SETE_BELIANORR_INEVITAVEL',
        nome: 'Belianorr - Inevitável',
        descricao:
          'Puxa até você um alvo marcado pelas correntes de Belianorr.',
        execucao: TipoExecucao.ACAO_MOVIMENTO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        resistencia: 'Fortitude anula',
        custoEA: 2,
        efeito:
          'Escolhe 1 ser que carregue ao menos 1 Marca e o puxa até você. Cada Marca no alvo concede +2 na DT desta habilidade.',
        requisitos: { caminhoAtivo: 'BELIANORR', marcasMinimas: 1 },
        ordem: 40,
      },
      {
        codigo: 'INATA_SETE_BELIANORR_ATIVAR_MARCAS',
        nome: 'Belianorr - Ativar Marcas',
        descricao:
          'Ativa as Marcas acumuladas para impor lentidão, fraqueza ou debilitação.',
        execucao: TipoExecucao.ACAO_MOVIMENTO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        resistencia: 'Fortitude',
        custoEA: 1,
        efeito:
          'Custa 1 EA por Marca ativada. 1 Marca: Fortitude DT de técnicas +4; falha deixa LENTO. 2 Marcas: Fortitude DT de técnicas +6; falha deixa LENTO e FRACO, sucesso deixa apenas LENTO. 3 Marcas: Fortitude DT de técnicas +8; falha deixa DEBILITADO, sucesso deixa FRACO.',
        requisitos: { caminhoAtivo: 'BELIANORR', consomeMarcas: true },
        ordem: 50,
      },
      {
        codigo: 'INATA_SETE_INDIVAR_APROPRIACAO',
        nome: 'Indivar - Apropriação Profana',
        descricao:
          'Copia ou rouba propriedades amaldiçoadas de um alvo observado.',
        execucao: TipoExecucao.ACAO_MOVIMENTO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Cena',
        resistencia: 'Vontade evita',
        custoEA: 2,
        custoPE: 2,
        efeito:
          'Escolha 1 propriedade do alvo: 1 bônus de perícia, 1 tipo de resistência, 1 tipo de dano, 1 valor de atributo ou 1 grau de aprimoramento conhecido. Vontade evita a cópia.',
        requisitos: { caminhoAtivo: 'INDIVAR' },
        ordem: 60,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Copia mais propriedades do mesmo alvo.',
            substituiCustos: false,
            custoEA: 1,
            efeitoAdicional:
              'Consegue copiar 1 + grau de aprimoramento em Técnica Amaldiçoada propriedades do alvo.',
            ordem: 10,
          },
          {
            nome: 'Máxima',
            descricao: 'Rouba a propriedade em vez de apenas copiá-la.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 1,
            efeitoAdicional:
              'Rouba 1 única propriedade do alvo até o fim da cena, impedindo o alvo de usá-la enquanto durar o efeito.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_INDIVAR_EU_TAMBEM',
        nome: 'Indivar - Eu Também Consigo',
        descricao:
          'Refaz um teste após ver outra criatura ter sucesso em situação equivalente.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Visão do usuário',
        alvo: 'Você',
        duracao: 'Instantâneo',
        custoEA: 3,
        efeito:
          'Quando outra pessoa ou criatura realiza o mesmo teste que você na mesma rodada e obtém sucesso, você pode refazer o teste imediatamente. Não vale para testes contra, salvo pela variação Superior.',
        requisitos: { caminhoAtivo: 'INDIVAR' },
        ordem: 70,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Expande a apropriação para testes contra.',
            substituiCustos: false,
            custoEA: 1,
            custoPE: 1,
            efeitoAdicional: 'Também pode ser usada em testes contra.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_SAADNAR_ORBES',
        nome: 'Saadnar - Orbes da Fome',
        descricao: 'Dispara um orbe básico de Saadnar contra um alvo próximo.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        testesExigidos: ['Pontaria com Jujutsu'],
        dadosDano: [{ quantidade: 1, dado: 'd4', tipo: 'IMPACTO' }],
        criticoValor: 20,
        criticoMultiplicador: 2,
        efeito:
          'Requer Saadnar ativo e ao menos 1 orbe disponível. Os orbes exorcizam maldições.',
        requisitos: { caminhoAtivo: 'SAADNAR', recurso: 'ORBES' },
        ordem: 80,
      },
      {
        codigo: 'INATA_SETE_SAADNAR_CONSUMIR',
        nome: 'Saadnar - Consumir',
        descricao:
          'Sacrifica 1 orbe para absorver energia amaldiçoada de um ataque.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Instantâneo',
        custoEA: 3,
        custoPE: 2,
        efeito:
          'Gasta 1 orbe para transformar até 20 do dano recebido em RD contra aquele ataque. Pode acumular +5 RD por EA extra gasto, até o limite do seu grau em Técnica Amaldiçoada.',
        requisitos: { caminhoAtivo: 'SAADNAR', recurso: 'ORBES' },
        ordem: 90,
        variacoes: [
          {
            nome: 'Absorver Ambiente',
            descricao: 'Converte 1 orbe em vida temporária até o fim da cena.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_PADRAO,
            alcance: 'Pessoal',
            alvo: 'Você',
            duracao: 'Instantâneo',
            custoEA: 4,
            custoPE: 2,
            dadosDano: [
              { quantidade: 2, dado: 'd8', tipo: 'ENERGIA_AMALDICOADA' },
            ],
            efeitoAdicional:
              'Em vez de RD, recebe 2d8 de vida temporária até o fim da cena. Pode acumular +1d8 de vida temporária por EA extra gasto, até o limite do grau em Técnica Amaldiçoada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_SAADNAR_DEVORAR',
        nome: 'Saadnar - Devorar',
        descricao:
          'Dispara 1 ou mais orbes em direção a um alvo para causar dano.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        custoEA: 2,
        testesExigidos: ['Pontaria com Jujutsu'],
        dadosDano: [{ quantidade: 1, dado: 'd4', tipo: 'IMPACTO' }],
        criticoValor: 20,
        criticoMultiplicador: 2,
        efeito:
          'Controla 1 orbe e o dispara contra o alvo; o orbe some após atingir. Pode acumular orbes para cada +1 EA gasto adicional.',
        requisitos: { caminhoAtivo: 'SAADNAR', recurso: 'ORBES' },
        ordem: 100,
      },
      {
        codigo: 'INATA_SETE_SAADNAR_INGERIR',
        nome: 'Saadnar - Ingerir',
        descricao: 'Usa 1 orbe para consumir uma condição negativa de um alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        custoEA: 2,
        efeito:
          'Gasta 1 orbe para que ele viaje até o alvo e consuma 1 condição negativa, exceto MORRENDO, MACHUCADO, LOUCO ou ENLOUQUECENDO. Pode acumular orbes para cada +1 EA extra gasto.',
        requisitos: { caminhoAtivo: 'SAADNAR', recurso: 'ORBES' },
        ordem: 110,
      },
      {
        codigo: 'INATA_SETE_GRANDIER_POSSE',
        nome: 'Grandier - Posse',
        descricao:
          'Reafirma o direito absoluto do usuário sobre um item que empunha.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Instantâneo',
        custoEA: 2,
        custoPE: 1,
        efeito:
          'Escolha 1 item empunhado. Você fica imune à manobra desarmar com esse item e recebe +2 em testes ligados ao uso dele. Ex.: armas concedem +2 em Luta.',
        requisitos: { caminhoAtivo: 'GRANDIER' },
        ordem: 120,
        variacoes: [
          {
            nome: 'Superior',
            descricao:
              'Transforma a familiaridade com o item em superioridade técnica.',
            substituiCustos: false,
            custoEA: 1,
            efeitoAdicional:
              'Além dos efeitos base, recebe +1 dado em testes usando o item escolhido.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_GRANDIER_APEGO',
        nome: 'Grandier - Apego',
        descricao:
          'Materializa um objeto de avareza e força o alvo a mantê-lo nas mãos.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        resistencia: 'Vontade anula',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Materializa um objeto de avareza que ocupa as duas mãos do alvo e o obriga a mantê-lo por 1d2+1 rodadas.',
        requisitos: { caminhoAtivo: 'GRANDIER' },
        ordem: 130,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Faz o alvo apegar-se ao objeto por ainda mais tempo.',
            substituiCustos: false,
            efeitoAdicional:
              'Some o valor do Grau de Aprimoramento em Técnica Amaldiçoada ao número de rodadas do efeito.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_GRANDIER_CIRCULO',
        nome: 'Grandier - Círculo do Penhor',
        descricao:
          'Crava o cajado no solo e transforma a área em uma penhora amaldiçoada.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: 'Aliados e inimigos na área',
        duracao: 'Sustentado',
        resistencia: 'Vontade anula (apenas inimigos)',
        custoEA: 3,
        custoPE: 2,
        custoSustentacaoEA: 1,
        efeito:
          'Requer Grau de Aprimoramento em Técnica de Barreira 1. Enquanto sustentar, o usuário não pode sair do ponto inicial. Aliados reduzem em 1 EA o custo de técnicas amaldiçoadas (mínimo 1). Inimigos ficam ALQUEBRADOS.',
        requisitos: {
          caminhoAtivo: 'GRANDIER',
          grauMinimo: { codigo: 'TECNICA_BARREIRA', valor: 1 },
        },
        ordem: 140,
      },
      {
        codigo: 'INATA_SETE_MOXTAR_PARTES',
        nome: 'Moxtar - Partes do Divino',
        descricao: 'Recebe partes sagradas e grotescas do corpo de Moxtar.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 3,
        custoPE: 2,
        custoSustentacaoEA: 1,
        efeito:
          'Escolha 1 parte de Moxtar para manifestar até o fim da cena: Auréola de Carne, Asas de Carne ou Cauda de Moxtar. Esta habilidade pode ser usada novamente até que todas as partes tenham sido manifestadas.',
        requisitos: { caminhoAtivo: 'MOXTAR' },
        ordem: 150,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Sustenta duas partes simultaneamente.',
            substituiCustos: false,
            custoEA: 2,
            efeitoAdicional:
              'Pode manter até 2 partes de Moxtar ativas ao mesmo tempo.',
            ordem: 10,
          },
          {
            nome: 'Máxima',
            descricao: 'Manifesta as três partes do divino de uma só vez.',
            substituiCustos: false,
            custoEA: 5,
            efeitoAdicional: 'Ativa as três partes instantaneamente.',
            ordem: 20,
          },
        ],
      },
      {
        codigo: 'INATA_SETE_MOXTAR_AUREOLA',
        nome: 'Moxtar - Auréola de Carne',
        descricao:
          'Desafia o alvo em uma prova escolhida por ele e converte a vitória em submissão ou devoção.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        resistencia: 'Varia',
        custoEA: 2,
        custoPE: 1,
        efeito:
          'Requer a parte Auréola de Carne ativa. O alvo escolhe a atividade ou desafio. Se vencer, escolha 1 benefício: Devoção Roubada (2d6 PE e EA temporários enquanto sustentar a parte), Orgulho Quebrado (+2 contra o alvo e você vai para frente dele na iniciativa) ou Convicção Superior (alvo fica CAÍDO, perde a próxima ação de movimento e sofre -2 contra você enquanto sustentar a parte).',
        requisitos: { caminhoAtivo: 'MOXTAR', parteAtiva: 'AUREOLA_DE_CARNE' },
        ordem: 160,
      },
      {
        codigo: 'INATA_SETE_MOXTAR_ASAS',
        nome: 'Moxtar - Asas de Carne',
        descricao:
          'As asas deformadas de Moxtar defendem o usuário e sustentam seu voo.',
        execucao: TipoExecucao.REACAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Instantâneo',
        custoPE: 2,
        efeito:
          'Requer a parte Asas de Carne ativa. Enquanto a parte estiver ativa, você recebe deslocamento de voo. As asas têm 30 PV e 5 RD. Ao usar esta habilidade, recebe RD 10 contra o ataque, mas o dano absorvido é transferido para as asas sem aplicar essa RD a elas.',
        requisitos: { caminhoAtivo: 'MOXTAR', parteAtiva: 'ASAS_DE_CARNE' },
        ordem: 170,
      },
      {
        codigo: 'INATA_SETE_MOXTAR_CAUDA',
        nome: 'Moxtar - Cauda de Moxtar',
        descricao:
          'Usa a cauda divina para golpear em conjunto com o ataque principal.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo a corpo',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        custoPE: 2,
        testesExigidos: ['Luta'],
        dadosDano: [{ quantidade: 1, dado: 'd6', tipo: 'IMPACTO' }],
        criticoValor: 20,
        criticoMultiplicador: 2,
        efeito:
          'Requer a parte Cauda de Moxtar ativa. A cauda funciona como mão extra, concede +4 em manobras de combate e +2 em Acrobacia. Ao usar a habilidade, o golpe causa 1d6 + Força de dano de impacto e pode receber revestimento de energia amaldiçoada.',
        requisitos: { caminhoAtivo: 'MOXTAR', parteAtiva: 'CAUDA_DE_MOXTAR' },
        ordem: 180,
      },
      {
        codigo: 'INATA_SETE_VAZARK_PATAS',
        nome: 'Vazark - Patas da Besta',
        descricao:
          'As enormes manoplas de carne viva de Vazark dilaceram o alvo em combate direto.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Corpo a corpo',
        alvo: '1 ser',
        duracao: 'Instantâneo',
        testesExigidos: ['Luta'],
        dadosDano: [{ quantidade: 3, dado: 'd6', tipo: 'CORTANTE' }],
        criticoValor: 20,
        criticoMultiplicador: 3,
        efeito:
          'Requer Vazark ativo. As patas ocupam espaço 2 e substituem as mãos enquanto este Caminho estiver ativo.',
        requisitos: { caminhoAtivo: 'VAZARK' },
        ordem: 190,
      },
      {
        codigo: 'INATA_SETE_VAZARK_VINCULO',
        nome: 'Vazark - Vínculo da Besta',
        descricao: 'Abraça a ferocidade de Vazark para lutar sem contenção.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Pessoal',
        alvo: 'Você',
        duracao: 'Sustentado',
        custoEA: 2,
        custoPE: 1,
        custoSustentacaoEA: 1,
        efeito:
          'Enquanto ativo, recebe +2 em ataques corpo a corpo, +2 em rolagens de dano corpo a corpo e resistência 5 contra Balístico, Corte, Impacto e Perfuração.',
        requisitos: { caminhoAtivo: 'VAZARK' },
        ordem: 200,
      },
      {
        codigo: 'INATA_SETE_VAZARK_RUGIDO',
        nome: 'Vazark - Rugido de Vazark',
        descricao:
          'Libera um rugido que inflama a raiva de todos que o escutam.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Médio',
        alvo: 'Seres ao alcance',
        duracao: '1d3 rodadas',
        resistencia: 'Vontade anula',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Quem falhar recebe +5 em testes de Luta e Pontaria, mas sofre -5 na Defesa enquanto durar o efeito.',
        requisitos: { caminhoAtivo: 'VAZARK' },
        ordem: 210,
      },
      {
        codigo: 'INATA_SETE_VAZARK_DESAFIO',
        nome: 'Vazark - Desafio Bestial',
        descricao:
          'Instiga 1 alvo a entrar num confronto direto e brutal com você.',
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: '1d3 rodadas',
        resistencia: 'Vontade',
        custoEA: 3,
        custoPE: 1,
        efeito:
          'Você e o alvo devem usar tudo que têm para entrar em alcance corpo a corpo e se atacar mutuamente. A única reação especial permitida entre vocês é Contra-ataque. Ambos recebem +1 dado de dano e +5 nos testes de ataque um contra o outro, inclusive no primeiro ataque.',
        requisitos: { caminhoAtivo: 'VAZARK' },
        ordem: 220,
      },
    ],
  },
  {
    codigo: 'SURTO_TEMPORAL',
    nome: 'Surto Temporal',
    descricao:
      'Manipulação limitada do tempo por revestimento, lapso temporal, reversão e fixação de eventos.',
    hereditaria: true,
    clasHereditarios: ['Ram'],
    habilidades:
      SURTO_TEMPORAL_HABILIDADES as unknown as SeedHabilidadeTecnicaInata[],
  },
  {
    codigo: 'NEVOA_LILAS',
    nome: 'Técnica da Névoa Lilás',
    descricao: 'Névoa que causa confusão e dano.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'CLONAGEM',
    nome: 'Técnica de Clonagem',
    descricao: 'Cria clones temporários.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'APOSTADOR_NATO',
    nome: 'Técnica do Apostador Nato',
    descricao: 'Habilidades baseadas em sorte e apostas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRANSFERENCIA_ESPACIAL',
    nome: 'Transferência Espacial',
    descricao: 'Teletransporte de curta distância.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRIBUNAL_JULGAMENTO',
    nome: 'Tribunal de Julgamento',
    descricao:
      'Técnica inata que manifesta ferramentas judiciais, Judgeman, barreiras restritivas, contratos e sentenças.',
    hereditaria: false,
    clasHereditarios: [],
    habilidades:
      TRIBUNAL_JULGAMENTO_HABILIDADES as unknown as SeedHabilidadeTecnicaInata[],
  },
  {
    codigo: 'BOOGIE_WOOGIE',
    nome: 'Troca: Boogie Woogie',
    descricao: 'Troca posições de dois alvos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_IMAGENS',
    nome: 'Manipulacao de Imagens',
    descricao:
      'O usuario impoe conceitos visuais a realidade por meio de representacoes artisticas.',
    hereditaria: false,
    clasHereditarios: [],
    requisitos: {
      funcionamento:
        'O conceito visual imposto se manifesta como fenomeno real feito de Energia Amaldicoada.',
      longevidade:
        'Se a obra for destruida, severamente danificada ou dissipada, os efeitos terminam.',
      materiais:
        'Cada obra exige materia-prima infundida com Energia Amaldicoada. Cada cena usa 1/2 material.',
      execucaoArtistica: {
        obraRapida: {
          execucao: 'Acao padrao',
          material: 'Material rapido (categoria 0, peso 1)',
        },
        obraElaborada: {
          execucao: 'Acao completa ou maior',
          material: 'Material elaborado (categoria 4, peso 1)',
        },
      },
      proficienciaArtistica:
        'Teste conjunto de Artes: DT 10 + custo de PE/EA da tecnica. Se for Obra Elaborada, +2 na DT. Falha: +1 PE de custo ou -1d4 SAN.',
    },
    habilidades: [
      {
        codigo: 'INATA_IMAGENS_INFUSAO',
        nome: 'Infusao',
        descricao:
          'Prepara materiais para uso artistico, infundindo-os com energia amaldicoada.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alvo: 'Objeto ou conjunto de objetos',
        duracao: '2 cenas',
        custoEA: 1,
        efeito:
          'Transforma os materiais em MATERIAL RAPIDO ou MATERIAL ELABORADO ate dissipar.',
        ordem: 10,
      },
      {
        codigo: 'INATA_IMAGENS_IMPROVISAR',
        nome: 'Improvisar',
        descricao:
          'Ritualiza materiais improvisados do ambiente para uso artistico.',
        execucao: TipoExecucao.ACAO_COMPLETA,
        alvo: 'Objeto ou conjunto de objetos',
        duracao: '2 cenas',
        custoEA: 2,
        efeito:
          'Permite improvisar material com terra, carvao, sangue e similares em MATERIAL RAPIDO ou ELABORADO.',
        ordem: 20,
      },
      {
        codigo: 'INATA_IMAGENS_CORRENTES_ILUSTRADAS',
        nome: 'Traco Impositivo: Correntes Ilustradas',
        descricao:
          'Correntes, fios ou lacos desenhados se projetam para conter o alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos evita',
        custoEA: 2,
        efeito: 'O alvo fica ENREDADO por 1 rodada.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          opcoes: ['+1 rodada de duracao', '+2 na DT'],
          porAcumulo: '+1 EA',
        },
        ordem: 30,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao:
              'Versao ampla com correntes detalhadas emergindo do ambiente.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            area: AreaEfeito.ESFERA,
            alvo: 'Seres na area',
            duracao: 'Instantaneo',
            resistencia: 'Reflexos',
            custoEA: 4,
            efeitoAdicional:
              'Falha: AGARRADO por 2 rodadas. Sucesso: ENREDADO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_OLHAR_PINTADO',
        nome: 'Traco Impositivo: Olhar Pintado',
        descricao:
          'Olhos e simbolos de observacao encarando o alvo e quebrando sua leitura de combate.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: '1 rodada',
        resistencia: 'Vontade',
        custoEA: 2,
        efeito: 'O alvo fica DESPREVENIDO e sofre -1d20 em Percepcao.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          opcoes: ['+1 rodada de duracao', '+2 na DT'],
          porAcumulo: '+1 EA',
        },
        ordem: 40,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Versao em area com multiplos olhos pintados.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            area: AreaEfeito.ESFERA,
            alvo: 'Seres na area',
            duracao: '2 rodadas',
            resistencia: 'Vontade',
            custoEA: 4,
            efeitoAdicional:
              'Falha: OFUSCADO e DESPREVENIDO por 2 rodadas. Sucesso: OFUSCADO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_RACHADURA_CONCEITUAL',
        nome: 'Traco Impositivo: Rachadura Conceitual',
        descricao:
          'Rachaduras visuais alteram o ambiente e tornam a movimentacao hostil.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Curto',
        alvo: 'Area',
        duracao: 'Ate o fim da cena',
        custoEA: 2,
        efeito:
          'Linha de 3 quadrados vira TERRENO DIFICIL. Quem comeca turno na area sofre -1d20 em Reflexos ate o fim do turno.',
        ordem: 50,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Rasga a realidade em grande area sustentada.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            area: AreaEfeito.ESFERA,
            alvo: 'Seres na area',
            duracao: 'Sustentado',
            custoEA: 4,
            custoPE: 1,
            custoSustentacaoEA: 1,
            efeitoAdicional:
              'Area vira TERRENO DIFICIL e aplica -2 Defesa. Se permanecer 2 turnos consecutivos, fica FRACO por 1d3 rodadas ao sair.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_CALAR',
        nome: 'Traco Impositivo: Calar',
        descricao: 'Costuras e selos visuais bloqueiam a fala e foco do alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude anula',
        custoEA: 3,
        efeito: 'O alvo fica SILENCIADO por 1 rodada.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          opcoes: ['+1 rodada de duracao', '+2 na DT'],
          porAcumulo: '+1 EA',
        },
        ordem: 60,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Selamento refinado para ate 3 alvos.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            alvo: 'Ate 3 seres',
            duracao: 'Instantaneo',
            resistencia: 'Fortitude parcial',
            custoEA: 5,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
            escalonamentoEfeito: {
              opcoes: ['+1 rodada de duracao', '+2 na DT'],
              porAcumulo: '+1 EA',
            },
            efeitoAdicional:
              'Falha: SILENCIADO e FRUSTRADO por 1 rodada. Sucesso: apenas SILENCIADO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_CHAMAS_PINTADAS',
        nome: 'Traco Impositivo: Chamas Pintadas',
        descricao: 'Pinceladas de combustao se espalham violentamente.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Reflexos reduz metade',
        custoEA: 3,
        efeito:
          'Causa 2d6 de dano de fogo. Falha na resistencia deixa EM CHAMAS.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          opcoes: ['+1d6 de dano', '+1 rodada de duracao', '+2 na DT'],
          porAcumulo: '+1 EA',
        },
        ordem: 70,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Composicao de fogo em grande area.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            area: AreaEfeito.ESFERA,
            alvo: 'Seres na area',
            duracao: 'Instantaneo',
            resistencia: 'Reflexos reduz metade',
            custoEA: 5,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              porAcumulo: '+2d6 de dano por +2 EA',
            },
            efeitoAdicional:
              'Causa 4d6 de dano de fogo. Falha deixa EM CHAMAS e OFUSCADO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_MARE_ILUSTRADA',
        nome: 'Traco Impositivo: Mare Ilustrada',
        descricao: 'Massas de agua ilustradas colidem contra os alvos.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Curto',
        alvo: 'Area (linha de 3 quadrados)',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude',
        custoEA: 3,
        efeito: 'Causa 2d6 de dano de impacto. Falha deixa CAIDO.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano por +1 EA',
        },
        ordem: 80,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Cone amplo de agua em choque.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            area: AreaEfeito.CONE,
            alcance: 'Medio',
            alvo: 'Seres no cone de 6m',
            duracao: 'Instantaneo',
            resistencia: 'Fortitude reduz metade',
            custoEA: 5,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              porAcumulo: '+2d6 de dano por +2 EA',
            },
            efeitoAdicional:
              'Causa 4d6 de impacto. Falha deixa CAIDO e ENREDADO por 1 rodada.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_LAMINAS_VENTO',
        nome: 'Traco Impositivo: Laminas do Vento',
        descricao: 'Pinceladas cortantes riscam o ar e abrem cortes profundos.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude reduz metade',
        custoEA: 3,
        efeito: 'Causa 2d6 de dano cortante. Falha deixa SANGRANDO.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano por +1 EA',
        },
        ordem: 90,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Cortes visuais atravessam uma linha de area.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            area: AreaEfeito.LINHA,
            alcance: '12m',
            alvo: 'Seres na linha de 3 quadrados',
            duracao: 'Instantaneo',
            resistencia: 'Reflexos reduz metade',
            custoEA: 5,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              porAcumulo: '+2d6 de dano por +2 EA',
            },
            efeitoAdicional:
              'Causa 4d6 de dano cortante. Falha deixa SANGRANDO.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_ESPINHOS_SUPRESSAO',
        nome: 'Traco Impositivo: Formacoes Litograficas - Espinhos de Supressao',
        descricao:
          'Formacoes rochosas surgem para perfurar e se desfazer em seguida.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude',
        custoEA: 4,
        custoPE: 1,
        efeito:
          'Causa 3d6 de dano perfurante. Falha recebe +1d6 adicional. Nao altera terreno apos o impacto.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d6 de dano por +1 EA',
        },
        ordem: 100,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Sequencia ampla de estalactites e estalagmites.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            area: AreaEfeito.ESFERA,
            alvo: 'Seres na area',
            duracao: 'Instantaneo',
            resistencia: 'Fortitude reduz metade',
            custoEA: 6,
            custoPE: 2,
            efeitoAdicional:
              'Causa 5d6 de dano perfurante. Falha deixa SANGRANDO. Alvos LENTOS ou IMOBILIZADOS sofrem +1d6.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_ARQUITETURA_IMPOSITIVA',
        nome: 'Traco Impositivo: Formacoes Litograficas - Arquitetura Impositiva',
        descricao:
          'Formacoes rochosas para isolar espacos, criar cobertura e controlar terreno.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: 'Area (2 quadrados adjacentes)',
        duracao: 'Cena',
        custoEA: 3,
        efeito:
          'Cria cobertura leve ou bloqueia espaco como terreno dificil. Cada quadrado da formacao possui 30 PV e RD 5.',
        ordem: 110,
        variacoes: [
          {
            nome: 'Obra Elaborada',
            descricao: 'Composicao arquitetonica de multiplas formacoes.',
            substituiCustos: true,
            execucao: TipoExecucao.ACAO_COMPLETA,
            alcance: 'Medio',
            alvo: 'Ate 3 formacoes de 2 quadrados',
            duracao: 'Cena',
            custoEA: 6,
            custoPE: 1,
            efeitoAdicional:
              'Pode misturar parede de cobertura total, coluna/estalagmite de cobertura leve e barreira baixa de terreno dificil. Cada quadrado: 30 PV e RD 5.',
            ordem: 10,
          },
        ],
      },
      {
        codigo: 'INATA_IMAGENS_MAGNUM_OPUS',
        nome: 'Tecnica Maxima: Magnum Opus',
        descricao:
          'Declaracao estetica definitiva do artista, impondo multiplos conceitos visuais a realidade.',
        execucao: TipoExecucao.RITUAL_ETAPAS,
        alcance: 'Medio',
        area: AreaEfeito.ESFERA,
        alvo: 'Seres na area',
        duracao: 'Variavel',
        resistencia: 'Variavel',
        custoEA: 8,
        custoPE: 2,
        efeito:
          'Escolha 2 efeitos-base (Devastacao Elemental, Supressao Total, Dominio Visual) e ate quantidade de modificadores igual ao grau em Tecnica Amaldicoada. Cada modificador adicional custa +1 EA.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.REGRAS,
        escalonamentoEfeito: {
          efeitosBase: [
            'Devastacao Elemental: 6 + 6d6 elemental (Reflexos metade)',
            'Supressao Total: DEBILITADO + DESPREVENIDO por 1d4 rodadas (Reflexos reduz para FRACO + VULNERAVEL)',
            'Dominio Visual: TERRENO DIFICIL e -2 Defesa por 1d4 rodadas (Fortitude evita)',
          ],
          modificadores: [
            'Torrente elemental (+2 dados de dano)',
            'Area ampliada (+6m)',
            'Persistente (+1 rodada)',
            'Implacavel (Dominio Visual apenas reduz metade)',
            'Assinatura Artistica (+3 DT)',
            'Condicional (adiciona FRACO/OFUSCADO/LENTO pela mesma duracao)',
          ],
          posUso:
            'Fica FATIGADO ate o proximo descanso. Se usar novamente na mesma cena, fica EXAUSTO ate o fim do dia.',
        },
        ordem: 120,
      },
    ],
  },
  {
    codigo: 'RAZAO_7_3',
    nome: 'Tecnica de Razao 7:3',
    descricao:
      'Divide o alvo em dez linhas e cria ponto fraco forcado na proporcao 7:3.',
    hereditaria: false,
    clasHereditarios: [],
    requisitos: {
      observacao:
        'As linhas nao precisam corresponder ao comprimento real do alvo e podem ser aplicadas em seres e objetos.',
    },
    habilidades: [
      {
        codigo: 'INATA_PROPORCAO_RAZAO_FORCADA',
        nome: 'Razao Forcada',
        descricao: 'Marca um ponto fraco no alvo na proporcao 7:3.',
        execucao: TipoExecucao.ACAO_LIVRE,
        alcance: 'Visao do usuario (alcance curto)',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        custoEA: 1,
        efeito:
          'Aumenta a margem de ameaca do seu ataque em +1 contra o alvo marcado.',
        ordem: 10,
        variacoes: [
          {
            nome: 'Variacao - Objeto',
            descricao: 'Aplica a marcacao em objeto, com margem de ameaca +2.',
            substituiCustos: true,
            alvo: '1 objeto',
            ordem: 10,
          },
          {
            nome: 'Superior',
            descricao: 'Cria pontos fracos mais faceis de acertar.',
            substituiCustos: false,
            custoEA: 1,
            custoPE: 1,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoCustoPE: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
            escalonamentoEfeito: {
              porAcumulo: '+1 margem de ameaca e +3 dano',
            },
            efeitoAdicional:
              'Acumula conforme grau de aprimoramento em Tecnica Amaldicoada.',
            ordem: 20,
          },
          {
            nome: 'Maxima',
            descricao:
              'Eleva o potencial da marca para aumento de margem e passo de dano.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoCustoPE: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
            escalonamentoEfeito: {
              porAcumulo: '+1 margem de ameaca e +1 passo de dano',
            },
            efeitoAdicional:
              'Acumula conforme grau de aprimoramento em Tecnica Amaldicoada.',
            ordem: 30,
          },
        ],
      },
      {
        codigo: 'INATA_PROPORCAO_GOLPE_PRECISO',
        nome: 'Golpe Preciso',
        descricao:
          'Ataca alvo marcado por Razao Forcada de forma concentrada no ponto 7:3.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Alcance do ataque',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        custoPE: 1,
        efeito:
          'Permite aproveitar os bonus de critico da Razao Forcada no golpe.',
        ordem: 20,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Aprimora a precisao ofensiva.',
            substituiCustos: false,
            custoEA: 1,
            custoPE: 1,
            efeitoAdicional:
              'Concede +5 no ataque. Acumula com grau de aprimoramento em Tecnica Amaldicoada.',
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao: 'Adiciona dano extra progressivo ao golpe preciso.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 2,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 2,
            escalonamentoCustoPE: 2,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              porAcumulo: '+1 dado de dano',
            },
            efeitoAdicional: 'Inclui efeitos da variacao Superior.',
            ordem: 20,
          },
        ],
      },
    ],
  },
];

function mapHabilidadeDataInata(
  tecnicaId: number,
  habilidade: SeedHabilidadeTecnicaInata,
) {
  const duracaoCorrigida =
    corrigirMojibakeSeedTexto(habilidade.duracao) ?? null;
  const custosSustentacao = resolverCustoSustentacaoPadrao(
    duracaoCorrigida,
    habilidade.custoSustentacaoEA,
    habilidade.custoSustentacaoPE,
  );
  return {
    tecnicaId,
    codigo: habilidade.codigo,
    nome: corrigirMojibakeSeedTexto(habilidade.nome) ?? habilidade.nome,
    descricao:
      corrigirMojibakeSeedTexto(habilidade.descricao) ?? habilidade.descricao,
    requisitos: jsonOrNull(corrigirMojibakeSeedJson(habilidade.requisitos)),
    execucao: habilidade.execucao,
    area: habilidade.area ?? null,
    alcance: corrigirMojibakeSeedTexto(habilidade.alcance) ?? null,
    alvo: corrigirMojibakeSeedTexto(habilidade.alvo) ?? null,
    duracao: duracaoCorrigida,
    resistencia: corrigirMojibakeSeedTexto(habilidade.resistencia) ?? null,
    dtResistencia: corrigirMojibakeSeedTexto(habilidade.dtResistencia) ?? null,
    custoPE: habilidade.custoPE ?? 0,
    custoEA: habilidade.custoEA ?? 0,
    custoSustentacaoEA: custosSustentacao.custoSustentacaoEA,
    custoSustentacaoPE: custosSustentacao.custoSustentacaoPE,
    testesExigidos: jsonOrNull(
      corrigirMojibakeSeedJson(habilidade.testesExigidos),
    ),
    efeito: corrigirMojibakeSeedTexto(habilidade.efeito) ?? habilidade.efeito,
    escalonaPorGrau: habilidade.escalonaPorGrau ?? false,
    grauTipoGrauCodigo: habilidade.grauTipoGrauCodigo ?? null,
    escalonamentoCustoEA: habilidade.escalonamentoCustoEA ?? 0,
    escalonamentoCustoPE: habilidade.escalonamentoCustoPE ?? 0,
    escalonamentoTipo: habilidade.escalonamentoTipo ?? 'OUTRO',
    escalonamentoEfeito: jsonOrNull(
      corrigirMojibakeSeedJson(
        habilidade.escalonamentoEfeito ?? habilidade.escalonamentoDano ?? null,
      ),
    ),
    escalonamentoDano: jsonOrNull(
      corrigirMojibakeSeedJson(habilidade.escalonamentoDano),
    ),
    dadosDano: jsonOrNull(corrigirMojibakeSeedJson(habilidade.dadosDano)),
    danoFlat: habilidade.danoFlat ?? null,
    danoFlatTipo: habilidade.danoFlatTipo ?? null,
    criticoValor: habilidade.criticoValor ?? null,
    criticoMultiplicador: habilidade.criticoMultiplicador ?? null,
    ordem: habilidade.ordem,
  };
}

function mapVariacaoDataInata(
  habilidadeTecnicaId: number,
  variacao: SeedVariacaoTecnicaInata,
) {
  const duracaoCorrigida = corrigirMojibakeSeedTexto(variacao.duracao) ?? null;
  const custosSustentacao = resolverCustoSustentacaoPadrao(
    duracaoCorrigida,
    variacao.custoSustentacaoEA,
    variacao.custoSustentacaoPE,
  );
  return {
    habilidadeTecnicaId,
    nome: corrigirMojibakeSeedTexto(variacao.nome) ?? variacao.nome,
    descricao:
      corrigirMojibakeSeedTexto(variacao.descricao) ?? variacao.descricao,
    substituiCustos: variacao.substituiCustos ?? false,
    custoPE: variacao.custoPE ?? null,
    custoEA: variacao.custoEA ?? null,
    custoSustentacaoEA: custosSustentacao.custoSustentacaoEA,
    custoSustentacaoPE: custosSustentacao.custoSustentacaoPE,
    execucao: variacao.execucao ?? null,
    area: variacao.area ?? null,
    alcance: corrigirMojibakeSeedTexto(variacao.alcance) ?? null,
    alvo: corrigirMojibakeSeedTexto(variacao.alvo) ?? null,
    duracao: duracaoCorrigida,
    resistencia: corrigirMojibakeSeedTexto(variacao.resistencia) ?? null,
    dtResistencia: corrigirMojibakeSeedTexto(variacao.dtResistencia) ?? null,
    escalonaPorGrau: variacao.escalonaPorGrau ?? null,
    escalonamentoCustoEA: variacao.escalonamentoCustoEA ?? null,
    escalonamentoCustoPE: variacao.escalonamentoCustoPE ?? null,
    escalonamentoTipo: variacao.escalonamentoTipo ?? null,
    escalonamentoEfeito: jsonOrNull(
      corrigirMojibakeSeedJson(variacao.escalonamentoEfeito),
    ),
    escalonamentoDano: jsonOrNull(
      corrigirMojibakeSeedJson(variacao.escalonamentoDano),
    ),
    dadosDano: jsonOrNull(corrigirMojibakeSeedJson(variacao.dadosDano)),
    danoFlat: variacao.danoFlat ?? null,
    danoFlatTipo: variacao.danoFlatTipo ?? null,
    criticoValor: variacao.criticoValor ?? null,
    criticoMultiplicador: variacao.criticoMultiplicador ?? null,
    efeitoAdicional:
      corrigirMojibakeSeedTexto(variacao.efeitoAdicional) ?? null,
    requisitos: jsonOrNull(corrigirMojibakeSeedJson(variacao.requisitos)),
    ordem: variacao.ordem,
  };
}

async function seedVariacoesDaHabilidadeInata(
  prisma: PrismaClient,
  habilidadeId: number,
  variacoes: SeedVariacaoTecnicaInata[],
) {
  const nomes = variacoes.map(
    (variacao) => corrigirMojibakeSeedTexto(variacao.nome) ?? variacao.nome,
  );
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
    const nomeVariacao =
      corrigirMojibakeSeedTexto(variacao.nome) ?? variacao.nome;
    const existente = await prisma.variacaoHabilidade.findFirst({
      where: {
        habilidadeTecnicaId: habilidadeId,
        nome: nomeVariacao,
      },
      select: { id: true },
    });

    const data = mapVariacaoDataInata(habilidadeId, variacao);

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

async function seedHabilidadesDaTecnicaInata(
  prisma: PrismaClient,
  tecnicaId: number,
  habilidades: SeedHabilidadeTecnicaInata[],
) {
  const codigos = habilidades.map((habilidade) => habilidade.codigo);

  await prisma.habilidadeTecnica.deleteMany({
    where: {
      tecnicaId,
      codigo: { notIn: codigos },
    },
  });

  for (const habilidade of habilidades) {
    const data = mapHabilidadeDataInata(tecnicaId, habilidade);

    const habilidadeDb = await prisma.habilidadeTecnica.upsert({
      where: { codigo: habilidade.codigo },
      update: data,
      create: data,
      select: { id: true },
    });

    await seedVariacoesDaHabilidadeInata(
      prisma,
      habilidadeDb.id,
      habilidade.variacoes ?? [],
    );
  }
}

export async function seedTecnicasInatas(prisma: PrismaClient) {
  console.log('Cadastrando técnicas amaldiçoadas inatas...');

  const get = createLookupCache(prisma);

  for (const tec of tecnicasInatasSeed) {
    // 1) Cria/atualiza a técnica
    const tecnicaData = {
      codigo: tec.codigo,
      nome: corrigirMojibakeSeedTexto(tec.nome) ?? tec.nome,
      descricao:
        corrigirMojibakeSeedTexto(tec.descricao) ?? 'Tecnica Amaldicoada Inata',
      tipo: TipoTecnicaAmaldicoada.INATA,
      hereditaria: tec.hereditaria,
      linkExterno: tec.linkExterno ?? null,
      requisitos: jsonOrNull(corrigirMojibakeSeedJson(tec.requisitos)),

      // Mantem compatibilidade com codigos antigos sem trocar o id da tecnica.
      fonte: TipoFonte.SISTEMA_BASE,
      suplementoId: null,
    };

    const tecnicaExistente = await prisma.tecnicaAmaldicoada.findFirst({
      where: {
        codigo: { in: [tec.codigo, ...(tec.codigosLegados ?? [])] },
      },
      select: { id: true },
    });

    const tecnica = tecnicaExistente
      ? await prisma.tecnicaAmaldicoada.update({
          where: { id: tecnicaExistente.id },
          data: tecnicaData,
          select: { id: true, hereditaria: true, nome: true },
        })
      : await prisma.tecnicaAmaldicoada.create({
          data: tecnicaData,
          select: { id: true, hereditaria: true, nome: true },
        });

    console.log(
      `  ✅ ${tecnica.nome} (${tec.hereditaria ? 'Hereditária' : 'Não Hereditária'})`,
    );

    if (Array.isArray(tec.habilidades)) {
      await seedHabilidadesDaTecnicaInata(prisma, tecnica.id, tec.habilidades);
      console.log(`    ✨ Habilidades inatas: ${tec.habilidades.length}`);
    }

    // 2) Vínculo com clãs (somente se for hereditária)
    if (tecnica.hereditaria && tec.clasHereditarios.length > 0) {
      for (const claNome of tec.clasHereditarios) {
        const claId = await get.claId(claNome);

        await prisma.tecnicaCla.upsert({
          where: {
            tecnicaId_claId: { tecnicaId: tecnica.id, claId },
          },
          update: {},
          create: { tecnicaId: tecnica.id, claId },
        });

        console.log(`    Vinculada ao clã: ${claNome}`);
      }
    }
  }

  console.log(`✅ ${tecnicasInatasSeed.length} técnicas inatas cadastradas!\n`);
}
