// prisma/seeds/catalogos/hab-recursos-classe.ts

import { TipoFonte } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidade, SeedHabilidadeClasseVinculo } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

export const habilidadesRecursosClasseSeed: SeedHabilidade[] = [
  {
    nome: 'Ataque Especial',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Quando faz um ataque, pode gastar PE para aumentar o resultado do teste de ataque ou do dano. Nivel 1 gasta 2 PE para +5 no teste ou dano. Nivel 5 gasta 3 PE para +10. Nivel 11 gasta 4 PE para +15. Nivel 17 gasta 5 PE para +20.',
  },
  {
    nome: 'Aprimorado',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Pode gastar PE para aumentar temporariamente o grau de aprimoramento de tecnicas Jujutsu nao-inatas ate o fim da cena. Nivel 1 gasta 2 PE para +1 grau. Nivel 5 gasta 3 PE para +2 graus. Nivel 11 gasta 4 PE para +3 graus. Nivel 17 gasta 5 PE para +4 graus. Limite de 2 graus temporarios na mesma tecnica.',
  },
  {
    nome: 'Perito',
    tipo: 'RECURSO_CLASSE',
    hereditaria: false,
    descricao:
      'Quando faz um teste com uma pericia na qual e treinado, exceto Luta e Pontaria, pode gastar PE para somar um dado extra ao resultado. Nivel 1 gasta 2 PE para +1d6. Nivel 5 gasta 3 PE para +1d8. Nivel 11 gasta 4 PE para +1d10. Nivel 17 gasta 5 PE para +1d12.',
  },
];

export const habilidadesRecursosClasseVinculosSeed: SeedHabilidadeClasseVinculo[] = [
  { habilidadeNome: 'Ataque Especial', classeNome: 'Combatente', nivelConcedido: 1 },
  { habilidadeNome: 'Aprimorado', classeNome: 'Sentinela', nivelConcedido: 1 },
  { habilidadeNome: 'Perito', classeNome: 'Especialista', nivelConcedido: 1 },
];

export async function seedHabilidadesRecursosClasse(prisma: PrismaClient) {
  console.log('Cadastrando habilidades: recursos de classe...');

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
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }

  console.log(`${habilidadesRecursosClasseSeed.length} recursos de classe cadastrados!`);
  console.log('Vinculando habilidades -> classes (limpando e recriando)...');

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

  console.log('Vinculos de recursos de classe criados!\n');
}
