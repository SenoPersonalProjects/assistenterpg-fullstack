// src/components/ui/Card.tsx
'use client';

import React from 'react';

// herda todas as props válidas de <div>, incluindo onClick, id, etc.
type CardProps = React.ComponentProps<'div'>;

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded border border-app-border bg-app-surface shadow-sm p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
