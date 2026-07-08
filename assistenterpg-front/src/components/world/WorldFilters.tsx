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
  { active: string; inactive: string; icon: string }
> = {
  LUGARES: {
    active: 'border-app-primary/45 bg-app-primary/15 text-app-primary',
    inactive: 'border-white/10 text-app-muted hover:border-app-primary/35 hover:text-app-fg',
    icon: 'text-app-primary',
  },
  SETORES: {
    active: 'border-app-info/45 bg-app-info/15 text-app-info',
    inactive: 'border-white/10 text-app-muted hover:border-app-info/35 hover:text-app-fg',
    icon: 'text-app-info',
  },
  INSTITUICOES: {
    active: 'border-app-secondary/45 bg-app-secondary/15 text-app-secondary',
    inactive: 'border-white/10 text-app-muted hover:border-app-secondary/35 hover:text-app-fg',
    icon: 'text-app-secondary',
  },
  BARREIRAS: {
    active: 'border-app-danger/45 bg-app-danger/15 text-app-danger',
    inactive: 'border-white/10 text-app-muted hover:border-app-danger/35 hover:text-app-fg',
    icon: 'text-app-danger',
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
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
            Camadas
          </p>
          <p className="truncate text-xs font-medium text-app-muted">
            Setores aparecem no detalhe do globo.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          disabled={allActive}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-app-muted transition-colors hover:bg-app-muted-surface hover:text-app-fg disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Icon name="refresh" className="h-3.5 w-3.5" />
          Restaurar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = activeFilters.includes(option.id);
          const styles = FILTER_STYLES[option.id];

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              title={option.description}
              onClick={() => onToggleFilter(option.id)}
              className={[
                'inline-flex h-10 min-w-0 items-center gap-2 rounded-lg border px-3 text-left text-xs font-black transition-colors',
                active ? styles.active : styles.inactive,
              ].join(' ')}
            >
              <Icon name={option.icon} className={['h-4 w-4 shrink-0', styles.icon].join(' ')} />
              <span className="max-w-[8rem] truncate">{option.label}</span>
              <span className="rounded-full bg-app-bg/65 px-1.5 py-0.5 text-[10px] text-app-muted">
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
