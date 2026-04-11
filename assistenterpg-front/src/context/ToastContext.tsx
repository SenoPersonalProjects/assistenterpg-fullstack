// src/context/ToastContext.tsx

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
};

type ToastContextType = {
  toasts: Toast[];
  showToast: (
    message: string,
    type?: ToastType,
    options?: { actions?: ToastAction[]; durationMs?: number | null },
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: { actions?: ToastAction[]; durationMs?: number | null },
    ) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, message, type, actions: options?.actions };

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
