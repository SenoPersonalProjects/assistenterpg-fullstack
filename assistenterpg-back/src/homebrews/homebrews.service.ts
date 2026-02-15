// src/homebrews/homebrews.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { HomebrewDetalhadoDto } from './dto/homebrew-detalhado.dto';
import { StatusPublicacao } from '@prisma/client';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  HomebrewNaoEncontradoException,
  HomebrewJaPublicadoException,
  HomebrewDadosInvalidosException,
  HomebrewSemPermissaoException,
} from 'src/common/exceptions/homebrew.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

// Validators
import { validateHomebrewDados } from './validators/validate-homebrew-dados';
import { validateHomebrewTecnicaCustom } from './validators/validate-homebrew-tecnica';
import { validateHomebrewEquipamentoCustom } from './validators/validate-homebrew-equipamento';
import { validateHomebrewOrigemCustom } from './validators/validate-homebrew-origem';
import { validateHomebrewTrilhaCustom } from './validators/validate-homebrew-trilha';
import { validateHomebrewCaminhoCustom } from './validators/validate-homebrew-caminho';
import { validateHomebrewClaCustom } from './validators/validate-homebrew-cla';
import { validateHomebrewPoderCustom } from './validators/validate-homebrew-poder';

@Injectable()
export class HomebrewsService {
  private readonly logger = new Logger(HomebrewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // ✅ MÉTODOS PÚBLICOS - CRUD
  // ========================================

  /**
   * Lista homebrews com filtros e paginação
   */
  async listar(filtros: FiltrarHomebrewsDto, usuarioId?: number, isAdmin: boolean = false) {
    try {
      const {
        nome,
        tipo,
        status,
        usuarioId: filtroUsuarioId,
        apenasPublicados,
        pagina = 1,
        limite = 20,
      } = filtros;

      const where: any = {};

      if (nome) {
        where.nome = { contains: nome, mode: 'insensitive' };
      }

      if (tipo) {
        where.tipo = tipo;
      }

      if (status) {
        where.status = status;
      }

      if (filtroUsuarioId) {
        where.usuarioId = filtroUsuarioId;
      }

      if (apenasPublicados) {
        where.status = StatusPublicacao.PUBLICADO;
      } else if (!isAdmin) {
        where.OR = [{ status: StatusPublicacao.PUBLICADO }, { usuarioId: usuarioId }];
      }

      const [total, homebrews] = await Promise.all([
        this.prisma.homebrew.count({ where }),
        this.prisma.homebrew.findMany({
          where,
          skip: (pagina - 1) * limite,
          take: limite,
          orderBy: { criadoEm: 'desc' },
          select: {
            id: true,
            codigo: true,
            nome: true,
            descricao: true,
            tipo: true,
            status: true,
            tags: true,
            versao: true,
            criadoEm: true,
            atualizadoEm: true,
            usuarioId: true,
            usuario: {
              select: {
                id: true,
                apelido: true,
              },
            },
          },
        }),
      ]);

      return {
        dados: homebrews,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      };
    } catch (error) {
      // ✅ Tratar erros do Prisma
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Busca homebrew detalhado por ID
   */
  async buscarPorId(
    id: number,
    usuarioId?: number,
    isAdmin: boolean = false,
  ): Promise<HomebrewDetalhadoDto> {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
              email: true,
            },
          },
        },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);

      return this.mapDetalhado(homebrew);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Busca homebrew detalhado por código
   */
  async buscarPorCodigo(
    codigo: string,
    usuarioId?: number,
    isAdmin: boolean = false,
  ): Promise<HomebrewDetalhadoDto> {
    try {
      const homebrew = await this.prisma.homebrew.findFirst({
        where: { codigo },
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
              email: true,
            },
          },
        },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(codigo);
      }

