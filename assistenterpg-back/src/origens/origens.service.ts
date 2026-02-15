// src/origens/origens.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';
import { HabilidadeCatalogoDto } from '../habilidades/dto/catalogo-habilidade.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  OrigemNaoEncontradaException,
  OrigemNomeDuplicadoException,
  OrigemPericiasInvalidasException,
  OrigemHabilidadesInvalidasException,
  OrigemEmUsoException,
} from 'src/common/exceptions/origem.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class OrigensService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // ✅ HELPER PRIVADO
  // ========================================

  private addHabilidadesIniciais<T extends { habilidadesOrigem?: any[] }>(origem: T) {
    const habilidadesIniciais: HabilidadeCatalogoDto[] =
      origem.habilidadesOrigem?.map((rel: any) => rel.habilidade) ?? [];

    return {
      ...origem,
      habilidadesIniciais,
    };
  }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * CREATE - Criar nova origem
   */
  async create(dto: CreateOrigemDto) {
    try {
      // Verificar nome duplicado
      const existente = await this.prisma.origem.findUnique({
        where: { nome: dto.nome },
      });

      if (existente) {
        throw new OrigemNomeDuplicadoException(dto.nome);
      }

      // Validar perícias (se fornecidas)
      if (dto.pericias?.length) {
        const periciaIds = dto.pericias.map((p) => p.periciaId);
        const periciasExistentes = await this.prisma.pericia.findMany({
          where: { id: { in: periciaIds } },
          select: { id: true },
        });

        if (periciasExistentes.length !== periciaIds.length) {
          const idsEncontrados = periciasExistentes.map((p) => p.id);
          const idsInvalidos = periciaIds.filter((id) => !idsEncontrados.includes(id));
          throw new OrigemPericiasInvalidasException(idsInvalidos);
        }
      }

      // Validar habilidades (se fornecidas)
      if (dto.habilidadesIds?.length) {
        const habilidadesExistentes = await this.prisma.habilidade.findMany({
          where: { id: { in: dto.habilidadesIds } },
          select: { id: true },
        });

        if (habilidadesExistentes.length !== dto.habilidadesIds.length) {
          const idsEncontrados = habilidadesExistentes.map((h) => h.id);
          const idsInvalidos = dto.habilidadesIds.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new OrigemHabilidadesInvalidasException(idsInvalidos);
        }
      }

      // Criar origem com relações
      const origem = await this.prisma.origem.create({
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          requisitosTexto: dto.requisitosTexto,
          requerGrandeCla: dto.requerGrandeCla ?? false,
          requerTecnicaHeriditaria: dto.requerTecnicaHeriditaria ?? false,
          bloqueiaTecnicaHeriditaria: dto.bloqueiaTecnicaHeriditaria ?? false,

          // ✅ Criar perícias
          ...(dto.pericias?.length && {
            pericias: {
              create: dto.pericias.map((p) => ({
                periciaId: p.periciaId,
                tipo: p.tipo,
                grupoEscolha: p.grupoEscolha,
              })),
            },
          }),

          // ✅ Criar habilidades iniciais
          ...(dto.habilidadesIds?.length && {
            habilidadesOrigem: {
              create: dto.habilidadesIds.map((habilidadeId) => ({
                habilidadeId,
              })),
            },
          }),
        },
        include: {
          pericias: {
            include: {
              pericia: true,
            },
          },
          habilidadesOrigem: {
            include: {
              habilidade: true,
            },
          },
        },
      });

      return this.addHabilidadesIniciais(origem);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * FIND ALL - Listar todas as origens
   */
  async findAll() {
    try {
      const origens = await this.prisma.origem.findMany({
        orderBy: { nome: 'asc' },
        include: {
          pericias: {
            include: {
              pericia: true,
            },
            orderBy: { tipo: 'asc' },
          },
          habilidadesOrigem: {
            include: {
              habilidade: true,
            },
          },
          _count: {
            select: {
              personagensBase: true,
              personagensCampanha: true,
            },
          },
        },
      });

      return origens.map((o) => this.addHabilidadesIniciais(o));
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * FIND ONE - Buscar origem por ID
   */
  async findOne(id: number) {
    try {
      const origem = await this.prisma.origem.findUnique({
        where: { id },
        include: {
          pericias: {
            include: {
              pericia: true,
            },
            orderBy: { tipo: 'asc' },
          },
          habilidadesOrigem: {
            include: {
              habilidade: true,
            },
          },
          _count: {
            select: {
              personagensBase: true,
              personagensCampanha: true,
            },
          },
        },
      });

      if (!origem) {
        throw new OrigemNaoEncontradaException(id);
      }

      return this.addHabilidadesIniciais(origem);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * UPDATE - Atualizar origem
   */
  async update(id: number, dto: UpdateOrigemDto) {
    try {
      // Verificar se existe
      await this.findOne(id);

      // Verificar nome duplicado (se mudou)
      if (dto.nome) {
        const duplicado = await this.prisma.origem.findFirst({
          where: {
            nome: dto.nome,
            NOT: { id },
          },
        });

        if (duplicado) {
          throw new OrigemNomeDuplicadoException(dto.nome);
        }
      }

      // Validar perícias (se fornecidas)
      if (dto.pericias?.length) {
        const periciaIds = dto.pericias.map((p) => p.periciaId);
        const periciasExistentes = await this.prisma.pericia.findMany({
          where: { id: { in: periciaIds } },
          select: { id: true },
        });

        if (periciasExistentes.length !== periciaIds.length) {
          const idsEncontrados = periciasExistentes.map((p) => p.id);
          const idsInvalidos = periciaIds.filter((id) => !idsEncontrados.includes(id));
          throw new OrigemPericiasInvalidasException(idsInvalidos);
        }
      }

      // Validar habilidades (se fornecidas)
      if (dto.habilidadesIds?.length) {
        const habilidadesExistentes = await this.prisma.habilidade.findMany({
          where: { id: { in: dto.habilidadesIds } },
          select: { id: true },
        });

        if (habilidadesExistentes.length !== dto.habilidadesIds.length) {
          const idsEncontrados = habilidadesExistentes.map((h) => h.id);
          const idsInvalidos = dto.habilidadesIds.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new OrigemHabilidadesInvalidasException(idsInvalidos);
        }
      }

      // Atualizar origem
      const origem = await this.prisma.origem.update({
        where: { id },
        data: {
          ...(dto.nome && { nome: dto.nome }),
          ...(dto.descricao !== undefined && { descricao: dto.descricao }),
          ...(dto.requisitosTexto !== undefined && {
            requisitosTexto: dto.requisitosTexto,
          }),
          ...(dto.requerGrandeCla !== undefined && {
            requerGrandeCla: dto.requerGrandeCla,
          }),
          ...(dto.requerTecnicaHeriditaria !== undefined && {
            requerTecnicaHeriditaria: dto.requerTecnicaHeriditaria,
          }),
          ...(dto.bloqueiaTecnicaHeriditaria !== undefined && {
            bloqueiaTecnicaHeriditaria: dto.bloqueiaTecnicaHeriditaria,
          }),

          // ✅ Atualizar perícias (deletar e recriar)
          ...(dto.pericias !== undefined && {
            pericias: {
              deleteMany: {},
              ...(dto.pericias.length > 0 && {
                create: dto.pericias.map((p) => ({
                  periciaId: p.periciaId,
                  tipo: p.tipo,
                  grupoEscolha: p.grupoEscolha,
                })),
              }),
            },
          }),

          // ✅ Atualizar habilidades (deletar e recriar)
          ...(dto.habilidadesIds !== undefined && {
            habilidadesOrigem: {
              deleteMany: {},
              ...(dto.habilidadesIds.length > 0 && {
                create: dto.habilidadesIds.map((habilidadeId) => ({
                  habilidadeId,
                })),
              }),
            },
          }),
        },
        include: {
          pericias: {
            include: {
              pericia: true,
            },
          },
          habilidadesOrigem: {
            include: {
              habilidade: true,
            },
          },
        },
      });

      return this.addHabilidadesIniciais(origem);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * DELETE - Remover origem
   */
  async remove(id: number) {
    try {
      // Verificar se existe
      await this.findOne(id);

      // Verificar se está sendo usada
      const [usadaEmBase, usadaEmCampanha] = await Promise.all([
        this.prisma.personagemBase.count({ where: { origemId: id } }),
        this.prisma.personagemCampanha.count({ where: { origemId: id } }),
      ]);

      const totalUsos = usadaEmBase + usadaEmCampanha;

      if (totalUsos > 0) {
        throw new OrigemEmUsoException(id, totalUsos, {
          personagensBase: usadaEmBase,
          personagensCampanha: usadaEmCampanha,
        });
      }

      // Deletar (cascade vai limpar perícias e habilidades)
      await this.prisma.origem.delete({ where: { id } });

      return { message: 'Origem removida com sucesso' };
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }
}
