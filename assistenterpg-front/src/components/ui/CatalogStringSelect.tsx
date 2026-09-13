'use client';

import { useState } from 'react';
import { Input } from './Input';
import { Select } from './Select';

const CUSTOM_VALUE = '__PERSONALIZADO__';

type CatalogStringSelectProps = {
  label: string;
  helperText?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  otherLabel?: string;
};

function isCatalogOption(value: string, options: readonly string[]) {
  const normalized = value.trim().toLocaleLowerCase('pt-BR');
  return Boolean(normalized) && options.some(
    (option) => option.toLocaleLowerCase('pt-BR') === normalized,
  );
}

export function CatalogStringSelect({
  label,
  helperText,
  options,
  value,
  onChange,
  otherLabel = 'Outro',
}: CatalogStringSelectProps) {
  const valueIsCatalogOption = isCatalogOption(value, options);
  const [customSelected, setCustomSelected] = useState(
    Boolean(value.trim()) && !valueIsCatalogOption,
  );
  const showCustomInput = customSelected || (Boolean(value.trim()) && !valueIsCatalogOption);
  const selectValue = valueIsCatalogOption ? value : customSelected ? CUSTOM_VALUE : '';

  return (
    <div className="space-y-2">
      <Select
        label={label}
        helperText={helperText}
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          const isCustom = next === CUSTOM_VALUE;
          setCustomSelected(isCustom);
          onChange(isCustom ? '' : next);
        }}
      >
        <option value="">Selecionar…</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value={CUSTOM_VALUE}>{otherLabel}…</option>
      </Select>

      {showCustomInput ? (
        <Input
          label={`${otherLabel}: ${label}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Informe uma referência descritiva local"
        />
      ) : null}
    </div>
  );
}
