// components/ui/Checkbox.tsx (MANTER ASSIM)
'use client';

import React from 'react';
import { criarAcessibilidadeCampo } from '@/lib/ui/field-accessibility';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
};

export function Checkbox({
  label,
  error,
  helperText,
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-errormessage': ariaErrorMessage,
  ...inputProps
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const acessibilidade = criarAcessibilidadeCampo({
    id: checkboxId,
    ariaDescribedBy,
    possuiAjuda: Boolean(helperText),
    possuiErro: Boolean(error),
  });

  return (
    <div className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="inline-flex items-center gap-2 text-sm text-app-fg">
        <input
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={acessibilidade.describedBy}
          aria-errormessage={error ? acessibilidade.errorMessage : ariaErrorMessage}
          className="h-4 w-4 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary"
          {...inputProps}
        />
        {label != null ? (
          <label htmlFor={checkboxId} className="text-app-fg">
            {label}
          </label>
        ) : null}
      </div>
      {helperText ? (
        <span id={acessibilidade.helperId} className="ml-6 text-xs text-app-muted">
          {helperText}
        </span>
      ) : null}
      {error ? (
        <span id={acessibilidade.errorId} role="alert" className="ml-6 text-xs text-app-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
