import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { CompendioLivro } from '@/lib/utils/compendio';
import {
  getCompendioArticleHref,
  getCompendioBookCounts,
  getFirstCompendioArticleHref,
} from '@/lib/utils/compendio-books';

type BookIndexProps = {
  livro: CompendioLivro;
};

export function BookIndex({ livro }: BookIndexProps) {
  const counts = getCompendioBookCounts(livro);
  const firstHref = getFirstCompendioArticleHref(livro);

  if (counts.artigos === 0) {
    return (
      <EmptyState
        variant="card"
        icon="book"
        title="Livro sem secoes"
        description="Este livro ainda nao possui conteudo publicado."
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-primary">Compendio de Regras</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-app-fg sm:text-4xl">
              {livro.titulo}
            </h1>
            {livro.descricao ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-app-muted">
                {livro.descricao}
              </p>
            ) : null}
          </div>

          {firstHref ? (
            <Link
              href={firstHref}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-app-primary bg-app-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-app-primary-hover"
            >
              Comecar leitura
              <Icon name="chevron-right" className="ml-2 h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge color="blue">{counts.categorias} capitulos</Badge>
          <Badge color="cyan">{counts.subcategorias} topicos</Badge>
          <Badge color="purple">{counts.artigos} secoes</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {livro.categorias.map((categoria, categoriaIndex) => (
          <article
            key={categoria.id}
            className="rounded-lg border border-app-border bg-app-surface p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-primary/10 text-sm font-semibold text-app-primary">
                {categoriaIndex + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-app-fg">{categoria.nome}</h2>
                {categoria.descricao ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-app-muted">
                    {categoria.descricao}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              {categoria.subcategorias.map((subcategoria) => (
                <div key={subcategoria.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                    {subcategoria.nome}
                  </p>
                  <div className="grid gap-1.5">
                    {subcategoria.artigos.map((artigo) => (
                      <Link
                        key={artigo.id}
                        href={getCompendioArticleHref(
                          livro.codigo,
                          categoria.codigo,
                          subcategoria.codigo,
                          artigo.codigo,
                        )}
                        className="group flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm text-app-muted transition-colors hover:bg-app-bg hover:text-app-fg"
                      >
                        <span className="line-clamp-1">{artigo.titulo}</span>
                        <Icon
                          name="chevron-right"
                          className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
