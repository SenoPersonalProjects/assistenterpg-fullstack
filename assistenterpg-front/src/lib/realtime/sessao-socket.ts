import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, refreshAuthSession } from '@/lib/api/axios-client';
import type { AtualizacaoIncrementalSessaoCampanha } from '@/lib/types';

export type EventoSessaoAtualizadaTipo =
  | 'CHAT_NOVA'
  | 'CENA_ATUALIZADA'
  | 'TURNO_AVANCADO'
  | 'TURNO_RECUADO'
  | 'TURNO_PULADO'
  | 'ORDEM_INICIATIVA_ATUALIZADA'
  | 'INICIATIVA_VALOR_ATUALIZADO'
  | 'NPC_ATUALIZADO'
  | 'PERSONAGEM_ATUALIZADO'
  | 'SESSAO_ENCERRADA'
  | 'SESSAO_EVENTO_DESFEITO'
  | 'HABILIDADE_USADA'
  | 'HABILIDADE_SUSTENTADA_ENCERRADA'
  | 'CONDICAO_APLICADA'
  | 'CONDICAO_REMOVIDA'
  | 'RECURSO_AJUSTADO'
  | 'REGRA_OPCIONAL_ATUALIZADA'
  | 'INSPIRACAO_AJUSTADA'
  | 'INSPIRACAO_GASTA'
  | 'ENCONTRO_SOCIAL_ATUALIZADO'
  | 'ESCALADA_DADOS_ATUALIZADA'
  | 'INICIATIVA_ALTERNADA_ATUALIZADA'
  | 'CONSUMIVEL_USADO'
  | 'CONDICAO_RECUPERACAO_AUTOMATICA';

export type EventoSessaoAtualizada = {
  campanhaId: number;
  sessaoId: number;
  tipo: EventoSessaoAtualizadaTipo;
  em: string;
  atualizacao?: AtualizacaoIncrementalSessaoCampanha;
};

export type EventoSessaoPresenca = {
  campanhaId: number;
  sessaoId: number;
  onlineUsuarioIds: number[];
  em: string;
};

export type EventoSessaoJoined = {
  campanhaId: number;
  sessaoId: number;
  presenca?: EventoSessaoPresenca | null;
};

export type EventoSessaoErroCode =
  | 'ACESSO_NEGADO'
  | 'AUTH_AUSENTE'
  | 'JOIN_INVALIDO'
  | 'AUTH_INVALIDA'
  | 'SESSAO_INVALIDA';

export type EventoSessaoErro = {
  code?: EventoSessaoErroCode | string;
  fatal?: boolean;
  em?: string;
};

export type AckSessaoRealtime = {
  ok: boolean;
  code?: EventoSessaoErroCode | string;
  fatal?: boolean;
  presenca?: EventoSessaoPresenca | null;
};

export function conectarSocketSessao(): Socket {
  const socket = io(`${API_BASE_URL}/sessoes`, {
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

  let tentouRefreshAposErro = false;
  socket.on('connect', () => {
    tentouRefreshAposErro = false;
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
