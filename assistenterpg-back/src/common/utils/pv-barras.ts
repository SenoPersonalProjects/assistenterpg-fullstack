// src/common/utils/pv-barras.ts

export type NucleoAmaldicoadoCodigo = 'EQUILIBRIO' | 'PODER' | 'IMPULSO';

export function normalizarPvBarrasTotal(value?: number | null): number {
  if (!Number.isFinite(value)) return 1;
  const inteiro = Math.trunc(value as number);
  return inteiro >= 2 ? inteiro : 1;
}

export function calcularPvBarraMaximos(
  pvMax: number,
  pvBarrasTotal: number,
  pvBarrasRestantes?: number | null,
) {
  const total = normalizarPvBarrasTotal(pvBarrasTotal);
  const maxSeguro = Math.max(1, Math.trunc(pvMax));
  const base = Math.max(1, Math.trunc(maxSeguro / total));
  const ultima = Math.max(1, maxSeguro - base * (total - 1));
  const restantes =
    pvBarrasRestantes && pvBarrasRestantes >= 1
      ? Math.min(pvBarrasRestantes, total)
      : total;
  const atual = restantes === 1 ? ultima : base;
  return {
    pvBarraMaxBase: base,
    pvBarraMaxUltima: ultima,
    pvBarraMaxAtual: atual,
    pvBarrasTotal: total,
    pvBarrasRestantes: restantes,
  };
}

export function nucleosPadrao(): NucleoAmaldicoadoCodigo[] {
  return ['EQUILIBRIO', 'PODER', 'IMPULSO'];
}

export function normalizarNucleosDisponiveis(
  value?: unknown,
): NucleoAmaldicoadoCodigo[] {
  if (Array.isArray(value)) {
    const filtrados = value.filter(
      (v) => v === 'EQUILIBRIO' || v === 'PODER' || v === 'IMPULSO',
    ) as NucleoAmaldicoadoCodigo[];
    if (filtrados.length > 0) return Array.from(new Set(filtrados));
  }
  return nucleosPadrao();
}
