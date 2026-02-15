// src/components/personagem-base/sections/PassivasAtributosCard.tsx
'use client';

import React from 'react';
import type { AtributoBaseCodigo, PassivaAtributoCatalogo } from '@/lib/api';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';

const ATRIBUTO_LABEL: Record<AtributoBaseCodigo, string> = {
  AGI: 'Agilidade',
  FOR: 'Força',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

const LABEL_EFEITOS_PASSIVA: Record<string, string> = {
  periciasExtras: 'Perícias Extras',
  proficienciasExtras: 'Proficiências Extras',
  grauTreinamentoExtra: 'Grau de Treinamento Extra',
  grauAprimoramentoExtra: 'Grau de Aprimoramento Extra',
  rodadasMorrendo: 'Rodadas em Morrendo',
  rodadasEnlouquecendo: 'Rodadas em Enlouquecendo',
};

type Props = {
  passivasAtributosAtivos?: AtributoBaseCodigo[];
  /** Já vem filtradas do hook: se existe II, a I correspondente não entra */
  passivasSelecionadas: PassivaAtributoCatalogo[];
};

export function PassivasAtributosCard({
  passivasAtributosAtivos,
  passivasSelecionadas,
}: Props) {
  const ativos = passivasAtributosAtivos ?? [];
  const temAlgo = ativos.length > 0 || passivasSelecionadas.length > 0;

  if (!temAlgo) return null;

  return (
    <SectionCard
      title="Passivas de atributos"
      right={<Icon name="sparkles" className="h-5 w-5 text-app-muted" />}
    >
      {ativos.length > 0 && (
        <p className="mb-3 text-sm text-app-muted">
          Atributos ativos:{' '}
          <span className="font-medium text-app-fg">
            {ativos.map((a) => ATRIBUTO_LABEL[a]).join(', ')}
          </span>
        </p>
      )}

      {passivasSelecionadas.length > 0 ? (
        <div className="space-y-3">
          {passivasSelecionadas.map((passiva) => (
            <div
              key={passiva.id}
              className="rounded border border-app-border bg-app-surface p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-app-fg">
                  {passiva.nome}
                </p>
                <span className="text-xs text-app-primary">
                  {passiva.atributo}{' '}
                  {passiva.nivel === 2 ? 'II' : 'I'}
                </span>
              </div>

              {passiva.descricao && (
                <p className="text-xs text-app-muted">
                  {passiva.descricao}
                </p>
              )}

              {passiva.efeitos &&
                Object.keys(passiva.efeitos).length > 0 && (
                  <div className="mt-2 border-t border-app-border pt-2">
                    <p className="mb-1 text-[10px] text-app-muted">
                      Efeitos:
                    </p>
                    <ul className="space-y-0.5">
                      {Object.entries(passiva.efeitos).map(
                        ([key, value]) => {
                          const label =
                            LABEL_EFEITOS_PASSIVA[key] ?? key;
                          return (
                            <li
                              key={key}
                              className="text-[10px] text-app-success"
                            >
                              • {label}:{' '}
                              <strong>+{String(value)}</strong>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="card"
          icon="info"
          title="Sem detalhes de passivas"
          description="Nenhum detalhe disponível (o backend não retornou IDs aplicados)."
        />
      )}
    </SectionCard>
  );
}
