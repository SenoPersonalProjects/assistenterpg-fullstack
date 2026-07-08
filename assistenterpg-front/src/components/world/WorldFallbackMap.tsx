'use client';

import { Icon } from '@/components/ui/Icon';
import type { WorldAtlasFilter, WorldAtlasItem } from '@/lib/world';
import { getAtlasItemCategory } from '@/lib/world';

type WorldFallbackMapProps = {
  items: WorldAtlasItem[];
  selectedItemId: string | null;
  reason?: string;
  onSelectItem: (itemId: string) => void;
};

const CATEGORY_STYLES: Record<WorldAtlasFilter, string> = {
  LUGARES: 'border-app-primary/40 bg-app-primary/10 text-app-primary',
  SETORES: 'border-app-secondary/40 bg-app-secondary/10 text-app-secondary',
  INSTITUICOES: 'border-app-orange/40 bg-app-orange/10 text-app-orange',
  BARREIRAS: 'border-app-info/40 bg-app-info/10 text-app-info',
};

const CATEGORY_LABELS: Record<WorldAtlasFilter, string> = {
  LUGARES: 'Lugar',
  SETORES: 'Setor',
  INSTITUICOES: 'Instituição',
  BARREIRAS: 'Barreira',
};

export function WorldFallbackMap({
  items,
  selectedItemId,
  reason,
  onSelectItem,
}: WorldFallbackMapProps) {
  return (
    <div className="flex min-h-[32rem] flex-col justify-between rounded-xl border border-white/5 bg-app-bg/70 p-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-app-warning/30 bg-app-warning/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-app-warning">
          <Icon name="warning" className="h-4 w-4" />
          Mapa estático
        </div>
        <h3 className="text-2xl font-black text-app-fg">
          Visualização 3D indisponível
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-app-muted">
          {reason ||
            'O navegador não disponibilizou WebGL. O atlas continua acessível em modo de dossiê.'}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const category = getAtlasItemCategory(item);
          const selected = item.id === selectedItemId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={[
                'rounded-lg border p-4 text-left transition-colors',
                selected
                  ? 'border-app-primary/45 bg-app-primary/15'
                  : 'border-white/5 bg-app-surface/60 hover:border-app-primary/35',
              ].join(' ')}
            >
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${CATEGORY_STYLES[category]}`}
              >
                {CATEGORY_LABELS[category]}
              </span>
              <h4 className="mt-3 font-black text-app-fg">{item.nome}</h4>
              <p className="mt-1 line-clamp-2 text-sm text-app-muted">
                {item.resumo}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
