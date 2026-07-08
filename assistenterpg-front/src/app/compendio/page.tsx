import Link from 'next/link';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { BookCard } from '@/components/compendio/BookCard';
import { CompendioAdminActionsMenu } from '@/components/compendio/CompendioAdminActionsMenu';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { apiListarDestaques, apiListarLivros } from '@/lib/utils/compendio';

export default async function CompendioPage() {
  const [livros, destaques] = await Promise.all([
    apiListarLivros(),
    apiListarDestaques(),
  ]);
  const categorias = livros.flatMap((livro) => livro.categorias ?? []);
  const subcategorias = categorias.flatMap((categoria) => categoria.subcategorias ?? []);
  const artigos = subcategorias.flatMap((subcategoria) => subcategoria.artigos ?? []);
  const semConteudo = livros.length === 0 && destaques.length === 0;

  const statsItems: StatsStripItem[] = [
    {
      id: 'books',
      label: 'Livros',
      value: livros.length,
      icon: 'book',
      tone: 'primary',
    },
    {
      id: 'categories',
      label: 'Categorias',
      value: categorias.length,
      icon: 'rules',
    },
    {
      id: 'articles',
      label: 'Seções',
      value: artigos.length,
      icon: 'document',
      tone: 'success',
    },
    {
      id: 'featured',
      label: 'Destaques',
      value: destaques.length,
      icon: 'star',
    },
  ];

  return (
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          backHref="/home"
          backLabel="Painel"
          eyebrow="Consulta"
          icon="rules"
          title="Compêndio"
          description="Consulte livros, regras, técnicas e suplementos do sistema durante a preparação ou sessão."
          actions={<CompendioAdminActionsMenu />}
        />

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-0 flex-1">
            <CompendioSearch
              placeholder="Buscar regras, técnicas, condições ou referências"
              inputLabel="Busca rápida"
            />
          </div>
        </PageToolbar>

        {semConteudo ? (
          <EmptyState
            variant="card"
            icon="warning"
            title="Compêndio indisponível no momento"
            description="Não foi possível carregar livros e destaques agora. Tente novamente em instantes."
            action={
              <Link href="/compendio/busca">
                <Button variant="secondary" size="sm">
                  Abrir busca
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <section className="space-y-4">
              <SectionHeader
                icon="book"
                title="Livros oficiais"
                count={livros.length}
                description="Fontes disponíveis para navegação estruturada."
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {livros.map((livro) => (
                  <BookCard key={livro.id} livro={livro} />
                ))}
              </div>
            </section>

            {destaques.length > 0 ? (
              <section className="space-y-4">
                <SectionHeader
                  icon="star"
                  title="Seções recomendadas"
                  count={destaques.length}
                  description="Entradas úteis para consulta rápida."
                />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {destaques.map((artigo) => (
                    <ArtigoCard
                      key={artigo.id}
                      artigo={artigo}
                      livroCodigo={artigo.subcategoria?.categoria?.livro?.codigo}
                      categoriaCodigo={artigo.subcategoria?.categoria?.codigo || ''}
                      subcategoriaCodigo={artigo.subcategoria?.codigo || ''}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
