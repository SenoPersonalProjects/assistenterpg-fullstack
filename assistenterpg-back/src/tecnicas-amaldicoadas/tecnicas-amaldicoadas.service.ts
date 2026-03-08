// src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoTecnicaAmaldicoada, TipoFonte, Prisma } from '@prisma/client';

// DTOs - Técnicas
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FiltrarTecnicasDto } from './dto/filtrar-tecnicas.dto';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';

// DTOs - Habilidades
import { CreateHabilidadeTecnicaDto } from './dto/create-habilidade-tecnica.dto';
import { UpdateHabilidadeTecnicaDto } from './dto/update-habilidade-tecnica.dto';

// DTOs - Variações
import { CreateVariacaoHabilidadeDto } from './dto/create-variacao.dto';
import { UpdateVariacaoHabilidadeDto } from './dto/update-variacao.dto';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  TecnicaNaoEncontradaException,
  TecnicaCodigoOuNomeDuplicadoException,
  TecnicaNaoInataHereditariaException,
  TecnicaHereditariaSemClaException,
  TecnicaSuplementoNaoEncontradoException,
  TecnicaEmUsoException,
  TecnicaClaNaoEncontradoException,
  HabilidadeTecnicaNaoEncontradaException,
  HabilidadeCodigoDuplicadoException,
  VariacaoHabilidadeNaoEncontradaException,
} from 'src/common/exceptions/tecnica-amaldicoada.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

const tecnicaDetalhadaInclude = {
  clas: {
    include: {
      cla: {
        select: {
          id: true,
          nome: true,
          grandeCla: true,
        },
      },
    },
  },
  habilidades: {
    include: {
      variacoes: {
        orderBy: { ordem: 'asc' as const },
      },
    },
    orderBy: { ordem: 'asc' as const },
  },
  suplemento: true,
} satisfies Prisma.TecnicaAmaldicoadaInclude;

type TecnicaDetalhadaPayload = Prisma.TecnicaAmaldicoadaGetPayload<{
  include: typeof tecnicaDetalhadaInclude;
}>;

const tecnicaUsoInclude = {
  _count: {
    select: {
      personagensBaseComInata: true,
      personagensCampanhaComInata: true,
      personagensBaseAprendeu: true,
      personagensCampanhaAprendeu: true,
    },
  },
} satisfies Prisma.TecnicaAmaldicoadaInclude;

