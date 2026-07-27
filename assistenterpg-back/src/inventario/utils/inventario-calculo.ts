import { CategoriaEquipamento, TipoEquipamento } from '@prisma/client';
import {
  CODIGO_MOD_FUNCAO_ADICIONAL,
  contarInstanciasFuncaoAdicional,
} from './item-personalizado';

export const MULTIPLICADOR_CAPACIDADE_INVENTARIO = 5;
export const CAPACIDADE_MINIMA_INVENTARIO = 2;

export type ModificadoresInventario = {
  somarIntelecto: boolean;
  espacosExtraHabilidades: number;
  reduzirItensLeves: boolean;
  reduzirCategoriaEm: number;
  reduzirCategoriaExcetoTipos: string[];
  creditoCategoriaBonus: number;
};

export type FormulaCapacidadeInventario = {
  forca: number;
  intelectoAplicado: number;
  atributoTotal: number;
  multiplicador: number;
  minimoAplicado: boolean;
};

export type CapacidadeInventarioCalculada = {
  base: number;
  extraHabilidades: number;
  extraItens: number;
  extra: number;
  total: number;
  ocupados: number;
  restantes: number;
  sobrecarregado: boolean;
  formula: FormulaCapacidadeInventario;
};

type ItemReducaoCategoria = {
  categoriaCalculada: string;
  espacosCalculados?: number;
  quantidade?: number;
  equipamento: {
    tipo: string;
    categoria: string;
    tipoArma?: string | null;
  };
};

