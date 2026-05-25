import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, refreshAuthSession } from '@/lib/api/axios-client';
export type EventoChatLeitura = {
  usuarioId: number;
  amigoId: number;
  conversaId: number | null;
  lidaAteMensagemId: number | null;
};

export type ChatAmigosSocket = Socket;

export function conectarSocketChatAmigos(): ChatAmigosSocket {
  const socket = io(`${API_BASE_URL}/chat-amigos`, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
    timeout: 10_000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  }) as ChatAmigosSocket;

  void refreshAuthSession()
    .catch(() => undefined)
    .finally(() => socket.connect());

  let tentouRefreshAposErro = false;
  socket.on('connect', () => {
    tentouRefreshAposErro = false;
    socket.emit('chat:sync');
  });
  socket.on('connect_error', () => {
    if (tentouRefreshAposErro) return;
    tentouRefreshAposErro = true;
    void refreshAuthSession()
      .then(() => {
        if (!socket.connected) socket.connect();
      })
      .catch(() => undefined);
  });

  return socket;
}
