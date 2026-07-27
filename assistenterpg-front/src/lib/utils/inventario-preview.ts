import type {
  CapacidadeInventarioCalculada,
  PreviewItensInventarioResponse,
} from '@/lib/types/inventario.types';
import type { PersonagemBasePreview } from '@/lib/types/personagem.types';
import { getGrauXamaPorPrestigio } from './prestigio';

export function normalizarCapacidadePreviewPersonagem(
  preview: PersonagemBasePreview,
): CapacidadeInventarioCalculada | null {
  const inventario = preview.espacosInventario;
  if (!inventario?.formula) return null;

  const ocupados = inventario.ocupados ?? 0;
  const restantes = inventario.restantes ?? inventario.total - ocupados;

  return {
    base: inventario.base,
    extraHabilidades: inventario.extraHabilidades ?? 0,
    extraItens: inventario.extraItens ?? 0,
    extra: inventario.extra,
    total: inventario.total,
    ocupados,
    restantes,
    sobrecarregado: inventario.sobrecarregado ?? ocupados > inventario.total,
    formula: inventario.formula,
  };
}

export function converterPreviewPersonagemParaInventario(
  preview: PersonagemBasePreview,
): PreviewItensInventarioResponse {
  const capacidade = normalizarCapacidadePreviewPersonagem(preview);
  if (!capacidade || !preview.espacosInventario) {
    throw new Error('O servidor não retornou o cálculo autoritativo do inventário.');
  }

  const grauXama = getGrauXamaPorPrestigio(preview.prestigioBase);

  return {
    itens: (preview.itensInventario ?? []).map((item, indice) => ({
      indiceEntrada: item.indiceEntrada ?? indice,
      equipamentoId: item.equipamentoId,
      quantidade: item.quantidade,
      equipado: item.equipado,
      categoriaCalculada: item.categoriaCalculada,
      espacosCalculados: item.espacosPorUnidade,
      espacosPorUnidade: item.espacosPorUnidade,
      espacosTotal: item.espacosTotal,
      nomeCustomizado: item.nomeCustomizado,
      modificacoes: item.modificacoes.map((modificacao) => ({
        ...modificacao,
        codigo: undefined,
        tipo: undefined,
      })),
      equipamento: {
        id: item.equipamento.id,
        codigo: item.equipamento.codigo,
        nome: item.equipamento.nome,
        tipo: item.equipamento.tipo,
        categoria: item.equipamento.categoria,
        espacos: item.equipamento.espacos,
      },
    })),
    espacosBase: capacidade.base,
    espacosExtra: capacidade.extra,
    espacosTotal: capacidade.total,
    espacosOcupados: capacidade.ocupados,
    sobrecarregado: capacidade.sobrecarregado,
    capacidade,
    grauXama: {
      grau: grauXama.grau,
      limitesPorCategoria:
        preview.espacosInventario.limitesPorCategoria ??
        grauXama.limitesPorCategoria,
    },
    itensPorCategoria: preview.espacosInventario.itensPorCategoria ?? {},
  };
}
