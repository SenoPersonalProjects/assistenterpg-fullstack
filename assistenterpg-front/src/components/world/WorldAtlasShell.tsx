'use client';

import { useCallback, useMemo, useState } from 'react';
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
} from '@/lib/world';
import {
  WORLD_ATLAS_ITEMS,
  getAtlasItemCategory,
} from '@/lib/world';

const FILTER_OPTIONS_BASE: Array<Omit<WorldFilterOption, 'count'>> = [
  {
    id: 'ESCOLA',
    label: 'Escolas',
    description: 'Unidades de formação e operação jujutsu.',
    icon: 'school',
  },
  {
    id: 'BARREIRA',
    label: 'Barreiras',
    description: 'Selos puros, halos e zonas ritualísticas.',
    icon: 'domain',
  },
  {
    id: 'ORGANIZACAO',
    label: 'Organizações',
    description: 'Núcleos políticos e arquivos de alto sigilo.',
    icon: 'archive',
  },
  {
    id: 'REGIAO_OCULTA',
    label: 'Regiões ocultas',
    description: 'Territórios sobrenaturais fora do mapa comum.',
    icon: 'sparkles',
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
    () =>
      WORLD_ATLAS_ITEMS.filter((item) =>
        activeFilters.includes(getAtlasItemCategory(item)),
      ),
    [activeFilters],
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

  const handleToggleFilter = useCallback(
    (filter: WorldAtlasFilter) => {
      const selectedItem = selectedItemId
        ? WORLD_ATLAS_ITEMS.find((item) => item.id === selectedItemId)
        : null;

      if (
        selectedItem &&
        getAtlasItemCategory(selectedItem) === filter &&
        activeFilters.includes(filter)
      ) {
        setSelectedItemId(null);
      }

      setActiveFilters((current) =>
        current.includes(filter)
          ? current.filter((entry) => entry !== filter)
          : [...current, filter],
      );
    },
    [activeFilters, selectedItemId],
  );

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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-3xl border border-app-border/60 bg-app-surface/70 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-app-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-app-secondary/20 blur-3xl" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-app-primary/70 to-transparent" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-app-primary/30 bg-app-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-app-primary">
                <Icon name="map" className="h-4 w-4" />
                Arquivo geográfico
              </span>

              <div className="max-w-4xl space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-app-fg md:text-6xl">
                  Atlas do <span className="text-gradient">Mundo</span>
                </h1>
                <p className="text-base font-medium leading-relaxed text-app-muted md:text-lg">
                  Consulte escolas, barreiras puras, organizações e regiões
                  ocultas do cenário em um globo tático construído com Three.js.
                </p>
              </div>
            </div>

            <Card variant="outline" className="bg-app-bg/35 !p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-app-muted">
                Primeira versão
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-3xl font-black text-app-fg">
                    {WORLD_ATLAS_ITEMS.length}
                  </p>
                  <p className="text-xs font-bold text-app-muted">
                    pontos catalogados
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-app-fg">
                    {activeFilters.length}
                  </p>
                  <p className="text-xs font-bold text-app-muted">
                    camadas ativas
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

        <section className="grid gap-8 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-4">
            <WorldGlobeCanvas
              items={WORLD_ATLAS_ITEMS}
              visibleItemIds={visibleItemIds}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={handleSelectItem}
              onClearSelection={handleClearSelection}
              onHoverItem={handleHoverItem}
            />
            <WorldAccessibleItemList
              items={visibleItems}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={handleSelectItem}
            />
          </div>
          <WorldLocationPanel item={selectedItem} hoveredItem={hoveredItem} />
        </section>
      </div>
    </main>
  );
}
