// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.mapper.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';

export const tecnicaDetalhadaInclude =
  Prisma.validator<Prisma.TecnicaAmaldicoadaInclude>()({
    clas: {
      include: {
        cla: {
          select: {
            id: true,
            nome: true,
            grandeCla: true,
          },
        },
      },
    },
    habilidades: {
      include: {
        variacoes: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { ordem: 'asc' },
    },
    suplemento: true,
  });

export type TecnicaDetalhadaPayload = Prisma.TecnicaAmaldicoadaGetPayload<{
  include: typeof tecnicaDetalhadaInclude;
}>;

export const tecnicaUsoInclude =
  Prisma.validator<Prisma.TecnicaAmaldicoadaInclude>()({
    _count: {
      select: {
        personagensBaseComInata: true,
        personagensCampanhaComInata: true,
        personagensBaseAprendeu: true,
        personagensCampanhaAprendeu: true,
      },
    },
  });

@Injectable()
export class TecnicasAmaldicoadasMapper {
  mapTecnicaToDto(
    tecnica: TecnicaDetalhadaPayload,
    options?: {
      incluirClas?: boolean;
      incluirHabilidades?: boolean;
    },
  ): TecnicaDetalhadaDto {
    const incluirClas = options?.incluirClas !== false;
    const incluirHabilidades = options?.incluirHabilidades !== false;

    return {
      id: tecnica.id,
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao,
      tipo: tecnica.tipo,
      hereditaria: tecnica.hereditaria,
      linkExterno: tecnica.linkExterno ?? undefined,
      fonte: tecnica.fonte,
      suplementoId: tecnica.suplementoId ?? undefined,
      requisitos: tecnica.requisitos ?? undefined,
      clasHereditarios: incluirClas
        ? tecnica.clas.map((tecnicaCla) => tecnicaCla.cla)
        : [],
      habilidades: incluirHabilidades
        ? (tecnica.habilidades as unknown as TecnicaDetalhadaDto['habilidades'])
        : [],
      criadoEm: tecnica.criadoEm,
      atualizadoEm: tecnica.atualizadoEm,
    };
  }
}
