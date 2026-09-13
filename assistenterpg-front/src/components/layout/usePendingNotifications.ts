'use client';

import { useCallback, useEffect, type SetStateAction } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRemoteData } from '@/hooks/useRemoteData';
import {
  apiInscreverAtualizacaoAmizades,
  apiInscreverAtualizacaoConvitesPendentes,
  apiListarConvitesPendentes,
  apiListarSolicitacoesAmizade,
} from '@/lib/api';

export function usePendingNotifications() {
  const { usuario } = useAuth();
  const userId = usuario?.id;

  const carregarNotificacoes = useCallback(async () => {
    const [convites, solicitacoes] = await Promise.all([
      apiListarConvitesPendentes(),
      apiListarSolicitacoesAmizade(),
    ]);

    return convites.length + solicitacoes.recebidas.length;
  }, []);

  const {
    dados: totalPendente,
    definirDados,
    recarregar,
  } = useRemoteData(carregarNotificacoes, {
    ativo: Boolean(userId),
  });

  const setPendingNotifications = useCallback(
    (proximoTotal: SetStateAction<number>) => {
      const totalAtual = totalPendente ?? 0;
      definirDados(
        typeof proximoTotal === 'function'
          ? proximoTotal(totalAtual)
          : proximoTotal,
      );
    },
    [definirDados, totalPendente],
  );

  useEffect(() => {
    let intervalId: number | null = null;

    const unsubscribeConvites = apiInscreverAtualizacaoConvitesPendentes(() => {
      if (!userId) return;
      void recarregar();
    });

    const unsubscribeAmizades = apiInscreverAtualizacaoAmizades(() => {
      if (!userId) return;
      void recarregar();
    });

    if (userId) {
      intervalId = window.setInterval(() => {
        void recarregar();
      }, 60_000);
    }

    return () => {
      unsubscribeConvites();
      unsubscribeAmizades();

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [recarregar, userId]);

  return {
    pendingNotifications: totalPendente ?? 0,
    setPendingNotifications,
  };
}
