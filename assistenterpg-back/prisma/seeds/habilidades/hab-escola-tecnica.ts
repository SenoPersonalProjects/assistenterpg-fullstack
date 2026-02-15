// prisma/seeds/catalogos/hab-escola-tecnica.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidade } from '../_types';
import { jsonOrNull } from '../_helpers';
import { TipoFonte } from '@prisma/client'; // ✅ NOVO

export const habilidadeEscolaTecnicaSeed: SeedHabilidade = {
  nome: 'Escola Técnica',
  tipo: 'GERAL',
  descricao:
    'Estudou em uma escola técnica de Jujutsu, ganhando treinamento formal em técnicas amaldiçoadas.',
  hereditaria: false,
};

export async function seedHabilidadeEscolaTecnica(prisma: PrismaClient) {
  console.log('📌 Cadastrando habilidade: Escola Técnica...');

  const h = habilidadeEscolaTecnicaSeed;

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

  console.log('✅ Habilidade "Escola Técnica" cadastrada!\n');
}
