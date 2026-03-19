// components/ui/EmptyState.tsx - VERSÃƒO FINAL
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
  size?: 'sm' | 'md';
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
  size = 'md',
  children,
}: EmptyStateProps) {
  const isCard = variant === 'card';
  const isSmall = size === 'sm';

  const wrapperClasses = [
    isCard
      ? [
          'rounded-lg border border-app-border bg-app-surface text-center shadow-sm',
          isSmall ? 'p-4 max-w-none mx-0' : 'p-8 max-w-md mx-auto',
        ].join(' ')
      : isSmall
        ? 'p-3'
        : 'p-6',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconWrapClasses = isCard
    ? [
        'mx-auto flex items-center justify-center rounded-full bg-app-primary/10',
        isSmall ? 'mb-3 h-10 w-10' : 'mb-6 h-16 w-16',
      ].join(' ')
    : isSmall
      ? 'mb-2'
      : 'mb-4';
  const iconClasses = [
    isSmall ? 'h-5 w-5' : isCard ? 'h-8 w-8' : 'h-6 w-6',
    'text-app-primary',
  ].join(' ');
  const titleClasses = [
    isSmall ? 'text-sm font-semibold mb-1' : 'text-xl font-bold mb-3',
    'text-app-fg',
  ].join(' ');
  const descriptionClasses = [
    isSmall ? 'text-xs mb-3' : 'text-base mb-6',
    'text-app-muted leading-relaxed',
  ].join(' ');
  const contentClasses = isSmall ? 'mb-3' : 'mb-6';

  return (
    <div className={wrapperClasses}>
      {icon && (
        <div className={iconWrapClasses}>
          <Icon name={icon} className={iconClasses} />
        </div>
      )}

      {title && <h3 className={titleClasses}>{title}</h3>}
      <p className={descriptionClasses}>{description}</p>

      {/* ConteÃºdo adicional */}
      {children && <div className={contentClasses}>{children}</div>}

      {/* BotÃ£o de aÃ§Ã£o */}
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
