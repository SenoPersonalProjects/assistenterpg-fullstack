export type WorldAtlasKind = 'LUGAR' | 'INSTITUICAO' | 'BARREIRA';

export type WorldPlaceScale = 'REGIAO' | 'ZONA' | 'SETOR';

export type WorldDetailLevel = 'MACRO' | 'REGIONAL' | 'LOCAL' | 'DETALHE';

export type WorldAtlasFilter =
  | 'LUGARES'
  | 'SETORES'
  | 'INSTITUICOES'
  | 'BARREIRAS';

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

export type WorldPlace = WorldBasePoint & {
  kind: 'LUGAR';
  escala: WorldPlaceScale;
};

export type WorldInstitution = WorldBasePoint & {
  kind: 'INSTITUICAO';
};

export type WorldBarrier = WorldBasePoint & {
  kind: 'BARREIRA';
  barrierType: WorldBarrierType;
  raioKmAproximado?: number;
};

export type WorldAtlasItem = WorldPlace | WorldInstitution | WorldBarrier;

export type WorldAtlasMarkerDisplayState = {
  itemId: string;
  visible: boolean;
  suppressed: boolean;
  filterEnabled: boolean;
  detailVisible: boolean;
  scaleMultiplier: number;
  opacityMultiplier: number;
};

export type WorldAtlasDisplayState = {
  visibleItems: WorldAtlasItem[];
  markerStates: WorldAtlasMarkerDisplayState[];
  markerStateById: Map<string, WorldAtlasMarkerDisplayState>;
  filterEnabledItemIds: Set<string>;
};
