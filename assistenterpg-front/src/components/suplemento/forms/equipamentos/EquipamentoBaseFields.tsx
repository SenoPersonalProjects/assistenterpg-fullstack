// src/components/suplemento/forms/equipamentos/EquipamentoBaseFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  TipoEquipamento,
  CategoriaEquipamento,
  TipoUsoEquipamento,
  TIPO_EQUIPAMENTO_LABELS,
  CATEGORIA_EQUIPAMENTO_LABELS,
  TIPO_USO_LABELS,
} from '@/lib/types/homebrew-enums';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';

type EquipamentoBaseFormData = Pick<HomebrewFormDados, 'tipo' | 'categoria' | 'espacos' | 'tipoUso'>;

type Props = {
  dados: EquipamentoBaseFormData;
  onChange: (dados: Partial<EquipamentoBaseFormData>) => void;
  disableCategoria?: boolean;
};

export function EquipamentoBaseFields({ dados, onChange, disableCategoria }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label="Tipo de equipamento *"
          value={dados.tipo ?? ''}
          onChange={(e) => onChange({ tipo: e.target.value as TipoEquipamento })}
          required
        >
          <option value="">Selecione...</option>
          {Object.entries(TIPO_EQUIPAMENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

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
      </div>

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
