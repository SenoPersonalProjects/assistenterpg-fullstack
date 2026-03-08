// src/inventario/engine/inventario.engine.ts
import { Injectable } from '@nestjs/common';
import {
  ItemInventarioComDados,
  StatsEquipados,
  ResultadoEspacos,
  PreviewAdicionarItemResponse,
  ValidacaoGrauXama,
  ValidacaoVestir,
} from './inventario.types';
import {
  CategoriaEquipamento,
  GrauFeiticeiro,
  TipoEquipamento,
  TipoAcessorio,
} from '@prisma/client';

/**
 * Engine puro de cálculos de inventário
 * Não acessa o banco de dados diretamente
 */
@Injectable()
export class InventarioEngine {
  /**
   * ✅ NOVO: Calcula a categoria final baseado na quantidade de modificações
   * Progressão: CATEGORIA_0 → CATEGORIA_4 → CATEGORIA_3 → CATEGORIA_2 → CATEGORIA_1 → ESPECIAL
   */
  calcularCategoriaFinal(
    categoriaOriginal: string,
    quantidadeModificacoes: number,
  ): CategoriaEquipamento {
    const ORDEM_CATEGORIAS = [
      'CATEGORIA_0',
      'CATEGORIA_4',
      'CATEGORIA_3',
      'CATEGORIA_2',
      'CATEGORIA_1',
      'ESPECIAL',
    ] as const;

    const indexOriginal = ORDEM_CATEGORIAS.indexOf(categoriaOriginal as any);

    if (indexOriginal === -1) {
      return 'CATEGORIA_0' as CategoriaEquipamento;
    }

    const indexFinal = Math.min(
      indexOriginal + quantidadeModificacoes,
      ORDEM_CATEGORIAS.length - 1,
    );

    return ORDEM_CATEGORIAS[indexFinal] as CategoriaEquipamento;
  }

  /**
   * Calcula espaços ocupados por um item (com modificações)
   */
  calcularEspacosItem(item: ItemInventarioComDados): number {
    const espacosBase = item.equipamento.espacos;

    const incrementoModificacoes = item.modificacoes.reduce(
      (total, mod) => total + (mod.modificacao.incrementoEspacos || 0),
      0,
    );

    // ✅ NOVO: Garantir que espaços não sejam negativos
    const espacosUnitario = Math.max(0, espacosBase + incrementoModificacoes);

    return espacosUnitario * item.quantidade;
  }

  /**
   * Calcula espaço unitário (por unidade) sem quantidade
   */
  calcularEspacoUnitario(item: ItemInventarioComDados): number {
    const espacosBase = item.equipamento.espacos;

    const incrementoModificacoes = item.modificacoes.reduce(
      (total, mod) => total + (mod.modificacao.incrementoEspacos || 0),
      0,
    );

    // ✅ NOVO: Garantir que espaços não sejam negativos
    return Math.max(0, espacosBase + incrementoModificacoes);
  }

  /**
   * Calcula espaços totais ocupados no inventário
   */
  calcularEspacosOcupados(itens: ItemInventarioComDados[]): number {
    return itens.reduce((total, item) => {
      return total + this.calcularEspacosItem(item);
    }, 0);
  }

  /**
   * ✅ NOVO: Calcula espaços extras fornecidos por itens especiais
   * Exemplo: Mochila Militar (espacos: 0, efeito: +2 espaços)
   */
  calcularEspacosExtraDeItens(itens: ItemInventarioComDados[]): number {
    let espacosExtra = 0;

    for (const item of itens) {
      const equip = item.equipamento;

      // ✅ Detectar itens que aumentam capacidade
      if (equip.espacos === 0 && equip.efeito) {
        const efeitoLower = equip.efeito.toLowerCase();

        const palavrasChave = [
          'aumenta capacidade',
          'aumenta sua capacidade',
          'capacidade de carga',
          'espaços de inventário',
          'espaços extras',
          'espaços adicionais',
        ];

        const temPalavraChave = palavrasChave.some((palavra) =>
          efeitoLower.includes(palavra),
        );

        if (temPalavraChave) {
          const match = equip.efeito.match(/(\d+)\s*espaço/i);
          if (match) {
            const valor = parseInt(match[1], 10);
            espacosExtra += valor * item.quantidade;
          }
        }
      }
    }

    return espacosExtra;
  }

