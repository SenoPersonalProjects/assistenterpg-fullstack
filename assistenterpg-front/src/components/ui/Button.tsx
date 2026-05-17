'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'glass';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'min-h-[1.75rem] px-3 py-0.5 text-xs leading-tight',
    sm: 'min-h-[2.25rem] px-4 py-1 text-xs',
    md: 'min-h-[2.75rem] px-6 py-2 text-sm',
    lg: 'min-h-[3.25rem] px-8 py-3 text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-app-primary text-white shadow-[0_4px_14px_0_rgba(var(--primary-rgb),0.39)] hover:bg-app-primary-hover hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.23)] border border-white/10',
    secondary:
      'bg-app-surface text-app-fg hover:bg-app-muted-surface border border-app-border shadow-sm',
    ghost:
      'bg-transparent text-app-primary hover:bg-app-primary/10 border border-transparent',
    destructive:
      'bg-app-danger text-white shadow-[0_4px_14px_0_rgba(var(--danger-rgb),0.39)] hover:bg-app-danger-hover border border-white/10',
    glass:
      'bg-white/10 backdrop-blur-md text-app-fg border border-white/20 hover:bg-white/20 shadow-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

