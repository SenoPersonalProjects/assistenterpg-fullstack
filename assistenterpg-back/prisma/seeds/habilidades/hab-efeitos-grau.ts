import type { PrismaClient } from '@prisma/client';
import type { SeedHabilidadeEfeitoGrau } from '../_types';
import { createLookupCache, jsonOrNull } from '../_helpers';

export const habilidadesEfeitosGrauSeed: SeedHabilidadeEfeitoGrau[] = [
  { habilidadeNome: 'Chamariz', tipoGrauCodigo: 'TECNICA_SHIKIGAMI', valor: 1, escalonamentoPorNivel: null },
  { habilidadeNome: 'Escolha do Mestre de Barreiras', tipoGrauCodigo: 'TECNICA_BARREIRA', valor: 1, escalonamentoPorNivel: null },
  { habilidadeNome: 'Escola Técnica', tipoGrauCodigo: 'TECNICA_AMALDICOADA', valor: 1, escalonamentoPorNivel: null },
];

export async function seedHabilidadesEfeitosGrau(prisma: PrismaClient) {
  console.log('Cadastrando efeitos de grau concedidos por habilidades...');

  await prisma.habilidadeEfeitoGrau.deleteMany({});

  const get = createLookupCache(prisma);

  for (const item of habilidadesEfeitosGrauSeed) {
    const habilidadeId = await get.habilidadeId(item.habilidadeNome);

    // valida que o TipoGrau existe (o helper lança erro se não existir)
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
