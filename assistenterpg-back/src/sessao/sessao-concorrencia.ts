import { Prisma } from '@prisma/client';
import {
  SessaoCampanhaNaoEncontradaException,
  SessaoEventoNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';

export async function bloquearSessaoTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  sessaoId: number,
): Promise<void> {
  const registros = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM Sessao
    WHERE id = ${sessaoId}
      AND campanhaId = ${campanhaId}
    FOR UPDATE
  `);

  if (registros.length === 0) {
    throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
  }
}

export async function bloquearEventoSessaoTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  sessaoId: number,
  eventoId: number,
): Promise<void> {
  const registros = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT evento.id
    FROM EventoSessao evento
    INNER JOIN Sessao sessao ON sessao.id = evento.sessaoId
    WHERE evento.id = ${eventoId}
      AND evento.sessaoId = ${sessaoId}
      AND sessao.campanhaId = ${campanhaId}
    FOR UPDATE
  `);

  if (registros.length === 0) {
    throw new SessaoEventoNaoEncontradoException(
      eventoId,
      sessaoId,
      campanhaId,
    );
  }
}

export async function bloquearRegraOpcionalSessaoTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  chave: string,
): Promise<void> {
  await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM SessaoRegraOpcional
    WHERE sessaoId = ${sessaoId}
      AND chave = ${chave}
    FOR UPDATE
  `);
}
