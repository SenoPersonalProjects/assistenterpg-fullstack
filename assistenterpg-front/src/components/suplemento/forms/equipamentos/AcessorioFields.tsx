// src/components/suplemento/forms/equipamentos/AcessorioFields.tsx

'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  TipoAcessorio,
  TIPO_ACESSORIO_LABELS,
} from '@/lib/types/homebrew-enums';

type Props = {
  dados: any;
  onChange: (dados: any) => void;
};

export function AcessorioFields({ dados, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Select
        label="Tipo de acessório *"
        value={dados.tipoAcessorio ?? ''}
        onChange={(e) => onChange({ tipoAcessorio: e.target.value as TipoAcessorio })}
        required
      >
        <option value="">Selecione...</option>
        {(Object.entries(TIPO_ACESSORIO_LABELS) as [TipoAcessorio, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {/* Campos de bônus de perícia */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Perícia bonificada"
          value={dados.periciaBonificada ?? ''}
          onChange={(e) => onChange({ periciaBonificada: e.target.value })}
          placeholder="Ex: Atletismo, Furto"
        />

        <Input
          label="Bônus de perícia"
          type="number"
          min={0}
          value={dados.bonusPericia ?? ''}
          onChange={(e) => onChange({ bonusPericia: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Ex: 2, 5"
        />
      </div>

      {/* Campos específicos */}
      {dados.tipoAcessorio === TipoAcessorio.UTENSILIO && (
        <Checkbox
          label="Requer empunhar (utensílio precisa estar nas mãos)"
          checked={dados.requereEmpunhar ?? false}
          onChange={(e) => onChange({ requereEmpunhar: e.target.checked })}
        />
      )}

      {dados.tipoAcessorio === TipoAcessorio.VESTIMENTA && (
        <Input
          label="Máximo de vestimentas simultâneas"
          type="number"
          min={1}
          value={dados.maxVestimentas ?? 2}
          onChange={(e) => onChange({ maxVestimentas: Number(e.target.value) })}
          placeholder="2"
        />
      )}

      <Textarea
        label="Efeito"
        value={dados.efeito ?? ''}
        onChange={(e) => onChange({ efeito: e.target.value })}
        placeholder="Descreva o efeito do acessório..."
        rows={3}
        maxLength={500}
      />
    </div>
  );
}
