'use client';

import type { IconName } from '@/components/ui/Icon';
import type { StatusPublicacao, TipoHomebrewConteudo } from '@/lib/api/homebrews';

export type HomebrewTipoConfig = {
  icon: IconName;
  label: string;
  color: 'blue' | 'purple' | 'cyan' | 'orange' | 'green' | 'yellow';
};

const TIPO_CONFIG: Record<TipoHomebrewConteudo, HomebrewTipoConfig> = {
  CLA: { icon: 'clan', label: 'Clã', color: 'blue' },
  TRILHA: { icon: 'school', label: 'Trilha', color: 'purple' },
  CAMINHO: { icon: 'map', label: 'Caminho', color: 'cyan' },
  ORIGEM: { icon: 'story', label: 'Origem', color: 'orange' },
  EQUIPAMENTO: { icon: 'item', label: 'Equipamento', color: 'green' },
  PODER_GENERICO: { icon: 'sparkles', label: 'Poder', color: 'yellow' },
  TECNICA_AMALDICOADA: { icon: 'technique', label: 'Técnica', color: 'purple' },
};

const STATUS_COLOR: Record<StatusPublicacao, 'green' | 'yellow' | 'gray'> = {
  PUBLICADO: 'green',
  RASCUNHO: 'yellow',
  ARQUIVADO: 'gray',
};

export function getHomebrewTipoConfig(tipo: TipoHomebrewConteudo): HomebrewTipoConfig {
  return TIPO_CONFIG[tipo];
}

export function getHomebrewStatusColor(status: StatusPublicacao): 'green' | 'yellow' | 'gray' {
  return STATUS_COLOR[status];
}
