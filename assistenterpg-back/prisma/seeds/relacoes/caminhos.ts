// prisma/seeds/relacoes/caminhos.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedCaminho } from '../_types';
import { createLookupCache } from '../_helpers';

export const caminhosSeed: SeedCaminho[] = [
  {
    trilhaNome: 'Mestre de Barreiras',
    nome: 'Domínio Perfeito',
    descricao: 'Caminho focado em fortalecer o próprio domínio.',
  },
  {
    trilhaNome: 'Mestre de Barreiras',
    nome: 'Anulador de Barreiras',
    descricao: 'Caminho focado em anti-domínio.',
  },
  {
    trilhaNome: 'Mestre de Barreiras',
    nome: 'Apoio de Campo',
    descricao: 'Caminho focado em cortinas e suporte.',
  },
];

export async function seedCaminhos(prisma: PrismaClient) {
  console.log('Cadastrando caminhos...');

  const get = createLookupCache(prisma);

  for (const data of caminhosSeed) {
    const trilhaId = await get.trilhaId(data.trilhaNome);

    await prisma.caminho.upsert({
      where: { nome: data.nome },
      update: {
        descricao: data.descricao ?? null,
        trilhaId,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        trilhaId,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  
  console.log(`✅ ${caminhosSeed.length} caminhos cadastrados!\n`);
}
