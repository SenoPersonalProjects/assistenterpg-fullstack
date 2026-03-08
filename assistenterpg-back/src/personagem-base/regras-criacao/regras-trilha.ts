// src/personagem-base/regras-criacao/regras-trilha.ts

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  TrilhaNaoEncontradaException,
  TrilhaIncompativelException,
  TrilhaRequisitoNaoAtendidoException,
  CaminhoNaoEncontradoException,
  CaminhoSemTrilhaException,
  CaminhoIncompativelException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;
type RequisitoPericiaTrilha = { codigo: string; treinada: boolean };
type RequisitosTrilha = {
  pericias?: RequisitoPericiaTrilha[];
};

/**
 * ✅ Validar se personagem atende requisitos de trilha
 * Exemplo: Médico de Campo exige Medicina treinada
 */
export function validarRequisitosTrilha(
  requisitos: {
    pericias?: Array<{ codigo: string; treinada: boolean }>;
  } | null,
  periciasPersonagem: Array<{ codigo: string; grauTreinamento: number }>,
): { valido: boolean; mensagemErro?: string } {
  if (!requisitos?.pericias) {
    return { valido: true };
  }

  for (const req of requisitos.pericias) {
    const pericia = periciasPersonagem.find((p) => p.codigo === req.codigo);

    if (req.treinada && (!pericia || pericia.grauTreinamento < 1)) {
      return {
        valido: false,
        mensagemErro: `A trilha requer a perícia "${req.codigo}" treinada.`,
      };
    }
  }

  return { valido: true };
}

/**
 * ✅ Valida trilha/caminho e seus requisitos
 */
export async function validarTrilhaECaminho(
  classeId: number,
  trilhaId: number | null | undefined,
  caminhoId: number | null | undefined,
  periciasPersonagem:
    | Array<{ codigo: string; grauTreinamento: number }>
    | undefined,
  prisma: PrismaLike,
): Promise<void> {
  if (trilhaId) {
    const trilha = await prisma.trilha.findUnique({
      where: { id: trilhaId },
      select: { classeId: true, requisitos: true },
    });

    if (!trilha) throw new TrilhaNaoEncontradaException(trilhaId);

    if (trilha.classeId !== classeId) {
      throw new TrilhaIncompativelException();
    }

    // Validar requisitos de perícias
    if (periciasPersonagem && trilha.requisitos) {
      const validacao = validarRequisitosTrilha(
        trilha.requisitos as RequisitosTrilha,
        periciasPersonagem,
      );

      if (!validacao.valido) {
        throw new TrilhaRequisitoNaoAtendidoException(validacao.mensagemErro!);
      }
    }
  }

  if (caminhoId) {
    if (!trilhaId) {
      throw new CaminhoSemTrilhaException();
    }

    const caminho = await prisma.caminho.findUnique({
      where: { id: caminhoId },
      select: { trilhaId: true },
    });

    if (!caminho) throw new CaminhoNaoEncontradoException(caminhoId);

    if (caminho.trilhaId !== trilhaId) {
      throw new CaminhoIncompativelException();
    }
  }
}
