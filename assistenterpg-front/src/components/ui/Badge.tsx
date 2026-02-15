// components/ui/Badge.tsx - ATUALIZADO COM TITLE

'use client';

import React from 'react';

type BadgeColor = 'gray' | 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange' | 'cyan';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  title?: string; // ✅ NOVO: Tooltip nativo HTML
} & React.HTMLAttributes<HTMLSpanElement>; // ✅ NOVO: Aceitar outras props HTML

export function Badge({
  children,
  color = 'gray',
  size = 'md',
  className = '',
  title,
  ...rest // ✅ NOVO: Spread de outras props HTML
}: BadgeProps) {
  const colors: Record<BadgeColor, string> = {
    gray: 'bg-app-surface text-app-muted border border-app-border',
    green: 'bg-app-success/10 text-app-success border border-app-success/30',
    red: 'bg-app-danger/10 text-app-danger border border-app-danger/30',
    blue: 'bg-app-primary/10 text-app-primary border border-app-primary/30',
    yellow: 'bg-app-warning/10 text-app-warning border border-app-warning/30',
    orange: 'bg-app-orange/10 text-app-orange border border-app-orange/30',
    purple: 'bg-app-secondary/10 text-app-secondary border border-app-secondary/30',
    cyan: 'bg-app-info/10 text-app-info border border-app-info/30',
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizes[size]} ${colors[color]} ${className}
      `}
      title={title} // ✅ NOVO: Tooltip nativo
      {...rest} // ✅ NOVO: Outras props HTML (onClick, onMouseEnter, etc)
    >
      {children}
    </span>
  );
}
