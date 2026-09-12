// components/ui/ConfirmDialog.tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { Portal } from './Portal';
import { useDialogLayer } from './DialogProvider';
import { zIndexCamadaDialogo } from '@/lib/ui/dialog-layer';

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
  const titleId = useId();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = confirmLoading || isSubmitting;
  const solicitarFechamento = () => {
    if (!submitting) onClose();
  };
  const { isTopLayer, layerIndex } = useDialogLayer(
    isOpen,
    solicitarFechamento,
    dialogRef,
  );

  useEffect(() => {
    if (!isOpen) return;
    setSubmissionError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const confirmar = async () => {
    if (confirmDisabled || submitting) return;
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setSubmissionError('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <Portal>
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: zIndexCamadaDialogo(layerIndex) }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => isTopLayer && solicitarFechamento()}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-lg border border-app-border bg-app-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
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
              id={titleId}
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
        {submissionError && <p className="px-6 pb-3 text-sm text-app-danger" role="alert">{submissionError}</p>}

        {/* Footer com botões */}
        <div className="flex items-center justify-end gap-3 border-t border-app-border bg-app-bg px-6 py-4">
          <Button
            variant="ghost"
            size="md"
            onClick={solicitarFechamento}
            className="min-w-[100px]"
            disabled={submitting}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={config.buttonVariant}
            size="md"
            onClick={confirmar}
            className={`min-w-[100px] ${config.buttonClass} ${confirmClassName}`}
            disabled={confirmDisabled || submitting}
          >
            {submitting ? 'Processando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