  /**
   * Calcula se o personagem está sobrecarregado
   */
  calcularResultadoEspacos(
    itens: ItemInventarioComDados[],
    espacosBase: number,
    espacosExtra: number,
  ): ResultadoEspacos {
    const espacosTotal = espacosBase + espacosExtra;
    const espacosOcupados = this.calcularEspacosOcupados(itens);
    const espacosDisponiveis = espacosTotal - espacosOcupados;
    const sobrecarregado = espacosOcupados > espacosTotal;

    return {
      espacosTotal,
      espacosOcupados,
      espacosDisponiveis,
      sobrecarregado,
    };
  }

  /**
   * ✅ ATUALIZADO: Calcula stats agregados dos itens equipados
   * Agora inclui bônus das modificações (efeitosMecanicos)
   */
  calcularStatsEquipados(itens: ItemInventarioComDados[]): StatsEquipados {
    const itensEquipados = itens.filter((item) => item.equipado);

    // ✅ 1. DEFESA TOTAL (base + modificações)
    let defesaTotal = 0;

    itensEquipados.forEach((item) => {
      // Defesa base do equipamento
      if (
        item.equipamento.tipo === TipoEquipamento.PROTECAO &&
        item.equipamento.bonusDefesa
      ) {
        defesaTotal += item.equipamento.bonusDefesa * item.quantidade;
      }

      // ✅ NOVO: Defesa das modificações (bonusDefesa em efeitosMecanicos)
      item.modificacoes.forEach((modJunction) => {
        const efeitos = modJunction.modificacao.efeitosMecanicos as any;
        if (efeitos && typeof efeitos.bonusDefesa === 'number') {
          defesaTotal += efeitos.bonusDefesa * item.quantidade;
        }
      });
    });

    // 2. DANOS TOTAIS (agregados por tipo+empunhadura)
    const danosPorChave = new Map<
      string,
      {
        tipoDano: string;
        empunhadura?: string | null;
        rolagens: string[];
        flat: number;
      }
    >();

    itensEquipados.forEach((item) => {
      if (!item.equipamento.danos) {
        return;
      }

      item.equipamento.danos.forEach((dano) => {
        const chave = `${dano.tipoDano}_${dano.empunhadura || 'default'}`;

        if (!danosPorChave.has(chave)) {
          danosPorChave.set(chave, {
            tipoDano: dano.tipoDano,
            empunhadura: dano.empunhadura,
            rolagens: [],
            flat: 0,
          });
        }

        const entry = danosPorChave.get(chave)!;
        entry.rolagens.push(dano.rolagem);
        entry.flat += dano.valorFlat;
      });
    });

    const danosTotais = Array.from(danosPorChave.values()).map((d) => ({
      tipoDano: d.tipoDano,
      empunhadura: d.empunhadura,
      rolagem: d.rolagens.join(' + '),
      flat: d.flat,
    }));

    // ✅ 3. REDUÇÕES DE DANO (base + modificações)
    const reducoesPorTipo = new Map<string, number>();

    itensEquipados.forEach((item) => {
      // RD base do equipamento
      if (item.equipamento.reducesDano) {
        item.equipamento.reducesDano.forEach((rd) => {
          const valorAtual = reducoesPorTipo.get(rd.tipoReducao) || 0;
          reducoesPorTipo.set(
            rd.tipoReducao,
            valorAtual + rd.valor * item.quantidade,
          );
        });
      }

      // ✅ NOVO: RD das modificações (rdAdicional em efeitosMecanicos)
      item.modificacoes.forEach((modJunction) => {
        const efeitos = modJunction.modificacao.efeitosMecanicos as any;
        if (efeitos && typeof efeitos.rdAdicional === 'number') {
          // rdAdicional se aplica a TODOS os tipos de RD já existentes no item
          if (item.equipamento.reducesDano) {
            item.equipamento.reducesDano.forEach((rd) => {
              const valorAtual = reducoesPorTipo.get(rd.tipoReducao) || 0;
              reducoesPorTipo.set(
                rd.tipoReducao,
                valorAtual + efeitos.rdAdicional * item.quantidade,
              );
            });
          }
        }
      });
    });

    const reducoesDano = Array.from(reducoesPorTipo.entries()).map(
      ([tipoReducao, valor]) => ({
        tipoReducao,
        valor,
      }),
    );

    // 4. PENALIDADE DE CARGA
    let penalidadeCarga = 0;
    itensEquipados.forEach((item) => {
      if (
        item.equipamento.tipo === TipoEquipamento.PROTECAO &&
        item.equipamento.penalidadeCarga
      ) {
        penalidadeCarga += item.equipamento.penalidadeCarga;
      }
    });

    return {
      defesaTotal,
      danosTotais,
      reducoesDano,
      penalidadeCarga,
    };
  }

