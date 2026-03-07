// src/inventario/inventario.mapper.ts
import { Injectable } from '@nestjs/common';
import {
  ItemInventarioDto,
  InventarioCompletoDto,
  StatsEquipadosDto,
} from './dto/inventario-completo.dto';
import {
  ItemInventarioComDados,
  StatsEquipados,
} from './engine/inventario.types';
import { InventarioEngine } from './engine/inventario.engine';
import { CategoriaEquipamento, ComplexidadeMaldicao } from '@prisma/client';

@Injectable()
export class InventarioMapper {
  constructor(private readonly engine: InventarioEngine) {}

  /**
   * Mapeia item do banco para DTO
   */
  mapItem(item: ItemInventarioComDados): ItemInventarioDto {
    // Usar categoriaCalculada do item se existir, senão calcular
    const categoriaCalculada = item.categoriaCalculada
      ? (item.categoriaCalculada as CategoriaEquipamento)
      : this.engine.calcularCategoriaFinal(
          item.equipamento.categoria,
          item.modificacoes.length,
        );

    // Calcular espaços por unidade (equipamento + mods)
    const espacosCalculados = this.engine.calcularEspacoUnitario(item);

    return {
      id: item.id,
      equipamentoId: item.equipamentoId,

      equipamento: {
        id: item.equipamento.id,
        codigo: item.equipamento.codigo,
        nome: item.equipamento.nome,
        tipo: item.equipamento.tipo,
        categoria: item.equipamento.categoria as CategoriaEquipamento,
        espacos: item.equipamento.espacos,
        complexidadeMaldicao: item.equipamento
          .complexidadeMaldicao as ComplexidadeMaldicao,
      },

      quantidade: item.quantidade,
      equipado: item.equipado,

      categoriaCalculada,
      espacosCalculados,

      nomeCustomizado: item.nomeCustomizado || null,
      notas: item.notas || null,

      modificacoes: item.modificacoes.map((m) => ({
        id: m.modificacao.id,
        codigo: m.modificacao.codigo,
        nome: m.modificacao.nome,
        descricao: m.modificacao.descricao || null,
        incrementoEspacos: m.modificacao.incrementoEspacos,
      })),
    };
  }

  /**
   * ✅ NOVO: Mapeia stats equipados para DTO
   */
  mapStatsEquipados(stats: StatsEquipados): StatsEquipadosDto {
    return {
      defesaTotal: stats.defesaTotal,
      danosTotais: stats.danosTotais.map((d) => ({
        tipoDano: d.tipoDano,
        empunhadura: d.empunhadura,
        rolagem: d.rolagem,
        flat: d.flat,
      })),
      reducoesDano: stats.reducoesDano.map((r) => ({
        tipoReducao: r.tipoReducao,
        valor: r.valor,
      })),
      penalidadeCarga: stats.penalidadeCarga,
    };
  }

  /**
   * Mapeia inventário completo para DTO
   * ✅ CORRIGIDO: Agora inclui statsEquipados
   */
  mapInventarioCompleto(
    personagemBaseId: number,
    itens: ItemInventarioComDados[],
    espacosBase: number,
    espacosExtra: number,
  ): InventarioCompletoDto {
    const resultadoEspacos = this.engine.calcularResultadoEspacos(
      itens,
      espacosBase,
      espacosExtra,
    );

    // ✅ NOVO: Calcular stats equipados
    const statsEquipados = this.engine.calcularStatsEquipados(itens);

    return {
      personagemBaseId,

      espacosTotal: resultadoEspacos.espacosTotal,
      espacosOcupados: resultadoEspacos.espacosOcupados,
      espacosDisponiveis: resultadoEspacos.espacosDisponiveis,
      sobrecarregado: resultadoEspacos.sobrecarregado,

      itens: itens.map((item) => this.mapItem(item)),

      // ✅ NOVO: Incluir stats equipados
      statsEquipados: this.mapStatsEquipados(statsEquipados),
    };
  }
}
