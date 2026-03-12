import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/axios-client';
import { getToken } from '@/lib/utils/auth';

export type EventoSessaoAtualizadaTipo =
  | 'CHAT_NOVA'
  | 'CENA_ATUALIZADA'
  | 'TURNO_AVANCADO'
  | 'TURNO_RECUADO'
  | 'TURNO_PULADO'
  | 'ORDEM_INICIATIVA_ATUALIZADA'
  | 'NPC_ATUALIZADO'
  | 'SESSAO_ENCERRADA'
  | 'SESSAO_EVENTO_DESFEITO'
  | 'HABILIDADE_USADA'
  | 'HABILIDADE_SUSTENTADA_ENCERRADA';

export type EventoSessaoAtualizada = {
  campanhaId: number;
  sessaoId: number;
  tipo: EventoSessaoAtualizadaTipo;
  em: string;
};

export type EventoSessaoPresenca = {
  campanhaId: number;
  sessaoId: number;
  onlineUsuarioIds: number[];
  em: string;
};

export function conectarSocketSessao(): Socket {
  const token = getToken();

  return io(`${API_BASE_URL}/sessoes`, {
    transports: ['websocket', 'polling'],
    auth: token ? { token: `Bearer ${token}` } : undefined,
    timeout: 10_000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
