import type { PrismaClient } from '@prisma/client';
import { AtributoPassiva } from '@prisma/client';
import type { SeedPassivaAtributo } from '../_types';
import { jsonOrNull } from '../_helpers';

export const passivasAtributosSeed: SeedPassivaAtributo[] = [
  // ========== AGILIDADE ==========
  {
    codigo: 'AGI_I',
    nome: 'Agilidade I',
    atributo: AtributoPassiva.AGILIDADE,
    nivel: 1,
    requisito: 3,
    descricao: 'Recebe +6m de deslocamento.',
    efeitos: { deslocamento: 6 },
  },
  {
    codigo: 'AGI_II',
    nome: 'Agilidade II',
    atributo: AtributoPassiva.AGILIDADE,
    nivel: 2,
    requisito: 6,
    descricao: 'Recebe +9m de deslocamento e +1 reação por rodada.',
    efeitos: { deslocamento: 9, reacoes: 1 },
  },

  // ========== FORÇA ==========
  {
    codigo: 'FOR_I',
    nome: 'Força I',
    atributo: AtributoPassiva.FORCA,
    nivel: 1,
    requisito: 3,
    descricao: 'Aumenta o dano corpo a corpo em 1 passo (ex: 1d6 → 1d8).',
    efeitos: { passosDanoCorpoACorpo: 1 },
  },
  {
    codigo: 'FOR_II',
    nome: 'Força II',
    atributo: AtributoPassiva.FORCA,
    nivel: 2,
    requisito: 6,
    descricao:
      'Aumenta mais 1 passo no dano corpo a corpo e concede +1 dado de dano em ataques que usam Força.',
    efeitos: { passosDanoCorpoACorpo: 2, dadosDanoCorpoACorpo: 1 },
  },

  // ========== INTELECTO ==========
  {
    codigo: 'INT_I',
    nome: 'Intelecto I',
    atributo: AtributoPassiva.INTELECTO,
    nivel: 1,
    requisito: 3,
    descricao: '+1 perícia ou proficiência extra e aumenta o treinamento de uma perícia.',
    efeitos: { periciasExtras: 1, proficienciasExtras: 1, grauTreinamentoExtra: 1 },
  },
  {
    codigo: 'INT_II',
    nome: 'Intelecto II',
    atributo: AtributoPassiva.INTELECTO,
    nivel: 2,
    requisito: 6,
    descricao:
      '+2 perícias/proficiências extras, aumenta o treinamento de uma perícia e recebe +1 grau de aprimoramento.',
    efeitos: {
      periciasExtras: 2,
      proficienciasExtras: 2,
      grauTreinamentoExtra: 1,
      grauAprimoramentoExtra: 1,
    },
  },

  // ========== PRESENÇA ==========
  {
    codigo: 'PRE_I',
    nome: 'Presença I',
    atributo: AtributoPassiva.PRESENCA,
    nivel: 1,
    requisito: 3,
    descricao: '+1 rodada antes de sucumbir ao entrar Enlouquecendo.',
    efeitos: { rodadasEnlouquecendo: 1 },
  },
  {
    codigo: 'PRE_II',
    nome: 'Presença II',
    atributo: AtributoPassiva.PRESENCA,
    nivel: 2,
    requisito: 6,
    descricao: '+1 rodada adicional em Enlouquecendo, +6 PE, +6 EA e +3 no limite de PE/EA.',
    efeitos: { rodadasEnlouquecendo: 1, peExtra: 6, eaExtra: 6, limitePeEaExtra: 3 },
  },

  // ========== VIGOR ==========
  {
    codigo: 'VIG_I',
    nome: 'Vigor I',
    atributo: AtributoPassiva.VIGOR,
    nivel: 1,
    requisito: 3,
    descricao: '+1 rodada antes de morrer ao entrar em Morrendo.',
    efeitos: { rodadasMorrendo: 1 },
  },
  {
    codigo: 'VIG_II',
    nome: 'Vigor II',
    atributo: AtributoPassiva.VIGOR,
    nivel: 2,
    requisito: 6,
    descricao: '+1 rodada adicional em Morrendo e soma o limite de PE/EA na vida máxima.',
    efeitos: { rodadasMorrendo: 1, pvExtraLimitePeEa: true },
  },
];

export async function seedPassivasAtributos(prisma: PrismaClient) {
  console.log('Cadastrando passivas de atributos...');

  for (const p of passivasAtributosSeed) {
    await prisma.passivaAtributo.upsert({
      where: { codigo: p.codigo },
      update: {
        nome: p.nome,
        atributo: p.atributo,
        nivel: p.nivel,
        requisito: p.requisito ?? 3,
        descricao: p.descricao,
        efeitos: jsonOrNull(p.efeitos ?? null),
      },
      create: {
        codigo: p.codigo,
        nome: p.nome,
        atributo: p.atributo,
        nivel: p.nivel,
        requisito: p.requisito ?? 3,
        descricao: p.descricao,
        efeitos: jsonOrNull(p.efeitos ?? null),
      },
    });
  }
}
