// prisma/seeds/catalogos/classes.ts

import type { PrismaClient } from '@prisma/client';
import { TipoFonte } from '@prisma/client';
import type { SeedClasse } from '../_types';

export const classesSeed: SeedClasse[] = [
  {
    nome: 'Combatente',
    descricao:
      'Especialista em confronto direto, focado em ataques corpo a corpo e uso agressivo de PE/EA para amplificar golpes.',
    periciasLivresBase: 2,
  },
  {
    nome: 'Sentinela',
    descricao:
      'Controlador de campo e atirador tático, atuando em média e longa distância e manipulando o grau das técnicas.',
    periciasLivresBase: 3,
  },
  {
    nome: 'Especialista',
    descricao:
      'Classe versátil voltada para suporte, perícias e usos criativos de Jujutsu, como curas, barreiras ou truques específicos.',
    periciasLivresBase: 6,
  },
];

export async function seedClasses(prisma: PrismaClient) {
  console.log('Cadastrando classes...');
  
  for (const data of classesSeed) {
    await prisma.classe.upsert({
      where: { nome: data.nome },
      update: {
        descricao: data.descricao,
        periciasLivresBase: data.periciasLivresBase,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        nome: data.nome,
        descricao: data.descricao,
        periciasLivresBase: data.periciasLivresBase,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  
  console.log(`✅ ${classesSeed.length} classes cadastradas!\n`);
}
