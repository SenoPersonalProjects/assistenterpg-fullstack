// src/components/personagem-base/sections/TrainingGradesSection.tsx
'use client';

import { EmptyState } from '@/components/ui/EmptyState';

interface TrainingImprovement {
  periciaCodigo: string;
  grauAnterior: number;
  grauNovo: number;
}

interface TrainingGrade {
  nivel: number;
  melhorias: TrainingImprovement[];
}

interface TrainingGradesSectionProps {
  grades: TrainingGrade[];
  skillsMap?: Map<string, { nome: string }>;
}

export function TrainingGradesSection({ grades, skillsMap }: TrainingGradesSectionProps) {
  if (!grades || grades.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon="training"
        title="Sem graus de treinamento"
        description="Nenhuma melhoria de perícia foi registrada."
      />
    );
  }

  return (
    <div className="space-y-3">
      {grades.map((gt) => (
        <div key={gt.nivel} className="rounded border border-app-border bg-app-surface p-3">
          <p className="text-sm font-semibold text-app-success mb-2">Nível {gt.nivel}</p>

          <ul className="space-y-1 text-xs">
            {gt.melhorias.map((m, idx) => {
              const skillName = skillsMap?.get(m.periciaCodigo)?.nome ?? m.periciaCodigo;
              return (
                <li key={idx} className="text-app-muted">
                  <span className="font-medium text-app-fg">{skillName}</span>: {m.grauAnterior} → {m.grauNovo}
                  <span className="text-app-success ml-1">(+{m.grauNovo - m.grauAnterior})</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
