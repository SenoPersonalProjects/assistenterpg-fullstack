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
