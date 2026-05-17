'use client';

type LibraryStatsBarItem = {
  label: string;
  value: number | string;
  tone?: 'default' | 'warning' | 'success' | 'muted';
};

type LibraryStatsBarProps = {
  items: LibraryStatsBarItem[];
  trailingText?: string;
};

export function LibraryStatsBar({
  items,
  trailingText,
}: LibraryStatsBarProps) {
  const toneClasses: Record<string, string> = {
    default: 'text-app-primary bg-app-primary/10',
    warning: 'text-app-warning bg-app-warning/10',
    success: 'text-app-success bg-app-success/10',
    muted: 'text-app-muted bg-app-muted-surface',
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 bg-app-surface/50 backdrop-blur-sm border border-app-border/40 rounded-2xl">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center gap-3">
            <span className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-black ${toneClasses[item.tone ?? 'default']}`}>
              {item.value}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-app-muted">{item.label}</span>
          </div>
        ))}
      </div>
      {trailingText ? (
        <span className="text-[10px] font-black uppercase tracking-tighter text-app-muted/60">{trailingText}</span>
      ) : null}
    </div>
  );
}
