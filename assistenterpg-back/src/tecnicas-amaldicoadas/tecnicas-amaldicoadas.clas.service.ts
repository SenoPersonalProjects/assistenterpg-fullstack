// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.clas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TecnicaClaNaoEncontradoException } from 'src/common/exceptions/tecnica-amaldicoada.exception';

@Injectable()
export class TecnicasAmaldicoadasClasService {
  constructor(private readonly prisma: PrismaService) {}

  async vincularClas(tecnicaId: number, claNomes: string[]): Promise<void> {
    for (const nome of claNomes) {
      const cla = await this.prisma.cla.findUnique({ where: { nome } });

      if (!cla) {
        throw new TecnicaClaNaoEncontradoException(nome);
      }

      await this.prisma.tecnicaCla.create({
        data: {
          tecnicaId,
          claId: cla.id,
        },
      });
    }
  }
}
