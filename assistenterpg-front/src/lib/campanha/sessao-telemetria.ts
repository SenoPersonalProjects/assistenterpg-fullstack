export type OrigemSincronizacaoSessao =
  | 'POLLING'
  | 'VISIBILIDADE'
  | 'REALTIME'
  | 'MANUAL';

export type MetricaSincronizacaoSessao = {
  origem: OrigemSincronizacaoSessao;
  duracaoMs: number;
  sucesso: boolean;
};

export const EVENTO_TELEMETRIA_SESSAO = 'assistenterpg:sessao-metrica';

export function registrarMetricaSincronizacaoSessao(
  metrica: MetricaSincronizacaoSessao,
): void {
  if (typeof window === 'undefined') return;

  const nomeMedida = `sessao:sincronizacao:${metrica.origem.toLowerCase()}`;
  if (typeof performance !== 'undefined') {
    performance.measure(nomeMedida, {
      detail: metrica,
      duration: metrica.duracaoMs,
      start: performance.now() - metrica.duracaoMs,
    });
  }
  window.dispatchEvent(
    new CustomEvent<MetricaSincronizacaoSessao>(EVENTO_TELEMETRIA_SESSAO, {
      detail: metrica,
    }),
  );
}
