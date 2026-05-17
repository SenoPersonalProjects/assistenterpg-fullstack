'use client';

import React from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: IconName;
  rightIcon?: IconName;
  rightIconLabel?: string;
  onRightIconClick?: () => void;
};

export function Input({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  rightIconLabel,
  onRightIconClick,
  className = '',
  ...props
}: InputProps) {
  const inputId = React.useId();
  const hasRightIcon = Boolean(rightIcon);
  const rightIconButton = hasRightIcon && typeof onRightIconClick === 'function';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-app-fg/90 ml-1 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-app-muted group-focus-within:text-app-primary transition-colors duration-200">
            <Icon name={icon} className="w-4 h-4" />
          </div>
        )}

        {hasRightIcon && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            {rightIconButton ? (
              <button
                type="button"
                onClick={onRightIconClick}
                aria-label={rightIconLabel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-app-muted transition-all duration-200 hover:text-app-fg hover:bg-app-border/40 active:scale-90"
              >
                <Icon name={rightIcon as IconName} className="w-4 h-4" />
              </button>
            ) : (
              <Icon
                name={rightIcon as IconName}
                className="w-4 h-4 text-app-muted"
              />
            )}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full rounded-xl border bg-app-surface py-2.5 text-sm ring-offset-app-bg transition-all duration-200
            placeholder:text-app-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 focus-visible:ring-offset-1
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon ? 'pl-10' : 'pl-4'}
            ${hasRightIcon ? 'pr-11' : 'pr-4'}
            ${
              error
                ? 'border-app-danger focus-visible:ring-app-danger/40'
                : 'border-app-border hover:border-app-primary/30 focus-visible:border-app-primary'
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <span className="text-xs font-medium text-app-danger ml-1 animate-fade-in-up">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-app-muted ml-1">{helperText}</span>
      )}
    </div>
  );
}
