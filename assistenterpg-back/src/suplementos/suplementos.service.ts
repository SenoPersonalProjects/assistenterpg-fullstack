// src/suplementos/suplementos.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusPublicacao, Prisma } from '@prisma/client';

import { CreateSuplementoDto } from './dto/create-suplemento.dto';
import { UpdateSuplementoDto } from './dto/update-suplemento.dto';
import { FiltrarSuplementosDto } from './dto/filtrar-suplementos.dto';
import { SuplementoCatalogoDto } from './dto/suplemento-catalogo.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  SuplementoNaoEncontradoException,
  SuplementoCodigoDuplicadoException,
  SuplementoComConteudoVinculadoException,
  SuplementoNaoPublicadoException,
  SuplementoJaAtivoException,
  SuplementoNaoAtivoException,
} from 'src/common/exceptions/suplemento.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class SuplementosService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 📚 CRUD ADMIN - SUPLEMENTOS
  // ==========================================

  /**
   * Listar todos os suplementos (com filtros opcionais)
   */
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

      // Se usuário quer apenas seus suplementos ativos
      if (filtros.apenasAtivos && usuarioId) {
        where.usuariosAtivos = {
          some: { usuarioId },
        };
      }

      const suplementos = await this.prisma.suplemento.findMany({
        where,
        include: {
          usuariosAtivos: usuarioId
            ? {
                where: { usuarioId },
              }
            : false,
        },
        orderBy: { nome: 'asc' },
      });

      return suplementos.map((s) => this.mapToDto(s, usuarioId));
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Buscar suplemento por ID
   */
  async findOne(id: number, usuarioId?: number): Promise<SuplementoCatalogoDto> {
    try {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id },
        include: {
          usuariosAtivos: usuarioId
            ? {
                where: { usuarioId },
              }
            : false,
        },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(id);
      }

      return this.mapToDto(suplemento, usuarioId);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Buscar suplemento por código
   */
  async findByCodigo(codigo: string, usuarioId?: number): Promise<SuplementoCatalogoDto> {
    try {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { codigo },
        include: {
          usuariosAtivos: usuarioId
            ? {
                where: { usuarioId },
              }
            : false,
        },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(codigo);
      }

      return this.mapToDto(suplemento, usuarioId);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Criar novo suplemento (ADMIN)
   */
  async create(dto: CreateSuplementoDto): Promise<SuplementoCatalogoDto> {
    try {
      // Verificar se código já existe
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
          // ✅ CORRIGIDO: Usar tipo correto do Prisma para JSON
          tags: dto.tags ? dto.tags : Prisma.JsonNull,
          autor: dto.autor ?? null,
        },
      });

      return this.mapToDto(suplemento);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Atualizar suplemento (ADMIN)
   */
  async update(id: number, dto: UpdateSuplementoDto): Promise<SuplementoCatalogoDto> {
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
          // ✅ CORRIGIDO: Usar tipo correto do Prisma para JSON
          tags:
            dto.tags !== undefined ? (dto.tags ? dto.tags : Prisma.JsonNull) : undefined,
          autor: dto.autor,
        },
      });

      return this.mapToDto(atualizado);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Deletar suplemento (ADMIN)
   */
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

      // Verificar se tem conteúdo vinculado
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
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ==========================================
  // 👤 ATIVAÇÃO/DESATIVAÇÃO DE SUPLEMENTOS
  // ==========================================

  /**
   * Listar suplementos ativos do usuário
   */
  async findSuplementosAtivos(usuarioId: number): Promise<SuplementoCatalogoDto[]> {
    try {
      const suplementos = await this.prisma.suplemento.findMany({
        where: {
          usuariosAtivos: {
            some: { usuarioId },
          },
          status: StatusPublicacao.PUBLICADO, // Apenas publicados
        },
        include: {
          usuariosAtivos: {
            where: { usuarioId },
          },
        },
        orderBy: { nome: 'asc' },
      });

      return suplementos.map((s) => this.mapToDto(s, usuarioId));
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Ativar suplemento para usuário
   */
  async ativarSuplemento(usuarioId: number, suplementoId: number): Promise<void> {
    try {
      // Verificar se suplemento existe e está publicado
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(suplementoId);
      }

      if (suplemento.status !== StatusPublicacao.PUBLICADO) {
        throw new SuplementoNaoPublicadoException(suplementoId, suplemento.status);
      }

      // Verificar se já está ativo
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

      // Ativar
      await this.prisma.usuarioSuplemento.create({
        data: {
          usuarioId,
          suplementoId,
        },
      });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Desativar suplemento para usuário
   */
  async desativarSuplemento(usuarioId: number, suplementoId: number): Promise<void> {
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
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  private mapToDto(suplemento: any, usuarioId?: number): SuplementoCatalogoDto {
    return {
      id: suplemento.id,
      codigo: suplemento.codigo,
      nome: suplemento.nome,
      descricao: suplemento.descricao,
      versao: suplemento.versao,
      status: suplemento.status,
      icone: suplemento.icone,
      banner: suplemento.banner,
      tags:
        suplemento.tags && suplemento.tags !== Prisma.JsonNull
          ? (suplemento.tags as string[])
          : [],
      autor: suplemento.autor,
      ativo: usuarioId ? suplemento.usuariosAtivos?.length > 0 : undefined,
      criadoEm: suplemento.criadoEm,
      atualizadoEm: suplemento.atualizadoEm,
    };
  }
}
