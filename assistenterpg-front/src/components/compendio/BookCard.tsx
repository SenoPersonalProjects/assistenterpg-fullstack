'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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
      <Card className="flex h-full flex-col gap-4 rounded-lg border-app-border bg-app-surface p-5 transition-[border-color,transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-app-primary group-hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-primary/10 text-app-primary"
            style={livro.cor ? { color: livro.cor } : undefined}
          >
            <Icon name={toIconName(livro.icone)} className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-app-fg">{livro.titulo}</h2>
            {livro.descricao ? (
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-app-muted">
                {livro.descricao}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Badge color="blue" size="sm">
            {counts.categorias} capitulos
          </Badge>
          <Badge color="gray" size="sm">
            {counts.artigos} secoes
          </Badge>
          {livro.suplementoId ? (
            <Badge color="green" size="sm">
              Suplemento
            </Badge>
          ) : (
            <Badge color="purple" size="sm">
              Base
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
