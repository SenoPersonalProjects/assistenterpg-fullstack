// components/ui/Checkbox.tsx (MANTER ASSIM)
'use client';

import React from 'react';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: React.ReactNode;
};

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-app-fg ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-app-border bg-app-surface text-app-primary focus:ring-app-primary"
        {...props}
      />
      {label != null ? <span className="text-app-fg">{label}</span> : null}
    </label>
  );
}
