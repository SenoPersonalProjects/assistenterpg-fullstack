'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

type SessionPanelProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  tone?: 'main' | 'control' | 'aside';
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  stickyHeader?: boolean;
  children?: ReactNode;
};

export function SessionPanel({
  title,
  subtitle,
  right,
  tone = 'main',
  className = '',
  bodyClassName = '',
  headerClassName = '',
  stickyHeader = true,
  children,
}: SessionPanelProps) {
  const headerClasses = [
    'session-panel-head',
    stickyHeader ? 'session-panel-head--sticky' : '',
    headerClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const bodyClasses = ['session-panel-body', bodyClassName].filter(Boolean).join(' ');

  return (
    <Card
      className={`session-panel session-panel-frame session-panel--${tone} ${className}`}
    >
      <div className={headerClasses}>
        <div className="min-w-0">
          <h2 className="session-panel-title">{title}</h2>
          {subtitle ? <p className="session-panel-subtitle">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children ? <div className={bodyClasses}>{children}</div> : null}
    </Card>
  );
}
