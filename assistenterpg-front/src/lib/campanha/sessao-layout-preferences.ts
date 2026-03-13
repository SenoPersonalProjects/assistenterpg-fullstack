export type SessaoLayoutRightTab = 'chat' | 'eventos' | 'participantes';

export type SessaoLayoutPreferencias = {
  colunaEsquerdaRecolhida: boolean;
  colunaDireitaRecolhida: boolean;
  abaDireitaAtiva: SessaoLayoutRightTab;
};

const SESSAO_LAYOUT_STORAGE_PREFIX = 'assistenterpg:sessao:lobby:layout:v1';

const PREFERENCIAS_PADRAO: SessaoLayoutPreferencias = {
  colunaEsquerdaRecolhida: false,
  colunaDireitaRecolhida: false,
  abaDireitaAtiva: 'chat',
};

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function ehAbaDireitaValida(valor: unknown): valor is SessaoLayoutRightTab {
  return valor === 'chat' || valor === 'eventos' || valor === 'participantes';
}

function criarStorageKey(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): string {
  return `${SESSAO_LAYOUT_STORAGE_PREFIX}:${usuarioId}:${campanhaId}:${sessaoId}`;
}

function normalizarPreferencias(raw: unknown): SessaoLayoutPreferencias {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...PREFERENCIAS_PADRAO };
  }

  const value = raw as Partial<SessaoLayoutPreferencias>;

  return {
    colunaEsquerdaRecolhida:
      typeof value.colunaEsquerdaRecolhida === 'boolean'
        ? value.colunaEsquerdaRecolhida
        : PREFERENCIAS_PADRAO.colunaEsquerdaRecolhida,
    colunaDireitaRecolhida:
      typeof value.colunaDireitaRecolhida === 'boolean'
        ? value.colunaDireitaRecolhida
        : PREFERENCIAS_PADRAO.colunaDireitaRecolhida,
    abaDireitaAtiva: ehAbaDireitaValida(value.abaDireitaAtiva)
      ? value.abaDireitaAtiva
      : PREFERENCIAS_PADRAO.abaDireitaAtiva,
  };
}

export function carregarLayoutSessaoLobby(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): SessaoLayoutPreferencias {
  if (typeof window === 'undefined') return { ...PREFERENCIAS_PADRAO };
  if (!ehInteiroPositivo(usuarioId)) return { ...PREFERENCIAS_PADRAO };
  if (!ehInteiroPositivo(campanhaId)) return { ...PREFERENCIAS_PADRAO };
  if (!ehInteiroPositivo(sessaoId)) return { ...PREFERENCIAS_PADRAO };

  try {
    const raw = window.localStorage.getItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
    );
    if (!raw) return { ...PREFERENCIAS_PADRAO };
    return normalizarPreferencias(JSON.parse(raw));
  } catch {
    return { ...PREFERENCIAS_PADRAO };
  }
}

export function salvarLayoutSessaoLobby(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
  preferencias: SessaoLayoutPreferencias,
): void {
  if (typeof window === 'undefined') return;
  if (!ehInteiroPositivo(usuarioId)) return;
  if (!ehInteiroPositivo(campanhaId)) return;
  if (!ehInteiroPositivo(sessaoId)) return;

  try {
    const normalizado = normalizarPreferencias(preferencias);
    window.localStorage.setItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
      JSON.stringify(normalizado),
    );
  } catch {
    // ignore storage errors
  }
}

