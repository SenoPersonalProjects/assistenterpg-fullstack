// src/campanha/campanha.contexto.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CenaSessaoNaoEncontradaException,
  SessaoCampanhaNaoEncontradaException,
} from 'src/common/exceptions/campanha.exception';

@Injectable()
export class CampanhaContextoService {
  constructor(private readonly prisma: PrismaService) {}

  async validarContextoSessaoCena(
    campanhaId: number,
    sessaoId?: number,
    cenaId?: number,
  ): Promise<{ sessaoId: number | null; cenaId: number | null }> {
    if (cenaId !== undefined && sessaoId === undefined) {
      throw new CenaSessaoNaoEncontradaException(cenaId, undefined, campanhaId);
    }

    let sessaoValidaId: number | null = null;
    let cenaValidaId: number | null = null;

    if (sessaoId !== undefined) {
      const sessao = await this.prisma.sessao.findFirst({
        where: {
          id: sessaoId,
          campanhaId,
        },
        select: { id: true },
      });

      if (!sessao) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId, campanhaId);
      }

      sessaoValidaId = sessao.id;
    }

    if (cenaId !== undefined && sessaoValidaId !== null) {
      const cena = await this.prisma.cena.findFirst({
        where: {
          id: cenaId,
          sessaoId: sessaoValidaId,
        },
        select: { id: true },
      });

      if (!cena) {
        throw new CenaSessaoNaoEncontradaException(
          cenaId,
          sessaoValidaId,
          campanhaId,
        );
      }

      cenaValidaId = cena.id;
    }

    return {
      sessaoId: sessaoValidaId,
      cenaId: cenaValidaId,
    };
  }
}
