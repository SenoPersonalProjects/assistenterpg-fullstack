// src/components/ui/Toast.tsx

'use client';

import { useToast } from '@/context/ToastContext';
import { Icon, IconName } from './Icon';

const TOAST_STYLES = {
  success: 'bg-app-success text-white',
  error: 'bg-app-danger text-white',
  warning: 'bg-app-warning text-white',
  info: 'bg-app-info text-white',
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
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg
            animate-slide-in-right
            ${TOAST_STYLES[toast.type]}
          `}
        >
          <Icon name={TOAST_ICONS[toast.type]} className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.actions?.length ? (
              <div className="flex flex-wrap gap-2">
                {toast.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      void action.onClick();
                      removeToast(toast.id);
                    }}
                    className="rounded border border-white/40 px-2 py-1 text-xs font-semibold transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-80 transition-opacity"
            aria-label="Fechar notificação"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
