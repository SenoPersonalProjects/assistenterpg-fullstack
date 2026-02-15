'use client';

import { Icon } from './Icon';

type LoadingSize = 'sm' | 'md' | 'lg';

type LoadingProps = {
  message?: string;
  className?: string;
  size?: LoadingSize;
};

const SIZE_CLASSES: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Loading({ 
  message = 'Carregando...', 
  className = '', 
  size = 'md' 
}: LoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${SIZE_CLASSES[size]} text-app-muted ${className}`}>
      <Icon name="spinner" className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
