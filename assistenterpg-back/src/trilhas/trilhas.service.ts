// src/trilhas/trilhas.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { CreateCaminhoDto } from './dto/create-caminho.dto';
import { UpdateCaminhoDto } from './dto/update-caminho.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  TrilhaNaoEncontradaException,
  TrilhaClasseNaoEncontradaException,
  TrilhaNomeDuplicadoException,
  TrilhaEmUsoException,
  CaminhoNaoEncontradoException,
  CaminhoNomeDuplicadoException,
  CaminhoEmUsoException,
} from 'src/common/exceptions/trilha.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class TrilhasService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTrilha(id: number) {
    const trilha = await this.prisma.trilha.findUnique({ where: { id } });
    if (!trilha) {
      throw new TrilhaNaoEncontradaException(id);
    }
    return trilha;
  }

  private async ensureCaminho(id: number) {
    const caminho = await this.prisma.caminho.findUnique({ where: { id } });
    if (!caminho) {
      throw new CaminhoNaoEncontradoException(id);
    }
    return caminho;
  }

  // ========================================
  // ✅ CRUD DE TRILHAS
  // ========================================

  // CREATE - Criar nova trilha
  async create(createDto: CreateTrilhaDto) {
    try {
      // Verificar se classe existe
      const classe = await this.prisma.classe.findUnique({
        where: { id: createDto.classeId },
      });

      if (!classe) {
        throw new TrilhaClasseNaoEncontradaException(createDto.classeId);
      }

      // Verificar nome duplicado
      const existente = await this.prisma.trilha.findUnique({
        where: { nome: createDto.nome },
      });

      if (existente) {
        throw new TrilhaNomeDuplicadoException(createDto.nome);
      }

      // Criar trilha com habilidades (se fornecidas)
      const trilha = await this.prisma.trilha.create({
        data: {
          classeId: createDto.classeId,
          nome: createDto.nome,
          descricao: createDto.descricao,
          requisitos: createDto.requisitos,

          // ✅ Criar habilidades da trilha
          ...(createDto.habilidades?.length && {
            habilidadesTrilha: {
              create: createDto.habilidades.map((hab) => ({
                habilidadeId: hab.habilidadeId,
                nivelConcedido: hab.nivelConcedido,
                caminhoId: hab.caminhoId,
              })),
            },
          }),
        },
        include: {
          classe: { select: { id: true, nome: true } },
          habilidadesTrilha: {
            include: {
              habilidade: { select: { id: true, nome: true, descricao: true } },
              caminho: { select: { id: true, nome: true } },
            },
            orderBy: { nivelConcedido: 'asc' },
          },
          caminhos: { select: { id: true, nome: true } },
        },
      });

      return trilha;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // FIND ALL - Listar todas as trilhas
  async findAll(classeId?: number) {
    try {
      const where = classeId ? { classeId } : {};

      return this.prisma.trilha.findMany({
        where,
        include: {
          classe: { select: { id: true, nome: true } },
          caminhos: { select: { id: true, nome: true } },
          _count: {
            select: {
              habilidadesTrilha: true,
              personagensBase: true,
              personagensCampanha: true,
            },
          },
        },
        orderBy: { nome: 'asc' },
      });
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // FIND ONE - Buscar trilha por ID
  async findOne(id: number) {
    try {
      const trilha = await this.prisma.trilha.findUnique({
        where: { id },
        include: {
          classe: { select: { id: true, nome: true } },
          caminhos: {
            select: { id: true, nome: true, descricao: true },
            orderBy: { nome: 'asc' },
          },
          habilidadesTrilha: {
            include: {
              habilidade: { select: { id: true, nome: true, descricao: true, tipo: true } },
              caminho: { select: { id: true, nome: true } },
            },
            orderBy: { nivelConcedido: 'asc' },
          },
          _count: {
            select: {
              personagensBase: true,
              personagensCampanha: true,
            },
          },
        },
      });

      if (!trilha) {
        throw new TrilhaNaoEncontradaException(id);
      }

      return trilha;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // UPDATE - Atualizar trilha
  async update(id: number, updateDto: UpdateTrilhaDto) {
    try {
      // Verificar se existe
      await this.ensureTrilha(id);

      // Verificar nome duplicado (se mudou)
      if (updateDto.nome) {
        const duplicado = await this.prisma.trilha.findFirst({
          where: {
            nome: updateDto.nome,
            NOT: { id },
          },
        });

        if (duplicado) {
          throw new TrilhaNomeDuplicadoException(updateDto.nome);
        }
      }

      // Atualizar trilha
      const trilha = await this.prisma.trilha.update({
        where: { id },
        data: {
          ...(updateDto.nome && { nome: updateDto.nome }),
          ...(updateDto.descricao !== undefined && { descricao: updateDto.descricao }),
          ...(updateDto.requisitos !== undefined && { requisitos: updateDto.requisitos }),

          // ✅ Atualizar habilidades (deletar e recriar)
          ...(updateDto.habilidades && {
            habilidadesTrilha: {
              deleteMany: {},
              create: updateDto.habilidades.map((hab) => ({
                habilidadeId: hab.habilidadeId,
                nivelConcedido: hab.nivelConcedido,
                caminhoId: hab.caminhoId,
              })),
            },
          }),
        },
        include: {
          classe: { select: { id: true, nome: true } },
          habilidadesTrilha: {
            include: {
              habilidade: { select: { id: true, nome: true, descricao: true } },
              caminho: { select: { id: true, nome: true } },
            },
            orderBy: { nivelConcedido: 'asc' },
          },
          caminhos: { select: { id: true, nome: true } },
        },
      });

      return trilha;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // DELETE - Remover trilha
  async remove(id: number) {
    try {
      // Verificar se existe
      await this.ensureTrilha(id);

      // Verificar se está sendo usada
      const [usadaEmBase, usadaEmCampanha] = await Promise.all([
        this.prisma.personagemBase.count({ where: { trilhaId: id } }),
        this.prisma.personagemCampanha.count({ where: { trilhaId: id } }),
      ]);

      const totalUsos = usadaEmBase + usadaEmCampanha;

      if (totalUsos > 0) {
        throw new TrilhaEmUsoException(id, totalUsos, {
          personagensBase: usadaEmBase,
          personagensCampanha: usadaEmCampanha,
        });
      }

      // Deletar (cascade vai limpar caminhos e habilidades)
      await this.prisma.trilha.delete({
        where: { id },
      });

      return { message: 'Trilha removida com sucesso' };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ========================================
  // ✅ CRUD DE CAMINHOS
  // ========================================

  // CREATE - Criar novo caminho
  async createCaminho(createDto: CreateCaminhoDto) {
    try {
      // Verificar se trilha existe
      await this.ensureTrilha(createDto.trilhaId);

      // Verificar nome duplicado
      const existente = await this.prisma.caminho.findUnique({
        where: { nome: createDto.nome },
      });

      if (existente) {
        throw new CaminhoNomeDuplicadoException(createDto.nome);
      }

      // Criar caminho com habilidades
      const caminho = await this.prisma.caminho.create({
        data: {
          trilhaId: createDto.trilhaId,
          nome: createDto.nome,
          descricao: createDto.descricao,

          // ✅ Criar habilidades do caminho
          ...(createDto.habilidades?.length && {
            habilidadesTrilha: {
              create: createDto.habilidades.map((hab) => ({
                trilhaId: createDto.trilhaId,
                habilidadeId: hab.habilidadeId,
                nivelConcedido: hab.nivelConcedido,
              })),
            },
          }),
        },
        include: {
          trilha: { select: { id: true, nome: true } },
          habilidadesTrilha: {
            include: {
              habilidade: { select: { id: true, nome: true, descricao: true } },
            },
            orderBy: { nivelConcedido: 'asc' },
          },
        },
      });

      return caminho;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // UPDATE - Atualizar caminho
  async updateCaminho(id: number, updateDto: UpdateCaminhoDto) {
    try {
      // Verificar se existe
      await this.ensureCaminho(id);

      // Verificar nome duplicado (se mudou)
      if (updateDto.nome) {
        const duplicado = await this.prisma.caminho.findFirst({
          where: {
            nome: updateDto.nome,
            NOT: { id },
          },
        });

        if (duplicado) {
          throw new CaminhoNomeDuplicadoException(updateDto.nome);
        }
      }

      // Atualizar caminho
      const caminho = await this.prisma.caminho.update({
        where: { id },
        data: {
          ...(updateDto.nome && { nome: updateDto.nome }),
          ...(updateDto.descricao !== undefined && { descricao: updateDto.descricao }),

          // ✅ Atualizar habilidades (deletar e recriar)
          ...(updateDto.habilidades && {
            habilidadesTrilha: {
              deleteMany: { caminhoId: id },
              create: updateDto.habilidades.map((hab) => ({
                trilhaId: updateDto.trilhaId!,
                habilidadeId: hab.habilidadeId,
                nivelConcedido: hab.nivelConcedido,
              })),
            },
          }),
        },
        include: {
          trilha: { select: { id: true, nome: true } },
          habilidadesTrilha: {
            include: {
              habilidade: { select: { id: true, nome: true, descricao: true } },
            },
            orderBy: { nivelConcedido: 'asc' },
          },
        },
      });

      return caminho;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // DELETE - Remover caminho
  async removeCaminho(id: number) {
    try {
      // Verificar se existe
      await this.ensureCaminho(id);

      // Verificar se está sendo usado
      const [usadoEmBase, usadoEmCampanha] = await Promise.all([
        this.prisma.personagemBase.count({ where: { caminhoId: id } }),
        this.prisma.personagemCampanha.count({ where: { caminhoId: id } }),
      ]);

      const totalUsos = usadoEmBase + usadoEmCampanha;

      if (totalUsos > 0) {
        throw new CaminhoEmUsoException(id, totalUsos, {
          personagensBase: usadoEmBase,
          personagensCampanha: usadoEmCampanha,
        });
      }

      // Deletar (cascade vai limpar habilidades)
      await this.prisma.caminho.delete({
        where: { id },
      });

      return { message: 'Caminho removido com sucesso' };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ========================================
  // ✅ MÉTODOS EXISTENTES (MANTIDOS)
  // ========================================

  // GET /trilhas/:id/caminhos
  async findCaminhos(trilhaId: number) {
    try {
      await this.ensureTrilha(trilhaId);

      const caminhos = await this.prisma.caminho.findMany({
        where: { trilhaId },
        orderBy: { nome: 'asc' },
      });

      return caminhos.map((c) => ({
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        trilhaId: c.trilhaId,
      }));
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // GET /trilhas/:id/habilidades
  async findHabilidades(trilhaId: number) {
    try {
      await this.ensureTrilha(trilhaId);

      const itens = await this.prisma.habilidadeTrilha.findMany({
        where: { trilhaId },
        orderBy: { nivelConcedido: 'asc' },
        include: {
          habilidade: true,
          caminho: true,
        },
      });

      return itens.map((ht) => ({
        id: ht.id,
        nivelConcedido: ht.nivelConcedido,
        habilidadeId: ht.habilidadeId,
        habilidadeNome: ht.habilidade.nome,
        habilidadeDescricao: ht.habilidade.descricao,
        caminhoId: ht.caminhoId,
        caminhoNome: ht.caminho?.nome ?? null,
      }));
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }
}
