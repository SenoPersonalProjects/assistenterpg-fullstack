'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';

type Props = {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({ title, right, children, className = '', contentClassName = '' }: Props) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <SectionTitle>{title}</SectionTitle>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className={['mt-3', contentClassName].join(' ')}>{children}</div>
    </Card>
  );
}
