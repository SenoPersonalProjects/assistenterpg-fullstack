'use client';

import React from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: IconName; // ✅ NOVO
};

export function Input({ 
  label, 
  error, 
  helperText, 
  icon, 
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-app-fg">{label}</label>}
      
      {/* ✅ Wrapper com ícone */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={icon} className="w-4 h-4 text-app-muted" />
          </div>
        )}
        
        <input
          className={`
            w-full border border-app-border bg-app-surface text-app-fg rounded 
            py-2 text-sm outline-none 
            focus:ring-2 focus:ring-app-primary focus:border-app-primary
            transition-colors
            ${icon ? 'pl-10 pr-3' : 'px-3'}
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
