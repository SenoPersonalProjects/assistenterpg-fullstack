// src/components/suplemento/forms/TrilhaFormFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import type { JsonImportGuideReferenceRow } from '@/lib/types';
import { CatalogReferenceSelect } from './CatalogReferenceSelect';
import { HabilidadesEstruturadasEditor, type HabilidadeEstruturada } from './HabilidadesEstruturadasEditor';
import type { HomebrewFormDados } from '../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
  classes: JsonImportGuideReferenceRow[];
};

export function TrilhaFormFields({ dados, onChange, classes }: Props) {
  return (
    <div className="space-y-4">
      <CatalogReferenceSelect
        label="Classe *"
        helperText="A trilha ficará disponível somente para personagens desta classe."
        value={dados.classeId}
        rows={classes}
        onChange={(classeId) => onChange({ classeId })}
        required
      />

      <Input
        label="Nível de requisito"
        type="number"
        min={1}
        max={20}
        value={dados.nivelRequisito ?? 1}
        onChange={(e) => onChange({ nivelRequisito: Number(e.target.value) })}
        placeholder="1"
      />

      <HabilidadesEstruturadasEditor
        label="Habilidades da trilha"
        incluirNivel
        required
        value={Array.isArray(dados.habilidades) ? dados.habilidades as HabilidadeEstruturada[] : []}
        onChange={(habilidades) => onChange({ habilidades })}
      />

      <p className="text-xs text-app-muted">O nível define quando a trilha fica disponível. As habilidades são apresentadas aos jogadores na ordem cadastrada.</p>
    </div>
  );
}
