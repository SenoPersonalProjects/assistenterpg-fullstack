'use client';

import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { FONTE_OPTIONS } from './fonte-utils';
import type { TipoFonte, SuplementoCatalogo } from '@/lib/api';

type Props = {
  fonte: TipoFonte;
  suplementoId: string;
  suplementos: SuplementoCatalogo[];
  errorSuplementoId?: string;
  onChangeFonte: (fonte: TipoFonte) => void;
  onChangeSuplementoId: (value: string) => void;
};

export function FonteSuplementoFields({
  fonte,
  suplementoId,
  suplementos,
  errorSuplementoId,
  onChangeFonte,
  onChangeSuplementoId,
}: Props) {
  return (
    <>
      <Select
        label="Fonte *"
        value={fonte}
        onChange={(e) => onChangeFonte(e.target.value as TipoFonte)}
      >
        {FONTE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>

      {fonte === 'SUPLEMENTO' ? (
        <Select
          label="Suplemento *"
          value={suplementoId}
          onChange={(e) => onChangeSuplementoId(e.target.value)}
          error={errorSuplementoId}
        >
          <option value="">Selecione...</option>
          {suplementos.map((suplemento) => (
            <option key={suplemento.id} value={suplemento.id.toString()}>
              #{suplemento.id} - {suplemento.nome}
            </option>
          ))}
        </Select>
      ) : (
        <Input label="Suplemento" value="" disabled helperText="Nao aplicavel para esta fonte." />
      )}
    </>
  );
}
