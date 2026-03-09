// components/layout/NotificationsButton.tsx
'use client';

import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';

type Props = {
  pendingNotifications?: number;
  showLabel?: boolean;
  active?: boolean;
  className?: string;
};

export function NotificationsButton({
  pendingNotifications = 0,
  showLabel = true,
  active = false,
  className = '',
}: Props) {
  const router = useRouter();
  const badgeLabel = pendingNotifications > 9 ? '9+' : String(pendingNotifications);

  function goToNotifications() {
    router.push('/notificacoes');
  }

  return (
    <button
      type="button"
      className={`
        inline-flex items-center transition-colors
        ${showLabel ? 'gap-2 px-3 py-1 text-sm rounded font-medium' : 'p-2 rounded-lg'}
        ${active ? 'bg-app-primary/10 text-app-primary' : 'text-app-muted hover:text-app-fg hover:bg-app-bg'}
        ${className}
      `}
      onClick={goToNotifications}
      title="Notificações"
      aria-label={`Notificações${pendingNotifications > 0 ? ` (${badgeLabel})` : ''}`}
    >
      <span className="relative inline-flex">
        <Icon name="bell" className="h-6 w-6" />

        {pendingNotifications > 0 && (
          <span
            className="
              absolute -top-1.5 -right-1.5
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
  );
}
