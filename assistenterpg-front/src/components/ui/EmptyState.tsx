// components/ui/EmptyState.tsx - VERSÃO FINAL
'use client';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { ReactNode } from 'react';

type EmptyStateProps = {
  title?: string;
  description: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'plain' | 'card';
  icon?: IconName;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  className = '',
  actionLabel,
  onAction,
  variant = 'plain',
  icon,
  children,
}: EmptyStateProps) {
  const isCard = variant === 'card';

  return (
    <div
      className={[
        isCard 
          ? 'rounded-lg border border-app-border bg-app-surface p-8 text-center max-w-md mx-auto shadow-sm' 
          : 'p-6',
        className,
      ].join(' ')}
    >
      {icon && (
        <div className={isCard ? 'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-app-primary/10' : 'mb-4'}>
          <Icon
            name={icon}
            className={[
              isCard ? 'h-8 w-8' : 'h-6 w-6',
              'text-app-primary',
            ].join(' ')}
          />
        </div>
      )}

      {title && <h3 className="text-xl font-bold text-app-fg mb-3">{title}</h3>}
      <p className="text-app-muted text-base mb-6 leading-relaxed">{description}</p>

      {/* Conteúdo adicional */}
      {children && <div className="mb-6">{children}</div>}

      {/* Botão de ação */}
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
