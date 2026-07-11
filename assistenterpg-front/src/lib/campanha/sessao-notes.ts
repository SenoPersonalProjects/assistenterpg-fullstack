import type { AnotacaoResumo } from '@/lib/types';

export function filtrarAnotacoesGeraisCampanha(
  notas: AnotacaoResumo[],
): AnotacaoResumo[] {
  return notas.filter((nota) => !nota.sessao);
}
