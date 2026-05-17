'use client';

import type { ReactNode } from 'react';

type LibrarySectionHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function LibrarySectionHeader({
  title,
  description,
  meta,
  actions,
}: LibrarySectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-4 border-b border-app-border/20">
      <div className="min-w-0">
        <h2 className="text-2xl font-black text-app-fg tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm font-medium text-app-muted">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {meta && <div className="text-xs font-bold text-app-muted uppercase tracking-widest">{meta}</div>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
