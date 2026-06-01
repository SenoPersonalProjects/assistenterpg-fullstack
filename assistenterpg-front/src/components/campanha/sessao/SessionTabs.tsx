'use client';

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
  return (
    <div
      className={`session-tabs session-tabs--${variant} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const ativo = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            title={tab.label}
            aria-label={tab.label}
            aria-selected={ativo}
            role="tab"
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

