import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { ReactNode } from 'react';
import { LottiePlayer } from './LottiePlayer';
import { LOTTIE_ASSETS } from '@/lib/lottie-assets';

type EmptyStateProps = {
  title?: string;
  description: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'plain' | 'card' | 'session';
  icon?: IconName;
  lottie?: keyof typeof LOTTIE_ASSETS;
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

  return (
    <div className={wrapperClasses}>
      {(icon || lottie) && (
        <div className={mediaWrapClasses}>
          {lottie ? (
            <LottiePlayer 
              src={LOTTIE_ASSETS[lottie]} 
              size={isSmall ? 48 : 80}
              loop 
              autoplay 
            />
          ) : (
            <Icon name={icon!} className={isSmall ? 'h-5 w-5' : isCard ? 'h-10 w-10' : 'h-8 w-8'} />
          )}
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
