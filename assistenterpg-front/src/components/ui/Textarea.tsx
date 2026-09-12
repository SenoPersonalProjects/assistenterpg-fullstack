// components/ui/Textarea.tsx
'use client';

import React from 'react';

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
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = props.id ?? generatedId;
  const messageId = `${textareaId}-description`;
  const describedBy = [props['aria-describedby'], error || helperText ? messageId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;
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
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${base} ${stateClasses} ${className}`}
        {...props}
      />
      {error && <p id={messageId} className="text-xs text-app-danger">{error}</p>}
      {helperText && !error && (
        <p id={messageId} className="text-xs text-app-muted">{helperText}</p>
      )}
    </div>
  );
}
