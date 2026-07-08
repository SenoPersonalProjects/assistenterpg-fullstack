'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { CompendioArtigoCompleto, CompendioArtigoResumido } from '@/lib/utils/compendio';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';

type Artigo = CompendioArtigoResumido &
  Partial<Pick<CompendioArtigoCompleto, 'tags' | 'nivelDificuldade' | 'subcategoria'>>;

interface ArtigoCardProps {
  artigo: Artigo;
  categoriaCodigo: string;
  subcategoriaCodigo: string;
  livroCodigo?: string;
}

const nivelCores = {
  iniciante: 'green',
  intermediario: 'yellow',
  avancado: 'red',
} as const;

export function ArtigoCard({
  artigo,
  categoriaCodigo,
  subcategoriaCodigo,
  livroCodigo,
}: ArtigoCardProps) {
  const href = livroCodigo
    ? `/compendio/livros/${livroCodigo}/${categoriaCodigo}/${subcategoriaCodigo}/${artigo.codigo}`
    : `/compendio/${categoriaCodigo}/${subcategoriaCodigo}/${artigo.codigo}`;
  const categoriaNome = artigo.subcategoria?.categoria?.nome;
  const livroTitulo = artigo.subcategoria?.categoria?.livro?.titulo;
  const tags = Array.isArray(artigo.tags) ? artigo.tags.slice(0, 3) : [];

  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border border-white/5 bg-app-surface/55 p-4 shadow-sm shadow-black/5 transition-colors group-hover:border-app-primary/30">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-app-muted">
              {categoriaNome ?? 'Artigo'}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-app-fg">
              {stripCompendioDisplayNumber(artigo.titulo)}
            </h3>
          </div>
          {artigo.destaque ? (
            <Badge color="purple" size="xs" variant="subtle" className="shrink-0">
              Destaque
            </Badge>
          ) : null}
        </div>

        {artigo.resumo ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-app-muted">
            {artigo.resumo}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {livroTitulo ? (
            <Badge color="blue" size="xs" variant="subtle">
              {livroTitulo}
            </Badge>
          ) : null}
          {artigo.nivelDificuldade ? (
            <Badge
              color={nivelCores[artigo.nivelDificuldade as keyof typeof nivelCores] || 'gray'}
              size="xs"
              variant="subtle"
            >
              {artigo.nivelDificuldade}
            </Badge>
          ) : null}
          {tags.map((tag) => (
            <Badge key={tag} color="gray" size="xs" variant="subtle">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="truncate text-xs font-bold text-app-muted">
            {subcategoriaCodigo}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-app-primary">
            Ver conteúdo
            <Icon name="forward" className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
