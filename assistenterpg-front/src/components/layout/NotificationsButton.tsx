'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PendingNotificationsPanel } from '@/components/notificacoes/PendingNotificationsPanel';
import { Icon } from '@/components/ui/Icon';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const badgeLabel =
    pendingNotifications > 9 ? '9+' : String(pendingNotifications);
  const highlighted = active || open;

  const handleTotalsChange = useCallback(
    (total: number) => {
      onPendingNotificationsChange?.(total);
    },
    [onPendingNotificationsChange],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function goToNotifications() {
    setOpen(false);
    router.push('/notificacoes');
  }

  return (
    <div ref={rootRef} className="relative">
      <button
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
        onClick={() => setOpen((current) => !current)}
        title="Notificações"
        aria-haspopup="dialog"
        aria-expanded={open}
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

      {open && (
        <div
          role="dialog"
          aria-label="Notificações pendentes"
          className="
            fixed left-4 right-4 top-20 z-[70]
            max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl
            border border-app-border bg-app-surface p-4 shadow-2xl
            shadow-black/20 backdrop-blur-xl
            sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[26rem]
          "
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
              onClick={() => setOpen(false)}
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
      )}
    </div>
  );
}
