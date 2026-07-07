import type {
  EventoSessaoErro,
  EventoSessaoPresenca,
} from '@/lib/realtime/sessao-socket';

const ERROS_SESSAO_FATAL = new Set([
  'ACESSO_NEGADO',
  'AUTH_INVALIDA',
  'JOIN_INVALIDO',
  'SESSAO_INVALIDA',
]);

export function erroSessaoFatal(evento: EventoSessaoErro | null | undefined): boolean {
  return typeof evento?.code === 'string' && ERROS_SESSAO_FATAL.has(evento.code);
}

export function snapshotPertenceSessao(
  evento: EventoSessaoPresenca | null | undefined,
  campanhaId: number,
  sessaoId: number,
): evento is EventoSessaoPresenca {
  return Boolean(
    evento &&
      evento.campanhaId === campanhaId &&
      evento.sessaoId === sessaoId &&
      Array.isArray(evento.onlineUsuarioIds),
  );
}

export function normalizarOnlineUsuarioIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];

  return Array.from(
    new Set(
      ids.filter(
        (id): id is number => typeof id === 'number' && Number.isInteger(id),
      ),
    ),
  ).sort((a, b) => a - b);
}
