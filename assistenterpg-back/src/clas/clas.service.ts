// src/clas/clas.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { BadRequestException, Injectable } from '@nestjs/common';
import { TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaDto } from './dto/create-cla.dto';
import { UpdateClaDto } from './dto/update-cla.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  ClaNaoEncontradoException,
  ClaNomeDuplicadoException,
  TecnicasHereditariasInvalidasException,
  ClaEmUsoException,
} from 'src/common/exceptions/cla.exception';
import { SuplementoNaoEncontradoException } from 'src/common/exceptions/suplemento.exception';

@Injectable()
export class ClasService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarFonteSuplemento(
    fonte: TipoFonte,
    suplementoId: number | null,
  ) {
    if (suplementoId) {
      const suplemento = await this.prisma.suplemento.findUnique({
        where: { id: suplementoId },
        select: { id: true },
      });

      if (!suplemento) {
        throw new SuplementoNaoEncontradoException(suplementoId);
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

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * CREATE - Criar novo clã
   */
  async create(dto: CreateClaDto) {
    // Verificar nome duplicado
    const existente = await this.prisma.cla.findUnique({
      where: { nome: dto.nome },
    });

    if (existente) {
      throw new ClaNomeDuplicadoException(dto.nome);
    }

    // ✅ CORRIGIDO: Validar técnicas hereditárias (se fornecidas)
    if (dto.tecnicasHereditariasIds?.length) {
      const tecnicasExistentes = await this.prisma.tecnicaAmaldicoada.findMany({
        where: {
          id: { in: dto.tecnicasHereditariasIds },
          hereditaria: true, // ✅ Só pode vincular técnicas marcadas como hereditárias
        },
        select: { id: true },
      });

      if (tecnicasExistentes.length !== dto.tecnicasHereditariasIds.length) {
        const idsEncontrados = new Set(tecnicasExistentes.map((t) => t.id));
        const idsInvalidos = dto.tecnicasHereditariasIds.filter(
          (id) => !idsEncontrados.has(id),
        );
        throw new TecnicasHereditariasInvalidasException(idsInvalidos);
      }
    }

    // Criar clã com técnicas hereditárias
    const suplementoIdFinal = dto.suplementoId ?? null;
    const fonteFinal =
      dto.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    const cla = await this.prisma.cla.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        grandeCla: dto.grandeCla,
        fonte: fonteFinal,
        suplementoId: suplementoIdFinal,

        // ✅ CORRIGIDO: Criar técnicas hereditárias
        ...(dto.tecnicasHereditariasIds?.length && {
          tecnicasHereditarias: {
            create: dto.tecnicasHereditariasIds.map((tecnicaId) => ({
              tecnicaId,
            })),
          },
        }),
      },
      include: {
        tecnicasHereditarias: {
          include: {
            tecnica: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                tipo: true,
              },
            },
          },
        },
      },
    });

    return cla;
  }

  /**
   * FIND ALL - Listar todos os clãs
   */
  async findAll() {
    return this.prisma.cla.findMany({
      orderBy: { nome: 'asc' },
      include: {
        tecnicasHereditarias: {
          include: {
            tecnica: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                tipo: true,
              },
            },
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
  }

  /**
   * FIND ONE - Buscar clã por ID
   */
  async findOne(id: number) {
    const cla = await this.prisma.cla.findUnique({
      where: { id },
      include: {
        tecnicasHereditarias: {
          include: {
            tecnica: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                tipo: true,
                requisitos: true,
              },
            },
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

    if (!cla) {
      throw new ClaNaoEncontradoException(id);
    }

    return cla;
  }

  /**
   * UPDATE - Atualizar clã
   */
  async update(id: number, dto: UpdateClaDto) {
    // Verificar se existe
    const claAtual = await this.findOne(id);

    // Verificar nome duplicado (se mudou)
    if (dto.nome) {
      const duplicado = await this.prisma.cla.findFirst({
        where: {
          nome: dto.nome,
          NOT: { id },
        },
      });

      if (duplicado) {
        throw new ClaNomeDuplicadoException(dto.nome);
      }
    }

    // ✅ CORRIGIDO: Validar técnicas hereditárias (se fornecidas)
    if (dto.tecnicasHereditariasIds?.length) {
      const tecnicasExistentes = await this.prisma.tecnicaAmaldicoada.findMany({
        where: {
          id: { in: dto.tecnicasHereditariasIds },
          hereditaria: true,
        },
        select: { id: true },
      });

      if (tecnicasExistentes.length !== dto.tecnicasHereditariasIds.length) {
        const idsEncontrados = new Set(tecnicasExistentes.map((t) => t.id));
        const idsInvalidos = dto.tecnicasHereditariasIds.filter(
          (id) => !idsEncontrados.has(id),
        );
        throw new TecnicasHereditariasInvalidasException(idsInvalidos);
      }
    }

    // Atualizar clã
    const suplementoIdFinal =
      dto.suplementoId !== undefined ? dto.suplementoId : claAtual.suplementoId;
    const fonteFinal =
      dto.fonte ?? (suplementoIdFinal ? TipoFonte.SUPLEMENTO : claAtual.fonte);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    const cla = await this.prisma.cla.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.grandeCla !== undefined && { grandeCla: dto.grandeCla }),
        ...(fonteFinal !== claAtual.fonte && { fonte: fonteFinal }),
        ...(dto.suplementoId !== undefined && {
          suplementoId: dto.suplementoId,
        }),

        // ✅ CORRIGIDO: Atualizar técnicas hereditárias (deletar e recriar)
        ...(dto.tecnicasHereditariasIds !== undefined && {
          tecnicasHereditarias: {
            deleteMany: {},
            ...(dto.tecnicasHereditariasIds.length > 0 && {
              create: dto.tecnicasHereditariasIds.map((tecnicaId) => ({
                tecnicaId,
              })),
            }),
          },
        }),
      },
      include: {
        tecnicasHereditarias: {
          include: {
            tecnica: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                tipo: true,
              },
            },
          },
        },
      },
    });

    return cla;
  }

  /**
   * DELETE - Remover clã
   */
  async remove(id: number) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar se está sendo usado
    const [usadoEmBase, usadoEmCampanha] = await Promise.all([
      this.prisma.personagemBase.count({ where: { claId: id } }),
      this.prisma.personagemCampanha.count({ where: { claId: id } }),
    ]);

    const totalUsos = usadoEmBase + usadoEmCampanha;

    if (totalUsos > 0) {
      throw new ClaEmUsoException(totalUsos, usadoEmBase, usadoEmCampanha);
    }

    // Deletar (cascade vai limpar tecnicasHereditarias)
    await this.prisma.cla.delete({
      where: { id },
    });

    return { message: 'Clã removido com sucesso' };
  }
}
