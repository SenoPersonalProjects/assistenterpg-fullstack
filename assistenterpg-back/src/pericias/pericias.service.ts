// src/pericias/pericias.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import { PericiaNaoEncontradaException } from 'src/common/exceptions/pericia.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class PericiasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return this.prisma.pericia.findMany({
        orderBy: [
          { atributoBase: 'asc' }, // opcional: agrupa por atributo
          { nome: 'asc' },
        ],
      });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
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
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }
}
