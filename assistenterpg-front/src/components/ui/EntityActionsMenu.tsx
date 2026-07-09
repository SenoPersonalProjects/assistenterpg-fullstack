'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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

type MenuPosition = {
  left: number;
  maxHeight: number;
  top: number;
  width: number;
};

const MENU_WIDTH = 224;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function EntityActionsMenu({
  items,
  align = 'end',
  ariaLabel = 'Ações da entidade',
  buttonTitle = 'Mais ações',
  className = '',
}: EntityActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleItems = useMemo(() => items.filter((item) => !item.hidden), [items]);

  const updateMenuPosition = useCallback(() => {
    const trigger = buttonRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuElement = menuRef.current;
    const maxMenuWidth = Math.max(160, window.innerWidth - VIEWPORT_MARGIN * 2);
    const menuWidth = Math.min(menuElement?.offsetWidth || MENU_WIDTH, maxMenuWidth);
    const maxMenuHeight = Math.max(120, window.innerHeight - VIEWPORT_MARGIN * 2);
    const estimatedHeight = Math.max(44, visibleItems.length * 40 + 8);
    const menuHeight = Math.min(menuElement?.offsetHeight || estimatedHeight, maxMenuHeight);
    const maxLeft = window.innerWidth - VIEWPORT_MARGIN - menuWidth;
    const maxTop = window.innerHeight - VIEWPORT_MARGIN - menuHeight;

    const preferredLeft =
      align === 'end' ? triggerRect.right - menuWidth : triggerRect.left;
    const left = clamp(
      preferredLeft,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, maxLeft),
    );

    const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = triggerRect.top - VIEWPORT_MARGIN;
    const shouldOpenUp = menuHeight + TRIGGER_GAP > spaceBelow && spaceAbove > spaceBelow;
    const preferredTop = shouldOpenUp
      ? triggerRect.top - menuHeight - TRIGGER_GAP
      : triggerRect.bottom + TRIGGER_GAP;
    const top = clamp(
      preferredTop,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, maxTop),
    );

    setMenuPosition({ left, maxHeight: maxMenuHeight, top, width: menuWidth });
  }, [align, visibleItems.length]);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(updateMenuPosition);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleViewportChange() {
      updateMenuPosition();
    }

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  if (visibleItems.length === 0) return null;

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[1000] overflow-x-hidden overflow-y-auto rounded-xl border border-app-border bg-app-surface p-1 shadow-2xl shadow-black/20 backdrop-blur-xl"
            style={{
              left: menuPosition?.left ?? 0,
              maxHeight: menuPosition?.maxHeight,
              top: menuPosition?.top ?? 0,
              visibility: menuPosition ? 'visible' : 'hidden',
              width: menuPosition?.width ?? MENU_WIDTH,
            }}
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
                  aria-disabled={item.disabled}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={['relative inline-flex', className].join(' ')}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            setMenuPosition(null);
            return;
          }

          updateMenuPosition();
          setOpen(true);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        title={buttonTitle}
      >
        <Icon name="menu-horizontal" className="h-5 w-5" />
      </button>

      {menu}
    </div>
  );
}
