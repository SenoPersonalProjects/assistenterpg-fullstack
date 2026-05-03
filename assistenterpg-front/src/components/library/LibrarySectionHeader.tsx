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
    <div className="library-section-head">
      <div className="min-w-0">
        <p className="library-section-head__kicker">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-app-muted/70">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {meta}
        {actions}
      </div>
    </div>
  );
}
