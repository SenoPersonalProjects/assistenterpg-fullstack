'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { CompendioLivro } from '@/lib/utils/compendio';
import {
  getCompendioBookCounts,
  getCompendioBookHref,
} from '@/lib/utils/compendio-books';

type BookCardProps = {
  livro: CompendioLivro;
};

function toIconName(icon: string | null): IconName {
  if (icon === 'book' || icon === 'rules' || icon === 'sparkles') return icon;
  return 'book';
}

export function BookCard({ livro }: BookCardProps) {
  const counts = getCompendioBookCounts(livro);

  return (
    <Link href={getCompendioBookHref(livro.codigo)} className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5 transition-colors group-hover:border-app-primary/30">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-app-primary/10 text-app-primary"
            style={livro.cor ? { color: livro.cor } : undefined}
          >
            <Icon name={toIconName(livro.icone)} className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-black text-app-fg">
                {livro.titulo}
              </h2>
              <Badge color={livro.status === 'PUBLICADO' ? 'green' : 'gray'} size="xs" variant="subtle">
                {livro.status.toLowerCase()}
              </Badge>
            </div>
            {livro.descricao ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-app-muted">
                {livro.descricao}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge color="blue" size="xs" variant="subtle">
            {counts.categorias} capítulos
          </Badge>
          <Badge color="gray" size="xs" variant="subtle">
            {counts.artigos} seções
          </Badge>
          {livro.suplementoId ? (
            <Badge color="green" size="xs" variant="subtle">
              Suplemento
            </Badge>
          ) : (
            <Badge color="purple" size="xs" variant="subtle">
              Base
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="truncate text-xs font-bold text-app-muted">
            {livro.codigo}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-app-primary">
            Abrir
            <Icon name="forward" className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
