// components/configuracoes/ConfigSection.tsx
'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Icon, IconName } from '@/components/ui/Icon';

type ConfigSectionProps = {
  title: string;
  icon?: IconName; // ✅ Mudou para IconName
  children: ReactNode;
  danger?: boolean;
};

export function ConfigSection({ title, icon, children, danger }: ConfigSectionProps) {
  return (
    <Card className={danger ? 'border-l-4 border-red-500 dark:border-red-700' : ''}>
      <h3 className="text-lg font-semibold text-app-fg mb-4 flex items-center gap-2">
        {icon && <Icon name={icon} className="w-5 h-5" />}
        {title}
      </h3>
      <div>{children}</div>
    </Card>
  );
}
