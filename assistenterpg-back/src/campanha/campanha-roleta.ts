import { randomInt } from 'node:crypto';
import type {
  CampanhaRoletaModo,
  CampanhaRoletaSlot,
  Prisma,
} from '@prisma/client';

export const CAMPANHA_ROLETA_CONFIG_VERSAO = 1;
export const CAMPANHA_ROLETA_LIMITES = {
  nomeManual: 80,
  listaManual: 10_000,
  ocorrenciasManuais: 200,
  resultadosDistintos: 1_000,
  pesoTotal: 2_000,
  historicoPadrao: 20,
  historicoMaximo: 100,
} as const;

export const CAMPANHA_ROLETA_SLOTS: CampanhaRoletaSlot[] = [
  'CLA',
  'TECNICA',
  'CUSTOMIZADO',
];

export type CampanhaRoletaFontesV1 = {
  sistemaBase: boolean;
  suplementoIds: number[];
  homebrewIds: number[];
};

export type CampanhaRoletaCompatibilidadeV1 = {
  tecnicaChave: string;
  claChaves: string[];
};

export type CampanhaRoletaConfigV1 = {
  fontes: CampanhaRoletaFontesV1;
  exclusoes: string[];
  inclusoesCatalogo: string[];
  listaManualTexto: string;
  compatibilidadesHereditarias: CampanhaRoletaCompatibilidadeV1[];
};

export type CampanhaRoletaCatalogoItem = {
  chave: string;
  nome: string;
  categoria: 'CLA' | 'TECNICA' | 'MANUAL';
  fonte: 'SISTEMA_BASE' | 'SUPLEMENTO' | 'HOMEBREW' | 'MANUAL';
  fonteId?: number;
  hereditaria?: boolean;
  claCompativeisChaves?: string[];
};

export function filtrarCatalogoRoletaPorFontes(
  catalogo: CampanhaRoletaCatalogoItem[],
  config: CampanhaRoletaConfigV1,
): CampanhaRoletaCatalogoItem[] {
  const suplementos = new Set(config.fontes.suplementoIds);
  const homebrews = new Set(config.fontes.homebrewIds);
  return catalogo.filter(
    (item) =>
      (item.fonte === 'SISTEMA_BASE' && config.fontes.sistemaBase) ||
      (item.fonte === 'SUPLEMENTO' &&
        item.fonteId !== undefined &&
        suplementos.has(item.fonteId)) ||
      (item.fonte === 'HOMEBREW' &&
        item.fonteId !== undefined &&
        homebrews.has(item.fonteId)),
  );
}

export type CampanhaRoletaPoolItem = CampanhaRoletaCatalogoItem & {
  ocorrencias: number;
  pesoUnitario: number;
  pesoTotal: number;
  incluidoManualmente: boolean;
};

export type CampanhaRoletaPoolSnapshot = {
  modo: CampanhaRoletaModo;
  claSelecionadoChave: string | null;
  claDuplicadoChave: string | null;
  itens: CampanhaRoletaPoolItem[];
  quantidadeResultados: number;
  pesoTotal: number;
};

export function criarConfigPadraoRoleta(
  slot: CampanhaRoletaSlot,
): CampanhaRoletaConfigV1 {
  return {
    fontes: {
      sistemaBase: slot !== 'CUSTOMIZADO',
      suplementoIds: [],
      homebrewIds: [],
    },
    exclusoes: [],
    inclusoesCatalogo: [],
    listaManualTexto: '',
    compatibilidadesHereditarias: [],
  };
}

export function modoPadraoRoleta(slot: CampanhaRoletaSlot): CampanhaRoletaModo {
  if (slot === 'CLA') return 'CLA';
  if (slot === 'TECNICA') return 'TECNICA';
  return 'SIMPLES';
}

