'use client';

import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

type NpcAmeacaPageHeaderProps = {
  title: string;
  description: string;
  icon?: IconName;
  actions?: ReactNode;
  badge?: ReactNode;
};

export function NpcAmeacaPageHeader({
  title,
  description,
  icon = 'curse',
  actions,
  badge,
}: NpcAmeacaPageHeaderProps) {
  return (
    <header className="npc-hero flex flex-col gap-4 rounded-xl border border-app-border p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-app-primary/15 text-app-primary">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-app-fg sm:text-3xl">{title}</h1>
            {badge}
          </div>
          <p className="text-sm text-app-muted">{description}</p>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
