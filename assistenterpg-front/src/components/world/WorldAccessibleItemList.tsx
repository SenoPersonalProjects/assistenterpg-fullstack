'use client';

import { Icon } from '@/components/ui/Icon';
import type { WorldAtlasItem, WorldAtlasKind } from '@/lib/world';
import { WORLD_ATLAS_ITEM_BY_ID, getAtlasItemCategory } from '@/lib/world';

type WorldAccessibleItemListProps = {
  items: WorldAtlasItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
};

const CATEGORY_GROUPS: Array<{
  id: WorldAtlasKind;
  label: string;
  dotClassName: string;
}> = [
  {
    id: 'LOCAL',
    label: 'Locais',
    dotClassName: 'bg-app-primary',
  },
  {
    id: 'SUBLOCAL',
    label: 'Sublocais',
    dotClassName: 'bg-app-secondary',
  },
  {
    id: 'INSTITUICAO',
    label: 'Instituições',
    dotClassName: 'bg-app-orange',
  },
  {
    id: 'BARREIRA',
    label: 'Barreiras',
    dotClassName: 'bg-app-info',
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
}: WorldAccessibleItemListProps) {
  const groupedItems = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: items
      .filter((item) => getAtlasItemCategory(item) === group.id)
      .sort(sortItems),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="rounded-3xl border border-app-border/60 bg-app-surface/45 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-app-muted">
            Lista acessível
          </p>
          <h2 className="mt-1 text-lg font-black text-app-fg">
            Camadas visíveis
          </h2>
        </div>
        <Icon name="list" className="h-5 w-5 text-app-muted" />
      </div>

      {groupedItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {groupedItems.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-app-muted">
                  {group.label}
                </h3>
                <span className="rounded-full border border-app-border bg-app-bg/50 px-2 py-0.5 text-[10px] font-black text-app-muted">
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
                      className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                        selected
                          ? 'border-app-primary bg-app-primary/15 shadow-lg shadow-app-primary/10'
                          : 'border-app-border bg-app-card/50 hover:border-app-primary/40 hover:bg-app-surface'
                      }`}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${group.dotClassName}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-app-fg">
                          {item.nome}
                        </span>
                        {parentLabel ? (
                          <span className="mt-1 block text-xs font-bold text-app-muted">
                            Em {parentLabel}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-app-border bg-app-muted-surface/30 p-5 text-center text-sm text-app-muted">
          Nenhuma camada ativa neste nível de zoom. Reative filtros ou aproxime
          o globo para revelar sublocais.
        </div>
      )}
    </section>
  );
}
