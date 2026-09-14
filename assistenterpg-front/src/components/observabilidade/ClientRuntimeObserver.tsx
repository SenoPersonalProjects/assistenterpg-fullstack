'use client';

import { useEffect } from 'react';
import {
  EVENTO_ERRO_CLIENTE,
  criarErroClienteObservavel,
  registrarErroCliente,
  type ErroClienteObservavel,
} from '@/lib/observabilidade/cliente';
import { apiRegistrarErroCliente } from '@/lib/api';

const VERSAO_DEPLOY = process.env.NEXT_PUBLIC_DEPLOY_VERSION ?? 'unknown';

export function ClientRuntimeObserver() {
  useEffect(() => {
    const enviadosRecentemente = new Map<string, number>();
    const contexto = () => ({
      rota: window.location.pathname,
      versao: VERSAO_DEPLOY,
    });
    const onError = (event: ErrorEvent) => {
      registrarErroCliente(
        criarErroClienteObservavel(
          'ERRO_JAVASCRIPT',
          event.error ?? event.message,
          contexto(),
        ),
      );
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      registrarErroCliente(
        criarErroClienteObservavel(
          'PROMISE_REJEITADA',
          event.reason,
          contexto(),
        ),
      );
    };
    const enviarParaColetor = (event: Event) => {
      const erro = (event as CustomEvent<ErroClienteObservavel>).detail;
      if (!erro) return;
      const chave = `${erro.tipo}:${erro.rota}:${erro.mensagem}`;
      const agora = Date.now();
      if ((enviadosRecentemente.get(chave) ?? 0) > agora - 10_000) return;
      enviadosRecentemente.set(chave, agora);
      void apiRegistrarErroCliente(erro).catch(() => {
        // A telemetria não pode produzir uma segunda falha perceptível.
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener(EVENTO_ERRO_CLIENTE, enviarParaColetor);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener(EVENTO_ERRO_CLIENTE, enviarParaColetor);
    };
  }, []);

  return null;
}
