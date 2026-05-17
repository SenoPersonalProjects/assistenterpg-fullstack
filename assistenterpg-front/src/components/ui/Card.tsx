'use client';

import React from 'react';

type CardVariant = 'default' | 'flat' | 'glass' | 'outline';

type CardProps = React.ComponentProps<'div'> & {
  variant?: CardVariant;
  interactive?: boolean;
};

export function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-app-card border border-app-border shadow-sm',
    flat: 'bg-app-surface/50 border border-transparent',
    glass: 'bg-app-surface/40 backdrop-blur-md border border-app-border/30 shadow-lg',
    outline: 'bg-transparent border border-app-border',
  };

  const interactiveClasses = interactive
    ? 'hover:translate-y-[-2px] hover:shadow-md active:translate-y-0 active:scale-[0.98] cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
