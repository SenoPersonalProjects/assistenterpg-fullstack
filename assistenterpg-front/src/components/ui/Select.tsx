// src/components/ui/Select.tsx
'use client';

import React from 'react';
import { criarAcessibilidadeCampo } from '@/lib/ui/field-accessibility';

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
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-errormessage': ariaErrorMessage,
  ...selectProps
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const acessibilidade = criarAcessibilidadeCampo({
    id: selectId,
    ariaDescribedBy,
    possuiAjuda: Boolean(helperText),
    possuiErro: Boolean(error),
  });

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-app-fg">{label}</label>}
      <select
        id={selectId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={acessibilidade.describedBy}
        aria-errormessage={error ? acessibilidade.errorMessage : ariaErrorMessage}
        className={`border border-app-border bg-app-surface text-app-fg rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-all ${
          error ? 'border-app-danger focus:ring-app-danger' : ''
        } ${className}`}
        {...selectProps}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {helperText && (
        <span id={acessibilidade.helperId} className="text-xs text-app-muted">
          {helperText}
        </span>
      )}
      {error && (
        <span id={acessibilidade.errorId} role="alert" className="text-xs text-app-danger">
          {error}
        </span>
      )}
    </div>
  );
}
