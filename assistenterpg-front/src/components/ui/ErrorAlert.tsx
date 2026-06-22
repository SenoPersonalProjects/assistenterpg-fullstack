//src/components/ui/ErrorAlert.tsx
'use client';

import { Icon } from '@/components/ui/Icon';
import { formatarSuporteErro } from '@/lib/api/error-handler';
import type { ErrorSupportInfo, UserFacingError } from '@/lib/types';

type ErrorAlertProps = {
  message?: string | UserFacingError | null;
  error?: UserFacingError | null;
  support?: ErrorSupportInfo | null;
  code?: string;
  referenceId?: string;
  className?: string;
};

export function ErrorAlert({
  message,
  error,
  support,
  code,
  referenceId,
  className = '',
}: ErrorAlertProps) {
  const messageAsError =
    message && typeof message === 'object' ? message : undefined;
  const displayMessage =
    error?.message ??
    messageAsError?.message ??
    (typeof message === 'string' ? message : undefined) ??
    'Ocorreu um erro.';
  const supportText = formatarSuporteErro(
    support ?? error ?? messageAsError ?? { code, referenceId },
  );

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-app-danger/30 bg-app-danger/10 px-3 py-2 text-app-danger ${className}`}
    >
      <Icon name="warning" className="mt-0.5 h-4 w-4" />
      <div className="min-w-0">
        <div className="text-sm font-medium">{displayMessage}</div>
        {supportText ? (
          <div className="mt-1 text-xs font-normal opacity-80">
            {supportText}
          </div>
        ) : null}
      </div>
    </div>
  );
}
