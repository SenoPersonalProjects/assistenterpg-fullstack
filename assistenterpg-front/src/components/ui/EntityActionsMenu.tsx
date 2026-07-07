'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';

export type EntityActionsMenuItem = {
  id: string;
  label: string;
  icon?: IconName;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  hidden?: boolean;
};

type EntityActionsMenuProps = {
  items: EntityActionsMenuItem[];
  align?: 'start' | 'end';
  ariaLabel?: string;
  buttonTitle?: string;
  className?: string;
};

export function EntityActionsMenu({
  items,
  align = 'end',
  ariaLabel = 'Ações da entidade',
  buttonTitle = 'Mais ações',
  className = '',
}: EntityActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleItems = useMemo(() => items.filter((item) => !item.hidden), [items]);

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

  if (visibleItems.length === 0) return null;

  const menuAlignment = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div ref={rootRef} className={['relative inline-flex', className].join(' ')}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={buttonTitle}
      >
        <Icon name="menu-horizontal" className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-app-border bg-app-surface p-1 shadow-2xl shadow-black/20 backdrop-blur-xl',
            menuAlignment,
          ].join(' ')}
        >
          {visibleItems.map((item) => {
            const itemClasses = [
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors',
              item.destructive
                ? 'text-app-danger hover:bg-app-danger/10'
                : 'text-app-muted hover:bg-app-muted-surface hover:text-app-fg',
              item.disabled ? 'pointer-events-none opacity-45' : '',
            ].join(' ');
            const content = (
              <>
                {item.icon && <Icon name={item.icon} className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </>
            );

            if (item.href && !item.disabled) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  className={itemClasses}
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={itemClasses}
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
