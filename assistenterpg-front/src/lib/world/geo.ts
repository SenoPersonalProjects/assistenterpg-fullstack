import type {
  WorldAtlasDisplayState,
  WorldAtlasFilter,
  WorldAtlasItem,
  WorldAtlasMarkerDisplayState,
  WorldDetailLevel,
  WorldInternalMap,
} from './world.types';

export const WORLD_GLOBE_RADIUS = 1.65;

export const WORLD_DETAIL_LEVEL_CAMERA_DISTANCE = {
  MACRO_MIN: 5.25,
  REGIONAL_MIN: 3.95,
  LOCAL_MIN: 2.6,
} as const;

const DETAIL_LEVEL_RANK: Record<WorldDetailLevel, number> = {
  MACRO: 0,
  REGIONAL: 1,
  LOCAL: 2,
  DETALHE: 3,
};

const DETAIL_LEVEL_SCALE_MULTIPLIER: Record<WorldDetailLevel, number> = {
  MACRO: 1,
  REGIONAL: 1,
  LOCAL: 0.82,
  DETALHE: 0.62,
};

export function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function latLngToVector3Data(
  lat: number,
  lng: number,
  radius = WORLD_GLOBE_RADIUS,
): { x: number; y: number; z: number } {
  const phi = degreesToRadians(90 - lat);
  const theta = degreesToRadians(lng + 180);

  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function getAtlasItemCategory(item: WorldAtlasItem): WorldAtlasFilter {
  if (item.kind === 'INSTITUICAO') return 'INSTITUICOES';
  if (item.kind === 'BARREIRA') return 'BARREIRAS';
  return item.escala === 'SETOR' ? 'SETORES' : 'LUGARES';
}

export function getWorldDetailLevel(cameraDistance: number): WorldDetailLevel {
  if (cameraDistance > WORLD_DETAIL_LEVEL_CAMERA_DISTANCE.MACRO_MIN) {
    return 'MACRO';
  }
  if (cameraDistance > WORLD_DETAIL_LEVEL_CAMERA_DISTANCE.REGIONAL_MIN) {
    return 'REGIONAL';
  }
  if (cameraDistance > WORLD_DETAIL_LEVEL_CAMERA_DISTANCE.LOCAL_MIN) {
    return 'LOCAL';
  }
  return 'DETALHE';
}

function getDefaultDetailRange(item: WorldAtlasItem): {
  min: WorldDetailLevel;
  max: WorldDetailLevel;
} {
  if (item.kind === 'BARREIRA') {
    return { min: 'MACRO', max: 'DETALHE' };
  }

  if (item.kind === 'INSTITUICAO') {
    return { min: 'REGIONAL', max: 'DETALHE' };
  }

  if (item.escala === 'REGIAO') {
    return { min: 'MACRO', max: 'DETALHE' };
  }

  if (item.escala === 'ZONA') {
    return { min: 'REGIONAL', max: 'DETALHE' };
  }

  return { min: 'DETALHE', max: 'DETALHE' };
}

export function isWorldItemVisibleAtDetailLevel(
  item: WorldAtlasItem,
  detailLevel: WorldDetailLevel,
): boolean {
  const defaultRange = getDefaultDetailRange(item);
  const min = item.zoomMin ?? defaultRange.min;
  const max = item.zoomMax ?? defaultRange.max;
  const currentRank = DETAIL_LEVEL_RANK[detailLevel];

  return (
    currentRank >= DETAIL_LEVEL_RANK[min] &&
    currentRank <= DETAIL_LEVEL_RANK[max]
  );
}

function isFilterEnabled(
  item: WorldAtlasItem,
  activeFilters: Set<WorldAtlasFilter>,
): boolean {
  return activeFilters.has(getAtlasItemCategory(item));
}

function shouldSuppressAncestor(
  item: WorldAtlasItem,
  candidateItems: WorldAtlasItem[],
): boolean {
  if (item.kind !== 'LUGAR') return false;

  return candidateItems.some(
    (candidate) =>
      candidate.parentId === item.id && candidate.kind !== 'BARREIRA',
  );
}

export function getAtlasDisplayState(
  items: WorldAtlasItem[],
  activeFilters: WorldAtlasFilter[],
  detailLevel: WorldDetailLevel,
): WorldAtlasDisplayState {
  const filters = new Set(activeFilters);
  const filterEnabledItems = items.filter((item) =>
    isFilterEnabled(item, filters),
  );
  const candidateItems = filterEnabledItems.filter((item) =>
    isWorldItemVisibleAtDetailLevel(item, detailLevel),
  );
  const candidateIds = new Set(candidateItems.map((item) => item.id));
  const markerStates: WorldAtlasMarkerDisplayState[] = items.map((item) => {
    const filterEnabled = filterEnabledItems.includes(item);
    const detailVisible = candidateIds.has(item.id);
    const suppressed =
      filterEnabled && detailVisible && shouldSuppressAncestor(item, candidateItems);
    const visible = filterEnabled && detailVisible && !suppressed;

    return {
      itemId: item.id,
      visible,
      suppressed,
      filterEnabled,
      detailVisible,
      scaleMultiplier: DETAIL_LEVEL_SCALE_MULTIPLIER[detailLevel],
      opacityMultiplier: visible ? 1 : 0,
    };
  });
  const markerStateById = new Map(
    markerStates.map((state) => [state.itemId, state]),
  );

  return {
    visibleItems: items
      .filter((item) => markerStateById.get(item.id)?.visible)
      .sort(sortWorldAtlasItems),
    markerStates,
    markerStateById,
    filterEnabledItemIds: new Set(filterEnabledItems.map((item) => item.id)),
  };
}

export function filterWorldAtlasItems(
  items: WorldAtlasItem[],
  activeFilters: WorldAtlasFilter[],
  detailLevel: WorldDetailLevel,
): WorldAtlasItem[] {
  return getAtlasDisplayState(items, activeFilters, detailLevel).visibleItems;
}

export function sortWorldAtlasItems(
  a: WorldAtlasItem,
  b: WorldAtlasItem,
): number {
  const priorityA = a.displayPriority ?? 100;
  const priorityB = b.displayPriority ?? 100;
  if (priorityA !== priorityB) return priorityA - priorityB;
  return a.nome.localeCompare(b.nome, 'pt-BR');
}

export function buildWorldBreadcrumb(
  item: WorldAtlasItem,
  items: WorldAtlasItem[],
): WorldAtlasItem[] {
  const itemById = new Map(items.map((entry) => [entry.id, entry]));
  const chain: WorldAtlasItem[] = [];
  let current: WorldAtlasItem | undefined = item;

  while (current) {
    chain.unshift(current);
    current = current.parentId ? itemById.get(current.parentId) : undefined;
  }

  return chain;
}

export function resolveWorldInternalMap(
  item: WorldAtlasItem,
  items: WorldAtlasItem[],
): WorldInternalMap | null {
  const breadcrumb = buildWorldBreadcrumb(item, items);

  for (let index = breadcrumb.length - 1; index >= 0; index -= 1) {
    const entry = breadcrumb[index];
    if (entry.mapaInterno) {
      return entry.mapaInterno;
    }
  }

  return null;
}
