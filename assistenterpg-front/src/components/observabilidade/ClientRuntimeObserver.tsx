'use client';

import { useEffect } from 'react';
import {
  criarErroClienteObservavel,
  registrarErroCliente,
} from '@/lib/observabilidade/cliente';

const VERSAO_DEPLOY = process.env.NEXT_PUBLIC_DEPLOY_VERSION ?? 'unknown';

export function ClientRuntimeObserver() {
  useEffect(() => {
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

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
