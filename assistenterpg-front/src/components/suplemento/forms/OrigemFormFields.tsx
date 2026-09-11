// src/components/suplemento/forms/OrigemFormFields.tsx

'use client';

import type { HomebrewFormDados } from '../hooks/useHomebrewForm';
import { HabilidadesEstruturadasEditor, type HabilidadeEstruturada } from './HabilidadesEstruturadasEditor';
import type { JsonImportGuideReferenceRow } from '@/lib/types';
import { CatalogTagSelector } from '@/components/ui/CatalogTagSelector';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
  pericias: JsonImportGuideReferenceRow[];
};

export function OrigemFormFields({ dados, onChange, pericias: periciasCatalogo }: Props) {
  const pericias: string[] = dados.pericias ?? [];

  return (
    <div className="space-y-4">
      {/* Perícias */}
      <CatalogTagSelector
        label="Perícias *"
        helperText="Escolha apenas perícias do catálogo; elas influenciam a ficha criada a partir desta origem."
        options={periciasCatalogo.map((pericia) => pericia.nome)}
        value={pericias}
        onChange={(periciasSelecionadas) => onChange({ pericias: periciasSelecionadas })}
        allowCustom={false}
      />

      {/* Habilidades */}
      <HabilidadesEstruturadasEditor
        label="Habilidades iniciais"
        value={Array.isArray(dados.habilidades) ? dados.habilidades as HabilidadeEstruturada[] : []}
        onChange={(habilidades) => onChange({ habilidades })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          As escolhas são salvas na estrutura compatível com fichas e importações existentes.
        </p>
      </div>
    </div>
  );
}
