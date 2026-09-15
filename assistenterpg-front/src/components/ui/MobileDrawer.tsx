'use client';

import { useRef, type ReactNode } from 'react';
import { Portal } from './Portal';
import { useDialogLayer } from './DialogProvider';
import { zIndexCamadaDialogo } from '@/lib/ui/dialog-layer';

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  side?: 'left' | 'right';
  className?: string;
};

/** Superfície lateral móvel que segue a política compartilhada de diálogos. */
export function MobileDrawer({
  isOpen,
  onClose,
  ariaLabel,
  children,
  side = 'left',
  className = '',
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { isTopLayer, layerIndex } = useDialogLayer(isOpen, onClose, drawerRef);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 lg:hidden"
        style={{ zIndex: zIndexCamadaDialogo(layerIndex) }}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-sm"
          aria-label={`Fechar ${ariaLabel.toLocaleLowerCase('pt-BR')}`}
          onClick={() => isTopLayer && onClose()}
        />
        <div
          ref={drawerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={[
            'absolute inset-y-0 flex max-w-[calc(100vw-2rem)] outline-none',
            side === 'left' ? 'left-0' : 'right-0',
            className,
          ].join(' ')}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}
