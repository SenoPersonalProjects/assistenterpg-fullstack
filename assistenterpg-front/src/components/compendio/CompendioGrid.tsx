// components/compendio/CompendioGrid.tsx
import { ReactNode } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';

// components/compendio/CompendioGrid.tsx (versão expandida)
type CompendioGridProps = {
  title?: string;
  description?: string; // ✅ opcional
  children: ReactNode;
  columns?: 2 | 3;
};

export function CompendioGrid({
  title,
  description,
  children,
  columns = 3
}: CompendioGridProps) {
  const gridClass = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section>
      {title && (
        <div className="mb-4">
          <SectionTitle>{title}</SectionTitle>
          {description && (
            <p className="text-sm text-app-muted mt-1">{description}</p>
          )}
        </div>
      )}
      <div className={`grid gap-4 ${gridClass} ${title ? 'mt-4' : ''}`}>
        {children}
      </div>
    </section>
  );
}
