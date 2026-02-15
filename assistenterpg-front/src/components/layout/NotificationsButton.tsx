// components/layout/NotificationsButton.tsx
'use client';

import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type Props = {
  pendingNotifications?: number;
  className?: string;
};

export function NotificationsButton({
  pendingNotifications = 0,
  className,
}: Props) {
  const router = useRouter();

  function goToNotifications() {
    router.push('/notificacoes');
  }

  return (
    <Button
      variant="ghost"
      className={`inline-flex items-center gap-2 px-3 py-1 text-sm ${className ?? ''}`}
      onClick={goToNotifications}
    >
      <span className="relative inline-flex">
        <Icon name="bell" className="h-6 w-6 text-app-fg" />

        {pendingNotifications > 0 && (
          <span
            className="
              absolute -top-1.5 -right-1.5
              flex h-4 min-w-4 items-center justify-center
              rounded-full bg-red-500/90
              text-[10px] font-semibold text-white
            "
          >
            {pendingNotifications}
          </span>
        )}
      </span>

      <span className="text-xs text-app-muted">Notificações</span>
    </Button>
  );
}
