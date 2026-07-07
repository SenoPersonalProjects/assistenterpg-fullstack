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
  aplicarSnapshotSessaoRealtime,
  criarEstadoSessaoRealtimeInicial,
  erroSessaoFatal,
  marcarSessaoRealtimeOnline,
  marcarSessaoRealtimePolling,
  marcarSessaoRealtimeReconectando,
  snapshotPertenceSessao,
} from '@/lib/realtime/sessao-realtime-state';

const ACK_TIMEOUT_MS = 5000;
const FALLBACK_POLLING_MS = 12000;

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
  const [estadoRealtime, setEstadoRealtime] = useState(
    criarEstadoSessaoRealtimeInicial,
  );

  useEffect(() => {
    if (!idsValidos || !usuarioId) return;

    const intervaloMs = calcularIntervaloPolling(
      estadoRealtime.socketConectado,
    );
    const intervalo = window.setInterval(() => {
      void sincronizarTempoReal();
    }, intervaloMs);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [
    estadoRealtime.socketConectado,
    idsValidos,
    sincronizarTempoReal,
    usuarioId,
  ]);

  useEffect(() => {
    if (!idsValidos || !usuarioId) return;

    const socket = conectarSocketSessao();
    let falhaFatal = false;
    let fallbackPollingTimer: number | null = null;
    let fallbackPollingAtivo = false;

    const limparFallbackPolling = (resetarFallbackAtivo = false) => {
      if (fallbackPollingTimer !== null) {
        window.clearTimeout(fallbackPollingTimer);
        fallbackPollingTimer = null;
      }
      if (resetarFallbackAtivo) {
        fallbackPollingAtivo = false;
      }
    };

    const agendarFallbackPolling = () => {
      limparFallbackPolling();
      fallbackPollingTimer = window.setTimeout(() => {
        fallbackPollingTimer = null;
        fallbackPollingAtivo = true;
        setEstadoRealtime((estadoAtual) =>
          marcarSessaoRealtimePolling(estadoAtual),
        );
      }, FALLBACK_POLLING_MS);
    };

    const aplicarSnapshotPresenca = (
      evento: EventoSessaoPresenca | null | undefined,
    ): boolean => {
      if (!snapshotPertenceSessao(evento, campanhaId, sessaoId)) return false;
      setEstadoRealtime((estadoAtual) =>
        aplicarSnapshotSessaoRealtime(estadoAtual, evento, campanhaId, sessaoId),
      );
      return true;
    };

    const marcarSalaConectada = (
      evento?: EventoSessaoPresenca | null,
    ): void => {
      limparFallbackPolling(true);
      setEstadoRealtime((estadoAtual) =>
        marcarSessaoRealtimeOnline(estadoAtual, evento, campanhaId, sessaoId),
      );
    };

    const tratarAckSala = (resposta?: AckSessaoRealtime | null): void => {
      if (!resposta?.ok) {
        if (erroSessaoFatal(resposta)) {
          falhaFatal = true;
          limparFallbackPolling(true);
          setEstadoRealtime(criarEstadoSessaoRealtimeInicial());
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
      fallbackPollingAtivo = false;
      setEstadoRealtime((estadoAtual) =>
        marcarSessaoRealtimeReconectando(estadoAtual),
      );
      agendarFallbackPolling();
      entrarNaSala();
    };

    const handleDisconnect = () => {
      if (falhaFatal) {
        limparFallbackPolling(true);
        setEstadoRealtime(criarEstadoSessaoRealtimeInicial());
        return;
      }

      if (fallbackPollingAtivo) {
        setEstadoRealtime((estadoAtual) =>
          marcarSessaoRealtimePolling(estadoAtual),
        );
        return;
      }

      setEstadoRealtime((estadoAtual) =>
        marcarSessaoRealtimeReconectando(estadoAtual),
      );
      agendarFallbackPolling();
    };

    const handleConnectError = () => {
      if (fallbackPollingAtivo) {
        setEstadoRealtime((estadoAtual) =>
          marcarSessaoRealtimePolling(estadoAtual),
        );
        return;
      }

      setEstadoRealtime((estadoAtual) =>
        marcarSessaoRealtimeReconectando(estadoAtual),
      );
      agendarFallbackPolling();
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
        limparFallbackPolling(true);
        setEstadoRealtime(criarEstadoSessaoRealtimeInicial());
        socket.disconnect();
        return;
      }

      setEstadoRealtime((estadoAtual) =>
        marcarSessaoRealtimeReconectando(estadoAtual),
      );
      agendarFallbackPolling();
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
      limparFallbackPolling(true);
      socket.disconnect();
      setEstadoRealtime(criarEstadoSessaoRealtimeInicial());
    };
  }, [campanhaId, idsValidos, sessaoId, sincronizarTempoReal, usuarioId]);

  return estadoRealtime;
}
