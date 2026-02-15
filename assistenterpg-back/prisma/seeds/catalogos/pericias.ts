import type { PrismaClient } from '@prisma/client';
import { AtributoBase } from '@prisma/client';
import type { SeedPericia } from '../_types';

export const periciasSeed: SeedPericia[] = [
  {
    codigo: 'ACROBACIA',
    nome: 'Acrobacia',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: true,
    precisaKit: false,
    descricao:
      'Equilíbrio, saltos, rolamentos e outras manobras corporais usadas para se mover em terrenos difíceis ou evitar quedas.',
  },
  {
    codigo: 'ADESTRAMENTO',
    nome: 'Adestramento',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Lidar, treinar e acalmar animais, além de conduzir montarias em situações de risco.',
  },
  {
    codigo: 'ARTES',
    nome: 'Artes',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Expressão artística em música, atuação, dança, escrita ou artes visuais, usada para impressionar ou influenciar plateias.',
  },
  {
    codigo: 'ATLETISMO',
    nome: 'Atletismo',
    atributoBase: AtributoBase.FOR,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao: 'Corrida, escalada, natação e saltos, representando condicionamento físico bruto.',
  },
  {
    codigo: 'ATUALIDADES',
    nome: 'Atualidades',
    atributoBase: AtributoBase.INT,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao: 'Conhecimento de notícias, política, cultura pop e fatos gerais do mundo moderno.',
  },
  {
    codigo: 'CIENCIAS',
    nome: 'Ciências',
    atributoBase: AtributoBase.INT,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao: 'Conhecimento acadêmico em áreas como física, química, biologia e matemática aplicada.',
  },
  {
    codigo: 'CRIME',
    nome: 'Crime',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: true,
    penalizaPorCarga: true,
    precisaKit: true,
    descricao:
      'Arrombamento, furto, sabotagem e outras ações ilegais que exigem técnica e discrição.',
  },
  {
    codigo: 'DIPLOMACIA',
    nome: 'Diplomacia',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Negociação, mediação de conflitos e construção de acordos por meio de conversa educada.',
  },
  {
    codigo: 'ENGANACAO',
    nome: 'Enganação',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: true,
    descricao:
      'Blefar, mentir, falsear documentos e montar disfarces convincentes para enganar outras pessoas.',
  },
  {
    codigo: 'FORTITUDE',
    nome: 'Fortitude',
    atributoBase: AtributoBase.VIG,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Resistência física a venenos, doenças, fadiga, esforço prolongado e outros efeitos corporais.',
  },
  {
    codigo: 'FURTIVIDADE',
    nome: 'Furtividade',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: true,
    precisaKit: false,
    descricao:
      'Se esconder, se mover em silêncio e evitar ser notado por sentinelas ou maldições.',
  },
  {
    codigo: 'INICIATIVA',
    nome: 'Iniciativa',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Reação rápida a perigo, definindo quem age primeiro em situações de combate.',
  },
  {
    codigo: 'INTIMIDACAO',
    nome: 'Intimidação',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Coagir, ameaçar ou pressionar alguém usando presença, postura ou violência implícita.',
  },
  {
    codigo: 'INTUICAO',
    nome: 'Intuição',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Perceber emoções, detectar mentiras e sentir que algo está errado mesmo sem prova direta.',
  },
  {
    codigo: 'INVESTIGACAO',
    nome: 'Investigação',
    atributoBase: AtributoBase.INT,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Analisar cenas, documentos e pistas para reconstruir eventos e descobrir informações escondidas.',
  },
  {
    codigo: 'LUTA',
    nome: 'Luta',
    atributoBase: AtributoBase.FOR,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Combate corpo a corpo, agarres, derrubadas e uso de armas de curto alcance.',
  },
  {
    codigo: 'MEDICINA',
    nome: 'Medicina',
    atributoBase: AtributoBase.INT,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: true,
    descricao:
      'Primeiros socorros, tratamento de ferimentos, diagnóstico de doenças e cuidados prolongados.',
  },
  {
    codigo: 'JUJUTSU',
    nome: 'Jujutsu',
    atributoBase: AtributoBase.INT,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Uso teórico e prático de técnicas amaldiçoadas, leitura de energia e conjuração de feitiços.',
  },
  {
    codigo: 'PERCEPCAO',
    nome: 'Percepção',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Observar detalhes, perceber sons, localizar ameaças escondidas e notar armadilhas.',
  },
  {
    codigo: 'PONTARIA',
    nome: 'Pontaria',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Usar armas de disparo e ataques à distância com precisão, de pistolas a rifles.',
  },
  {
    codigo: 'PROFISSAO',
    nome: 'Profissão',
    atributoBase: AtributoBase.INT,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Conhecimentos e rotinas de uma área profissional específica, incluindo contatos e práticas do ofício.',
  },
  {
    codigo: 'REFLEXOS',
    nome: 'Reflexos',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Reagir a explosões, armadilhas e ataques súbitos, esquivando ou suportando impactos.',
  },
  {
    codigo: 'RELIGIAO',
    nome: 'Religião',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Conhecimento de doutrinas, ritos e mitos espirituais, incluindo usos de fé contra maldições.',
  },
  {
    codigo: 'TATICA',
    nome: 'Tática',
    atributoBase: AtributoBase.INT,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Analisar o campo de batalha, planejar abordagens, emboscadas e posicionamento estratégico.',
  },
  {
    codigo: 'TECNOLOGIA',
    nome: 'Tecnologia',
    atributoBase: AtributoBase.INT,
    somenteTreinada: true,
    penalizaPorCarga: false,
    precisaKit: true,
    descricao:
      'Usar, reparar e invadir sistemas, eletrônicos e dispositivos avançados, inclusive amaldiçoados.',
  },
  {
    codigo: 'SOBREVIVENCIA',
    nome: 'Sobrevivência',
    atributoBase: AtributoBase.INT,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Encontrar abrigo, comida, água e trilhas em ambientes hostis, além de rastrear alvos.',
  },
  {
    codigo: 'VONTADE',
    nome: 'Vontade',
    atributoBase: AtributoBase.PRE,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Resistência mental a efeitos de medo, controle, tormento psíquico e votos vinculativos.',
  },
  {
    codigo: 'PILOTAGEM',
    nome: 'Pilotagem',
    atributoBase: AtributoBase.AGI,
    somenteTreinada: false,
    penalizaPorCarga: false,
    precisaKit: false,
    descricao:
      'Conduzir veículos terrestres, aquáticos ou aéreos em condições normais ou perigosas.',
  },
];

export async function seedPericias(prisma: PrismaClient) {
  console.log('Cadastrando perícias...');
  for (const data of periciasSeed) {
    await prisma.pericia.upsert({
      where: { codigo: data.codigo },
      update: {
        nome: data.nome,
        atributoBase: data.atributoBase,
        somenteTreinada: data.somenteTreinada,
        penalizaPorCarga: data.penalizaPorCarga,
        precisaKit: data.precisaKit,
        descricao: data.descricao,
      },
      create: data,
    });
  }
}
