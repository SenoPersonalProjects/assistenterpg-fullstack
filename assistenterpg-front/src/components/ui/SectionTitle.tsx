// components/ui/SectionTitle.tsx
'use client';

import { Icon } from './Icon';
import type { IconName } from './Icon';

type Props = {
  children: React.ReactNode;
  icon?: IconName;
  className?: string;
};

export function SectionTitle({ children, icon, className = '' }: Props) {
  return (
    <h2 className={`text-xl font-semibold text-app-fg flex items-center gap-2 ${className}`}>
      {icon && <Icon name={icon} className="w-5 h-5" />}
      {children}
    </h2>
  );
}
