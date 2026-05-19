// components/layout/NavigationBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { ThemedLogo } from '@/components/ui/ThemedLogo';
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
  { href: '/anotacoes', label: 'Anotacoes', icon: 'scroll' },
  { href: '/personagens-base', label: 'Personagens', icon: 'characters' },
  { href: '/npcs-ameacas', label: 'NPC', icon: 'curse' },
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
        sticky top-0 z-50 transition-all duration-300
        ${
          isAdmin
            ? 'border-b-2 border-red-500/30 bg-app-surface/90 backdrop-blur-md shadow-lg shadow-red-500/5'
            : 'border-b border-app-border bg-app-surface/80 backdrop-blur-xl shadow-sm'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ThemedLogo size={44} priority />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black text-app-fg tracking-tight block leading-tight">
                Assistente <span className="text-app-primary">RPG</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-[0.2em] text-app-muted leading-none">
                Era Jujutsu
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const itemIsActive = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`
                    group/nav relative flex items-center h-10 rounded-xl px-4 text-sm font-bold
                    transition-all duration-300
                    ${
                      itemIsActive
                        ? 'text-app-primary bg-app-primary/10'
                        : 'text-app-muted hover:text-app-fg hover:bg-app-muted-surface'
                    }
                  `}
                >
                  <Icon name={item.icon} className={`w-5 h-5 shrink-0 transition-transform duration-300 ${itemIsActive ? 'scale-110' : 'group-hover/nav:scale-110'}`} />
                  
                  <span
                    className={`
                      ml-2 whitespace-nowrap overflow-hidden transition-all duration-300
                      ${itemIsActive ? 'max-w-[10rem] opacity-100' : 'max-w-0 opacity-0 group-hover/nav:max-w-[10rem] group-hover/nav:opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>

                  {itemIsActive && (
                    <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-app-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/configuracoes">
              <button
                className={`
                  p-2.5 rounded-xl transition-all duration-200 active:scale-90
                  ${
                    pathname === '/configuracoes'
                      ? 'bg-app-primary/10 text-app-primary shadow-inner'
                      : 'text-app-muted hover:text-app-fg hover:bg-app-muted-surface'
                  }
                `}
                title="Configurações"
              >
                <Icon name="settings" className="w-5 h-5" />
              </button>
            </Link>

            <NotificationsButton
              pendingNotifications={pendingNotifications}
              showLabel={false}
              active={pathname === '/notificacoes'}
            />

            <div className="w-px h-6 bg-app-border mx-1" />

            <UserMenu />
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const itemIsActive = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                  whitespace-nowrap transition-all duration-200
                  ${
                    itemIsActive
                      ? 'bg-app-primary text-white shadow-lg shadow-app-primary/30 scale-105'
                      : 'bg-app-muted-surface text-app-muted'
                  }
                `}
              >
                <Icon name={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
