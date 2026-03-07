import type { TipoFonte } from '@/lib/api';

export const FONTE_OPTIONS: Array<{ value: TipoFonte; label: string }> = [
  { value: 'SISTEMA_BASE' as TipoFonte, label: 'Sistema Base' },
  { value: 'SUPLEMENTO' as TipoFonte, label: 'Suplemento' },
  { value: 'HOMEBREW' as TipoFonte, label: 'Homebrew' },
];

export function formatFonte(fonte?: TipoFonte): string {
  if (!fonte) return 'N/A';
  if (fonte === 'SISTEMA_BASE') return 'Sistema Base';
  if (fonte === 'SUPLEMENTO') return 'Suplemento';
  return 'Homebrew';
}

export function fonteBadgeColor(fonte?: TipoFonte): 'gray' | 'blue' | 'orange' {
  if (fonte === 'SUPLEMENTO') return 'blue';
  if (fonte === 'HOMEBREW') return 'orange';
  return 'gray';
}

export function toOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
