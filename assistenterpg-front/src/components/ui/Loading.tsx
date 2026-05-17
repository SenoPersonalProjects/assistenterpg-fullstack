import { Icon } from './Icon';
import { LottiePlayer } from './LottiePlayer';
import { LOTTIE_ASSETS } from '@/lib/lottie-assets';

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

const LOTTIE_SIZES: Record<LoadingSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

export function Loading({ 
  message = 'Carregando...', 
  className = '', 
  size = 'md',
  variant = 'spinner'
}: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${SIZE_CLASSES[size]} text-app-muted ${className}`}>
      <LottiePlayer 
        src={variant === 'dice' ? LOTTIE_ASSETS.LOADING_DICE : LOTTIE_ASSETS.LOADING_SPINNER}
        size={LOTTIE_SIZES[size]}
        loop
        autoplay
      />
      {message && <span className="font-bold tracking-tight animate-pulse">{message}</span>}
    </div>
  );
}
