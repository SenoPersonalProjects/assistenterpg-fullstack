// src/inventario/inventario.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoriaEquipamento,
  ComplexidadeMaldicao,
  Prisma,
  TipoEquipamento,
} from '@prisma/client';
import { InventarioEngine } from './engine/inventario.engine';
import { InventarioMapper } from './inventario.mapper';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { AplicarModificacaoDto } from './dto/aplicar-modificacao.dto';
import { RemoverModificacaoDto } from './dto/remover-modificacao.dto';
import { PreviewItemDto } from './dto/preview-item.dto';
import { PreviewItensInventarioDto } from './dto/preview-itens-inventario.dto';
import {
  ItemInventarioComDados,
  PreviewAdicionarItemResponse,
  ResumoInventarioCompleto,
} from './engine/inventario.types';
import { calcularBloqueioEsquiva } from '../personagem-base/regras-criacao/regras-derivados';
import { extrairResistenciasDeHabilidades } from '../personagem-base/regras-criacao/regras-poderes-efeitos';
import { somarMapasResistencias } from '../personagem-base/regras-criacao/resistencias-personagem';
import {
  aplicarReducaoCategoriaDeterministica,
  calcularCapacidadeInventario,
  calcularCategoriaInventario,
  calcularEspacoUnitarioInventario,
  calcularQuantidadeModificacoesEfetivas,
  normalizarCategoriaInventario,
  resolverModificadoresInventario,
  type CapacidadeInventarioCalculada,
  type ModificadoresInventario,
} from './utils/inventario-calculo';
import {
  CODIGO_MOD_FUNCAO_ADICIONAL,
  equipamentoUsaPericiaPersonalizada,
  validarENormalizarEstadoItemPersonalizado,
} from './utils/item-personalizado';

// ✅ IMPORTAR EXCEÇÕES CUSTOMIZADAS
import {
  InventarioPersonagemNaoEncontradoException,
  InventarioSemPermissaoException,
  InventarioItemNaoEncontradoException,
  InventarioEquipamentoNaoEncontradoException,
  InventarioLimiteVestirExcedidoException,
  InventarioCapacidadeExcedidaException,
  InventarioEspacosInsuficientesException,
  InventarioGrauXamaExcedidoException,
  InventarioModificacaoNaoEncontradaException,
  InventarioModificacaoInvalidaException,
  InventarioModificacaoIncompativelException,
  InventarioModificacaoDuplicadaException,
  InventarioModificacaoNaoAplicadaException,
} from 'src/common/exceptions/inventario.exception';

import { handlePrismaError } from 'src/common/exceptions/database.exception';

// ✅ Type helper para Prisma client ou transação
type PrismaLike = PrismaService | Prisma.TransactionClient;

const inventarioItemComDadosInclude =
  Prisma.validator<Prisma.InventarioItemBaseInclude>()({
    equipamento: {
      include: {
        danos: {
          orderBy: { ordem: 'asc' },
        },
        reducesDano: true,
        protecaoAmaldicoada: true,
      },
    },
    modificacoes: {
      include: {
        modificacao: true,
      },
    },
  });

const modificacaoPreviewSelect =
  Prisma.validator<Prisma.ModificacaoEquipamentoSelect>()({
    id: true,
    codigo: true,
    nome: true,
    descricao: true,
    tipo: true,
    incrementoEspacos: true,
    efeitosMecanicos: true,
  });

const modificacaoCalculoSelect =
  Prisma.validator<Prisma.ModificacaoEquipamentoSelect>()({
    id: true,
    codigo: true,
    incrementoEspacos: true,
  });

type ModificacaoCalculoEntity = Prisma.ModificacaoEquipamentoGetPayload<{
  select: typeof modificacaoCalculoSelect;
}>;

type ModificacaoPreviewEntity = Prisma.ModificacaoEquipamentoGetPayload<{
  select: typeof modificacaoPreviewSelect;
}>;

const equipamentoPreparacaoInventarioInclude =
  Prisma.validator<Prisma.EquipamentoCatalogoInclude>()({
    danos: {
      orderBy: { ordem: 'asc' },
    },
    reducesDano: true,
    protecaoAmaldicoada: true,
  });

type EquipamentoPreparacaoInventario = Prisma.EquipamentoCatalogoGetPayload<{
  include: typeof equipamentoPreparacaoInventarioInclude;
}>;

export type ItemSubstituicaoInventarioBase = {
  equipamentoId: number;
  quantidade: number;
  equipado?: boolean;
  modificacoesIds?: number[];
  nomeCustomizado?: string | null;
  notas?: string | null;
  estado?: unknown;
};

export type ItemInventarioBasePreparado = {
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;
  modificacoesIds: number[];
  nomeCustomizado: string | null;
  notas: string | null;
  estado: Prisma.JsonObject;
  categoriaCalculada: CategoriaEquipamento;
  espacosCalculados: number;
};

export type OpcoesPreparacaoInventarioBase = {
  espacosInventarioBase: number;
  espacosInventarioExtraBase: number;
  reduzirItensLeves: boolean;
  reduzirCategoriaEm: number;
  reduzirCategoriaExcetoTipos: string[];
};

const personagemInventarioSelect =
  Prisma.validator<Prisma.PersonagemBaseSelect>()({
    agilidade: true,
    forca: true,
    intelecto: true,
    presenca: true,
    vigor: true,
    prestigioBase: true,
    espacosInventarioBase: true,
    defesaBase: true,
    defesaEquipamento: true,
    defesaOutros: true,
    esquiva: true,
    bloqueio: true,
    pericias: {
      select: {
        grauTreinamento: true,
        bonusExtra: true,
        pericia: { select: { codigo: true } },
      },
    },
    habilidadesBase: {
      select: {
        habilidade: {
          select: {
            mecanicasEspeciais: true,
          },
        },
      },
    },
    poderesGenericos: {
      select: {
        habilidade: {
          select: {
            mecanicasEspeciais: true,
          },
        },
      },
    },
  });

type PersonagemInventarioPayload = Prisma.PersonagemBaseGetPayload<{
  select: typeof personagemInventarioSelect;
}>;

function normalizarCategoriaGrau(valor: unknown): string {
  if (valor === null || valor === undefined) return '0';
  if (typeof valor === 'number') return String(valor);
  if (typeof valor !== 'string') {
    if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
      const registro = valor as Record<string, unknown>;
      const candidato =
        typeof registro.codigo === 'string'
          ? registro.codigo
          : typeof registro.categoria === 'string'
            ? registro.categoria
            : typeof registro.value === 'string'
              ? registro.value
              : typeof registro.value === 'number'
                ? String(registro.value)
                : null;

      if (candidato) {
        return normalizarCategoriaGrau(candidato);
      }
    }

    return '0';
  }

  const texto = valor;

  if (texto === 'ESPECIAL' || texto === 'CATEGORIA_ESPECIAL') {
    return 'ESPECIAL';
  }

  const match = texto.match(/CATEGORIA_(\d+|ESPECIAL)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  if (/^\d+$/.test(texto)) {
    return texto;
  }

  return '0';
}

