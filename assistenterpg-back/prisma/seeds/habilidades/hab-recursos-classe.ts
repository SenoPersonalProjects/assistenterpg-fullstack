// prisma/seeds/catalogos/hab-recursos-classe.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidade, SeedHabilidadeClasseVinculo } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';
import { TipoFonte } from '@prisma/client'; // ✅ NOVO

export const habilidadesRecursosClasseSeed: SeedHabilidade[] = [
  {
    nome: 'Ataque Especial',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Quando faz um ataque, pode gastar PE para aumentar o resultado do teste de ataque ou do dano. Nível 1 gasta 2 PE para 5 no teste ou dano. Nível 5 gasta 3 PE para 10. Nível 11 gasta 4 PE para 15. Nível 17 gasta 5 PE para 20.',
  },
  {
    nome: 'Aprimorado',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Pode gastar PE/EA para aumentar temporariamente o grau de aprimoramento de técnicas Jujutsu não-inatas até o fim da cena. Nível 1 gasta 2 PE para 1 grau. Nível 5 gasta 3 PE para 2 graus. Nível 11 gasta 4 PE para 3 graus. Nível 17 gasta 5 PE para 4 graus. Limite de 2 graus temporários na mesma técnica.',
  },
  {
    nome: 'Perito',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Escolhe duas perícias treinadas. Ao fazer teste com elas, pode gastar PE para somar um dado extra ao resultado. Nível 1 gasta 2 PE para 1d6. Nível 5 gasta 3 PE para 1d8. Nível 11 gasta 4 PE para 1d10. Nível 17 gasta 5 PE para 1d12.',
  },
];

export const habilidadesRecursosClasseVinculosSeed: SeedHabilidadeClasseVinculo[] = [
  { habilidadeNome: 'Ataque Especial', classeNome: 'Combatente', nivelConcedido: 1 },
  { habilidadeNome: 'Aprimorado', classeNome: 'Sentinela', nivelConcedido: 1 },
  { habilidadeNome: 'Perito', classeNome: 'Especialista', nivelConcedido: 1 },
];

export async function seedHabilidadesRecursosClasse(prisma: PrismaClient) {
  console.log('📌 Cadastrando habilidades: recursos de classe...');

  for (const h of habilidadesRecursosClasseSeed) {
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

  console.log(`✅ ${habilidadesRecursosClasseSeed.length} recursos de classe cadastrados!`);

  console.log('📌 Vinculando habilidades → classes (limpando e recriando)...');

  await prisma.habilidadeClasse.deleteMany({
    where: {
      habilidade: {
        tipo: 'RECURSO_CLASSE',
      },
    },
  });

  const get = createLookupCache(prisma);

  for (const v of habilidadesRecursosClasseVinculosSeed) {
    const habilidadeId = await get.habilidadeId(v.habilidadeNome);
    const classeId = await get.classeId(v.classeNome);

    await prisma.habilidadeClasse.create({
      data: {
        habilidadeId,
        classeId,
        nivelConcedido: v.nivelConcedido,
      },
    });
  }

  console.log('✅ Vínculos de recursos de classe criados!\n');
}
