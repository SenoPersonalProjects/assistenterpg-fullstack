// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.habilidades.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HabilidadeCodigoDuplicadoException,
  HabilidadeTecnicaNaoEncontradaException,
  TecnicaNaoEncontradaException,
} from 'src/common/exceptions/tecnica-amaldicoada.exception';
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';
import {
  normalizarJsonOpcional,
  normalizarJsonOuNull,
} from './engine/tecnicas-amaldicoadas.engine';
import { tratarErroPrisma } from './tecnicas-amaldicoadas.errors';

@Injectable()
export class TecnicasAmaldicoadasHabilidadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllHabilidades(tecnicaId: number) {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id: tecnicaId },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(tecnicaId);
      }

      return this.prisma.habilidadeTecnica.findMany({
        where: { tecnicaId },
        include: {
          variacoes: {
            orderBy: { ordem: 'asc' },
          },
        },
        orderBy: { ordem: 'asc' },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async findOneHabilidade(id: number) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
        include: {
          tecnica: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
          variacoes: {
            orderBy: { ordem: 'asc' },
          },
        },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      return habilidade;
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async createHabilidade(dto: CreateHabilidadeTecnicaDto) {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id: dto.tecnicaId },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(dto.tecnicaId);
      }

      const existe = await this.prisma.habilidadeTecnica.findUnique({
        where: { codigo: dto.codigo },
      });

      if (existe) {
        throw new HabilidadeCodigoDuplicadoException(dto.codigo);
      }

      return this.prisma.habilidadeTecnica.create({
        data: {
          tecnicaId: dto.tecnicaId,
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao,
          requisitos: normalizarJsonOuNull(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area ?? null,
          alcance: dto.alcance ?? null,
          alvo: dto.alvo ?? null,
          duracao: dto.duracao ?? null,
          resistencia: dto.resistencia ?? null,
          dtResistencia: dto.dtResistencia ?? null,
          custoPE: dto.custoPE ?? 0,
          custoEA: dto.custoEA ?? 0,
          custoSustentacaoEA: dto.custoSustentacaoEA ?? null,
          custoSustentacaoPE: dto.custoSustentacaoPE ?? null,
          testesExigidos: normalizarJsonOuNull(dto.testesExigidos),
          criticoValor: dto.criticoValor ?? null,
          criticoMultiplicador: dto.criticoMultiplicador ?? null,
          danoFlat: dto.danoFlat ?? null,
          danoFlatTipo: dto.danoFlatTipo ?? null,
          dadosDano: normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? false,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
          escalonamentoCustoPE: dto.escalonamentoCustoPE ?? 0,
          escalonamentoTipo: dto.escalonamentoTipo ?? 'OUTRO',
          escalonamentoEfeito: normalizarJsonOuNull(dto.escalonamentoEfeito),
          escalonamentoDano: normalizarJsonOuNull(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem ?? 0,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async updateHabilidade(id: number, dto: UpdateHabilidadeTecnicaDto) {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      return this.prisma.habilidadeTecnica.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          requisitos: normalizarJsonOpcional(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area,
          alcance: dto.alcance,
          alvo: dto.alvo,
          duracao: dto.duracao,
          resistencia: dto.resistencia,
          dtResistencia: dto.dtResistencia,
          custoPE: dto.custoPE,
          custoEA: dto.custoEA,
          custoSustentacaoEA: dto.custoSustentacaoEA,
          custoSustentacaoPE: dto.custoSustentacaoPE,
          testesExigidos: normalizarJsonOpcional(dto.testesExigidos),
          criticoValor: dto.criticoValor,
          criticoMultiplicador: dto.criticoMultiplicador,
          danoFlat: dto.danoFlat,
          danoFlatTipo: dto.danoFlatTipo,
          dadosDano: normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoCustoPE: dto.escalonamentoCustoPE,
          escalonamentoTipo: dto.escalonamentoTipo,
          escalonamentoEfeito: normalizarJsonOpcional(dto.escalonamentoEfeito),
          escalonamentoDano: normalizarJsonOpcional(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }

  async removeHabilidade(id: number): Promise<void> {
    try {
      const habilidade = await this.prisma.habilidadeTecnica.findUnique({
        where: { id },
      });

      if (!habilidade) {
        throw new HabilidadeTecnicaNaoEncontradaException(id);
      }

      await this.prisma.habilidadeTecnica.delete({ where: { id } });
    } catch (error: unknown) {
      tratarErroPrisma(error);
      throw error;
    }
  }
}
