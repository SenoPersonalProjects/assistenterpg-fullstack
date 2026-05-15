import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { CompendioLivro } from '@/lib/utils/compendio';
import { getAdjacentCompendioEntries } from '@/lib/utils/compendio-books';

type ReaderNavigationFooterProps = {
  livro: CompendioLivro;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
  artigoCodigo: string;
};

export function ReaderNavigationFooter({
  livro,
  categoriaCodigo,
  subcategoriaCodigo,
  artigoCodigo,
}: ReaderNavigationFooterProps) {
  const { prev, next } = getAdjacentCompendioEntries(
    livro,
    categoriaCodigo,
    subcategoriaCodigo,
    artigoCodigo,
  );

  return (
    <nav className="mt-12 border-t border-app-border pt-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-3 rounded-lg border border-app-border bg-app-surface p-4 transition-colors hover:border-app-primary"
          >
            <Icon
              name="chevron-left"
              className="h-5 w-5 shrink-0 text-app-muted transition-colors group-hover:text-app-primary"
            />
            <span className="min-w-0">
              <span className="block text-xs text-app-muted">Anterior</span>
              <span className="block truncate text-sm font-medium text-app-fg">
                {prev.artigo.titulo}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex items-center justify-end gap-3 rounded-lg border border-app-border bg-app-surface p-4 text-right transition-colors hover:border-app-primary"
          >
            <span className="min-w-0">
              <span className="block text-xs text-app-muted">Proximo</span>
              <span className="block truncate text-sm font-medium text-app-fg">
                {next.artigo.titulo}
              </span>
            </span>
            <Icon
              name="chevron-right"
              className="h-5 w-5 shrink-0 text-app-muted transition-colors group-hover:text-app-primary"
            />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
