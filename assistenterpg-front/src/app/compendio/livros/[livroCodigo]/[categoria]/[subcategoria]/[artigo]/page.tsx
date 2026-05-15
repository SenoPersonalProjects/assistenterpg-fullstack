import Link from 'next/link';
import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { ReaderNavigationFooter } from '@/components/compendio/ReaderNavigationFooter';
import { ReaderShell } from '@/components/compendio/ReaderShell';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import {
  apiBuscarArtigoDoLivroPorCodigo,
  apiBuscarLivroPorCodigo,
} from '@/lib/utils/compendio';
import { getCompendioBookHref } from '@/lib/utils/compendio-books';

type Props = {
  params: Promise<{
    livroCodigo: string;
    categoria: string;
    subcategoria: string;
    artigo: string;
  }>;
};

export default async function CompendioLivroArtigoPage({ params }: Props) {
  const {
    livroCodigo,
    categoria: categoriaCodigo,
    subcategoria: subcategoriaCodigo,
    artigo: artigoCodigo,
  } = await params;

  const [livro, artigo] = await Promise.all([
    apiBuscarLivroPorCodigo(livroCodigo),
    apiBuscarArtigoDoLivroPorCodigo(
      livroCodigo,
      categoriaCodigo,
      subcategoriaCodigo,
      artigoCodigo,
    ),
  ]);

  if (!livro || !artigo) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-4xl">
          <EmptyState
            variant="card"
            icon="document"
            title="Secao nao encontrada"
            description="A secao solicitada nao existe ou nao esta publicada."
          >
            <Link
              href={livro ? getCompendioBookHref(livro.codigo) : '/compendio'}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-app-border px-3 py-2 text-sm text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  const categoriaNome = artigo.subcategoria?.categoria?.nome || 'Categoria';
  const subcategoriaNome = artigo.subcategoria?.nome || 'Topico';

  return (
    <ReaderShell
      livro={livro}
      activeCategoriaCodigo={categoriaCodigo}
      activeSubcategoriaCodigo={subcategoriaCodigo}
      activeArtigoCodigo={artigoCodigo}
    >
      <article className="mx-auto max-w-3xl">
        <Link
          href={getCompendioBookHref(livro.codigo)}
          className="mb-7 inline-flex items-center gap-2 text-sm text-app-muted transition-colors hover:text-app-primary"
        >
          <Icon name="home" className="h-4 w-4" />
          Voltar ao indice
        </Link>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-app-muted">
            <Icon name="book" className="h-4 w-4" />
            <span>{livro.titulo}</span>
            <span>/</span>
            <span>{categoriaNome}</span>
            <span>/</span>
            <span>{subcategoriaNome}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-app-fg sm:text-4xl">
            {artigo.titulo}
          </h1>

          <div className="mt-5 h-1 w-24 rounded-full bg-app-primary" />

          {artigo.resumo ? (
            <p className="mt-7 text-lg leading-8 text-app-fg">{artigo.resumo}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {artigo.nivelDificuldade ? (
              <Badge color="blue" size="sm">
                {artigo.nivelDificuldade}
              </Badge>
            ) : null}

            {Array.isArray(artigo.tags)
              ? artigo.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} color="gray" size="sm">
                    {tag}
                  </Badge>
                ))
              : null}
          </div>
        </header>

        <section className="rounded-lg border border-app-border bg-app-surface p-5 sm:p-7">
          <ArtigoContent conteudo={artigo.conteudo} />
        </section>

        <ReaderNavigationFooter
          livro={livro}
          categoriaCodigo={categoriaCodigo}
          subcategoriaCodigo={subcategoriaCodigo}
          artigoCodigo={artigoCodigo}
        />
      </article>
    </ReaderShell>
  );
}
