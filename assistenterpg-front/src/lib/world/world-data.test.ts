import { describe, expect, it } from 'vitest';
import {
  WORLD_ATLAS_ITEMS,
  WORLD_BARRIERS,
  WORLD_LOCATIONS,
  getAtlasItemCategory,
  latLngToVector3Data,
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

  it('marks Kakyn as a hidden fictional region', () => {
    const kakyn = WORLD_LOCATIONS.find((item) => item.id === 'imperio-kakyn');

    expect(kakyn?.tipo).toBe('REGIAO_OCULTA');
    expect(kakyn?.ficticio).toBe(true);
    expect(kakyn?.notaCartografica).toContain('não representa geografia real');
  });

  it('classifies barriers under the barrier filter category', () => {
    for (const barrier of WORLD_BARRIERS) {
      expect(getAtlasItemCategory(barrier)).toBe('BARREIRA');
    }
  });
});
