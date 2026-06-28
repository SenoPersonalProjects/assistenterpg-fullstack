export type WorldAtlasKind = 'LOCAL' | 'SUBLOCAL' | 'INSTITUICAO' | 'BARREIRA';

export type WorldDetailLevel = 'MACRO' | 'MESO' | 'MICRO';

export type WorldBarrierType = 'BARREIRA_PURA' | 'GRANDE_BARREIRA';

export type WorldStatus = 'ATIVA' | 'RESTRITA' | 'OCULTA' | 'INSTAVEL';

export type WorldSecrecyLevel =
  | 'PUBLICO'
  | 'RESTRITO'
  | 'CONFIDENCIAL'
  | 'OCULTO';

export type WorldInternalMap = {
  src: string;
  alt: string;
};

export type WorldBasePoint = {
  id: string;
  kind: WorldAtlasKind;
  nome: string;
  lat: number;
  lng: number;
  resumo: string;
  descricaoCurta: string;
  tags: string[];
  status: WorldStatus;
  parentId?: string;
  zoomMin?: WorldDetailLevel;
  zoomMax?: WorldDetailLevel;
  ficticio?: boolean;
  mapaInterno?: WorldInternalMap;
  subtipo?: string;
  displayPriority?: number;
  nivelDeSigilo?: WorldSecrecyLevel;
  linkInterno?: string;
  notaCartografica?: string;
  corVisual?: 'cinza' | 'roxo' | 'coral' | 'ciano' | 'dourado';
};

export type WorldLocation = WorldBasePoint & {
  kind: 'LOCAL' | 'SUBLOCAL' | 'INSTITUICAO';
};

export type WorldBarrier = WorldBasePoint & {
  kind: 'BARREIRA';
  barrierType: WorldBarrierType;
  raioKmAproximado?: number;
};

export type WorldAtlasItem = WorldLocation | WorldBarrier;

export type WorldAtlasFilter = WorldAtlasKind;
