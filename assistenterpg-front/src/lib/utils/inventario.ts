// lib/utils/inventario.ts
/**
 * Utilitários de inventário (cálculos, validações, helpers)
 */

import type { IconName } from '@/components/ui/Icon';
import type {
  ItemInventarioDto,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
} from '@/lib/types'; // ✅ ATUALIZADO

type EquipamentoComIncremento = EquipamentoCatalogo & {
  incrementoEspacos?: number | null;
};

/* ============================================================================ */
/* CONSTANTES */
/* ============================================================================ */

/**
 * Tipos de equipamentos que podem ser vestidos
 */
export const TIPOS_VESTIVEIS = ['PROTECAO', 'ACESSORIO'] as const;

/**
 * Subtipo de acessório que é vestimenta
 */
export const SUBTIPO_VESTIMENTA = 'VESTIMENTA' as const;

/**
 * Limites do sistema de vestir
 */
export const LIMITES_VESTIR = {
  MAX_VESTIVEIS: 5, // Proteções + Vestimentas
  MAX_VESTIMENTAS: 2, // Apenas vestimentas
} as const;

/**
 * Labels e ícones das categorias de equipamento
 */
export const CATEGORIAS_LABELS: Record<
  string,
  { nome: string; icon: IconName; cor: string }
> = {
  ARMAS: { nome: 'Armas', icon: 'bolt', cor: 'text-red-500' },
  MUNICOES: { nome: 'Munições', icon: 'target', cor: 'text-orange-500' },
  PROTECOES: { nome: 'Proteções', icon: 'shield', cor: 'text-blue-500' },
  UTILITARIOS: { nome: 'Utilitários', icon: 'tools', cor: 'text-gray-500' },
  ARMAS_AMALDICOADAS_SIMPLES: {
    nome: 'Armas Amaldiç. (Simples)',
    icon: 'bolt',
    cor: 'text-purple-500',
  },
  ARMAS_AMALDICOADAS_COMPLEXAS: {
    nome: 'Armas Amaldiç. (Complexas)',
    icon: 'bolt',
    cor: 'text-purple-700',
  },
  PROTECOES_AMALDICOADAS_SIMPLES: {
    nome: 'Proteções Amaldiç. (Simples)',
    icon: 'shield',
    cor: 'text-cyan-500',
  },
  PROTECOES_AMALDICOADAS_COMPLEXAS: {
    nome: 'Proteções Amaldiç. (Complexas)',
    icon: 'shield',
    cor: 'text-cyan-700',
  },
  ITENS_AMALDICOADOS: {
    nome: 'Itens Amaldiçoados',
    icon: 'sparkles',
    cor: 'text-pink-500',
  },
  ARTEFATOS_AMALDICOADOS: {
    nome: 'Artefatos Amaldiçoados',
    icon: 'star',
    cor: 'text-yellow-500',
  },
};

/**
 * Labels para categorias de Grau Xamã
 */
export const CATEGORIA_GRAU_LABELS: Record<
  string,
  { nome: string; cor: string }
> = {
  '0': { nome: 'Cat. 0 (Comum)', cor: 'text-gray-500' },
  '4': { nome: 'Cat. 4', cor: 'text-green-500' },
  '3': { nome: 'Cat. 3', cor: 'text-blue-500' },
  '2': { nome: 'Cat. 2', cor: 'text-purple-500' },
  '1': { nome: 'Cat. 1', cor: 'text-orange-500' },
  ESPECIAL: { nome: 'Cat. Especial', cor: 'text-red-500' },
};

/**
 * Ícones por tipo de equipamento
 */
export const ICONES_TIPO: Record<string, IconName> = {
  ARMA: 'bolt',
  FERRAMENTA_AMALDICOADA: 'bolt',
  PROTECAO: 'shield',
  ITEM_AMALDICOADO: 'shield',
  ACESSORIO: 'sparkles',
  EXPLOSIVO: 'beaker',
  ITEM_OPERACIONAL: 'tools',
  MUNICAO: 'target',
};

/**
 * Ícones por categoria de grau xamã
 */
export const ICONES_CATEGORIA_GRAU: Record<string, IconName> = {
  '0': 'refresh',
  '4': 'bolt',
  '3': 'shield',
  '2': 'briefcase',
  '1': 'sparkles',
  ESPECIAL: 'star',
};

