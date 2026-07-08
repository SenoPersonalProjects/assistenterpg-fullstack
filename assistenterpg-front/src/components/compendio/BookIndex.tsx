import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import type { CompendioLivro } from '@/lib/utils/compendio';
import {
  getCompendioArticleHref,
  getCompendioBookCounts,
  getFirstCompendioArticleHref,
} from '@/lib/utils/compendio-books';
import {
  shouldCollapseSubcategoria,
  stripCompendioDisplayNumber,
} from '@/lib/utils/compendio-display';

type BookIndexProps = {
  livro: CompendioLivro;
};

export function BookIndex({ livro }: BookIndexProps) {
  const counts = getCompendioBookCounts(livro);
  const firstHref = getFirstCompendioArticleHref(livro);
  const statsItems: StatsStripItem[] = [
    {
      id: 'categorias',
      label: 'Capítulos',
      value: counts.categorias,
      icon: 'book',
    },
    {
      id: 'subcategorias',
      label: 'Tópicos',
      value: counts.subcategorias,
      icon: 'folder',
    },
    {
      id: 'artigos',
      label: 'Seções',
      value: counts.artigos,
      icon: 'document',
      tone: 'primary',
    },
  ];

  if (counts.artigos === 0) {
    return (
      <EmptyState
        variant="card"
        icon="book"
        title="Livro sem seções"
        description="Este livro ainda não possui conteúdo publicado."
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        icon="book"
        eyebrow="Compêndio de Regras"
        title={livro.titulo}
        description={livro.descricao || undefined}
        backHref="/compendio"
        backLabel="Compêndio"
        actions={
          firstHref ? (
            <Link href={firstHref}>
              <Button className="w-full sm:w-auto">
                Começar leitura
                <Icon name="chevron-right" className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : null
        }
      />

      <StatsStrip items={statsItems} />

      <section className="space-y-3">
        <SectionHeader
          icon="rules"
          title="Índice"
          description="Capítulos, tópicos e seções publicadas neste livro."
          count={counts.categorias}
        />

        <div className="grid gap-3 md:grid-cols-2">
          {livro.categorias.map((categoria) => (
            <article
              key={categoria.id}
              className="rounded-xl border border-white/5 bg-app-surface/55 p-4"
            >
              <div className="mb-3 flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
                  <Icon name="book" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-app-fg">
                    {stripCompendioDisplayNumber(categoria.nome)}
                  </h2>
                  {categoria.descricao ? (
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-relaxed text-app-muted">
                      {categoria.descricao}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                {categoria.subcategorias.map((subcategoria) => {
                  const collapsed = shouldCollapseSubcategoria(subcategoria);

                  if (collapsed) {
                    const artigo = subcategoria.artigos[0];

                    return (
                      <Link
                        key={subcategoria.id}
                        href={getCompendioArticleHref(
                          livro.codigo,
                          categoria.codigo,
                          subcategoria.codigo,
                          artigo.codigo,
                        )}
                        className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-bg hover:text-app-fg"
                      >
                        <span className="truncate">
                          {stripCompendioDisplayNumber(artigo.titulo)}
                        </span>
                        <Icon
                          name="chevron-right"
                          className="h-4 w-4 shrink-0 text-app-primary opacity-70 transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    );
                  }

                  return (
                    <div key={subcategoria.id} className="space-y-1.5">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                        {stripCompendioDisplayNumber(subcategoria.nome)}
                      </p>
                      <div className="grid gap-1">
                        {subcategoria.artigos.map((artigo) => (
                          <Link
                            key={artigo.id}
                            href={getCompendioArticleHref(
                              livro.codigo,
                              categoria.codigo,
                              subcategoria.codigo,
                              artigo.codigo,
                            )}
                            className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-bg hover:text-app-fg"
                          >
                            <span className="truncate">
                              {stripCompendioDisplayNumber(artigo.titulo)}
                            </span>
                            <Icon
                              name="chevron-right"
                              className="h-4 w-4 shrink-0 text-app-primary opacity-70 transition-transform group-hover:translate-x-0.5"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
