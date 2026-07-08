'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
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
  WORLD_ATLAS_ITEM_BY_ID,
  getAtlasDisplayState,
  getAtlasItemCategory,
} from '@/lib/world';

const FILTER_OPTIONS_BASE: Array<Omit<WorldFilterOption, 'count'>> = [
  {
    id: 'LUGARES',
    label: 'Lugares',
    description: 'Regiões e zonas do cenário.',
    icon: 'map',
  },
  {
    id: 'SETORES',
    label: 'Setores',
    description: 'Distritos revelados no zoom de detalhe.',
    icon: 'layers',
  },
  {
    id: 'INSTITUICOES',
    label: 'Instituições',
    description: 'Escolas, clãs e instalações operacionais.',
    icon: 'school',
  },
  {
    id: 'BARREIRAS',
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

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function itemMatchesSearch(item: WorldAtlasItem, term: string) {
  const searchableText = [
    item.nome,
    item.resumo,
    item.descricaoCurta,
    item.subtipo,
    item.status,
    item.kind,
    ...item.tags,
  ]
    .filter(Boolean)
    .join(' ');

  return normalizeSearch(searchableText).includes(term);
}

function collectItemWithAncestors(item: WorldAtlasItem, ids: Set<string>) {
  ids.add(item.id);

  let parentId = item.parentId;
  while (parentId) {
    ids.add(parentId);
    parentId = WORLD_ATLAS_ITEM_BY_ID.get(parentId)?.parentId;
  }
}

function filterAtlasItemsBySearch(items: WorldAtlasItem[], query: string) {
  const term = normalizeSearch(query);
  if (!term) return items;

  const ids = new Set<string>();
  for (const item of items) {
    if (itemMatchesSearch(item, term)) {
      collectItemWithAncestors(item, ids);
    }
  }

  return items.filter((item) => ids.has(item.id));
}

export function WorldAtlasShell() {
  const [activeFilters, setActiveFilters] =
    useState<WorldAtlasFilter[]>(DEFAULT_FILTERS);
  const [detailLevel, setDetailLevel] = useState<WorldDetailLevel>('REGIONAL');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const atlasItemsForSearch = useMemo(
    () => filterAtlasItemsBySearch(WORLD_ATLAS_ITEMS, searchQuery),
    [searchQuery],
  );

  const filterOptions = useMemo<WorldFilterOption[]>(
    () =>
      FILTER_OPTIONS_BASE.map((option) => ({
        ...option,
        count: countItemsByFilter(atlasItemsForSearch, option.id),
      })),
    [atlasItemsForSearch],
  );

  const displayState = useMemo(
    () => getAtlasDisplayState(atlasItemsForSearch, activeFilters, detailLevel),
    [activeFilters, atlasItemsForSearch, detailLevel],
  );

  const visibleItems = displayState.visibleItems;
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasNonDefaultFilters = activeFilters.length !== DEFAULT_FILTERS.length;

  const selectedItem = useMemo(
    () =>
      selectedItemId && displayState.filterEnabledItemIds.has(selectedItemId)
        ? WORLD_ATLAS_ITEM_BY_ID.get(selectedItemId) ?? null
        : null,
    [displayState.filterEnabledItemIds, selectedItemId],
  );

  const hoveredItem = useMemo(
    () =>
      hoveredItemId
        ? visibleItems.find((item) => item.id === hoveredItemId) ?? null
        : null,
    [hoveredItemId, visibleItems],
  );

  const statsItems: StatsStripItem[] = useMemo(
    () => [
      {
        id: 'entries',
        label: 'Entradas',
        value: WORLD_ATLAS_ITEMS.length,
        icon: 'map',
        tone: 'primary',
        helper: `${visibleItems.length} visíveis`,
      },
      {
        id: 'places',
        label: 'Lugares/setores',
        value: WORLD_ATLAS_ITEMS.filter((item) => item.kind === 'LUGAR').length,
        icon: 'layers',
      },
      {
        id: 'institutions',
        label: 'Instituições',
        value: WORLD_ATLAS_ITEMS.filter((item) => item.kind === 'INSTITUICAO').length,
        icon: 'school',
        tone: 'success',
      },
      {
        id: 'barriers',
        label: 'Barreiras',
        value: WORLD_ATLAS_ITEMS.filter((item) => item.kind === 'BARREIRA').length,
        icon: 'domain',
        tone: 'warning',
      },
    ],
    [visibleItems.length],
  );

  useEffect(() => {
    const shouldClearSelected =
      selectedItemId !== null &&
      !displayState.filterEnabledItemIds.has(selectedItemId);
    const shouldClearHovered =
      hoveredItemId !== null &&
      !displayState.markerStateById.get(hoveredItemId)?.visible;

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
  }, [
    displayState.filterEnabledItemIds,
    displayState.markerStateById,
    hoveredItemId,
    selectedItemId,
  ]);

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

  const handleResetAtlas = useCallback(() => {
    setActiveFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setSelectedItemId(null);
    setHoveredItemId(null);
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
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Atlas"
          icon="map"
          title="Mundo"
          description="Explore locais, instituições, barreiras e camadas de lore em um atlas tático do cenário."
          actions={
            <EntityActionsMenu
              ariaLabel="Ações do atlas"
              items={[
                {
                  id: 'reset',
                  label: 'Restaurar atlas',
                  icon: 'refresh',
                  disabled: !hasActiveSearch && !hasNonDefaultFilters && !selectedItemId,
                  onSelect: handleResetAtlas,
                },
              ]}
            />
          }
        />

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-[14rem] flex-[0.8]">
            <Input
              label="Busca local"
              placeholder="Nome, descrição, status ou tag"
              icon="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              rightIcon={hasActiveSearch ? 'close' : undefined}
              rightIconLabel="Limpar busca"
              onRightIconClick={() => setSearchQuery('')}
            />
          </div>

          <WorldFilters
            options={filterOptions}
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            onResetFilters={handleResetFilters}
          />

          {(hasActiveSearch || hasNonDefaultFilters) ? (
            <Button size="sm" variant="ghost" onClick={handleResetAtlas}>
              Limpar filtros
            </Button>
          ) : null}
        </PageToolbar>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)]">
          <div className="space-y-4">
            <WorldGlobeCanvas
              items={atlasItemsForSearch}
              markerStates={displayState.markerStates}
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
              onClearFilters={handleResetAtlas}
            />
          </div>
          <WorldLocationPanel
            item={selectedItem}
            hoveredItem={hoveredItem}
            items={atlasItemsForSearch}
            onSelectItem={handleSelectItem}
          />
        </section>
      </div>
    </main>
  );
}
