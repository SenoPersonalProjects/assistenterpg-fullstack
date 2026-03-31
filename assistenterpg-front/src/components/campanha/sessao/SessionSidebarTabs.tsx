'use client';

import type { ReactNode } from 'react';
import { SessionTabs, type SessionTabItem } from '@/components/campanha/sessao/SessionTabs';

export type SessionSidebarTabId =
  | 'chat'
  | 'rolagens'
  | 'anotacoes'
  | 'eventos'
  | 'participantes';

type SessionSidebarTabsProps = {
  activeTab: SessionSidebarTabId;
  onChange: (tabId: SessionSidebarTabId) => void;
  totalChat: number;
  totalEventos: number;
  totalParticipantes: number;
  totalRolagens: number;
  totalAnotacoes?: number;
  mostrarEventos?: boolean;
  children: ReactNode;
};

export function SessionSidebarTabs({
  activeTab,
  onChange,
  totalChat,
  totalEventos,
  totalParticipantes,
  totalRolagens,
  totalAnotacoes,
  mostrarEventos = true,
  children,
}: SessionSidebarTabsProps) {
  const tabs: SessionTabItem[] = [
    { id: 'chat', label: 'Chat', icon: 'chat', count: totalChat },
    { id: 'rolagens', label: 'Rolagens', icon: 'dice', count: totalRolagens },
    {
      id: 'anotacoes',
      label: 'Anotacoes',
      icon: 'scroll',
      count: totalAnotacoes,
    },
  ];
  if (mostrarEventos) {
    tabs.push({ id: 'eventos', label: 'Eventos', icon: 'list', count: totalEventos });
  }
  tabs.push({
    id: 'participantes',
    label: 'Participantes',
    icon: 'characters',
    count: totalParticipantes,
  });

  return (
    <div className="space-y-2">
      <SessionTabs
        tabs={tabs}
        activeId={activeTab}
        onChange={(tabId) => onChange(tabId as SessionSidebarTabId)}
      />
      {children}
    </div>
  );
}

