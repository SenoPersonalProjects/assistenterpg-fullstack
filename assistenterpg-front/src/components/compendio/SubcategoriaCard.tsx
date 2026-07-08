'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { CompendioSubcategoriaComArtigo } from '@/lib/utils/compendio';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';

interface SubcategoriaCardProps {
  subcategoria: CompendioSubcategoriaComArtigo;
  categoriaCodigo: string;
}

export function SubcategoriaCard({ subcategoria, categoriaCodigo }: SubcategoriaCardProps) {
  const totalArtigos = subcategoria.artigos?.length || 0;

  return (
    <Link
      href={`/compendio/${categoriaCodigo}/${subcategoria.codigo}`}
      className="group flex h-full min-w-0 flex-col justify-between rounded-xl border border-white/5 bg-app-surface/55 p-4 transition-colors hover:border-app-primary/35 hover:bg-app-muted-surface/65"
    >
      <span className="min-w-0 space-y-2">
        <span className="flex min-w-0 items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-app-fg">
              {stripCompendioDisplayNumber(subcategoria.nome)}
            </span>
            {subcategoria.descricao ? (
              <span className="mt-1 line-clamp-2 block text-sm font-medium leading-relaxed text-app-muted">
                {subcategoria.descricao}
              </span>
            ) : null}
          </span>
          {subcategoria.categoria?.cor ? (
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: subcategoria.categoria.cor }}
            />
          ) : null}
        </span>

        <span className="flex flex-wrap items-center gap-2">
          <Badge color="blue" size="sm">
            {totalArtigos} artigo{totalArtigos !== 1 ? 's' : ''}
          </Badge>
        </span>
      </span>

      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-app-primary">
        Abrir
        <Icon
          name="chevron-right"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
