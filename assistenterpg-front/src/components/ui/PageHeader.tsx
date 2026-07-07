import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: IconName;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  breadcrumb,
  backHref,
  backLabel = 'Voltar',
  className = '',
}: PageHeaderProps) {
  return (
    <header className={['space-y-4 border-b border-white/5 pb-5', className].join(' ')}>
      {(breadcrumb || backHref) && (
        <div className="flex min-w-0 items-center gap-3 text-xs font-bold text-app-muted">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-app-muted-surface hover:text-app-fg"
            >
              <Icon name="back" className="h-3.5 w-3.5" />
              <span>{backLabel}</span>
            </Link>
          )}
          {breadcrumb ? <div className="min-w-0 truncate">{breadcrumb}</div> : null}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-primary/20 bg-app-primary/10 text-app-primary">
              <Icon name={icon} className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-app-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-black tracking-tight text-app-fg md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-app-muted">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
