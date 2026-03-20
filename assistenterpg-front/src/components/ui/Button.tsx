// src/components/ui/Button.tsx
'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
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
    'inline-flex items-center justify-center rounded-lg font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'min-h-[1.75rem] px-2 py-0.5 text-xs leading-tight',
    sm: 'min-h-[2rem] px-2.5 py-1 text-xs',
    md: 'min-h-[2.5rem] px-4 py-2 text-sm',
    lg: 'min-h-[2.75rem] px-5 py-3 text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-app-primary text-app-fg shadow-sm hover:bg-app-primary-hover hover:shadow',
    secondary:
      'bg-app-surface text-app-fg hover:bg-app-secondary-hover border border-app-border',
    ghost:
      'bg-transparent text-app-primary hover:bg-app-surface border border-transparent hover:border-app-border',
    destructive:
      'bg-app-danger text-app-fg shadow-sm hover:bg-app-danger-hover hover:shadow',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
