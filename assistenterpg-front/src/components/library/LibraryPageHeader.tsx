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
    <header className="library-page-header">
      <div className="flex min-w-0 items-start gap-4">
        <div className="library-page-header__icon">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-app-fg sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{description}</p>
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
