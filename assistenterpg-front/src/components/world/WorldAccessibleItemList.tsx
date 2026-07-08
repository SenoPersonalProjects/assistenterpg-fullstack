'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { WorldAtlasItem } from '@/lib/world';
import { WORLD_ATLAS_ITEM_BY_ID } from '@/lib/world';

type WorldAccessibleItemListProps = {
  items: WorldAtlasItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onClearFilters?: () => void;
};

const CATEGORY_GROUPS: Array<{
  id: string;
  label: string;
  dotClassName: string;
  matches: (item: WorldAtlasItem) => boolean;
}> = [
  {
    id: 'REGIAO',
    label: 'Regiões',
    dotClassName: 'bg-app-primary',
    matches: (item) => item.kind === 'LUGAR' && item.escala === 'REGIAO',
  },
  {
    id: 'ZONA',
    label: 'Zonas',
    dotClassName: 'bg-app-secondary',
    matches: (item) => item.kind === 'LUGAR' && item.escala === 'ZONA',
  },
  {
    id: 'SETOR',
    label: 'Setores',
    dotClassName: 'bg-app-info',
    matches: (item) => item.kind === 'LUGAR' && item.escala === 'SETOR',
  },
  {
    id: 'INSTITUICAO',
    label: 'Instituições',
    dotClassName: 'bg-app-orange',
    matches: (item) => item.kind === 'INSTITUICAO',
  },
  {
    id: 'BARREIRA',
    label: 'Barreiras',
    dotClassName: 'bg-app-danger',
    matches: (item) => item.kind === 'BARREIRA',
  },
];

function sortItems(a: WorldAtlasItem, b: WorldAtlasItem) {
  return (
    (a.displayPriority ?? 999) - (b.displayPriority ?? 999) ||
    a.nome.localeCompare(b.nome)
  );
}

function getParentLabel(item: WorldAtlasItem): string | null {
  if (!item.parentId) return null;

  return WORLD_ATLAS_ITEM_BY_ID.get(item.parentId)?.nome ?? null;
}

export function WorldAccessibleItemList({
  items,
  selectedItemId,
  onSelectItem,
  onClearFilters,
}: WorldAccessibleItemListProps) {
  const groupedItems = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: items
      .filter((item) => group.matches(item))
      .sort(sortItems),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="space-y-4 rounded-xl border border-white/5 bg-app-surface/45 p-4">
      <SectionHeader
        icon="list"
        title="Camadas visíveis"
        count={items.length}
        description="Lista acessível dos pontos renderizados pelo atlas."
      />

      {groupedItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {groupedItems.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
                  {group.label}
                </h3>
                <span className="rounded-full border border-white/10 bg-app-muted-surface px-2 py-0.5 text-[10px] font-black text-app-muted">
                  {group.items.length}
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => {
                  const selected = item.id === selectedItemId;
                  const parentLabel = getParentLabel(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelectItem(item.id)}
                      className={[
                        'flex w-full min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                        selected
                          ? 'border-app-primary/45 bg-app-primary/15'
                          : 'border-white/5 bg-app-surface/45 hover:border-app-primary/25 hover:bg-app-muted-surface/70',
                      ].join(' ')}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${group.dotClassName}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-app-fg">
                          {item.nome}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-app-muted">
                          {parentLabel ? `Em ${parentLabel}` : item.resumo}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-app-primary">
                        Ver
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="card"
          size="sm"
          icon="search"
          title="Nenhuma camada visível"
          description="Ajuste a busca, reative filtros ou aproxime o globo para revelar sublocais."
          action={
            onClearFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-white/10 bg-app-surface px-3 py-2 text-xs font-black text-app-fg transition-colors hover:border-app-primary/35"
              >
                Limpar filtros
              </button>
            ) : null
          }
        />
      )}
    </section>
  );
}
