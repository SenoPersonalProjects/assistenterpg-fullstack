'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { NotificationsButton } from './NotificationsButton';
import { UserMenu } from './UserMenu';

type AppTopbarProps = {
  title: string;
  sidebarCollapsed: boolean;
  pendingNotifications: number;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onPendingNotificationsChange: Dispatch<SetStateAction<number>>;
  actions?: ReactNode;
};

export function AppTopbar({
  title,
  sidebarCollapsed,
  pendingNotifications,
  onToggleSidebar,
  onOpenMobileSidebar,
  onPendingNotificationsChange,
  actions,
}: AppTopbarProps) {
  const pathname = usePathname();
  const settingsActive = pathname === '/configuracoes';

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-white/5 bg-app-bg/90 px-3 text-app-fg shadow-sm shadow-black/10 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg lg:hidden"
          aria-label="Abrir navegação"
          title="Abrir navegação"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg lg:inline-flex"
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          title={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          <Icon
            name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'}
            className="h-5 w-5"
          />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-black tracking-tight text-app-fg sm:text-base">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        {actions ? <div className="hidden min-w-0 items-center justify-end lg:flex">{actions}</div> : null}

        <NotificationsButton
          pendingNotifications={pendingNotifications}
          showLabel={false}
          active={pathname === '/notificacoes'}
          onPendingNotificationsChange={onPendingNotificationsChange}
        />

        <Link
          href="/configuracoes"
          className={[
            'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            settingsActive
              ? 'bg-app-primary/10 text-app-primary'
              : 'text-app-muted hover:bg-app-muted-surface hover:text-app-fg',
          ].join(' ')}
          aria-label="Configurações"
          title="Configurações"
        >
          <Icon name="settings" className="h-5 w-5" />
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
