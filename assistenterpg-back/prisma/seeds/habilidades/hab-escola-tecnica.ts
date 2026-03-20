// prisma/seeds/catalogos/hab-escola-tecnica.ts

import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidade } from '../_types';
import { jsonOrNull } from '../_helpers';
import { TipoFonte } from '@prisma/client'; // ✅ NOVO
import {
  HABILIDADE_ESCOLA_TECNICA_CODIGO,
  HABILIDADE_ESCOLA_TECNICA_NOME,
} from '../_constants';

export const habilidadeEscolaTecnicaSeed: SeedHabilidade = {
  nome: HABILIDADE_ESCOLA_TECNICA_NOME,
  codigo: HABILIDADE_ESCOLA_TECNICA_CODIGO,
  tipo: 'GERAL',
  descricao:
    'Estudou em uma escola t\u00e9cnica de Jujutsu, ganhando treinamento formal em t\u00e9cnicas amaldi\u00e7oadas.',
  hereditaria: false,
};

export async function seedHabilidadeEscolaTecnica(prisma: PrismaClient) {
  console.log(
    `\ud83d\udccc Cadastrando habilidade: ${HABILIDADE_ESCOLA_TECNICA_NOME}...`,
  );

  const h = habilidadeEscolaTecnicaSeed;

  await prisma.habilidade.upsert({
    where: { nome: h.nome },
    update: {
      codigo: h.codigo ?? null,
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
      codigo: h.codigo ?? null,
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

  console.log(
    `\u2705 Habilidade "${HABILIDADE_ESCOLA_TECNICA_NOME}" cadastrada!\n`,
  );
}
