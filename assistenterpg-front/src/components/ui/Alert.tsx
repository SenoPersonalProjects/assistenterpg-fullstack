// components/ui/Alert.tsx
'use client';

import { ReactNode } from 'react';
import { Icon, IconName } from './Icon';

type AlertProps = {
  children: ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
  icon?: IconName;
  className?: string;
};

export function Alert({ 
  children, 
  variant = 'info', 
  icon,
  className = '' 
}: AlertProps) {
  const variants = {
    info: {
      containerClass: 'bg-app-alert border-app-border',
      textClass: 'text-app-info',
      iconClass: 'text-app-info',
      defaultIcon: 'info' as IconName,
    },
    warning: {
      containerClass: 'bg-app-alert border-app-border',
      textClass: 'text-app-warning',
      iconClass: 'text-app-warning',
      defaultIcon: 'warning' as IconName,
    },
    error: {
      containerClass: 'bg-app-alert border-app-border',
      textClass: 'text-app-danger',
      iconClass: 'text-app-danger',
      defaultIcon: 'error' as IconName,
    },
    success: {
      containerClass: 'bg-app-alert border-app-border',
      textClass: 'text-app-success',
      iconClass: 'text-app-success',
      defaultIcon: 'success' as IconName,
    },
  };

  const config = variants[variant];
  const iconName = icon || config.defaultIcon;

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg border ${config.containerClass} ${className}`}
    >
      <Icon 
        name={iconName} 
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} 
      />
      <div className={`text-xs ${config.textClass}`}>
        {children}
      </div>
    </div>
  );
}
