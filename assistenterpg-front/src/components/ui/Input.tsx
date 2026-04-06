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
  const hasRightIcon = Boolean(rightIcon);
  const rightIconButton = hasRightIcon && typeof onRightIconClick === 'function';

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-app-fg">{label}</label>}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={icon} className="w-4 h-4 text-app-muted" />
          </div>
        )}

        {hasRightIcon && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightIconButton ? (
              <button
                type="button"
                onClick={onRightIconClick}
                aria-label={rightIconLabel}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-app-muted transition-colors hover:text-app-fg hover:bg-app-border/30"
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
          className={`
            w-full border border-app-border bg-app-surface text-app-fg rounded 
            py-2 text-sm outline-none 
            focus:ring-2 focus:ring-app-primary focus:border-app-primary
            transition-colors
            ${icon ? 'pl-10' : 'pl-3'}
            ${hasRightIcon ? 'pr-10' : 'pr-3'}
            ${error ? 'border-app-danger focus:ring-app-danger focus:border-app-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <span className="text-xs text-app-danger">{error}</span>}
      {helperText && !error && <span className="text-xs text-app-muted">{helperText}</span>}
    </div>
  );
}