  /**
   * ✅ NOVO: Valida sistema de vestir
   * Regras:
   * - Máximo 5 itens vestidos
   * - Máximo 2 vestimentas (acessórios do tipo VESTIMENTA)
   */
  validarSistemaVestir(itens: ItemInventarioComDados[]): ValidacaoVestir {
    const itensEquipados = itens.filter((item) => item.equipado);

    let totalVestiveis = 0;
    let totalVestimentas = 0;

    for (const item of itensEquipados) {
      const ehProtecao = item.equipamento.tipo === TipoEquipamento.PROTECAO;
      const ehVestimenta =
        item.equipamento.tipo === TipoEquipamento.ACESSORIO &&
        item.equipamento.tipoAcessorio === TipoAcessorio.VESTIMENTA;

      if (ehProtecao || ehVestimenta) {
        totalVestiveis += item.quantidade;

        if (ehVestimenta) {
          totalVestimentas += item.quantidade;
        }
      }
    }

    const erros: string[] = [];

    if (totalVestiveis > 5) {
      erros.push(
        `Você tem ${totalVestiveis} itens vestidos, mas o máximo permitido é 5.`,
      );
    }

    if (totalVestimentas > 2) {
      erros.push(
        `Você tem ${totalVestimentas} vestimentas equipadas, mas o máximo permitido é 2.`,
      );
    }

    return {
      valido: erros.length === 0,
      erros,
      totalVestiveis,
      totalVestimentas,
      limiteVestiveis: 5,
      limiteVestimentas: 2,
    };
  }

  /**
   * Valida se um item pode ser adicionado ao inventário
   */
  validarAdicaoItem(
    itemEspacos: number,
    espacosDisponiveis: number,
  ): { valido: boolean; erro?: string } {
    if (itemEspacos > espacosDisponiveis) {
      return {
        valido: false,
        erro: `Item ocupa ${itemEspacos} espaço(s), mas você tem apenas ${espacosDisponiveis} disponível(is).`,
      };
    }

    return { valido: true };
  }

  /**
   * Valida se uma modificação pode ser aplicada a um item
   */
  validarAplicacaoModificacao(
    item: ItemInventarioComDados,
    modificacao: { id: number; incrementoEspacos: number },
    espacosDisponiveisAtuais: number,
  ): { valido: boolean; erro?: string } {
    const jaTemModificacao = item.modificacoes.some(
      (m) => m.modificacao.id === modificacao.id,
    );

    if (jaTemModificacao) {
      return {
        valido: false,
        erro: 'Este item já possui essa modificação.',
      };
    }

    const espacosAdicionais = modificacao.incrementoEspacos * item.quantidade;

    if (espacosAdicionais > espacosDisponiveisAtuais) {
      return {
        valido: false,
        erro: `Aplicar esta modificação requer ${espacosAdicionais} espaço(s) adicionais, mas você tem apenas ${espacosDisponiveisAtuais} disponível(is).`,
      };
    }

    return { valido: true };
  }

  // =========================================================================
  // ✅ FUNÇÕES GRAU XAMÃ - COMPLETAS E TESTADAS
  // =========================================================================

