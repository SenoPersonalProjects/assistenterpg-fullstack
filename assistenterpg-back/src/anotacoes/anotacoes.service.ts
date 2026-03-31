import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FiltrarAnotacoesDto } from './dto/filtrar-anotacoes.dto';
import { CreateAnotacaoDto } from './dto/create-anotacao.dto';
import { UpdateAnotacaoDto } from './dto/update-anotacao.dto';
import {
  CampanhaAcessoNegadoException,
  CampanhaNaoEncontradaException,
  SessaoCampanhaNaoEncontradaException,
} from 'src/common/exceptions/campanha.exception';
import {
  AnotacaoCampanhaSessaoInvalidaException,
  AnotacaoNaoEncontradaException,
  AnotacaoSemPermissaoException,
} from 'src/common/exceptions/anotacao.exception';
import { PaginatedResult } from 'src/common/dto/pagination-query.dto';

const anotacaoSelect = Prisma.validator<Prisma.AnotacaoSelect>()({
  id: true,
  titulo: true,
  conteudo: true,
  criadoEm: true,
  atualizadoEm: true,
  campanha: { select: { id: true, nome: true } },
  sessao: { select: { id: true, titulo: true } },
});

type AnotacaoView = Prisma.AnotacaoGetPayload<{
  select: typeof anotacaoSelect;
}>;

@Injectable()
export class AnotacoesService {
  constructor(private readonly prisma: PrismaService) {}

  private async garantirAcessoCampanha(campanhaId: number, usuarioId: number) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: {
        id: true,
        donoId: true,
        membros: { select: { usuarioId: true } },
      },
    });

    if (!campanha) {
      throw new CampanhaNaoEncontradaException(campanhaId);
    }

    const ehDono = campanha.donoId === usuarioId;
    const membro = campanha.membros.find((m) => m.usuarioId === usuarioId);

    if (!ehDono && !membro) {
      throw new CampanhaAcessoNegadoException(campanhaId, usuarioId);
    }

    return campanha;
  }

  private async resolverAssociacoes(
    usuarioId: number,
    campanhaId: number | null,
    sessaoId: number | null,
  ): Promise<{ campanhaId: number | null; sessaoId: number | null }> {
    if (sessaoId) {
      const sessao = await this.prisma.sessao.findUnique({
        where: { id: sessaoId },
        select: { id: true, campanhaId: true },
      });

      if (!sessao) {
        throw new SessaoCampanhaNaoEncontradaException(sessaoId);
      }

      if (campanhaId && campanhaId !== sessao.campanhaId) {
        throw new AnotacaoCampanhaSessaoInvalidaException(campanhaId, sessaoId);
      }

      await this.garantirAcessoCampanha(sessao.campanhaId, usuarioId);
      return { campanhaId: sessao.campanhaId, sessaoId };
    }

    if (campanhaId) {
      await this.garantirAcessoCampanha(campanhaId, usuarioId);
    }

    return { campanhaId: campanhaId ?? null, sessaoId: null };
  }

  private mapear(anotacao: AnotacaoView): AnotacaoView {
    return {
      ...anotacao,
      campanha: anotacao.campanha ?? null,
      sessao: anotacao.sessao ?? null,
    };
  }

  async listar(
    usuarioId: number,
    filtros: FiltrarAnotacoesDto,
  ): Promise<PaginatedResult<AnotacaoView>> {
    const pagina = filtros.page ?? 1;
    const limite = filtros.limit ?? 20;
    const campanhaId = filtros.campanhaId ?? null;
    const sessaoId = filtros.sessaoId ?? null;

    const associacoes = await this.resolverAssociacoes(
      usuarioId,
      campanhaId,
      sessaoId,
    );

    const where: Prisma.AnotacaoWhereInput = {
      usuarioId,
      campanhaId: associacoes.campanhaId ?? undefined,
      sessaoId: associacoes.sessaoId ?? undefined,
    };

    const [total, itens] = await this.prisma.$transaction([
      this.prisma.anotacao.count({ where }),
      this.prisma.anotacao.findMany({
        where,
        select: anotacaoSelect,
        orderBy: { criadoEm: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
    ]);

    return {
      items: itens.map((item) => this.mapear(item)),
      total,
      page: pagina,
      limit: limite,
      totalPages: Math.max(1, Math.ceil(total / limite)),
    };
  }

  async criar(usuarioId: number, dto: CreateAnotacaoDto) {
    const associacoes = await this.resolverAssociacoes(
      usuarioId,
      dto.campanhaId ?? null,
      dto.sessaoId ?? null,
    );

    const anotacao = await this.prisma.anotacao.create({
      data: {
        usuarioId,
        titulo: dto.titulo.trim(),
        conteudo: dto.conteudo.trim(),
        campanhaId: associacoes.campanhaId,
        sessaoId: associacoes.sessaoId,
      },
      select: anotacaoSelect,
    });

    return this.mapear(anotacao);
  }

  async atualizar(id: number, usuarioId: number, dto: UpdateAnotacaoDto) {
    const existente = await this.prisma.anotacao.findUnique({
      where: { id },
      select: { id: true, usuarioId: true, campanhaId: true, sessaoId: true },
    });

    if (!existente) {
      throw new AnotacaoNaoEncontradaException(id);
    }

    if (existente.usuarioId !== usuarioId) {
      throw new AnotacaoSemPermissaoException(id);
    }

    const campanhaId =
      dto.campanhaId !== undefined ? dto.campanhaId : existente.campanhaId;
    const sessaoId =
      dto.sessaoId !== undefined ? dto.sessaoId : existente.sessaoId;

    const associacoes = await this.resolverAssociacoes(
      usuarioId,
      campanhaId ?? null,
      sessaoId ?? null,
    );

    const data: Prisma.AnotacaoUpdateInput = {
      titulo: dto.titulo?.trim(),
      conteudo: dto.conteudo?.trim(),
    };

    if (dto.campanhaId !== undefined || dto.sessaoId !== undefined) {
      data.campanha = associacoes.campanhaId
        ? { connect: { id: associacoes.campanhaId } }
        : { disconnect: true };
      data.sessao = associacoes.sessaoId
        ? { connect: { id: associacoes.sessaoId } }
        : { disconnect: true };
    }

    const anotacao = await this.prisma.anotacao.update({
      where: { id },
      data,
      select: anotacaoSelect,
    });

    return this.mapear(anotacao);
  }

  async remover(id: number, usuarioId: number): Promise<void> {
    const existente = await this.prisma.anotacao.findUnique({
      where: { id },
      select: { id: true, usuarioId: true },
    });

    if (!existente) {
      throw new AnotacaoNaoEncontradaException(id);
    }

    if (existente.usuarioId !== usuarioId) {
      throw new AnotacaoSemPermissaoException(id);
    }

    await this.prisma.anotacao.delete({ where: { id } });
  }
}
