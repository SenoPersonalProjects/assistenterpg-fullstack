// prisma/seeds/catalogos/hab-poderes-genericos.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidade } from '../_types';
import { jsonOrNull } from '../_helpers';
import { TipoFonte } from '@prisma/client'; // ✅ NOVO

export const habilidadesPoderesGenericosSeed = [
  // ========== PROFICIÊNCIAS E COMBATE ==========
  {
    nome: 'Armamento Amaldiçoado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Recebe proficiência com ferramentas amaldiçoadas (armas, proteções e artefatos com maldições complexas).',
    requisitos: {
      pericias: [
        { codigo: 'LUTA', grauMinimo: 1 },
        { codigo: 'PONTARIA', grauMinimo: 1, alternativa: true },
      ],
    },
    mecanicasEspeciais: {
      proficiencias: ['FERRAMENTAS_AMALDICOADAS'],
    },
  },
  {
    nome: 'Armamento Pesado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Você recebe proficiência com armas pesadas.',
    requisitos: {
      atributos: { forca: 2 },
    },
    mecanicasEspeciais: {
      proficiencias: ['ARMAS_PESADAS'],
    },
  },
  {
    nome: 'Balística Avançada',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com armas de fogo.',
    mecanicasEspeciais: {
      proficiencias: ['ARMAS_TATICAS_FOGO'],
      modificadores: { danoArmasFogo: 2 },
    },
  },
  {
    nome: 'Ninja Urbano',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe proficiência com armas táticas de ataque corpo a corpo e de disparo (exceto de fogo) e +2 em rolagens de dano com armas de corpo a corpo e de disparo.',
    mecanicasEspeciais: {
      proficiencias: ['ARMAS_TATICAS_CORPO_A_CORPO', 'ARMAS_TATICAS_DISPARO'],
      modificadores: {
        danoCorpoACorpo: 2,
        danoDisparo: 2,
      },
    },
  },
  {
    nome: 'Golpe Pesado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Enquanto estiver empunhando uma arma corpo a corpo, o dano dela aumenta em +1 dado do mesmo tipo.',
  },
  {
    nome: 'Golpe Demolidor',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 1 PE para causar +2 dados de dano extra do mesmo tipo de sua arma.',
    requisitos: {
      atributos: { forca: 2 },
      pericias: [{ codigo: 'LUTA', grauMinimo: 1 }],
    },
  },
  {
    nome: 'Combate Defensivo',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Quando usa a ação Agredir, você pode combater defensivamente; se fizer isso, até seu próximo turno sofre –1d20 em todos os testes de ataque, mas recebe +5 na Defesa.',
    requisitos: {
      atributos: { intelecto: 2 },
    },
  },
  {
    nome: 'Combater com Duas Armas',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Se estiver empunhando duas armas (e pelo menos uma for leve) e fizer a ação Agredir, você pode fazer dois ataques, um com cada arma; se fizer isso, sofre –1d20 em todos os testes de ataque até o seu próximo turno.',
    requisitos: {
      atributos: { agilidade: 3 },
      pericias: [
        { codigo: 'LUTA', grauMinimo: 1 },
        { codigo: 'PONTARIA', grauMinimo: 1, alternativa: true },
      ],
    },
  },
  {
    nome: 'Ataque de Oportunidade',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, você pode gastar uma reação e 1 PE para fazer um ataque corpo a corpo contra ele.',
  },

  // ========== ARMAS / TIRO ==========
  {
    nome: 'Mira Certeira',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Aumenta rolagens de dano de ataques à distância em +1 dado (por exemplo, de 1d8 para 2d8).',
  },
  {
    nome: 'Tiro Certeiro',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Se estiver usando uma arma de disparo/arma de fogo, você soma sua Agilidade nas rolagens de dano e ignora a penalidade de –1d20 por atacar alvo engajado em combate corpo a corpo (mesmo sem usar a ação Mirar).',
    requisitos: {
      pericias: [{ codigo: 'PONTARIA', grauMinimo: 1 }],
    },
  },
  {
    nome: 'Tiro de Cobertura',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode gastar uma ação padrão e 1 PE para disparar na direção de um ser no alcance, forçando-o a se proteger; faça um teste de Pontaria contra a Vontade do alvo e, se vencer, até o início do seu próximo turno o alvo não pode sair do lugar onde está e sofre –5 em testes de ataque (efeito de medo).',
  },
  {
    nome: 'Segurar o Gatilho',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Sempre que acerta um ataque com uma arma de fogo, pode fazer outro ataque com a mesma arma contra o mesmo alvo, pagando 2 PE por cada ataque extra já realizado no turno (2 PE no 1º extra, +4 PE no 2º extra, etc.), até errar ou atingir o limite de PE por rodada/turno.',
    requisitos: {
      nivelMinimo: 12,
    },
  },
  {
    nome: 'Saque Rápido',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, se estiver usando contagem de munição, 1 vez por rodada pode recarregar uma arma de fogo como uma ação livre.',
    requisitos: {
      pericias: [{ codigo: 'INICIATIVA', grauMinimo: 1 }],
    },
  },

  // ========== DEFESA / PROTEÇÕES ==========
  {
    nome: 'Proteção Pesada',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Você recebe proficiência com Proteções Pesadas.',
    requisitos: {
      nivelMinimo: 6,
    },
    mecanicasEspeciais: {
      proficiencias: ['PROTECOES_PESADAS'],
    },
  },
  {
    nome: 'Tanque de Guerra',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Se estiver usando uma proteção pesada, a Defesa e a RD que ela fornece aumentam em +2.',
    requisitos: {
      poderesPreRequisitos: ['Proteção Pesada'],
    },
  },
  {
    nome: 'Reflexos Defensivos',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Você recebe +2 em Defesa e +2 em testes de resistência.',
    requisitos: {
      atributos: { agilidade: 2 },
    },
    mecanicasEspeciais: { defesa: { bonus: 2 } },
  },

  // ========== RESISTÊNCIAS ==========
  {
    nome: 'Aura Resistente',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Recebe +5 em resistência a Jujutsu (testes para resistir a técnicas amaldiçoadas).',
    requisitos: { atributos: { vigor: 2 } },
  },
  {
    nome: 'Aura Impenetrável',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Recebe +10 em resistência a Jujutsu (testes para resistir a técnicas amaldiçoadas).',
    requisitos: {
      atributos: { vigor: 3 },
      outros: 'Corpo especial (definido pelo mestre).',
    },
  },
  {
    nome: 'Textura Oleosa',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Quando se reveste de energia amaldiçoada, recebe +5 em Reflexos.',
    requisitos: {
      atributos: { agilidade: 3 },
      pericias: [{ codigo: 'REFLEXOS', grauMinimo: 2 }],
    },
  },
  {
    nome: 'Jujutsu de Ferro',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Quando se reveste de energia amaldiçoada, recebe +5 em Fortitude.',
    requisitos: {
      atributos: { vigor: 3 },
      pericias: [{ codigo: 'FORTITUDE', grauMinimo: 2 }],
    },
  },

  // ========== JUJUTSU / RITUAIS ==========
  {
    nome: 'Jujutsu Bruto',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Recebe +1 dado de dano em rolagens que envolvam energia amaldiçoada (feitiços, revestimentos etc.).',
  },
  {
    nome: 'Jujutsu Capacitado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Em todos os níveis ímpares recebe +1 EA; a cada três níveis recebe +1 no limite de PE/EA por turno.',
    requisitos: {
      pericias: [{ codigo: 'JUJUTSU', grauMinimo: 1 }],
      atributos: { intelecto: 3 },
    },
  },
  {
    nome: 'Complexidade Inata',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Aumenta em +3 a DT para resistir a todos os seus feitiços e efeitos.',
    requisitos: {
      pericias: [{ codigo: 'JUJUTSU', grauMinimo: 1 }],
    },
  },
  {
    nome: 'Especialista na Técnica',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Reduz o custo em EA dos feitiços da sua técnica inata em 1.',
    requisitos: {
      poderesPreRequisitos: ['Complexidade Inata'],
    },
  },
  {
    nome: 'Feiticeiro Intuitivo',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Passa a rolar testes de Jujutsu com Presença no lugar de Intelecto.',
    requisitos: {
      pericias: [
        { codigo: 'JUJUTSU', grauMinimo: 1 },
        { codigo: 'INTUICAO', grauMinimo: 1 },
      ],
    },
  },
  {
    nome: 'Entendido de Jujutsu',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao: 'Reduz pela metade o dano de SAN proveniente de votos vinculativos.',
    requisitos: {
      atributos: { intelecto: 3 },
    },
  },
  {
    nome: 'Identificação Paranormal',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe +10 em testes de Jujutsu para identificar espíritos amaldiçoados, objetos amaldiçoados ou feitiços.',
  },
  {
    nome: 'Criar Selo',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você sabe fabricar selos (talismãs) de feitiços que conheça. Fabricar um selo gasta uma ação de interlúdio e um número de PE igual ao custo do feitiço. Você pode ter um número máximo de selos criados ao mesmo tempo igual à sua Presença.',
  },
  {
    nome: 'Improvisar Componentes',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Uma vez por cena, você pode gastar uma ação completa para fazer um teste de Investigação (DT 15). Se passar, encontra objetos que podem servir como componentes ritualísticos para a conjuração, a critério do mestre. Concedendo +1 dado no efeito ou teste dos feitiços até o fim da cena.',
  },
  {
    nome: 'Ritual Potente',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você soma seu Intelecto nas rolagens de dano ou nos efeitos de cura de seus feitiços.',
    requisitos: {
      atributos: { intelecto: 2 },
    },
  },
  {
    nome: 'Ritual Predileto',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Escolha um feitiço que você conhece. Você reduz em –1 o custo do feitiço (PE ou EA, escolhido ao adquirir este poder). Essa redução se acumula com reduções fornecidas por outras fontes.',
    mecanicasEspeciais: {
      escolha: { tipo: 'FEITICO_CONHECIDO' },
      reduzCusto: { valor: 1, modos: ['PE', 'EA'] },
    },
  },
  {
    nome: 'Tatuagem Ritualística',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Símbolos marcados em sua pele reduzem em –1 o custo de EA de feitiços de alcance pessoal que têm você como alvo.',
  },
  {
    nome: 'Fluxo de Poder',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode manter dois efeitos sustentados ativos ao mesmo tempo com apenas uma ação livre, pagando o custo de cada efeito separadamente.',
    requisitos: {
      nivelMinimo: 12,
    },
  },
  {
    nome: 'Camuflar Ocultismo',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode gastar uma ação livre para esconder símbolos e sigilos desenhados ou gravados em objetos ou em sua pele, tornando-os invisíveis para outras pessoas além de você. Além disso, quando lança um feitiço, pode gastar +2 PE para lançá-lo sem usar componentes ritualísticos e sem gesticular, usando apenas concentração; outros seres só percebem se passarem em um teste de Jujutsu (DT 25).',
    mecanicasEspeciais: {
      ocultarSimbolos: true,
      conjuracaoSemComponentes: { custoPeExtra: 2, dtPercepcao: 25, teste: 'JUJUTSU' },
    },
  },
  {
    nome: 'Especialista em Técnica Não-Inata',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Escolha uma categoria de técnica não-inata. A DT para resistir aos seus feitiços dessa categoria aumenta em +2.',
    mecanicasEspeciais: {
      escolha: { tipo: 'CATEGORIA_TECNICA_NAO_INATA' },
      bonusDT: 2,
    },
  },
  {
    nome: 'Mestre em Técnica Não-Inata',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Escolha uma categoria de técnica não-inata. O custo para lançar feitiços dessa categoria diminui em –1 (PE ou EA, escolhido ao adquirir este poder).',
    requisitos: {
      poderesPreRequisitos: ['Especialista em Técnica Não-Inata'],
      nivelMinimo: 9,
    },
    mecanicasEspeciais: {
      escolha: { tipo: 'CATEGORIA_TECNICA_NAO_INATA' },
      reduzCusto: { valor: 1, modos: ['PE', 'EA'] },
    },
  },

  // ========== KOKUSEN / COMBOS ==========
  {
    nome: 'Gênio do Kokusen',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Todos os acertos críticos naturais se tornam Kokusen, drenando automaticamente 3 PE ao acertar.',
    requisitos: {
      pericias: [{ codigo: 'JUJUTSU', grauMinimo: 1 }],
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 }],
    },
  },
  {
    nome: 'Lutador Focado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Depois que acerta um primeiro Kokusen, todos os acertos críticos (mesmo não naturais) se tornam Kokusen, drenando 4 PE e 1 EA.',
    requisitos: {
      poderesPreRequisitos: ['Gênio do Kokusen'],
      atributos: { forca: 3, agilidade: 3, alternativa: true },
    },
  },

  // ========== EMISSÃO ==========
  {
    nome: 'Emissão Anormal',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Pode usar Emissão de Energia Amaldiçoada com ataques à distância como ação livre; a Emissão causa o dobro dos dados de dano e recebe +2 no teste de ataque.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 }],
      pericias: [
        { codigo: 'JUJUTSU', grauMinimo: 1 },
        { codigo: 'PONTARIA', grauMinimo: 1 },
      ],
      atributos: { presenca: 3 },
    },
  },

  // ========== SHIKIGAMI ==========
  {
    nome: 'Shikigami Favorito',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Reduz em 1 o custo de EA para invocar um Shikigami específico e melhora o tipo de ação de invocação (completa → padrão → reação → livre).',
    requisitos: {
      pericias: [{ codigo: 'JUJUTSU', grauMinimo: 1 }],
    },
    mecanicasEspeciais: {
      escolha: { tipo: 'SHIKIGAMI' },
      reduzCustoEa: 1,
      melhoraAcaoInvocacao: true,
    },
  },

  // ========== VOTOS ==========
  {
    nome: 'Perito em Votos',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Usa Intuição no lugar de Vontade para votos vinculativos e recebe +5 em Intuição.',
    requisitos: {
      poderesPreRequisitos: ['Feiticeiro Intuitivo'],
      atributos: { presenca: 3 },
    },
  },

  // ========== INVESTIGAÇÃO / SOCIAL ==========
  {
    nome: 'Guiado pelo Maldito',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional.',
  },
  {
    nome: 'Incansável',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional, mas deve usar Força ou Agilidade como atributo-base do teste.',
  },
  {
    nome: 'Pensamento Ágil',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Uma vez por rodada, durante uma cena de investigação, você pode gastar 2 PE para fazer uma ação de "procurar pistas" adicional.',
  },
  {
    nome: 'Na Trilha Certa',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Sempre que tiver sucesso em um teste para procurar pistas, você pode gastar 1 PE para receber +1d20 no próximo teste. Os custos e os bônus são cumulativos.',
  },
  {
    nome: 'Conhecimento Aplicado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Quando faz um teste de perícia (exceto Luta e Pontaria), você pode gastar 2 PE para mudar o atributo-base da perícia para Intelecto.',
    requisitos: { atributos: { intelecto: 2 } },
  },
  {
    nome: 'Presteza Atlética',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Quando faz um teste para facilitar a investigação, você pode gastar 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia; se passar no teste, o próximo aliado que usar seu bônus também recebe +1d20 no teste.',
  },
  {
    nome: 'Intuição Paranormal',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Sempre que usa a ação "facilitar investigação", você soma seu Intelecto ou Presença no teste (à sua escolha).',
  },
  {
    nome: 'Nerd',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena.',
    requisitos: {
      pericias: [{ codigo: 'ATUALIDADES', grauMinimo: 1 }],
    },
    mecanicasEspeciais: { dt: 20, custoPe: 2 },
  },
  {
    nome: 'Primeira Impressão',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe +2d20 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena.',
    requisitos: {
      pericias: [
        { codigo: 'DIPLOMACIA', grauMinimo: 1 },
        { codigo: 'ENGANACAO', grauMinimo: 1, alternativa: true },
        { codigo: 'INTIMIDACAO', grauMinimo: 1, alternativa: true },
        { codigo: 'INTUICAO', grauMinimo: 1, alternativa: true },
      ],
    },
  },
  {
    nome: 'Envolto em Mistério',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Jujutsu.',
  },

  // ========== UTILIDADE / ITENS ==========
  {
    nome: 'Mochila de Utilidades',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Um item à sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos.',
  },
  {
    nome: 'Manuseio Amaldiçoado',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Reduz a categoria de um item amaldiçoado em 1 e pode usá-lo sem pagar o custo de PE indicado.',
  },

  // ========== MOBILIDADE ==========
  {
    nome: 'Movimento Tático',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode gastar 1 PE para ignorar a penalidade em deslocamento por terreno difícil e por escalar até o final do turno.',
    requisitos: {
      pericias: [{ codigo: 'ATLETISMO', grauMinimo: 1 }],
    },
  },

  // ========== CRIME / TEC ==========
  {
    nome: 'Mãos Rápidas',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Ao fazer um teste de Crime, você pode pagar 1 PE para fazê-lo como uma ação livre.',
    requisitos: {
      atributos: { agilidade: 3 },
      pericias: [{ codigo: 'CRIME', grauMinimo: 1 }],
    },
  },
  {
    nome: 'Hacker',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo necessário para hackear qualquer sistema para uma ação completa.',
    requisitos: {
      pericias: [{ codigo: 'TECNOLOGIA', grauMinimo: 1 }],
    },
  },

  // ========== EXPLOSIVOS ==========
  {
    nome: 'Perito em Explosivos',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você soma seu Intelecto na DT para resistir aos seus explosivos e pode excluir dos efeitos da explosão um número de alvos igual ao seu Intelecto.',
  },

  // ========== TÁTICA ==========
  {
    nome: 'Sentido Tático',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Você pode gastar uma ação de movimento e 2 PE para analisar o ambiente; se fizer isso, recebe bônus em Defesa e em testes de resistência igual ao seu Intelecto até o final da cena.',
    requisitos: {
      atributos: { intelecto: 2 },
      pericias: [
        { codigo: 'PERCEPCAO', grauMinimo: 1 },
        { codigo: 'TATICA', grauMinimo: 1 },
      ],
    },
  },

  // ========== ARTES MARCIAIS ==========
  {
    nome: 'Artista Marcial',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Seus ataques desarmados causam 1d6, podem causar dano letal e se tornam ágeis; no nível 7 o dano vira 1d8 e no nível 14 vira 1d10.',
    mecanicasEspeciais: {
      ataqueDesarmado: {
        danoPorNivel: [
          { nivelMinimo: 1, dano: '1d6' },
          { nivelMinimo: 7, dano: '1d8' },
          { nivelMinimo: 14, dano: '1d10' },
        ],
        agil: true,
        letal: true,
      },
    },
  },

  // ========== PERÍCIAS / TREINO ==========
  {
    nome: 'Treinamento em Perícia',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Escolha 2 perícias para aumentar o grau de treinamento delas. Precisa passar pelas etapas de cada grau de treinamento para ir pro próximo. Esse poder pode ser escolhido várias vezes.',
    mecanicasEspeciais: {
      repetivel: true,
      escolha: { tipo: 'PERICIAS', quantidade: 2 },
      progressao: [
        { nivelMinimo: 1, grauNovo: 5 },
        { nivelMinimo: 3, grauNovo: 10 },
        { nivelMinimo: 9, grauNovo: 15 },
        { nivelMinimo: 16, grauNovo: 20 },
      ],
    },
  },

  // ========== GRAU DE APRIMORAMENTO ==========
  {
    nome: 'Treinamento Específico',
    tipo: 'PODER_GENERICO',
    origem: 'GERAL',
    hereditaria: false,
    descricao:
      'Recebe +1 grau de aprimoramento em uma técnica à escolha, respeitando limites definidos pelo mestre.',
    mecanicasEspeciais: {
      repetivel: true,
      escolha: { tipo: 'TIPO_GRAU' },
      bonus: 1,
    },
  },
] satisfies SeedHabilidade[];

export async function seedHabilidadesPoderesGenericos(prisma: PrismaClient) {
  console.log('📌 Cadastrando poderes genéricos...');

  for (const h of habilidadesPoderesGenericosSeed) {
    await prisma.habilidade.upsert({
      where: { nome: h.nome },
      update: {
        tipo: h.tipo,
        origem: h.origem ?? null,
        descricao: h.descricao ?? null,
        hereditaria: h.hereditaria ?? false,
        requisitos: jsonOrNull(h.requisitos ?? null),
        mecanicasEspeciais: jsonOrNull(h.mecanicasEspeciais ?? null),
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome: h.nome,
        tipo: h.tipo,
        origem: h.origem ?? null,
        descricao: h.descricao ?? null,
        hereditaria: h.hereditaria ?? false,
        requisitos: jsonOrNull(h.requisitos ?? null),
        mecanicasEspeciais: jsonOrNull(h.mecanicasEspeciais ?? null),
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }

  console.log(`✅ ${habilidadesPoderesGenericosSeed.length} poderes genéricos cadastrados!\n`);
}
