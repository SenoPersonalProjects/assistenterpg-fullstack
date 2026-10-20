import { Prisma } from '@prisma/client';

/** O histórico de transições pode restaurar uma cena anterior sem apagá-las. */
export async function buscarCenaAtualSessao(
  tx: Pick<Prisma.TransactionClient, 'cena' | 'eventoSessao'>,
  sessaoId: number,
): Promise<{ id: number } | null> {
  const transicao = await tx.eventoSessao.findFirst({
    where: {
      sessaoId,
      tipoEvento: { in: ['CENA_ATUALIZADA', 'CENA_DESFEITA'] },
    },
    orderBy: { id: 'desc' },
    select: { cenaId: true },
  });
  if (transicao?.cenaId != null) {
    const restaurada = await tx.cena.findFirst({
      where: { sessaoId, id: transicao.cenaId },
      select: { id: true },
    });
    if (restaurada) return restaurada;
  }
  return tx.cena.findFirst({
    where: { sessaoId },
    orderBy: { id: 'desc' },
    select: { id: true },
  });
}

export function controleTurnosAtivo(tipoCena: string): boolean {
  return !['LIVRE', 'BASE'].includes(tipoCena);
}
