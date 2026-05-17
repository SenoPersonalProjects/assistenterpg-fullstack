import { apiListarDestaques, apiListarLivros } from '@/lib/utils/compendio';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioAdminExportButton } from '@/components/compendio/CompendioAdminExportButton';
import { BookCard } from '@/components/compendio/BookCard';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default async function CompendioPage() {
  const [livros, destaques] = await Promise.all([
    apiListarLivros(),
    apiListarDestaques(),
  ]);
  const semConteudo = livros.length === 0 && destaques.length === 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-app-border/30">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary shadow-inner">
              <Icon name="rules" className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl font-black tracking-tight text-app-fg">
                Compêndio
              </h1>
              <p className="mt-1 text-base font-medium text-app-muted max-w-xl">
                Onde as leis do mundo são escritas. Consulte regras, técnicas e suplementos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CompendioAdminExportButton />
            <Link href="/home">
              <Button variant="ghost" size="sm" className="font-bold">
                <Icon name="back" className="mr-2 h-4 w-4" />
                Painel
              </Button>
            </Link>
          </div>
        </header>

        <section className="bg-app-surface/50 backdrop-blur-sm border border-app-border/40 rounded-2xl p-6 shadow-xl shadow-black/5">
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
