import { Prisma } from '@prisma/client';
import {
  OperacaoConcorrenteException,
  PersonagemCampanhaNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';
import { MacroPersonagemNaoEncontradaException } from 'src/common/exceptions/macro-personagem.exception';

const MAX_TENTATIVAS_CONCORRENCIA = 3;
const ESPERA_BASE_RETRY_MS = 20;

export async function bloquearPersonagemCampanhaTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  personagemCampanhaId: number,
): Promise<void> {
  const registros = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM PersonagemCampanha
    WHERE id = ${personagemCampanhaId}
      AND campanhaId = ${campanhaId}
    FOR UPDATE
  `);

  if (registros.length === 0) {
    throw new PersonagemCampanhaNaoEncontradoException(personagemCampanhaId);
  }
}

export async function bloquearMacroPersonagemCampanhaTx(
  tx: Prisma.TransactionClient,
  campanhaId: number,
  personagemCampanhaId: number,
  macroId: number,
): Promise<void> {
  const registros = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT id
    FROM PersonagemCampanhaMacro
    WHERE id = ${macroId}
      AND campanhaId = ${campanhaId}
      AND personagemCampanhaId = ${personagemCampanhaId}
      AND ativo = TRUE
    FOR UPDATE
  `);

  if (registros.length === 0) {
    throw new MacroPersonagemNaoEncontradaException(macroId);
  }
}

export async function executarComRetryConcorrencia<T>(
  acao: string,
  operacao: () => Promise<T>,
): Promise<T> {
  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS_CONCORRENCIA;
    tentativa += 1
  ) {
    try {
      return await operacao();
    } catch (error) {
      if (!erroPrismaConcorrencia(error)) throw error;
      if (tentativa === MAX_TENTATIVAS_CONCORRENCIA) {
        throw new OperacaoConcorrenteException(acao, tentativa);
      }
      await esperar(ESPERA_BASE_RETRY_MS * tentativa);
    }
  }

  throw new OperacaoConcorrenteException(acao, MAX_TENTATIVAS_CONCORRENCIA);
}

function erroPrismaConcorrencia(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  );
}

function esperar(tempoMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, tempoMs));
}
