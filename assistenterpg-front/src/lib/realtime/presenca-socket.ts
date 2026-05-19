import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/axios-client';
import { getToken } from '@/lib/utils/auth';

export type EventoPresencaAmigos = {
  onlineUsuarioIds: number[];
  em: string;
};

export function conectarSocketPresenca(): Socket {
  const token = getToken();

  return io(`${API_BASE_URL}/presenca`, {
    transports: ['websocket', 'polling'],
    auth: token ? { token: `Bearer ${token}` } : undefined,
    timeout: 10_000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
