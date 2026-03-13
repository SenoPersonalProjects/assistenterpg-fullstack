import type {
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@/lib/types';

export type NpcOption<T extends string> = {
  value: T;
  label: string;
};

const FICHA_TIPO_LABEL: Record<TipoFichaNpcAmeaca, string> = {
  NPC: 'Aliado',
  AMEACA: 'Ameaca',
};

const TIPO_LABEL: Record<TipoNpcAmeaca, string> = {
  HUMANO: 'Humano',
  FEITICEIRO: 'Feiticeiro',
  MALDICAO: 'Maldicao',
  ANIMAL: 'Animal',
  HIBRIDO: 'Hibrido',
  OUTRO: 'Outro',
};

const TAMANHO_LABEL: Record<TamanhoNpcAmeaca, string> = {
  MINUSCULO: 'Minusculo',
  PEQUENO: 'Pequeno',
  MEDIO: 'Medio',
  GRANDE: 'Grande',
  ENORME: 'Enorme',
  COLOSSAL: 'Colossal',
};

export const fichaTipoOptions: NpcOption<TipoFichaNpcAmeaca>[] = [
  { value: 'NPC', label: FICHA_TIPO_LABEL.NPC },
  { value: 'AMEACA', label: FICHA_TIPO_LABEL.AMEACA },
];

export const tipoNpcOptions: NpcOption<TipoNpcAmeaca>[] = [
  { value: 'HUMANO', label: TIPO_LABEL.HUMANO },
  { value: 'FEITICEIRO', label: TIPO_LABEL.FEITICEIRO },
  { value: 'MALDICAO', label: TIPO_LABEL.MALDICAO },
  { value: 'ANIMAL', label: TIPO_LABEL.ANIMAL },
  { value: 'HIBRIDO', label: TIPO_LABEL.HIBRIDO },
  { value: 'OUTRO', label: TIPO_LABEL.OUTRO },
];

export const tamanhoNpcOptions: NpcOption<TamanhoNpcAmeaca>[] = [
  { value: 'MINUSCULO', label: TAMANHO_LABEL.MINUSCULO },
  { value: 'PEQUENO', label: TAMANHO_LABEL.PEQUENO },
  { value: 'MEDIO', label: TAMANHO_LABEL.MEDIO },
  { value: 'GRANDE', label: TAMANHO_LABEL.GRANDE },
  { value: 'ENORME', label: TAMANHO_LABEL.ENORME },
  { value: 'COLOSSAL', label: TAMANHO_LABEL.COLOSSAL },
];

export function labelFichaTipo(tipo: TipoFichaNpcAmeaca): string {
  return FICHA_TIPO_LABEL[tipo];
}

export function labelTipoNpc(tipo: TipoNpcAmeaca | string): string {
  return TIPO_LABEL[tipo as TipoNpcAmeaca] ?? tipo;
}

export function labelTamanhoNpc(tamanho: TamanhoNpcAmeaca): string {
  return TAMANHO_LABEL[tamanho];
}

export function corBadgeFichaTipo(tipo: TipoFichaNpcAmeaca): 'blue' | 'red' {
  return tipo === 'NPC' ? 'blue' : 'red';
}
