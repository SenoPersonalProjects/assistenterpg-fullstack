import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { ReactNode } from 'react';

type LegacyLottieAsset =
  | 'LOADING_SPINNER'
  | 'LOADING_DICE'
  | 'SUCCESS_CHECK'
  | 'MAGIC_SPARKLES'
  | 'EMPTY_BOX'
  | 'GHOST_SEARCH'
  | 'DRAGON_EYE'
  | 'FIRE_FLAME';

const LOTTIE_ICON_MAP: Record<LegacyLottieAsset, IconName> = {
  LOADING_SPINNER: 'spinner',
  LOADING_DICE: 'dice',
  SUCCESS_CHECK: 'success',
  MAGIC_SPARKLES: 'sparkles',
  EMPTY_BOX: 'inventory',
  GHOST_SEARCH: 'search',
  DRAGON_EYE: 'eye',
  FIRE_FLAME: 'fire',
};

type EmptyStateProps = {
  title?: string;
  description: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'plain' | 'card' | 'session';
  icon?: IconName;
  lottie?: LegacyLottieAsset;
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
  lottie,
  size = 'md',
  children,
}: EmptyStateProps) {
  const isCard = variant === 'card';
  const isSession = variant === 'session';
  const isSmall = size === 'sm';

  const wrapperClasses = [
    isSession
      ? [
          'rounded-xl border border-app-border bg-app-surface text-left shadow-sm',
          isSmall ? 'p-4' : 'p-6',
        ].join(' ')
      : isCard
      ? [
          'rounded-2xl border border-app-border bg-app-surface text-center shadow-lg',
          isSmall ? 'p-6 max-w-none mx-0' : 'p-12 max-w-md mx-auto',
        ].join(' ')
      : isSmall
        ? 'p-4'
        : 'p-8',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mediaWrapClasses = isSession
    ? [
        'flex items-center justify-center rounded-xl bg-app-primary/10',
        isSmall ? 'mb-3 h-10 w-10' : 'mb-4 h-12 w-12',
      ].join(' ')
    : isCard
    ? [
        'mx-auto flex items-center justify-center rounded-full',
        isSmall ? 'mb-4 h-16 w-16' : 'mb-8 h-24 w-24',
      ].join(' ')
    : isSmall
      ? 'mb-3'
      : 'mb-6';
  const resolvedIcon = icon ?? (lottie ? LOTTIE_ICON_MAP[lottie] : undefined);
  const iconClasses = [
    isSmall ? 'h-5 w-5' : isCard ? 'h-10 w-10' : 'h-8 w-8',
    'text-app-primary',
  ].join(' ');

  return (
    <div className={wrapperClasses}>
      {resolvedIcon && (
        <div className={mediaWrapClasses}>
          <Icon name={resolvedIcon} className={iconClasses} />
        </div>
      )}

      {title && <h3 className="text-xl font-black text-app-fg tracking-tight mb-2">{title}</h3>}
      <p className="text-app-muted font-medium leading-relaxed mb-6">{description}</p>

      {/* Conteúdo adicional */}
      {children && <div className="mb-6">{children}</div>}

      {/* Botão de ação */}
      {actionLabel && onAction && (
        <Button size="md" variant="primary" onClick={onAction} className="font-black px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
