import type { ReactNode } from 'react';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import type { IconName } from '@/components/ui/Icon';

type AdminPanelScaffoldProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  count?: number | string;
  action?: ReactNode;
  stats?: StatsStripItem[];
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
};

type AdminPanelSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function AdminPanelScaffold({
  title,
  description,
  icon,
  count,
  action,
  stats,
  toolbar,
  children,
  className = '',
}: AdminPanelScaffoldProps) {
  return (
    <section className={['space-y-4', className].join(' ')}>
      <SectionHeader
        title={title}
        description={description}
        icon={icon}
        count={count}
        action={action}
      />

      {stats && stats.length > 0 ? <StatsStrip items={stats} /> : null}
      {toolbar ? <PageToolbar>{toolbar}</PageToolbar> : null}

      {children}
    </section>
  );
}

export function AdminPanelSurface({ children, className = '' }: AdminPanelSurfaceProps) {
  return (
    <div
      className={[
        'overflow-hidden rounded-xl border border-white/5 bg-app-surface/45',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export type { StatsStripItem };
