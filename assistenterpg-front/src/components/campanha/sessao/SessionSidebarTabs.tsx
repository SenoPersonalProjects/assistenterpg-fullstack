'use client';

import type { ReactNode } from 'react';
import { SessionTabs } from '@/components/campanha/sessao/SessionTabs';

export type SessionSidebarTabId = 'chat' | 'eventos' | 'participantes';

type SessionSidebarTabsProps = {
  activeTab: SessionSidebarTabId;
  onChange: (tabId: SessionSidebarTabId) => void;
  totalChat: number;
  totalEventos: number;
  totalParticipantes: number;
  children: ReactNode;
};

export function SessionSidebarTabs({
  activeTab,
  onChange,
  totalChat,
  totalEventos,
  totalParticipantes,
  children,
}: SessionSidebarTabsProps) {
  return (
    <div className="space-y-2">
      <SessionTabs
        tabs={[
          { id: 'chat', label: 'Chat', icon: 'chat', count: totalChat },
          { id: 'eventos', label: 'Eventos', icon: 'list', count: totalEventos },
          {
            id: 'participantes',
            label: 'Participantes',
            icon: 'characters',
            count: totalParticipantes,
          },
        ]}
        activeId={activeTab}
        onChange={(tabId) => onChange(tabId as SessionSidebarTabId)}
      />
      {children}
    </div>
  );
}

