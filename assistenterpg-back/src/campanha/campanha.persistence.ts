// src/campanha/campanha.persistence.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PERSONAGEM_CAMPANHA_DETALHE_SELECT } from './campanha.mapper';

type PrismaLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class CampanhaPersistence {
  constructor(private readonly prisma: PrismaService) {}

  async listarPersonagensCampanha(
    campanhaId: number,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.personagemCampanha.findMany({
      where: { campanhaId },
      select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
    });
  }

  async listarPersonagensCampanhaResumo(
    campanhaId: number,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.personagemCampanha.findMany({
      where: { campanhaId },
      select: {
        id: true,
        campanhaId: true,
        personagemBaseId: true,
        donoId: true,
        nome: true,
        pvAtual: true,
        pvMax: true,
        pvBarrasTotal: true,
        pvBarrasRestantes: true,
        sanAtual: true,
        sanMax: true,
        personagemBase: { select: { id: true, nome: true } },
        dono: { select: { id: true, apelido: true } },
      },
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
    });
  }

  async listarPersonagensCampanhaDetalhados(
    campanhaId: number,
    ids: number[],
    prisma: PrismaLike = this.prisma,
  ) {
    if (ids.length === 0) return [];

    return prisma.personagemCampanha.findMany({
      where: { campanhaId, id: { in: ids } },
      select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
    });
  }

  async buscarPersonagemCampanhaDetalhe(
    personagemCampanhaId: number,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: PERSONAGEM_CAMPANHA_DETALHE_SELECT,
    });
  }
}
