import { Injectable } from '@nestjs/common';
import { Prisma, TipoEquipamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import { InventarioEngine } from '../inventario/engine/inventario.engine';
import { InventarioMapper } from '../inventario/inventario.mapper';
import {
  InventarioItemNaoEncontradoException,
  InventarioEquipamentoNaoEncontradoException,
  InventarioLimiteVestirExcedidoException,
  InventarioCapacidadeExcedidaException,
  InventarioEspacosInsuficientesException,
  InventarioModificacaoNaoEncontradaException,
  InventarioModificacaoIncompativelException,
  InventarioModificacaoDuplicadaException,
  InventarioModificacaoNaoAplicadaException,
  InventarioModificacaoInvalidaException,
} from 'src/common/exceptions/inventario.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';
import { calcularBloqueioEsquiva } from '../personagem-base/regras-criacao/regras-derivados';
import type { ItemInventarioComDados } from '../inventario/engine/inventario.types';
import type {
  AdicionarItemInventarioCampanhaDto,
  AtualizarItemInventarioCampanhaDto,
  AplicarModificacaoInventarioCampanhaDto,
} from './dto/inventario-campanha.dto';
import {
  equipamentoUsaPericiaPersonalizada,
  validarENormalizarEstadoItemPersonalizado,
} from '../inventario/utils/item-personalizado';

type PrismaLike = PrismaService | Prisma.TransactionClient;

const inventarioItemCampanhaComDadosInclude =
  Prisma.validator<Prisma.InventarioItemCampanhaInclude>()({
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

const modificacaoCalculoSelect =
  Prisma.validator<Prisma.ModificacaoEquipamentoSelect>()({
    id: true,
    incrementoEspacos: true,
  });

const itemSessaoInventarioInclude =
  Prisma.validator<Prisma.ItemSessaoCampanhaInclude>()({
    personagemCampanha: {
      select: {
        id: true,
        nome: true,
        donoId: true,
      },
    },
  });

type ModificacaoCalculoEntity = Prisma.ModificacaoEquipamentoGetPayload<{
  select: typeof modificacaoCalculoSelect;
}>;

type ItemSessaoInventarioEntity = Prisma.ItemSessaoCampanhaGetPayload<{
  include: typeof itemSessaoInventarioInclude;
}>;

@Injectable()
export class CampanhaInventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
    private readonly engine: InventarioEngine,
    private readonly mapper: InventarioMapper,
  ) {}

  private async validarEstadoItemPersonalizado(
    db: PrismaLike,
    equipamento: { codigo: string },
    estado: unknown,
  ): Promise<unknown> {
    return validarENormalizarEstadoItemPersonalizado(db, equipamento, estado);
  }

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

  private getBooleanField(
    value: Record<string, unknown> | null | undefined,
    key: string,
  ): boolean | null {
    if (!value) return null;
    const current = value[key];
    return typeof current === 'boolean' ? current : null;
  }

  private getInventarioFlag(
    mecanicas: Prisma.JsonValue | null,
    flag: 'reduzirItensLeves' | 'somarIntelecto',
  ): boolean {
    if (!this.isRecord(mecanicas)) return false;
    const inventario = mecanicas.inventario;
    if (!this.isRecord(inventario)) return false;
    return this.getBooleanField(inventario, flag) === true;
  }

  private async obterReducaoItensLeves(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<boolean> {
    const db = prisma ?? this.prisma;

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

    return (
      habilidades.some((h) =>
        this.getInventarioFlag(
          h.habilidade.mecanicasEspeciais,
          'reduzirItensLeves',
        ),
      ) ||
      poderes.some((p) =>
        this.getInventarioFlag(
          p.habilidade.mecanicasEspeciais,
          'reduzirItensLeves',
        ),
      )
    );
  }

  private ajustarEspacosBaseItem(
    espacosBase: number,
    reduzirItensLeves?: boolean,
  ): number {
    if (reduzirItensLeves && espacosBase > 0 && espacosBase <= 0.5) {
      return espacosBase / 2;
    }

    return espacosBase;
  }

  private async validarPermissao(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    return this.accessService.obterPersonagemCampanhaComPermissao(
      campanhaId,
      personagemCampanhaId,
      usuarioId,
      true,
    );
  }

  private async buscarLimitesGrauXama(
    prestigioBase: number,
    prisma?: PrismaLike,
  ): Promise<Record<string, number>> {
    const db = prisma ?? this.prisma;

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

  private async carregarItensInventarioCampanha(
    personagemCampanhaId: number,
    prisma?: PrismaLike,
  ): Promise<ItemInventarioComDados[]> {
    const db = prisma ?? this.prisma;

    const itens = await db.inventarioItemCampanha.findMany({
      where: { personagemCampanhaId },
      include: inventarioItemCampanhaComDadosInclude,
      orderBy: [{ equipado: 'desc' }, { equipamento: { nome: 'asc' } }],
    });

    const personagem = await db.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: { personagemBaseId: true },
    });

    const reduzirItensLeves = personagem?.personagemBaseId
      ? await this.obterReducaoItensLeves(personagem.personagemBaseId, db)
      : false;

    return itens.map((item) => ({
      ...item,
      reduzirItensLeves,
    }));
  }

  private async carregarItensSessaoInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    prisma?: PrismaLike,
  ): Promise<ItemSessaoInventarioEntity[]> {
    const db = prisma ?? this.prisma;

    return db.itemSessaoCampanha.findMany({
      where: {
        campanhaId,
        personagemCampanhaId,
      },
      include: itemSessaoInventarioInclude,
      orderBy: [{ atualizadoEm: 'desc' }, { nome: 'asc' }],
    });
  }

  private calcularEspacosOcupadosItensSessao(
    itensSessao: Array<{ peso: number }>,
  ): number {
    return itensSessao.reduce((total, item) => total + Number(item.peso || 0), 0);
  }

  private mapearItemSessaoInventario(item: ItemSessaoInventarioEntity) {
    const descricaoDisponivel = item.descricaoRevelada ? item.descricao : null;

    return {
      id: item.id,
      campanhaId: item.campanhaId,
      sessaoId: item.sessaoId,
      cenaId: item.cenaId,
      personagemCampanhaId: item.personagemCampanhaId,
      nome: item.nome,
      descricao: descricaoDisponivel,
      descricaoOculta: !item.descricaoRevelada && !!item.descricao,
      tipo: item.tipo,
      categoria: item.categoria,
      peso: Number(item.peso),
      descricaoRevelada: item.descricaoRevelada,
      portadorAtual: item.personagemCampanha
        ? {
            id: item.personagemCampanha.id,
            nome: item.personagemCampanha.nome,
            donoId: item.personagemCampanha.donoId,
          }
        : null,
    };
  }

  private async calcularEspacosPersonagemCampanha(
    personagemCampanhaId: number,
    prisma?: PrismaLike,
  ): Promise<{
    personagemBaseId: number;
    defesaBase: number;
    defesaEquipamento: number;
    defesaOutros: number;
    esquiva: number;
    bloqueio: number;
    espacosBase: number;
    espacosExtra: number;
    prestigioGeral: number;
  }> {
    const db = prisma ?? this.prisma;

    const personagem = await db.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: {
        personagemBaseId: true,
        defesaBase: true,
        defesaEquipamento: true,
        defesaOutros: true,
        esquiva: true,
        bloqueio: true,
        espacosInventarioBase: true,
        espacosInventarioExtra: true,
        prestigioGeral: true,
      },
    });

    if (!personagem) {
      return {
        personagemBaseId: 0,
        defesaBase: 10,
        defesaEquipamento: 0,
        defesaOutros: 0,
        esquiva: 0,
        bloqueio: 0,
        espacosBase: 0,
        espacosExtra: 0,
        prestigioGeral: 0,
      };
    }

    return {
      personagemBaseId: personagem.personagemBaseId,
      defesaBase: personagem.defesaBase ?? 10,
      defesaEquipamento: personagem.defesaEquipamento ?? 0,
      defesaOutros: personagem.defesaOutros ?? 0,
      esquiva: personagem.esquiva ?? 0,
      bloqueio: personagem.bloqueio ?? 0,
      espacosBase: personagem.espacosInventarioBase,
      espacosExtra: personagem.espacosInventarioExtra,
      prestigioGeral: personagem.prestigioGeral ?? 0,
    };
  }

  private async obterPericiasPersonagemBase(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<Map<string, { grauTreinamento: number; bonusExtra: number }>> {
    const db = prisma ?? this.prisma;
    const pericias = await db.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        pericias: {
          select: {
            grauTreinamento: true,
            bonusExtra: true,
            pericia: { select: { codigo: true } },
          },
        },
      },
    });

    const mapa = new Map<
      string,
      { grauTreinamento: number; bonusExtra: number }
    >();
    pericias?.pericias.forEach((pericia) => {
      mapa.set(pericia.pericia.codigo, {
        grauTreinamento: pericia.grauTreinamento,
        bonusExtra: pericia.bonusExtra,
      });
    });
    return mapa;
  }

  private async atualizarEstadoInventarioCampanha(
    personagemCampanhaId: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma ?? this.prisma;
    const personagemCampanha = await db.personagemCampanha.findUnique({
      where: { id: personagemCampanhaId },
      select: { campanhaId: true },
    });
    if (!personagemCampanha) return;

    const itens = await this.carregarItensInventarioCampanha(
      personagemCampanhaId,
      db,
    );
    const itensSessao = await this.carregarItensSessaoInventarioCampanha(
      personagemCampanha.campanhaId,
      personagemCampanhaId,
      db,
    );
    const personagem = await this.calcularEspacosPersonagemCampanha(
      personagemCampanhaId,
      db,
    );

    if (!personagem.personagemBaseId) return;

    const espacosExtraDeItens = this.engine.calcularEspacosExtraDeItens(itens);
    const espacosOcupados =
      this.engine.calcularEspacosOcupados(itens) +
      this.calcularEspacosOcupadosItensSessao(itensSessao);
    const espacosTotal = personagem.espacosBase + espacosExtraDeItens;
    const sobrecarregado = espacosOcupados > espacosTotal;

    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    const defesaEquipamentoNovo = statsEquipados.defesaTotal;
    const defesaTotalAntes =
      personagem.defesaBase +
      personagem.defesaEquipamento +
      personagem.defesaOutros;
    const defesaTotalNova =
      personagem.defesaBase + defesaEquipamentoNovo + personagem.defesaOutros;

    const periciasMap = await this.obterPericiasPersonagemBase(
      personagem.personagemBaseId,
      db,
    );

    const { bloqueio: bloqueioBaseAntes, esquiva: esquivaBaseAntes } =
      calcularBloqueioEsquiva({
        defesa: defesaTotalAntes,
        periciasMap,
      });
    const { bloqueio: bloqueioBaseNovo, esquiva: esquivaBaseNova } =
      calcularBloqueioEsquiva({
        defesa: defesaTotalNova,
        periciasMap,
      });

    const deltaEsquiva = esquivaBaseNova - esquivaBaseAntes;
    const deltaBloqueio = bloqueioBaseNovo - bloqueioBaseAntes;

    await db.personagemCampanha.update({
      where: { id: personagemCampanhaId },
      data: {
        espacosInventarioExtra: espacosExtraDeItens,
        espacosOcupados,
        sobrecarregado,
        defesaEquipamento: defesaEquipamentoNovo,
        esquiva: personagem.esquiva + deltaEsquiva,
        bloqueio: personagem.bloqueio + deltaBloqueio,
      },
    });
  }

  async recalcularEstadoInventarioCampanha(
    personagemCampanhaId: number,
  ): Promise<void> {
    await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);
  }

  private async validarSistemaVestir(
    personagemCampanhaId: number,
    novoItemVestivel: {
      tipo: TipoEquipamento;
      tipoAcessorio?: string | null;
      quantidade: number;
    },
    itemIdIgnorar?: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma ?? this.prisma;
    const itens = await this.carregarItensInventarioCampanha(
      personagemCampanhaId,
      db,
    );

    const itensEquipados = itens.filter(
      (item) => item.equipado && item.id !== itemIdIgnorar,
    );

    const itensSimulados = [...itensEquipados];
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
        complexidadeMaldicao: 'NENHUMA',
        tipoAcessorio: novoItemVestivel.tipoAcessorio,
        danos: [],
        reducesDano: [],
      },
      modificacoes: [],
    };
    itensSimulados.push(itemSimulado);

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

  private async validarLimite2xCapacidade(
    campanhaId: number,
    personagemCampanhaId: number,
    espacosAdicionais: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma ?? this.prisma;
    const itens = await this.carregarItensInventarioCampanha(
      personagemCampanhaId,
      db,
    );
    const { espacosBase, espacosExtra } =
      await this.calcularEspacosPersonagemCampanha(personagemCampanhaId, db);
    const itensSessao = await this.carregarItensSessaoInventarioCampanha(
      campanhaId,
      personagemCampanhaId,
      db,
    );

    const espacosOcupados =
      this.engine.calcularEspacosOcupados(itens) +
      this.calcularEspacosOcupadosItensSessao(itensSessao);
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

  async buscarInventarioCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    const itens =
      await this.carregarItensInventarioCampanha(personagemCampanhaId);
    const itensSessao = await this.carregarItensSessaoInventarioCampanha(
      campanhaId,
      personagemCampanhaId,
    );
    const { espacosBase, espacosExtra, prestigioGeral } =
      await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);
    const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioGeral);

    const resultadoEspacos = this.engine.calcularResultadoEspacos(
      itens,
      espacosBase,
      espacosExtra,
    );
    const espacosOcupadosItensSessao =
      this.calcularEspacosOcupadosItensSessao(itensSessao);
    const espacosOcupadosTotal =
      resultadoEspacos.espacosOcupados + espacosOcupadosItensSessao;
    const espacosResultado = {
      ...resultadoEspacos,
      espacosOcupados: espacosOcupadosTotal,
      espacosDisponiveis: resultadoEspacos.espacosTotal - espacosOcupadosTotal,
      sobrecarregado: espacosOcupadosTotal > resultadoEspacos.espacosTotal,
    };

    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    const itensPorCategoria = itens.reduce<Record<string, number>>(
      (acc, item) => {
        const cat = item.categoriaCalculada || item.equipamento.categoria;
        acc[cat] = (acc[cat] || 0) + item.quantidade;
        return acc;
      },
      {},
    );

    const validacaoGrau = this.engine.validarLimitesGrauXama(
      prestigioGeral,
      limitesGrauXama,
      itensPorCategoria,
    );

    return {
      personagemCampanhaId,
      espacos: espacosResultado,
      itens: itens.map((item) => this.mapper.mapItem(item)),
      itensSessao: itensSessao.map((item) => this.mapearItemSessaoInventario(item)),
      statsEquipados: this.mapper.mapStatsEquipados(statsEquipados),
      limitesCategoria: {
        grauAtual: validacaoGrau.grauAtual,
        limitesPorCategoria: validacaoGrau.limitesAtuais,
        itensPorCategoria: validacaoGrau.itensPorCategoriaAtual,
        excedentes: validacaoGrau.erros,
      },
    };
  }

  async adicionarItemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    dto: AdicionarItemInventarioCampanhaDto,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    try {
      const equipamento = await this.prisma.equipamentoCatalogo.findUnique({
        where: { id: dto.equipamentoId },
        include: { danos: true, reducesDano: true },
      });

      if (!equipamento) {
        throw new InventarioEquipamentoNaoEncontradoException(
          dto.equipamentoId,
        );
      }

      const estadoNormalizado = await this.validarEstadoItemPersonalizado(
        this.prisma,
        equipamento,
        dto.estado,
      );

      let modificacoesValidas: ModificacaoCalculoEntity[] = [];
      if (dto.modificacoes && dto.modificacoes.length > 0) {
        modificacoesValidas = await this.prisma.modificacaoEquipamento.findMany(
          {
            where: { id: { in: dto.modificacoes } },
            select: modificacaoCalculoSelect,
          },
        );

        if (modificacoesValidas.length !== dto.modificacoes.length) {
          const idsEncontrados = modificacoesValidas.map((m) => m.id);
          const idsInvalidos = dto.modificacoes.filter(
            (id) => !idsEncontrados.includes(id),
          );
          throw new InventarioModificacaoInvalidaException(idsInvalidos);
        }

        for (const modId of dto.modificacoes) {
          const compativel =
            await this.prisma.equipamentoModificacaoAplicavel.findFirst({
              where: {
                equipamentoId: dto.equipamentoId,
                modificacaoId: modId,
              },
            });

          if (!compativel) {
            throw new InventarioModificacaoIncompativelException(
              modId,
              dto.equipamentoId,
            );
          }
        }
      }

      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        equipamento.categoria,
        modificacoesValidas.length,
      );

      const { personagemBaseId } =
        await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);
      const reduzirItensLeves = personagemBaseId
        ? await this.obterReducaoItensLeves(personagemBaseId)
        : false;
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

      await this.validarLimite2xCapacidade(
        campanhaId,
        personagemCampanhaId,
        espacosTotaisItem,
      );

      if (dto.equipado) {
        await this.validarSistemaVestir(personagemCampanhaId, {
          tipo: equipamento.tipo,
          tipoAcessorio: equipamento.tipoAcessorio,
          quantidade: dto.quantidade || 1,
        });
      }

      const item = await this.prisma.inventarioItemCampanha.create({
        data: {
          personagemCampanhaId,
          equipamentoId: dto.equipamentoId,
          quantidade: dto.quantidade || 1,
          equipado: dto.equipado ?? false,
          categoriaCalculada,
          nomeCustomizado: dto.nomeCustomizado,
          notas: dto.notas,
          estado:
            estadoNormalizado !== undefined
              ? (estadoNormalizado as Prisma.InputJsonValue)
              : undefined,
        },
        include: inventarioItemCampanhaComDadosInclude,
      });

      if (modificacoesValidas.length > 0) {
        await this.prisma.inventarioItemCampanhaModificacao.createMany({
          data: modificacoesValidas.map((mod) => ({
            itemId: item.id,
            modificacaoId: mod.id,
          })),
        });
      }

      await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);

      const itemComMods = await this.prisma.inventarioItemCampanha.findUnique({
        where: { id: item.id },
        include: inventarioItemCampanhaComDadosInclude,
      });

      if (!itemComMods) {
        throw new InventarioItemNaoEncontradoException(item.id);
      }

      return this.mapper.mapItem(itemComMods);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizarItemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtualizarItemInventarioCampanhaDto,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    try {
      const itemExiste = await this.prisma.inventarioItemCampanha.findUnique({
        where: { id: itemId },
        include: {
          equipamento: true,
          modificacoes: { include: { modificacao: true } },
        },
      });

      if (
        !itemExiste ||
        itemExiste.personagemCampanhaId !== personagemCampanhaId
      ) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      if (
        dto.quantidade !== undefined &&
        dto.quantidade !== itemExiste.quantidade
      ) {
        const { personagemBaseId } =
          await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);
        const reduzirItensLeves = personagemBaseId
          ? await this.obterReducaoItensLeves(personagemBaseId)
          : false;
        const itensAtuais =
          await this.carregarItensInventarioCampanha(personagemCampanhaId);
        const itensSessao =
          await this.carregarItensSessaoInventarioCampanha(
            campanhaId,
            personagemCampanhaId,
          );
        const { espacosBase, espacosExtra } =
          await this.calcularEspacosPersonagemCampanha(personagemCampanhaId);

        const espacosSemEsteItem = itensAtuais
          .filter((i) => i.id !== itemId)
          .reduce((total, i) => total + this.engine.calcularEspacosItem(i), 0);
        const espacosItensSessao =
          this.calcularEspacosOcupadosItensSessao(itensSessao);

        const espacosDisponiveis =
          espacosBase + espacosExtra - espacosSemEsteItem - espacosItensSessao;

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

        const capacidadeTotal = espacosBase + espacosExtra;
        const limiteMaximo = capacidadeTotal * 2;
        const espacosTotaisApos =
          espacosSemEsteItem + espacosItensSessao + espacosNovaQuantidade;

        if (espacosTotaisApos > limiteMaximo) {
          throw new InventarioCapacidadeExcedidaException({
            espacosOcupados: espacosSemEsteItem + espacosItensSessao,
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

      if (dto.equipado === true && !itemExiste.equipado) {
        await this.validarSistemaVestir(
          personagemCampanhaId,
          {
            tipo: itemExiste.equipamento.tipo,
            tipoAcessorio: itemExiste.equipamento.tipoAcessorio,
            quantidade: dto.quantidade ?? itemExiste.quantidade,
          },
          itemId,
        );
      }

      if (
        itemExiste.equipado &&
        dto.quantidade !== undefined &&
        dto.quantidade !== itemExiste.quantidade
      ) {
        await this.validarSistemaVestir(
          personagemCampanhaId,
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
      );
      const deveAtualizarEstado =
        dto.estado !== undefined ||
        equipamentoUsaPericiaPersonalizada(itemExiste.equipamento);

      const itemAtualizado = await this.prisma.inventarioItemCampanha.update({
        where: { id: itemId },
        data: {
          quantidade: dto.quantidade,
          equipado: dto.equipado,
          nomeCustomizado: dto.nomeCustomizado,
          notas: dto.notas,
          estado: deveAtualizarEstado
            ? (estadoNormalizado as Prisma.InputJsonValue)
            : undefined,
        },
        include: inventarioItemCampanhaComDadosInclude,
      });

      await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);

      return this.mapper.mapItem(itemAtualizado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async removerItemCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    try {
      const item = await this.prisma.inventarioItemCampanha.findUnique({
        where: { id: itemId },
      });

      if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      await this.prisma.inventarioItemCampanhaModificacao.deleteMany({
        where: { itemId: itemId },
      });

      await this.prisma.inventarioItemCampanha.delete({
        where: { id: itemId },
      });

      await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);

      return { sucesso: true };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async aplicarModificacaoCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AplicarModificacaoInventarioCampanhaDto,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    try {
      const item = await this.prisma.inventarioItemCampanha.findUnique({
        where: { id: itemId },
        include: {
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

      if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      const modificacao = await this.prisma.modificacaoEquipamento.findUnique({
        where: { id: dto.modificacaoId },
      });

      if (!modificacao) {
        throw new InventarioModificacaoNaoEncontradaException(
          dto.modificacaoId,
        );
      }

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

      const jaTemModificacao = item.modificacoes.some(
        (m) => m.modificacao.id === dto.modificacaoId,
      );

      if (jaTemModificacao) {
        throw new InventarioModificacaoDuplicadaException(
          dto.modificacaoId,
          itemId,
        );
      }

      await this.prisma.inventarioItemCampanhaModificacao.create({
        data: {
          itemId,
          modificacaoId: dto.modificacaoId,
        },
      });

      const novaQuantidadeModificacoes = item.modificacoes.length + 1;
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      await this.prisma.inventarioItemCampanha.update({
        where: { id: itemId },
        data: { categoriaCalculada },
      });

      await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);

      const itemAtualizado =
        await this.prisma.inventarioItemCampanha.findUnique({
          where: { id: itemId },
          include: inventarioItemCampanhaComDadosInclude,
        });

      if (!itemAtualizado) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      return this.mapper.mapItem(itemAtualizado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async removerModificacaoCampanha(
    campanhaId: number,
    personagemCampanhaId: number,
    usuarioId: number,
    itemId: number,
    modificacaoId: number,
  ) {
    await this.validarPermissao(campanhaId, personagemCampanhaId, usuarioId);

    try {
      const item = await this.prisma.inventarioItemCampanha.findUnique({
        where: { id: itemId },
        include: {
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

      if (!item || item.personagemCampanhaId !== personagemCampanhaId) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      const temModificacao = item.modificacoes.some(
        (m) => m.modificacao.id === modificacaoId,
      );

      if (!temModificacao) {
        throw new InventarioModificacaoNaoAplicadaException(
          modificacaoId,
          itemId,
        );
      }

      await this.prisma.inventarioItemCampanhaModificacao.delete({
        where: {
          itemId_modificacaoId: {
            itemId,
            modificacaoId,
          },
        },
      });

      const novaQuantidadeModificacoes = item.modificacoes.length - 1;
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      await this.prisma.inventarioItemCampanha.update({
        where: { id: itemId },
        data: { categoriaCalculada },
      });

      await this.atualizarEstadoInventarioCampanha(personagemCampanhaId);

      const itemAtualizado =
        await this.prisma.inventarioItemCampanha.findUnique({
          where: { id: itemId },
          include: inventarioItemCampanhaComDadosInclude,
        });

      if (!itemAtualizado) {
        throw new InventarioItemNaoEncontradoException(itemId);
      }

      return this.mapper.mapItem(itemAtualizado);
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
