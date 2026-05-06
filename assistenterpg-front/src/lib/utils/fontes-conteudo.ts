import { TipoFonte } from '@/lib/types';

export type FontesConteudoSelecionadas = {
  suplementoIds: number[];
  homebrewIds: number[];
  homebrewGrupoIds: number[];
};

const FONTES_CONTEUDO_STORAGE_PREFIX = 'assistenterpg:personagem-base:fontes:v1';

export const FONTES_CONTEUDO_INICIAIS: FontesConteudoSelecionadas = {
  suplementoIds: [],
  homebrewIds: [],
  homebrewGrupoIds: [],
};

type ItemComFonte = {
  fonte?: TipoFonte | null;
  suplementoId?: number | null;
  homebrewId?: number | null;
  homebrewOrigemId?: number | null;
  [key: string]: unknown;
};

function toOptionalPositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

function normalizarIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  const parsed = ids
    .map((id) => toOptionalPositiveInt(id))
    .filter((id): id is number => id !== null);
  return [...new Set(parsed)].sort((a, b) => a - b);
}

function extrairFonte(item: ItemComFonte): TipoFonte {
  const fonte = item.fonte;

  if (
    fonte === TipoFonte.SISTEMA_BASE ||
    fonte === TipoFonte.SUPLEMENTO ||
    fonte === TipoFonte.HOMEBREW
  ) {
    return fonte;
  }

  return TipoFonte.SISTEMA_BASE;
}

function extrairHomebrewId(item: ItemComFonte): number | null {
  const idDireto = toOptionalPositiveInt(item.homebrewId);
  if (idDireto !== null) return idDireto;

  const origemId = toOptionalPositiveInt(item.homebrewOrigemId);
  if (origemId !== null) return origemId;

  const fonteRefId = toOptionalPositiveInt((item as { fonteRefId?: unknown }).fonteRefId);
  if (fonteRefId !== null) return fonteRefId;

  const homebrew = (item as { homebrew?: unknown }).homebrew;
  if (typeof homebrew === 'object' && homebrew !== null) {
    const homebrewId = toOptionalPositiveInt((homebrew as { id?: unknown }).id);
    if (homebrewId !== null) return homebrewId;
  }

  return null;
}

export function normalizarFontesConteudoSelecionadas(
  fontes: Partial<FontesConteudoSelecionadas> | FontesConteudoSelecionadas,
): FontesConteudoSelecionadas {
  return {
    suplementoIds: normalizarIds(fontes.suplementoIds),
    homebrewIds: normalizarIds(fontes.homebrewIds),
    homebrewGrupoIds: normalizarIds(fontes.homebrewGrupoIds),
  };
}

export function itemPertenceAsFontesSelecionadas(
  item: ItemComFonte,
  fontes: Partial<FontesConteudoSelecionadas> | FontesConteudoSelecionadas,
): boolean {
  const selecao = normalizarFontesConteudoSelecionadas(fontes);
  const fonte = extrairFonte(item);

  if (fonte === TipoFonte.SISTEMA_BASE) return true;

  if (fonte === TipoFonte.SUPLEMENTO) {
    const suplementoId = toOptionalPositiveInt(item.suplementoId);
    return suplementoId !== null && selecao.suplementoIds.includes(suplementoId);
  }

  if (fonte === TipoFonte.HOMEBREW) {
    if (selecao.homebrewIds.length === 0) return false;

    const homebrewId = extrairHomebrewId(item);

    if (homebrewId === null) return false;

    return selecao.homebrewIds.includes(homebrewId);
  }

  return true;
}

export function filtrarListaPorFontes<T extends ItemComFonte>(
  lista: T[],
  fontes: Partial<FontesConteudoSelecionadas> | FontesConteudoSelecionadas,
): T[] {
  return lista.filter((item) => itemPertenceAsFontesSelecionadas(item, fontes));
}

export function criarChaveFontesConteudo(
  fontes: Partial<FontesConteudoSelecionadas> | FontesConteudoSelecionadas,
): string {
  const selecao = normalizarFontesConteudoSelecionadas(fontes);
  return JSON.stringify(selecao);
}

function criarStorageKey(usuarioId: number): string {
  return `${FONTES_CONTEUDO_STORAGE_PREFIX}:${usuarioId}`;
}

export function carregarFontesConteudoSalvas(
  usuarioId: number,
): FontesConteudoSelecionadas | null {
  if (typeof window === 'undefined') return null;
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) return null;

  try {
    const raw = window.localStorage.getItem(criarStorageKey(usuarioId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<FontesConteudoSelecionadas> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    return normalizarFontesConteudoSelecionadas(parsed);
  } catch {
    return null;
  }
}

export function salvarFontesConteudo(
  usuarioId: number,
  fontes: Partial<FontesConteudoSelecionadas> | FontesConteudoSelecionadas,
): void {
  if (typeof window === 'undefined') return;
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) return;

  const selecao = normalizarFontesConteudoSelecionadas(fontes);

  try {
    window.localStorage.setItem(criarStorageKey(usuarioId), JSON.stringify(selecao));
  } catch {
    // Ignora falhas de persistencia local (quota/privacidade do navegador).
  }
}

export function limparFontesConteudoSalvas(usuarioId: number): void {
  if (typeof window === 'undefined') return;
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) return;

  try {
    window.localStorage.removeItem(criarStorageKey(usuarioId));
  } catch {
    // noop
  }
}

