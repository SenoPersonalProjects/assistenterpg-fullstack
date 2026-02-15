// src/components/personagem-base/sections/HabilitiesSection.tsx
'use client';

import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Hability {
  id: number;
  nome: string;
  tipo: string;
  descricao?: string | null;
}

interface HabilitiesSectionProps {
  habilities: Hability[];
  showPowerCount?: boolean;
}

// ✅ CORRIGIDO: Removido 'INATA' (técnicas inatas não vêm mais da tabela habilidades)
const HABILITY_TYPES = {
  RECURSO_CLASSE: 'Recurso de Classe',
  PODER_GENERICO: 'Poderes Genéricos',
  ORIGEM: 'Habilidades de Origem',
  TRILHA: 'Habilidades de Trilha',
  CAMINHO: 'Habilidades de Caminho',
  HABILIDADE_ORIGEM: 'Habilidades de Origem', // ✅ Novo tipo do enum
  HABILIDADE_TRILHA: 'Habilidades de Trilha', // ✅ Novo tipo do enum
  EFEITO_GRAU: 'Efeitos de Grau',
  MECANICA_ESPECIAL: 'Mecânica Especial',
  ESCOLA_TECNICA: 'Escola Técnica',
  OUTRO: 'Outras Habilidades',
} as const;

export function HabilitiesSection({ habilities, showPowerCount = true }: HabilitiesSectionProps) {
  if (!habilities || habilities.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon="sparkles"
        title="Sem habilidades"
        description="Nenhuma habilidade/poder foi encontrado."
      />
    );
  }

  const groupedHabilities = habilities.reduce((acc, hability) => {
    const tipo = hability.tipo || 'OUTRO';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hability);
    return acc;
  }, {} as Record<string, Hability[]>);

  const powerCount = groupedHabilities['PODER_GENERICO']?.length ?? 0;

  return (
    <>
      {showPowerCount && powerCount > 0 && (
        <div className="flex items-center justify-end mb-2">
          <Badge color="purple">{powerCount} poderes genéricos</Badge>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(groupedHabilities).map(([tipo, habs]) => (
          <div key={tipo}>
            <h4 className="text-sm font-semibold text-app-primary mb-2">
              {HABILITY_TYPES[tipo as keyof typeof HABILITY_TYPES] || tipo}
            </h4>

            <ul className="space-y-2">
              {habs.map((hab) => (
                <li key={hab.id} className="rounded border border-app-border bg-app-surface p-3">
                  <p className="font-medium text-app-fg text-sm flex items-center gap-2">
                    {hab.tipo === 'PODER_GENERICO' && <span className="text-app-warning">⭐</span>}
                    {hab.nome}
                  </p>
                  {hab.descricao ? <p className="text-xs text-app-muted mt-1">{hab.descricao}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
