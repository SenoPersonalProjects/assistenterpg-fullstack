import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  count?: number | string;
  action?: ReactNode;
  icon?: IconName;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  count,
  action,
  icon,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black tracking-tight text-app-fg">{title}</h2>
            {count !== undefined && (
              <span className="rounded-full border border-white/10 bg-app-muted-surface px-2 py-0.5 text-[10px] font-black text-app-muted">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm font-medium leading-relaxed text-app-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
