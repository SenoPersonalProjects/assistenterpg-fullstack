import { useEffect, useState } from 'react';
import {
  conectarSocketCampanha,
  type AckCampanhaRealtime,
  type EventoCampanhaRoletaAtualizada,
  type EventoCampanhaRoletaGiro,
} from '@/lib/realtime/campanha-socket';

const ACK_TIMEOUT_MS = 5_000;
const FALLBACK_POLLING_MS = 12_000;
const POLLING_INTERVAL_MS = 15_000;

export function useCampanhaRoletaRealtime(params: {
  campanhaId: number;
  usuarioId: number;
  onAtualizar: () => void | Promise<void>;
  onGiro: (evento: EventoCampanhaRoletaGiro) => void;
}) {
  const { campanhaId, usuarioId, onAtualizar, onGiro } = params;
  const [status, setStatus] = useState<'online' | 'reconnecting' | 'polling'>(
    'reconnecting',
  );

  useEffect(() => {
    const polling = window.setInterval(() => {
      if (status === 'polling') void onAtualizar();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(polling);
  }, [onAtualizar, status]);

  useEffect(() => {
    if (!campanhaId || !usuarioId) return;
    const socket = conectarSocketCampanha();
    let fallback: number | null = null;
    let fatal = false;

    const limparFallback = () => {
      if (fallback !== null) window.clearTimeout(fallback);
      fallback = null;
    };
    const agendarFallback = () => {
      limparFallback();
      fallback = window.setTimeout(() => setStatus('polling'), FALLBACK_POLLING_MS);
    };
    const entrar = (evento: 'campanha:join' | 'campanha:sync') => {
      socket.timeout(ACK_TIMEOUT_MS).emit(
        evento,
        { campanhaId },
        (erro: Error | null, ack?: AckCampanhaRealtime) => {
          if (erro || !ack?.ok) {
            agendarFallback();
            return;
          }
          limparFallback();
          setStatus('online');
        },
      );
    };
    const handleConnect = () => {
      fatal = false;
      setStatus('reconnecting');
      agendarFallback();
      entrar('campanha:join');
    };
    const handleDisconnect = () => {
      if (fatal) return;
      setStatus('reconnecting');
      agendarFallback();
    };
    const handleErro = (evento?: { fatal?: boolean }) => {
      if (evento?.fatal) {
        fatal = true;
        limparFallback();
        setStatus('polling');
        socket.disconnect();
      }
    };
    const handleAtualizada = (evento: EventoCampanhaRoletaAtualizada) => {
      if (evento.campanhaId === campanhaId) void onAtualizar();
    };
    const handleGiro = (evento: EventoCampanhaRoletaGiro) => {
      if (evento.campanhaId !== campanhaId) return;
      onGiro(evento);
      void onAtualizar();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', agendarFallback);
    socket.on('campanha:erro', handleErro);
    socket.on('campanha:roleta-atualizada', handleAtualizada);
    socket.on('campanha:roleta-giro', handleGiro);

    return () => {
      limparFallback();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', agendarFallback);
      socket.off('campanha:erro', handleErro);
      socket.off('campanha:roleta-atualizada', handleAtualizada);
      socket.off('campanha:roleta-giro', handleGiro);
      socket.disconnect();
    };
  }, [campanhaId, onAtualizar, onGiro, usuarioId]);

  return status;
}