export function criarPresetsPadraoRoleta(usuarioId?: number) {
  return CAMPANHA_ROLETA_SLOTS.map((slot) => ({
    slot,
    modo: modoPadraoRoleta(slot),
    configVersao: CAMPANHA_ROLETA_CONFIG_VERSAO,
    config: criarConfigPadraoRoleta(slot) as unknown as Prisma.InputJsonValue,
    criadoPorId: usuarioId,
    atualizadoPorId: usuarioId,
  }));
}

export function normalizarChaveRoleta(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function idsUnicos(valor: unknown): number[] {
  if (!Array.isArray(valor)) return [];
  return [
    ...new Set(
      valor.filter((id): id is number => Number.isInteger(id) && id > 0),
    ),
  ];
}

function stringsUnicas(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return [
    ...new Set(
      valor
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function normalizarConfigRoleta(valor: unknown): CampanhaRoletaConfigV1 {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new Error('config deve ser um objeto');
  }
  const entrada = valor as Record<string, unknown>;
  const fontesEntrada =
    entrada.fontes && typeof entrada.fontes === 'object'
      ? (entrada.fontes as Record<string, unknown>)
      : {};
  const listaManualTexto =
    typeof entrada.listaManualTexto === 'string'
      ? entrada.listaManualTexto.trim()
      : '';
  if (listaManualTexto.length > CAMPANHA_ROLETA_LIMITES.listaManual) {
    throw new Error('lista manual excede 10000 caracteres');
  }
  const compatibilidadesEntrada = Array.isArray(
    entrada.compatibilidadesHereditarias,
  )
    ? entrada.compatibilidadesHereditarias
    : [];
  const compatibilidadesHereditarias = compatibilidadesEntrada
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === 'object' && !Array.isArray(item),
    )
    .map((item) => ({
      tecnicaChave:
        typeof item.tecnicaChave === 'string' ? item.tecnicaChave.trim() : '',
      claChaves: stringsUnicas(item.claChaves),
    }))
    .filter((item) => item.tecnicaChave && item.claChaves.length > 0);

  return {
    fontes: {
      sistemaBase: fontesEntrada.sistemaBase === true,
      suplementoIds: idsUnicos(fontesEntrada.suplementoIds),
      homebrewIds: idsUnicos(fontesEntrada.homebrewIds),
    },
    exclusoes: stringsUnicas(entrada.exclusoes),
    inclusoesCatalogo: stringsUnicas(entrada.inclusoesCatalogo),
    listaManualTexto,
    compatibilidadesHereditarias,
  };
}

export function agruparListaManual(texto: string): CampanhaRoletaPoolItem[] {
  const ocorrencias = texto
    .split(';')
    .map((nome) => nome.trim())
    .filter(Boolean);
  if (ocorrencias.length > CAMPANHA_ROLETA_LIMITES.ocorrenciasManuais) {
    throw new Error('lista manual excede 200 ocorrencias');
  }
  const agrupados = new Map<string, { nome: string; quantidade: number }>();
  for (const nome of ocorrencias) {
    if (nome.length > CAMPANHA_ROLETA_LIMITES.nomeManual) {
      throw new Error(`item manual excede 80 caracteres: ${nome.slice(0, 20)}`);
    }
    const chaveNormalizada = normalizarChaveRoleta(nome);
    if (!chaveNormalizada) throw new Error('item manual invalido');
    const chave = `MANUAL:${chaveNormalizada}`;
    const atual = agrupados.get(chave);
    agrupados.set(chave, {
      nome: atual?.nome ?? nome,
      quantidade: (atual?.quantidade ?? 0) + 1,
    });
  }
  return [...agrupados.entries()].map(([chave, item]) => ({
    chave,
    nome: item.nome,
    categoria: 'MANUAL',
    fonte: 'MANUAL',
    ocorrencias: item.quantidade,
    pesoUnitario: 1,
    pesoTotal: item.quantidade,
    incluidoManualmente: true,
  }));
}

export function montarPoolRoleta(params: {
  modo: CampanhaRoletaModo;
  config: CampanhaRoletaConfigV1;
  catalogo: CampanhaRoletaCatalogoItem[];
  claSelecionadoChave?: string;
  claDuplicadoChave?: string;
}): CampanhaRoletaPoolSnapshot {
  const exclusoes = new Set(params.config.exclusoes);
  const inclusoes = new Set(params.config.inclusoesCatalogo);
  const compatibilidades = new Map(
    params.config.compatibilidadesHereditarias.map((item) => [
      item.tecnicaChave,
      new Set(item.claChaves),
    ]),
  );
  const itens: CampanhaRoletaPoolItem[] = [];
  for (const item of params.catalogo) {
    if (exclusoes.has(item.chave)) continue;
    const incluidoManualmente = inclusoes.has(item.chave);
    if (params.modo === 'CLA' && item.categoria !== 'CLA') continue;
    if (params.modo === 'TECNICA' && item.categoria !== 'TECNICA') continue;
    if (params.modo === 'SIMPLES' && !incluidoManualmente) continue;

    let pesoUnitario = 1;
    if (params.modo === 'TECNICA' && item.hereditaria) {
      const compativeis = new Set([
        ...(item.claCompativeisChaves ?? []),
        ...(compatibilidades.get(item.chave) ?? []),
      ]);
      if (
        params.claSelecionadoChave &&
        compativeis.has(params.claSelecionadoChave)
      ) {
        pesoUnitario = 2;
      } else if (!incluidoManualmente) {
        continue;
      }
    }
    const ocorrencias =
      params.modo === 'CLA' && params.claDuplicadoChave === item.chave ? 2 : 1;
    itens.push({
      ...item,
      ocorrencias,
      pesoUnitario,
      pesoTotal: ocorrencias * pesoUnitario,
      incluidoManualmente,
    });
  }

  itens.push(...agruparListaManual(params.config.listaManualTexto));
  const agregados = new Map<string, CampanhaRoletaPoolItem>();
  for (const item of itens) {
    const existente = agregados.get(item.chave);
    if (!existente) {
      agregados.set(item.chave, item);
      continue;
    }
    existente.ocorrencias += item.ocorrencias;
    existente.pesoTotal += item.pesoTotal;
    existente.incluidoManualmente ||= item.incluidoManualmente;
  }
  const finais = [...agregados.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );
  const pesoTotal = finais.reduce((total, item) => total + item.pesoTotal, 0);
  if (finais.length === 0) throw new Error('o pool resolvido esta vazio');
  if (finais.length > CAMPANHA_ROLETA_LIMITES.resultadosDistintos) {
    throw new Error('pool excede 1000 resultados distintos');
  }
  if (pesoTotal > CAMPANHA_ROLETA_LIMITES.pesoTotal) {
    throw new Error('pool excede peso total 2000');
  }
  return {
    modo: params.modo,
    claSelecionadoChave: params.claSelecionadoChave ?? null,
    claDuplicadoChave: params.claDuplicadoChave ?? null,
    itens: finais,
    quantidadeResultados: finais.length,
    pesoTotal,
  };
}

export function sortearItemRoleta(
  pool: CampanhaRoletaPoolSnapshot,
  excluirChave?: string,
  gerarInteiro: (maximoExclusivo: number) => number = randomInt,
): CampanhaRoletaPoolItem {
  const itens = excluirChave
    ? pool.itens.filter((item) => item.chave !== excluirChave)
    : pool.itens;
  const pesoTotal = itens.reduce((total, item) => total + item.pesoTotal, 0);
  if (pesoTotal <= 0) throw new Error('nao ha resultado elegivel para o giro');
  let cursor = gerarInteiro(pesoTotal);
  for (const item of itens) {
    if (cursor < item.pesoTotal) return item;
    cursor -= item.pesoTotal;
  }
  throw new Error('falha ao resolver resultado da roleta');
}
