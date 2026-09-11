'use client';

import type { JsonImportGuideReferenceRow } from '@/lib/types';
import { Select } from '@/components/ui/Select';

type CatalogReferenceSelectProps = {
  label: string;
  helperText?: string;
  value: number | undefined;
  rows: JsonImportGuideReferenceRow[];
  onChange: (value: number | undefined) => void;
  required?: boolean;
};

export function CatalogReferenceSelect({
  label,
  helperText,
  value,
  rows,
  onChange,
  required,
}: CatalogReferenceSelectProps) {
  const selected = rows.find((item) => item.id === value);
  return (
    <Select
      label={label}
      helperText={selected?.descricao ?? helperText}
      value={value ? String(value) : ''}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
      required={required}
    >
      <option value="">Selecionar…</option>
      {rows.map((item) => (
        <option key={item.id ?? item.codigo ?? item.nome} value={item.id ?? ''}>
          {item.nome}{item.codigo ? ` — ${item.codigo}` : ''}
        </option>
      ))}
    </Select>
  );
}
