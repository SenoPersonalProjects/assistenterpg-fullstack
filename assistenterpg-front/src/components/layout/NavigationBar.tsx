// components/layout/NavigationBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { UserMenu } from './UserMenu';
import { NotificationsButton } from './NotificationsButton';
import { useAuth } from '@/context/AuthContext';
import {
  apiInscreverAtualizacaoConvitesPendentes,
  apiListarConvitesPendentes,
} from '@/lib/api';

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

const baseNavItems: NavItem[] = [
  { href: '/home', label: 'Inicio', icon: 'home' },
  { href: '/campanhas', label: 'Campanhas', icon: 'campaign' },
  { href: '/personagens-base', label: 'Personagens', icon: 'characters' },
  { href: '/npcs-ameacas', label: 'NPCs/Ameacas', icon: 'curse' },
  { href: '/homebrews', label: 'Homebrews', icon: 'sparkles' },
  { href: '/suplementos', label: 'Suplementos', icon: 'book' },
  { href: '/compendio', label: 'Compendio', icon: 'rules' },
  // FUTURO: { href: '/marketplace', label: 'Marketplace', icon: 'store' },
];

export function NavigationBar() {
  const pathname = usePathname();
  const { usuario } = useAuth();
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const userId = usuario?.id;

  const isAdmin = usuario?.role === 'ADMIN';
  const adminNavItem: NavItem = {
    href: '/suplementos/admin',
    label: 'Admin Conteudo',
    icon: 'settings',
  };
  const navItems: NavItem[] = isAdmin
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  useEffect(() => {
    let active = true;
    let intervalId: number | null = null;

    async function carregarNotificacoes() {
      if (!userId) {
        if (active) {
          setPendingNotifications(0);
        }
        return;
      }

      try {
        const convites = await apiListarConvitesPendentes();
        if (active) {
          setPendingNotifications(convites.length);
        }
      } catch {
        if (active) {
          setPendingNotifications(0);
        }
      }
    }

    void carregarNotificacoes();

    const unsubscribe = apiInscreverAtualizacaoConvitesPendentes((total) => {
      if (!active || !userId) return;

      if (typeof total === 'number') {
        setPendingNotifications(total);
        return;
      }

      void carregarNotificacoes();
    });

    if (userId) {
      intervalId = window.setInterval(() => {
        void carregarNotificacoes();
      }, 60_000);
    }

    return () => {
      active = false;
      unsubscribe();

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [userId]);

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 bg-app-surface border-b shadow-sm
        ${isAdmin ? 'border-2 border-red-500/50' : 'border-app-border'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-xl">JK</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-app-fg">Assistente RPG</span>
              <span className="block text-xs text-app-muted">Jujutsu Kaisen</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const itemIsActive = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`
                    group/nav flex items-center overflow-hidden rounded-lg py-2 text-sm font-medium
                    transition-all duration-200
                    ${
                      itemIsActive
                        ? 'px-3 bg-app-primary/10 text-app-primary'
                        : 'px-2.5 text-app-muted hover:text-app-fg hover:bg-app-bg hover:px-3 focus-visible:text-app-fg focus-visible:bg-app-bg focus-visible:px-3'
                    }
                  `}
                >
                  <Icon name={item.icon} className="w-5 h-5 shrink-0" />
                  <span
                    className={`
                      overflow-hidden whitespace-nowrap transition-all duration-200
                      ${
                        itemIsActive
                          ? 'ml-2 max-w-[9rem] opacity-100'
                          : 'ml-0 max-w-0 opacity-0 group-hover/nav:ml-2 group-hover/nav:max-w-[9rem] group-hover/nav:opacity-100 group-focus/nav:ml-2 group-focus/nav:max-w-[9rem] group-focus/nav:opacity-100'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/configuracoes">
              <button
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    pathname === '/configuracoes'
                      ? 'bg-app-primary/10 text-app-primary'
                      : 'text-app-muted hover:text-app-fg hover:bg-app-bg'
                  }
                `}
                title="Configuracoes"
              >
                <Icon name="settings" className="w-6 h-6" />
              </button>
            </Link>

            <NotificationsButton
              pendingNotifications={pendingNotifications}
              showLabel={false}
              active={pathname === '/notificacoes'}
            />

            <UserMenu />
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                whitespace-nowrap transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-app-primary/10 text-app-primary'
                    : 'text-app-muted hover:text-app-fg hover:bg-app-bg'
                }
              `}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
