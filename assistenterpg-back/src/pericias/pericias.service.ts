// src/pericias/pericias.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import { PericiaNaoEncontradaException } from 'src/common/exceptions/pericia.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class PericiasService {
  constructor(private readonly prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      return this.prisma.pericia.findMany({
        orderBy: [
          { atributoBase: 'asc' }, // opcional: agrupa por atributo
          { nome: 'asc' },
        ],
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const pericia = await this.prisma.pericia.findUnique({
        where: { id },
      });

      if (!pericia) {
        throw new PericiaNaoEncontradaException(id);
      }

      return pericia;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
