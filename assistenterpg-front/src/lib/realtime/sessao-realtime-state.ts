import type {
  EventoSessaoErro,
  EventoSessaoPresenca,
} from '@/lib/realtime/sessao-socket';

const ERROS_SESSAO_FATAL = new Set([
  'ACESSO_NEGADO',
  'AUTH_AUSENTE',
  'AUTH_INVALIDA',
  'JOIN_INVALIDO',
  'SESSAO_INVALIDA',
]);

export type SessaoRealtimeStatus = 'online' | 'reconnecting' | 'polling';

export type SessaoRealtimeViewState = {
  socketConectado: boolean;
  realtimeStatus: SessaoRealtimeStatus;
  onlineUsuarioIds: number[];
};

export function erroSessaoFatal(evento: EventoSessaoErro | null | undefined): boolean {
  if (evento?.fatal === true) return true;
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

export function criarEstadoSessaoRealtimeInicial(): SessaoRealtimeViewState {
  return {
    socketConectado: false,
    realtimeStatus: 'polling',
    onlineUsuarioIds: [],
  };
}

export function aplicarSnapshotSessaoRealtime(
  estado: SessaoRealtimeViewState,
  evento: EventoSessaoPresenca | null | undefined,
  campanhaId: number,
  sessaoId: number,
): SessaoRealtimeViewState {
  if (!snapshotPertenceSessao(evento, campanhaId, sessaoId)) return estado;

  return {
    ...estado,
    onlineUsuarioIds: normalizarOnlineUsuarioIds(evento.onlineUsuarioIds),
  };
}

export function marcarSessaoRealtimeOnline(
  estado: SessaoRealtimeViewState,
  evento: EventoSessaoPresenca | null | undefined,
  campanhaId: number,
  sessaoId: number,
): SessaoRealtimeViewState {
  return aplicarSnapshotSessaoRealtime(
    {
      ...estado,
      socketConectado: true,
      realtimeStatus: 'online',
    },
    evento,
    campanhaId,
    sessaoId,
  );
}

export function marcarSessaoRealtimeReconectando(
  estado: SessaoRealtimeViewState,
): SessaoRealtimeViewState {
  return {
    ...estado,
    socketConectado: false,
    realtimeStatus: 'reconnecting',
  };
}

export function marcarSessaoRealtimePolling(
  estado: SessaoRealtimeViewState,
): SessaoRealtimeViewState {
  return {
    ...estado,
    socketConectado: false,
    realtimeStatus: 'polling',
  };
}
