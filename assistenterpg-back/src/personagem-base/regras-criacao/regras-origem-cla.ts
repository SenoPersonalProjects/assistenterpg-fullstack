// src/personagem-base/regras-criacao/regras-origem-cla.ts

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ClaOuOrigemNaoEncontradoException,
  OrigemRequerGrandeClaException,
  TecnicaInataNaoEncontradaException,
  TecnicaInataTipoInvalidoException,
  OrigemRequerTecnicaHereditariaException,
  OrigemBloqueiaTecnicaHereditariaException,
  TecnicaHereditariaIncompativelException,
} from 'src/common/exceptions/personagem.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;

/**
 * ✅ Valida se a combinação origem + clã + técnica inata é válida
 */
export async function validarOrigemClaTecnica(
  claId: number,
  origemId: number,
  tecnicaInataId: number | null | undefined,
  prisma: PrismaLike,
): Promise<void> {
  const [cla, origem] = await Promise.all([
    prisma.cla.findUnique({ where: { id: claId } }),
    prisma.origem.findUnique({ where: { id: origemId } }),
  ]);

  if (!cla) throw new ClaOuOrigemNaoEncontradoException('Clã', claId);
  if (!origem) throw new ClaOuOrigemNaoEncontradoException('Origem', origemId);

  // Validar se origem requer grande clã
  if (origem.requerGrandeCla && !cla.grandeCla) {
    throw new OrigemRequerGrandeClaException(origem.nome);
  }

  // ✅ CORRIGIDO: Buscar técnica inata (se selecionada)
  if (tecnicaInataId) {
    const tecnicaInata = await prisma.tecnicaAmaldicoada.findUnique({
      where: { id: tecnicaInataId },
      select: {
        tipo: true,
        hereditaria: true,
        clas: {
          select: { claId: true },
        },
      },
    });

    if (!tecnicaInata) {
      throw new TecnicaInataNaoEncontradaException(tecnicaInataId);
    }

    // ✅ VALIDAÇÃO: Técnica deve ser do tipo INATA
    if (tecnicaInata.tipo !== 'INATA') {
      throw new TecnicaInataTipoInvalidoException();
    }

    // ✅ VALIDAÇÃO: Origem requer técnica hereditária
    if (origem.requerTecnicaHeriditaria) {
      const tecnicaEhDoCla =
        tecnicaInata.hereditaria &&
        tecnicaInata.clas.some((rel) => rel.claId === cla.id);

      if (!tecnicaEhDoCla) {
        throw new OrigemRequerTecnicaHereditariaException(origem.nome);
      }
    }

    // ✅ VALIDAÇÃO: Origem bloqueia técnica hereditária
    if (origem.bloqueiaTecnicaHeriditaria && tecnicaInata.hereditaria) {
      throw new OrigemBloqueiaTecnicaHereditariaException(origem.nome);
    }

    // ✅ VALIDAÇÃO: Se técnica é hereditária, verificar compatibilidade com clã
    if (tecnicaInata.hereditaria) {
      const tecnicaEhCompativel = tecnicaInata.clas.some(
        (rel) => rel.claId === cla.id,
      );

      if (!tecnicaEhCompativel) {
        throw new TecnicaHereditariaIncompativelException(cla.nome);
      }
    }
  }
}
