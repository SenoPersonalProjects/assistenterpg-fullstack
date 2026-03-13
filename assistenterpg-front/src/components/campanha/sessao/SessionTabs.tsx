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
};

export function SessionTabs({
  tabs,
  activeId,
  onChange,
  className = '',
}: SessionTabsProps) {
  return (
    <div className={`session-tabs ${className}`}>
      {tabs.map((tab) => {
        const ativo = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className={
              ativo
                ? 'session-tab session-tab--active'
                : 'session-tab'
            }
          >
            {tab.icon ? <Icon name={tab.icon} className="h-3.5 w-3.5" /> : null}
            <span>{tab.label}</span>
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

