import { describe, expect, it } from 'vitest';
import {
  WORLD_ATLAS_ITEMS,
  WORLD_BARRIERS,
  WORLD_LOCATIONS,
  filterWorldAtlasItems,
  getAtlasItemCategory,
  getWorldDetailLevel,
  latLngToVector3Data,
  resolveWorldInternalMap,
} from './index';

describe('world atlas data', () => {
  it('keeps atlas ids unique', () => {
    const ids = WORLD_ATLAS_ITEMS.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps all coordinates inside valid latitude and longitude ranges', () => {
    for (const item of WORLD_ATLAS_ITEMS) {
      expect(item.lat).toBeGreaterThanOrEqual(-90);
      expect(item.lat).toBeLessThanOrEqual(90);
      expect(item.lng).toBeGreaterThanOrEqual(-180);
      expect(item.lng).toBeLessThanOrEqual(180);
    }
  });

  it('normalizes latitude and longitude to a radius vector', () => {
    const radius = 2;
    const point = latLngToVector3Data(0, 0, radius);
    const length = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);

    expect(length).toBeCloseTo(radius, 6);
  });

  it('marks Kakyn as a fictional supernatural local', () => {
    const kakyn = WORLD_LOCATIONS.find((item) => item.id === 'imperio-kakyn');

    expect(kakyn?.kind).toBe('LOCAL');
    expect(kakyn?.ficticio).toBe(true);
    expect(kakyn?.notaCartografica).toContain('não representa geografia real');
  });

  it('classifies barriers under the barrier filter category', () => {
    for (const barrier of WORLD_BARRIERS) {
      expect(getAtlasItemCategory(barrier)).toBe('BARREIRA');
    }
  });

  it('keeps parent references valid and sublocals attached to a parent', () => {
    const ids = new Set(WORLD_ATLAS_ITEMS.map((item) => item.id));

    for (const item of WORLD_ATLAS_ITEMS) {
      if (item.parentId) {
        expect(ids.has(item.parentId)).toBe(true);
      }
      if (item.kind === 'SUBLOCAL') {
        expect(item.parentId).toBeTruthy();
      }
    }
  });

  it('connects the Citadel internal map and lets districts inherit it', () => {
    const citadel = WORLD_LOCATIONS.find((item) => item.id === 'cidadela');

    expect(citadel?.mapaInterno?.src).toBe('/images/world/cidadela-map.png');
    expect(citadel?.mapaInterno?.alt).toContain('Mapa interno da Cidadela');

    const citadelDistricts = WORLD_LOCATIONS.filter(
      (item) => item.parentId === 'cidadela',
    );

    expect(citadelDistricts.length).toBeGreaterThan(0);

    for (const district of citadelDistricts) {
      expect(resolveWorldInternalMap(district, WORLD_ATLAS_ITEMS)?.src).toBe(
        '/images/world/cidadela-map.png',
      );
    }
  });

  it('applies detail levels from camera distance', () => {
    expect(getWorldDetailLevel(6)).toBe('MACRO');
    expect(getWorldDetailLevel(4.6)).toBe('MESO');
    expect(getWorldDetailLevel(3)).toBe('MICRO');
  });

  it('uses LOD and filters to control sublocal visibility', () => {
    const allFilters = ['LOCAL', 'SUBLOCAL', 'INSTITUICAO', 'BARREIRA'] as const;

    const macroItems = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      [...allFilters],
      'MACRO',
    );
    expect(macroItems.some((item) => item.kind === 'SUBLOCAL')).toBe(false);

    const microItems = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      [...allFilters],
      'MICRO',
    );
    expect(microItems.some((item) => item.kind === 'SUBLOCAL')).toBe(true);

    const microWithoutSublocals = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      ['LOCAL', 'INSTITUICAO', 'BARREIRA'],
      'MICRO',
    );
    expect(microWithoutSublocals.some((item) => item.kind === 'SUBLOCAL')).toBe(false);
  });
});