      this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);

      return this.mapDetalhado(homebrew);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * CREATE - Criar homebrew
   */
  async criar(createHomebrewDto: CreateHomebrewDto, usuarioId: number) {
    try {
      // 1️⃣ Validar dados específicos do tipo
      await validateHomebrewDados(createHomebrewDto.tipo, createHomebrewDto.dados);

      // 2️⃣ Validações customizadas (regras de negócio)
      this.validarDadosCustomizados(createHomebrewDto.tipo, createHomebrewDto.dados);

      // 3️⃣ Gerar código único
      const codigo = this.gerarCodigo(usuarioId);

      // 4️⃣ Preparar tags (garantir que seja array)
      const tags = Array.isArray(createHomebrewDto.tags) ? createHomebrewDto.tags : [];

      // 5️⃣ Criar homebrew
      const homebrew = await this.prisma.homebrew.create({
        data: {
          codigo,
          nome: createHomebrewDto.nome,
          descricao: createHomebrewDto.descricao || null,
          tipo: createHomebrewDto.tipo,
          status: createHomebrewDto.status || StatusPublicacao.RASCUNHO,
          dados: createHomebrewDto.dados as any,
          tags: tags as any,
          versao: createHomebrewDto.versao || '1.0.0',
          usuarioId,
        },
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Homebrew criado: ${homebrew.codigo} por usuário ${usuarioId}`);

      return this.mapDetalhado(homebrew);
    } catch (error) {
      // ✅ Capturar erros de validação e transformar
      if (error.response?.message) {
        // Se veio do validator (BadRequestException)
        const messages = Array.isArray(error.response.message)
          ? error.response.message
          : [error.response.message];
        throw new HomebrewDadosInvalidosException(messages);
      }

      // ✅ Tratar erros do Prisma
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }

      throw error;
    }
  }

  /**
   * UPDATE - Atualizar homebrew
   */
  async atualizar(
    id: number,
    updateHomebrewDto: UpdateHomebrewDto,
    usuarioId: number,
    isAdmin: boolean = false,
  ) {
    try {
      // 1️⃣ Buscar homebrew
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      // 2️⃣ Verificar permissões (apenas dono ou admin)
      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('editar', 'este homebrew', id);
      }

      // 3️⃣ Preparar dados de atualização
      const dadosAtualizacao: any = {};

      if (updateHomebrewDto.nome !== undefined) dadosAtualizacao.nome = updateHomebrewDto.nome;
      if (updateHomebrewDto.descricao !== undefined)
        dadosAtualizacao.descricao = updateHomebrewDto.descricao;
      if (updateHomebrewDto.status !== undefined)
        dadosAtualizacao.status = updateHomebrewDto.status;
      if (updateHomebrewDto.tags !== undefined) dadosAtualizacao.tags = updateHomebrewDto.tags;

      // 4️⃣ Se atualizar tipo, validar compatibilidade com dados
      if (updateHomebrewDto.tipo !== undefined) {
        dadosAtualizacao.tipo = updateHomebrewDto.tipo;
      }

      // 5️⃣ Se atualizar dados, validar
      if (updateHomebrewDto.dados !== undefined) {
        const tipoFinal = updateHomebrewDto.tipo || homebrew.tipo;
        await validateHomebrewDados(tipoFinal, updateHomebrewDto.dados);
        this.validarDadosCustomizados(tipoFinal, updateHomebrewDto.dados);

        dadosAtualizacao.dados = updateHomebrewDto.dados;

        // Incrementar versão automaticamente
        dadosAtualizacao.versao = this.incrementarVersao(homebrew.versao);
      }

      // 6️⃣ Atualizar
      const atualizado = await this.prisma.homebrew.update({
        where: { id },
        data: dadosAtualizacao,
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Homebrew atualizado: ${atualizado.codigo} (v${atualizado.versao})`);

      return this.mapDetalhado(atualizado);
    } catch (error) {
      // ✅ Capturar erros de validação
      if (error.response?.message) {
        const messages = Array.isArray(error.response.message)
          ? error.response.message
          : [error.response.message];
        throw new HomebrewDadosInvalidosException(messages);
      }

      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }

      throw error;
    }
  }

  /**
   * DELETE - Remover homebrew
   */
  async deletar(id: number, usuarioId: number, isAdmin: boolean = false): Promise<void> {
    try {
      // 1️⃣ Buscar homebrew
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      // 2️⃣ Verificar permissões (apenas dono ou admin)
      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('deletar', 'este homebrew', id);
      }

      // 3️⃣ Deletar
      await this.prisma.homebrew.delete({
        where: { id },
      });

      this.logger.log(`Homebrew deletado: ${homebrew.codigo} por usuário ${usuarioId}`);
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  // ========================================
  // ✅ ROTAS ESPECÍFICAS
  // ========================================

  /**
   * Publicar homebrew (mudar status para PUBLICADO)
   */
  async publicar(id: number, usuarioId: number, isAdmin: boolean = false) {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('publicar', 'este homebrew', id);
      }

      if (homebrew.status === StatusPublicacao.PUBLICADO) {
        throw new HomebrewJaPublicadoException(id);
      }

      const atualizado = await this.prisma.homebrew.update({
        where: { id },
        data: { status: StatusPublicacao.PUBLICADO },
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
            },
          },
        },
      });

      this.logger.log(`Homebrew publicado: ${atualizado.codigo}`);

      return atualizado;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Arquivar homebrew (mudar status para ARQUIVADO)
   */
  async arquivar(id: number, usuarioId: number, isAdmin: boolean = false) {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('arquivar', 'este homebrew', id);
      }

      const atualizado = await this.prisma.homebrew.update({
        where: { id },
        data: { status: StatusPublicacao.ARQUIVADO },
        include: {
          usuario: {
            select: {
              id: true,
              apelido: true,
            },
          },
        },
      });

      this.logger.log(`Homebrew arquivado: ${atualizado.codigo}`);

      return atualizado;
    } catch (error) {
      if (error.code?.startsWith('P')) {
        handlePrismaError(error);
      }
      throw error;
    }
  }

  /**
   * Buscar homebrews do usuário autenticado
   */
  async meus(usuarioId: number, filtros: FiltrarHomebrewsDto) {
    return this.listar({ ...filtros, usuarioId }, usuarioId, false);
  }

  // ========================================
  // ✅ HELPERS PRIVADOS
  // ========================================

  /**
   * Gerar código único para homebrew
   * Formato: USER_{userId}_HB_{timestamp}
   */
  private gerarCodigo(usuarioId: number): string {
    const timestamp = Date.now();
    return `USER_${usuarioId}_HB_${timestamp}`;
  }

  /**
   * Validar dados customizados por tipo
   */
  private validarDadosCustomizados(tipo: string, dados: any): void {
    switch (tipo) {
      case 'TECNICA_AMALDICOADA':
        validateHomebrewTecnicaCustom(dados);
        break;
      case 'EQUIPAMENTO':
        validateHomebrewEquipamentoCustom(dados);
        break;
      case 'ORIGEM':
        validateHomebrewOrigemCustom(dados);
        break;
      case 'TRILHA':
        validateHomebrewTrilhaCustom(dados);
        break;
      case 'CAMINHO':
        validateHomebrewCaminhoCustom(dados);
        break;
      case 'CLA':
        validateHomebrewClaCustom(dados);
        break;
      case 'PODER_GENERICO':
        validateHomebrewPoderCustom(dados);
        break;
    }
  }

  /**
   * Verificar permissão de leitura
   */
  private verificarPermissaoLeitura(homebrew: any, usuarioId?: number, isAdmin: boolean = false) {
    const isOwner = homebrew.usuarioId === usuarioId;
    const isPublicado = homebrew.status === StatusPublicacao.PUBLICADO;

    if (!isPublicado && !isOwner && !isAdmin) {
      throw new HomebrewSemPermissaoException('visualizar', 'este homebrew', homebrew.id);
    }
  }

  /**
   * Incrementar versão (semântica: major.minor.patch)
   */
  private incrementarVersao(versaoAtual: string): string {
    const partes = versaoAtual.split('.');
    if (partes.length !== 3) return '1.0.1';

    const [major, minor, patch] = partes.map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Mapear para DTO detalhado
   */
  private mapDetalhado(homebrew: any): HomebrewDetalhadoDto {
    return {
      id: homebrew.id,
      codigo: homebrew.codigo,
      nome: homebrew.nome,
      descricao: homebrew.descricao,
      tipo: homebrew.tipo,
      status: homebrew.status,
      dados: homebrew.dados,
      tags: homebrew.tags || [],
      versao: homebrew.versao,
      usuarioId: homebrew.usuarioId,
      usuarioApelido: homebrew.usuario?.apelido,
      criadoEm: homebrew.criadoEm,
      atualizadoEm: homebrew.atualizadoEm,
    };
  }
}
