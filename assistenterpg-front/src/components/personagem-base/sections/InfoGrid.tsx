// src/components/personagem-base/sections/InfoGrid.tsx
'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

interface InfoItem {
  label: string;
  value: string | number | null | undefined;
  badge?: React.ReactNode;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 1 | 2 | 3;
}

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon="info"
        title="Sem informações"
        description="Nada para exibir aqui."
      />
    );
  }

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4 text-sm`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-app-muted">{item.label}:</span>
          <span className="font-medium text-app-fg">{item.value ?? 'Não informado'}</span>
          {item.badge}
        </div>
      ))}
    </div>
  );
}
