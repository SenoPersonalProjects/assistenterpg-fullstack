import { Injectable } from '@nestjs/common';
import { Prisma, TipoFonte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TecnicaNaoEncontradaException } from 'src/common/exceptions/tecnica-amaldicoada.exception';

type PrismaLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class TecnicaInataPropriaService {
  constructor(private readonly prisma: PrismaService) {}

  async garantirTecnicaPropriaPersonagemBase(
    personagemBaseId: number,
    prisma: PrismaLike = this.prisma,
  ): Promise<number | null> {
    const personagem = await prisma.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        id: true,
        donoId: true,
        tecnicaInataId: true,
        tecnicaInataPropriaId: true,
      },
    });

    if (!personagem) return null;
    if (!personagem.tecnicaInataId) return null;
    if (personagem.tecnicaInataPropriaId) return personagem.tecnicaInataPropriaId;

    const tecnicaId = await this.clonarTecnicaInata({
      usuarioId: personagem.donoId,
      tecnicaBaseId: personagem.tecnicaInataId,
      personagemBaseId: personagem.id,
      prisma,
    });

    await prisma.personagemBase.update({
      where: { id: personagem.id },
      data: { tecnicaInataPropriaId: tecnicaId },
    });

    return tecnicaId;
  }

  async clonarTecnicaInata(params: {
    usuarioId: number;
    tecnicaBaseId: number;
    personagemBaseId?: number;
    personagemCampanhaId?: number;
    prisma?: PrismaLike;
  }): Promise<number> {
    const prisma = params.prisma ?? this.prisma;
    const tecnicaBase = await prisma.tecnicaAmaldicoada.findUnique({
      where: { id: params.tecnicaBaseId },
      include: {
        clas: true,
        habilidades: {
          include: {
            variacoes: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!tecnicaBase) {
      throw new TecnicaNaoEncontradaException(params.tecnicaBaseId);
    }

    const codigoTecnica = `PB_TI_${params.usuarioId}_${params.personagemBaseId ?? 'X'}_${params.personagemCampanhaId ?? 'X'}_${Date.now()}`;

    const tecnicaCriada = await prisma.tecnicaAmaldicoada.create({
      data: {
        codigo: codigoTecnica,
        nome: tecnicaBase.nome,
        descricao: tecnicaBase.descricao,
        tipo: tecnicaBase.tipo,
        hereditaria: tecnicaBase.hereditaria,
        linkExterno: tecnicaBase.linkExterno,
        requisitos: tecnicaBase.requisitos as Prisma.InputJsonValue | undefined,
        fonte: TipoFonte.HOMEBREW,
        usuarioId: params.usuarioId,
        tecnicaBaseId: tecnicaBase.id,
        clas: tecnicaBase.clas.length
          ? {
              create: tecnicaBase.clas.map((item) => ({
                claId: item.claId,
              })),
            }
          : undefined,
      },
      select: { id: true },
    });

    for (const habilidadeBase of tecnicaBase.habilidades) {
      const codigoHabilidade = `${habilidadeBase.codigo}__PB_${tecnicaCriada.id}_${Date.now()}_${habilidadeBase.id}`;
      const habilidadeCriada = await prisma.habilidadeTecnica.create({
        data: {
          tecnicaId: tecnicaCriada.id,
          habilidadeBaseId: habilidadeBase.id,
          habilitada: true,
          codigo: codigoHabilidade,
          nome: habilidadeBase.nome,
          descricao: habilidadeBase.descricao,
          requisitos: habilidadeBase.requisitos as Prisma.InputJsonValue | undefined,
          execucao: habilidadeBase.execucao,
          area: habilidadeBase.area,
          alcance: habilidadeBase.alcance,
          alvo: habilidadeBase.alvo,
          duracao: habilidadeBase.duracao,
          resistencia: habilidadeBase.resistencia,
          dtResistencia: habilidadeBase.dtResistencia,
          custoPE: habilidadeBase.custoPE,
          custoEA: habilidadeBase.custoEA,
          custoSustentacaoEA: habilidadeBase.custoSustentacaoEA,
          custoSustentacaoPE: habilidadeBase.custoSustentacaoPE,
          testesExigidos: habilidadeBase.testesExigidos as Prisma.InputJsonValue | undefined,
          criticoValor: habilidadeBase.criticoValor,
          criticoMultiplicador: habilidadeBase.criticoMultiplicador,
          danoFlat: habilidadeBase.danoFlat,
          danoFlatTipo: habilidadeBase.danoFlatTipo,
          dadosDano: habilidadeBase.dadosDano as Prisma.InputJsonValue | undefined,
          escalonaPorGrau: habilidadeBase.escalonaPorGrau,
          grauTipoGrauCodigo: habilidadeBase.grauTipoGrauCodigo,
          escalonamentoCustoEA: habilidadeBase.escalonamentoCustoEA,
          escalonamentoCustoPE: habilidadeBase.escalonamentoCustoPE,
          escalonamentoTipo: habilidadeBase.escalonamentoTipo,
          escalonamentoEfeito: habilidadeBase.escalonamentoEfeito as Prisma.InputJsonValue | undefined,
          escalonamentoDano: habilidadeBase.escalonamentoDano as Prisma.InputJsonValue | undefined,
          efeito: habilidadeBase.efeito,
          ordem: habilidadeBase.ordem,
        },
        select: { id: true },
      });

      for (const variacaoBase of habilidadeBase.variacoes) {
        await prisma.variacaoHabilidade.create({
          data: {
            habilidadeTecnicaId: habilidadeCriada.id,
            variacaoBaseId: variacaoBase.id,
            nome: variacaoBase.nome,
            descricao: variacaoBase.descricao,
            substituiCustos: variacaoBase.substituiCustos,
            custoPE: variacaoBase.custoPE,
            custoEA: variacaoBase.custoEA,
            custoSustentacaoEA: variacaoBase.custoSustentacaoEA,
            custoSustentacaoPE: variacaoBase.custoSustentacaoPE,
            execucao: variacaoBase.execucao,
            area: variacaoBase.area,
            alcance: variacaoBase.alcance,
            alvo: variacaoBase.alvo,
            duracao: variacaoBase.duracao,
            resistencia: variacaoBase.resistencia,
            dtResistencia: variacaoBase.dtResistencia,
            criticoValor: variacaoBase.criticoValor,
            criticoMultiplicador: variacaoBase.criticoMultiplicador,
            danoFlat: variacaoBase.danoFlat,
            danoFlatTipo: variacaoBase.danoFlatTipo,
            dadosDano: variacaoBase.dadosDano as Prisma.InputJsonValue | undefined,
            escalonaPorGrau: variacaoBase.escalonaPorGrau,
            escalonamentoCustoEA: variacaoBase.escalonamentoCustoEA,
            escalonamentoCustoPE: variacaoBase.escalonamentoCustoPE,
            escalonamentoTipo: variacaoBase.escalonamentoTipo,
            escalonamentoEfeito: variacaoBase.escalonamentoEfeito as Prisma.InputJsonValue | undefined,
            escalonamentoDano: variacaoBase.escalonamentoDano as Prisma.InputJsonValue | undefined,
            efeitoAdicional: variacaoBase.efeitoAdicional,
            requisitos: variacaoBase.requisitos as Prisma.InputJsonValue | undefined,
            ordem: variacaoBase.ordem,
          },
        });
      }
    }

    return tecnicaCriada.id;
  }

  async sincronizarCampanhasComTecnicaBase(
    personagemBaseId: number,
    prisma: PrismaLike = this.prisma,
  ): Promise<void> {
    const personagemBase = await prisma.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        id: true,
        donoId: true,
        tecnicaInataId: true,
        tecnicaInataPropriaId: true,
      },
    });

    if (
      !personagemBase ||
      !personagemBase.tecnicaInataId ||
      !personagemBase.tecnicaInataPropriaId
    ) {
      return;
    }

    const campanhas = await prisma.personagemCampanha.findMany({
      where: {
        personagemBaseId,
        tecnicaInataSincronizaBase: true,
      },
      select: {
        id: true,
        tecnicaInataPropriaId: true,
      },
    });

    for (const campanha of campanhas) {
      if (campanha.tecnicaInataPropriaId) {
        await prisma.variacaoHabilidade.deleteMany({
          where: {
            habilidadeTecnica: {
              tecnicaId: campanha.tecnicaInataPropriaId,
            },
          },
        });
        await prisma.habilidadeTecnica.deleteMany({
          where: { tecnicaId: campanha.tecnicaInataPropriaId },
        });
        await prisma.tecnicaCla.deleteMany({
          where: { tecnicaId: campanha.tecnicaInataPropriaId },
        });
        await prisma.tecnicaAmaldicoada.delete({
          where: { id: campanha.tecnicaInataPropriaId },
        });
      }

      const novaTecnicaId = await this.clonarTecnicaInata({
        usuarioId: personagemBase.donoId,
        tecnicaBaseId: personagemBase.tecnicaInataPropriaId,
        personagemCampanhaId: campanha.id,
        prisma,
      });

      await prisma.personagemCampanha.update({
        where: { id: campanha.id },
        data: { tecnicaInataPropriaId: novaTecnicaId },
      });
    }
  }

  async removerTecnicaClonada(
    tecnicaId: number | null | undefined,
    prisma: PrismaLike = this.prisma,
  ): Promise<void> {
    if (!tecnicaId) return;

    await prisma.variacaoHabilidade.deleteMany({
      where: {
        habilidadeTecnica: {
          tecnicaId,
        },
      },
    });
    await prisma.habilidadeTecnica.deleteMany({
      where: { tecnicaId },
    });
    await prisma.tecnicaCla.deleteMany({
      where: { tecnicaId },
    });
    await prisma.tecnicaAmaldicoada.delete({
      where: { id: tecnicaId },
    });
  }
}
