// src/components/personagem-base/sections/SkillsList.tsx
'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Skill {
  id: number;
  codigo: string;
  nome: string;
  atributoBase: string;
  grauTreinamento: number;
  bonusExtra: number;
}

interface SkillsListProps {
  skills: Skill[];
  emptyMessage?: string;
}

const GRAU_CONFIG = [
  { nome: 'Destreinado', cor: 'gray' as const, size: 'md' as const },
  { nome: 'Treinado', cor: 'purple' as const, size: 'md' as const },
  { nome: 'Graduado', cor: 'green' as const, size: 'md' as const },
  { nome: 'Veterano', cor: 'blue' as const, size: 'md' as const },
  { nome: 'Expert', cor: 'yellow' as const, size: 'md' as const },
];

export function SkillsList({ skills, emptyMessage = 'Nenhuma perícia treinada.' }: SkillsListProps) {
  // Ordenar alfabeticamente por nome
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [skills]);

  if (!sortedSkills || sortedSkills.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon="skills"
        title="Sem perícias"
        description={emptyMessage}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {sortedSkills.map((skill) => {
        const bonusTotal = skill.grauTreinamento * 5 + skill.bonusExtra;
        const grau = GRAU_CONFIG[skill.grauTreinamento] ?? GRAU_CONFIG[0];

        return (
          <li key={skill.id} className="rounded border border-app-border bg-app-bg p-3 hover:border-app-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-app-fg">{skill.nome}</span>
                  <span className="text-app-muted text-xs">({skill.atributoBase})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge color={grau.cor} size={grau.size}>
                    {grau.nome}
                  </Badge>
                  {skill.bonusExtra > 0 && (
                    <span className="text-xs text-app-warning font-medium">
                      Treinamento +{skill.grauTreinamento * 5}, bônus adicional +{skill.bonusExtra}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`ml-3 text-lg font-bold flex-shrink-0 ${
                  bonusTotal >= 15
                    ? 'text-app-success'
                    : bonusTotal >= 10
                    ? 'text-app-info'
                    : bonusTotal > 0
                    ? 'text-app-fg'
                    : 'text-app-muted'
                }`}
              >
                {bonusTotal > 0 ? `+${bonusTotal}` : '0'}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
