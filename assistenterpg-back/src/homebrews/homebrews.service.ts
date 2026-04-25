import { Injectable, Logger } from '@nestjs/common';
import { Prisma, StatusPublicacao, TipoHomebrewConteudo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomebrewDto } from './dto/create-homebrew.dto';
import { UpdateHomebrewDto } from './dto/update-homebrew.dto';
import { FiltrarHomebrewsDto } from './dto/filtrar-homebrews.dto';
import { HomebrewDetalhadoDto } from './dto/homebrew-detalhado.dto';
import { HomebrewTecnicaDto } from './dto/tecnicas/criar-homebrew-tecnica.dto';
import { HomebrewTrilhaDto } from './dto/trilhas/criar-homebrew-trilha.dto';
import { CreateHomebrewGrupoDto } from './dto/create-homebrew-grupo.dto';
import { UpdateHomebrewGrupoDto } from './dto/update-homebrew-grupo.dto';

import {
  HomebrewNaoEncontradoException,
  HomebrewJaPublicadoException,
  HomebrewDadosInvalidosException,
  HomebrewSemPermissaoException,
} from 'src/common/exceptions/homebrew.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

import { validateHomebrewDados } from './validators/validate-homebrew-dados';
import { validateHomebrewTecnicaCustom } from './validators/validate-homebrew-tecnica';
import { validateHomebrewEquipamentoCustom } from './validators/validate-homebrew-equipamento';
import { validateHomebrewOrigemCustom } from './validators/validate-homebrew-origem';
import { validateHomebrewTrilhaCustom } from './validators/validate-homebrew-trilha';
import { validateHomebrewCaminhoCustom } from './validators/validate-homebrew-caminho';
import { validateHomebrewClaCustom } from './validators/validate-homebrew-cla';
import { validateHomebrewPoderCustom } from './validators/validate-homebrew-poder';

const homebrewDetalhadoInclude = {
  usuario: {
    select: {
      id: true,
      apelido: true,
      email: true,
    },
  },
} satisfies Prisma.HomebrewInclude;

type HomebrewDetalhadoPayload = Prisma.HomebrewGetPayload<{
  include: typeof homebrewDetalhadoInclude;
}>;

type HomebrewPermissaoPayload = Pick<
  HomebrewDetalhadoPayload,
  'id' | 'usuarioId' | 'status'
>;

const homebrewGrupoInclude = {
  itens: {
    include: {
      homebrew: {
        select: {
          id: true,
          codigo: true,
          nome: true,
          tipo: true,
          status: true,
          versao: true,
          atualizadoEm: true,
        },
      },
    },
    orderBy: {
      homebrew: {
        nome: 'asc',
      },
    },
  },
} satisfies Prisma.HomebrewGrupoInclude;

type HomebrewGrupoPayload = Prisma.HomebrewGrupoGetPayload<{
  include: typeof homebrewGrupoInclude;
}>;

