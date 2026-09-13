// src/components/personagem-base/sections/PoderesGenericosSection.tsx
'use client';

import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { PowerConfigurationSummary } from '@/components/poderes/PowerConfigurationSummary';

type PoderGenerico = {
  id: number;
  habilidadeId: number;
  nome: string;
  config?: PoderConfig;
};

type PoderConfig = {
  periciasCodigos?: string[];
  tipoGrauCodigo?: string;
  [key: string]: unknown;
};

type Props = {
  poderes: PoderGenerico[];
  periciasMap?: Map<string, { nome: string }>;
  tiposGrauMap?: Map<string, string>;
};

export function PoderesGenericosSection({ poderes, periciasMap, tiposGrauMap }: Props) {
  if (!poderes || poderes.length === 0) {
    return null; // Não renderiza nada se não tiver poderes
  }

  return (
    <SectionCard
      title="Poderes genéricos"
      right={
        <div className="flex items-center gap-2">
          <Badge color="purple">{poderes.length}</Badge>
          <Icon name="bolt" className="h-5 w-5 text-app-warning" />
        </div>
      }
    >
      <div className="space-y-3">
        {poderes.map((poder, idx) => (
          <div
            key={poder.id}
            className="rounded border border-app-primary/30 bg-app-primary/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-app-warning/20 text-xs font-bold text-app-warning">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-app-fg">{poder.nome}</h4>
                  <PowerConfigurationSummary
                    config={poder.config}
                    periciasMap={periciasMap}
                    tiposGrauMap={tiposGrauMap}
                  />
                </div>
              </div>
              <Badge color="purple" size="sm">
                Poder
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-app-border pt-3">
        <p className="text-[10px] italic text-app-muted">
          Poderes genéricos são habilidades especiais desbloqueadas nos níveis 3, 6, 9, 12, 15 e 18.
        </p>
      </div>
    </SectionCard>
  );
}
