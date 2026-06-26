export type WorldLocationType = 'ESCOLA' | 'ORGANIZACAO' | 'REGIAO_OCULTA';

export type WorldBarrierType = 'BARREIRA_PURA' | 'GRANDE_BARREIRA';

export type WorldAtlasCategory = WorldLocationType | 'BARREIRA';

export type WorldStatus = 'ATIVA' | 'RESTRITA' | 'OCULTA' | 'INSTAVEL';

export type WorldSecrecyLevel =
  | 'PUBLICO'
  | 'RESTRITO'
  | 'CONFIDENCIAL'
  | 'OCULTO';

export type WorldBasePoint = {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  resumo: string;
  descricaoCurta: string;
  tags: string[];
  status: WorldStatus;
  nivelDeSigilo?: WorldSecrecyLevel;
  linkInterno?: string;
};

export type WorldLocation = WorldBasePoint & {
  kind: 'location';
  tipo: WorldLocationType;
  ficticio?: boolean;
  notaCartografica?: string;
};

export type WorldBarrier = WorldBasePoint & {
  kind: 'barrier';
  tipo: 'BARREIRA';
  barrierType: WorldBarrierType;
  raioKmAproximado?: number;
};

export type WorldAtlasItem = WorldLocation | WorldBarrier;

export type WorldAtlasFilter = WorldAtlasCategory;