@Injectable()
export class HomebrewsService {
  private readonly logger = new Logger(HomebrewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private extrairMensagensValidacao(error: unknown): string[] | null {
    if (typeof error !== 'object' || error === null || !('response' in error)) {
      return null;
    }

    const response = (error as { response?: unknown }).response;
    if (
      typeof response !== 'object' ||
      response === null ||
      !('message' in response)
    ) {
      return null;
    }

    const message = (response as { message?: unknown }).message;

    if (Array.isArray(message)) {
      const mensagens = message.filter(
        (item): item is string => typeof item === 'string',
      );
      return mensagens.length > 0 ? mensagens : null;
    }

    if (typeof message === 'string') {
      return [message];
    }

    return null;
  }

  private normalizarJsonParaPersistir(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private mapearTags(tags: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags.filter((tag): tag is string => typeof tag === 'string');
  }

  async listar(
    filtros: FiltrarHomebrewsDto,
    usuarioId?: number,
    isAdmin: boolean = false,
  ) {
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

      const where: Prisma.HomebrewWhereInput = {};

      if (nome) {
        where.nome = { contains: nome };
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
        if (usuarioId !== undefined) {
          where.OR = [{ status: StatusPublicacao.PUBLICADO }, { usuarioId }];
        } else {
          where.status = StatusPublicacao.PUBLICADO;
        }
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
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorId(
    id: number,
    usuarioId?: number,
    isAdmin: boolean = false,
  ): Promise<HomebrewDetalhadoDto> {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
        include: homebrewDetalhadoInclude,
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);

      return this.mapDetalhado(homebrew);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorCodigo(
    codigo: string,
    usuarioId?: number,
    isAdmin: boolean = false,
  ): Promise<HomebrewDetalhadoDto> {
    try {
      const homebrew = await this.prisma.homebrew.findFirst({
        where: { codigo },
        include: homebrewDetalhadoInclude,
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(codigo);
      }

      this.verificarPermissaoLeitura(homebrew, usuarioId, isAdmin);

      return this.mapDetalhado(homebrew);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async criar(createHomebrewDto: CreateHomebrewDto, usuarioId: number) {
    try {
      await validateHomebrewDados(
        createHomebrewDto.tipo,
        createHomebrewDto.dados,
      );

      this.validarDadosCustomizados(
        createHomebrewDto.tipo,
        createHomebrewDto.dados,
      );

      const codigo = this.gerarCodigo(usuarioId);
      const tags = Array.isArray(createHomebrewDto.tags)
        ? createHomebrewDto.tags
        : [];

      const data: Prisma.HomebrewUncheckedCreateInput = {
        codigo,
        nome: createHomebrewDto.nome,
        descricao: createHomebrewDto.descricao ?? null,
        tipo: createHomebrewDto.tipo,
        status: createHomebrewDto.status ?? StatusPublicacao.RASCUNHO,
        dados: this.normalizarJsonParaPersistir(createHomebrewDto.dados),
        tags: this.normalizarJsonParaPersistir(tags),
        versao: createHomebrewDto.versao ?? '1.0.0',
        usuarioId,
      };

      const homebrew = await this.prisma.homebrew.create({
        data,
        include: homebrewDetalhadoInclude,
      });

      this.logger.log(
        `Homebrew criado: ${homebrew.codigo} por usuário ${usuarioId}`,
      );

      return this.mapDetalhado(homebrew);
    } catch (error: unknown) {
      const mensagens = this.extrairMensagensValidacao(error);
      if (mensagens) {
        throw new HomebrewDadosInvalidosException(mensagens);
      }

      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizar(
    id: number,
    updateHomebrewDto: UpdateHomebrewDto,
    usuarioId: number,
    isAdmin: boolean = false,
  ) {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('editar', 'este homebrew', id);
      }

      const dadosAtualizacao: Prisma.HomebrewUncheckedUpdateInput = {};

      if (updateHomebrewDto.nome !== undefined) {
        dadosAtualizacao.nome = updateHomebrewDto.nome;
      }
      if (updateHomebrewDto.descricao !== undefined) {
        dadosAtualizacao.descricao = updateHomebrewDto.descricao;
      }
      if (updateHomebrewDto.status !== undefined) {
        dadosAtualizacao.status = updateHomebrewDto.status;
      }
      if (updateHomebrewDto.tags !== undefined) {
        dadosAtualizacao.tags = this.normalizarJsonParaPersistir(
          updateHomebrewDto.tags,
        );
      }

      const tipoFoiAlterado =
        updateHomebrewDto.tipo !== undefined &&
        updateHomebrewDto.tipo !== homebrew.tipo;

      if (updateHomebrewDto.tipo !== undefined) {
        dadosAtualizacao.tipo = updateHomebrewDto.tipo;
      }

      const tipoFinal = updateHomebrewDto.tipo ?? homebrew.tipo;
      let dadosForamAlterados = false;

      if (updateHomebrewDto.dados !== undefined) {
        await validateHomebrewDados(tipoFinal, updateHomebrewDto.dados);
        this.validarDadosCustomizados(tipoFinal, updateHomebrewDto.dados);

        dadosAtualizacao.dados = this.normalizarJsonParaPersistir(
          updateHomebrewDto.dados,
        );
        dadosForamAlterados = true;
      } else if (tipoFoiAlterado) {
        await validateHomebrewDados(tipoFinal, homebrew.dados);
        this.validarDadosCustomizados(tipoFinal, homebrew.dados);
      }

      if (dadosForamAlterados || tipoFoiAlterado) {
        dadosAtualizacao.versao = this.incrementarVersao(homebrew.versao);
      }

      const atualizado = await this.prisma.homebrew.update({
        where: { id },
        data: dadosAtualizacao,
        include: homebrewDetalhadoInclude,
      });

      this.logger.log(
        `Homebrew atualizado: ${atualizado.codigo} (v${atualizado.versao})`,
      );

      return this.mapDetalhado(atualizado);
    } catch (error: unknown) {
      const mensagens = this.extrairMensagensValidacao(error);
      if (mensagens) {
        throw new HomebrewDadosInvalidosException(mensagens);
      }

      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async deletar(
    id: number,
    usuarioId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException('deletar', 'este homebrew', id);
      }

      await this.prisma.homebrew.delete({
        where: { id },
      });

      this.logger.log(
        `Homebrew deletado: ${homebrew.codigo} por usuário ${usuarioId}`,
      );
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async publicar(id: number, usuarioId: number, isAdmin: boolean = false) {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException(
          'publicar',
          'este homebrew',
          id,
        );
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
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async arquivar(id: number, usuarioId: number, isAdmin: boolean = false) {
    try {
      const homebrew = await this.prisma.homebrew.findUnique({
        where: { id },
      });

      if (!homebrew) {
        throw new HomebrewNaoEncontradoException(id);
      }

      if (homebrew.usuarioId !== usuarioId && !isAdmin) {
        throw new HomebrewSemPermissaoException(
          'arquivar',
          'este homebrew',
          id,
        );
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
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async meus(usuarioId: number, filtros: FiltrarHomebrewsDto) {
    return this.listar({ ...filtros, usuarioId }, usuarioId, false);
  }

  async listarGrupos(usuarioId: number) {
    try {
      const grupos = await this.prisma.homebrewGrupo.findMany({
        where: { usuarioId },
        include: homebrewGrupoInclude,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
      });

      return grupos.map((grupo) => this.mapearGrupo(grupo));
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarGrupoPorId(grupoId: number, usuarioId: number) {
    try {
      const grupo = await this.prisma.homebrewGrupo.findFirst({
        where: { id: grupoId, usuarioId },
        include: homebrewGrupoInclude,
      });

      if (!grupo) {
        throw new HomebrewNaoEncontradoException(grupoId);
      }

      return this.mapearGrupo(grupo);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async criarGrupo(usuarioId: number, dto: CreateHomebrewGrupoDto) {
    try {
      const nome = dto.nome.trim();
      const descricao = dto.descricao?.trim() || null;
      const homebrewIds = [...new Set(dto.homebrewIds ?? [])];

      await this.validarPertencimentoHomebrews(usuarioId, homebrewIds);

      const grupo = await this.prisma.homebrewGrupo.create({
        data: {
          usuarioId,
          nome,
          descricao,
          itens: {
            create: homebrewIds.map((homebrewId) => ({ homebrewId })),
          },
        },
        include: homebrewGrupoInclude,
      });

      return this.mapearGrupo(grupo);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizarGrupo(
    grupoId: number,
    usuarioId: number,
    dto: UpdateHomebrewGrupoDto,
  ) {
    try {
      await this.assertGrupoExiste(grupoId, usuarioId);

      const homebrewIds =
        dto.homebrewIds !== undefined ? [...new Set(dto.homebrewIds)] : null;
      if (homebrewIds) {
        await this.validarPertencimentoHomebrews(usuarioId, homebrewIds);
      }

      const grupo = await this.prisma.$transaction(async (tx) => {
        if (homebrewIds) {
          await tx.homebrewGrupoItem.deleteMany({ where: { grupoId } });
          if (homebrewIds.length > 0) {
            await tx.homebrewGrupoItem.createMany({
              data: homebrewIds.map((homebrewId) => ({ grupoId, homebrewId })),
            });
          }
        }

        return tx.homebrewGrupo.update({
          where: { id: grupoId },
          data: {
            ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
            ...(dto.descricao !== undefined
              ? { descricao: dto.descricao?.trim() || null }
              : {}),
          },
          include: homebrewGrupoInclude,
        });
      });

      return this.mapearGrupo(grupo);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async removerGrupo(grupoId: number, usuarioId: number) {
    try {
      await this.assertGrupoExiste(grupoId, usuarioId);
      await this.prisma.homebrewGrupo.delete({ where: { id: grupoId } });
      return { id: grupoId, message: 'Grupo removido com sucesso.' };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async exportarHomebrew(
    id: number,
    usuarioId?: number,
    isAdmin: boolean = false,
  ) {
    const homebrew = await this.buscarPorId(id, usuarioId, isAdmin);
    return {
      exportType: 'homebrew',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      item: {
        codigo: homebrew.codigo,
        nome: homebrew.nome,
        descricao: homebrew.descricao ?? null,
        tipo: homebrew.tipo,
        status: homebrew.status,
        versao: homebrew.versao,
        tags: homebrew.tags ?? [],
        dados: homebrew.dados,
      },
    };
  }

  async exportarGrupo(grupoId: number, usuarioId: number) {
    const grupo = await this.prisma.homebrewGrupo.findFirst({
      where: { id: grupoId, usuarioId },
      include: {
        itens: {
          include: {
            homebrew: true,
          },
          orderBy: {
            homebrew: {
              nome: 'asc',
            },
          },
        },
      },
    });
    if (!grupo) {
      throw new HomebrewNaoEncontradoException(grupoId);
    }
    return {
      exportType: 'homebrew-group',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      group: {
        id: grupo.id,
        nome: grupo.nome,
        descricao: grupo.descricao ?? null,
      },
      items: grupo.itens.map(({ homebrew }) => ({
        codigo: homebrew.codigo,
        nome: homebrew.nome,
        descricao: homebrew.descricao ?? null,
        tipo: homebrew.tipo,
        status: homebrew.status,
        versao: homebrew.versao,
        tags: this.mapearTags(homebrew.tags),
        dados: homebrew.dados,
      })),
    };
  }

  private async validarPertencimentoHomebrews(
    usuarioId: number,
    homebrewIds: number[],
  ): Promise<void> {
    if (homebrewIds.length === 0) return;

    const total = await this.prisma.homebrew.count({
      where: {
        usuarioId,
        id: { in: homebrewIds },
      },
    });

    if (total !== homebrewIds.length) {
      throw new HomebrewSemPermissaoException(
        'agrupar',
        'um ou mais homebrews',
      );
    }
  }

  private async assertGrupoExiste(grupoId: number, usuarioId: number) {
    const grupo = await this.prisma.homebrewGrupo.findFirst({
      where: { id: grupoId, usuarioId },
      select: { id: true },
    });

    if (!grupo) {
      throw new HomebrewNaoEncontradoException(grupoId);
    }
  }

  private gerarCodigo(usuarioId: number): string {
    const timestamp = Date.now();
    return `USER_${usuarioId}_HB_${timestamp}`;
  }

  private validarDadosCustomizados(
    tipo: TipoHomebrewConteudo,
    dados: unknown,
  ): void {
    switch (tipo) {
      case TipoHomebrewConteudo.TECNICA_AMALDICOADA:
        validateHomebrewTecnicaCustom(dados as HomebrewTecnicaDto);
        break;
      case TipoHomebrewConteudo.EQUIPAMENTO:
        validateHomebrewEquipamentoCustom(dados);
        break;
      case TipoHomebrewConteudo.ORIGEM:
        validateHomebrewOrigemCustom(dados);
        break;
      case TipoHomebrewConteudo.TRILHA:
        validateHomebrewTrilhaCustom(dados as HomebrewTrilhaDto);
        break;
      case TipoHomebrewConteudo.CAMINHO:
        validateHomebrewCaminhoCustom(dados);
        break;
      case TipoHomebrewConteudo.CLA:
        validateHomebrewClaCustom(dados);
        break;
      case TipoHomebrewConteudo.PODER_GENERICO:
        validateHomebrewPoderCustom(dados);
        break;
    }
  }

  private verificarPermissaoLeitura(
    homebrew: HomebrewPermissaoPayload,
    usuarioId?: number,
    isAdmin: boolean = false,
  ): void {
    const isOwner = homebrew.usuarioId === usuarioId;
    const isPublicado = homebrew.status === StatusPublicacao.PUBLICADO;

    if (!isPublicado && !isOwner && !isAdmin) {
      throw new HomebrewSemPermissaoException(
        'visualizar',
        'este homebrew',
        homebrew.id,
      );
    }
  }

  private incrementarVersao(versaoAtual: string): string {
    const partes = versaoAtual.split('.');
    if (partes.length !== 3) {
      return '1.0.1';
    }

    const [major, minor, patch] = partes.map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private mapDetalhado(
    homebrew: HomebrewDetalhadoPayload,
  ): HomebrewDetalhadoDto {
    return {
      id: homebrew.id,
      codigo: homebrew.codigo,
      nome: homebrew.nome,
      descricao: homebrew.descricao ?? undefined,
      tipo: homebrew.tipo,
      status: homebrew.status,
      dados: homebrew.dados,
      tags: this.mapearTags(homebrew.tags),
      versao: homebrew.versao,
      usuarioId: homebrew.usuarioId,
      usuarioApelido: homebrew.usuario.apelido,
      criadoEm: homebrew.criadoEm,
      atualizadoEm: homebrew.atualizadoEm,
    };
  }

  private mapearGrupo(grupo: HomebrewGrupoPayload) {
    return {
      id: grupo.id,
      nome: grupo.nome,
      descricao: grupo.descricao ?? null,
      criadoEm: grupo.criadoEm,
      atualizadoEm: grupo.atualizadoEm,
      quantidadeItens: grupo.itens.length,
      itens: grupo.itens.map(({ homebrew }) => ({
        id: homebrew.id,
        codigo: homebrew.codigo,
        nome: homebrew.nome,
        tipo: homebrew.tipo,
        status: homebrew.status,
        versao: homebrew.versao,
        atualizadoEm: homebrew.atualizadoEm,
      })),
    };
  }
}
