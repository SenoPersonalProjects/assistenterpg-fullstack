'use client';

import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

type LibraryPageHeaderProps = {
  title: string;
  description: string;
  icon: IconName;
  actions?: ReactNode;
};

export function LibraryPageHeader({
  title,
  description,
  icon,
  actions,
}: LibraryPageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-app-border/30">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary shadow-inner">
          <Icon name={icon} className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-4xl font-black tracking-tight text-app-fg">
            {title}
          </h1>
          <p className="mt-1 text-base font-medium text-app-muted max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
