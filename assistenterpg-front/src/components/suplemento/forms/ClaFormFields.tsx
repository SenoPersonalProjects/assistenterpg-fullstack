// src/components/suplemento/forms/ClaFormFields.tsx

'use client';

import type { JsonImportGuideReferenceRow } from '@/lib/types';
import { CatalogReferenceSelect } from './CatalogReferenceSelect';
import { CaracteristicasEstruturadasEditor } from './CaracteristicasEstruturadasEditor';
import { RequisitosEstruturadosEditor } from './RequisitosEstruturadosEditor';
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

      <CaracteristicasEstruturadasEditor
        value={dados.caracteristicas}
        onChange={(caracteristicas) => onChange({ caracteristicas })}
      />

      <RequisitosEstruturadosEditor
        value={dados.requisitos}
        onChange={(requisitos) => onChange({ requisitos })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Dica:</strong> Estruture características na lista e descreva requisitos de forma
          clara. A técnica inata é escolhida pelo nome, sem informar ID técnico.
        </p>
      </div>
    </div>
  );
}
