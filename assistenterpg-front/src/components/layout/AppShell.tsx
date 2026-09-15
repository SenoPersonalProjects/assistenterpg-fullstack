'use client';

import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APP_SIDEBAR_WIDTH, AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
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
  const previousPathname = useRef(pathname);
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
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    document.getElementById('conteudo-principal')?.focus();
  }, [pathname]);

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

      <MobileDrawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ariaLabel="Menu de navegação"
      >
        <AppSidebar
          groups={groups}
          activeHref={activeItem?.href ?? null}
          mobile
          onClose={() => setMobileSidebarOpen(false)}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </MobileDrawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={routeTitle}
          sidebarCollapsed={sidebarCollapsed}
          pendingNotifications={pendingNotifications}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onPendingNotificationsChange={setPendingNotifications}
        />

        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="min-h-[calc(100vh-3.5rem)] min-w-0 bg-app-bg outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
