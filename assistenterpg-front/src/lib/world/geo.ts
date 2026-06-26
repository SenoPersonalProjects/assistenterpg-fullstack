import type {
  WorldAtlasCategory,
  WorldAtlasItem,
} from './world.types';

export const WORLD_GLOBE_RADIUS = 1.65;

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

export function getAtlasItemCategory(
  item: WorldAtlasItem,
): WorldAtlasCategory {
  return item.kind === 'barrier' ? 'BARREIRA' : item.tipo;
}
