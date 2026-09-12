// src/components/suplemento/forms/CaminhoFormFields.tsx

'use client';

import { HabilidadesEstruturadasEditor, type HabilidadeEstruturada } from './HabilidadesEstruturadasEditor';
import { RequisitosEstruturadosEditor } from './RequisitosEstruturadosEditor';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function CaminhoFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <RequisitosEstruturadosEditor
        value={dados.requisitos}
        onChange={(requisitos) => onChange({ requisitos })}
      />

      <HabilidadesEstruturadasEditor
        label="Habilidades do caminho"
        incluirNivel
        required
        value={Array.isArray(dados.habilidades) ? dados.habilidades as HabilidadeEstruturada[] : []}
        onChange={(habilidades) => onChange({ habilidades })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Estrutura esperada:</strong>
        </p>
        <ul className="text-xs text-app-muted mt-2 space-y-1">
          <li>• <strong>requisitos:</strong> Objeto JSON ou texto (opcional)</li>
          <li>• <strong>habilidades:</strong> Array de objetos com habilidades do caminho (obrigatório)</li>
        </ul>
        <p className="text-xs text-app-muted mt-2">
          <strong>Diferença de Trilha:</strong> Caminho é uma subclasse específica dentro de uma Trilha.
        </p>
      </div>
    </div>
  );
}
