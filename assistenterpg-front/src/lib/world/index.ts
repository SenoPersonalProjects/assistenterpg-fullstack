import { WORLD_BARRIERS } from './world-barriers';
import { WORLD_LOCATIONS } from './world-locations';
import type { WorldAtlasItem } from './world.types';

export * from './geo';
export * from './world-barriers';
export * from './world-locations';
export * from './world.types';

export const WORLD_ATLAS_ITEMS: WorldAtlasItem[] = [
  ...WORLD_LOCATIONS,
  ...WORLD_BARRIERS,
];

export const WORLD_ATLAS_ITEM_BY_ID = new Map(
  WORLD_ATLAS_ITEMS.map((item) => [item.id, item]),
);
