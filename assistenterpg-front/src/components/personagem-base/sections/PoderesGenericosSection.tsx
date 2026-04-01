// src/components/personagem-base/sections/PoderesGenericosSection.tsx
'use client';

import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';

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

function ConfigDisplay({
  config,
  periciasMap,
  tiposGrauMap,
}: {
  config?: PoderConfig;
  periciasMap?: Map<string, { nome: string }>;
  tiposGrauMap?: Map<string, string>;
}) {
  if (!config || Object.keys(config).length === 0) {
    return (
      <p className="text-xs text-app-muted italic">
        Sem configurações adicionais
      </p>
    );
  }

  // PERICIAS
  if (config.periciasCodigos && Array.isArray(config.periciasCodigos)) {
    const codigos = config.periciasCodigos.filter((c: string) => c && c.trim());
    if (codigos.length === 0) {
      return <p className="text-xs text-app-warning">⚠️ Perícias não configuradas</p>;
    }

    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-app-muted">Perícias escolhidas:</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {codigos.map((codigo: string) => {
            const nome = periciasMap?.get(codigo)?.nome ?? codigo;
            return (
              <Badge key={codigo} color="blue" size="sm">
                {nome}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }

  // TIPO_GRAU
  if (config.tipoGrauCodigo && typeof config.tipoGrauCodigo === 'string') {
    const codigo = config.tipoGrauCodigo.trim();
    if (!codigo) {
      return <p className="text-xs text-app-warning">⚠️ Tipo de grau não configurado</p>;
    }

    const nome = tiposGrauMap?.get(codigo) ?? codigo;
    return (
      <div className="mt-2">
        <p className="text-xs font-medium text-app-muted mb-1">Tipo de grau escolhido:</p>
        <div className="flex items-center gap-2">
          <Icon name="chart" className="h-3 w-3 text-app-info" />
          <span className="text-xs text-app-fg font-medium">{nome}</span>
          <span className="text-xs text-app-muted">({codigo})</span>
        </div>
      </div>
    );
  }

  // Outras configs (fallback)
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-app-muted hover:text-app-fg">
        Ver configuração bruta
      </summary>
      <pre className="mt-2 rounded bg-app-bg p-2 text-[10px] text-app-muted overflow-x-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
    </details>
  );
}

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
                  <ConfigDisplay
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
