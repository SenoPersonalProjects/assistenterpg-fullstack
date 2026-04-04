// prisma/seed/tecnicas/tecnicas-inatas.ts

import type { Prisma, PrismaClient } from '@prisma/client';
import {
  AreaEfeito,
  TipoEscalonamentoHabilidade,
  TipoExecucao,
  TipoFonte,
  TipoTecnicaAmaldicoada,
} from '@prisma/client';
import type { SeedTecnicaInata } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

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
  variacoes?: SeedVariacaoTecnicaInata[];
  ordem: number;
};

type SeedTecnicaInataComHabilidades = SeedTecnicaInata & {
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
    const entries = Object.entries(value as Record<string, Prisma.InputJsonValue>)
      .map(([key, item]) => [key, corrigirMojibakeSeedJson(item)]);
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
  // âœ… TÃ‰CNICAS HEREDITÃRIAS
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
    descricao: 'Permite copiar tÃ©cnicas de outros feiticeiros.',
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
    nome: 'FabricaÃ§Ã£o AmaldiÃ§oada',
    descricao: 'Cria ferramentas amaldiÃ§oadas.',
    hereditaria: true,
    clasHereditarios: ['Haganezuka'],
  },
  {
    codigo: 'FALA_AMALDICOADA',
    nome: 'Fala AmaldiÃ§oada',
    descricao: 'Comandos verbais que afetam a realidade.',
    hereditaria: true,
    clasHereditarios: ['Inumaki'],
  },
  {
    codigo: 'FURIA_AGNI',
    nome: 'FÃºria de Agni',
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
    codigo: 'INFINITO',
    nome: 'Infinito',
    descricao: 'ManipulaÃ§Ã£o do espaÃ§o atravÃ©s do conceito de infinito.',
    hereditaria: true,
    clasHereditarios: ['Gojo', 'Okkotsu'],
  },
  {
    codigo: 'MANIPULACAO_SANGUE',
    nome: 'ManipulaÃ§Ã£o de Sangue',
    descricao: 'Controle total sobre o prÃ³prio sangue e sangue alheio.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'MANIPULACAO_CEU',
    nome: 'ManipulaÃ§Ã£o do CÃ©u',
    descricao: 'Controle sobre fenÃ´menos celestiais.',
    hereditaria: true,
    clasHereditarios: ['Fujiwara'],
  },
  {
    codigo: 'OCEANO_DESASTROSO',
    nome: 'Oceano Desastroso',
    descricao: 'Cria e controla massas de Ã¡gua destrutivas.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },
  {
    codigo: 'PLANTAS_DESASTRE',
    nome: 'Plantas do Desastre',
    descricao: 'Controle sobre plantas amaldiÃ§oadas.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'SANTUARIO',
    nome: 'SantuÃ¡rio',
    descricao: 'ExpansÃ£o de DomÃ­nio destrutiva.',
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
        descricao:
          'Dispara um corte amaldicoado em linha reta contra um alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Curto (linha de 1m de largura)',
        alvo: '1 ser da linha',
        duracao: 'Instantaneo',
        resistencia: 'Reacao',
        custoEA: 1,
        efeito:
          'Conta como disparo (Pontaria com Jujutsu). Causa 1 + 1d4 de dano de corte amaldicoado e crita no 20 natural. Se o alvo for eliminado ou perder membro, o dano pode seguir para o proximo alvo da linha.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1 + 1d4 de dano de corte amaldicoado',
          observacao: 'Acumula com o grau de aprimoramento em Tecnica Amaldicoada.',
        },
        ordem: 10,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Eleva o corte com maior precisao e dano.',
            substituiCustos: false,
            custoEA: 1,
            custoPE: 1,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '2 + 2d4 de dano',
              porAcumulo: '+2d4 por +1 EA',
              criticoNatural: 19,
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
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '3 + 3d4 de dano',
              porAcumulo: '+3d4 por +1 EA',
              criticoNatural: 18,
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
        efeito:
          'Exige teste de Pontaria com Jujutsu contra Defesa base dos alvos. Causa 3 + 3d4 de dano de corte amaldicoado em todos os afetados.',
        escalonaPorGrau: true,
        grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
        escalonamentoEfeito: {
          porAcumulo: '+1d4 de dano por +1 EA',
        },
        ordem: 20,
        variacoes: [
          {
            nome: 'Superior',
            descricao: 'Versao elevada com dados maiores.',
            substituiCustos: false,
            custoEA: 2,
            custoPE: 1,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '3 + 3d8 de dano',
              porAcumulo: '+1d8 por +1 EA',
            },
            ordem: 10,
          },
          {
            nome: 'Maxima',
            descricao: 'Versao de saturacao total da barragem.',
            substituiCustos: false,
            custoEA: 3,
            custoPE: 2,
            escalonaPorGrau: true,
            escalonamentoCustoEA: 1,
            escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
            escalonamentoEfeito: {
              base: '4 + 4d12 de dano',
              porAcumulo: '+1d12 por +1 EA',
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
    nome: 'TÃ©cnica da Boneca de Palha',
    descricao: 'Transfere dano atravÃ©s de bonecos de palha.',
    hereditaria: true,
    clasHereditarios: ['Kugisaki'],
  },
  {
    codigo: 'PROJECAO',
    nome: 'TÃ©cnica de ProjeÃ§Ã£o',
    descricao: 'Manipula o movimento atravÃ©s de projeÃ§Ãµes.',
    hereditaria: true,
    clasHereditarios: ['Zenin'],
  },
  {
    codigo: 'TRANSFIGURACAO_OCIOSA',
    nome: 'TransfiguraÃ§Ã£o Ociosa',
    descricao: 'Altera a forma da alma e corpo.',
    hereditaria: true,
    clasHereditarios: ['Kamo'],
  },

  // ========================================
  // âœ… TÃ‰CNICAS NÃƒO HEREDITÃRIAS
  // ========================================
  {
    codigo: 'AMPLIFICACAO_SOM',
    nome: 'AmplificaÃ§Ã£o Sonora',
    descricao: 'Usa o corpo do usuÃ¡rio como um dispositivo de amplificaÃ§Ã£o de som, amplificando as melodias que ele toca com algum instrumento e lanÃ§ando-as em ondas de energia amaldiÃ§oada.',
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
    nome: 'DÃ¡diva de Lavoisier',
    descricao: 'ManipulaÃ§Ã£o de matÃ©ria atravÃ©s de reaÃ§Ãµes quÃ­micas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'DESCARGA_EA',
    nome: 'Descarga de Energia AmaldiÃ§oada',
    descricao: 'Libera rajadas de energia amaldiÃ§oada.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENCANTAMENTO_INVERSO',
    nome: 'Encantamento do Inverso',
    descricao: 'Inverte propriedades de tÃ©cnicas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'EA_ELETRIFICADA',
    nome: 'Energia AmaldiÃ§oada Eletrificada',
    descricao: 'Energia amaldiÃ§oada com propriedades elÃ©tricas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ENVENENAMENTO',
    nome: 'Envenenamento',
    descricao: 'Cria e controla venenos amaldiÃ§oados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FORMACAO_GELO',
    nome: 'FormaÃ§Ã£o de Gelo',
    descricao: 'Cria e manipula gelo.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'FURIA_ESTELAR',
    nome: 'FÃºria Estelar',
    descricao: 'Energia cÃ³smica destrutiva.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'IMORTALIDADE',
    nome: 'Imortalidade',
    descricao: 'RegeneraÃ§Ã£o e ressurreiÃ§Ã£o.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_FANTOCHES',
    nome: 'ManipulaÃ§Ã£o de Fantoches',
    descricao: 'Controla fantoches amaldiÃ§oados.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_MALDICAO',
    nome: 'ManipulaÃ§Ã£o de MaldiÃ§Ã£o',
    descricao: 'Controle direto sobre maldiÃ§Ãµes.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MANIPULACAO_TERRA',
    nome: 'ManipulaÃ§Ã£o de Terra',
    descricao: 'Controle sobre terra e rochas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'MILAGRES',
    nome: 'Milagres',
    descricao: 'Efeitos miraculosos imprevisÃ­veis.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'NULIFICACAO_ESCADA_JACO',
    nome: 'NulificaÃ§Ã£o: Escada de JacÃ³',
    descricao: 'Anula tÃ©cnicas inimigas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'OLHAR_PARALISANTE',
    nome: 'Olhar Paralisante',
    descricao: 'Paralisa alvos atravÃ©s do olhar.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'ORQUIDEA_SARKICA',
    nome: 'OrquÃ­dea SÃ¡rkica',
    descricao: 'ManipulaÃ§Ã£o de carne e ossos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'PUNHOS_MISSEIS',
    nome: 'Punhos de MÃ­sseis',
    descricao: 'Ataques perfurantes explosivos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SEM_TECNICA',
    nome: 'Sem TÃ©cnica AmaldiÃ§oada',
    descricao: 'NÃ£o possui tÃ©cnica amaldiÃ§oada inata.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SETE_CAMINHOS_MUNDANOS',
    nome: 'Sete Caminhos Mundanos',
    descricao: 'Sete modos de combate diferentes.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'SURTO_TEMPORAL',
    nome: 'Surto Temporal',
    descricao: 'ManipulaÃ§Ã£o limitada do tempo.',
    hereditaria: true,
    clasHereditarios: ['Ram'],
  },
  {
    codigo: 'NEVOA_LILAS',
    nome: 'TÃ©cnica da NÃ©voa LilÃ¡s',
    descricao: 'NÃ©voa que causa confusÃ£o e dano.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'CLONAGEM',
    nome: 'TÃ©cnica de Clonagem',
    descricao: 'Cria clones temporÃ¡rios.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'APOSTADOR_NATO',
    nome: 'TÃ©cnica do Apostador Nato',
    descricao: 'Habilidades baseadas em sorte e apostas.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRANSFERENCIA_ESPACIAL',
    nome: 'TransferÃªncia Espacial',
    descricao: 'Teletransporte de curta distÃ¢ncia.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'TRIBUNAL_JULGAMENTO',
    nome: 'Tribunal de Julgamento',
    descricao: 'Julga e pune alvos.',
    hereditaria: false,
    clasHereditarios: [],
  },
  {
    codigo: 'BOOGIE_WOOGIE',
    nome: 'Troca: Boogie Woogie',
    descricao: 'Troca posiÃ§Ãµes de dois alvos.',
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
        efeito:
          'O alvo fica ENREDADO por 1 rodada.',
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
        efeito:
          'O alvo fica DESPREVENIDO e sofre -1d20 em Percepcao.',
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
        descricao:
          'Costuras e selos visuais bloqueiam a fala e foco do alvo.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude anula',
        custoEA: 3,
        efeito:
          'O alvo fica SILENCIADO por 1 rodada.',
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
        descricao:
          'Pinceladas de combustao se espalham violentamente.',
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
          opcoes: [
            '+1d6 de dano',
            '+1 rodada de duracao',
            '+2 na DT',
          ],
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
        descricao:
          'Massas de agua ilustradas colidem contra os alvos.',
        execucao: TipoExecucao.ACAO_PADRAO,
        area: AreaEfeito.LINHA,
        alcance: 'Curto',
        alvo: 'Area (linha de 3 quadrados)',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude',
        custoEA: 3,
        efeito:
          'Causa 2d6 de dano de impacto. Falha deixa CAIDO.',
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
        descricao:
          'Pinceladas cortantes riscam o ar e abrem cortes profundos.',
        execucao: TipoExecucao.ACAO_PADRAO,
        alcance: 'Curto',
        alvo: '1 ser',
        duracao: 'Instantaneo',
        resistencia: 'Fortitude reduz metade',
        custoEA: 3,
        efeito:
          'Causa 2d6 de dano cortante. Falha deixa SANGRANDO.',
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
        descricao:
          'Marca um ponto fraco no alvo na proporcao 7:3.',
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
            descricao:
              'Aplica a marcacao em objeto, com margem de ameaca +2.',
            substituiCustos: true,
            alvo: '1 objeto',
            ordem: 10,
          },
          {
            nome: 'Superior',
            descricao:
              'Cria pontos fracos mais faceis de acertar.',
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
            descricao:
              'Adiciona dano extra progressivo ao golpe preciso.',
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
            efeitoAdicional:
              'Inclui efeitos da variacao Superior.',
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
    testesExigidos: jsonOrNull(corrigirMojibakeSeedJson(habilidade.testesExigidos)),
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
    ordem: habilidade.ordem,
  };
}

function mapVariacaoDataInata(
  habilidadeTecnicaId: number,
  variacao: SeedVariacaoTecnicaInata,
) {
  const duracaoCorrigida =
    corrigirMojibakeSeedTexto(variacao.duracao) ?? null;
  const custosSustentacao = resolverCustoSustentacaoPadrao(
    duracaoCorrigida,
    variacao.custoSustentacaoEA,
    variacao.custoSustentacaoPE,
  );
  return {
    habilidadeTecnicaId,
    nome: corrigirMojibakeSeedTexto(variacao.nome) ?? variacao.nome,
    descricao: corrigirMojibakeSeedTexto(variacao.descricao) ?? variacao.descricao,
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
    efeitoAdicional: corrigirMojibakeSeedTexto(variacao.efeitoAdicional) ?? null,
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
  console.log('ðŸ”¥ Cadastrando tÃ©cnicas amaldiÃ§oadas inatas...');

  const get = createLookupCache(prisma);

  for (const tec of tecnicasInatasSeed) {
    // 1) Cria/atualiza a tÃ©cnica
    const tecnica = await prisma.tecnicaAmaldicoada.upsert({
      where: { codigo: tec.codigo },
      update: {
        nome: corrigirMojibakeSeedTexto(tec.nome) ?? tec.nome,
        descricao:
          corrigirMojibakeSeedTexto(tec.descricao) ??
          'Tecnica Amaldicoada Inata',
        tipo: TipoTecnicaAmaldicoada.INATA,
        hereditaria: tec.hereditaria,
        linkExterno: tec.linkExterno ?? null,
        requisitos: jsonOrNull(corrigirMojibakeSeedJson(tec.requisitos)),
        
        // âœ… NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        codigo: tec.codigo,
        nome: corrigirMojibakeSeedTexto(tec.nome) ?? tec.nome,
        descricao:
          corrigirMojibakeSeedTexto(tec.descricao) ??
          'Tecnica Amaldicoada Inata',
        tipo: TipoTecnicaAmaldicoada.INATA,
        hereditaria: tec.hereditaria,
        linkExterno: tec.linkExterno ?? null,
        requisitos: jsonOrNull(corrigirMojibakeSeedJson(tec.requisitos)),
        
        // âœ… NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      select: { id: true, hereditaria: true, nome: true },
    });

    console.log(
      `  âœ… ${tecnica.nome} (${tec.hereditaria ? 'HereditÃ¡ria' : 'NÃ£o HereditÃ¡ria'})`,
    );

    if (Array.isArray(tec.habilidades)) {
      await seedHabilidadesDaTecnicaInata(prisma, tecnica.id, tec.habilidades);
      console.log(`    âœ¨ Habilidades inatas: ${tec.habilidades.length}`);
    }

    // 2) VÃ­nculo com clÃ£s (somente se for hereditÃ¡ria)
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

        console.log(`    ðŸ”— Vinculada ao clÃ£: ${claNome}`);
      }
    }
  }

  console.log(`âœ… ${tecnicasInatasSeed.length} tÃ©cnicas inatas cadastradas!\n`);
}