@Injectable()
export class TecnicasAmaldicoadasService {
  constructor(private prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private normalizarJsonOuNull(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === undefined || value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private normalizarJsonOpcional(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

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
        throw new TecnicaSuplementoNaoEncontradoException(suplementoId);
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

  // ==========================================
  // 📚 TÉCNICAS AMALDIÇOADAS - CRUD
  // ==========================================

  /**
   * Buscar todas as técnicas com filtros opcionais
   */
  async findAllTecnicas(
    filtros: FiltrarTecnicasDto,
  ): Promise<TecnicaDetalhadaDto[]> {
    try {
      const where: Prisma.TecnicaAmaldicoadaWhereInput = {};

      if (filtros.nome) {
        // ✅ MySQL já é case-insensitive por padrão - sem 'mode'
        where.nome = { contains: filtros.nome };
      }

      if (filtros.codigo) {
        where.codigo = filtros.codigo;
      }

      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }

      if (filtros.hereditaria !== undefined) {
        where.hereditaria = filtros.hereditaria;
      }

      // ✅ CORRIGIDO: origem → fonte
      if (filtros.fonte) {
        where.fonte = filtros.fonte;
      }

      // ✅ NOVO: Filtro por suplemento
      if (filtros.suplementoId) {
        where.suplementoId = filtros.suplementoId;
      }

      // Filtro por clã
      if (filtros.claId || filtros.claNome) {
        where.clas = {
          some: filtros.claId
            ? { claId: filtros.claId }
            : { cla: { nome: filtros.claNome } },
        };
      }

      const incluirClas = filtros.incluirClas !== false;
      const incluirHabilidades = filtros.incluirHabilidades === true;

      const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
        where,
        include: tecnicaDetalhadaInclude,
        orderBy: { nome: 'asc' },
      });

      return tecnicas.map((tecnica) =>
        this.mapTecnicaToDto(tecnica, {
          incluirClas,
          incluirHabilidades,
        }),
      );
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnica por ID
   */
  async findOneTecnica(id: number): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
        include: tecnicaDetalhadaInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      return this.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnica por código
   */
  async findTecnicaByCodigo(codigo: string): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { codigo },
        include: tecnicaDetalhadaInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(codigo);
      }

      return this.mapTecnicaToDto(tecnica);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova técnica
   */
  async createTecnica(dto: CreateTecnicaDto): Promise<TecnicaDetalhadaDto> {
    try {
      // Validações
      const existe = await this.prisma.tecnicaAmaldicoada.findFirst({
        where: {
          OR: [{ codigo: dto.codigo }, { nome: dto.nome }],
        },
      });

      if (existe) {
        throw new TecnicaCodigoOuNomeDuplicadoException(dto.codigo, dto.nome);
      }

      // Validar hereditária
      if (dto.hereditaria && dto.tipo !== TipoTecnicaAmaldicoada.INATA) {
        throw new TecnicaNaoInataHereditariaException(dto.tipo);
      }

      if (
        dto.hereditaria &&
        (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
      ) {
        throw new TecnicaHereditariaSemClaException();
      }

      const suplementoIdFinal = dto.suplementoId ?? null;
      const fonteFinal =
        dto.fonte ??
        (suplementoIdFinal ? TipoFonte.SUPLEMENTO : TipoFonte.SISTEMA_BASE);
      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Criar técnica
      const tecnica = await this.prisma.tecnicaAmaldicoada.create({
        data: {
          codigo: dto.codigo,
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria ?? false,
          linkExterno: dto.linkExterno ?? null,

          // ✅ CORRIGIDO: origem → fonte
          fonte: fonteFinal,
          suplementoId: suplementoIdFinal,

          requisitos: this.normalizarJsonOuNull(dto.requisitos),
        },
      });

      // Vincular clãs (se hereditária)
      if (
        dto.hereditaria &&
        dto.clasHereditarios &&
        dto.clasHereditarios.length > 0
      ) {
        await this.vincularClas(tecnica.id, dto.clasHereditarios);
      }

      return this.findOneTecnica(tecnica.id);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar técnica
   */
  async updateTecnica(
    id: number,
    dto: UpdateTecnicaDto,
  ): Promise<TecnicaDetalhadaDto> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      if (dto.nome) {
        const tecnicaComMesmoNome =
          await this.prisma.tecnicaAmaldicoada.findFirst({
            where: {
              nome: dto.nome,
              NOT: { id },
            },
          });

        if (tecnicaComMesmoNome) {
          throw new TecnicaCodigoOuNomeDuplicadoException(
            tecnica.codigo,
            dto.nome,
          );
        }
      }

      // Determinar tipo final (atual ou atualizado)
      const tipoFinal = dto.tipo ?? tecnica.tipo;
      const hereditariaFinal = dto.hereditaria ?? tecnica.hereditaria;

      // Validar hereditária com tipo final
      if (hereditariaFinal && tipoFinal === TipoTecnicaAmaldicoada.NAO_INATA) {
        throw new TecnicaNaoInataHereditariaException(tipoFinal);
      }

      const suplementoIdFinal =
        dto.suplementoId !== undefined
          ? dto.suplementoId
          : tecnica.suplementoId;
      const fonteFinal =
        dto.fonte ?? (suplementoIdFinal ? TipoFonte.SUPLEMENTO : tecnica.fonte);
      await this.validarFonteSuplemento(fonteFinal, suplementoIdFinal);

      // Atualiza vínculos com clãs quando:
      // - lista de clãs foi explicitamente enviada
      // - técnica foi marcada como não hereditária
      const shouldUpdateClas =
        dto.clasHereditarios !== undefined || dto.hereditaria === false;

      if (dto.hereditaria === true && dto.clasHereditarios === undefined) {
        const totalClasVinculados = await this.prisma.tecnicaCla.count({
          where: { tecnicaId: id },
        });

        if (totalClasVinculados === 0) {
          throw new TecnicaHereditariaSemClaException(id);
        }
      }

      if (shouldUpdateClas) {
        // Validar se técnica hereditária tem clãs
        if (
          hereditariaFinal &&
          (!dto.clasHereditarios || dto.clasHereditarios.length === 0)
        ) {
          throw new TecnicaHereditariaSemClaException(id);
        }

        // Atualizar vínculos com clãs
        await this.prisma.tecnicaCla.deleteMany({ where: { tecnicaId: id } });

        if (
          hereditariaFinal &&
          dto.clasHereditarios &&
          dto.clasHereditarios.length > 0
        ) {
          await this.vincularClas(id, dto.clasHereditarios);
        }
      }

      // Atualizar técnica
      await this.prisma.tecnicaAmaldicoada.update({
        where: { id },
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          tipo: dto.tipo,
          hereditaria: dto.hereditaria,
          linkExterno: dto.linkExterno,

          // ✅ CORRIGIDO: origem → fonte
          fonte: fonteFinal,
          ...(dto.suplementoId !== undefined && {
            suplementoId: dto.suplementoId,
          }),

          requisitos: this.normalizarJsonOpcional(dto.requisitos),
        },
      });

      return this.findOneTecnica(id);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar técnica
   */
  async removeTecnica(id: number): Promise<void> {
    try {
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id },
        include: tecnicaUsoInclude,
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(id);
      }

      // Verificar se está em uso
      const detalhesUso = {
        personagensBaseComInata: tecnica._count.personagensBaseComInata,
        personagensCampanhaComInata: tecnica._count.personagensCampanhaComInata,
        personagensBaseAprendeu: tecnica._count.personagensBaseAprendeu,
        personagensCampanhaAprendeu: tecnica._count.personagensCampanhaAprendeu,
      };

      const totalUso = Object.values(detalhesUso).reduce(
        (acc, val) => acc + val,
        0,
      );

      if (totalUso > 0) {
        throw new TecnicaEmUsoException(id, totalUso, detalhesUso);
      }

      await this.prisma.tecnicaAmaldicoada.delete({ where: { id } });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar técnicas de um clã específico
   */
  async findTecnicasByCla(claId: number): Promise<TecnicaDetalhadaDto[]> {
    try {
      const tecnicas = await this.prisma.tecnicaAmaldicoada.findMany({
        where: {
          hereditaria: true,
          clas: {
            some: { claId },
          },
        },
        include: tecnicaDetalhadaInclude,
        orderBy: { nome: 'asc' },
      });

      return tecnicas.map((tecnica) => this.mapTecnicaToDto(tecnica));
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🎯 HABILIDADES DE TÉCNICA - CRUD
  // ==========================================

  /**
   * Buscar todas as habilidades de uma técnica
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar habilidade por ID
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova habilidade
   */
  async createHabilidade(dto: CreateHabilidadeTecnicaDto) {
    try {
      // Verificar se a técnica existe
      const tecnica = await this.prisma.tecnicaAmaldicoada.findUnique({
        where: { id: dto.tecnicaId },
      });

      if (!tecnica) {
        throw new TecnicaNaoEncontradaException(dto.tecnicaId);
      }

      // Verificar se já existe habilidade com o mesmo código
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
          requisitos: this.normalizarJsonOuNull(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area ?? null,
          alcance: dto.alcance ?? null,
          alvo: dto.alvo ?? null,
          duracao: dto.duracao ?? null,
          resistencia: dto.resistencia ?? null,
          dtResistencia: dto.dtResistencia ?? null,
          custoPE: dto.custoPE ?? 0,
          custoEA: dto.custoEA ?? 0,
          testesExigidos: this.normalizarJsonOuNull(dto.testesExigidos),
          criticoValor: dto.criticoValor ?? null,
          criticoMultiplicador: dto.criticoMultiplicador ?? null,
          danoFlat: dto.danoFlat ?? null,
          danoFlatTipo: dto.danoFlatTipo ?? null,
          dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? false,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? 0,
          escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem ?? 0,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar habilidade
   */
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
          requisitos: this.normalizarJsonOpcional(dto.requisitos),
          execucao: dto.execucao,
          area: dto.area,
          alcance: dto.alcance,
          alvo: dto.alvo,
          duracao: dto.duracao,
          resistencia: dto.resistencia,
          dtResistencia: dto.dtResistencia,
          custoPE: dto.custoPE,
          custoEA: dto.custoEA,
          testesExigidos: this.normalizarJsonOpcional(dto.testesExigidos),
          criticoValor: dto.criticoValor,
          criticoMultiplicador: dto.criticoMultiplicador,
          danoFlat: dto.danoFlat,
          danoFlatTipo: dto.danoFlatTipo,
          dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          grauTipoGrauCodigo: dto.grauTipoGrauCodigo,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
          efeito: dto.efeito,
          ordem: dto.ordem,
        },
        include: {
          variacoes: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar habilidade
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🔄 VARIAÇÕES DE HABILIDADE - CRUD
  // ==========================================

  /**
   * Buscar todas as variações de uma habilidade
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Buscar variação por ID
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Criar nova variação
   */
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
          dadosDano: this.normalizarJsonOuNull(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau ?? null,
          escalonamentoCustoEA: dto.escalonamentoCustoEA ?? null,
          escalonamentoDano: this.normalizarJsonOuNull(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional ?? null,
          requisitos: this.normalizarJsonOuNull(dto.requisitos),
          ordem: dto.ordem ?? 0,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Atualizar variação
   */
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
          dadosDano: this.normalizarJsonOpcional(dto.dadosDano),
          escalonaPorGrau: dto.escalonaPorGrau,
          escalonamentoCustoEA: dto.escalonamentoCustoEA,
          escalonamentoDano: this.normalizarJsonOpcional(dto.escalonamentoDano),
          efeitoAdicional: dto.efeitoAdicional,
          requisitos: this.normalizarJsonOpcional(dto.requisitos),
          ordem: dto.ordem,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Deletar variação
   */
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
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==========================================
  // 🔧 MÉTODOS AUXILIARES
  // ==========================================

  private async vincularClas(
    tecnicaId: number,
    claNomes: string[],
  ): Promise<void> {
    for (const nome of claNomes) {
      const cla = await this.prisma.cla.findUnique({ where: { nome } });

      if (!cla) {
        throw new TecnicaClaNaoEncontradoException(nome);
      }

      await this.prisma.tecnicaCla.create({
        data: {
          tecnicaId,
          claId: cla.id,
        },
      });
    }
  }

  // ✅ CORRIGIDO: Mapper atualizado
  private mapTecnicaToDto(
    tecnica: TecnicaDetalhadaPayload,
    options?: {
      incluirClas?: boolean;
      incluirHabilidades?: boolean;
    },
  ): TecnicaDetalhadaDto {
    const incluirClas = options?.incluirClas !== false;
    const incluirHabilidades = options?.incluirHabilidades !== false;

    return {
      id: tecnica.id,
      codigo: tecnica.codigo,
      nome: tecnica.nome,
      descricao: tecnica.descricao,
      tipo: tecnica.tipo,
      hereditaria: tecnica.hereditaria,
      linkExterno: tecnica.linkExterno ?? undefined,
      fonte: tecnica.fonte,
      suplementoId: tecnica.suplementoId ?? undefined,
      requisitos: tecnica.requisitos ?? undefined,
      clasHereditarios: incluirClas
        ? tecnica.clas.map((tecnicaCla) => tecnicaCla.cla)
        : [],
      habilidades: incluirHabilidades
        ? (tecnica.habilidades as unknown as TecnicaDetalhadaDto['habilidades'])
        : [],
      criadoEm: tecnica.criadoEm,
      atualizadoEm: tecnica.atualizadoEm,
    };
  }
}
