'use client';

import { useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

type CatalogTagSelectorProps = {
  label: string;
  helperText?: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  otherLabel?: string;
  allowCustom?: boolean;
};

export function CatalogTagSelector({
  label,
  helperText,
  options,
  value,
  onChange,
  otherLabel = 'Outro',
  allowCustom = true,
}: CatalogTagSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [otherValue, setOtherValue] = useState('');
  const selected = new Set(value.map((item) => item.toLocaleLowerCase('pt-BR')));

  const add = (item: string) => {
    const normalized = item.trim();
    if (!normalized || selected.has(normalized.toLocaleLowerCase('pt-BR'))) return;
    onChange([...value, normalized]);
  };

  return (
    <div className="space-y-2 rounded-xl border border-app-border bg-app-bg/35 p-3">
      <div>
        <p className="text-sm font-semibold text-app-fg">{label}</p>
        {helperText ? <p className="text-xs text-app-muted">{helperText}</p> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          aria-label={label}
          value={selectedOption}
          onChange={(event) => {
            const next = event.target.value;
            setSelectedOption('');
            if (next) add(next);
          }}
        >
          <option value="">Selecionar opção…</option>
          {options
            .filter((option) => !selected.has(option.toLocaleLowerCase('pt-BR')))
            .map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
        </Select>
        {allowCustom ? <div className="flex gap-2">
          <Input
            aria-label={`${otherLabel} ${label}`}
            value={otherValue}
            onChange={(event) => setOtherValue(event.target.value)}
            placeholder={`${otherLabel}: texto descritivo`}
          />
          <Button type="button" variant="secondary" onClick={() => {
            add(otherValue);
            setOtherValue('');
          }}>
            Adicionar
          </Button>
        </div> : null}
      </div>
      {value.length ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge key={item} color="blue" size="sm">
              {item}
              <button
                type="button"
                className="ml-1.5 hover:text-app-danger"
                aria-label={`Remover ${item}`}
                onClick={() => onChange(value.filter((current) => current !== item))}
              >×</button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
