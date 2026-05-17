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
type BadgeVariant = 'subtle' | 'soft' | 'outline' | 'solid';
type ResolvedBadgeVariant = Exclude<BadgeVariant, 'soft'>;

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  className?: string;
  title?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export function Badge({
  children,
  color = 'gray',
  size = 'md',
  variant = 'subtle',
  className = '',
  title,
  ...rest
}: BadgeProps) {
  const base =
    'inline-flex items-center justify-center rounded-full font-bold tracking-tight select-none transition-all duration-200';

  const sizes: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-[10px] uppercase tracking-wider',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const resolvedVariant: ResolvedBadgeVariant =
    variant === 'soft' ? 'subtle' : variant;

  const colors: Record<BadgeColor, Record<ResolvedBadgeVariant, string>> = {
    gray: {
      solid: 'bg-app-muted text-app-fg border border-app-border',
      subtle: 'bg-app-surface text-app-muted border border-app-border',
      outline: 'bg-transparent text-app-muted border border-app-border',
    },
    green: {
      solid: 'bg-app-success text-white border border-white/10 shadow-sm shadow-app-success/20',
      subtle: 'bg-app-success/10 text-app-success border border-app-success/30',
      outline: 'bg-transparent text-app-success border border-app-success/50',
    },
    red: {
      solid: 'bg-app-danger text-white border border-white/10 shadow-sm shadow-app-danger/20',
      subtle: 'bg-app-danger/10 text-app-danger border border-app-danger/30',
      outline: 'bg-transparent text-app-danger border border-app-danger/50',
    },
    blue: {
      solid: 'bg-app-primary text-white border border-white/10 shadow-sm shadow-app-primary/20',
      subtle: 'bg-app-primary/10 text-app-primary border border-app-primary/30',
      outline: 'bg-transparent text-app-primary border border-app-primary/50',
    },
    yellow: {
      solid: 'bg-app-warning text-white border border-white/10 shadow-sm shadow-app-warning/20',
      subtle: 'bg-app-warning/10 text-app-warning border border-app-warning/30',
      outline: 'bg-transparent text-app-warning border border-app-warning/50',
    },
    purple: {
      solid: 'bg-app-secondary text-white border border-white/10 shadow-sm shadow-app-secondary/20',
      subtle: 'bg-app-secondary/10 text-app-secondary border border-app-secondary/30',
      outline: 'bg-transparent text-app-secondary border border-app-secondary/50',
    },
    orange: {
      solid: 'bg-app-orange text-white border border-white/10 shadow-sm shadow-app-orange/20',
      subtle: 'bg-app-orange/10 text-app-orange border border-app-orange/30',
      outline: 'bg-transparent text-app-orange border border-app-orange/50',
    },
    cyan: {
      solid: 'bg-app-info text-white border border-white/10 shadow-sm shadow-app-info/20',
      subtle: 'bg-app-info/10 text-app-info border border-app-info/30',
      outline: 'bg-transparent text-app-info border border-app-info/50',
    },
  };

  return (
    <span
      className={`
        ${base} ${sizes[size]} ${colors[color][resolvedVariant]} ${className}
        hover:scale-105 active:scale-95
      `}
      title={title}
      {...rest}
    >
      {children}
    </span>
  );
}
