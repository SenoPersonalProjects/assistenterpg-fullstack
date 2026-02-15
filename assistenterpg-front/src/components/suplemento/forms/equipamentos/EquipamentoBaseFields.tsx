// src/components/suplemento/forms/equipamentos/EquipamentoBaseFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CategoriaEquipamento,
  TipoUsoEquipamento,
  CATEGORIA_EQUIPAMENTO_LABELS,
  TIPO_USO_LABELS,
} from '@/lib/types/homebrew-enums';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
  disableCategoria?: boolean;
};

export function EquipamentoBaseFields({ dados, onChange, disableCategoria }: Props) {
  return (
    <div className="space-y-4">
      <Select
        label="Categoria de equipamento *"
        value={dados.categoria ?? ''}
        onChange={(e) => onChange({ categoria: e.target.value as CategoriaEquipamento })}
        required
        disabled={disableCategoria}
      >
        <option value="">Selecione...</option>
        {Object.entries(CATEGORIA_EQUIPAMENTO_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Espaços *"
          type="number"
          min={0}
          value={dados.espacos ?? ''}
          onChange={(e) => onChange({ espacos: e.target.value ? Number(e.target.value) : 0 })}
          placeholder="0"
          required
        />

        <Select
          label="Tipo de uso"
          value={dados.tipoUso ?? ''}
          onChange={(e) => onChange({ tipoUso: e.target.value as TipoUsoEquipamento })}
        >
          <option value="">Selecione...</option>
          {Object.entries(TIPO_USO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
