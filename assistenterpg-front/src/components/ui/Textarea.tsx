// components/ui/Textarea.tsx
'use client';

import React from 'react';
import { criarAcessibilidadeCampo } from '@/lib/ui/field-accessibility';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-errormessage': ariaErrorMessage,
  ...textareaProps
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const acessibilidade = criarAcessibilidadeCampo({
    id: textareaId,
    ariaDescribedBy,
    possuiAjuda: Boolean(helperText),
    possuiErro: Boolean(error),
  });
  const base =
    'w-full rounded border bg-app-surface text-app-fg px-3 py-2 text-sm transition-colors resize-vertical';

  const stateClasses = error
    ? 'border-app-danger focus:border-app-danger focus:ring-1 focus:ring-app-danger'
    : 'border-app-border focus:border-app-primary focus:ring-1 focus:ring-app-primary';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-app-fg">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={acessibilidade.describedBy}
        aria-errormessage={error ? acessibilidade.errorMessage : ariaErrorMessage}
        className={`${base} ${stateClasses} ${className}`}
        {...textareaProps}
      />
      {helperText && (
        <p id={acessibilidade.helperId} className="text-xs text-app-muted">
          {helperText}
        </p>
      )}
      {error && (
        <p id={acessibilidade.errorId} role="alert" className="text-xs text-app-danger">
          {error}
        </p>
      )}
    </div>
  );
}
