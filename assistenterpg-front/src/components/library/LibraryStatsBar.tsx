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
  return (
    <div className="library-stats-bar">
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="library-stat">
            <span className={`library-stat__value library-stat__value--${item.tone ?? 'default'}`}>
              {item.value}
            </span>
            <span className="library-stat__label">{item.label}</span>
          </div>
        ))}
      </div>
      {trailingText ? (
        <span className="text-xs text-app-muted/70">{trailingText}</span>
      ) : null}
    </div>
  );
}
