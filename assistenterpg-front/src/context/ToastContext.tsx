// src/context/ToastContext.tsx

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ErrorSupportInfo, UserFacingError } from '@/lib/types';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  actions?: ToastAction[];
  support?: ErrorSupportInfo;
};

type ToastContextType = {
  toasts: Toast[];
  showToast: (
    message: string | UserFacingError,
    type?: ToastType,
    options?: {
      actions?: ToastAction[];
      durationMs?: number | null;
      support?: ErrorSupportInfo;
    },
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string | UserFacingError,
      type: ToastType = 'info',
      options?: {
        actions?: ToastAction[];
        durationMs?: number | null;
        support?: ErrorSupportInfo;
      },
    ) => {
      const id = Math.random().toString(36).substring(7);
      const userFacingError =
        typeof message === 'object' ? message : undefined;
      const newToast: Toast = {
        id,
        message: typeof message === 'string' ? message : message.message,
        type,
        actions: options?.actions,
        support: options?.support ?? userFacingError,
      };

      setToasts((prev) => [...prev, newToast]);

      const durationMs = options?.durationMs === undefined ? 5000 : options.durationMs;
      if (durationMs !== null) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}
