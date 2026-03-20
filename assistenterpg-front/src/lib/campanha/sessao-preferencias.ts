export type AbaDetalheCard =
  | 'RESUMO'
  | 'ATRIBUTOS'
  | 'PERICIAS'
  | 'TECNICAS'
  | 'SUSTENTACOES'
  | 'CONDICOES';

export type PreferenciasSessaoLobby = {
  abasDetalheCard: Record<number, AbaDetalheCard>;
  tecnicasInatasAbertas: Record<number, boolean>;
  tecnicasNaoInatasAbertas: Record<number, boolean>;
};

const PREFS_STORAGE_PREFIX = 'assistenterpg:sessao:lobby:preferencias:v1';
const ABAS_VALIDAS = new Set<AbaDetalheCard>([
  'RESUMO',
  'ATRIBUTOS',
  'PERICIAS',
  'TECNICAS',
  'SUSTENTACOES',
  'CONDICOES',
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
    };
  }
  if (!ehInteiroPositivo(usuarioId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
    };
  }
  if (!ehInteiroPositivo(campanhaId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
    };
  }
  if (!ehInteiroPositivo(sessaoId)) {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
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
      };
    }
    const parsed = JSON.parse(raw) as Partial<PreferenciasSessaoLobby>;
    return {
      abasDetalheCard: normalizarAbas(parsed.abasDetalheCard),
      tecnicasInatasAbertas: normalizarTecnicasAbertas(parsed.tecnicasInatasAbertas),
      tecnicasNaoInatasAbertas: normalizarTecnicasSomenteAbertas(
        parsed.tecnicasNaoInatasAbertas,
      ),
    };
  } catch {
    return {
      abasDetalheCard: {},
      tecnicasInatasAbertas: {},
      tecnicasNaoInatasAbertas: {},
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
    };

    const vazio =
      Object.keys(normalizado.abasDetalheCard).length === 0 &&
      Object.keys(normalizado.tecnicasInatasAbertas).length === 0 &&
      Object.keys(normalizado.tecnicasNaoInatasAbertas).length === 0;

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
