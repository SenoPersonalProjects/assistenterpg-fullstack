import { useEffect, useState } from 'react';
import { calcularIntervaloPolling } from '@/lib/campanha/sessao-utils';
import {
  type AckSessaoRealtime,
  conectarSocketSessao,
  type EventoSessaoAtualizada,
  type EventoSessaoErro,
  type EventoSessaoJoined,
  type EventoSessaoPresenca,
} from '@/lib/realtime/sessao-socket';
import {
  erroSessaoFatal,
  normalizarOnlineUsuarioIds,
  snapshotPertenceSessao,
} from '@/lib/realtime/sessao-realtime-state';

const ACK_TIMEOUT_MS = 5000;

type UseSessaoRealtimeParams = {
  idsValidos: boolean;
  usuarioId: number | null | undefined;
  campanhaId: number;
  sessaoId: number;
  sincronizarTempoReal: () => void | Promise<void>;
};

type UseSessaoRealtimeReturn = {
  socketConectado: boolean;
  realtimeStatus: 'online' | 'reconnecting' | 'polling';
  onlineUsuarioIds: number[];
};

export function useSessaoRealtime({
  idsValidos,
  usuarioId,
  campanhaId,
  sessaoId,
  sincronizarTempoReal,
}: UseSessaoRealtimeParams): UseSessaoRealtimeReturn {
  const [socketConectado, setSocketConectado] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<
    'online' | 'reconnecting' | 'polling'
  >('polling');
  const [onlineUsuarioIds, setOnlineUsuarioIds] = useState<number[]>([]);

  useEffect(() => {
    if (!idsValidos || !usuarioId) return;

    const intervaloMs = calcularIntervaloPolling(socketConectado);
    const intervalo = window.setInterval(() => {
      void sincronizarTempoReal();
    }, intervaloMs);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [idsValidos, socketConectado, sincronizarTempoReal, usuarioId]);

  useEffect(() => {
    if (!idsValidos || !usuarioId) return;

    const socket = conectarSocketSessao();
    let falhaFatal = false;

    const aplicarSnapshotPresenca = (
      evento: EventoSessaoPresenca | null | undefined,
    ): boolean => {
      if (!snapshotPertenceSessao(evento, campanhaId, sessaoId)) return false;
      setOnlineUsuarioIds(normalizarOnlineUsuarioIds(evento.onlineUsuarioIds));
      return true;
    };

    const marcarSalaConectada = (
      evento?: EventoSessaoPresenca | null,
    ): void => {
      setSocketConectado(true);
      setRealtimeStatus('online');
      aplicarSnapshotPresenca(evento);
    };

    const tratarAckSala = (resposta?: AckSessaoRealtime | null): void => {
      if (!resposta?.ok) {
        if (erroSessaoFatal(resposta)) {
          falhaFatal = true;
          setSocketConectado(false);
          setRealtimeStatus('polling');
          setOnlineUsuarioIds([]);
          socket.disconnect();
        }
        return;
      }

      marcarSalaConectada(resposta.presenca);
    };

    const solicitarSnapshot = () => {
      socket.timeout(ACK_TIMEOUT_MS).emit(
        'sessao:sync',
        { campanhaId, sessaoId },
        (erro: Error | null, resposta?: AckSessaoRealtime) => {
          if (erro) return;
          tratarAckSala(resposta);
        },
      );
    };

    const entrarNaSala = () => {
      socket.timeout(ACK_TIMEOUT_MS).emit(
        'sessao:join',
        { campanhaId, sessaoId },
        (erro: Error | null, resposta?: AckSessaoRealtime) => {
          if (erro) {
            solicitarSnapshot();
            return;
          }
          tratarAckSala(resposta);
          if (resposta?.ok && !resposta.presenca) {
            solicitarSnapshot();
          }
        },
      );
    };

    const handleConnect = () => {
      falhaFatal = false;
      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
      entrarNaSala();
    };

    const handleDisconnect = () => {
      setSocketConectado(false);
      setRealtimeStatus(falhaFatal ? 'polling' : 'reconnecting');
    };

    const handleConnectError = () => {
      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
    };

    const handleSessaoJoined = (evento: EventoSessaoJoined) => {
      if (!evento || evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) {
        return;
      }
      marcarSalaConectada(evento.presenca);
      if (!evento.presenca) solicitarSnapshot();
    };

    const handleSessaoErro = (evento: EventoSessaoErro) => {
      if (erroSessaoFatal(evento)) {
        falhaFatal = true;
        setSocketConectado(false);
        setRealtimeStatus('polling');
        setOnlineUsuarioIds([]);
        socket.disconnect();
        return;
      }

      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
    };

    const handleSessaoPresenca = (evento: EventoSessaoPresenca) => {
      aplicarSnapshotPresenca(evento);
    };

    const handleSessaoAtualizada = (evento: EventoSessaoAtualizada) => {
      if (!evento) return;
      if (evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) return;
      void sincronizarTempoReal();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('sessao:joined', handleSessaoJoined);
    socket.on('sessao:erro', handleSessaoErro);
    socket.on('sessao:presenca', handleSessaoPresenca);
    socket.on('sessao:atualizada', handleSessaoAtualizada);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('sessao:joined', handleSessaoJoined);
      socket.off('sessao:erro', handleSessaoErro);
      socket.off('sessao:presenca', handleSessaoPresenca);
      socket.off('sessao:atualizada', handleSessaoAtualizada);
      socket.disconnect();
      setSocketConectado(false);
      setRealtimeStatus('polling');
      setOnlineUsuarioIds([]);
    };
  }, [campanhaId, idsValidos, sessaoId, sincronizarTempoReal, usuarioId]);

  return { socketConectado, realtimeStatus, onlineUsuarioIds };
}
