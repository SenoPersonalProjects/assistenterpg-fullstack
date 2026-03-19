// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.validations.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TecnicaSuplementoNaoEncontradoException } from 'src/common/exceptions/tecnica-amaldicoada.exception';

@Injectable()
export class TecnicasAmaldicoadasValidationsService {
  constructor(private readonly prisma: PrismaService) {}

  async validarFonteSuplemento(fonte: TipoFonte, suplementoId: number | null) {
    if (suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new TecnicaSuplementoNaoEncontradoException(suplementoId);
      }

      if (fonte !== TipoFonte.SUPLEMENTO) {
        throw new BadRequestException({
          code: 'FONTE_SUPLEMENTO_OBRIGATORIA',
          message:
            'Quando suplementoId for informado, fonte deve ser SUPLEMENTO',
          field: 'fonte',
        });
      }
      return;
    }

    if (fonte === TipoFonte.SUPLEMENTO) {
      throw new BadRequestException({
        code: 'SUPLEMENTO_ID_OBRIGATORIO',
        message: 'fonte SUPLEMENTO exige suplementoId',
        field: 'suplementoId',
      });
    }
  }
}
