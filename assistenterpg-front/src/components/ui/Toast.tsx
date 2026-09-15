// src/components/ui/Toast.tsx

'use client';

import { useState } from 'react';
import { useToast, type Toast as ToastMessage } from '@/context/ToastContext';
import { criarErroUsuario, formatarSuporteErro } from '@/lib/api/error-handler';
import { Icon, IconName } from './Icon';

const TOAST_STYLES = {
  success: 'bg-app-success text-app-on-success',
  error: 'bg-app-danger text-app-on-danger',
  warning: 'bg-app-warning text-app-on-warning',
  info: 'bg-app-info text-app-on-info',
};

const TOAST_ICONS: Record<string, IconName> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 space-y-2 sm:left-auto sm:w-full sm:max-w-md"
      aria-label="Mensagens do sistema"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  removeToast,
}: {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}) {
  const supportText = formatarSuporteErro(toast.support);
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function executarAcao(action: NonNullable<ToastMessage['actions']>[number]) {
    try {
      setErroAcao(null);
      setAcaoPendente(action.label);
      await action.onClick();
      removeToast(toast.id);
    } catch (error) {
      setErroAcao(criarErroUsuario(error).message);
    } finally {
      setAcaoPendente(null);
    }
  }

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg
        animate-slide-in-right
        ${TOAST_STYLES[toast.type]}
      `}
    >
      <Icon name={TOAST_ICONS[toast.type]} className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">{toast.message}</p>
          {supportText ? (
            <p className="mt-1 text-xs opacity-80">{supportText}</p>
          ) : null}
        </div>
        {toast.actions?.length ? (
          <div className="flex flex-wrap gap-2">
            {toast.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={acaoPendente !== null}
                onClick={() => void executarAcao(action)}
                className="rounded border border-white/40 px-2 py-1 text-xs font-semibold transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                {acaoPendente === action.label ? 'Processando...' : action.label}
              </button>
            ))}
          </div>
        ) : null}
        {erroAcao ? <p className="text-xs font-medium" role="alert">{erroAcao}</p> : null}
      </div>
      <button
        type="button"
        disabled={acaoPendente !== null}
        onClick={() => removeToast(toast.id)}
        className="hover:opacity-80 transition-opacity"
        aria-label="Fechar notificação"
      >
        <Icon name="close" className="w-4 h-4" />
      </button>
    </div>
  );
}
