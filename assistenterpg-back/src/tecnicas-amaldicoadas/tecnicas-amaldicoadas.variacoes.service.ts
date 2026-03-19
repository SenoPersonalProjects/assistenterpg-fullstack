// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.variacoes.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HabilidadeTecnicaNaoEncontradaException,
  VariacaoHabilidadeNaoEncontradaException,
} from 'src/common/exceptions/tecnica-amaldicoada.exception';
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';
import {
  normalizarJsonOpcional,
  normalizarJsonOuNull,
} from './engine/tecnicas-amaldicoadas.engine';
import { tratarErroPrisma } from './tecnicas-amaldicoadas.errors';

@Injectable()
export class TecnicasAmaldicoadasVariacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllVariacoes(habilidadeTecnicaId: number) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id: habilidadeTecnicaId },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(habilidadeTecnicaId);
      }

      return this.prisma.variacaoHabilidade.findMany({
        where: { habilidadeTecnicaId },
        orderBy: { ordem: 'asc' },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async findOneVariacao(id: number) {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
        include: {
          habilidadeTecnica: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              tecnica: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                },
              },
            },
          },
        },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      return variacao;
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async createVariacao(dto: CreateVariacaoHabilidadeDto) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id: dto.habilidadeTecnicaId },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(
          dto.habilidadeTecnicaId,
        );
      }

      return this.prisma.variacaoHabilidade.create({
        data: {
          habilidadeTecnicaId: dto.habilidadeTecnicaId,
          nome: dto.nome,
          descricao: dto.descricao,
          substituiCustos: dto.substituiCustos ?? false,
          custoPE: dto.custoPE ?? null,
          custoEA: dto.custoEA ?? null,
          custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
          custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
          execucao: dto.execucao ?? null,
          area: dto.area ?? null,
          alcance: dto.alcance ?? null,
          alvo: dto.alvo ?? null,
          duracao: dto.duracao ?? null,
          resistencia: dto.resistencia ?? null,
          dtResistencia: dto.dtResistencia ?? null,
          criticoValor: dto.criticoValor ?? null,
          criticoMultiplicador: dto.criticoMultiplicador ?? null,
          danoFlat: dto.danoFlat ?? null,
          danoFlatTipo: dto.danoFlatTipo ?? null,
          dadosDano: normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
          escalonamentoCustoPE: dto.escalonamentoCustoPE ?? null,
          escalonamentoTipo: dto.escalonamentoTipo ?? null,
          escalonamentoEfeito: normalizarJsonOuNull(dto.escalonamentoEfeito),
          escalonamentoDano: normalizarJsonOuNull(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional ?? null,
          requisitos: normalizarJsonOuNull(dto.requisitos),
          ordem: dto.ordem ?? 0,
        },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async updateVariacao(id: number, dto: UpdateVariacaoHabilidadeDto) {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      return this.prisma.variacaoHabilidade.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          substituiCustos: dto.substituiCustos,
          custoPE: dto.custoPE,
          custoEA: dto.custoEA,
          custoSustentacaoEA: dto.custoSustentacaoEA,
          custoSustentacaoPE: dto.custoSustentacaoPE,
          execucao: dto.execucao,
          area: dto.area,
          alcance: dto.alcance,
          alvo: dto.alvo,
          duracao: dto.duracao,
          resistencia: dto.resistencia,
          dtResistencia: dto.dtResistencia,
          criticoValor: dto.criticoValor,
          criticoMultiplicador: dto.criticoMultiplicador,
          danoFlat: dto.danoFlat,
          danoFlatTipo: dto.danoFlatTipo,
          dadosDano: normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoCustoPE: dto.escalonamentoCustoPE,
          escalonamentoTipo: dto.escalonamentoTipo,
          escalonamentoEfeito: normalizarJsonOpcional(dto.escalonamentoEfeito),
          escalonamentoDano: normalizarJsonOpcional(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional,
          requisitos: normalizarJsonOpcional(dto.requisitos),
          ordem: dto.ordem,
        },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async removeVariacao(id: number): Promise<void> {
    try {
      const variacao = await this.prisma.variacaoHabilidade.findUnique({
        where: { id },
      });

      if (!variacao) {
        throw new VariacaoHabilidadeNaoEncontradaException(id);
      }

      await this.prisma.variacaoHabilidade.delete({ where: { id } });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }
}