@Injectable()
export class InventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: InventarioEngine,
    private readonly mapper: InventarioMapper,
  ) {}

  private async validarEstadoItemPersonalizado(
    db: PrismaLike,
    equipamento: { codigo: string; periciaBonificada?: string | null },
    estado: unknown,
    modificacoes: Array<{ codigo: string | null | undefined }> = [],
  ): Promise<unknown> {
    return validarENormalizarEstadoItemPersonalizado(db, equipamento, estado, {
      modificacoes,
      periciaBaseBonificada: equipamento.periciaBonificada,
    });
  }

  private contarModificacoesEfetivas(params: {
    modificacoes: Array<{ codigo: string | null | undefined }>;
    estado?: unknown;
  }): number {
    return calcularQuantidadeModificacoesEfetivas(params);
  }

  private extrairCodigosPericiaDosEstados(
    itens: ItemSubstituicaoInventarioBase[],
  ): string[] {
    const codigos = new Set<string>();

    for (const item of itens) {
      if (!this.isRecord(item.estado)) continue;

      const periciaCodigo = item.estado.periciaCodigo;
      if (typeof periciaCodigo === 'string' && periciaCodigo.trim()) {
        codigos.add(periciaCodigo.trim().toUpperCase());
      }

      const funcoesAdicionais = item.estado.funcoesAdicionaisPericias;
      if (!Array.isArray(funcoesAdicionais)) continue;

      for (const codigo of funcoesAdicionais) {
        if (typeof codigo === 'string' && codigo.trim()) {
          codigos.add(codigo.trim().toUpperCase());
        }
      }
    }

    return Array.from(codigos);
  }

  private montarItemParaEngine(
    item: ItemInventarioBasePreparado,
    equipamento: EquipamentoPreparacaoInventario,
    modificacoes: ModificacaoPreviewEntity[],
    reduzirItensLeves: boolean,
  ): ItemInventarioComDados {
    return {
      id: 0,
      equipamentoId: item.equipamentoId,
      quantidade: item.quantidade,
      equipado: item.equipado,
      nomeCustomizado: item.nomeCustomizado,
      notas: item.notas,
      estado: item.estado,
      categoriaCalculada: item.categoriaCalculada,
      reduzirItensLeves,
      equipamento,
      modificacoes: modificacoes.map((modificacao) => ({
        modificacao,
      })),
    };
  }

  async prepararSubstituicaoInventarioBase(
    itens: ItemSubstituicaoInventarioBase[],
    opcoes: OpcoesPreparacaoInventarioBase,
  ): Promise<ItemInventarioBasePreparado[]> {
    if (itens.length === 0) return [];

    const equipamentosIds = [
      ...new Set(itens.map((item) => item.equipamentoId)),
    ];
    const modificacoesIds = [
      ...new Set(itens.flatMap((item) => item.modificacoesIds ?? [])),
    ];
    const codigosPericia = this.extrairCodigosPericiaDosEstados(itens);

    const equipamentosPromise = this.prisma.equipamentoCatalogo.findMany({
      where: { id: { in: equipamentosIds } },
      include: equipamentoPreparacaoInventarioInclude,
    });
    const modificacoesPromise: Promise<ModificacaoPreviewEntity[]> =
      modificacoesIds.length > 0
        ? this.prisma.modificacaoEquipamento.findMany({
            where: { id: { in: modificacoesIds } },
            select: modificacaoPreviewSelect,
          })
        : Promise.resolve([]);
    const compatibilidadesPromise: Promise<
      Array<{ equipamentoId: number; modificacaoId: number }>
    > =
      modificacoesIds.length > 0
        ? this.prisma.equipamentoModificacaoAplicavel.findMany({
            where: {
              equipamentoId: { in: equipamentosIds },
              modificacaoId: { in: modificacoesIds },
            },
            select: {
              equipamentoId: true,
              modificacaoId: true,
            },
          })
        : Promise.resolve([]);
    const periciasPromise: Promise<Array<{ codigo: string }>> =
      codigosPericia.length > 0
        ? this.prisma.pericia.findMany({
            where: { codigo: { in: codigosPericia } },
            select: { codigo: true },
          })
        : Promise.resolve([]);
    const [equipamentos, modificacoes, compatibilidades, pericias] =
      await Promise.all([
        equipamentosPromise,
        modificacoesPromise,
        compatibilidadesPromise,
        periciasPromise,
      ]);

    const equipamentosMap = new Map(
      equipamentos.map((equipamento) => [equipamento.id, equipamento]),
    );
    const modificacoesMap = new Map(
      modificacoes.map((modificacao) => [modificacao.id, modificacao] as const),
    );
    const compatibilidadesSet = new Set(
      compatibilidades.map(
        ({ equipamentoId, modificacaoId }) =>
          `${equipamentoId}:${modificacaoId}`,
      ),
    );
    const periciasSet = new Set(pericias.map((pericia) => pericia.codigo));
    const periciaLookup = {
      pericia: {
        findUnique: (args: {
          where: { codigo: string };
          select: { codigo: true };
        }) =>
          Promise.resolve(
            periciasSet.has(args.where.codigo)
              ? { codigo: args.where.codigo }
              : null,
          ),
      },
    };

    const itensComDados = await Promise.all(
      itens.map(async (item) => {
        const equipamento = equipamentosMap.get(item.equipamentoId);
        if (!equipamento) {
          throw new InventarioEquipamentoNaoEncontradoException(
            item.equipamentoId,
          );
        }

        const idsItem = item.modificacoesIds ?? [];
        const idsUnicosItem = new Set(idsItem);
        if (idsUnicosItem.size !== idsItem.length) {
          const duplicado = idsItem.find(
            (id, index) => idsItem.indexOf(id) !== index,
          );
          throw new InventarioModificacaoInvalidaException(
            duplicado === undefined ? [] : [duplicado],
          );
        }

        const modificacoesItem = idsItem.map((id) => {
          const modificacao = modificacoesMap.get(id);
          if (!modificacao) {
            throw new InventarioModificacaoInvalidaException([id]);
          }
          if (!compatibilidadesSet.has(`${item.equipamentoId}:${id}`)) {
            throw new InventarioModificacaoIncompativelException(
              id,
              item.equipamentoId,
            );
          }
          return modificacao;
        });

        const estadoNormalizado =
          await validarENormalizarEstadoItemPersonalizado(
            periciaLookup,
            equipamento,
            item.estado,
            {
              modificacoes: modificacoesItem,
              periciaBaseBonificada: equipamento.periciaBonificada,
            },
          );
        const categoriaCalculada = calcularCategoriaInventario(
          equipamento.categoria,
          this.contarModificacoesEfetivas({
            modificacoes: modificacoesItem,
            estado: estadoNormalizado,
          }),
        );
        const espacosCalculados = calcularEspacoUnitarioInventario({
          espacosBase: equipamento.espacos,
          reduzirItensLeves: opcoes.reduzirItensLeves,
          incrementosModificacoes: modificacoesItem.map(
            (modificacao) => modificacao.incrementoEspacos ?? 0,
          ),
        });
        const preparado: ItemInventarioBasePreparado = {
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado ?? false,
          modificacoesIds: idsItem,
          nomeCustomizado: item.nomeCustomizado ?? null,
          notas: item.notas ?? null,
          estado: estadoNormalizado as Prisma.JsonObject,
          categoriaCalculada,
          espacosCalculados,
        };

        return {
          preparado,
          equipamento,
          modificacoes: modificacoesItem,
        };
      }),
    );

    const itensComCategoriaReduzida = this.aplicarReducaoCategoriaEmItensRaw(
      itensComDados.map(({ preparado, equipamento, modificacoes }) => ({
        preparado,
        equipamento,
        modificacoes,
        categoriaCalculada: preparado.categoriaCalculada,
        espacosCalculados: preparado.espacosCalculados,
        quantidade: preparado.quantidade,
      })),
      opcoes.reduzirCategoriaEm,
      opcoes.reduzirCategoriaExcetoTipos,
    );
    const itensEngine = itensComCategoriaReduzida.map((item) => {
      const preparado = {
        ...item.preparado,
        categoriaCalculada: normalizarCategoriaInventario(
          item.categoriaCalculada,
        ),
      };
      return this.montarItemParaEngine(
        preparado,
        item.equipamento,
        item.modificacoes,
        opcoes.reduzirItensLeves,
      );
    });

    const validacaoVestir = this.engine.validarSistemaVestir(itensEngine);
    if (!validacaoVestir.valido) {
      throw new InventarioLimiteVestirExcedidoException({
        erros: validacaoVestir.erros,
        totalVestiveis: validacaoVestir.totalVestiveis,
        totalVestimentas: validacaoVestir.totalVestimentas,
        limiteVestiveis: validacaoVestir.limiteVestiveis,
        limiteVestimentas: validacaoVestir.limiteVestimentas,
      });
    }

    const espacosOcupados = this.engine.calcularEspacosOcupados(itensEngine);
    const espacosExtraItens =
      this.engine.calcularEspacosExtraDeItens(itensEngine);
    const capacidadeNormal =
      opcoes.espacosInventarioBase +
      opcoes.espacosInventarioExtraBase +
      espacosExtraItens;
    const limiteMaximo = capacidadeNormal * 2;
    if (espacosOcupados > limiteMaximo) {
      throw new InventarioCapacidadeExcedidaException({
        espacosOcupados: 0,
        espacosAdicionais: espacosOcupados,
        espacosAposAdicao: espacosOcupados,
        capacidadeNormal,
        limiteMaximo,
        excedente: espacosOcupados - limiteMaximo,
      });
    }

    return itensEngine.map((item, index) => ({
      ...itensComCategoriaReduzida[index].preparado,
      categoriaCalculada: normalizarCategoriaInventario(
        item.categoriaCalculada,
      ),
    }));
  }

  async substituirInventarioBasePreparado(
    personagemBaseId: number,
    itens: ItemInventarioBasePreparado[],
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    await prisma.personagemBase.update({
      where: { id: personagemBaseId },
      data: {
        inventarioItens: {
          deleteMany: {},
          ...(itens.length > 0
            ? {
                create: itens.map((item) => ({
                  equipamento: { connect: { id: item.equipamentoId } },
                  quantidade: item.quantidade,
                  equipado: item.equipado,
                  categoriaCalculada: item.categoriaCalculada,
                  espacosCalculados: item.espacosCalculados,
                  nomeCustomizado: item.nomeCustomizado,
                  notas: item.notas,
                  estado: item.estado,
                  ...(item.modificacoesIds.length > 0
                    ? {
                        modificacoes: {
                          create: item.modificacoesIds.map((modificacaoId) => ({
                            modificacao: { connect: { id: modificacaoId } },
                          })),
                        },
                      }
                    : {}),
                })),
              }
            : {}),
        },
      },
    });

    await this.atualizarEstadoInventario(personagemBaseId, prisma);
  }

  // ==================== HELPERS PRIVADOS ====================

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private aplicarReducaoCategoriaEmItensRaw<
    T extends {
      categoriaCalculada: string;
      espacosCalculados?: number;
      quantidade?: number;
      equipamento: {
        tipo: string;
        categoria: string;
        tipoArma?: string | null;
      };
    },
  >(itens: T[], reduzirCategoriaEm: number, excetoTipos: string[]): T[] {
    return aplicarReducaoCategoriaDeterministica(
      itens,
      reduzirCategoriaEm,
      excetoTipos,
    );
  }

  private async obterFlagsInventario(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<ModificadoresInventario> {
    const db = prisma || this.prisma;

    const [habilidades, poderes] = await Promise.all([
      db.habilidadePersonagemBase.findMany({
        where: { personagemBaseId },
        select: { habilidade: { select: { mecanicasEspeciais: true } } },
      }),
      db.poderGenericoPersonagemBase.findMany({
        where: { personagemBaseId },
        select: { habilidade: { select: { mecanicasEspeciais: true } } },
      }),
    ]);

    return resolverModificadoresInventario([
      ...habilidades.map((h) => h.habilidade.mecanicasEspeciais),
      ...poderes.map((p) => p.habilidade.mecanicasEspeciais),
    ]);
  }

  private ajustarEspacosBaseItem(
    espacosBase: number,
    reduzirItensLeves?: boolean,
  ): number {
    return calcularEspacoUnitarioInventario({
      espacosBase,
      reduzirItensLeves,
    });
  }

  /**
   * Valida se o usuário é dono do personagem
   */
  private async validarPropriedade(
    personagemBaseId: number,
    donoId: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma || this.prisma;

    const personagem = await db.personagemBase.findFirst({
      where: { id: personagemBaseId, donoId },
    });

    if (!personagem) {
      throw new InventarioSemPermissaoException(personagemBaseId, donoId);
    }
  }

  /**
   * Busca limites de Grau Xamã para o personagem
   */
  private async buscarLimitesGrauXama(
    prestigioBase: number,
    prisma?: PrismaLike,
  ): Promise<Record<string, number>> {
    const db = prisma || this.prisma;

    const limiteGrau = await db.grauFeiticeiroLimite.findFirst({
      where: {
        prestigioMin: {
          lte: prestigioBase,
        },
      },
      orderBy: {
        prestigioMin: 'desc',
      },
    });

    return (limiteGrau?.limitesPorCategoria as Record<string, number>) || {};
  }

  /**
   * Carrega itens do inventário com todos os relacionamentos
   */
  private async carregarItensInventario(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<ItemInventarioComDados[]> {
    const db = prisma || this.prisma;

    const itens = await db.inventarioItemBase.findMany({
      where: { personagemBaseId },
      include: inventarioItemComDadosInclude,
      orderBy: { id: 'asc' },
    });

    const {
      reduzirItensLeves,
      reduzirCategoriaEm,
      reduzirCategoriaExcetoTipos,
    } = await this.obterFlagsInventario(personagemBaseId, db);

    const itensComFlags = itens.map((item) => ({
      ...item,
      categoriaCalculada: calcularCategoriaInventario(
        item.equipamento.categoria,
        this.contarModificacoesEfetivas({
          modificacoes: item.modificacoes.map(
            (modificacao) => modificacao.modificacao,
          ),
          estado: item.estado,
        }),
      ),
      espacosCalculados: calcularEspacoUnitarioInventario({
        espacosBase: item.equipamento.espacos,
        reduzirItensLeves,
        incrementosModificacoes: item.modificacoes.map(
          (modificacao) => modificacao.modificacao.incrementoEspacos ?? 0,
        ),
      }),
      reduzirItensLeves,
    }));

    return this.aplicarReducaoCategoriaEmItensRaw(
      itensComFlags,
      reduzirCategoriaEm,
      reduzirCategoriaExcetoTipos,
    );
  }

  private async buscarItemInventarioCalculado(
    personagemBaseId: number,
    itemId: number,
    prisma?: PrismaLike,
  ): Promise<ItemInventarioComDados> {
    const itens = await this.carregarItensInventario(personagemBaseId, prisma);
    const item = itens.find((candidato) => candidato.id === itemId);
    if (!item) throw new InventarioItemNaoEncontradoException(itemId);
    return item;
  }

  /**
   * Calcula espaços totais do personagem (força + extras)
   */
  private async calcularEspacosPersonagem(
    personagemBaseId: number,
    prisma?: PrismaLike,
    itensCarregados?: ItemInventarioComDados[],
  ): Promise<{
    espacosBase: number;
    espacosExtra: number;
    prestigioBase: number;
    capacidade: CapacidadeInventarioCalculada;
  }> {
    const db = prisma || this.prisma;

    const personagem = await db.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        forca: true,
        intelecto: true,
        prestigioBase: true,
        habilidadesBase: {
          select: {
            habilidade: { select: { mecanicasEspeciais: true } },
          },
        },
        poderesGenericos: {
          select: {
            habilidade: { select: { mecanicasEspeciais: true } },
          },
        },
      },
    });

    if (!personagem) {
      throw new InventarioPersonagemNaoEncontradoException(personagemBaseId);
    }

    const itens =
      itensCarregados ??
      (await this.carregarItensInventario(personagemBaseId, db));
    const modificadores = resolverModificadoresInventario([
      ...personagem.habilidadesBase.map(
        (habilidade) => habilidade.habilidade.mecanicasEspeciais,
      ),
      ...personagem.poderesGenericos.map(
        (poder) => poder.habilidade.mecanicasEspeciais,
      ),
    ]);
    const capacidade = calcularCapacidadeInventario({
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      modificadores,
      espacosExtraItens: this.engine.calcularEspacosExtraDeItens(itens),
      espacosOcupados: this.engine.calcularEspacosOcupados(itens),
    });

    return {
      espacosBase: capacidade.base,
      espacosExtra: capacidade.extra,
      prestigioBase: personagem.prestigioBase,
      capacidade,
    };
  }

  /**
   * ✅ CORRIGIDO: Atualiza estado do inventário do personagem
   * - Recalcula espacosOcupados
   * - Recalcula espacosInventarioExtra (mochilas, etc)
   * - Atualiza flag sobrecarregado
   * - Recalcula defesaEquipamento e resistencias de itens equipados
   * - ❌ NÃO calcula bloqueio/esquiva (responsabilidade do PersonagemBase)
   *
   * Deve ser chamado após qualquer CRUD de itens
   */
  async recalcularEstadoInventarioBase(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    await this.atualizarEstadoInventario(personagemBaseId, prisma);
  }

  private async atualizarCacheItensInventario(
    itens: ItemInventarioComDados[],
    prisma: PrismaLike,
  ): Promise<void> {
    if (itens.length === 0) return;

    const categorias = itens.map(
      (item) =>
        Prisma.sql`WHEN ${item.id} THEN ${normalizarCategoriaInventario(
          item.categoriaCalculada,
        )}`,
    );
    const espacos = itens.map(
      (item) =>
        Prisma.sql`WHEN ${item.id} THEN ${this.engine.calcularEspacoUnitario(
          item,
        )}`,
    );
    const ids = itens.map((item) => item.id);

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE InventarioItemBase
        SET
          categoriaCalculada = CASE id ${Prisma.join(categorias, ' ')} END,
          espacosCalculados = CASE id ${Prisma.join(espacos, ' ')} END
        WHERE id IN (${Prisma.join(ids)})
      `,
    );
  }

  private async atualizarEstadoInventario(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma || this.prisma;

    const itens = await this.carregarItensInventario(personagemBaseId, db);
    const personagem = (await db.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: personagemInventarioSelect,
    })) as PersonagemInventarioPayload | null;

    if (!personagem) return;

    const modificadores = resolverModificadoresInventario([
      ...personagem.habilidadesBase.map(
        (habilidade) => habilidade.habilidade.mecanicasEspeciais,
      ),
      ...personagem.poderesGenericos.map(
        (poder) => poder.habilidade.mecanicasEspeciais,
      ),
    ]);

    // 1. Calcular espacosExtra de itens (Mochila Militar, etc)
    const espacosExtraDeItens = this.engine.calcularEspacosExtraDeItens(itens);

    // 2. Calcular espaços ocupados
    const espacosOcupados = this.engine.calcularEspacosOcupados(itens);

    // 3. Calcular capacidade pela mesma fonte usada em previews e detalhes
    const capacidade = calcularCapacidadeInventario({
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      modificadores,
      espacosExtraItens: espacosExtraDeItens,
      espacosOcupados,
    });

    // ✅ 5. Calcular stats dos equipamentos (defesa + RDs com modificações)
    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    // ✅ 6. Converter RDs para formato Map<código, valor>
    const resistenciasEquipamentos = new Map<string, number>();
    statsEquipados.reducoesDano.forEach((rd) => {
      resistenciasEquipamentos.set(rd.tipoReducao, rd.valor);
    });
    const resistenciasHabilidades = extrairResistenciasDeHabilidades(
      [...personagem.habilidadesBase, ...personagem.poderesGenericos],
      {
        agilidade: personagem.agilidade,
        forca: personagem.forca,
        intelecto: personagem.intelecto,
        presenca: personagem.presenca,
        vigor: personagem.vigor,
      },
    );
    const resistenciasMap = somarMapasResistencias(
      resistenciasHabilidades,
      resistenciasEquipamentos,
    );

    // ✅ 7. Recalcular bloqueio/esquiva com pericias + defesa total atualizada
    const defesaBase = personagem.defesaBase ?? 10;
    const defesaEquipamentoAntes = personagem.defesaEquipamento ?? 0;
    const defesaOutros = personagem.defesaOutros ?? 0;
    const esquivaAntes = personagem.esquiva ?? 0;
    const bloqueioAntes = personagem.bloqueio ?? 0;
    const defesaEquipamentoNovo = statsEquipados.defesaTotal;
    const defesaTotalNova = defesaBase + defesaEquipamentoNovo + defesaOutros;

    const periciasMap = new Map<
      string,
      { grauTreinamento: number; bonusExtra: number }
    >();
    personagem.pericias.forEach((pericia) => {
      periciasMap.set(pericia.pericia.codigo, {
        grauTreinamento: pericia.grauTreinamento,
        bonusExtra: pericia.bonusExtra,
      });
    });

    const { bloqueio: bloqueioBaseNovo, esquiva: esquivaBaseNova } =
      calcularBloqueioEsquiva({
        defesa: defesaTotalNova,
        periciasMap,
      });

    // ✅ 8. Atualizar PersonagemBase (agora inclui esquiva/bloqueio)
    await db.personagemBase.update({
      where: { id: personagemBaseId },
      data: {
        espacosInventarioBase: capacidade.base,
        espacosInventarioExtra: capacidade.extra,
        espacosOcupados,
        sobrecarregado: capacidade.sobrecarregado,
        defesaEquipamento: defesaEquipamentoNovo, // ✅ Apenas defesa dos equipamentos
        esquiva: esquivaBaseNova,
        bloqueio: bloqueioBaseNovo,
      },
    });

    await this.atualizarCacheItensInventario(itens, db);

    // ✅ 8.5. Sincronizar personagens da campanha preservando modificadores
    const deltaDefesaEquipamento =
      defesaEquipamentoNovo - defesaEquipamentoAntes;
    const deltaEsquiva = esquivaBaseNova - esquivaAntes;
    const deltaBloqueio = bloqueioBaseNovo - bloqueioAntes;

    if (
      deltaDefesaEquipamento !== 0 ||
      deltaEsquiva !== 0 ||
      deltaBloqueio !== 0
    ) {
      await db.personagemCampanha.updateMany({
        where: { personagemBaseId },
        data: {
          ...(deltaDefesaEquipamento !== 0
            ? {
                defesaEquipamento: {
                  increment: deltaDefesaEquipamento,
                },
              }
            : {}),
          ...(deltaEsquiva !== 0
            ? { esquiva: { increment: deltaEsquiva } }
            : {}),
          ...(deltaBloqueio !== 0
            ? { bloqueio: { increment: deltaBloqueio } }
            : {}),
        },
      });

      if (deltaDefesaEquipamento < 0) {
        await db.personagemCampanha.updateMany({
          where: {
            personagemBaseId,
            defesaEquipamento: { lt: 0 },
          },
          data: {
            defesaEquipamento: 0,
          },
        });
      }
    }

    // ✅ 8. Rebuild resistências (deleteMany + createMany)
    await db.personagemBaseResistencia.deleteMany({
      where: { personagemBaseId },
    });

    if (resistenciasMap.size > 0) {
      const resistenciasParaCriar = await this.prepararResistenciasParaCriacao(
        resistenciasMap,
        db,
      );

      if (resistenciasParaCriar.length > 0) {
        await db.personagemBaseResistencia.createMany({
          data: resistenciasParaCriar.map((r) => ({
            personagemBaseId,
            resistenciaTipoId: r.resistenciaTipoId,
            valor: r.valor,
          })),
        });
      }
    }

    // ✅ 9. NÃO calculamos bloqueio/esquiva aqui
    // Isso será responsabilidade do PersonagemBaseService
  }

  /**
   * ✅ Prepara resistências para criação no banco
   * Converte Map<código, valor> → Array com resistenciaTipoId
   */
  private async prepararResistenciasParaCriacao(
    resistencias: Map<string, number>,
    prisma?: PrismaLike,
  ): Promise<
    Array<{
      resistenciaTipoId: number;
      valor: number;
    }>
  > {
    const db = prisma || this.prisma;

    if (!resistencias || resistencias.size === 0) {
      return [];
    }

    // Filtrar apenas resistências com valor > 0
    const resistenciasValidas = Array.from(resistencias.entries()).filter(
      ([, valor]) => valor > 0,
    );

    if (resistenciasValidas.length === 0) {
      return [];
    }

    // Buscar IDs das resistências no banco
    const codigos = resistenciasValidas.map(([codigo]) => codigo);
    const resistenciasTipo = await db.resistenciaTipo.findMany({
      where: { codigo: { in: codigos } },
      select: { id: true, codigo: true },
    });

    const codigoToId = new Map(resistenciasTipo.map((r) => [r.codigo, r.id]));

    // Retornar formato correto para createMany
    return resistenciasValidas
      .filter(([codigo]) => codigoToId.has(codigo))
      .map(([codigo, valor]) => ({
        resistenciaTipoId: codigoToId.get(codigo)!,
        valor,
      }));
  }

  /**
   * ✅ Valida se pode equipar item (sistema de vestir)
   * - Máximo 5 itens vestidos
   * - Máximo 2 vestimentas
   */
  private async validarSistemaVestir(
    personagemBaseId: number,
    novoItemVestivel: {
      tipo: TipoEquipamento;
      tipoAcessorio?: string | null;
      quantidade: number;
    },
    itemIdIgnorar?: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma || this.prisma;

    const itens = await this.carregarItensInventario(personagemBaseId, db);

    // Filtrar itens equipados (ignorando o item atual se for atualização)
    const itensEquipados = itens.filter(
      (item) => item.equipado && item.id !== itemIdIgnorar,
    );

    // Simular adição do novo item
    const itensSimulados = [...itensEquipados];

    // Adicionar novo item à simulação
    const itemSimulado: ItemInventarioComDados = {
      id: -1,
      equipamentoId: -1,
      equipado: true,
      quantidade: novoItemVestivel.quantidade,
      nomeCustomizado: null,
      notas: null,
      categoriaCalculada: null,
      equipamento: {
        id: -1,
        codigo: 'SIMULADO',
        nome: 'Item Simulado',
        tipo: novoItemVestivel.tipo,
        categoria: 'CATEGORIA_0',
        espacos: 0,
        complexidadeMaldicao: ComplexidadeMaldicao.NENHUMA,
        tipoAcessorio: novoItemVestivel.tipoAcessorio,
        danos: [],
        reducesDano: [],
      },
      modificacoes: [],
    };
    itensSimulados.push(itemSimulado);

    // Validar via engine
    const validacao = this.engine.validarSistemaVestir(itensSimulados);

    if (!validacao.valido) {
      throw new InventarioLimiteVestirExcedidoException({
        erros: validacao.erros,
        totalVestiveis: validacao.totalVestiveis,
        totalVestimentas: validacao.totalVestimentas,
        limiteVestiveis: validacao.limiteVestiveis,
        limiteVestimentas: validacao.limiteVestimentas,
      });
    }
  }

  /**
   * ✅ Valida se pode adicionar item (limite 2x capacidade)
   */
  private async validarLimite2xCapacidade(
    personagemBaseId: number,
    espacosAdicionais: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma || this.prisma;

    const itens = await this.carregarItensInventario(personagemBaseId, db);
    const { espacosBase, espacosExtra } = await this.calcularEspacosPersonagem(
      personagemBaseId,
      db,
      itens,
    );

    const espacosOcupados = this.engine.calcularEspacosOcupados(itens);
    const capacidadeTotal = espacosBase + espacosExtra;
    const limiteMaximo = capacidadeTotal * 2;
    const espacosAposAdicao = espacosOcupados + espacosAdicionais;

    if (espacosAposAdicao > limiteMaximo) {
      throw new InventarioCapacidadeExcedidaException({
        espacosOcupados,
        espacosAdicionais,
        espacosAposAdicao,
        capacidadeNormal: capacidadeTotal,
        limiteMaximo,
        excedente: espacosAposAdicao - limiteMaximo,
      });
    }
  }

  // ==================== CONSULTAS ====================

  /**
   * Busca inventário COMPLETO com validações de Grau Xamã
   */
  async buscarInventario(
    donoId: number,
    personagemBaseId: number,
  ): Promise<ResumoInventarioCompleto> {
    await this.validarPropriedade(personagemBaseId, donoId);

    const itens = await this.carregarItensInventario(personagemBaseId);
    const { espacosBase, espacosExtra, prestigioBase, capacidade } =
      await this.calcularEspacosPersonagem(personagemBaseId, undefined, itens);
    const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);

    const resultadoEspacos = this.engine.calcularResultadoEspacos(
      itens,
      espacosBase,
      espacosExtra,
    );

    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    // Resumo por categoria
    const itensPorCategoria = itens.reduce<Record<string, number>>(
      (acc, item) => {
        const cat = item.categoriaCalculada || item.equipamento.categoria;
        acc[cat] = (acc[cat] || 0) + item.quantidade;
        return acc;
      },
      {},
    );

    const resumoPorCategoria = Object.entries(limitesGrauXama).map(
      ([cat, limite]) => ({
        categoria: cat,
        quantidadeItens: itensPorCategoria[cat] || 0,
        quantidadeTotal: itensPorCategoria[cat] || 0,
        limiteGrauXama: limite,
        podeAdicionarMais: (itensPorCategoria[cat] || 0) < limite,
      }),
    );

    return {
      espacos: resultadoEspacos,
      capacidade,
      grauXama: {
        grauAtual: this.engine.calcularGrauXama(prestigioBase).grau,
        prestigioMinimoRequisito: Math.max(
          ...Object.values(limitesGrauXama).map(Number),
        ),
      },
      resumoPorCategoria,
      podeAdicionarCategoria0: true,
      statsEquipados,
    };
  }

  /**
   * Preview completo com validação GRAU XAMÃ + ESPAÇO
   */
  async previewAdicionarItem(
    donoId: number,
    dto: PreviewItemDto,
  ): Promise<PreviewAdicionarItemResponse> {
    await this.validarPropriedade(dto.personagemBaseId, donoId);

    const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
      where: { id: dto.equipamentoId },
      include: {
        danos: true,
        reducesDano: true,
      },
    });

    if (!equipamento) {
      throw new InventarioEquipamentoNaoEncontradoException(dto.equipamentoId);
    }

    const itensAtuais = await this.carregarItensInventario(
      dto.personagemBaseId,
    );
    const { espacosBase, espacosExtra, prestigioBase } =
      await this.calcularEspacosPersonagem(
        dto.personagemBaseId,
        undefined,
        itensAtuais,
      );
    const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);

    const previewCompleto = this.engine.previewAdicionarItem(
      itensAtuais,
      {
        equipamento,
        quantidade: dto.quantidade || 1,
      },
      {
        espacosInventarioBase: espacosBase,
        espacosInventarioExtra: espacosExtra,
        prestigioBase,
      },
      limitesGrauXama,
    );

    return previewCompleto;
  }

  /**
   * ✅ Preview de itens de inventário (sem persistir)
   */
  async previewItensInventario(
    dto: PreviewItensInventarioDto,
    opcoes?: {
      donoId?: number;
      modificadores?: ModificadoresInventario;
    },
  ): Promise<any> {
    try {
      const { itens } = dto;
      let forca = dto.forca ?? 0;
      let intelecto = dto.intelecto ?? 0;
      let prestigioBase = dto.prestigioBase ?? 0;
      let modificadores =
        opcoes?.modificadores ??
        ({
          somarIntelecto: dto.somarIntelecto === true,
          espacosExtraHabilidades: 0,
          reduzirItensLeves: dto.reduzirItensLeves === true,
          reduzirCategoriaEm: dto.reduzirCategoriaEm ?? 0,
          reduzirCategoriaExcetoTipos: dto.reduzirCategoriaExcetoTipos ?? [],
          creditoCategoriaBonus: 0,
        } satisfies ModificadoresInventario);

      if (dto.personagemBaseId !== undefined) {
        const personagem = await this.prisma.personagemBase.findFirst({
          where: {
            id: dto.personagemBaseId,
            donoId: opcoes?.donoId,
          },
          select: {
            forca: true,
            intelecto: true,
            prestigioBase: true,
            habilidadesBase: {
              select: {
                habilidade: { select: { mecanicasEspeciais: true } },
              },
            },
            poderesGenericos: {
              select: {
                habilidade: { select: { mecanicasEspeciais: true } },
              },
            },
          },
        });

        if (!personagem || opcoes?.donoId === undefined) {
          throw new InventarioSemPermissaoException(
            dto.personagemBaseId,
            opcoes?.donoId ?? 0,
          );
        }

        forca = personagem.forca;
        intelecto = personagem.intelecto;
        prestigioBase = personagem.prestigioBase;
        modificadores = resolverModificadoresInventario([
          ...personagem.habilidadesBase.map(
            (habilidade) => habilidade.habilidade.mecanicasEspeciais,
          ),
          ...personagem.poderesGenericos.map(
            (poder) => poder.habilidade.mecanicasEspeciais,
          ),
        ]);
      }

      const reduzirItensLeves = modificadores.reduzirItensLeves;
      const reduzirCategoriaEm = modificadores.reduzirCategoriaEm;
      const reduzirCategoriaExcetoTipos =
        modificadores.reduzirCategoriaExcetoTipos;

      const equipamentosIds = [...new Set(itens.map((i) => i.equipamentoId))];
      const equipamentos = await this.prisma.equipamentoCatalogo.findMany({
        where: { id: { in: equipamentosIds } },
        include: {
          reducesDano: true,
          protecaoAmaldicoada: true,
        },
      });

      const modificacoesIds = [
        ...new Set(itens.flatMap((i) => i.modificacoes || [])),
      ];

      const modificacoes =
        modificacoesIds.length > 0
          ? await this.prisma.modificacaoEquipamento.findMany({
              where: { id: { in: modificacoesIds } },
              select: modificacaoPreviewSelect,
            })
          : [];

      const equipamentosMap = new Map(equipamentos.map((e) => [e.id, e]));
      const modificacoesMap = new Map(modificacoes.map((m) => [m.id, m]));

      const itensCalculados = itens.map((item, indiceEntrada) => {
        const equipamento = equipamentosMap.get(item.equipamentoId);
        if (!equipamento) {
          throw new InventarioEquipamentoNaoEncontradoException(
            item.equipamentoId,
          );
        }

        const modsDoItem = (item.modificacoes || [])
          .map((id) => modificacoesMap.get(id))
          .filter((mod): mod is NonNullable<typeof mod> => mod !== undefined);

        const categoriaCalculada = calcularCategoriaInventario(
          equipamento.categoria,
          this.contarModificacoesEfetivas({
            modificacoes: modsDoItem,
            estado: item.estado,
          }),
        );

        const espacosCalculados = calcularEspacoUnitarioInventario({
          espacosBase: equipamento.espacos,
          reduzirItensLeves,
          incrementosModificacoes: modsDoItem.map(
            (modificacao) => modificacao.incrementoEspacos ?? 0,
          ),
        });

        return {
          indiceEntrada,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          categoriaCalculada: String(categoriaCalculada),
          espacosCalculados,
          espacosPorUnidade: espacosCalculados,
          espacosTotal: espacosCalculados * item.quantidade,
          nomeCustomizado: item.nomeCustomizado,
          modificacoes: modsDoItem.map((m) => ({
            id: m.id,
            codigo: m.codigo,
            nome: m.nome,
            descricao: m.descricao,
            tipo: m.tipo,
            incrementoEspacos: m.incrementoEspacos || 0,
            efeitosMecanicos: m.efeitosMecanicos ?? null,
          })),
          equipamento: {
            id: equipamento.id,
            nome: equipamento.nome,
            codigo: equipamento.codigo,
            tipo: equipamento.tipo,
            categoria: equipamento.categoria,
            espacos: equipamento.espacos,
            complexidadeMaldicao: equipamento.complexidadeMaldicao,
            tipoArma: equipamento.tipoArma ?? null,
            bonusDefesa: equipamento.bonusDefesa ?? 0,
            penalidadeCarga: equipamento.penalidadeCarga ?? 0,
            tipoAcessorio: equipamento.tipoAcessorio ?? null,
            descricao: equipamento.descricao ?? null,
            efeito: equipamento.efeito,
            reducesDano: equipamento.reducesDano ?? [],
            protecaoAmaldicoada: equipamento.protecaoAmaldicoada
              ? {
                  bonusDefesa: equipamento.protecaoAmaldicoada.bonusDefesa,
                  penalidadeCarga:
                    equipamento.protecaoAmaldicoada.penalidadeCarga,
                }
              : null,
          },
        };
      });

      const itensCalculadosAjustados = this.aplicarReducaoCategoriaEmItensRaw(
        itensCalculados,
        reduzirCategoriaEm,
        reduzirCategoriaExcetoTipos,
      );

      const itensParaCalculoEspacosExtras: ItemInventarioComDados[] =
        itensCalculadosAjustados.map((item) => ({
          id: 0,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          nomeCustomizado: item.nomeCustomizado ?? null,
          notas: null,
          categoriaCalculada: item.categoriaCalculada,
          reduzirItensLeves,
          equipamento: {
            id: item.equipamento.id,
            codigo: item.equipamento.codigo,
            nome: item.equipamento.nome,
            tipo: item.equipamento.tipo,
            categoria: item.equipamento.categoria,
            espacos: item.equipamento.espacos,
            complexidadeMaldicao: item.equipamento.complexidadeMaldicao,
            efeito: item.equipamento.efeito ?? null,
            tipoArma: item.equipamento.tipoArma ?? null,
          },
          modificacoes: [],
        }));

      const espacosExtra = this.engine.calcularEspacosExtraDeItens(
        itensParaCalculoEspacosExtras,
      );

      const espacosOcupados = itensCalculadosAjustados.reduce((total, item) => {
        return total + item.espacosCalculados * item.quantidade;
      }, 0);

      const capacidade = calcularCapacidadeInventario({
        forca,
        intelecto,
        modificadores,
        espacosExtraItens: espacosExtra,
        espacosOcupados,
      });

      const grauXamaInfo = this.engine.calcularGrauXama(prestigioBase);
      const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);

      const itensPorCategoria: Record<string, number> = {
        '0': 0,
        '4': 0,
        '3': 0,
        '2': 0,
        '1': 0,
        ESPECIAL: 0,
      };

      itensCalculadosAjustados.forEach((item) => {
        const cat = normalizarCategoriaGrau(item.categoriaCalculada);
        itensPorCategoria[cat] =
          (itensPorCategoria[cat] || 0) + item.quantidade;
      });

      const itensParaStats: ItemInventarioComDados[] =
        itensCalculadosAjustados.map((item) => ({
          id: 0,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          nomeCustomizado: item.nomeCustomizado ?? null,
          notas: null,
          categoriaCalculada: item.categoriaCalculada,
          reduzirItensLeves,
          equipamento: {
            id: item.equipamento.id,
            codigo: item.equipamento.codigo,
            nome: item.equipamento.nome,
            tipo: item.equipamento.tipo,
            categoria: item.equipamento.categoria,
            espacos: item.equipamento.espacos,
            complexidadeMaldicao: item.equipamento.complexidadeMaldicao,
            efeito: item.equipamento.efeito ?? null,
            tipoArma: item.equipamento.tipoArma ?? null,
            bonusDefesa: item.equipamento.bonusDefesa ?? 0,
            penalidadeCarga: item.equipamento.penalidadeCarga ?? 0,
            reducesDano: item.equipamento.reducesDano ?? [],
            protecaoAmaldicoada: item.equipamento.protecaoAmaldicoada ?? null,
          },
          modificacoes: item.modificacoes.map((mod) => ({
            modificacao: {
              id: mod.id,
              codigo: mod.codigo,
              nome: mod.nome,
              descricao: mod.descricao ?? null,
              incrementoEspacos: mod.incrementoEspacos ?? 0,
              efeitosMecanicos: mod.efeitosMecanicos ?? null,
            },
          })),
        }));

      const statsEquipados = this.engine.calcularStatsEquipados(itensParaStats);

      return {
        itens: itensCalculadosAjustados,
        espacosBase: capacidade.base,
        espacosExtra: capacidade.extra,
        espacosTotal: capacidade.total,
        espacosOcupados,
        sobrecarregado: capacidade.sobrecarregado,
        capacidade,
        grauXama: {
          grau: grauXamaInfo.grau,
          limitesPorCategoria: limitesGrauXama,
        },
        itensPorCategoria,
        statsEquipados,
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==================== CRUD DE ITENS ====================

  /**
   * ✅ Adiciona item com validação completa GRAU XAMÃ + ESPAÇO + 2X LIMITE + VESTIR
   */
  async adicionarItem(
    donoId: number,
    dto: AdicionarItemDto,
    options?: {
      tx?: Prisma.TransactionClient;
      skipOwnershipCheck?: boolean;
    },
  ) {
    try {
      const db = options?.tx || this.prisma;

      // ✅ VALIDAR OWNERSHIP apenas se não for durante criação
      if (!options?.skipOwnershipCheck) {
        await this.validarPropriedade(dto.personagemBaseId, donoId, db);

        // ✅ Preview para validar GRAU XAMÃ + ESPAÇO (apenas quando não é criação)
        const preview = await this.previewAdicionarItem(donoId, {
          personagemBaseId: dto.personagemBaseId,
          equipamentoId: dto.equipamentoId,
          quantidade: dto.quantidade,
          modificacoes: dto.modificacoes,
        });

        // Validar GRAU XAMÃ
        if (!preview.grauXama.valido && !dto.ignorarLimitesGrauXama) {
          throw new InventarioGrauXamaExcedidoException(
            preview.grauXama.grauAtual,
            preview.grauXama.erros,
          );
        }
      }

      // 2. Validar equipamento existe
      const equipamento = await db.equipamentoCatalogo.findUnique({
        where: { id: dto.equipamentoId },
        include: {
          danos: true,
          reducesDano: true,
        },
      });

      if (!equipamento) {
        throw new InventarioEquipamentoNaoEncontradoException(
          dto.equipamentoId,
        );
      }
      // 3. Validar modificações (se houver)
      let modificacoesValidas: ModificacaoCalculoEntity[] = [];
      if (dto.modificacoes && dto.modificacoes.length > 0) {
        modificacoesValidas = await db.modificacaoEquipamento.findMany({
          where: { id: { in: dto.modificacoes } },
          select: modificacaoCalculoSelect,
        });

        if (modificacoesValidas.length !== dto.modificacoes.length) {
          const idsEncontrados = modificacoesValidas.map((m) => m.id);
          const idsInvalidos = dto.modificacoes.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new InventarioModificacaoInvalidaException(idsInvalidos);
        }

        for (const modId of dto.modificacoes) {
          const compativel = await db.equipamentoModificacaoAplicavel.findFirst(
            {
              where: {
                equipamentoId: dto.equipamentoId,
                modificacaoId: modId,
              },
            },
          );

          if (!compativel) {
            throw new InventarioModificacaoIncompativelException(
              modId,
              dto.equipamentoId,
            );
          }
        }
      }
      const estadoNormalizado = await this.validarEstadoItemPersonalizado(
        db,
        equipamento,
        dto.estado,
        modificacoesValidas,
      );

      // 4. Calcular categoria final baseado nas modificações
      const totalModificacoesEfetivas = this.contarModificacoesEfetivas({
        modificacoes: modificacoesValidas,
        estado: estadoNormalizado,
      });
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        equipamento.categoria,
        totalModificacoesEfetivas,
      );

      // 5. Calcular espaços que o item vai ocupar
      const { reduzirItensLeves } = await this.obterFlagsInventario(
        dto.personagemBaseId,
        db,
      );
      const espacosBaseItem = this.ajustarEspacosBaseItem(
        equipamento.espacos,
        reduzirItensLeves,
      );
      const incrementoMods = modificacoesValidas.reduce(
        (total, m) => total + (m.incrementoEspacos || 0),
        0,
      );
      const espacosUnitario = Math.max(0, espacosBaseItem + incrementoMods);
      const espacosTotaisItem = espacosUnitario * (dto.quantidade || 1);

      // 6. ✅ Validar limite 2x capacidade
      await this.validarLimite2xCapacidade(
        dto.personagemBaseId,
        espacosTotaisItem,
        db,
      );

      // 7. ✅ Validar sistema de vestir (se o item for equipado)
      if (dto.equipado) {
        await this.validarSistemaVestir(
          dto.personagemBaseId,
          {
            tipo: equipamento.tipo,
            tipoAcessorio: equipamento.tipoAcessorio,
            quantidade: dto.quantidade || 1,
          },
          undefined,
          db,
        );
      }

      // 8. Criar item com categoria calculada
      const item = await db.inventarioItemBase.create({
        data: {
          personagemBaseId: dto.personagemBaseId,
          equipamentoId: dto.equipamentoId,
          quantidade: dto.quantidade || 1,
          equipado: dto.equipado ?? false,
          categoriaCalculada,
          espacosCalculados: espacosUnitario,
          nomeCustomizado: dto.nomeCustomizado,
          notas: dto.notas,
          estado:
            estadoNormalizado !== undefined
              ? (estadoNormalizado as Prisma.InputJsonValue)
              : undefined,
        },
        include: inventarioItemComDadosInclude,
      });

      // 9. Criar relacionamentos de modificações (se houver)
      if (modificacoesValidas.length > 0) {
        await db.inventarioItemBaseModificacao.createMany({
          data: modificacoesValidas.map((mod) => ({
            itemId: item.id,
            modificacaoId: mod.id,
          })),
        });
      }

      // 10. Atualizar estado do inventário (sobrecarregado, espacosExtra, defesa, RDs)
      await this.atualizarEstadoInventario(dto.personagemBaseId, db);

      const itemCalculado = await this.buscarItemInventarioCalculado(
        dto.personagemBaseId,
        item.id,
        db,
      );
      return this.mapper.mapItem(itemCalculado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * ✅ Atualiza item do inventário (mantém validações de espaço + vestir)
   */
  async atualizarItem(donoId: number, itemId: number, dto: AtualizarItemDto) {
    try {
      const itemExiste = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: {
          personagemBase: true,
          equipamento: true,
          modificacoes: {
            include: { modificacao: true },
          },
        },
      });

      if (!itemExiste) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      await this.validarPropriedade(itemExiste.personagemBaseId, donoId);

      // Se está mudando quantidade, validar espaços e limite 2x
      if (
        dto.quantidade !== undefined &&
        dto.quantidade !== itemExiste.quantidade
      ) {
        const { reduzirItensLeves } = await this.obterFlagsInventario(
          itemExiste.personagemBaseId,
        );
        const itensAtuais = await this.carregarItensInventario(
          itemExiste.personagemBaseId,
        );
        const { espacosBase, espacosExtra } =
          await this.calcularEspacosPersonagem(
            itemExiste.personagemBaseId,
            undefined,
            itensAtuais,
          );

        // Remover espaços do item atual
        const espacosSemEsteItem = itensAtuais
          .filter((i) => i.id !== itemId)
          .reduce((total, i) => total + this.engine.calcularEspacosItem(i), 0);

        const espacosDisponiveis =
          espacosBase + espacosExtra - espacosSemEsteItem;

        // Calcular espaços do item com nova quantidade
        const espacosBaseItem = this.ajustarEspacosBaseItem(
          itemExiste.equipamento.espacos,
          reduzirItensLeves,
        );
        const incrementoMods = itemExiste.modificacoes.reduce(
          (total, m) => total + (m.modificacao.incrementoEspacos || 0),
          0,
        );
        const espacosNovaQuantidade =
          Math.max(0, espacosBaseItem + incrementoMods) * dto.quantidade;

        // Validar limite 2x
        const capacidadeTotal = espacosBase + espacosExtra;
        const limiteMaximo = capacidadeTotal * 2;
        const espacosTotaisApos = espacosSemEsteItem + espacosNovaQuantidade;

        if (espacosTotaisApos > limiteMaximo) {
          throw new InventarioCapacidadeExcedidaException({
            espacosOcupados: espacosSemEsteItem,
            espacosAdicionais: espacosNovaQuantidade,
            espacosAposAdicao: espacosTotaisApos,
            capacidadeNormal: capacidadeTotal,
            limiteMaximo,
            excedente: espacosTotaisApos - limiteMaximo,
          });
        }

        if (espacosNovaQuantidade > espacosDisponiveis) {
          throw new InventarioEspacosInsuficientesException(
            espacosNovaQuantidade,
            espacosDisponiveis,
          );
        }
      }

      // ✅ Validar sistema de vestir se está equipando o item
      if (dto.equipado === true && !itemExiste.equipado) {
        await this.validarSistemaVestir(
          itemExiste.personagemBaseId,
          {
            tipo: itemExiste.equipamento.tipo,
            tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
            quantidade: dto.quantidade ?? itemExiste.quantidade,
          },
          itemId,
        );
      }

      // ✅ Se está mudando quantidade de item já equipado, validar novamente
      if (
        itemExiste.equipado &&
        dto.quantidade !== undefined &&
        dto.quantidade !== itemExiste.quantidade
      ) {
        await this.validarSistemaVestir(
          itemExiste.personagemBaseId,
          {
            tipo: itemExiste.equipamento.tipo,
            tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
            quantidade: dto.quantidade,
          },
          itemId,
        );
      }

      const estadoNormalizado = await this.validarEstadoItemPersonalizado(
        this.prisma,
        itemExiste.equipamento,
        dto.estado ?? itemExiste.estado,
        itemExiste.modificacoes.map((mod) => mod.modificacao),
      );
      const deveAtualizarEstado =
        dto.estado !== undefined ||
        equipamentoUsaPericiaPersonalizada(itemExiste.equipamento) ||
        itemExiste.modificacoes.some(
          (mod) => mod.modificacao.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
        );
      const totalModificacoesEfetivas = this.contarModificacoesEfetivas({
        modificacoes: itemExiste.modificacoes.map((mod) => mod.modificacao),
        estado: estadoNormalizado,
      });
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        itemExiste.equipamento.categoria,
        totalModificacoesEfetivas,
      );

      // Atualizar
      await this.prisma.inventarioItemBase.update({
        where: { id: itemId },
        data: {
          quantidade: dto.quantidade,
          equipado: dto.equipado,
          nomeCustomizado: dto.nomeCustomizado,
          notas: dto.notas,
          categoriaCalculada,
          estado: deveAtualizarEstado
            ? (estadoNormalizado as Prisma.InputJsonValue)
            : undefined,
        },
        include: inventarioItemComDadosInclude,
      });

      // ✅ Atualizar estado do inventário (recalcula defesa e RDs)
      await this.atualizarEstadoInventario(itemExiste.personagemBaseId);

      const itemCalculado = await this.buscarItemInventarioCalculado(
        itemExiste.personagemBaseId,
        itemId,
      );
      return this.mapper.mapItem(itemCalculado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Remove item do inventário
   */
  async removerItem(donoId: number, itemId: number) {
    try {
      const item = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: { personagemBase: true },
      });

      if (!item) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      await this.validarPropriedade(item.personagemBaseId, donoId);

      // Remover modificações primeiro
      await this.prisma.inventarioItemBaseModificacao.deleteMany({
        where: { itemId: itemId },
      });

      // Remover item
      await this.prisma.inventarioItemBase.delete({
        where: { id: itemId },
      });

      // Atualizar estado
      await this.atualizarEstadoInventario(item.personagemBaseId);

      return { sucesso: true, mensagem: 'Item removido com sucesso' };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  // ==================== MODIFICAÇÕES ====================

  /**
   * Aplica modificação em um item
   */
  async aplicarModificacao(
    donoId: number,
    itemId: number,
    dto: AplicarModificacaoDto,
  ) {
    try {
      const item = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: {
          personagemBase: true,
          equipamento: {
            include: {
              danos: true,
              reducesDano: true,
            },
          },
          modificacoes: {
            include: { modificacao: true },
          },
        },
      });

      if (!item) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      await this.validarPropriedade(item.personagemBaseId, donoId);

      // Validar modificação existe
      const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
        where: { id: dto.modificacaoId },
      });

      if (!modificacao) {
        throw new InventarioModificacaoNaoEncontradaException(
          dto.modificacaoId,
        );
      }

      // Validar compatibilidade
      const compativel =
        await this.prisma.equipamentoModificacaoAplicavel.findFirst({
          where: {
            equipamentoId: item.equipamentoId,
            modificacaoId: dto.modificacaoId,
          },
        });

      if (!compativel) {
        throw new InventarioModificacaoIncompativelException(
          dto.modificacaoId,
          item.equipamentoId,
        );
      }

      // Validar se já tem
      const jaTemModificacao = item.modificacoes.some(
        (m) => m.modificacao.id === dto.modificacaoId,
      );

      if (jaTemModificacao) {
        throw new InventarioModificacaoDuplicadaException(
          dto.modificacaoId,
          itemId,
        );
      }

      // Aplicar modificação
      await this.prisma.inventarioItemBaseModificacao.create({
        data: {
          itemId: itemId,
          modificacaoId: dto.modificacaoId,
        },
      });

      // Recalcular categoria
      const novaQuantidadeModificacoes = this.contarModificacoesEfetivas({
        modificacoes: [
          ...item.modificacoes.map((m) => m.modificacao),
          modificacao,
        ],
        estado: item.estado,
      });
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      // Recalcular espaços
      const { reduzirItensLeves } = await this.obterFlagsInventario(
        item.personagemBaseId,
      );
      const espacosBaseItem = this.ajustarEspacosBaseItem(
        item.equipamento.espacos,
        reduzirItensLeves,
      );
      const incrementoModsNovo =
        item.modificacoes.reduce(
          (total, m) => total + (m.modificacao.incrementoEspacos || 0),
          0,
        ) + (modificacao.incrementoEspacos || 0);

      const espacosCalculadosNovo = Math.max(
        0,
        espacosBaseItem + incrementoModsNovo,
      );

      // Atualizar item
      await this.prisma.inventarioItemBase.update({
        where: { id: itemId },
        data: {
          categoriaCalculada,
          espacosCalculados: espacosCalculadosNovo,
        },
      });

      // Atualizar estado do inventário
      await this.atualizarEstadoInventario(item.personagemBaseId);

      const itemCalculado = await this.buscarItemInventarioCalculado(
        item.personagemBaseId,
        itemId,
      );
      return this.mapper.mapItem(itemCalculado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  /**
   * Remove modificação de um item
   */
  async removerModificacao(
    donoId: number,
    itemId: number,
    dto: RemoverModificacaoDto,
  ) {
    try {
      const item = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: {
          personagemBase: true,
          equipamento: {
            include: {
              danos: true,
              reducesDano: true,
            },
          },
          modificacoes: {
            include: { modificacao: true },
          },
        },
      });

      if (!item) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      await this.validarPropriedade(item.personagemBaseId, donoId);

      const temModificacao = item.modificacoes.some(
        (m) => m.modificacao.id === dto.modificacaoId,
      );

      if (!temModificacao) {
        throw new InventarioModificacaoNaoAplicadaException(
          dto.modificacaoId,
          itemId,
        );
      }

      const modificacaoRemovida = item.modificacoes.find(
        (m) => m.modificacao.id === dto.modificacaoId,
      )?.modificacao;
      const limparEstadoFuncaoAdicional =
        modificacaoRemovida?.codigo === CODIGO_MOD_FUNCAO_ADICIONAL;
      const estadoAtualizado =
        limparEstadoFuncaoAdicional &&
        item.estado &&
        typeof item.estado === 'object' &&
        !Array.isArray(item.estado)
          ? ({
              ...(item.estado as Record<string, unknown>),
              funcoesAdicionaisPericias: [],
            } as Prisma.InputJsonValue)
          : undefined;

      await this.prisma.inventarioItemBaseModificacao.delete({
        where: {
          itemId_modificacaoId: {
            itemId,
            modificacaoId: dto.modificacaoId,
          },
        },
      });

      const novaQuantidadeModificacoes = this.contarModificacoesEfetivas({
        modificacoes: item.modificacoes
          .filter((m) => m.modificacao.id !== dto.modificacaoId)
          .map((m) => m.modificacao),
        estado: limparEstadoFuncaoAdicional ? estadoAtualizado : item.estado,
      });
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      const { reduzirItensLeves } = await this.obterFlagsInventario(
        item.personagemBaseId,
      );
      const espacosBaseItem = this.ajustarEspacosBaseItem(
        item.equipamento.espacos,
        reduzirItensLeves,
      );
      const incrementoModsNovo = item.modificacoes
        .filter((m) => m.modificacao.id !== dto.modificacaoId)
        .reduce(
          (total, m) => total + (m.modificacao.incrementoEspacos || 0),
          0,
        );

      const espacosCalculadosNovo = Math.max(
        0,
        espacosBaseItem + incrementoModsNovo,
      );

      await this.prisma.inventarioItemBase.update({
        where: { id: itemId },
        data: {
          categoriaCalculada,
          espacosCalculados: espacosCalculadosNovo,
          ...(limparEstadoFuncaoAdicional ? { estado: estadoAtualizado } : {}),
        },
      });

      await this.atualizarEstadoInventario(item.personagemBaseId);

      const itemCalculado = await this.buscarItemInventarioCalculado(
        item.personagemBaseId,
        itemId,
      );
      return this.mapper.mapItem(itemCalculado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
