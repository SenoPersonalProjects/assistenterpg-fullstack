import Link from 'next/link';
import type { Metadata } from 'next';
import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { CompendioArticleAdminActions } from '@/components/compendio/CompendioArticleAdminActions';
import { ReaderNavigationFooter } from '@/components/compendio/ReaderNavigationFooter';
import { ReaderShell } from '@/components/compendio/ReaderShell';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  apiBuscarArtigoDoLivroPorCodigo,
  apiBuscarLivroPorCodigo,
} from '@/lib/utils/compendio';
import { getCompendioBookHref } from '@/lib/utils/compendio-books';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';
import { metadataPublica, serializarJsonLd, urlPublica } from '@/lib/seo/site';

type Props = {
  params: Promise<{
    livroCodigo: string;
    categoria: string;
    subcategoria: string;
    artigo: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { livroCodigo, categoria, subcategoria, artigo: artigoCodigo } = await params;
  const artigo = await apiBuscarArtigoDoLivroPorCodigo(
    livroCodigo,
    categoria,
    subcategoria,
    artigoCodigo,
  );

  if (!artigo || !artigo.ativo) {
    return { title: 'Seção não encontrada', robots: { index: false, follow: false } };
  }

  return metadataPublica({
    title: stripCompendioDisplayNumber(artigo.titulo),
    description: artigo.resumo || `Regra de Maledicência RPG: ${stripCompendioDisplayNumber(artigo.titulo)}.`,
    path: `/compendio/livros/${livroCodigo}/${categoria}/${subcategoria}/${artigoCodigo}`,
    type: 'article',
  });
}

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
      <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EmptyState
            variant="card"
            icon="document"
            title="Seção não encontrada"
            description="A seção solicitada não existe ou não está publicada."
          >
            <Link
              href={livro ? getCompendioBookHref(livro.codigo) : '/compendio'}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-app-border px-3 py-2 text-sm font-bold text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  const categoriaNome = stripCompendioDisplayNumber(
    artigo.subcategoria?.categoria?.nome || 'Categoria',
  );
  const subcategoriaNome = stripCompendioDisplayNumber(
    artigo.subcategoria?.nome || 'Tópico',
  );
  const artigoTitulo = stripCompendioDisplayNumber(artigo.titulo);
  const artigoPath = `/compendio/livros/${livroCodigo}/${categoriaCodigo}/${subcategoriaCodigo}/${artigoCodigo}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artigoTitulo,
    description: artigo.resumo || undefined,
    inLanguage: 'pt-BR',
    url: urlPublica(artigoPath),
    isPartOf: {
      '@type': 'Book',
      name: livro.titulo,
      url: urlPublica(`/compendio/livros/${livro.codigo}`),
    },
    articleSection: `${categoriaNome} / ${subcategoriaNome}`,
    keywords: artigo.tags ?? undefined,
  };

  return (
    <ReaderShell
      livro={livro}
      activeCategoriaCodigo={categoriaCodigo}
      activeSubcategoriaCodigo={subcategoriaCodigo}
      activeArtigoCodigo={artigoCodigo}
    >
      <article className="mx-auto max-w-3xl space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
        />
        <PageHeader
          icon="document"
          title={artigoTitulo}
          description={artigo.resumo || undefined}
          backHref={getCompendioBookHref(livro.codigo)}
          backLabel="Índice"
          breadcrumb={
            <span className="truncate">
              {livro.titulo} / {categoriaNome} / {subcategoriaNome}
            </span>
          }
          actions={<CompendioArticleAdminActions artigo={artigo} />}
        />

        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
          <Badge color="blue" size="sm">
            {subcategoriaNome}
          </Badge>
          {artigo.nivelDificuldade ? (
            <Badge color="purple" size="sm">
              {artigo.nivelDificuldade}
            </Badge>
          ) : null}
          {Array.isArray(artigo.tags)
            ? artigo.tags.slice(0, 6).map((tag) => (
                <Badge key={tag} color="gray" size="sm">
                  {tag}
                </Badge>
              ))
            : null}
        </div>

        <div className="prose prose-app max-w-none">
          <ArtigoContent conteudo={artigo.conteudo} titulo={artigo.titulo} />
        </div>

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
