//src/components/ui/ErrorAlert.tsx
'use client';

import { Icon } from '@/components/ui/Icon';

type ErrorAlertProps = {
  message: string;
  className?: string;
};

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-app-danger/30 bg-app-danger/10 px-3 py-2 text-app-danger ${className}`}
    >
      <Icon name="warning" className="mt-0.5 h-4 w-4" />
      <div className="min-w-0 text-sm font-medium">{message}</div>
    </div>
  );
}
