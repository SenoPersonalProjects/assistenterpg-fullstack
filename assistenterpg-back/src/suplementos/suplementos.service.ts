import { Injectable } from '@nestjs/common';
import {
  Prisma,
  StatusPublicacao,
  Suplemento,
  UsuarioSuplemento,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateSuplementoDto } from './dto/create-suplemento.dto';
import { UpdateSuplementoDto } from './dto/update-suplemento.dto';
import { FiltrarSuplementosDto } from './dto/filtrar-suplementos.dto';
import { SuplementoCatalogoDto } from './dto/suplemento-catalogo.dto';
import {
  SuplementoCodigoDuplicadoException,
  SuplementoComConteudoVinculadoException,
  SuplementoJaAtivoException,
  SuplementoNaoAtivoException,
  SuplementoNaoEncontradoException,
  SuplementoNaoPublicadoException,
} from 'src/common/exceptions/suplemento.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

type SuplementoMapeavel = Suplemento & {
  usuariosAtivos?: UsuarioSuplemento[];
};

@Injectable()
export class SuplementosService {
  constructor(private prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private mapearTags(tags: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags.filter((tag): tag is string => typeof tag === 'string');
  }

  async findAll(
    filtros: FiltrarSuplementosDto,
    usuarioId?: number,
  ): Promise<SuplementoCatalogoDto[]> {
    try {
      const where: Prisma.SuplementoWhereInput = {};

      if (filtros.nome) {
        where.nome = { contains: filtros.nome };
      }

      if (filtros.codigo) {
        where.codigo = filtros.codigo;
      }

      if (filtros.status) {
        where.status = filtros.status;
      }

      if (filtros.autor) {
        where.autor = { contains: filtros.autor };
      }

      if (filtros.apenasAtivos && usuarioId) {
        where.usuariosAtivos = {
          some: { usuarioId },
        };
      }

      if (usuarioId) {
        const suplementos = await this.prisma.suplemento.findMany({
          where,
          include: {
            usuariosAtivos: {
              where: { usuarioId },
            },
          },
          orderBy: { nome: 'asc' },
        });

        return suplementos.map((suplemento) =>
          this.mapToDto(suplemento, usuarioId),
        );
      }

      const suplementos = await this.prisma.suplemento.findMany({
        where,
        orderBy: { nome: 'asc' },
      });

      return suplementos.map((suplemento) => this.mapToDto(suplemento));
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async findOne(
    id: number,
    usuarioId?: number,
  ): Promise<SuplementoCatalogoDto> {
    try {
      if (usuarioId) {
        const suplemento = await this.prisma.suplemento.findUnique({
          where: { id },
          include: {
            usuariosAtivos: {
              where: { usuarioId },
            },
          },
        });

        if (!suplemento) {
          throw new SuplementoNaoEncontradoException(id);
        }

        return this.mapToDto(suplemento, usuarioId);
      }

      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(id);
      }

      return this.mapToDto(suplemento);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async findByCodigo(
    codigo: string,
    usuarioId?: number,
  ): Promise<SuplementoCatalogoDto> {
    try {
      if (usuarioId) {
        const suplemento = await this.prisma.suplemento.findUnique({
          where: { codigo },
          include: {
            usuariosAtivos: {
              where: { usuarioId },
            },
          },
        });

        if (!suplemento) {
          throw new SuplementoNaoEncontradoException(codigo);
        }

        return this.mapToDto(suplemento, usuarioId);
      }

      const suplemento = await this.prisma.suplemento.findUnique({
        where: { codigo },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(codigo);
      }

      return this.mapToDto(suplemento);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async create(dto: CreateSuplementoDto): Promise<SuplementoCatalogoDto> {
    try {
      const existe = await this.prisma.suplemento.findUnique({
        where: { codigo: dto.codigo },
      });

      if (existe) {
        throw new SuplementoCodigoDuplicadoException(dto.codigo);
      }

      const suplemento = await this.prisma.suplemento.create({
        data: {
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao ?? null,
          versao: dto.versao ?? '1.0.0',
          status: dto.status ?? StatusPublicacao.RASCUNHO,
          icone: dto.icone ?? null,
          banner: dto.banner ?? null,
          tags: dto.tags ? dto.tags : Prisma.JsonNull,
          autor: dto.autor ?? null,
        },
      });

      return this.mapToDto(suplemento);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateSuplementoDto,
  ): Promise<SuplementoCatalogoDto> {
    try {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(id);
      }

      const atualizado = await this.prisma.suplemento.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          versao: dto.versao,
          status: dto.status,
          icone: dto.icone,
          banner: dto.banner,
          tags:
            dto.tags !== undefined
              ? dto.tags
                ? dto.tags
                : Prisma.JsonNull
              : undefined,
          autor: dto.autor,
        },
      });

      return this.mapToDto(atualizado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              cla: true,
              classes: true,
              trilhas: true,
              caminhos: true,
              origens: true,
              equipamentos: true,
              habilidades: true,
              tecnicas: true,
              modificacoes: true,
            },
          },
        },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(id);
      }

      const detalhesConteudo = {
        cla: suplemento._count.cla,
        classes: suplemento._count.classes,
        trilhas: suplemento._count.trilhas,
        caminhos: suplemento._count.caminhos,
        origens: suplemento._count.origens,
        equipamentos: suplemento._count.equipamentos,
        habilidades: suplemento._count.habilidades,
        tecnicas: suplemento._count.tecnicas,
        modificacoes: suplemento._count.modificacoes,
      };

      const totalConteudo = Object.values(detalhesConteudo).reduce(
        (acc, val) => acc + val,
        0,
      );

      if (totalConteudo > 0) {
        throw new SuplementoComConteudoVinculadoException(
          id,
          totalConteudo,
          detalhesConteudo,
        );
      }

      await this.prisma.suplemento.delete({ where: { id } });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async findSuplementosAtivos(
    usuarioId: number,
  ): Promise<SuplementoCatalogoDto[]> {
    try {
      const suplementos = await this.prisma.suplemento.findMany({
        where: {
          usuariosAtivos: {
            some: { usuarioId },
          },
          status: StatusPublicacao.PUBLICADO,
        },
        include: {
          usuariosAtivos: {
            where: { usuarioId },
          },
        },
        orderBy: { nome: 'asc' },
      });

      return suplementos.map((suplemento) =>
        this.mapToDto(suplemento, usuarioId),
      );
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async ativarSuplemento(
    usuarioId: number,
    suplementoId: number,
  ): Promise<void> {
    try {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(suplementoId);
      }

      if (suplemento.status !== StatusPublicacao.PUBLICADO) {
        throw new SuplementoNaoPublicadoException(
          suplementoId,
          suplemento.status,
        );
      }

      const jaAtivo = await this.prisma.usuarioSuplemento.findUnique({
        where: {
          usuarioId_suplementoId: {
            usuarioId,
            suplementoId,
          },
        },
      });

      if (jaAtivo) {
        throw new SuplementoJaAtivoException(usuarioId, suplementoId);
      }

      await this.prisma.usuarioSuplemento.create({
        data: {
          usuarioId,
          suplementoId,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async desativarSuplemento(
    usuarioId: number,
    suplementoId: number,
  ): Promise<void> {
    try {
      const ativo = await this.prisma.usuarioSuplemento.findUnique({
        where: {
          usuarioId_suplementoId: {
            usuarioId,
            suplementoId,
          },
        },
      });

      if (!ativo) {
        throw new SuplementoNaoAtivoException(usuarioId, suplementoId);
      }

      await this.prisma.usuarioSuplemento.delete({
        where: {
          usuarioId_suplementoId: {
            usuarioId,
            suplementoId,
          },
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  private mapToDto(
    suplemento: SuplementoMapeavel,
    usuarioId?: number,
  ): SuplementoCatalogoDto {
    return {
      id: suplemento.id,
      codigo: suplemento.codigo,
      nome: suplemento.nome,
      descricao: suplemento.descricao ?? undefined,
      versao: suplemento.versao,
      status: suplemento.status,
      icone: suplemento.icone ?? undefined,
      banner: suplemento.banner ?? undefined,
      tags: this.mapearTags(suplemento.tags),
      autor: suplemento.autor ?? undefined,
      ativo: usuarioId
        ? (suplemento.usuariosAtivos?.length ?? 0) > 0
        : undefined,
      criadoEm: suplemento.criadoEm,
      atualizadoEm: suplemento.atualizadoEm,
    };
  }
}
