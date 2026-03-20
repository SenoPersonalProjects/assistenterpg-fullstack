// components/ui/ConfirmDialog.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode; // ✅ MUDANÇA AQUI
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmClassName?: string;
  children?: React.ReactNode;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  confirmDisabled = false,
  confirmLoading = false,
  confirmClassName = '',
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock scroll quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      iconName: 'warning' as const,
      iconBg: 'bg-app-danger/10',
      iconColor: 'text-app-danger',
      buttonVariant: 'primary' as const,
      buttonClass: 'bg-app-danger hover:bg-app-danger/90',
    },
    warning: {
      iconName: 'warning' as const,
      iconBg: 'bg-app-warning/10',
      iconColor: 'text-app-warning',
      buttonVariant: 'primary' as const,
      buttonClass: 'bg-app-warning hover:bg-app-warning/90',
    },
    info: {
      iconName: 'info' as const,
      iconBg: 'bg-app-info/10',
      iconColor: 'text-app-info',
      buttonVariant: 'primary' as const,
      buttonClass: '',
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-lg border border-app-border bg-app-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header com ícone */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
          >
            <Icon name={config.iconName} className={`h-6 w-6 ${config.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="dialog-title"
              className="text-lg font-semibold text-app-fg mb-2"
            >
              {title}
            </h3>
            <div className="text-sm text-app-muted leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Conteúdo adicional (lista de consequências) */}
        {children && (
          <div className="px-6 pb-4">
            {children}
          </div>
        )}

        {/* Footer com botões */}
        <div className="flex items-center justify-end gap-3 border-t border-app-border bg-app-bg px-6 py-4">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="min-w-[100px]"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={config.buttonVariant}
            size="md"
            onClick={() => {
              if (confirmDisabled || confirmLoading) return;
              onConfirm();
              onClose();
            }}
            className={`min-w-[100px] ${config.buttonClass} ${confirmClassName}`}
            disabled={confirmDisabled || confirmLoading}
          >
            {confirmLoading ? 'Processando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
