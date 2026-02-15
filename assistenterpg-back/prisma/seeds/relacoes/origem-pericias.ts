// prisma/seeds/relacoes/origem-pericias.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedOrigemPericias } from '../_types';
import { createLookupCache } from '../_helpers';

export const origemPericiasSeed: SeedOrigemPericias[] = [
  {
    origemNome: 'Mestre de Maldições',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'INTIMIDACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Prodígio do Clã',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'LUTA', tipo: 'ESCOLHA', grupoEscolha: 1 },
      { codigo: 'PONTARIA', tipo: 'ESCOLHA', grupoEscolha: 1 },
    ],
  },
  {
    origemNome: 'Renegado',
    pericias: [
      { codigo: 'VONTADE', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Acadêmico',
    pericias: [
      { codigo: 'CIENCIAS', tipo: 'FIXA' },
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Agente de Saúde',
    pericias: [
      { codigo: 'INTUICAO', tipo: 'FIXA' },
      { codigo: 'MEDICINA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Artista',
    pericias: [
      { codigo: 'ARTES', tipo: 'FIXA' },
      { codigo: 'ENGANACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Atleta',
    pericias: [
      { codigo: 'ACROBACIA', tipo: 'FIXA' },
      { codigo: 'ATLETISMO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Chef',
    pericias: [
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Criminoso',
    pericias: [
      { codigo: 'CRIME', tipo: 'FIXA' },
      { codigo: 'FURTIVIDADE', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Cultista Arrependido',
    pericias: [
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
      { codigo: 'RELIGIAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Desgarrado',
    pericias: [
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Engenheiro',
    pericias: [
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Executivo',
    pericias: [
      { codigo: 'DIPLOMACIA', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Magnata',
    pericias: [
      { codigo: 'DIPLOMACIA', tipo: 'FIXA' },
      { codigo: 'PILOTAGEM', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Mercenário',
    pericias: [
      { codigo: 'INICIATIVA', tipo: 'FIXA' },
      { codigo: 'INTIMIDACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Militar',
    pericias: [
      { codigo: 'PONTARIA', tipo: 'FIXA' },
      { codigo: 'TATICA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Operário',
    pericias: [
      { codigo: 'FORTITUDE', tipo: 'FIXA' },
      { codigo: 'PROFISSAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Policial',
    pericias: [
      { codigo: 'PERCEPCAO', tipo: 'FIXA' },
      { codigo: 'PONTARIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Religioso',
    pericias: [
      { codigo: 'RELIGIAO', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Servidor Público',
    pericias: [
      { codigo: 'INTUICAO', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Teórico da Conspiração',
    pericias: [
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
      { codigo: 'JUJUTSU', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'T.I.',
    pericias: [
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
      { codigo: 'TECNOLOGIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Trabalhador Rural',
    pericias: [
      { codigo: 'ADESTRAMENTO', tipo: 'FIXA' },
      { codigo: 'SOBREVIVENCIA', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Trambiqueiro',
    pericias: [
      { codigo: 'CRIME', tipo: 'FIXA' },
      { codigo: 'ENGANACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Universitário',
    pericias: [
      { codigo: 'ATUALIDADES', tipo: 'FIXA' },
      { codigo: 'INVESTIGACAO', tipo: 'FIXA' },
    ],
  },
  {
    origemNome: 'Vítima',
    pericias: [
      { codigo: 'REFLEXOS', tipo: 'FIXA' },
      { codigo: 'VONTADE', tipo: 'FIXA' },
    ],
  },
];

export async function seedOrigemPericias(prisma: PrismaClient) {
  console.log('Vinculando origem -> perícias...');

  const get = createLookupCache(prisma);

  for (const item of origemPericiasSeed) {
    const origemId = await get.origemId(item.origemNome);

    for (const p of item.pericias) {
      const periciaId = await get.periciaId(p.codigo);

      await prisma.origemPericia.upsert({
        where: { origemId_periciaId: { origemId, periciaId } },
        update: {
          tipo: p.tipo,
          grupoEscolha: p.grupoEscolha ?? null,
        },
        create: {
          origemId,
          periciaId,
          tipo: p.tipo,
          grupoEscolha: p.grupoEscolha ?? null,
        },
      });
    }
  }
  
  console.log(`✅ Vínculos origem->perícias cadastrados!\n`);
}
