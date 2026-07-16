export type AbaDetalheCard =
  | 'RESUMO'
  | 'FICHA'
  | 'ATRIBUTOS'
  | 'PERICIAS'
  | 'INVENTARIO'
  | 'MACROS'
  | 'TECNICAS'
  | 'SUSTENTACOES'
  | 'CONDICOES'
  | 'INSPIRACAO';

export type PreferenciasSessaoLobby = {
  abasDetalheCard: Record<number, AbaDetalheCard>;
  tecnicasInatasAbertas: Record<number, boolean>;
  tecnicasNaoInatasAbertas: Record<number, boolean>;
  macrosArmas: Record<string, PreferenciaMacroArmaSessao>;
};

export type PreferenciaMacroArmaSessao = {
  ajusteFlatManual: number;
  ajusteDadosManual: number;
  atributoEscolhido?: 'FOR' | 'AGI';
  empunhadura?: 'LEVE' | 'UMA_MAO' | 'DUAS_MAOS';
};

const PREFS_STORAGE_PREFIX = 'assistenterpg:sessao:lobby:preferencias:v1';
const ABAS_VALIDAS = new Set<AbaDetalheCard>([
  'RESUMO',
  'FICHA',
  'ATRIBUTOS',
  'PERICIAS',
  'INVENTARIO',
  'MACROS',
  'TECNICAS',
  'SUSTENTACOES',
  'CONDICOES',
  'INSPIRACAO',
]);

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function criarStorageKey(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): string {
  return `${PREFS_STORAGE_PREFIX}:${usuarioId}:${campanhaId}:${sessaoId}`;
}

function normalizarAbas(raw: unknown): Record<number, AbaDetalheCard> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const resultado: Record<number, AbaDetalheCard> = {};
  for (const [chave, valor] of Object.entries(raw as Record<string, unknown>)) {
    const personagemSessaoId = Number(chave);
    if (!Number.isInteger(personagemSessaoId) || personagemSessaoId < 1) continue;
    if (typeof valor !== 'string' || !ABAS_VALIDAS.has(valor as AbaDetalheCard)) {
      continue;
    }
    if (valor === 'RESUMO') continue;
    resultado[personagemSessaoId] = valor as AbaDetalheCard;
  }

  return resultado;
}

function normalizarTecnicasAbertas(
  raw: unknown,
): Record<number, boolean> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const resultado: Record<number, boolean> = {};
  for (const [chave, valor] of Object.entries(raw as Record<string, unknown>)) {
    const personagemSessaoId = Number(chave);
    if (!Number.isInteger(personagemSessaoId) || personagemSessaoId < 1) continue;
    if (typeof valor !== 'boolean') continue;
    resultado[personagemSessaoId] = valor;
  }

  return resultado;
}

function normalizarTecnicasSomenteAbertas(
  raw: unknown,
): Record<number, boolean> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const resultado: Record<number, boolean> = {};
  for (const [chave, valor] of Object.entries(raw as Record<string, unknown>)) {
    const personagemSessaoId = Number(chave);
    if (!Number.isInteger(personagemSessaoId) || personagemSessaoId < 1) continue;
    if (valor !== true) continue;
    resultado[personagemSessaoId] = true;
  }

  return resultado;
}

function normalizarPreferenciasMacrosArmas(
  raw: unknown,
): Record<string, PreferenciaMacroArmaSessao> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const resultado: Record<string, PreferenciaMacroArmaSessao> = {};
  for (const [chave, valor] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d+:\d+$/.test(chave) || !valor || typeof valor !== 'object' || Array.isArray(valor)) {
      continue;
    }
    const item = valor as Record<string, unknown>;
    const normalizarNumero = (entrada: unknown, limite: number) => {
      const numero = Number(entrada);
      return Number.isInteger(numero) ? Math.max(-limite, Math.min(limite, numero)) : 0;
    };
    const atributoEscolhido =
      item.atributoEscolhido === 'FOR' || item.atributoEscolhido === 'AGI'
        ? item.atributoEscolhido
        : undefined;
    const empunhadura =
      item.empunhadura === 'LEVE' ||
      item.empunhadura === 'UMA_MAO' ||
      item.empunhadura === 'DUAS_MAOS'
        ? item.empunhadura
        : undefined;
    resultado[chave] = {
      ajusteFlatManual: normalizarNumero(item.ajusteFlatManual, 100),
      ajusteDadosManual: normalizarNumero(item.ajusteDadosManual, 10),
      ...(atributoEscolhido ? { atributoEscolhido } : {}),
      ...(empunhadura ? { empunhadura } : {}),
    };
  }
  return resultado;
}

export function montarChavePreferenciaMacroArma(
  personagemSessaoId: number,
  itemInventarioCampanhaId: number,
): string {
  return `${personagemSessaoId}:${itemInventarioCampanhaId}`;
}

export function carregarPreferenciasSessao(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): PreferenciasSessaoLobby {
  if (typeof window === 'undefined') {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
    };
  }
  if (!ehInteiroPositivo(usuarioId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
    };
  }
  if (!ehInteiroPositivo(campanhaId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
    };
  }
  if (!ehInteiroPositivo(sessaoId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
    };
  }

  try {
    const raw = window.localStorage.getItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
    );
    if (!raw) {
      return {
        abasDetalheCard: {},
        tecnicasInatasAbertas: {},
        tecnicasNaoInatasAbertas: {},
        macrosArmas: {},
      };
    }
    const parsed = JSON.parse(raw) as Partial<PreferenciasSessaoLobby>;
    return {
      abasDetalheCard: normalizarAbas(parsed.abasDetalheCard),
      tecnicasInatasAbertas: normalizarTecnicasAbertas(parsed.tecnicasInatasAbertas),
      tecnicasNaoInatasAbertas: normalizarTecnicasSomenteAbertas(
        parsed.tecnicasNaoInatasAbertas,
      ),
      macrosArmas: normalizarPreferenciasMacrosArmas(parsed.macrosArmas),
    };
  } catch {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
      macrosArmas: {},
    };
  }
}

export function salvarPreferenciasSessao(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
  preferencias: PreferenciasSessaoLobby,
): void {
  if (typeof window === 'undefined') return;
  if (!ehInteiroPositivo(usuarioId)) return;
  if (!ehInteiroPositivo(campanhaId)) return;
  if (!ehInteiroPositivo(sessaoId)) return;

  try {
    const normalizado = {
      abasDetalheCard: normalizarAbas(preferencias.abasDetalheCard),
      tecnicasInatasAbertas: normalizarTecnicasAbertas(
        preferencias.tecnicasInatasAbertas,
      ),
      tecnicasNaoInatasAbertas: normalizarTecnicasSomenteAbertas(
        preferencias.tecnicasNaoInatasAbertas,
      ),
      macrosArmas: normalizarPreferenciasMacrosArmas(preferencias.macrosArmas),
    };

    const vazio =
      Object.keys(normalizado.abasDetalheCard).length === 0 &&
      Object.keys(normalizado.tecnicasInatasAbertas).length === 0 &&
      Object.keys(normalizado.tecnicasNaoInatasAbertas).length === 0 &&
      Object.keys(normalizado.macrosArmas).length === 0;

    if (vazio) {
      window.localStorage.removeItem(criarStorageKey(usuarioId, campanhaId, sessaoId));
      return;
    }

    window.localStorage.setItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
      JSON.stringify(normalizado),
    );
  } catch {
    // ignorar indisponibilidade de storage
  }
}
