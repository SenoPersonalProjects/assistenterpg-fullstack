import type { PrismaClient } from '@prisma/client';
import type { SeedClassePericia } from '../_types';
import { createLookupCache } from '../_helpers';

export const classesPericiasSeed: SeedClassePericia[] = [
  { classeNome: 'Combatente', periciaCodigo: 'LUTA', tipo: 'ESCOLHA', grupoEscolha: 1 },
  { classeNome: 'Combatente', periciaCodigo: 'PONTARIA', tipo: 'ESCOLHA', grupoEscolha: 1 },
  { classeNome: 'Combatente', periciaCodigo: 'FORTITUDE', tipo: 'ESCOLHA', grupoEscolha: 2 },
  { classeNome: 'Combatente', periciaCodigo: 'REFLEXOS', tipo: 'ESCOLHA', grupoEscolha: 2 },

  { classeNome: 'Sentinela', periciaCodigo: 'LUTA', tipo: 'ESCOLHA', grupoEscolha: 1 },
  { classeNome: 'Sentinela', periciaCodigo: 'PONTARIA', tipo: 'ESCOLHA', grupoEscolha: 1 },
  { classeNome: 'Sentinela', periciaCodigo: 'TATICA', tipo: 'FIXA' },
];

export async function seedClassesPericias(prisma: PrismaClient) {
  console.log('Vinculando classe -> perícias...');

  const get = createLookupCache(prisma);

  for (const item of classesPericiasSeed) {
    const classeId = await get.classeId(item.classeNome);
    const periciaId = await get.periciaId(item.periciaCodigo);

    await prisma.classePericia.upsert({
      where: { classeId_periciaId: { classeId, periciaId } },
      update: {
        tipo: item.tipo,
        grupoEscolha: item.grupoEscolha ?? null,
      },
      create: {
        classeId,
        periciaId,
        tipo: item.tipo,
        grupoEscolha: item.grupoEscolha ?? null,
      },
    });
  }
}
