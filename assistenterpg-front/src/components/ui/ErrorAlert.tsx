//src/components/ui/ErrorAlert.tsx
'use client';

type ErrorAlertProps = {
  message: string;
  className?: string;
};

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <p className={`text-sm text-app-danger ${className}`}>
      {message}
    </p>
  );
}
