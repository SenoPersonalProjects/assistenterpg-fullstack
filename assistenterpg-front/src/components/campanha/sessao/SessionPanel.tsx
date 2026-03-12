'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

type SessionPanelProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
};

export function SessionPanel({
  title,
  subtitle,
  right,
  className = '',
  bodyClassName = '',
  children,
}: SessionPanelProps) {
  return (
    <Card className={`session-panel ${className}`}>
      <div className="session-panel-head">
        <div className="min-w-0">
          <h2 className="session-panel-title">{title}</h2>
          {subtitle ? <p className="session-panel-subtitle">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children ? <div className={bodyClassName || 'space-y-2'}>{children}</div> : null}
    </Card>
  );
}
