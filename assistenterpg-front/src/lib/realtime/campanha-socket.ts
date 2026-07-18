import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, refreshAuthSession } from '@/lib/api/axios-client';

export type EventoCampanhaRoletaAtualizada = {
  campanhaId: number;
  motivo: string;
  em: string;
};

export type EventoCampanhaRoletaGiro = {
  campanhaId: number;
  dados: unknown;
  em: string;
};

export type AckCampanhaRealtime = {
  ok: boolean;
  campanhaId?: number;
  code?: string;
  fatal?: boolean;
};

export function conectarSocketCampanha(): Socket {
  const socket = io(`${API_BASE_URL}/campanhas`, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
    timeout: 10_000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  void refreshAuthSession()
    .catch(() => undefined)
    .finally(() => socket.connect());
  return socket;
}
