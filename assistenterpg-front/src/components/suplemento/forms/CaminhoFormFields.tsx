// src/components/suplemento/forms/CaminhoFormFields.tsx

'use client';

import { Textarea } from '@/components/ui/Textarea';
import { HabilidadesEstruturadasEditor, type HabilidadeEstruturada } from './HabilidadesEstruturadasEditor';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function CaminhoFormFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Requisitos (JSON ou texto livre)"
        value={
          typeof dados.requisitos === 'string'
            ? dados.requisitos
            : JSON.stringify(dados.requisitos || {}, null, 2)
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ requisitos: parsed });
          } catch {
            onChange({ requisitos: e.target.value });
          }
        }}
        placeholder='Ex: { "nível": 7, "trilha": "Elementalista" }'
        rows={3}
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
