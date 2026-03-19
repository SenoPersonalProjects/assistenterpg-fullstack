// src/campanha/campanha.access.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampanhaAcessoNegadoException,
  CampanhaNaoEncontradaException,
  CampanhaPersonagemEdicaoNegadaException,
  PersonagemCampanhaNaoEncontradoException,
} from 'src/common/exceptions/campanha.exception';

@Injectable()
export class CampanhaAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async garantirAcesso(campanhaId: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        id: true,
        donoId: true,
        membros: {
          select: {
            usuarioId: true,
            papel: true,
          },
        },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    const ehDono = campanha.donoId === usuarioId;
    const membroAtual = campanha.membros.find((m) => m.usuarioId === usuarioId);

    if (!ehDono && !membroAtual) {
      throw new CampanhaAcessoNegadoException(campanhaId, usuarioId);
    }

    const ehMestre = ehDono || membroAtual?.papel === 'MESTRE';

    return {
      campanha,
      ehDono,
      ehMestre,
      papel: membroAtual?.papel ?? null,
    };
  }

  async obterPersonagemCampanhaComPermissao(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    exigirPermissaoEdicao: boolean,
  ) {
    const acesso = await this.garantirAcesso(campanhaId, usuarioId);

    const personagem = await this.prisma.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: {
        id: true,
        campanhaId: true,
        donoId: true,
        pvMax: true,
        pvAtual: true,
        peMax: true,
        peAtual: true,
        eaMax: true,
        eaAtual: true,
        sanMax: true,
        sanAtual: true,
        defesaBase: true,
        defesaEquipamento: true,
        defesaOutros: true,
        esquiva: true,
        bloqueio: true,
        deslocamento: true,
        limitePeEaPorTurno: true,
        prestigioGeral: true,
        prestigioCla: true,
      },
    });

    if (!personagem || personagem.campanhaId !== campanhaId) {
      throw new PersonagemCampanhaNaoEncontradoException(
        personagemCampanhaId,
        campanhaId,
      );
    }

    if (exigirPermissaoEdicao) {
      const podeEditar = acesso.ehMestre || personagem.donoId === usuarioId;
      if (!podeEditar) {
        throw new CampanhaPersonagemEdicaoNegadaException(
          campanhaId,
          personagemCampanhaId,
          usuarioId,
        );
      }
    }

    return {
      acesso,
      personagem,
    };
  }
}
