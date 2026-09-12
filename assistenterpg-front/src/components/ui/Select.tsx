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
  const generatedId = React.useId();
  const selectId = props.id ?? generatedId;
  const messageId = `${selectId}-description`;
  const describedBy = [props['aria-describedby'], error || helperText ? messageId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-app-fg">{label}</label>}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
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
      {error && <span id={messageId} className="text-xs text-app-danger">{error}</span>}
      {!error && helperText && (
        <span id={messageId} className="text-xs text-app-muted">{helperText}</span>
      )}
    </div>
  );
}
