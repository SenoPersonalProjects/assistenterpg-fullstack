import type { ReactNode } from 'react';

type PageToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function PageToolbar({ children, className = '' }: PageToolbarProps) {
  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/55 p-3 shadow-sm shadow-black/5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
