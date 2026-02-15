// src/components/ui/ClickableCard.tsx
'use client';

import React from 'react';

type ClickableCardProps = {
  onClick: () => void;
  disabled?: boolean;
  error?: boolean;
  filled?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

export function ClickableCard({
  onClick,
  disabled = false,
  error = false,
  filled = false,
  padding = 'md',
  children,
  className = '',
}: ClickableCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-disabled={disabled}
      className={`
        group w-full rounded-lg border-2 transition-all
        ${error 
          ? 'border-app-danger hover:border-app-danger focus:ring-2 focus:ring-app-danger/20' 
          : filled
            ? 'border-app-primary/30 hover:border-app-primary focus:ring-2 focus:ring-app-primary/20'
            : 'border-dashed border-app-border hover:border-app-primary focus:ring-2 focus:ring-app-primary/20'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-app-surface' 
          : 'cursor-pointer bg-app-card hover:bg-app-surface'
        }
        ${paddingClasses[padding]}
        focus:outline-none
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
