import type { Prisma } from '@prisma/client';
type ModArma = { modificacao: { efeitosMecanicos: Prisma.JsonValue | null } };
export const SABRE_DO_PRODIGIO = 'SABRE_DO_PRODIGIO';
export function resolverEfeitosArma(entrada: {
  habilidadeEspecial?: string | null;
  criticoValor?: number | null;
  modificacoes?: ModArma[];
  origemNome?: string;
  forca: number;
}) {
  let bonusAtaque = 0,
    bonusDano = 0,
    margem = 0;
  for (const mod of entrada.modificacoes ?? []) {
    const efeito = mod.modificacao.efeitosMecanicos as Record<
      string,
      unknown
    > | null;
    if (!efeito || Array.isArray(efeito)) continue;
    if (typeof efeito.bonusAtaque === 'number')
      bonusAtaque += efeito.bonusAtaque;
    if (typeof efeito.bonusDano === 'number') bonusDano += efeito.bonusDano;
    if (typeof efeito.margemAmeacaAdicional === 'number')
      margem += efeito.margemAmeacaAdicional;
  }
  const sabre = entrada.habilidadeEspecial === SABRE_DO_PRODIGIO;
  return {
    bonusAtaque,
    bonusDano: bonusDano + (sabre ? entrada.forca : 0),
    bonusDados: sabre && entrada.origemNome === 'Prodígio do Clã' ? 1 : 0,
    criticoValor:
      entrada.criticoValor == null
        ? null
        : Math.max(2, entrada.criticoValor - margem),
  };
}
