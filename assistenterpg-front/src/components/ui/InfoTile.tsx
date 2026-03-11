// src/components/ui/InfoTile.tsx
'use client';

import React from 'react';

type Props = {
  label: string;
  value: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  valueClassName?: string;
};

export function InfoTile({ label, value, right, className = '', valueClassName = '' }: Props) {
  const safeValue =
    typeof value === 'number' && !Number.isFinite(value) ? '—' : value;

  return (
    <div className={['rounded border border-app-border bg-app-surface p-3', className].join(' ')}>
      <div className="mb-1 flex items-start justify-between gap-3">
        <p className="text-[10px] uppercase tracking-wide text-app-muted">{label}</p>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className={['text-sm font-medium text-app-fg', valueClassName].join(' ')}>
        {safeValue}
      </div>
    </div>
  );
}
