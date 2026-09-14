export type RascunhoAnotacao = {
  editandoId: number | null;
  titulo: string;
  conteudo: string;
  campanhaId: string;
  sessaoId: string;
};

const VERSAO_RASCUNHO_ANOTACAO = 1;
const PREFIXO_RASCUNHO_ANOTACAO = 'assistenterpg:anotacoes:rascunho:v1';

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function normalizarRascunho(valor: unknown): RascunhoAnotacao | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
  const rascunho = valor as Record<string, unknown>;
  const editandoId = rascunho.editandoId;
  if (editandoId !== null && !ehInteiroPositivo(editandoId)) return null;
  if (
    !ehTexto(rascunho.titulo) ||
    !ehTexto(rascunho.conteudo) ||
    !ehTexto(rascunho.campanhaId) ||
    !ehTexto(rascunho.sessaoId)
  ) {
    return null;
  }

  return {
    editandoId,
    titulo: rascunho.titulo,
    conteudo: rascunho.conteudo,
    campanhaId: rascunho.campanhaId,
    sessaoId: rascunho.sessaoId,
  };
}

export function criarChaveRascunhoAnotacao(usuarioId: number): string | null {
  if (!ehInteiroPositivo(usuarioId)) return null;
  return `${PREFIXO_RASCUNHO_ANOTACAO}:${usuarioId}`;
}

export function rascunhosAnotacaoDiferem(
  anterior: RascunhoAnotacao | null,
  atual: RascunhoAnotacao,
): boolean {
  return (
    !anterior ||
    anterior.editandoId !== atual.editandoId ||
    anterior.titulo !== atual.titulo ||
    anterior.conteudo !== atual.conteudo ||
    anterior.campanhaId !== atual.campanhaId ||
    anterior.sessaoId !== atual.sessaoId
  );
}

export function carregarRascunhoAnotacao(usuarioId: number): RascunhoAnotacao | null {
  if (typeof window === 'undefined') return null;
  const chave = criarChaveRascunhoAnotacao(usuarioId);
  if (!chave) return null;

  try {
    const raw = window.localStorage.getItem(chave);
    if (!raw) return null;
    const armazenado = JSON.parse(raw) as unknown;
    if (
      !armazenado ||
      typeof armazenado !== 'object' ||
      Array.isArray(armazenado) ||
      (armazenado as Record<string, unknown>).versao !== VERSAO_RASCUNHO_ANOTACAO
    ) {
      return null;
    }
    return normalizarRascunho((armazenado as Record<string, unknown>).rascunho);
  } catch {
    return null;
  }
}

export function salvarRascunhoAnotacao(
  usuarioId: number,
  rascunho: RascunhoAnotacao,
): void {
  if (typeof window === 'undefined') return;
  const chave = criarChaveRascunhoAnotacao(usuarioId);
  if (!chave || !normalizarRascunho(rascunho)) return;

  try {
    window.localStorage.setItem(
      chave,
      JSON.stringify({ versao: VERSAO_RASCUNHO_ANOTACAO, rascunho }),
    );
  } catch {
    // O formulário continua funcional se o navegador bloquear storage.
  }
}

export function removerRascunhoAnotacao(usuarioId: number): void {
  if (typeof window === 'undefined') return;
  const chave = criarChaveRascunhoAnotacao(usuarioId);
  if (!chave) return;

  try {
    window.localStorage.removeItem(chave);
  } catch {
    // O rascunho poderá expirar naturalmente ao ser sobrescrito.
  }
}
