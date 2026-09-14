'use client';

import { useRef } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

type SessionTabItem = {
  id: string;
  label: string;
  count?: number;
  icon?: IconName;
  disabled?: boolean;
};

type SessionTabsProps = {
  tabs: SessionTabItem[];
  activeId: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
};

export function SessionTabs({
  tabs,
  activeId,
  onChange,
  className = '',
  variant = 'default',
}: SessionTabsProps) {
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  function moverFoco(indiceAtual: number, direcao: 'inicio' | 'fim' | 1 | -1) {
    const habilitadas = tabs
      .map((tab, indice) => ({ tab, indice }))
      .filter(({ tab }) => !tab.disabled);
    const posicao = habilitadas.findIndex(({ indice }) => indice === indiceAtual);
    const destino = direcao === 'inicio'
      ? habilitadas[0]
      : direcao === 'fim'
        ? habilitadas.at(-1)
        : habilitadas[(posicao + direcao + habilitadas.length) % habilitadas.length];
    if (!destino) return;
    tabsRef.current[destino.indice]?.focus();
    onChange(destino.tab.id);
  }

  return (
    <div
      className={`session-tabs session-tabs--${variant} ${className}`}
      role="tablist"
    >
      {tabs.map((tab, indice) => {
        const ativo = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(element) => { tabsRef.current[indice] = element; }}
            type="button"
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            title={tab.label}
            aria-label={tab.label}
            aria-selected={ativo}
            role="tab"
            id={`session-tab-${tab.id}`}
            aria-controls={`session-panel-${tab.id}`}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') { event.preventDefault(); moverFoco(indice, 1); }
              if (event.key === 'ArrowLeft') { event.preventDefault(); moverFoco(indice, -1); }
              if (event.key === 'Home') { event.preventDefault(); moverFoco(indice, 'inicio'); }
              if (event.key === 'End') { event.preventDefault(); moverFoco(indice, 'fim'); }
            }}
            className={
              ativo
                ? 'session-tab session-tab--active'
                : 'session-tab'
            }
          >
            {tab.icon ? <Icon name={tab.icon} className="h-3.5 w-3.5" /> : null}
            <span
              className={
                variant === 'icon-only' ? 'sr-only' : 'session-tab__label'
              }
            >
              {tab.label}
            </span>
            {variant === 'icon-only' && ativo ? (
              <span className="ml-1 text-[10px] font-semibold sm:hidden">{tab.label}</span>
            ) : null}
            {typeof tab.count === 'number' ? (
              <span className="session-tab__count">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export type { SessionTabItem };

