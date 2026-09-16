'use client';

import { useId, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type SessionPanelProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  tone?: 'main' | 'control' | 'aside';
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  stickyHeader?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapseLabel?: string;
  children?: ReactNode;
};

export function SessionPanel({
  title,
  subtitle,
  right,
  tone = 'main',
  className = '',
  bodyClassName = '',
  headerClassName = '',
  stickyHeader = true,
  collapsible = false,
  defaultCollapsed = false,
  collapseLabel = 'painel',
  children,
}: SessionPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyId = useId();
  const toneClasses = {
    main: 'border-t-2 border-t-app-primary/30',
    control: 'border-t-2 border-t-app-secondary/30',
    aside: 'border-t-2 border-t-app-info/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        variant="glass"
        className={`session-panel session-panel-frame session-panel--${tone} overflow-hidden ${toneClasses[tone]} ${className}`}
      >
        <div
          className={`session-panel-head px-4 py-3 bg-app-surface/20 backdrop-blur-md flex items-center justify-between gap-4 border-b border-app-border/10 ${
            stickyHeader ? 'session-panel-head--sticky sticky top-0 z-20' : ''
          } ${headerClassName}`}
        >
          <div className="min-w-0">
            <h2 className="session-panel-title text-sm font-black uppercase tracking-widest text-app-fg">
              {title}
            </h2>
            {subtitle ? (
              <p className="session-panel-subtitle text-[10px] font-bold text-app-muted uppercase tracking-tight">
                {subtitle}
              </p>
            ) : null}
          </div>
          {right || collapsible ? (
            <div className="shrink-0 flex items-center gap-2">
              {right}
              {collapsible ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="min-h-[2rem] px-2"
                  aria-controls={bodyId}
                  aria-expanded={!collapsed}
                  aria-label={`${collapsed ? 'Expandir' : 'Recolher'} ${collapseLabel}`}
                  title={`${collapsed ? 'Expandir' : 'Recolher'} ${collapseLabel}`}
                  onClick={() => setCollapsed((value) => !value)}
                >
                  <Icon
                    name={collapsed ? 'chevron-down' : 'chevron-up'}
                    className="h-4 w-4"
                  />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {children && !collapsed ? (
          <div id={bodyId} className={`session-panel-body p-4 ${bodyClassName}`}>
            {children}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
