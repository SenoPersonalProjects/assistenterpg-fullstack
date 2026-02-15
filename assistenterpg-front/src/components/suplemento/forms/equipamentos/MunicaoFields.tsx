// src/components/suplemento/forms/equipamentos/MunicaoFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function MunicaoFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Duração (cenas) *"
        type="number"
        min={1}
        value={dados.duracaoCenas ?? ''}
        onChange={(e) => onChange({ duracaoCenas: Number(e.target.value) })}
        placeholder="Ex: 1, 2, 3"
        required
      />

      <Checkbox
        label="Recuperável (pode ser recolhida após uso)"
        checked={dados.recuperavel ?? false}
        onChange={(e) => onChange({ recuperavel: e.target.checked })}
      />

      <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
        <p className="text-xs text-app-muted">
          <strong>Dica:</strong> Flechas geralmente são recuperáveis, balas não.
          Duração indica quantas cenas de combate a munição dura antes de acabar.
        </p>
      </div>
    </div>
  );
}
