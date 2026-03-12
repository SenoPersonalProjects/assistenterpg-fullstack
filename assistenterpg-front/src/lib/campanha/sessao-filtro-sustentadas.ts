export type FiltroSustentadasPorCard = Record<number, boolean>;

const FILTRO_SUSTENTADAS_STORAGE_PREFIX = 'assistenterpg:sessao:lobby:sustentadas:v1';

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function criarStorageKey(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): string {
  return `${FILTRO_SUSTENTADAS_STORAGE_PREFIX}:${usuarioId}:${campanhaId}:${sessaoId}`;
}

function normalizarFiltro(raw: unknown): FiltroSustentadasPorCard {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const resultado: FiltroSustentadasPorCard = {};
  for (const [chave, valor] of Object.entries(raw as Record<string, unknown>)) {
    const personagemSessaoId = Number(chave);
    if (!Number.isInteger(personagemSessaoId) || personagemSessaoId < 1) continue;
    if (typeof valor !== 'boolean') continue;
    if (!valor) continue;
    resultado[personagemSessaoId] = true;
  }

  return resultado;
}

export function carregarFiltroSustentadasLobby(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
): FiltroSustentadasPorCard {
  if (typeof window === 'undefined') return {};
  if (!ehInteiroPositivo(usuarioId)) return {};
  if (!ehInteiroPositivo(campanhaId)) return {};
  if (!ehInteiroPositivo(sessaoId)) return {};

  try {
    const raw = window.localStorage.getItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
    );
    if (!raw) return {};
    return normalizarFiltro(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function salvarFiltroSustentadasLobby(
  usuarioId: number,
  campanhaId: number,
  sessaoId: number,
  filtro: FiltroSustentadasPorCard,
): void {
  if (typeof window === 'undefined') return;
  if (!ehInteiroPositivo(usuarioId)) return;
  if (!ehInteiroPositivo(campanhaId)) return;
  if (!ehInteiroPositivo(sessaoId)) return;

  try {
    const normalizado = normalizarFiltro(filtro);
    window.localStorage.setItem(
      criarStorageKey(usuarioId, campanhaId, sessaoId),
      JSON.stringify(normalizado),
    );
  } catch {
    // ignorar indisponibilidade de storage
  }
}

