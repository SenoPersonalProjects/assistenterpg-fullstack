export type AlcancePresetValue =
  | 'NAO_DEFINIDO'
  | 'PESSOAL'
  | 'TOQUE'
  | 'CORPO_A_CORPO'
  | 'CURTO'
  | 'MEDIO'
  | 'LONGO'
  | 'EXTREMO'
  | 'ILIMITADO'
  | 'PERSONALIZADO';

export type DuracaoPresetValue =
  | 'NAO_DEFINIDA'
  | 'INSTANTANEA'
  | 'CENA'
  | 'SUSTENTADA'
  | 'PERMANENTE'
  | 'PERSONALIZADA';

export const ALCANCE_PRESET_OPTIONS: Array<{
  value: AlcancePresetValue;
  label: string;
}> = [
  { value: 'NAO_DEFINIDO', label: 'Não definido' },
  { value: 'PESSOAL', label: 'Pessoal' },
  { value: 'TOQUE', label: 'Toque' },
  { value: 'CORPO_A_CORPO', label: 'Corpo a corpo (1,5m)' },
  { value: 'CURTO', label: 'Curto (9m)' },
  { value: 'MEDIO', label: 'Médio (18m)' },
  { value: 'LONGO', label: 'Longo (36m)' },
  { value: 'EXTREMO', label: 'Extremo (90m)' },
  { value: 'ILIMITADO', label: 'Ilimitado' },
  { value: 'PERSONALIZADO', label: 'Personalizado (texto livre)' },
];

export const DURACAO_PRESET_OPTIONS: Array<{
  value: DuracaoPresetValue;
  label: string;
}> = [
  { value: 'NAO_DEFINIDA', label: 'Não definida' },
  { value: 'INSTANTANEA', label: 'Instantânea' },
  { value: 'CENA', label: 'Cena' },
  { value: 'SUSTENTADA', label: 'Sustentada' },
  { value: 'PERMANENTE', label: 'Permanente' },
  { value: 'PERSONALIZADA', label: 'Personalizada (texto livre)' },
];

function normalizeLookup(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function parseAlcancePreset(value: string | null | undefined): {
  preset: AlcancePresetValue;
  custom: string;
} {
  const raw = value?.trim() ?? '';
  if (!raw) {
    return { preset: 'NAO_DEFINIDO', custom: '' };
  }

  const normalized = normalizeLookup(raw);

  if (normalized === 'PESSOAL') return { preset: 'PESSOAL', custom: '' };
  if (normalized === 'TOQUE') return { preset: 'TOQUE', custom: '' };
  if (normalized === 'CORPOACORPO' || normalized === 'ADJACENTE') {
    return { preset: 'CORPO_A_CORPO', custom: '' };
  }
  if (normalized === 'CURTO' || normalized === 'CURTO9M') {
    return { preset: 'CURTO', custom: '' };
  }
  if (normalized === 'MEDIO' || normalized === 'MEDIO18M') {
    return { preset: 'MEDIO', custom: '' };
  }
  if (normalized === 'LONGO' || normalized === 'LONGO36M') {
    return { preset: 'LONGO', custom: '' };
  }
  if (normalized === 'EXTREMO' || normalized === 'EXTREMO90M') {
    return { preset: 'EXTREMO', custom: '' };
  }
  if (normalized === 'ILIMITADO') {
    return { preset: 'ILIMITADO', custom: '' };
  }

  return { preset: 'PERSONALIZADO', custom: raw };
}

export function serializeAlcancePreset(
  preset: Exclude<AlcancePresetValue, 'PERSONALIZADO'>,
): string | undefined {
  if (preset === 'NAO_DEFINIDO') return undefined;
  if (preset === 'PESSOAL') return 'PESSOAL';
  if (preset === 'TOQUE') return 'TOQUE';
  if (preset === 'CORPO_A_CORPO') return 'CORPO A CORPO (1,5m)';
  if (preset === 'CURTO') return 'CURTO (9m)';
  if (preset === 'MEDIO') return 'MEDIO (18m)';
  if (preset === 'LONGO') return 'LONGO (36m)';
  if (preset === 'EXTREMO') return 'EXTREMO (90m)';
  if (preset === 'ILIMITADO') return 'ILIMITADO';
  return undefined;
}

export function parseDuracaoPreset(value: string | null | undefined): {
  preset: DuracaoPresetValue;
  custom: string;
} {
  const raw = value?.trim() ?? '';
  if (!raw) {
    return { preset: 'NAO_DEFINIDA', custom: '' };
  }

  const normalized = normalizeLookup(raw);

  if (normalized === 'INSTANTANEA' || normalized === 'INSTANTANEO') {
    return { preset: 'INSTANTANEA', custom: '' };
  }
  if (normalized === 'CENA' || normalized === '1CENA' || normalized === 'UMACENA') {
    return { preset: 'CENA', custom: '' };
  }
  if (normalized === 'SUSTENTADA' || normalized === 'SUSTENTADO') {
    return { preset: 'SUSTENTADA', custom: '' };
  }
  if (normalized === 'PERMANENTE') {
    return { preset: 'PERMANENTE', custom: '' };
  }

  return { preset: 'PERSONALIZADA', custom: raw };
}

export function serializeDuracaoPreset(
  preset: Exclude<DuracaoPresetValue, 'PERSONALIZADA'>,
): string | undefined {
  if (preset === 'NAO_DEFINIDA') return undefined;
  if (preset === 'INSTANTANEA') return 'INSTANTANEA';
  if (preset === 'CENA') return 'CENA';
  if (preset === 'SUSTENTADA') return 'SUSTENTADA';
  if (preset === 'PERMANENTE') return 'PERMANENTE';
  return undefined;
}
