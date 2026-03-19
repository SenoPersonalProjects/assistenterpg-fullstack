// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.persistence.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  tecnicaDetalhadaInclude,
  tecnicaUsoInclude,
} from './tecnicas-amaldicoadas.mapper';

type PrismaLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class TecnicasAmaldicoadasPersistence {
  constructor(private readonly prisma: PrismaService) {}

  async buscarTecnicaDetalhadaPorId(
    id: number,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.tecnicaAmaldicoada.findUnique({
      where: { id },
      include: tecnicaDetalhadaInclude,
    });
  }

  async buscarTecnicaDetalhadaPorCodigo(
    codigo: string,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.tecnicaAmaldicoada.findUnique({
      where: { codigo },
      include: tecnicaDetalhadaInclude,
    });
  }

  async listarTecnicasDetalhadas(
    where: Prisma.TecnicaAmaldicoadaWhereInput,
    orderBy: Prisma.TecnicaAmaldicoadaOrderByWithRelationInput = {
      nome: 'asc',
    },
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.tecnicaAmaldicoada.findMany({
      where,
      include: tecnicaDetalhadaInclude,
      orderBy,
    });
  }

  async buscarTecnicasHereditariaPorCla(
    claId: number,
    prisma: PrismaLike = this.prisma,
  ) {
    return prisma.tecnicaAmaldicoada.findMany({
      where: {
        hereditaria: true,
        clas: {
          some: { claId },
        },
      },
      include: tecnicaDetalhadaInclude,
      orderBy: { nome: 'asc' },
    });
  }

  async buscarTecnicaComUso(id: number, prisma: PrismaLike = this.prisma) {
    return prisma.tecnicaAmaldicoada.findUnique({
      where: { id },
      include: tecnicaUsoInclude,
    });
  }
}
