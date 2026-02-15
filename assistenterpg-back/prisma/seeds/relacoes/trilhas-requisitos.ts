// prisma/seeds/relacoes/trilhas-requisitos.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedTrilhaRequisitos } from '../_types';
import { jsonOrNull } from '../_helpers';

export const trilhasRequisitosSeed: SeedTrilhaRequisitos[] = [
  {
    trilhaNome: 'Médico de Campo',
    requisitos: {
      pericias: [{ codigo: 'MEDICINA', treinada: true }],
    },
  },
];

export async function seedTrilhasRequisitos(prisma: PrismaClient) {
  console.log('Aplicando requisitos das trilhas...');

  for (const item of trilhasRequisitosSeed) {
    await prisma.trilha.update({
      where: { nome: item.trilhaNome },
      data: { requisitos: jsonOrNull(item.requisitos ?? null) },
    });
  }
  
  console.log(`✅ ${trilhasRequisitosSeed.length} requisitos de trilhas aplicados!\n`);
}
