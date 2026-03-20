'use client';

import type { ReactNode } from 'react';
import { SessionTabs, type SessionTabItem } from '@/components/campanha/sessao/SessionTabs';

export type SessionSidebarTabId = 'chat' | 'eventos' | 'participantes' | 'rolagens';

type SessionSidebarTabsProps = {
  activeTab: SessionSidebarTabId;
  onChange: (tabId: SessionSidebarTabId) => void;
  totalChat: number;
  totalEventos: number;
  totalParticipantes: number;
  totalRolagens: number;
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
  mostrarEventos = true,
  children,
}: SessionSidebarTabsProps) {
  const tabs: SessionTabItem[] = [
    { id: 'chat', label: 'Chat', icon: 'chat', count: totalChat },
    { id: 'rolagens', label: 'Rolagens', icon: 'dice', count: totalRolagens },
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

