// components/compendio/CompendioLayout.tsx
// ✅ SEM MUDANÇAS - Já estava perfeito!
import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import {
  CompendioBreadcrumb,
  type BreadcrumbItem,
} from '@/components/compendio/CompendioBreadcrumb';

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
  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <CompendioBreadcrumb items={breadcrumbs} />
        )}

        {/* Header com ícone + voltar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name={icon} className="w-6 h-6 text-app-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-app-fg">{title}</h1>
              {subtitle && (
                <p className="text-sm text-app-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm">
                <Icon name="back" className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          )}
        </header>

        {/* Stats opcionais */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="min-w-[120px] rounded-lg border border-app-border bg-app-surface px-4 py-2"
              >
                <p className="text-xs text-app-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-app-fg">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Conteúdo */}
        <div>{children}</div>
      </div>
    </main>
  );
}
