// src/components/suplemento/forms/equipamentos/ItemOperacionalFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CatalogStringSelect } from '@/components/ui/CatalogStringSelect';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';
import type { JsonImportGuideReferenceRow } from '@/lib/types';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
  pericias: JsonImportGuideReferenceRow[];
};

export function ItemOperacionalFields({ dados, onChange, pericias }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CatalogStringSelect
          label="Perícia bonificada"
          helperText="Escolha uma perícia conhecida ou informe uma referência local."
          options={pericias.map((pericia) => pericia.nome)}
          value={dados.periciaBonificada ?? ''}
          onChange={(periciaBonificada) => onChange({ periciaBonificada })}
        />

        <Input
          label="Bônus de perícia"
          type="number"
          min={0}
          value={dados.bonusPericia ?? ''}
          onChange={(e) => onChange({ bonusPericia: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Ex: 2, 5, 10"
        />
      </div>

      <Textarea
        label="Efeito"
        value={dados.efeito ?? ''}
        onChange={(e) => onChange({ efeito: e.target.value })}
        placeholder="Ex: Elimina penalidade de camuflagem, concede visão térmica..."
        rows={3}
        maxLength={500}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Exemplos:</strong> Algemas, Corda, Óculos de Visão Térmica, Mochila Militar, Kit Médico.
        </p>
      </div>
    </div>
  );
}
