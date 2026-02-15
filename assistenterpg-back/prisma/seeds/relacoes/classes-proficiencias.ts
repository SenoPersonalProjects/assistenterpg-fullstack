import type { PrismaClient } from '@prisma/client';
import type { SeedClasseProficiencia } from '../_types';
import { createLookupCache } from '../_helpers';

export const classesProficienciasSeed: SeedClasseProficiencia[] = [
  { classeNome: 'Combatente', proficienciaCodigo: 'ARMAS_SIMPLES' },
  { classeNome: 'Combatente', proficienciaCodigo: 'ARMAS_TATICAS' },
  { classeNome: 'Combatente', proficienciaCodigo: 'PROTECOES_LEVES' },

  { classeNome: 'Sentinela', proficienciaCodigo: 'ARMAS_SIMPLES' },
  { classeNome: 'Sentinela', proficienciaCodigo: 'ARMAS_TATICAS' },

  { classeNome: 'Especialista', proficienciaCodigo: 'ARMAS_SIMPLES' },
  { classeNome: 'Especialista', proficienciaCodigo: 'PROTECOES_LEVES' },
];

export async function seedClassesProficiencias(prisma: PrismaClient) {
  console.log('Vinculando classe -> proficiências...');

  const get = createLookupCache(prisma);

  for (const item of classesProficienciasSeed) {
    const classeId = await get.classeId(item.classeNome);
    const proficienciaId = await get.proficienciaId(item.proficienciaCodigo);

    await prisma.classeProficiencia.upsert({
      where: { classeId_proficienciaId: { classeId, proficienciaId } },
      update: {},
      create: { classeId, proficienciaId },
    });
  }
}
