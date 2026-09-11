// src/components/suplemento/forms/ClaFormFields.tsx

'use client';

import { Textarea } from '@/components/ui/Textarea';
import type { JsonImportGuideReferenceRow } from '@/lib/types';
import { CatalogReferenceSelect } from './CatalogReferenceSelect';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
  tecnicas: JsonImportGuideReferenceRow[];
};

export function ClaFormFields({ dados, onChange, tecnicas }: Props) {
  return (
    <div className="space-y-4">
      <CatalogReferenceSelect
        label="Técnica inata hereditária"
        helperText="Opcional. Escolha uma técnica publicada em vez de informar o ID técnico."
        value={dados.tecnicaInataId}
        rows={tecnicas}
        onChange={(tecnicaInataId) => onChange({ tecnicaInataId })}
      />

      <Textarea
        label="Características do clã (JSON array)"
        value={
          Array.isArray(dados.caracteristicas)
            ? JSON.stringify(dados.caracteristicas, null, 2)
            : dados.caracteristicas || '[]'
        }
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ caracteristicas: Array.isArray(parsed) ? parsed : [] });
          } catch {
            onChange({ caracteristicas: e.target.value });
          }
        }}
        placeholder='Ex: [{"nome": "Grande Clã", "descrição": "Pertence aos grandes clãs"}]'
        rows={5}
      />

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
        placeholder='Ex: { "nível": 1, "origem": "Kyoto" }'
        rows={3}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Dica:</strong> Use JSON válido para estruturar características e requisitos.
          Se a técnica inata for hereditária do clã, informe o ID dela.
        </p>
      </div>
    </div>
  );
}
