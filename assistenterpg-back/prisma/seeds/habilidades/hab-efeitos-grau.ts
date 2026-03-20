import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidadeEfeitoGrau } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';
import {
  HABILIDADE_ESCOLA_TECNICA_CODIGO,
  HABILIDADE_ESCOLA_TECNICA_NOME,
} from '../_constants';

export const habilidadesEfeitosGrauSeed: SeedHabilidadeEfeitoGrau[] = [
  {
    habilidadeNome: 'Chamariz',
    tipoGrauCodigo: 'TECNICA_SHIKIGAMI',
    valor: 1,
    escalonamentoPorNivel: null,
  },
  {
    habilidadeNome: 'Escolha do Mestre de Barreiras',
    tipoGrauCodigo: 'TECNICA_BARREIRA',
    valor: 1,
    escalonamentoPorNivel: null,
  },
  {
    habilidadeCodigo: HABILIDADE_ESCOLA_TECNICA_CODIGO,
    habilidadeNome: HABILIDADE_ESCOLA_TECNICA_NOME,
    tipoGrauCodigo: 'TECNICA_AMALDICOADA',
    valor: 1,
    escalonamentoPorNivel: null,
  },
];

export async function seedHabilidadesEfeitosGrau(prisma: PrismaClient) {
  console.log('Cadastrando efeitos de grau concedidos por habilidades...');

  await prisma.habilidadeEfeitoGrau.deleteMany({});

  const get = createLookupCache(prisma);

  for (const item of habilidadesEfeitosGrauSeed) {
    let habilidadeId: number | null = null;

    if (item.habilidadeCodigo) {
      const habilidade = await prisma.habilidade.findUnique({
        where: { codigo: item.habilidadeCodigo },
        select: { id: true },
      });
      habilidadeId = habilidade?.id ?? null;
    }

    if (!habilidadeId && item.habilidadeNome) {
      const habilidade = await prisma.habilidade.findUnique({
        where: { nome: item.habilidadeNome },
        select: { id: true, codigo: true },
      });
      habilidadeId = habilidade?.id ?? null;

      if (
        habilidade &&
        item.habilidadeCodigo &&
        !habilidade.codigo
      ) {
        await prisma.habilidade.update({
          where: { id: habilidade.id },
          data: { codigo: item.habilidadeCodigo },
        });
      }
    }

    if (!habilidadeId) {
      console.warn(
        `[seed] Habilidade nao encontrada para efeito de grau: "${
          item.habilidadeCodigo ?? item.habilidadeNome ?? 'desconhecida'
        }"`,
      );
      continue;
    }

    // valida que o TipoGrau existe (o helper lanÃ§a erro se nÃ£o existir)
    await get.tipoGrauCodigo(item.tipoGrauCodigo);

    await prisma.habilidadeEfeitoGrau.create({
      data: {
        habilidadeId,
        tipoGrauCodigo: item.tipoGrauCodigo,
        valor: item.valor ?? 1,
        escalonamentoPorNivel: jsonOrNull(item.escalonamentoPorNivel ?? null),
      },
    });
  }
}
