'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  apiInscreverAtualizacaoAmizades,
  apiInscreverAtualizacaoConvitesPendentes,
  apiListarConvitesPendentes,
  apiListarSolicitacoesAmizade,
} from '@/lib/api';

export function usePendingNotifications() {
  const { usuario } = useAuth();
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const userId = usuario?.id;

  useEffect(() => {
    let active = true;
    let intervalId: number | null = null;

    async function carregarNotificacoes() {
      if (!userId) {
        if (active) {
          setPendingNotifications(0);
        }
        return;
      }

      try {
        const [convites, solicitacoes] = await Promise.all([
          apiListarConvitesPendentes(),
          apiListarSolicitacoesAmizade(),
        ]);
        if (active) {
          setPendingNotifications(convites.length + solicitacoes.recebidas.length);
        }
      } catch {
        if (active) {
          setPendingNotifications(0);
        }
      }
    }

    void carregarNotificacoes();

    const unsubscribeConvites = apiInscreverAtualizacaoConvitesPendentes(() => {
      if (!active || !userId) return;
      void carregarNotificacoes();
    });

    const unsubscribeAmizades = apiInscreverAtualizacaoAmizades(() => {
      if (!active || !userId) return;
      void carregarNotificacoes();
    });

    if (userId) {
      intervalId = window.setInterval(() => {
        void carregarNotificacoes();
      }, 60_000);
    }

    return () => {
      active = false;
      unsubscribeConvites();
      unsubscribeAmizades();

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [userId]);

  return { pendingNotifications, setPendingNotifications };
}
