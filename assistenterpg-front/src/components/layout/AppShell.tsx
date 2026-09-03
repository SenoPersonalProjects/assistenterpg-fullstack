'use client';

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APP_SIDEBAR_WIDTH, AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import {
  getActiveAppShellNavItem,
  getAppShellNavGroups,
  getAppShellRouteTitle,
} from './appShellNavigation';
import { usePendingNotifications } from './usePendingNotifications';

const SIDEBAR_STORAGE_KEY = 'assistenterpg:app-shell:sidebar-collapsed';

type AppShellProps = {
  children: ReactNode;
};

type AppShellStyle = CSSProperties & {
  '--app-sidebar-width': string;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { usuario } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const { pendingNotifications, setPendingNotifications } = usePendingNotifications();
  const isAdmin = usuario?.role === 'ADMIN';

  const groups = useMemo(() => getAppShellNavGroups(isAdmin), [isAdmin]);
  const activeItem = useMemo(
    () => getActiveAppShellNavItem(pathname, groups),
    [groups, pathname],
  );
  const routeTitle = useMemo(() => getAppShellRouteTitle(pathname), [pathname]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setSidebarCollapsed(stored === 'true');
      }
    } catch {
      // LocalStorage indisponível não deve impedir o shell de renderizar.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // Preferência visual; falha de persistência não altera navegação.
    }
  }, [sidebarCollapsed, storageReady]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  return (
    <div
      className="min-h-screen bg-app-bg text-app-fg lg:flex"
      style={{
        '--app-sidebar-width': sidebarCollapsed
          ? APP_SIDEBAR_WIDTH.collapsed
          : APP_SIDEBAR_WIDTH.expanded,
      } as AppShellStyle}
    >
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0">
        <AppSidebar
          groups={groups}
          activeHref={activeItem?.href ?? null}
          collapsed={sidebarCollapsed}
        />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[80] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-sm"
            aria-label="Fechar navegação"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative h-full">
            <AppSidebar
              groups={groups}
              activeHref={activeItem?.href ?? null}
              mobile
              onClose={() => setMobileSidebarOpen(false)}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={routeTitle}
          sidebarCollapsed={sidebarCollapsed}
          pendingNotifications={pendingNotifications}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onPendingNotificationsChange={setPendingNotifications}
        />

        <main className="min-h-[calc(100vh-3.5rem)] min-w-0 bg-app-bg">{children}</main>
      </div>
    </div>
  );
}
