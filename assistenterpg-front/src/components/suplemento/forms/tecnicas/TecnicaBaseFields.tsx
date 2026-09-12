// src/components/suplemento/forms/tecnicas/TecnicaBaseFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { RequisitosEstruturadosEditor } from '../RequisitosEstruturadosEditor';
import {
  TipoTecnicaAmaldicoada,
  TIPO_TECNICA_LABELS,
} from '@/lib/types/homebrew-enums';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function TecnicaBaseFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label="Tipo de técnica *"
          value={dados.tipo ?? ''}
          onChange={(e) => onChange({ tipo: e.target.value as TipoTecnicaAmaldicoada })}
          required
        >
          <option value="">Selecione...</option>
          {(Object.entries(TIPO_TECNICA_LABELS) as [TipoTecnicaAmaldicoada, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <div className="flex items-center pt-6">
          <Checkbox
            label="Técnica hereditária"
            checked={dados.hereditaria ?? false}
            onChange={(e) => onChange({ hereditaria: e.target.checked })}
          />
        </div>
      </div>

      <Input
        label="Link externo (documentação)"
        type="url"
        value={dados.linkExterno ?? ''}
        onChange={(e) => onChange({ linkExterno: e.target.value })}
        placeholder="https://wiki.exemplo.com/tecnica"
      />

      <RequisitosEstruturadosEditor
        value={dados.requisitos}
        onChange={(requisitos) => onChange({ requisitos })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-alert">
        <p className="text-xs text-app-muted">
          <strong>Importante:</strong> As habilidades da técnica são configuradas abaixo.
          Cada técnica deve ter pelo menos 1 habilidade.
        </p>
      </div>
    </div>
  );
}
