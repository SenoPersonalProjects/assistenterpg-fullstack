// src/habilidades/habilidades.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TipoFonte } from '@prisma/client';
import { buscarPoderesGenericosDisponiveis } from '../personagem-base/regras-criacao/regras-poderes';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';
import { FilterHabilidadeDto } from './dto/filter-habilidade.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  HabilidadeNaoEncontradaException,
  HabilidadeNomeDuplicadoException,
  TipoGrauNaoEncontradoException,
  HabilidadeEmUsoException,
} from 'src/common/exceptions/habilidade.exception';
import { SuplementoNaoEncontradoException } from 'src/common/exceptions/suplemento.exception';

@Injectable()
export class HabilidadesService {
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
        throw new BadRequestException(
          'Quando suplementoId for informado, fonte deve ser SUPLEMENTO',
        );
      }
      return;
    }

    if (fonte === TipoFonte.SUPLEMENTO) {
      throw new BadRequestException('fonte SUPLEMENTO exige suplementoId');
    }
  }

  // ========================================
  // ✅ MÉTODOS ESPECÍFICOS
  // ========================================

  /**
   * ✅ GET /habilidades/poderes-genericos
   * Retorna todos os poderes genéricos com requisitos
   * Reutiliza a função de regras para manter consistência
   */
  async findPoderesGenericos() {
    return buscarPoderesGenericosDisponiveis(this.prisma);
  }

  // ========================================
  // ✅ CRUD COMPLETO
  // ========================================

  /**
   * CREATE - Criar nova habilidade
   */
  async create(createDto: CreateHabilidadeDto) {
    // Verificar se nome já existe
    const existente = await this.prisma.habilidade.findUnique({
      where: { nome: createDto.nome },
    });

    if (existente) {
      throw new HabilidadeNomeDuplicadoException(createDto.nome);
    }

    // Validar tipos de grau (se fornecidos)
    if (createDto.efeitosGrau?.length) {
      const tiposGrau = await this.prisma.tipoGrau.findMany({
        where: {
          codigo: { in: createDto.efeitosGrau.map((e) => e.tipoGrauCodigo) },
        },
        select: { codigo: true },
      });

      const codigosExistentes = tiposGrau.map((t) => t.codigo);
      const codigosInvalidos = createDto.efeitosGrau
        .map((e) => e.tipoGrauCodigo)
        .filter((c) => !codigosExistentes.includes(c));

      if (codigosInvalidos.length > 0) {
        throw new TipoGrauNaoEncontradoException(codigosInvalidos);
      }
    }

    // Criar habilidade com relações
    const suplementoIdFinal = createDto.suplementoId ?? null;
    const fonteFinal =
      createDto.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    const habilidade = await this.prisma.habilidade.create({
      data: {
        nome: createDto.nome,
        descricao: createDto.descricao,
        tipo: createDto.tipo,
        origem: createDto.origem,
        requisitos: createDto.requisitos,
        mecanicasEspeciais: createDto.mecanicasEspeciais,
        fonte: fonteFinal,
        suplementoId: suplementoIdFinal,

        // ✅ Criar efeitos de grau
        ...(createDto.efeitosGrau?.length && {
          efeitosGrau: {
            create: createDto.efeitosGrau.map((efeito) => ({
              tipoGrauCodigo: efeito.tipoGrauCodigo,
              valor: efeito.valor ?? 1,
              escalonamentoPorNivel: efeito.escalonamentoPorNivel,
            })),
          },
        }),
      },
      include: {
        efeitosGrau: {
          include: {
            tipoGrau: { select: { codigo: true, nome: true } },
          },
        },
      },
    });

    return habilidade;
  }

  /**
   * FIND ALL - Listar habilidades com filtros e paginação
   */
  async findAll(filtros: FilterHabilidadeDto) {
    const {
      tipo,
      origem,
      fonte,
      suplementoId,
      busca,
      pagina = 1,
      limite = 20,
    } = filtros;

    const where: Prisma.HabilidadeWhereInput = {};

    if (tipo) where.tipo = tipo;
    if (origem) where.origem = origem;
    if (fonte) where.fonte = fonte;
    if (suplementoId) where.suplementoId = suplementoId;

    // Busca por nome ou descrição (MySQL já é case-insensitive)
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    const [total, dados] = await Promise.all([
      this.prisma.habilidade.count({ where }),
      this.prisma.habilidade.findMany({
        where,
        include: {
          efeitosGrau: {
            include: {
              tipoGrau: { select: { codigo: true, nome: true } },
            },
          },
          _count: {
            select: {
              personagensBase: true,
              personagensCampanha: true,
              habilidadesClasse: true,
              habilidadesTrilha: true,
              habilidadesOrigem: true,
            },
          },
        },
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      dados,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  /**
   * FIND ONE - Buscar habilidade por ID
   */
  async findOne(id: number) {
    const habilidade = await this.prisma.habilidade.findUnique({
      where: { id },
      include: {
        efeitosGrau: {
          include: {
            tipoGrau: { select: { codigo: true, nome: true, descricao: true } },
          },
          orderBy: { tipoGrauCodigo: 'asc' },
        },
        habilidadesClasse: {
          include: {
            classe: { select: { id: true, nome: true } },
          },
          orderBy: { nivelConcedido: 'asc' },
        },
        habilidadesTrilha: {
          include: {
            trilha: { select: { id: true, nome: true } },
            caminho: { select: { id: true, nome: true } },
          },
          orderBy: { nivelConcedido: 'asc' },
        },
        habilidadesOrigem: {
          include: {
            origem: { select: { id: true, nome: true } },
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

    if (!habilidade) {
      throw new HabilidadeNaoEncontradaException(id);
    }

    return habilidade;
  }

  /**
   * UPDATE - Atualizar habilidade
   */
  async update(id: number, updateDto: UpdateHabilidadeDto) {
    // Verificar se existe
    const habilidadeAtual = await this.findOne(id);

    // Verificar nome duplicado (se mudou)
    if (updateDto.nome) {
      const duplicado = await this.prisma.habilidade.findFirst({
        where: {
          nome: updateDto.nome,
          NOT: { id },
        },
      });

      if (duplicado) {
        throw new HabilidadeNomeDuplicadoException(updateDto.nome);
      }
    }

    // Validar tipos de grau (se fornecidos)
    if (updateDto.efeitosGrau?.length) {
      const tiposGrau = await this.prisma.tipoGrau.findMany({
        where: {
          codigo: { in: updateDto.efeitosGrau.map((e) => e.tipoGrauCodigo) },
        },
        select: { codigo: true },
      });

      const codigosExistentes = tiposGrau.map((t) => t.codigo);
      const codigosInvalidos = updateDto.efeitosGrau
        .map((e) => e.tipoGrauCodigo)
        .filter((c) => !codigosExistentes.includes(c));

      if (codigosInvalidos.length > 0) {
        throw new TipoGrauNaoEncontradoException(codigosInvalidos);
      }
    }

    const suplementoIdFinal =
      updateDto.suplementoId !== undefined
        ? updateDto.suplementoId
        : habilidadeAtual.suplementoId;
    const fonteFinal =
      updateDto.fonte ??
      (suplementoIdFinal ? TipoFonte.SUPLEMENTO : habilidadeAtual.fonte);
    await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

    // Atualizar habilidade
    const habilidade = await this.prisma.habilidade.update({
      where: { id },
      data: {
        ...(updateDto.nome && { nome: updateDto.nome }),
        ...(updateDto.descricao !== undefined && {
          descricao: updateDto.descricao,
        }),
        ...(updateDto.tipo && { tipo: updateDto.tipo }),
        ...(updateDto.origem !== undefined && { origem: updateDto.origem }),
        ...(updateDto.requisitos !== undefined && {
          requisitos: updateDto.requisitos,
        }),
        ...(updateDto.mecanicasEspeciais !== undefined && {
          mecanicasEspeciais: updateDto.mecanicasEspeciais,
        }),
        ...(fonteFinal !== habilidadeAtual.fonte && { fonte: fonteFinal }),
        ...(updateDto.suplementoId !== undefined && {
          suplementoId: updateDto.suplementoId,
        }),

        // ✅ Atualizar efeitos de grau (deletar e recriar)
        ...(updateDto.efeitosGrau !== undefined && {
          efeitosGrau: {
            deleteMany: {},
            ...(updateDto.efeitosGrau.length > 0 && {
              create: updateDto.efeitosGrau.map((efeito) => ({
                tipoGrauCodigo: efeito.tipoGrauCodigo,
                valor: efeito.valor ?? 1,
                escalonamentoPorNivel: efeito.escalonamentoPorNivel,
              })),
            }),
          },
        }),
      },
      include: {
        efeitosGrau: {
          include: {
            tipoGrau: { select: { codigo: true, nome: true } },
          },
        },
      },
    });

    return habilidade;
  }

  /**
   * DELETE - Remover habilidade
   */
  async remove(id: number) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar se está sendo usada
    const [
      usadaEmPersonagensBase,
      usadaEmPersonagensCampanha,
      usadaEmClasses,
      usadaEmTrilhas,
      usadaEmOrigens,
    ] = await Promise.all([
      this.prisma.habilidadePersonagemBase.count({
        where: { habilidadeId: id },
      }),
      this.prisma.habilidadePersonagemCampanha.count({
        where: { habilidadeId: id },
      }),
      this.prisma.habilidadeClasse.count({ where: { habilidadeId: id } }),
      this.prisma.habilidadeTrilha.count({ where: { habilidadeId: id } }),
      this.prisma.habilidadeOrigem.count({ where: { habilidadeId: id } }),
    ]);

    const totalUsos =
      usadaEmPersonagensBase +
      usadaEmPersonagensCampanha +
      usadaEmClasses +
      usadaEmTrilhas +
      usadaEmOrigens;

    if (totalUsos > 0) {
      throw new HabilidadeEmUsoException(id, totalUsos, {
        personagensBase: usadaEmPersonagensBase,
        personagensCampanha: usadaEmPersonagensCampanha,
        classes: usadaEmClasses,
        trilhas: usadaEmTrilhas,
        origens: usadaEmOrigens,
      });
    }

    // Deletar (cascade vai limpar relações)
    await this.prisma.habilidade.delete({
      where: { id },
    });

    return { message: 'Habilidade removida com sucesso' };
  }
}
