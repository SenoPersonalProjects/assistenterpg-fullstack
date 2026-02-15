// src/components/suplemento/forms/equipamentos/ExplosivoFields.tsx

'use client';

import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  TipoExplosivo,
  TIPO_EXPLOSIVO_LABELS,
} from '@/lib/types/homebrew-enums';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function ExplosivoFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Select
        label="Tipo de explosivo *"
        value={dados.tipoExplosivo ?? ''}
        onChange={(e) => onChange({ tipoExplosivo: e.target.value as TipoExplosivo })}
        required
      >
        <option value="">Selecione...</option>
        {(Object.entries(TIPO_EXPLOSIVO_LABELS) as [TipoExplosivo, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Textarea
        label="Efeito *"
        value={dados.efeito ?? ''}
        onChange={(e) => onChange({ efeito: e.target.value })}
        placeholder="Ex: Atordoa inimigos em raio de 6m, causa 3d6 de dano..."
        rows={4}
        maxLength={1000}
        required
      />
    </div>
  );
}
