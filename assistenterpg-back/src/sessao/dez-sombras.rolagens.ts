import { parseDiceInputServidor } from './sessao-dice-autoritativo';

/** A ficha preserva cada tipo de dano; a rolagem soma os grupos de dados. */
export function parseDanoSombras(dano: string) {
  const grupos = [...dano.matchAll(/(\d+d\d+)\s*([+-]\s*\d+(?!\d|d))?/gi)];
  if (!grupos.length) return null;
  const flat = grupos.reduce(
    (total, g) => total + Number((g[2] ?? '0').replace(/\s/g, '')),
    0,
  );
  const texto =
    grupos.map((g) => g[1]).join('+') +
    (flat ? `${flat < 0 ? '' : '+'}${flat}` : '');
  return parseDiceInputServidor(texto).expressions?.[0] ?? null;
}
