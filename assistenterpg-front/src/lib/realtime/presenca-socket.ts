import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, refreshAuthSession } from '@/lib/api/axios-client';

export type EventoPresencaAmigos = {
  onlineUsuarioIds: number[];
  em: string;
};

export function conectarSocketPresenca(): Socket {
  const socket = io(`${API_BASE_URL}/presenca`, {
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
