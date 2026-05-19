import { Icon } from './Icon';

type LoadingSize = 'sm' | 'md' | 'lg';

type LoadingProps = {
  message?: string;
  className?: string;
  size?: LoadingSize;
  variant?: 'spinner' | 'dice';
};

const SIZE_CLASSES: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const ICON_SIZE_CLASSES: Record<LoadingSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({ 
  message = 'Carregando...', 
  className = '', 
  size = 'md',
  variant = 'spinner'
}: LoadingProps) {
  const iconName = variant === 'dice' ? 'dice' : 'spinner';
  const iconClassName = [
    ICON_SIZE_CLASSES[size],
    'text-app-primary',
    variant === 'dice' ? 'animate-bounce' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${SIZE_CLASSES[size]} text-app-muted ${className}`}>
      <Icon name={iconName} className={iconClassName} />
      {message && <span className="font-bold tracking-tight animate-pulse">{message}</span>}
    </div>
  );
}
