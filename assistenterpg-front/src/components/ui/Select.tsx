// src/components/ui/Select.tsx
'use client';

import React from 'react';

type Option = { value: string; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Option[];
};

export function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  children,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-app-fg">{label}</label>}
      <select
        className={`border border-app-border bg-app-surface text-app-fg rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-all ${
          error ? 'border-app-danger focus:ring-app-danger' : ''
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <span className="text-xs text-app-danger">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-app-muted">{helperText}</span>
      )}
    </div>
  );
}
