function ehObjetoJson(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

export function jsonSemanticamenteIgual(
  esquerda: unknown,
  direita: unknown,
): boolean {
  if (esquerda === direita) return true;
  if (typeof esquerda !== typeof direita) return false;
  if (esquerda === null || direita === null) return false;

  if (Array.isArray(esquerda) || Array.isArray(direita)) {
    if (!Array.isArray(esquerda) || !Array.isArray(direita)) return false;
    if (esquerda.length !== direita.length) return false;
    return esquerda.every((item, indice) =>
      jsonSemanticamenteIgual(item, direita[indice]),
    );
  }

  if (!ehObjetoJson(esquerda) || !ehObjetoJson(direita)) return false;

  const chavesEsquerda = Object.keys(esquerda);
  const chavesDireita = Object.keys(direita);
  if (chavesEsquerda.length !== chavesDireita.length) return false;

  return chavesEsquerda.every(
    (chave) =>
      Object.prototype.hasOwnProperty.call(direita, chave) &&
      jsonSemanticamenteIgual(esquerda[chave], direita[chave]),
  );
}
