'use client';

import { useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';

export type Tab = {
  id: string;
  titulo: string;
  icone: IconName;
  conteudo: React.ReactNode;
};

type TabbedSectionProps = {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
};

export function TabbedSection({ tabs, defaultTabId, className = '' }: TabbedSectionProps) {
  const [abaAtiva, setAbaAtiva] = useState(defaultTabId ?? tabs[0]?.id ?? '');

  const abaAtual = tabs.find((tab) => tab.id === abaAtiva) ?? tabs[0];

  return (
    <div className={className}>
      {/* Tabs Header */}
      <div className="flex bg-app-surface border border-app-border rounded-t-lg overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex-1 px-6 py-3 border-b-2 font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              abaAtiva === tab.id
                ? 'border-app-primary text-app-primary bg-app-primary/5'
                : 'border-transparent text-app-muted hover:text-app-fg hover:border-app-border/50'
            }`}
          >
            <Icon name={tab.icone} className="w-4 h-4" />
            {tab.titulo}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="border border-t-0 border-app-border rounded-b-lg bg-app-surface p-6">
        {abaAtual?.conteudo}
      </div>
    </div>
  );
}
