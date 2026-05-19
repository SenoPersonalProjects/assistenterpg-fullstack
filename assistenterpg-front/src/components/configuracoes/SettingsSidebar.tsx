'use client';

import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/ui/Icon';

export type SettingsTabId = 'perfil' | 'aparencia' | 'notificacoes' | 'seguranca' | 'dados' | 'sobre';

type Tab = {
  id: SettingsTabId;
  label: string;
  icon: IconName;
};

const TABS: Tab[] = [
  { id: 'perfil', label: 'Perfil', icon: 'user' },
  { id: 'aparencia', label: 'Aparência', icon: 'paint' },
  { id: 'notificacoes', label: 'Notificações', icon: 'bell' },
  { id: 'seguranca', label: 'Segurança', icon: 'lock' },
  { id: 'dados', label: 'Dados', icon: 'archive' },
  { id: 'sobre', label: 'Sobre', icon: 'info' },
];

type SettingsSidebarProps = {
  activeTab: SettingsTabId;
  onTabChange: (id: SettingsTabId) => void;
};

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
              isActive
                ? 'text-app-primary'
                : 'text-app-muted hover:bg-app-primary/5 hover:text-app-fg'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-app-primary/10 border border-app-primary/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <Icon
              name={tab.icon}
              className={`relative z-10 h-5 w-5 transition-transform group-hover:scale-110 ${
                isActive ? 'text-app-primary' : 'text-app-muted group-hover:text-app-primary'
              }`}
            />
            
            <span className="relative z-10 text-sm font-bold tracking-tight">
              {tab.label}
            </span>

            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-app-primary"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
