import { describe, expect, it } from 'vitest';
import {
  WORLD_ATLAS_ITEMS,
  WORLD_BARRIERS,
  WORLD_LOCATIONS,
  buildWorldBreadcrumb,
  filterWorldAtlasItems,
  getAtlasDisplayState,
  getAtlasItemCategory,
  getWorldDetailLevel,
  latLngToVector3Data,
  resolveWorldInternalMap,
} from './index';

const ALL_FILTERS = [
  'LUGARES',
  'SETORES',
  'INSTITUICOES',
  'BARREIRAS',
] as const;

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

  it('models Japan, the Citadel and districts as a place hierarchy', () => {
    const japan = WORLD_LOCATIONS.find((item) => item.id === 'japao');
    const citadel = WORLD_LOCATIONS.find((item) => item.id === 'cidadela');
    const commercialDistrict = WORLD_LOCATIONS.find(
      (item) => item.id === 'cidadela-distrito-comercial',
    );

    expect(japan).toMatchObject({ kind: 'LUGAR', escala: 'REGIAO' });
    expect(citadel).toMatchObject({
      kind: 'LUGAR',
      escala: 'ZONA',
      parentId: 'japao',
    });
    expect(commercialDistrict).toMatchObject({
      kind: 'LUGAR',
      escala: 'SETOR',
      parentId: 'cidadela',
    });
  });

  it('marks Kakyn as a fictional supernatural region', () => {
    const kakyn = WORLD_LOCATIONS.find((item) => item.id === 'imperio-kakyn');

    expect(kakyn).toMatchObject({
      kind: 'LUGAR',
      escala: 'REGIAO',
      ficticio: true,
    });
    expect(kakyn?.notaCartografica).toContain('não representa geografia real');
  });

  it('classifies barriers under the barrier filter category', () => {
    for (const barrier of WORLD_BARRIERS) {
      expect(getAtlasItemCategory(barrier)).toBe('BARREIRAS');
    }
  });

  it('keeps parent references valid', () => {
    const ids = new Set(WORLD_ATLAS_ITEMS.map((item) => item.id));

    for (const item of WORLD_ATLAS_ITEMS) {
      if (item.parentId) {
        expect(ids.has(item.parentId)).toBe(true);
      }
    }
  });

  it('resolves breadcrumb for Citadel districts', () => {
    const commercialDistrict = WORLD_ATLAS_ITEMS.find(
      (item) => item.id === 'cidadela-distrito-comercial',
    );

    expect(commercialDistrict).toBeDefined();
    expect(
      buildWorldBreadcrumb(commercialDistrict!, WORLD_ATLAS_ITEMS).map(
        (item) => item.id,
      ),
    ).toEqual(['japao', 'cidadela', 'cidadela-distrito-comercial']);
  });

  it('connects the Citadel internal map and lets districts inherit it', () => {
    const citadel = WORLD_LOCATIONS.find((item) => item.id === 'cidadela');
    const citadelDistricts = WORLD_LOCATIONS.filter(
      (item) => item.kind === 'LUGAR' && item.parentId === 'cidadela',
    );

    expect(citadel?.mapaInterno?.src).toBe('/images/world/cidadela-map.png');
    expect(citadel?.mapaInterno?.alt).toContain('Mapa interno da Cidadela');
    expect(citadelDistricts.length).toBeGreaterThan(0);

    for (const district of citadelDistricts) {
      expect(resolveWorldInternalMap(district, WORLD_ATLAS_ITEMS)?.src).toBe(
        '/images/world/cidadela-map.png',
      );
    }
  });

  it('applies detail levels from camera distance', () => {
    expect(getWorldDetailLevel(6)).toBe('MACRO');
    expect(getWorldDetailLevel(4.6)).toBe('REGIONAL');
    expect(getWorldDetailLevel(3)).toBe('LOCAL');
    expect(getWorldDetailLevel(2.2)).toBe('DETALHE');
  });

  it('uses LOD to reveal regions, zones and sectors', () => {
    const macroItems = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'MACRO',
    );
    expect(macroItems.some((item) => item.kind === 'LUGAR' && item.escala === 'REGIAO')).toBe(true);
    expect(macroItems.some((item) => item.kind === 'LUGAR' && item.escala === 'SETOR')).toBe(false);

    const regionalItems = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'REGIONAL',
    );
    expect(regionalItems.some((item) => item.id === 'cidadela')).toBe(true);

    const detailItems = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'DETALHE',
    );
    expect(
      detailItems.some((item) => item.id === 'cidadela-distrito-comercial'),
    ).toBe(true);
  });

  it('lets filters override LOD visibility', () => {
    const detailWithoutSectors = filterWorldAtlasItems(
      WORLD_ATLAS_ITEMS,
      ['LUGARES', 'INSTITUICOES', 'BARREIRAS'],
      'DETALHE',
    );

    expect(
      detailWithoutSectors.some((item) => item.kind === 'LUGAR' && item.escala === 'SETOR'),
    ).toBe(false);
  });

  it('suppresses ancestors when child places are visible', () => {
    const regionalState = getAtlasDisplayState(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'REGIONAL',
    );
    const detailState = getAtlasDisplayState(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'DETALHE',
    );

    expect(regionalState.markerStateById.get('japao')).toMatchObject({
      visible: false,
      suppressed: true,
      filterEnabled: true,
    });
    expect(regionalState.markerStateById.get('cidadela')).toMatchObject({
      visible: true,
      suppressed: false,
    });
    expect(detailState.markerStateById.get('cidadela')).toMatchObject({
      visible: false,
      suppressed: true,
      filterEnabled: true,
    });
    expect(
      detailState.markerStateById.get('cidadela-distrito-comercial'),
    ).toMatchObject({
      visible: true,
      suppressed: false,
    });
  });

  it('keeps suppressed selected items eligible for the lore panel while filter is active', () => {
    const detailState = getAtlasDisplayState(
      WORLD_ATLAS_ITEMS,
      [...ALL_FILTERS],
      'DETALHE',
    );

    expect(detailState.markerStateById.get('cidadela')).toMatchObject({
      visible: false,
      suppressed: true,
      filterEnabled: true,
    });
    expect(detailState.filterEnabledItemIds.has('cidadela')).toBe(true);
  });
});