export const ORDEM_CATEGORIAS_INVENTARIO: CategoriaEquipamento[] = [
  CategoriaEquipamento.CATEGORIA_0,
  CategoriaEquipamento.CATEGORIA_4,
  CategoriaEquipamento.CATEGORIA_3,
  CategoriaEquipamento.CATEGORIA_2,
  CategoriaEquipamento.CATEGORIA_1,
  CategoriaEquipamento.ESPECIAL,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRecord(
  value: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  if (!value) return null;
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

function getNumber(
  value: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!value) return null;
  const current = value[key];
  return typeof current === 'number' && Number.isFinite(current)
    ? current
    : null;
}

export function resolverModificadoresInventario(
  fontesMecanicas: unknown[],
): ModificadoresInventario {
  const modificadores: ModificadoresInventario = {
    somarIntelecto: false,
    espacosExtraHabilidades: 0,
    reduzirItensLeves: false,
    reduzirCategoriaEm: 0,
    reduzirCategoriaExcetoTipos: [],
    creditoCategoriaBonus: 0,
  };
  const tiposExcluidos = new Set<string>();

  fontesMecanicas.forEach((fonte) => {
    const mecanicas = isRecord(fonte) ? fonte : null;
    const inventario = getRecord(mecanicas, 'inventario');
    const itens = getRecord(mecanicas, 'itens');
    const economia = getRecord(mecanicas, 'economia');

    if (inventario?.somarIntelecto === true) {
      modificadores.somarIntelecto = true;
    }
    if (inventario?.reduzirItensLeves === true) {
      modificadores.reduzirItensLeves = true;
    }

    modificadores.espacosExtraHabilidades +=
      getNumber(inventario, 'espacosExtra') ?? 0;
    const creditoCategoriaBonus =
      getNumber(economia, 'creditoCategoriaBonus') ?? 0;
    if (creditoCategoriaBonus > 0) {
      modificadores.creditoCategoriaBonus += creditoCategoriaBonus;
    }

    const reduzirCategoriaEm = getNumber(itens, 'reduzCategoriaEm') ?? 0;
    modificadores.reduzirCategoriaEm = Math.max(
      modificadores.reduzirCategoriaEm,
      reduzirCategoriaEm,
    );

    const excetoTipos = itens?.excetoTipos;
    if (Array.isArray(excetoTipos)) {
      excetoTipos.forEach((tipo) => {
        if (typeof tipo === 'string' && tipo.trim()) {
          tiposExcluidos.add(tipo.trim().toUpperCase());
        }
      });
    }
  });

  modificadores.reduzirCategoriaExcetoTipos = Array.from(tiposExcluidos);
  return modificadores;
}

export function calcularCapacidadeInventario(params: {
  forca: number;
  intelecto?: number;
  modificadores?: Partial<ModificadoresInventario>;
  espacosExtraItens?: number;
  espacosOcupados?: number;
}): CapacidadeInventarioCalculada {
  const intelectoAplicado = params.modificadores?.somarIntelecto
    ? (params.intelecto ?? 0)
    : 0;
  const atributoTotal = params.forca + intelectoAplicado;
  const minimoAplicado = !Number.isFinite(atributoTotal) || atributoTotal <= 0;
  const base = minimoAplicado
    ? CAPACIDADE_MINIMA_INVENTARIO
    : atributoTotal * MULTIPLICADOR_CAPACIDADE_INVENTARIO;
  const extraHabilidades = params.modificadores?.espacosExtraHabilidades ?? 0;
  const extraItens = params.espacosExtraItens ?? 0;
  const extra = extraHabilidades + extraItens;
  const total = base + extra;
  const ocupados = params.espacosOcupados ?? 0;

  return {
    base,
    extraHabilidades,
    extraItens,
    extra,
    total,
    ocupados,
    restantes: total - ocupados,
    sobrecarregado: ocupados > total,
    formula: {
      forca: params.forca,
      intelectoAplicado,
      atributoTotal,
      multiplicador: MULTIPLICADOR_CAPACIDADE_INVENTARIO,
      minimoAplicado,
    },
  };
}

export function normalizarCategoriaInventario(
  valor: unknown,
): CategoriaEquipamento {
  if (
    typeof valor === 'string' &&
    ORDEM_CATEGORIAS_INVENTARIO.includes(valor as CategoriaEquipamento)
  ) {
    return valor as CategoriaEquipamento;
  }

  if (valor === 'ESPECIAL' || valor === 'CATEGORIA_ESPECIAL') {
    return CategoriaEquipamento.ESPECIAL;
  }

  if (typeof valor === 'string') {
    const match = valor.match(/CATEGORIA_(\d+)/i);
    if (match?.[1]) {
      const candidato = `CATEGORIA_${match[1]}` as CategoriaEquipamento;
      if (ORDEM_CATEGORIAS_INVENTARIO.includes(candidato)) return candidato;
    }
  }

  return CategoriaEquipamento.CATEGORIA_0;
}

export function calcularCategoriaInventario(
  categoriaOriginal: unknown,
  quantidadeModificacoes: number,
): CategoriaEquipamento {
  const categoria = normalizarCategoriaInventario(categoriaOriginal);
  const indiceOriginal = ORDEM_CATEGORIAS_INVENTARIO.indexOf(categoria);
  const indiceFinal = Math.min(
    Math.max(0, indiceOriginal + quantidadeModificacoes),
    ORDEM_CATEGORIAS_INVENTARIO.length - 1,
  );
  return ORDEM_CATEGORIAS_INVENTARIO[indiceFinal];
}

export function calcularQuantidadeModificacoesEfetivas(params: {
  modificacoes: Array<{ codigo: string | null | undefined }>;
  estado?: unknown;
}): number {
  const totalBase = params.modificacoes.length;
  const possuiFuncaoAdicional = params.modificacoes.some(
    (modificacao) => modificacao.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
  );
  if (!possuiFuncaoAdicional) return totalBase;

  return (
    totalBase + Math.max(0, contarInstanciasFuncaoAdicional(params.estado) - 1)
  );
}

export function calcularEspacoUnitarioInventario(params: {
  espacosBase: number;
  incrementosModificacoes?: number[];
  reduzirItensLeves?: boolean;
}): number {
  const espacosBase =
    params.reduzirItensLeves &&
    params.espacosBase > 0 &&
    params.espacosBase <= 0.5
      ? params.espacosBase / 2
      : params.espacosBase;
  const incremento = (params.incrementosModificacoes ?? []).reduce(
    (total, valor) => total + valor,
    0,
  );
  return Math.max(0, espacosBase + incremento);
}

export function calcularEspacosExtraItensInventario(
  itens: Array<{
    quantidade: number;
    equipamento: { espacos: number; efeito?: string | null };
  }>,
): number {
  const palavrasChave = [
    'aumenta capacidade',
    'aumenta sua capacidade',
    'capacidade de carga',
    'espaços de inventário',
    'espaços extras',
    'espaços adicionais',
  ];

  return itens.reduce((total, item) => {
    const efeito = item.equipamento.efeito;
    if (item.equipamento.espacos !== 0 || !efeito) return total;

    const efeitoNormalizado = efeito.toLowerCase();
    if (!palavrasChave.some((palavra) => efeitoNormalizado.includes(palavra))) {
      return total;
    }

    const match = efeito.match(/(\d+)\s*espaço/i);
    if (!match) return total;

    return total + Number.parseInt(match[1], 10) * item.quantidade;
  }, 0);
}

function itemElegivelParaReducao(
  item: ItemReducaoCategoria,
  excetoTipos: Set<string>,
): boolean {
  const tipo = String(item.equipamento.tipo).toUpperCase();
  if (excetoTipos.has(tipo)) return false;

  if (excetoTipos.has('ARMA')) {
    if (tipo === String(TipoEquipamento.ARMA)) return false;
    if (item.equipamento.tipoArma) return false;
  }

  return true;
}

export function aplicarReducaoCategoriaDeterministica<
  T extends ItemReducaoCategoria,
>(itens: T[], reduzirCategoriaEm: number, excetoTipos: string[]): T[] {
  if (!reduzirCategoriaEm || reduzirCategoriaEm <= 0) return itens;

  const excetoSet = new Set(excetoTipos.map((tipo) => tipo.toUpperCase()));
  let indiceEscolhido: number | null = null;
  let melhorCategoria = -1;
  let melhorQuantidade = -1;
  let melhorEspaco = -1;

  itens.forEach((item, indice) => {
    if (!itemElegivelParaReducao(item, excetoSet)) return;

    const categoria = normalizarCategoriaInventario(item.categoriaCalculada);
    const indiceCategoria = ORDEM_CATEGORIAS_INVENTARIO.indexOf(categoria);
    if (indiceCategoria <= 0) return;

    const quantidade = item.quantidade ?? 1;
    const espaco = item.espacosCalculados ?? 0;
    if (
      indiceCategoria > melhorCategoria ||
      (indiceCategoria === melhorCategoria && quantidade > melhorQuantidade) ||
      (indiceCategoria === melhorCategoria &&
        quantidade === melhorQuantidade &&
        espaco > melhorEspaco)
    ) {
      indiceEscolhido = indice;
      melhorCategoria = indiceCategoria;
      melhorQuantidade = quantidade;
      melhorEspaco = espaco;
    }
  });

  if (indiceEscolhido === null) return itens;

  const escolhido = itens[indiceEscolhido];
  const categoriaAtual = normalizarCategoriaInventario(
    escolhido.categoriaCalculada,
  );
  const indiceAtual = ORDEM_CATEGORIAS_INVENTARIO.indexOf(categoriaAtual);
  const categoriaCalculada =
    ORDEM_CATEGORIAS_INVENTARIO[Math.max(0, indiceAtual - reduzirCategoriaEm)];

  return itens.map((item, indice) =>
    indice === indiceEscolhido ? { ...item, categoriaCalculada } : item,
  );
}
