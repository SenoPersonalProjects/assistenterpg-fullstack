import { Prisma } from '@prisma/client';
import {
  NpcSessaoNaoEncontradoException,
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

export async function bloquearNpcSessaoTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  sessaoId: number,
  npcSessaoId: number,
): Promise<void> {
  const registros = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT npc.id
    FROM NpcAmeacaSessao npc
    INNER JOIN Sessao sessao ON sessao.id = npc.sessaoId
    WHERE npc.id = ${npcSessaoId}
      AND npc.sessaoId = ${sessaoId}
      AND sessao.campanhaId = ${campanhaId}
    FOR UPDATE
  `);

  if (registros.length === 0) {
    throw new NpcSessaoNaoEncontradoException(
      npcSessaoId,
      sessaoId,
      campanhaId,
    );
  }
}

export async function bloquearItemInventarioCampanhaTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  itemInventarioCampanhaId: number,
): Promise<void> {
  await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT item.id
    FROM \`inventario_item_campanha\` item
    INNER JOIN PersonagemCampanha personagem
      ON personagem.id = item.personagemCampanhaId
    WHERE item.id = ${itemInventarioCampanhaId}
      AND personagem.campanhaId = ${campanhaId}
    FOR UPDATE
  `);
}

export async function bloquearCondicaoSessaoTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  condicaoSessaoId: number,
): Promise<void> {
  await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM CondicaoPersonagemSessao
    WHERE id = ${condicaoSessaoId}
      AND sessaoId = ${sessaoId}
    FOR UPDATE
  `);
}

export async function bloquearSustentacaoSessaoTx(
  tx: Prisma.TransactionClient,
  sessaoId: number,
  sustentacaoId: number,
): Promise<void> {
  await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM PersonagemSessaoHabilidadeSustentada
    WHERE id = ${sustentacaoId}
      AND sessaoId = ${sessaoId}
    FOR UPDATE
  `);
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
