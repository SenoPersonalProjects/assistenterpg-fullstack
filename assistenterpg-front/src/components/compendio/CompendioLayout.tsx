import type { ReactNode } from 'react';
import { CompendioBreadcrumb, type BreadcrumbItem } from '@/components/compendio/CompendioBreadcrumb';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import type { IconName } from '@/components/ui/Icon';

type CompendioLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  icon?: IconName;
  stats?: Array<{ label: string; value: number }>;
};

export function CompendioLayout({
  children,
  title,
  subtitle,
  backHref = '/compendio',
  backLabel = 'Voltar',
  breadcrumbs,
  icon,
  stats,
}: CompendioLayoutProps) {
  const statItems: StatsStripItem[] =
    stats?.map((stat, index) => ({
      id: `${stat.label}-${index}`,
      label: stat.label,
      value: stat.value,
      icon: index === 0 ? 'folder' : 'document',
    })) ?? [];

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          icon={icon}
          title={title}
          description={subtitle}
          backHref={backHref}
          backLabel={backLabel}
          breadcrumb={
            breadcrumbs && breadcrumbs.length > 0 ? (
              <CompendioBreadcrumb items={breadcrumbs} />
            ) : undefined
          }
        />

        <StatsStrip items={statItems} />

        <div>{children}</div>
      </div>
    </main>
  );
}
