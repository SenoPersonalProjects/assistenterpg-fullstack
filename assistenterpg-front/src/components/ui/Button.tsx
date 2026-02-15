// src/components/ui/Button.tsx
'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-1.5 py-0.5 text-xs leading-tight',
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-app-primary text-app-fg hover:bg-app-primary-hover',
    secondary:
      'bg-app-surface text-app-fg hover:bg-app-secondary-hover border border-app-border',
    ghost: 'bg-transparent text-app-primary hover:bg-app-surface',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
