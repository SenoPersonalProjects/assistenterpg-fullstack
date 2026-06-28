'use client';

import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import type { WorldAtlasFilter } from '@/lib/world';

export type WorldFilterOption = {
  id: WorldAtlasFilter;
  label: string;
  description: string;
  icon: IconName;
  count: number;
};

type WorldFiltersProps = {
  options: WorldFilterOption[];
  activeFilters: WorldAtlasFilter[];
  onToggleFilter: (filter: WorldAtlasFilter) => void;
  onResetFilters: () => void;
};

const FILTER_STYLES: Record<
  WorldAtlasFilter,
  { active: string; icon: string }
> = {
  LOCAL: {
    active: 'border-app-primary bg-app-primary/15 text-app-primary',
    icon: 'bg-app-primary/10 text-app-primary border-app-primary/30',
  },
  SUBLOCAL: {
    active: 'border-app-info bg-app-info/15 text-app-info',
    icon: 'bg-app-info/10 text-app-info border-app-info/30',
  },
  INSTITUICAO: {
    active: 'border-app-secondary bg-app-secondary/15 text-app-secondary',
    icon: 'bg-app-secondary/10 text-app-secondary border-app-secondary/30',
  },
  BARREIRA: {
    active: 'border-app-danger bg-app-danger/15 text-app-danger',
    icon: 'bg-app-danger/10 text-app-danger border-app-danger/30',
  },
};

export function WorldFilters({
  options,
  activeFilters,
  onToggleFilter,
  onResetFilters,
}: WorldFiltersProps) {
  const allActive = activeFilters.length === options.length;

  return (
    <div className="rounded-2xl border border-app-border/60 bg-app-surface/45 p-3 md:p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-app-muted">
            Camadas cartográficas
          </p>
          <p className="text-sm text-app-muted">
            Sublocais respeitam o zoom, mesmo quando a camada está ativa.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          disabled={allActive}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-app-border px-3 py-2 text-xs font-bold text-app-muted transition-all duration-200 hover:border-app-primary/40 hover:text-app-fg disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="refresh" className="h-4 w-4" />
          Restaurar camadas
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const active = activeFilters.includes(option.id);
          const styles = FILTER_STYLES[option.id];

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleFilter(option.id)}
              className={`group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ${
                active
                  ? styles.active
                  : 'border-app-border bg-app-card/60 text-app-muted hover:border-app-primary/40 hover:text-app-fg'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
              >
                <Icon name={option.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-black text-app-fg">
                  {option.label}
                  <span className="rounded-full bg-app-bg/70 px-2 py-0.5 text-[10px] text-app-muted">
                    {option.count}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-app-muted">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