/* ============================================================================ */
/* HELPERS DE CATEGORIA */
/* ============================================================================ */

/**
 * Normaliza categoria do backend para formato esperado
 */
export function normalizarCategoria(categoria: unknown): string {
  if (categoria === null || categoria === undefined) {
    return '0';
  }

  if (typeof categoria === 'number') {
    return categoria.toString();
  }

  const catStr = String(categoria);

  if (catStr === 'ESPECIAL' || catStr === 'CATEGORIA_ESPECIAL') {
    return 'ESPECIAL';
  }

  const match = catStr.match(/CATEGORIA_(\d+|ESPECIAL)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  if (/^\d+$/.test(catStr)) {
    return catStr;
  }

  console.warn('[normalizarCategoria] Categoria desconhecida:', categoria);
  return '0';
}

/* ============================================================================ */
/* HELPERS DE ÍCONES */
/* ============================================================================ */

export function getIconeTipo(tipo: string): IconName {
  return ICONES_TIPO[tipo] || 'briefcase';
}

export function getIconeCategoria(categoria: string): IconName {
  return ICONES_CATEGORIA_GRAU[categoria] || 'briefcase';
}

/* ============================================================================ */
/* HELPERS DE FORMATAÇÃO */
/* ============================================================================ */

export function formatarPercentualCarga(
  ocupado: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return Math.round((ocupado / total) * 100);
}

export function getCorBarraProgresso(percentual: number): string {
  if (percentual >= 90) return 'bg-app-danger';
  if (percentual >= 70) return 'bg-app-warning';
  return 'bg-app-success';
}

export function getCorTextoProgresso(percentual: number): string {
  if (percentual >= 90) return 'text-app-danger';
  if (percentual >= 70) return 'text-app-warning';
  return 'text-app-success';
}

/* ============================================================================ */
/* CÁLCULOS DE INVENTÁRIO */
/* ============================================================================ */

/**
 * Calcula espaços totais de um item (backend já calcula espacosCalculados)
 */
export function calcularEspacosItem(item: ItemInventarioDto): number {
  if (item.espacosCalculados === undefined) {
    console.error('[ERRO] Item sem espacosCalculados do backend:', item);
    throw new Error(
      'Item sem espacosCalculados calculado pelo backend. Isso é um bug que precisa ser corrigido no backend.'
    );
  }

  return item.espacosCalculados * item.quantidade;
}

/**
 * Calcula espaços ocupados totais de uma lista de itens
 */
export function calcularEspacosOcupados(itens: ItemInventarioDto[]): number {
  return itens.reduce((total, item) => {
    return total + calcularEspacosItem(item);
  }, 0);
}

export function calcularEspacosExtraDeItens(
  itens: Array<{ equipamentoId: number; quantidade: number }>,
  equipamentos: EquipamentoCatalogo[],
): number {
  return itens.reduce((total, item) => {
    const equipamento = equipamentos.find((e) => e.id === item.equipamentoId);
    
    if (!equipamento) return total;

    // ✅ Verifica se equipamento tem incrementoEspacos
    const incremento = (equipamento as EquipamentoComIncremento).incrementoEspacos ?? 0;
    
    // ✅ Só conta incrementos POSITIVOS (espaços extras)
    if (incremento > 0) {
      return total + (incremento * item.quantidade);
    }

    return total;
  }, 0);
}

export function isSobrecargaSevera(
  ocupado: number,
  capacidadeTotal: number,
): boolean {
  return ocupado > capacidadeTotal * 2;
}

export function calcularSobrecargaPercentual(
  ocupado: number,
  capacidadeTotal: number,
): number {
  if (capacidadeTotal <= 0) return 0;
  return ocupado / capacidadeTotal;
}

export function getStatusSobrecarga(
  percentual: number,
): 'NORMAL' | 'SOBRECARGA' | 'SEVERA' {
  if (percentual <= 1.0) return 'NORMAL';
  if (percentual <= 2.0) return 'SOBRECARGA';
  return 'SEVERA';
}

/* ============================================================================ */
/* VALIDAÇÕES DE VESTIR */
/* ============================================================================ */

export type ItemVestivel = {
  tipo: string;
  tipoAcessorio?: string | null;
  quantidade: number;
};

export type ItemInventarioParaVestir = {
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;
  equipamento?: EquipamentoCatalogo;
};

export type ResultadoValidacaoVestir = {
  valido: boolean;
  totalVestiveis: number;
  totalVestimentas: number;
  erros: string[];
};

/**
 * Detecta o tipo base de um equipamento (considerando amaldiçoados)
 */
function detectarTipoBase(equipamento: EquipamentoCatalogo): string | null {
  const tipo = equipamento.tipo;

  if (tipo === 'ARMA') return 'ARMA';
  if (tipo === 'MUNICAO') return 'MUNICAO';
  if (tipo === 'PROTECAO') return 'PROTECAO';
  if (tipo === 'ACESSORIO') return 'ACESSORIO';

  if (tipo === 'FERRAMENTA_AMALDICOADA') {
    if (equipamento.armaAmaldicoada || equipamento.proficienciaArma || equipamento.alcance) {
      return 'ARMA';
    }
    if (equipamento.protecaoAmaldicoada || equipamento.proficienciaProtecao || equipamento.tipoProtecao) {
      return 'PROTECAO';
    }
    return 'FERRAMENTA_AMALDICOADA';
  }

  if (
    tipo === 'ITEM_OPERACIONAL' &&
    (equipamento.tipoArma || equipamento.proficienciaArma || equipamento.alcance)
  ) {
    return 'ARMA';
  }

  return null;
}

/**
 * Verifica se um equipamento pode ser vestido
 * 
 * PRIORIDADES:
 * 1. FERRAMENTA_AMALDICOADA com protecaoAmaldicoada → TRUE
 * 2. Se tipoUso está preenchido → usa tipoUso === 'VESTIVEL'
 * 3. Fallback → PROTECAO ou ACESSORIO:VESTIMENTA
 */
export function podeSerVestido(equipamento: EquipamentoCatalogo): boolean {
  const DEBUG = false;

  if (DEBUG) {
    console.log(`\n🔎 [podeSerVestido] Analisando: "${equipamento.nome}" (ID: ${equipamento.id})`);
    console.log(`   tipo: "${equipamento.tipo}"`);
    console.log(`   protecaoAmaldicoada: ${JSON.stringify(equipamento.protecaoAmaldicoada)}`);
    console.log(`   tipoUso: "${equipamento.tipoUso}"`);
  }

  // ✅ PRIORIDADE 1: Ferramenta amaldiçoada que é PROTEÇÃO
  if (equipamento.tipo === 'FERRAMENTA_AMALDICOADA') {
    const temProtecao = !!equipamento.protecaoAmaldicoada;

    if (DEBUG) {
      console.log(`   ✓ É FERRAMENTA_AMALDICOADA`);
      console.log(`   → protecaoAmaldicoada existe? ${temProtecao}`);
    }

    if (temProtecao) {
      if (DEBUG) console.log(`   ✅ RETORNA: true (FERRAMENTA_AMALDICOADA com proteção)`);
      return true;
    }
  }

  // ✅ PRIORIDADE 2 & 3: Respeitar tipoUso
  const tipoUso = equipamento.tipoUso;

  if (DEBUG) {
    console.log(`   tipoUso (valor bruto): "${tipoUso}"`);
    console.log(`   tipoUso !== undefined? ${tipoUso !== undefined}`);
    console.log(`   tipoUso !== null? ${tipoUso !== null}`);
  }

  if (tipoUso !== undefined && tipoUso !== null) {
    if (DEBUG) console.log(`   → tipoUso está preenchido`);

    if (tipoUso === 'VESTIVEL') {
      if (DEBUG) console.log(`   ✅ RETORNA: true (tipoUso === 'VESTIVEL')`);
      return true;
    }

    if (DEBUG) console.log(`   ❌ RETORNA: false (tipoUso === "${tipoUso}", não é 'VESTIVEL')`);
    return false;
  }

  // ✅ PRIORIDADE 4: Fallback
  const resultado = ehVestivel(equipamento.tipo, equipamento.tipoAcessorio);
  if (DEBUG) console.log(`   ✅ RETORNA: ${resultado} (fallback ehVestivel)`);
  return resultado;
}

/**
 * Verifica se um tipo de equipamento é vestível (lógica de fallback)
 */
export function ehVestivel(tipo: string, tipoAcessorio?: string | null): boolean {
  if (tipo === 'PROTECAO') return true;
  if (tipo === 'ACESSORIO' && tipoAcessorio === SUBTIPO_VESTIMENTA) return true;
  return false;
}

/**
 * Valida se um item pode ser vestido baseado nos limites
 */
export function validarSistemaVestir(
  itensEquipados: ItemVestivel[],
): ResultadoValidacaoVestir {
  let totalVestiveis = 0;
  let totalVestimentas = 0;

  for (const item of itensEquipados) {
    const ehProtecao = item.tipo === 'PROTECAO';
    const ehVestimenta =
      item.tipo === 'ACESSORIO' && item.tipoAcessorio === SUBTIPO_VESTIMENTA;

    if (ehProtecao || ehVestimenta) {
      totalVestiveis += item.quantidade;

      if (ehVestimenta) {
        totalVestimentas += item.quantidade;
      }
    }
  }

  const erros: string[] = [];

  if (totalVestiveis > LIMITES_VESTIR.MAX_VESTIVEIS) {
    erros.push(
      `Você tem ${totalVestiveis} itens vestidos, mas o máximo permitido é ${LIMITES_VESTIR.MAX_VESTIVEIS}.`,
    );
  }

  if (totalVestimentas > LIMITES_VESTIR.MAX_VESTIMENTAS) {
    erros.push(
      `Você tem ${totalVestimentas} vestimentas equipadas, mas o máximo permitido é ${LIMITES_VESTIR.MAX_VESTIMENTAS}.`,
    );
  }

  return {
    valido: erros.length === 0,
    totalVestiveis,
    totalVestimentas,
    erros,
  };
}

/**
 * Conta quantos itens vestíveis estão equipados
 * 
 * IMPORTANTE: Prioriza o catálogo completo como source of truth
 * item.equipamento pode estar serializado parcialmente pelo backend
 */
export function contarItensVestiveis(
  itens: ItemInventarioParaVestir[],
  equipamentos: EquipamentoCatalogo[] = [],
): { vestiveis: number; vestimentas: number } {
  let vestiveis = 0;
  let vestimentas = 0;

  const itensEquipados = itens.filter((item) => item.equipado);

  itensEquipados.forEach((item) => {
    let equip: EquipamentoCatalogo | undefined;

    // 1️⃣ Prioridade: usar catálogo completo
    if (equipamentos.length > 0) {
      equip = equipamentos.find((e) => e.id === item.equipamentoId);
    }

    // 2️⃣ Fallback: usar item.equipamento
    if (!equip && item.equipamento) {
      equip = item.equipamento as EquipamentoCatalogo | undefined;
    }

    if (!equip) {
      return;
    }

    // ✅ Usar a regra oficial
    if (!podeSerVestido(equip)) return;

    vestiveis += item.quantidade;

    const ehVestimenta =
      equip.tipo === 'ACESSORIO' &&
      equip.tipoAcessorio === SUBTIPO_VESTIMENTA;

    if (ehVestimenta) {
      vestimentas += item.quantidade;
    }
  });

  return { vestiveis, vestimentas };
}

/* ============================================================================ */
/* VALIDAÇÕES COMPLEXAS - CATEGORIA E MODIFICAÇÕES */
/* ============================================================================ */

export function validarCategoriaNaoExcedeEspecial(
  categoriaBase: string | number,
  modificacoes: ModificacaoCatalogo[],
): { valido: boolean; erro?: string } {
  const categoriaAtual = normalizarCategoria(categoriaBase);

  if (categoriaAtual === 'ESPECIAL') {
    const temModificacoes = modificacoes.length > 0;

    if (temModificacoes) {
      return {
        valido: false,
        erro: '⚠️ Equipamentos de categoria ESPECIAL não podem ter modificações que alterem suas características únicas.',
      };
    }
  }

  return { valido: true };
}

export function validarLimitesVestidos(
  itensInventario: ItemInventarioParaVestir[],
  equipamentos: EquipamentoCatalogo[],
  novoItemVestido?: { equipamentoId: number; quantidade: number },
): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  const { vestiveis, vestimentas } = contarItensVestiveis(
    itensInventario,
    equipamentos,
  );

  let totalVestiveisComNovo = vestiveis;
  let totalVestimentasComNovo = vestimentas;

  if (novoItemVestido) {
    const equipNovo = equipamentos.find((e) => e.id === novoItemVestido.equipamentoId);

    if (equipNovo) {
      const tipoBase = detectarTipoBase(equipNovo);

      const ehProtecao = tipoBase === 'PROTECAO';
      const ehVestimenta =
        tipoBase === 'ACESSORIO' &&
        equipNovo.tipoAcessorio === SUBTIPO_VESTIMENTA;

      if (ehProtecao || ehVestimenta) {
        totalVestiveisComNovo += novoItemVestido.quantidade;

        if (ehVestimenta) {
          totalVestimentasComNovo += novoItemVestido.quantidade;
        }
      }
    }
  }

  if (totalVestiveisComNovo > LIMITES_VESTIR.MAX_VESTIVEIS) {
    erros.push(
      `🛡️ **Limite de itens vestidos excedido!**\n` +
        `• Máximo permitido: **${LIMITES_VESTIR.MAX_VESTIVEIS} itens**\n` +
        `• Atualmente vestindo: **${vestiveis} itens**\n` +
        `• Tentando adicionar: **${novoItemVestido?.quantidade || 0}**\n` +
        `• Total seria: **${totalVestiveisComNovo}** ❌`
    );
  }

  if (totalVestimentasComNovo > LIMITES_VESTIR.MAX_VESTIMENTAS) {
    erros.push(
      `👔 **Limite de vestimentas excedido!**\n` +
        `• Máximo permitido: **${LIMITES_VESTIR.MAX_VESTIMENTAS} vestimentas**\n` +
        `• Atualmente vestindo: **${vestimentas} vestimentas**\n` +
        `• Tentando adicionar: **${novoItemVestido?.quantidade || 0}**\n` +
        `• Total seria: **${totalVestimentasComNovo}** ❌`
    );
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

export function validarPodeVestir(
  equipamento: EquipamentoCatalogo,
  quantidade: number,
  itensInventario: ItemInventarioParaVestir[],
  equipamentos: EquipamentoCatalogo[],
): {
  valido: boolean;
  podeVestir: boolean;
  erros: string[];
  info: {
    totalVestiveis: number;
    totalVestimentas: number;
    novoTotalVestiveis: number;
    novoTotalVestimentas: number;
  };
} {
  const podeVestir = podeSerVestido(equipamento);

  if (!podeVestir) {
    return {
      valido: false,
      podeVestir: false,
      erros: ['Este tipo de equipamento não pode ser vestido.'],
      info: {
        totalVestiveis: 0,
        totalVestimentas: 0,
        novoTotalVestiveis: 0,
        novoTotalVestimentas: 0,
      },
    };
  }

  const validacao = validarLimitesVestidos(itensInventario, equipamentos, {
    equipamentoId: equipamento.id,
    quantidade,
  });

  const { vestiveis, vestimentas } = contarItensVestiveis(itensInventario, equipamentos);

  const ehVestimenta =
    equipamento.tipo === 'ACESSORIO' && equipamento.tipoAcessorio === SUBTIPO_VESTIMENTA;

  return {
    valido: validacao.valido,
    podeVestir: true,
    erros: validacao.erros,
    info: {
      totalVestiveis: vestiveis,
      totalVestimentas: vestimentas,
      novoTotalVestiveis: vestiveis + quantidade,
      novoTotalVestimentas: vestimentas + (ehVestimenta ? quantidade : 0),
    },
  };
}

/* ============================================================================ */
/* HELPERS DE GRAU XAMÃ */
/* ============================================================================ */

export function contarItensPorCategoria(
  itens: ItemInventarioDto[],
  equipamentos: EquipamentoCatalogo[],
): Record<string, number> {
  const contagem: Record<string, number> = {
    '0': 0,
    '4': 0,
    '3': 0,
    '2': 0,
    '1': 0,
    ESPECIAL: 0,
  };

  itens.forEach((item) => {
    if (item.categoriaCalculada) {
      const cat = normalizarCategoria(item.categoriaCalculada);
      contagem[cat] = (contagem[cat] || 0) + item.quantidade;
      return;
    }

    if (item.equipamento) {
      const cat = normalizarCategoria(item.equipamento.categoria);
      contagem[cat] = (contagem[cat] || 0) + item.quantidade;
      return;
    }

    const equip = equipamentos.find((e) => e.id === item.equipamentoId);
    if (equip) {
      const cat = normalizarCategoria(equip.categoria);
      contagem[cat] = (contagem[cat] || 0) + item.quantidade;
    }
  });

  return contagem;
}

export function isCategoriaBloquada(
  categoria: string,
  itensPorCategoria: Record<string, number>,
  limitesPorCategoria: Record<string, number>,
): boolean {
  if (categoria === '0') return false;

  const atual = itensPorCategoria[categoria] || 0;
  const limite = limitesPorCategoria[categoria] ?? 0;

  return atual >= limite;
}

/* ============================================================================ */
/* HELPERS DE MODIFICAÇÕES */
/* ============================================================================ */

export function calcularIncrementoEspacosMods(
  modificacoes: Array<{ incrementoEspacos: number }>,
): number {
  return modificacoes.reduce(
    (total, mod) => total + (mod.incrementoEspacos || 0),
    0,
  );
}

export function formatarIncrementoEspacos(incremento: number): string {
  if (incremento === 0) return '0 esp.';
  if (incremento > 0) return `+${incremento} esp.`;
  return `${incremento} esp.`;
}

function verificarTipoCompativel(tipoMod: string, equipamento: EquipamentoCatalogo): boolean {
  const tipoEquip = equipamento.tipo;
  const tipoArma = equipamento.tipoArma;
  const subtipoDistancia = equipamento.subtipoDistancia;

  const tipoBase = detectarTipoBase(equipamento);

  switch (tipoMod) {
    case 'CORPO_A_CORPO_E_DISPARO':
      if (tipoBase === 'ARMA') {
        if (tipoArma === 'CORPO_A_CORPO') return true;
        if (tipoArma === 'A_DISTANCIA' && subtipoDistancia !== 'FOGO') return true;
        return false;
      }
      return false;

    case 'ARMA_FOGO':
      if (tipoBase === 'ARMA') {
        return subtipoDistancia === 'FOGO';
      }
      return false;

    case 'ARMA':
      return tipoBase === 'ARMA';

    case 'MUNICAO':
      return tipoEquip === 'MUNICAO';

    case 'PROTECAO':
      return tipoBase === 'PROTECAO';

    case 'ACESSORIO':
      return tipoEquip === 'ACESSORIO';

    case 'GERAL':
      return true;

    default:
      return false;
  }
}

export function filtrarModificacoesCompativeis(
  modificacoes: ModificacaoCatalogo[],
  equipamento: EquipamentoCatalogo | null | undefined,
): ModificacaoCatalogo[] {
  if (!Array.isArray(modificacoes) || modificacoes.length === 0) return [];
  if (!equipamento) return [];

  return modificacoes.filter((mod) => {
    const tipoCompativel = verificarTipoCompativel(mod.tipo, equipamento);
    if (!tipoCompativel) return false;

    if (mod.apenasAmaldicoadas) {
      const complexidadeEquip = equipamento.complexidadeMaldicao || 'NENHUMA';
      const isAmaldicoado = complexidadeEquip !== 'NENHUMA';
      if (!isAmaldicoado) return false;
    }

    if (mod.requerComplexidade && mod.requerComplexidade !== 'NENHUMA') {
      const ordemComplexidade: Record<string, number> = {
        NENHUMA: 0,
        SIMPLES: 1,
        COMPLEXA: 2,
      };

      const complexidadeEquip =
        ordemComplexidade[equipamento.complexidadeMaldicao || 'NENHUMA'] || 0;
      const complexidadeRequerida =
        ordemComplexidade[mod.requerComplexidade] || 0;

      if (complexidadeEquip < complexidadeRequerida) return false;
    }

    return true;
  });
}

/* ============================================================================ */
/* TIPOS AUXILIARES */
/* ============================================================================ */

export type CategoriaEquipamento =
  | 'ARMAS'
  | 'MUNICOES'
  | 'PROTECOES'
  | 'UTILITARIOS'
  | 'ARMAS_AMALDICOADAS_SIMPLES'
  | 'ARMAS_AMALDICOADAS_COMPLEXAS'
  | 'PROTECOES_AMALDICOADAS_SIMPLES'
  | 'PROTECOES_AMALDICOADAS_COMPLEXAS'
  | 'ITENS_AMALDICOADOS'
  | 'ARTEFATOS_AMALDICOADOS';
