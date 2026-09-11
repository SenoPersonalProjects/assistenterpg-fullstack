'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PendingNotificationsPanel } from '@/components/notificacoes/PendingNotificationsPanel';
import { Icon } from '@/components/ui/Icon';
import { Portal } from '@/components/ui/Portal';

type Props = {
  pendingNotifications?: number;
  showLabel?: boolean;
  active?: boolean;
  className?: string;
  onPendingNotificationsChange?: (total: number) => void;
};

export function NotificationsButton({
  pendingNotifications = 0,
  showLabel = true,
  active = false,
  className = '',
  onPendingNotificationsChange,
}: Props) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const badgeLabel =
    pendingNotifications > 9 ? '9+' : String(pendingNotifications);
  const highlighted = active || open;

  const handleTotalsChange = useCallback(
    (total: number) => {
      onPendingNotificationsChange?.(total);
    },
    [onPendingNotificationsChange],
  );

  const closePanel = useCallback((restoreFocus = true) => {
    setOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePanel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePanel, open]);

  function togglePanel() {
    if (open) {
      closePanel(false);
      return;
    }

    setOpen(true);
  }

  function goToNotifications() {
    closePanel(false);
    router.push('/notificacoes');
  }

  const panel = open ? (
    <Portal>
      <div className="fixed inset-x-0 bottom-0 top-14 z-[1000]">
        <button
          type="button"
          className="absolute inset-0 cursor-default bg-transparent"
          onClick={() => closePanel()}
          aria-label="Fechar notificações"
        />

        <div
          id={panelId}
          role="dialog"
          aria-label="Notificações pendentes"
          className="absolute right-3 top-2 z-10 w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-5rem)] max-w-[26rem] overflow-y-auto rounded-2xl border border-app-border bg-app-surface p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-app-fg">Notificações</p>
              <p className="text-xs text-app-muted">
                Convites e pedidos de amizade.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg"
              onClick={() => closePanel()}
              aria-label="Fechar notificações"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <PendingNotificationsPanel
            compact
            feedback="toast"
            showViewAllAction
            onTotalsChange={handleTotalsChange}
            onViewAll={goToNotifications}
          />
        </div>
      </div>
    </Portal>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={`
          inline-flex items-center transition-colors
          ${showLabel ? 'gap-2 rounded px-3 py-1 text-sm font-medium' : 'rounded-lg p-2'}
          ${
            highlighted
              ? 'bg-app-primary/10 text-app-primary'
              : 'text-app-muted hover:bg-app-bg hover:text-app-fg'
          }
          ${className}
        `}
        onClick={togglePanel}
        title="Notificações"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Notificações${
          pendingNotifications > 0 ? ` (${badgeLabel})` : ''
        }`}
      >
        <span className="relative inline-flex">
          <Icon name="bell" className="h-6 w-6" />

          {pendingNotifications > 0 && (
            <span
              className="
                absolute -right-1.5 -top-1.5
                flex h-4 min-w-4 items-center justify-center px-1
                rounded-full bg-red-500
                text-[10px] font-semibold leading-none text-white
              "
            >
              {badgeLabel}
            </span>
          )}
        </span>

        {showLabel && <span className="text-xs text-app-muted">Notificações</span>}
      </button>

      {panel}
    </div>
  );
}
