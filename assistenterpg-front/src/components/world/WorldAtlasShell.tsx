'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { WorldAccessibleItemList } from '@/components/world/WorldAccessibleItemList';
import { WorldFilters } from '@/components/world/WorldFilters';
import type { WorldFilterOption } from '@/components/world/WorldFilters';
import { WorldGlobeCanvas } from '@/components/world/WorldGlobeCanvas';
import { WorldLocationPanel } from '@/components/world/WorldLocationPanel';
import type {
  WorldAtlasFilter,
  WorldAtlasItem,
  WorldDetailLevel,
} from '@/lib/world';
import {
  WORLD_ATLAS_ITEMS,
  filterWorldAtlasItems,
  getAtlasItemCategory,
} from '@/lib/world';

const FILTER_OPTIONS_BASE: Array<Omit<WorldFilterOption, 'count'>> = [
  {
    id: 'LOCAL',
    label: 'Locais',
    description: 'Regiões e áreas geográficas principais.',
    icon: 'map',
  },
  {
    id: 'SUBLOCAL',
    label: 'Sublocais',
    description: 'Distritos e recortes revelados no zoom próximo.',
    icon: 'layers',
  },
  {
    id: 'INSTITUICAO',
    label: 'Instituições',
    description: 'Escolas, clãs e instalações operacionais.',
    icon: 'school',
  },
  {
    id: 'BARREIRA',
    label: 'Barreiras',
    description: 'Campos, halos e selos de contenção.',
    icon: 'domain',
  },
];

const DEFAULT_FILTERS: WorldAtlasFilter[] = FILTER_OPTIONS_BASE.map(
  (option) => option.id,
);

function countItemsByFilter(items: WorldAtlasItem[], filter: WorldAtlasFilter) {
  return items.filter((item) => getAtlasItemCategory(item) === filter).length;
}

export function WorldAtlasShell() {
  const [activeFilters, setActiveFilters] =
    useState<WorldAtlasFilter[]>(DEFAULT_FILTERS);
  const [detailLevel, setDetailLevel] = useState<WorldDetailLevel>('MESO');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const filterOptions = useMemo<WorldFilterOption[]>(
    () =>
      FILTER_OPTIONS_BASE.map((option) => ({
        ...option,
        count: countItemsByFilter(WORLD_ATLAS_ITEMS, option.id),
      })),
    [],
  );

  const visibleItems = useMemo(
    () => filterWorldAtlasItems(WORLD_ATLAS_ITEMS, activeFilters, detailLevel),
    [activeFilters, detailLevel],
  );

  const visibleItemIds = useMemo(
    () => visibleItems.map((item) => item.id),
    [visibleItems],
  );

  const selectedItem = useMemo(
    () => visibleItems.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId, visibleItems],
  );

  const hoveredItem = useMemo(
    () =>
      hoveredItemId
        ? visibleItems.find((item) => item.id === hoveredItemId) ?? null
        : null,
    [hoveredItemId, visibleItems],
  );

  useEffect(() => {
    const visibleSet = new Set(visibleItemIds);
    const shouldClearSelected =
      selectedItemId !== null && !visibleSet.has(selectedItemId);
    const shouldClearHovered =
      hoveredItemId !== null && !visibleSet.has(hoveredItemId);

    if (!shouldClearSelected && !shouldClearHovered) return;

    const timeoutId = window.setTimeout(() => {
      if (shouldClearSelected) {
        setSelectedItemId(null);
      }
      if (shouldClearHovered) {
        setHoveredItemId(null);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hoveredItemId, selectedItemId, visibleItemIds]);

  const handleToggleFilter = useCallback((filter: WorldAtlasFilter) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((entry) => entry !== filter)
        : [...current, filter],
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilters(DEFAULT_FILTERS);
  }, []);

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  const handleHoverItem = useCallback((itemId: string | null) => {
    setHoveredItemId(itemId);
  }, []);

  const handleDetailLevelChange = useCallback((level: WorldDetailLevel) => {
    setDetailLevel(level);
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-5 md:px-8 md:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl border border-app-border/60 bg-app-surface/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-app-primary/20 blur-3xl" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-app-primary/70 to-transparent" />

          <div className="relative z-10 grid gap-5 lg:grid-cols-[1.45fr_0.7fr] lg:items-end">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-app-primary/30 bg-app-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-app-primary">
                <Icon name="map" className="h-4 w-4" />
                Arquivo cartográfico
              </span>

              <div className="max-w-4xl space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-app-fg md:text-5xl">
                  Atlas do <span className="text-gradient">Mundo</span>
                </h1>
                <p className="text-sm font-medium leading-relaxed text-app-muted md:text-base">
                  Camadas de locais, instituições, barreiras e sublocais do
                  cenário em um globo tático construído com Three.js direto.
                </p>
              </div>
            </div>

            <Card variant="outline" className="bg-app-bg/35 !p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-app-muted">
                Nível de detalhe
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-app-fg">{detailLevel}</p>
                  <p className="text-xs font-bold text-app-muted">
                    {visibleItems.length} pontos visíveis
                  </p>
                </div>
                <div className="rounded-xl border border-app-border bg-app-surface/60 px-3 py-2 text-right">
                  <p className="text-lg font-black text-app-fg">
                    {activeFilters.length}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                    camadas
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </header>

        <WorldFilters
          options={filterOptions}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          onResetFilters={handleResetFilters}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
          <div className="space-y-4">
            <WorldGlobeCanvas
              items={WORLD_ATLAS_ITEMS}
              visibleItemIds={visibleItemIds}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={handleSelectItem}
              onClearSelection={handleClearSelection}
              onHoverItem={handleHoverItem}
              onDetailLevelChange={handleDetailLevelChange}
            />
            <WorldAccessibleItemList
              items={visibleItems}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={handleSelectItem}
            />
          </div>
          <WorldLocationPanel
            item={selectedItem}
            hoveredItem={hoveredItem}
            items={WORLD_ATLAS_ITEMS}
            onSelectItem={handleSelectItem}
          />
        </section>
      </div>
    </main>
  );
}
