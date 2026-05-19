// components/configuracoes/ConfigSection.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Icon, IconName } from '@/components/ui/Icon';

type ConfigSectionProps = {
  title: string;
  icon?: IconName;
  description?: string;
  children: ReactNode;
  danger?: boolean;
};

export function ConfigSection({ title, icon, description, children, danger }: ConfigSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        variant="glass"
        className={`overflow-hidden border-t-2 ${
          danger ? 'border-t-app-danger/50' : 'border-t-app-primary/30'
        }`}
      >
        <div className="mb-6 flex flex-col gap-1">
          <h3 className={`flex items-center gap-2 text-xl font-black tracking-tight ${danger ? 'text-app-danger' : 'text-app-fg'}`}>
            {icon && (
              <div className={`rounded-lg p-1.5 ${danger ? 'bg-app-danger/10 text-app-danger' : 'bg-app-primary/10 text-app-primary'}`}>
                <Icon name={icon} className="h-5 w-5" />
              </div>
            )}
            {title}
          </h3>
          {description && (
            <p className="text-xs font-medium text-app-muted ml-11">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </Card>
    </motion.div>
  );
}
