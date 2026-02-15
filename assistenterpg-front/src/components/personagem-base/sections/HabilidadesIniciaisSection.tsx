// src/components/personagem-base/sections/HabilidadesIniciaisSection.tsx
'use client';

import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';

type Habilidade = {
  id: number;
  nome: string;
  tipo?: string | null; // ex: ORIGEM, RECURSO_CLASSE (vamos esconder por padrão)
  descricao?: string | null;
};

type Props = {
  origem: Habilidade[];
  classe: Habilidade[];
};

function HabilidadeItem({ h, hideTipo = true }: { h: Habilidade; hideTipo?: boolean }) {
  return (
    <li className="rounded border border-app-border bg-app-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-app-fg">{h.nome}</p>

        {/* Se um dia você quiser mostrar o tipo sem poluir: vira um “chip” discreto */}
        {!hideTipo && h.tipo ? (
          <span className="shrink-0 rounded-full border border-app-border px-2 py-0.5 text-[10px] text-app-muted">
            {h.tipo}
          </span>
        ) : null}
      </div>

      {h.descricao ? <p className="mt-2 text-xs text-app-muted leading-relaxed">{h.descricao}</p> : null}
    </li>
  );
}

export function HabilidadesIniciaisSection({ origem, classe }: Props) {
  const temAlgo = (origem?.length ?? 0) > 0 || (classe?.length ?? 0) > 0;

  if (!temAlgo) return null;

  return (
    <SectionCard title="Habilidades iniciais" right={<Icon name="rules" className="h-5 w-5 text-app-muted" />}>
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Icon name="tag" className="h-4 w-4 text-app-muted" />
            <p className="text-sm font-semibold text-app-fg">Da origem</p>
          </div>

          {origem && origem.length > 0 ? (
            <ul className="space-y-2">
              {origem.map((h) => (
                <HabilidadeItem key={h.id} h={h} />
              ))}
            </ul>
          ) : (
            <EmptyState
              variant="card"
              icon="info"
              title="Sem habilidades de origem"
              description="Esta origem não fornece habilidades iniciais."
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Icon name="characters" className="h-4 w-4 text-app-muted" />
            <p className="text-sm font-semibold text-app-fg">Da classe</p>
          </div>

          {classe && classe.length > 0 ? (
            <ul className="space-y-2">
              {classe.map((h) => (
                <HabilidadeItem key={h.id} h={h} />
              ))}
            </ul>
          ) : (
            <EmptyState
              variant="card"
              icon="info"
              title="Sem habilidades de classe"
              description="Esta classe não fornece habilidades iniciais."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
