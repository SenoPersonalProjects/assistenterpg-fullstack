// src/components/suplemento/forms/CaminhoFormFields.tsx

'use client';

import { Textarea } from '@/components/ui/Textarea';
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
        placeholder='Ex: { "nivel": 7, "trilha": "Elementalista" }'
        rows={3}
      />

      <Textarea
        label="Habilidades do caminho (JSON array) *"
        value={
          Array.isArray(dados.habilidades)
            ? JSON.stringify(dados.habilidades, null, 2)
            : dados.habilidades || '[]'
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ habilidades: Array.isArray(parsed) ? parsed : [] });
          } catch {
            onChange({ habilidades: e.target.value });
          }
        }}
        placeholder='Ex: [{"nivel": 7, "nome": "Maestria Elemental", "descricao": "..."}]'
        rows={8}
        required
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
