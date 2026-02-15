// prisma/seeds/habilidades/hab-origem.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedHabilidade, SeedHabilidadeOrigemVinculo } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

export const habilidadesOrigemSeed: SeedHabilidade[] = [
  {
    nome: 'Vivência (Mestre de Maldições)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Sempre que identificar que está investigando algo relacionado a um mestre de maldição, você tem vantagem de +1d20 nas rolagens de Investigação, Percepção e Intuição.',
    mecanicasEspeciais: {
      bonus: {
        tipo: 'rolagem_extra',
        valor: '1d20',
        pericias: ['INVESTIGACAO', 'PERCEPCAO', 'INTUICAO'],
        contexto: 'investigação relacionada a mestre de maldição',
      },
    },
  },
  {
    nome: 'Queridinho (Prodígio do Clã)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Inicia a jornada com 30 de Prestígio de Clã.',
    mecanicasEspeciais: { prestigioClaBase: 30 },
  },
  {
    nome: 'Ovelha-negra (Renegado)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Inicia a jornada com -50 de Prestígio de Clã. Porém, recebe +5 em rolagens de ataque e +1 dado de dano contra membros dos três Grandes Clãs.',
    mecanicasEspeciais: {
      prestigioClaBase: -50,
      combate: {
        bonusAtaque: 5,
        dadosDanoExtra: 1,
        contexto: 'membros dos três Grandes Clãs',
      },
    },
  },
  {
    nome: 'Saber é Poder (Acadêmico)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.',
    mecanicasEspeciais: {
      acao: {
        custo: { pe: 2 },
        efeito: '+5 em teste baseado em Intelecto',
        gatilho: 'teste de Intelecto',
      },
    },
  },
  {
    nome: 'Técnica Medicinal (Agente de Saúde)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Sempre que cura um personagem, você adiciona seu Intelecto ao total de PV curados.',
    mecanicasEspeciais: { cura: { somaAtributo: 'INTELECTO' } },
  },
  {
    nome: 'Magnum Opus (Artista)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Uma vez por missão, pode determinar que um personagem o reconheça. Você recebe +5 em testes de Presença contra aquele personagem.',
    mecanicasEspeciais: {
      social: {
        frequencia: '1x por missão',
        bonus: 5,
        atributoBase: 'PRESENCA',
        contexto: 'alvo que reconheceu sua obra',
      },
    },
  },
  {
    nome: '110% (Atleta)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Quando faz um teste de perícia usando Força ou Agilidade (exceto Luta e Pontaria), você pode gastar 2 PE para receber +5 nesse teste.',
    mecanicasEspeciais: {
      acao: {
        custo: { pe: 2 },
        efeito: '+5 no teste',
        atributosBase: ['FOR', 'AGI'],
        excetoPericias: ['LUTA', 'PONTARIA'],
      },
    },
  },
  {
    nome: 'Ingrediente Secreto (Chef)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Em cenas de interlúdio, você pode cozinhar um prato especial. Você e todos os membros do grupo que se alimentarem recebem o benefício de dois pratos.',
    mecanicasEspeciais: { interludio: { duplicaBeneficioPratos: true } },
  },
  {
    nome: 'O Crime Compensa (Criminoso)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'No final de uma missão, escolha um item encontrado. Em sua próxima missão, você pode incluí-lo sem que conte em seu limite de itens.',
    mecanicasEspeciais: {
      itens: { carregaParaProximaMissao: true, naoContaLimite: true },
    },
  },
  {
    nome: 'Traços do Outro Lado (Cultista Arrependido)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Você possui um poder paranormal à sua escolha. Porém, começa o jogo com metade da Sanidade normal para sua classe.',
    mecanicasEspeciais: {
      paranormal: { escolhePoder: true },
      sanidade: { multiplicadorInicial: 0.5 },
    },
  },
  {
    nome: 'Calejado (Desgarrado)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Você recebe +1 PV por nível.',
    mecanicasEspeciais: { pvPorNivel: 1 },
  },
  {
    nome: 'Ferramentas Favoritas (Engenheiro)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Um item à sua escolha (exceto armas) conta como uma categoria abaixo.',
    mecanicasEspeciais: { itens: { reduzCategoriaEm: 1, excetoTipos: ['ARMA'] } },
  },
  {
    nome: 'Processo Otimizado (Executivo)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Sempre que faz um teste de perícia durante um teste estendido ou para revisar documentos, você pode pagar 2 PE para receber +5.',
    mecanicasEspeciais: {
      acao: {
        custo: { pe: 2 },
        efeito: '+5 em teste de perícia',
        contexto: ['teste estendido', 'revisar documentos'],
      },
    },
  },
  {
    nome: 'Patrocinador da Escola (Magnata)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Seu limite de crédito é sempre considerado um acima.',
    mecanicasEspeciais: { economia: { creditoCategoriaBonus: 1 } },
  },
  {
    nome: 'Posição de Combate (Mercenário)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'No primeiro turno de cada cena de ação, você pode gastar 2 PE para receber uma ação de movimento adicional.',
    mecanicasEspeciais: {
      combate: { turno: 1, custo: { pe: 2 }, concede: { acaoMovimentoExtra: 1 } },
    },
  },
  {
    nome: 'Para Bellum (Militar)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Você recebe +2 em rolagens de dano com armas de fogo.',
    mecanicasEspeciais: { combate: { bonusDano: 2, contexto: 'armas de fogo' } },
  },
  {
    nome: 'Ferramenta de Trabalho (Operário)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Escolha uma arma simples ou tática que poderia ser ferramenta em sua profissão. Você recebe +1 em testes de ataque, dano e margem de ameaça com ela.',
    mecanicasEspeciais: {
      escolha: { tipo: 'arma', categoriasPermitidas: ['SIMPLES', 'TATICA'] },
      combate: { bonusAtaque: 1, bonusDano: 1, bonusMargemAmeaca: 1 },
    },
  },
  {
    nome: 'Patrulha (Policial)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Você recebe +2 em Defesa.',
    mecanicasEspeciais: { defesa: { bonus: 2 } },
  },
  {
    nome: 'Acalentar (Religioso)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Você recebe +5 em testes de Religião para acalmar. Quando acalma uma pessoa, ela recupera 1d6 + sua Presença em Sanidade.',
    mecanicasEspeciais: {
      bonus: { pericia: 'RELIGIAO', valor: 5, contexto: 'acalmar' },
      cura: { tipo: 'SAN', valor: '1d6 + PRESENCA', gatilho: 'ao acalmar' },
    },
  },
  {
    nome: 'Espírito Cívico (Servidor Público)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Sempre que faz um teste para ajudar, você pode gastar 1 PE para aumentar o bônus concedido em +2.',
    mecanicasEspeciais: { ajuda: { custo: { pe: 1 }, bonusExtra: 2 } },
  },
  {
    nome: 'Eu Já Sabia (Teórico da Conspiração)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Você não se abala com maldições ou anomalias. Você recebe resistência a dano mental igual ao seu Intelecto.',
    mecanicasEspeciais: { resistencias: { MENTAL: 'INTELECTO' } },
  },
  {
    nome: 'Motor de Busca (T.I.)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Sempre que tiver acesso à internet, você pode gastar 2 PE para substituir um teste de perícia qualquer por Tecnologia.',
    mecanicasEspeciais: {
      substituicao: {
        custo: { pe: 2 },
        paraPericia: 'TECNOLOGIA',
        condicao: 'acesso à internet',
      },
    },
  },
  {
    nome: 'Desbravador (Trabalhador Rural)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Quando faz um teste de Adestramento ou Sobrevivência, você pode gastar 2 PE para receber +5. Você não sofre penalidade por terreno difícil.',
    mecanicasEspeciais: {
      acao: { custo: { pe: 2 }, efeito: '+5', pericias: ['ADESTRAMENTO', 'SOBREVIVENCIA'] },
      movimento: { ignoraTerrenoDificil: true },
    },
  },
  {
    nome: 'Impostor (Trambiqueiro)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Uma vez por cena, você pode gastar 2 PE para substituir um teste de perícia qualquer por Enganação.',
    mecanicasEspeciais: {
      substituicao: { frequencia: '1x por cena', custo: { pe: 2 }, paraPericia: 'ENGANACAO' },
    },
  },
  {
    nome: 'Dedicação (Universitário)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao:
      'Você recebe +1 PE, e mais 1 PE adicional a cada nível ímpar (3, 5, 7...). Seu limite de PE por turno aumenta em 1.',
    mecanicasEspeciais: { recursos: { peBase: 1, pePorNivelImpar: 1, limitePePorTurnoBonus: 1 } },
  },
  {
    nome: 'Cicatrizes Psicológicas (Vítima)',
    tipo: 'ORIGEM',
    hereditaria: false,
    descricao: 'Você recebe +1 de Sanidade por nível.',
    mecanicasEspeciais: { sanPorNivel: 1 },
  },
] satisfies SeedHabilidade[];

