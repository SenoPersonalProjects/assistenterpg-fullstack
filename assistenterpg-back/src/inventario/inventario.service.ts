// src/inventario/inventario.service.ts - REFATORADO COM EXCEÇÕES CUSTOMIZADAS

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplexidadeMaldicao, Prisma, TipoEquipamento } from '@prisma/client';
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
    nome: true,
    incrementoEspacos: true,
  });

const modificacaoCalculoSelect =
  Prisma.validator<Prisma.ModificacaoEquipamentoSelect>()({
    id: true,
    incrementoEspacos: true,
  });

type ModificacaoCalculoEntity = Prisma.ModificacaoEquipamentoGetPayload<{
  select: typeof modificacaoCalculoSelect;
}>;

@Injectable()
export class InventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: InventarioEngine,
    private readonly mapper: InventarioMapper,
  ) {}

  // ==================== HELPERS PRIVADOS ====================

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
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
      orderBy: [{ equipado: 'desc' }, { equipamento: { nome: 'asc' } }],
    });

    return itens;
  }

  /**
   * Calcula espaços totais do personagem (força + extras)
   */
  private async calcularEspacosPersonagem(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<{
    espacosBase: number;
    espacosExtra: number;
    prestigioBase: number;
  }> {
    const db = prisma || this.prisma;

    const personagem = await db.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        forca: true,
        espacosInventarioBase: true,
        espacosInventarioExtra: true,
        prestigioBase: true,
      },
    });

    if (!personagem) {
      throw new InventarioPersonagemNaoEncontradoException(personagemBaseId);
    }

    return {
      espacosBase: personagem.espacosInventarioBase,
      espacosExtra: personagem.espacosInventarioExtra,
      prestigioBase: personagem.prestigioBase,
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
  private async atualizarEstadoInventario(
    personagemBaseId: number,
    prisma?: PrismaLike,
  ): Promise<void> {
    const db = prisma || this.prisma;

    const itens = await this.carregarItensInventario(personagemBaseId, db);
    const personagem = await db.personagemBase.findUnique({
      where: { id: personagemBaseId },
      select: {
        forca: true,
        espacosInventarioBase: true,
      },
    });

    if (!personagem) return;

    // 1. Calcular espacosExtra de itens (Mochila Militar, etc)
    const espacosExtraDeItens = this.engine.calcularEspacosExtraDeItens(itens);

    // 2. Calcular espaços ocupados
    const espacosOcupados = this.engine.calcularEspacosOcupados(itens);

    // 3. Calcular capacidade total
    const espacosTotal = personagem.espacosInventarioBase + espacosExtraDeItens;

    // 4. Flag sobrecarregado (acima da capacidade)
    const sobrecarregado = espacosOcupados > espacosTotal;

    // ✅ 5. Calcular stats dos equipamentos (defesa + RDs com modificações)
    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    // ✅ 6. Converter RDs para formato Map<codigo, valor>
    const resistenciasMap = new Map<string, number>();
    statsEquipados.reducoesDano.forEach((rd) => {
      resistenciasMap.set(rd.tipoReducao, rd.valor);
    });

    // ✅ 7. Atualizar PersonagemBase (SEM bloqueio/esquiva)
    await db.personagemBase.update({
      where: { id: personagemBaseId },
      data: {
        espacosInventarioExtra: espacosExtraDeItens,
        espacosOcupados,
        sobrecarregado,
        defesaEquipamento: statsEquipados.defesaTotal, // ✅ Apenas defesa dos equipamentos
      },
    });

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
   * Converte Map<codigo, valor> → Array com resistenciaTipoId
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
    const { espacosBase, espacosExtra, prestigioBase } =
      await this.calcularEspacosPersonagem(personagemBaseId);
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
      await this.calcularEspacosPersonagem(dto.personagemBaseId);
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
  async previewItensInventario(dto: PreviewItensInventarioDto): Promise<any> {
    try {
      const { forca, prestigioBase, itens } = dto;

      const equipamentosIds = [...new Set(itens.map((i) => i.equipamentoId))];
      const equipamentos = await this.prisma.equipamentoCatalogo.findMany({
        where: { id: { in: equipamentosIds } },
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

      const itensCalculados = itens.map((item) => {
        const equipamento = equipamentosMap.get(item.equipamentoId);
        if (!equipamento) {
          throw new InventarioEquipamentoNaoEncontradoException(
            item.equipamentoId,
          );
        }

        const modsDoItem = (item.modificacoes || [])
          .map((id) => modificacoesMap.get(id))
          .filter((mod): mod is NonNullable<typeof mod> => mod !== undefined);

        const categoriaCalculada = this.engine.calcularCategoriaFinal(
          equipamento.categoria,
          modsDoItem.length,
        );

        const espacosBaseItem = equipamento.espacos;
        const incrementoMods = modsDoItem.reduce(
          (total, m) => total + (m.incrementoEspacos || 0),
          0,
        );
        const espacosCalculados = Math.max(0, espacosBaseItem + incrementoMods);

        return {
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          categoriaCalculada: String(categoriaCalculada),
          espacosCalculados,
          nomeCustomizado: item.nomeCustomizado,
          modificacoes: modsDoItem.map((m) => ({
            id: m.id,
            nome: m.nome,
            incrementoEspacos: m.incrementoEspacos || 0,
          })),
          equipamento: {
            id: equipamento.id,
            nome: equipamento.nome,
            codigo: equipamento.codigo,
            tipo: equipamento.tipo,
            categoria: equipamento.categoria,
            espacos: equipamento.espacos,
            complexidadeMaldicao: equipamento.complexidadeMaldicao,
            efeito: equipamento.efeito,
          },
        };
      });

      const espacosBase = forca * 5;
      const itensParaCalculoEspacosExtras: ItemInventarioComDados[] =
        itensCalculados.map((item) => ({
          id: 0,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          nomeCustomizado: item.nomeCustomizado ?? null,
          notas: null,
          categoriaCalculada: item.categoriaCalculada,
          equipamento: {
            id: item.equipamento.id,
            codigo: item.equipamento.codigo,
            nome: item.equipamento.nome,
            tipo: item.equipamento.tipo,
            categoria: item.equipamento.categoria,
            espacos: item.equipamento.espacos,
            complexidadeMaldicao: item.equipamento.complexidadeMaldicao,
            efeito: item.equipamento.efeito ?? null,
          },
          modificacoes: [],
        }));

      const espacosExtra = this.engine.calcularEspacosExtraDeItens(
        itensParaCalculoEspacosExtras,
      );
      const espacosTotal = espacosBase + espacosExtra;

      const espacosOcupados = itensCalculados.reduce((total, item) => {
        return total + item.espacosCalculados * item.quantidade;
      }, 0);

      const sobrecarregado = espacosOcupados > espacosTotal;

      const grauXamaInfo = this.engine.calcularGrauXama(prestigioBase);
      const limitesGrauXama = await this.buscarLimitesGrauXama(prestigioBase);

      const itensPorCategoria: Record<string, number> = {
        CATEGORIA_0: 0,
        CATEGORIA_4: 0,
        CATEGORIA_3: 0,
        CATEGORIA_2: 0,
        CATEGORIA_1: 0,
        ESPECIAL: 0,
      };

      itensCalculados.forEach((item) => {
        const cat = item.categoriaCalculada;
        itensPorCategoria[cat] =
          (itensPorCategoria[cat] || 0) + item.quantidade;
      });

      return {
        itens: itensCalculados,
        espacosBase,
        espacosExtra,
        espacosTotal,
        espacosOcupados,
        sobrecarregado,
        grauXama: {
          grau: grauXamaInfo.grau,
          limitesPorCategoria: limitesGrauXama,
        },
        itensPorCategoria,
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

      // 4. Calcular categoria final baseado nas modificações
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        equipamento.categoria,
        modificacoesValidas.length,
      );

      // 5. Calcular espaços que o item vai ocupar
      const espacosBaseItem = equipamento.espacos;
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

      // 11. Recarregar item com modificações
      const itemComMods = await db.inventarioItemBase.findUnique({
        where: { id: item.id },
        include: inventarioItemComDadosInclude,
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
        const itensAtuais = await this.carregarItensInventario(
          itemExiste.personagemBaseId,
        );
        const { espacosBase, espacosExtra } =
          await this.calcularEspacosPersonagem(itemExiste.personagemBaseId);

        // Remover espaços do item atual
        const espacosSemEsteItem = itensAtuais
          .filter((i) => i.id !== itemId)
          .reduce((total, i) => total + this.engine.calcularEspacosItem(i), 0);

        const espacosDisponiveis =
          espacosBase + espacosExtra - espacosSemEsteItem;

        // Calcular espaços do item com nova quantidade
        const espacosBaseItem = itemExiste.equipamento.espacos;
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

      // Atualizar
      const itemAtualizado = await this.prisma.inventarioItemBase.update({
        where: { id: itemId },
        data: {
          quantidade: dto.quantidade,
          equipado: dto.equipado,
          nomeCustomizado: dto.nomeCustomizado,
          notas: dto.notas,
        },
        include: inventarioItemComDadosInclude,
      });

      // ✅ Atualizar estado do inventário (recalcula defesa e RDs)
      await this.atualizarEstadoInventario(itemExiste.personagemBaseId);

      return this.mapper.mapItem(itemAtualizado);
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
      const novaQuantidadeModificacoes = item.modificacoes.length + 1;
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      // Recalcular espaços
      const espacosBaseItem = item.equipamento.espacos;
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

      // Recarregar item
      const itemAtualizado = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: inventarioItemComDadosInclude,
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

      // Validar se tem a modificação
      const temModificacao = item.modificacoes.some(
        (m) => m.modificacao.id === dto.modificacaoId,
      );

      if (!temModificacao) {
        throw new InventarioModificacaoNaoAplicadaException(
          dto.modificacaoId,
          itemId,
        );
      }

      // Remover modificação
      await this.prisma.inventarioItemBaseModificacao.delete({
        where: {
          itemId_modificacaoId: {
            itemId: itemId,
            modificacaoId: dto.modificacaoId,
          },
        },
      });

      // Recalcular categoria
      const novaQuantidadeModificacoes = item.modificacoes.length - 1;
      const categoriaCalculada = this.engine.calcularCategoriaFinal(
        item.equipamento.categoria,
        novaQuantidadeModificacoes,
      );

      // Recalcular espaços
      const espacosBaseItem = item.equipamento.espacos;
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

      // Recarregar item
      const itemAtualizado = await this.prisma.inventarioItemBase.findUnique({
        where: { id: itemId },
        include: inventarioItemComDadosInclude,
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
