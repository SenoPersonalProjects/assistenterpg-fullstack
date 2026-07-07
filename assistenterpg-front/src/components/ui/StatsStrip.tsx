import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type StatsStripTone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export type StatsStripItem = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  icon?: IconName;
  tone?: StatsStripTone;
  helper?: ReactNode;
};

type StatsStripProps = {
  items: StatsStripItem[];
  className?: string;
};

const toneClasses: Record<StatsStripTone, string> = {
  default: 'text-app-fg bg-app-muted-surface',
  primary: 'text-app-primary bg-app-primary/10',
  success: 'text-app-success bg-app-success/10',
  warning: 'text-app-warning bg-app-warning/10',
  danger: 'text-app-danger bg-app-danger/10',
};

export function StatsStrip({ items, className = '' }: StatsStripProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={[
        'grid overflow-hidden rounded-xl border border-white/5 bg-app-surface/45 sm:grid-cols-2 lg:grid-cols-none lg:auto-cols-fr lg:grid-flow-col',
        className,
      ].join(' ')}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex min-w-0 items-center gap-3 border-b border-white/5 p-3 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0 lg:border-r"
        >
          {item.icon && (
            <span
              className={[
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                toneClasses[item.tone ?? 'default'],
              ].join(' ')}
            >
              <Icon name={item.icon} className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
              {item.label}
            </p>
            <p className="truncate text-lg font-black leading-tight text-app-fg">{item.value}</p>
            {item.helper && (
              <p className="mt-0.5 truncate text-xs font-medium text-app-muted">{item.helper}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