export const habilidadesOrigemVinculosSeed: SeedHabilidadeOrigemVinculo[] = [
  { origemNome: 'Mestre de Maldições', habilidadeNome: 'Vivência (Mestre de Maldições)' },
  { origemNome: 'Prodígio do Clã', habilidadeNome: 'Queridinho (Prodígio do Clã)' },
  { origemNome: 'Renegado', habilidadeNome: 'Ovelha-negra (Renegado)' },
  { origemNome: 'Acadêmico', habilidadeNome: 'Saber é Poder (Acadêmico)' },
  { origemNome: 'Agente de Saúde', habilidadeNome: 'Técnica Medicinal (Agente de Saúde)' },
  { origemNome: 'Artista', habilidadeNome: 'Magnum Opus (Artista)' },
  { origemNome: 'Atleta', habilidadeNome: '110% (Atleta)' },
  { origemNome: 'Chef', habilidadeNome: 'Ingrediente Secreto (Chef)' },
  { origemNome: 'Criminoso', habilidadeNome: 'O Crime Compensa (Criminoso)' },
  { origemNome: 'Cultista Arrependido', habilidadeNome: 'Traços do Outro Lado (Cultista Arrependido)' },
  { origemNome: 'Desgarrado', habilidadeNome: 'Calejado (Desgarrado)' },
  { origemNome: 'Engenheiro', habilidadeNome: 'Ferramentas Favoritas (Engenheiro)' },
  { origemNome: 'Executivo', habilidadeNome: 'Processo Otimizado (Executivo)' },
  { origemNome: 'Magnata', habilidadeNome: 'Patrocinador da Escola (Magnata)' },
  { origemNome: 'Mercenário', habilidadeNome: 'Posição de Combate (Mercenário)' },
  { origemNome: 'Militar', habilidadeNome: 'Para Bellum (Militar)' },
  { origemNome: 'Operário', habilidadeNome: 'Ferramenta de Trabalho (Operário)' },
  { origemNome: 'Policial', habilidadeNome: 'Patrulha (Policial)' },
  { origemNome: 'Religioso', habilidadeNome: 'Acalentar (Religioso)' },
  { origemNome: 'Servidor Público', habilidadeNome: 'Espírito Cívico (Servidor Público)' },
  { origemNome: 'Teórico da Conspiração', habilidadeNome: 'Eu Já Sabia (Teórico da Conspiração)' },
  { origemNome: 'T.I.', habilidadeNome: 'Motor de Busca (T.I.)' },
  { origemNome: 'Trabalhador Rural', habilidadeNome: 'Desbravador (Trabalhador Rural)' },
  { origemNome: 'Trambiqueiro', habilidadeNome: 'Impostor (Trambiqueiro)' },
  { origemNome: 'Universitário', habilidadeNome: 'Dedicação (Universitário)' },
  { origemNome: 'Vítima', habilidadeNome: 'Cicatrizes Psicológicas (Vítima)' },
] satisfies SeedHabilidadeOrigemVinculo[];

export async function seedHabilidadesOrigem(prisma: PrismaClient) {
  console.log('Cadastrando habilidades de origem...');

  for (const h of habilidadesOrigemSeed) {
    await prisma.habilidade.upsert({
      where: { nome: h.nome },
      update: {
        tipo: h.tipo,
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

  console.log('Vinculando habilidades -> origens (limpando e recriando)...');

  // ✅ mesmo padrão: apaga só os vínculos cujo lado "habilidade" é do tipo ORIGEM
  await prisma.habilidadeOrigem.deleteMany({
    where: {
      habilidade: {
        tipo: 'ORIGEM',
      },
    },
  });

  const get = createLookupCache(prisma);

  for (const v of habilidadesOrigemVinculosSeed) {
    const origemId = await get.origemId(v.origemNome);
    const habilidadeId = await get.habilidadeId(v.habilidadeNome);

    await prisma.habilidadeOrigem.create({
      data: { origemId, habilidadeId },
    });
  }
  
  console.log(`✅ ${habilidadesOrigemSeed.length} habilidades de origem cadastradas!\n`);
}
