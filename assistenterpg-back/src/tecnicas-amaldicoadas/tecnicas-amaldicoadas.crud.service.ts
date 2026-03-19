// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.crud.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma, TipoFonte, TipoTecnicaAmaldicoada } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TecnicasAmaldicoadasMapper } from './tecnicas-amaldicoadas.mapper';
import { TecnicasAmaldicoadasPersistence } from './tecnicas-amaldicoadas.persistence';
import {
  TecnicaCodigoOuNomeDuplicadoException,
  TecnicaEmUsoException,
  TecnicaHereditariaSemClaException,
  TecnicaNaoEncontradaException,
  TecnicaNaoInataHereditariaException,
} from 'src/common/exceptions/tecnica-amaldicoada.exception';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import {
  normalizarJsonOpcional,
  normalizarJsonOuNull,
} from './engine/tecnicas-amaldicoadas.engine';
import { tratarErroPrisma } from './tecnicas-amaldicoadas.errors';
import { TecnicasAmaldicoadasValidationsService } from './tecnicas-amaldicoadas.validations.service';
import { TecnicasAmaldicoadasClasService } from './tecnicas-amaldicoadas.clas.service';

@Injectable()
export class TecnicasAmaldicoadasCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TecnicasAmaldicoadasMapper,
    private readonly persistence: TecnicasAmaldicoadasPersistence,
    private readonly validationsService: TecnicasAmaldicoadasValidationsService,
    private readonly clasService: TecnicasAmaldicoadasClasService,
  ) {}

  async findAllTecnicas(
    filtros: FiltrarTecnicasDto,
  ): Promise<TecnicaDetalhadaDto[]> {
    try {
      const where: Prisma.TecnicaAmaldicoadaWhereInput = {};

      if (filtros.nome) {
        where.nome = { contains: filtros.nome };
      }

      if (filtros.codigo) {
        where.codigo = filtros.codigo;
      }

      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }

      if (filtros.hereditaria !== undefined) {
        where.hereditaria = filtros.hereditaria;
      }

      if (filtros.fonte) {
        where.fonte = filtros.fonte;
      }

      if (filtros.suplementoId) {
        where.suplementoId = filtros.suplementoId;
      }

      if (filtros.claId || filtros.claNome) {
        where.clas = {
          some: filtros.claId
            ? { claId: filtros.claId }
            : { cla: { nome: filtros.claNome } },
        };
      }

      const incluirClas = filtros.incluirClas !== false;
      const incluirHabilidades = filtros.incluirHabilidades === true;

      const tecnicas = await this.persistence.listarTecnicasDetalhadas(where);

      return tecnicas.map((tecnica) =>
        this.mapper.mapTecnicaToDto(tecnica, {
          incluirClas,
          incluirHabilidades,
        }),
      );
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async findOneTecnica(id: number): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.persistence.buscarTecnicaDetalhadaPorId(id);

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      return this.mapper.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async findTecnicaByCodigo(codigo: string): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica =
        await this.persistence.buscarTecnicaDetalhadaPorCodigo(codigo);

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(codigo);
      }

      return this.mapper.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async createTecnica(dto: CreateTecnicaDto): Promise<TecnicaDetalhadaDto> {
    try {
      const existe = await this.prisma.tecnicaAmaldicoada.findFirst({
        where: {
          OR: [{ codigo: dto.codigo }, { nome: dto.nome }],
        },
      });

      if (existe) {
        throw new TecnicaCodigoOuNomeDuplicadoException(dto.codigo, dto.nome);
      }

      if (dto.hereditaria && dto.tipo !== TipoTecnicaAmaldicoada.INATA) {
        throw new TecnicaNaoInataHereditariaException(dto.tipo);
      }

      if (
        dto.hereditaria &&
        (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
      ) {
        throw new TecnicaHereditariaSemClaException();
      }

      const suplementoIdFinal = dto.suplementoId ?? null;
      const fonteFinal =
        dto.fonte ??
        (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
      await this.validationsService.validarFonteSuplemento(
        fonteFinal,
        suplementoIdFinal,
      );

      const tecnica = await this.prisma.tecnicaAmaldicoada.create({
        data: {
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria ?? false,
          linkExterno: dto.linkExterno ?? null,
          fonte: fonteFinal,
          suplementoId: suplementoIdFinal,
          requisitos: normalizarJsonOuNull(dto.requisitos),
        },
      });

      if (
        dto.hereditaria &&
        dto.clasHereditarios &&
        dto.clasHereditarios.length > 0
      ) {
        await this.clasService.vincularClas(tecnica.id, dto.clasHereditarios);
      }

      return this.findOneTecnica(tecnica.id);
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async updateTecnica(
    id: number,
    dto: UpdateTecnicaDto,
  ): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      if (dto.nome) {
        const tecnicaComMesmoNome =
          await this.prisma.tecnicaAmaldicoada.findFirst({
            where: {
              nome: dto.nome,
              NOT: { id },
            },
          });

        if (tecnicaComMesmoNome) {
          throw new TecnicaCodigoOuNomeDuplicadoException(
            tecnica.codigo,
            dto.nome,
          );
        }
      }

      const tipoFinal = dto.tipo ?? tecnica.tipo;
      const hereditariaFinal = dto.hereditaria ?? tecnica.hereditaria;

      if (hereditariaFinal && tipoFinal === TipoTecnicaAmaldicoada.NAO_INATA) {
        throw new TecnicaNaoInataHereditariaException(tipoFinal);
      }

      const suplementoIdFinal =
        dto.suplementoId !== undefined
          ? dto.suplementoId
          : tecnica.suplementoId;
      const fonteFinal =
        dto.fonte ?? (suplementoIdFinal ? TipoFonte.SUPLEMENTO : tecnica.fonte);
      await this.validationsService.validarFonteSuplemento(
        fonteFinal,
        suplementoIdFinal,
      );

      const shouldUpdateClas =
        dto.clasHereditarios !== undefined || dto.hereditaria === false;

      if (dto.hereditaria === true && dto.clasHereditarios === undefined) {
        const totalClasVinculados = await this.prisma.tecnicaCla.count({
          where: { tecnicaId: id },
        });

        if (totalClasVinculados === 0) {
          throw new TecnicaHereditariaSemClaException(id);
        }
      }

      if (shouldUpdateClas) {
        if (
          hereditariaFinal &&
          (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
        ) {
          throw new TecnicaHereditariaSemClaException(id);
        }

        await this.prisma.tecnicaCla.deleteMany({ where: { tecnicaId: id } });

        if (
          hereditariaFinal &&
          dto.clasHereditarios &&
          dto.clasHereditarios.length > 0
        ) {
          await this.clasService.vincularClas(id, dto.clasHereditarios);
        }
      }

      await this.prisma.tecnicaAmaldicoada.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria,
          linkExterno: dto.linkExterno,
          fonte: fonteFinal,
          ...(dto.suplementoId !== undefined && {
            suplementoId: dto.suplementoId,
          }),
          requisitos: normalizarJsonOpcional(dto.requisitos),
        },
      });

      return this.findOneTecnica(id);
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async removeTecnica(id: number): Promise<void> {
    try {
      const tecnica = await this.persistence.buscarTecnicaComUso(id);

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      const detalhesUso = {
        personagensBaseComInata: tecnica._count.personagensBaseComInata,
        personagensCampanhaComInata: tecnica._count.personagensCampanhaComInata,
        personagensBaseAprendeu: tecnica._count.personagensBaseAprendeu,
        personagensCampanhaAprendeu: tecnica._count.personagensCampanhaAprendeu,
      };

      const totalUso = Object.values(detalhesUso).reduce(
        (acc, val) => acc + val,
        0,
      );

      if (totalUso > 0) {
        throw new TecnicaEmUsoException(id, totalUso, detalhesUso);
      }

      await this.prisma.tecnicaAmaldicoada.delete({ where: { id } });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async findTecnicasByCla(claId: number): Promise<TecnicaDetalhadaDto[]> {
    try {
      const tecnicas =
        await this.persistence.buscarTecnicasHereditariaPorCla(claId);

      return tecnicas.map((tecnica) => this.mapper.mapTecnicaToDto(tecnica));
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }
}
