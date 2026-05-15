import { apiListarDestaques, apiListarLivros } from '@/lib/utils/compendio';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { BookCard } from '@/components/compendio/BookCard';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default async function CompendioPage() {
  const [livros, destaques] = await Promise.all([
    apiListarLivros(),
    apiListarDestaques(),
  ]);
  const semConteudo = livros.length === 0 && destaques.length === 0;

  return (
    <main className="library-page-shell min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="library-page-header__icon">
              <Icon name="rules" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                Biblioteca de regras
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-app-fg">
                Compendio
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-app-muted">
                Escolha um livro oficial para consultar regras, suplementos e referencias
                do sistema Jujutsu Kaisen RPG.
              </p>
            </div>
          </div>

          <Link
            href="/home"
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:text-app-fg"
          >
            <Icon name="back" className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </header>

        <section className="library-panel rounded-lg p-4">
          <CompendioSearch />
        </section>

        {semConteudo ? (
          <EmptyState
            variant="card"
            icon="warning"
            title="Compendio indisponivel no momento"
            description="Nao foi possivel carregar livros e destaques agora. Tente novamente em instantes."
          />
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                    Livros
                  </p>
                  <h2 className="text-xl font-semibold text-app-fg">
                    Publicacoes oficiais
                  </h2>
                </div>
                <span className="text-sm text-app-muted">{livros.length} livro(s)</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {livros.map((livro) => (
                  <BookCard key={livro.id} livro={livro} />
                ))}
              </div>
            </section>

            {destaques.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                    Destaques
                  </p>
                  <h2 className="text-xl font-semibold text-app-fg">
                    Secoes recomendadas
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
