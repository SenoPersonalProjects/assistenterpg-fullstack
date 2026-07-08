import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';

type CompendioGridProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  columns?: 2 | 3;
};

export function CompendioGrid({
  title,
  description,
  children,
  columns = 3,
}: CompendioGridProps) {
  const gridClass = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="space-y-3">
      {title ? (
        <SectionHeader icon="document" title={title} description={description} />
      ) : null}
      <div className={`grid gap-3 ${gridClass}`}>{children}</div>
    </section>
  );
}
