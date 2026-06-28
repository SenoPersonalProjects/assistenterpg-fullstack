import type {
  WorldAtlasFilter,
  WorldAtlasItem,
  WorldDetailLevel,
  WorldInternalMap,
} from './world.types';

export const WORLD_GLOBE_RADIUS = 1.65;

export const WORLD_DETAIL_LEVEL_CAMERA_DISTANCE = {
  MACRO_MIN: 5.15,
  MICRO_MAX: 3.35,
} as const;

const DETAIL_LEVEL_RANK: Record<WorldDetailLevel, number> = {
  MACRO: 0,
  MESO: 1,
  MICRO: 2,
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
  return item.kind;
}

export function getWorldDetailLevel(cameraDistance: number): WorldDetailLevel {
  if (cameraDistance > WORLD_DETAIL_LEVEL_CAMERA_DISTANCE.MACRO_MIN) {
    return 'MACRO';
  }
  if (cameraDistance <= WORLD_DETAIL_LEVEL_CAMERA_DISTANCE.MICRO_MAX) {
    return 'MICRO';
  }
  return 'MESO';
}

export function isWorldItemVisibleAtDetailLevel(
  item: WorldAtlasItem,
  detailLevel: WorldDetailLevel,
): boolean {
  const defaultMin: WorldDetailLevel =
    item.kind === 'SUBLOCAL' ? 'MICRO' : 'MACRO';
  const min = item.zoomMin ?? defaultMin;
  const max = item.zoomMax ?? 'MICRO';
  const currentRank = DETAIL_LEVEL_RANK[detailLevel];

  return (
    currentRank >= DETAIL_LEVEL_RANK[min] &&
    currentRank <= DETAIL_LEVEL_RANK[max]
  );
}

export function filterWorldAtlasItems(
  items: WorldAtlasItem[],
  activeFilters: WorldAtlasFilter[],
  detailLevel: WorldDetailLevel,
): WorldAtlasItem[] {
  const active = new Set(activeFilters);

  return items
    .filter(
      (item) =>
        active.has(getAtlasItemCategory(item)) &&
        isWorldItemVisibleAtDetailLevel(item, detailLevel),
    )
    .sort((a, b) => {
      const priorityA = a.displayPriority ?? 100;
      const priorityB = b.displayPriority ?? 100;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
}

export function resolveWorldInternalMap(
  item: WorldAtlasItem,
  items: WorldAtlasItem[],
): WorldInternalMap | null {
  const itemById = new Map(items.map((entry) => [entry.id, entry]));
  let current: WorldAtlasItem | undefined = item;

  while (current) {
    if (current.mapaInterno) {
      return current.mapaInterno;
    }

    current = current.parentId ? itemById.get(current.parentId) : undefined;
  }

  return null;
}
