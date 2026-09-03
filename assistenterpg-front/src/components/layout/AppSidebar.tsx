'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { ThemedLogo } from '@/components/ui/ThemedLogo';
import type { AppShellNavGroup } from './appShellNavigation';

export const APP_SIDEBAR_WIDTH = {
  expanded: '16rem',
  collapsed: '4.5rem',
} as const;

type AppSidebarProps = {
  groups: AppShellNavGroup[];
  activeHref: string | null;
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
};

export function AppSidebar({
  groups,
  activeHref,
  collapsed = false,
  mobile = false,
  onNavigate,
  onClose,
}: AppSidebarProps) {
  const compact = collapsed && !mobile;

  return (
    <aside
      className={[
        'flex h-full min-h-0 flex-col border-white/5 bg-app-surface/95 text-app-fg shadow-xl shadow-black/10 backdrop-blur-xl',
        mobile
          ? 'w-72 max-w-[calc(100vw-2rem)] border-r'
          : compact
            ? 'w-[4.5rem] border-r transition-[width] duration-300'
            : 'w-64 border-r transition-[width] duration-300',
      ].join(' ')}
      aria-label="Navegação principal"
    >
      <div
        className={[
          'flex h-16 shrink-0 items-center border-b border-white/5 px-3',
          compact ? 'justify-center' : 'justify-between gap-3',
        ].join(' ')}
      >
        <Link
          href="/home"
          onClick={onNavigate}
          className={[
            'flex min-w-0 items-center gap-3 rounded-xl text-left transition-colors hover:bg-white/5',
            compact ? 'justify-center p-2' : 'px-2 py-2',
          ].join(' ')}
          aria-label="Ir para o início"
          title={compact ? 'Assistente RPG' : undefined}
        >
          <ThemedLogo size={compact ? 34 : 40} priority />
          {!compact && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-tight text-app-fg">
                Assistente <span className="text-app-primary">RPG</span>
              </span>
              <span className="block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-app-muted">
                Maledicência RPG
              </span>
            </span>
          )}
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-white/5 hover:text-app-fg"
            aria-label="Fechar navegação"
            title="Fechar navegação"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-none">
        {groups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!compact && (
              <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-app-muted/75">
                {group.label}
              </p>
            )}

            {group.items.map((item) => {
              const active = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={compact ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group relative flex h-10 items-center rounded-xl text-sm font-bold transition-all duration-200',
                    compact ? 'justify-center px-0' : 'gap-3 px-3',
                    active
                      ? 'bg-app-primary/10 text-app-primary ring-1 ring-app-primary/25'
                      : 'text-app-muted hover:bg-white/5 hover:text-app-fg',
                  ].join(' ')}
                >
                  <Icon
                    name={item.icon}
                    className={[
                      'h-5 w-5 shrink-0 transition-transform duration-200',
                      active ? 'scale-105' : 'group-hover:scale-105',
                    ].join(' ')}
                  />
                  {!compact && <span className="truncate">{item.label}</span>}
                  {active && (
                    <span className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-app-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.45)]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