  /**
   * Calcula grau xamã baseado no prestigioBase do personagem
   */
  calcularGrauXama(prestigioBase: number): {
    grau: GrauFeiticeiro;
    prestigioMinimo: number;
  } {
    const ordemGraus = [
      { prestigioMin: 200, grau: GrauFeiticeiro.ESPECIAL },
      { prestigioMin: 120, grau: GrauFeiticeiro.GRAU_1 },
      { prestigioMin: 90, grau: GrauFeiticeiro.SEMI_1 },
      { prestigioMin: 60, grau: GrauFeiticeiro.GRAU_2 },
      { prestigioMin: 30, grau: GrauFeiticeiro.GRAU_3 },
      { prestigioMin: 0, grau: GrauFeiticeiro.GRAU_4 },
    ];

    const grauElegivel = ordemGraus
      .filter((grau) => grau.prestigioMin <= prestigioBase)
      .sort((a, b) => b.prestigioMin - a.prestigioMin)[0];

    return {
      grau: grauElegivel.grau,
      prestigioMinimo: grauElegivel.prestigioMin,
    };
  }

  /**
   * ✅ CORE: Valida limites de itens por categoria x grau xamã
   */
  validarLimitesGrauXama(
    prestigioBase: number,
    limitesPorCategoria: Record<string, number>,
    itensPorCategoria: Record<string, number>,
  ): ValidacaoGrauXama {
    const { grau } = this.calcularGrauXama(prestigioBase);
    const erros: string[] = [];
    const limitesAtuais = { ...limitesPorCategoria };
    const itensPorCategoriaAtual = { ...itensPorCategoria };

    const categorias = [
      'CATEGORIA_0',
      'CATEGORIA_4',
      'CATEGORIA_3',
      'CATEGORIA_2',
      'CATEGORIA_1',
      'ESPECIAL',
    ];

    categorias.forEach((categoria) => {
      // CATEGORIA_0 é sempre ilimitada
      if (categoria === 'CATEGORIA_0') return;

      const limite = limitesPorCategoria[categoria] ?? 0;
      const atual = itensPorCategoriaAtual[categoria] ?? 0;

      if (atual > limite) {
        erros.push(
          `Categoria ${categoria}: ${atual}/${limite} itens ` +
            `(Grau ${grau} não permite mais itens desta categoria)`,
        );
      }
    });

    return {
      valido: erros.length === 0,
      erros,
      grauAtual: grau,
      limitesAtuais,
      itensPorCategoriaAtual,
    };
  }

  /**
   * ✅ Preview completo antes de adicionar (ESPAÇO + GRAU XAMÃ)
   */
  previewAdicionarItem(
    itensAtuais: ItemInventarioComDados[],
    novoItem: {
      equipamento: any;
      quantidade: number;
    },
    personagem: {
      espacosInventarioBase: number;
      espacosInventarioExtra: number;
      prestigioBase: number;
    },
    limitesGrauXama: Record<string, number>,
  ): PreviewAdicionarItemResponse {
    // 1. ESPAÇOS
    const espacos = this.calcularResultadoEspacos(
      itensAtuais,
      personagem.espacosInventarioBase,
      personagem.espacosInventarioExtra,
    );

    // 2. GRAU XAMÃ - Simular inventário com novo item
    const itensPorCategoriaAtual = itensAtuais.reduce<Record<string, number>>(
      (acc, item) => {
        const cat = item.categoriaCalculada || item.equipamento.categoria;
        acc[cat] = (acc[cat] ?? 0) + item.quantidade;
        return acc;
      },
      {},
    );

    const categoriaNovoItem = novoItem.equipamento.categoria;
    itensPorCategoriaAtual[categoriaNovoItem] =
      (itensPorCategoriaAtual[categoriaNovoItem] ?? 0) + novoItem.quantidade;

    const validacaoGrauXama = this.validarLimitesGrauXama(
      personagem.prestigioBase,
      limitesGrauXama,
      itensPorCategoriaAtual,
    );

    // 3. STATS (estado atual)
    const stats = this.calcularStatsEquipados(itensAtuais);

    return {
      espacos,
      grauXama: validacaoGrauXama,
      stats,
    };
  }
}
