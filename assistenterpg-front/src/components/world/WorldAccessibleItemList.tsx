'use client';

import { Icon } from '@/components/ui/Icon';
import type { WorldAtlasCategory, WorldAtlasItem } from '@/lib/world';
import { getAtlasItemCategory } from '@/lib/world';

type WorldAccessibleItemListProps = {
  items: WorldAtlasItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
};

const CATEGORY_LABELS: Record<WorldAtlasCategory, string> = {
  ESCOLA: 'Escola',
  BARREIRA: 'Barreira',
  ORGANIZACAO: 'Organização',
  REGIAO_OCULTA: 'Região oculta',
};

const CATEGORY_DOT_STYLES: Record<WorldAtlasCategory, string> = {
  ESCOLA: 'bg-app-primary',
  BARREIRA: 'bg-app-secondary',
  ORGANIZACAO: 'bg-app-orange',
  REGIAO_OCULTA: 'bg-app-danger',
};

export function WorldAccessibleItemList({
  items,
  selectedItemId,
  onSelectItem,
}: WorldAccessibleItemListProps) {
  return (
    <section className="rounded-3xl border border-app-border/60 bg-app-surface/45 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-app-muted">
            Lista acessível
          </p>
          <h2 className="mt-1 text-lg font-black text-app-fg">
            Pontos visíveis
          </h2>
        </div>
        <Icon name="list" className="h-5 w-5 text-app-muted" />
      </div>

      {items.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const category = getAtlasItemCategory(item);
            const selected = item.id === selectedItemId;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectItem(item.id)}
                className={`group flex items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                  selected
                    ? 'border-app-primary bg-app-primary/15 shadow-lg shadow-app-primary/10'
                    : 'border-app-border bg-app-card/50 hover:border-app-primary/40 hover:bg-app-surface'
                }`}
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORY_DOT_STYLES[category]}`}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-app-fg">
                    {item.nome}
                  </span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-app-muted">
                    {CATEGORY_LABELS[category]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-app-border bg-app-muted-surface/30 p-5 text-center text-sm text-app-muted">
          Nenhuma camada ativa. Reative um filtro para consultar o atlas.
        </div>
      )}
    </section>
  );
}
