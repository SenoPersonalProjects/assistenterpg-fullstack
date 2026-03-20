import { useEffect, useState } from 'react';
import { calcularIntervaloPolling } from '@/lib/campanha/sessao-utils';
import {
  conectarSocketSessao,
  type EventoSessaoPresenca,
  type EventoSessaoAtualizada,
} from '@/lib/realtime/sessao-socket';

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

    const entrarNaSala = () => {
      socket.emit('sessao:join', { campanhaId, sessaoId });
    };

    const handleConnect = () => {
      setSocketConectado(true);
      setRealtimeStatus('online');
      setOnlineUsuarioIds((anterior) =>
        anterior.includes(usuarioId) ? anterior : [...anterior, usuarioId],
      );
      entrarNaSala();
    };

    const handleDisconnect = () => {
      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
      setOnlineUsuarioIds([]);
    };

    const handleConnectError = () => {
      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
      setOnlineUsuarioIds([]);
    };

    const handleSessaoErro = () => {
      setSocketConectado(false);
      setRealtimeStatus('reconnecting');
      setOnlineUsuarioIds([]);
    };

    const handleSessaoPresenca = (evento: EventoSessaoPresenca) => {
      if (!evento) return;
      if (evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) return;
      setOnlineUsuarioIds(
        Array.isArray(evento.onlineUsuarioIds) ? evento.onlineUsuarioIds : [],
      );
    };

    const handleSessaoAtualizada = (evento: EventoSessaoAtualizada) => {
      if (!evento) return;
      if (evento.campanhaId !== campanhaId || evento.sessaoId !== sessaoId) return;
      void sincronizarTempoReal();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('sessao:joined', () => setSocketConectado(true));
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
      socket.off('sessao:joined');
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
