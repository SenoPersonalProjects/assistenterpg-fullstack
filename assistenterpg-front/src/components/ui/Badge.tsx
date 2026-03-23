// components/ui/Badge.tsx - ATUALIZADO COM TITLE

'use client';

import React from 'react';

type BadgeColor =
  | 'gray'
  | 'green'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'cyan';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
type BadgeVariant = 'soft' | 'outline' | 'solid';

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  className?: string;
  title?: string; // ✅ NOVO: Tooltip nativo HTML
} & React.HTMLAttributes<HTMLSpanElement>; // ✅ NOVO: Aceitar outras props HTML

export function Badge({
  children,
  color = 'gray',
  size = 'md',
  variant = 'soft',
  className = '',
  title,
  ...rest // ✅ NOVO: Spread de outras props HTML
}: BadgeProps) {
  const colors: Record<BadgeColor, Record<BadgeVariant, string>> = {
    gray: {
      soft: 'bg-app-surface text-app-muted border border-app-border',
      outline: 'bg-transparent text-app-muted border border-app-border',
      solid: 'bg-app-surface text-app-fg border border-app-border',
    },
    green: {
      soft: 'bg-app-success/10 text-app-success border border-app-success/30',
      outline: 'bg-transparent text-app-success border border-app-success/40',
      solid: 'bg-app-success text-app-fg border border-app-success/60',
    },
    red: {
      soft: 'bg-app-danger/10 text-app-danger border border-app-danger/30',
      outline: 'bg-transparent text-app-danger border border-app-danger/40',
      solid: 'bg-app-danger text-app-fg border border-app-danger/60',
    },
    blue: {
      soft: 'bg-app-primary/10 text-app-primary border border-app-primary/30',
      outline: 'bg-transparent text-app-primary border border-app-primary/40',
      solid: 'bg-app-primary text-app-fg border border-app-primary/60',
    },
    yellow: {
      soft: 'bg-app-warning/10 text-app-warning border border-app-warning/30',
      outline: 'bg-transparent text-app-warning border border-app-warning/40',
      solid: 'bg-app-warning text-app-fg border border-app-warning/60',
    },
    orange: {
      soft: 'bg-app-orange/10 text-app-orange border border-app-orange/30',
      outline: 'bg-transparent text-app-orange border border-app-orange/40',
      solid: 'bg-app-orange text-app-fg border border-app-orange/60',
    },
    purple: {
      soft: 'bg-app-secondary/10 text-app-secondary border border-app-secondary/30',
      outline: 'bg-transparent text-app-secondary border border-app-secondary/40',
      solid: 'bg-app-secondary text-app-fg border border-app-secondary/60',
    },
    cyan: {
      soft: 'bg-app-info/10 text-app-info border border-app-info/30',
      outline: 'bg-transparent text-app-info border border-app-info/40',
      solid: 'bg-app-info text-app-fg border border-app-info/60',
    },
  };

  const sizes: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-[9px] leading-tight',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizes[size]} ${colors[color][variant]} ${className}
      `}
      title={title} // ✅ NOVO: Tooltip nativo
      {...rest} // ✅ NOVO: Outras props HTML (onClick, onMouseEnter, etc)
    >
      {children}
    </span>
  );
}
