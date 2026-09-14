import Link from 'next/link';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';
import { apiBuscarCompendioPaginadoComEstado, apiBuscarLivroPorCodigo } from '@/lib/utils/compendio';

type Props = {
  searchParams: Promise<{ q?: string; livroCodigo?: string; page?: string }>;
};

function buildClearSearchHref(livroCodigo?: string) {
  if (!livroCodigo) return '/compendio/busca';

  const params = new URLSearchParams({ livroCodigo });
  return `/compendio/busca?${params.toString()}`;
}

export default async function BuscaPage({ searchParams }: Props) {
  const { q: query, livroCodigo, page } = await searchParams;
  const queryTrim = query?.trim() ?? '';
  const pagina = Math.max(1, Number(page) || 1);
  const livro = livroCodigo ? await apiBuscarLivroPorCodigo(livroCodigo) : null;
  const queryValida = queryTrim.length >= 3 || ['PV', 'PE', 'EA', 'DT', 'RD'].includes(queryTrim.toUpperCase());
  const busca = queryValida
    ? await apiBuscarCompendioPaginadoComEstado(queryTrim, livroCodigo, pagina)
    : { busca: null, erro: null };
  const resultados = busca.busca?.items ?? [];
  const escopo = livro ? ` em ${livro.titulo}` : '';
  const categorias = new Set(
    resultados
      .map((artigo) => artigo.subcategoria?.categoria?.codigo)
      .filter(Boolean),
  );
  const fontes = new Set(
    resultados
      .map((artigo) => artigo.subcategoria?.categoria?.livro?.codigo)
      .filter(Boolean),
  );
  const clearHref = buildClearSearchHref(livroCodigo);

  const statsItems: StatsStripItem[] = [
    {
      id: 'results',
      label: 'Resultados',
      value: busca.busca?.total ?? 0,
      icon: 'search',
      tone: 'primary',
    },
    {
      id: 'featured',
      label: 'Destaques',
      value: resultados.filter((artigo) => artigo.destaque).length,
      icon: 'star',
    },
    {
      id: 'categories',
      label: 'Categorias',
      value: categorias.size,
      icon: 'rules',
    },
    {
      id: 'sources',
      label: 'Fontes',
      value: fontes.size || (livro ? 1 : 0),
      icon: 'book',
    },
  ];

  return (
    <main className="min-h-full bg-app-bg px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          backHref="/compendio"
          backLabel="Compêndio"
          eyebrow="Consulta"
          icon="search"
          title={queryValida ? 'Resultados da busca' : 'Busca no Compêndio'}
          description={
            queryValida
              ? `Mostrando resultados para "${queryTrim}"${escopo}.`
              : 'Digite pelo menos 3 caracteres para buscar regras, técnicas e referências.'
          }
        />

        <StatsStrip items={statsItems} />

        <PageToolbar>
          <div className="min-w-0 flex-1">
            <CompendioSearch
              livroCodigo={livroCodigo}
              initialQuery={queryTrim}
              placeholder={livro ? `Buscar em ${livro.titulo}` : 'Buscar no compêndio'}
              inputLabel="Busca"
            />
          </div>

          {queryTrim ? (
            <Link href={clearHref}>
              <Button size="sm" variant="ghost">
                Limpar busca
              </Button>
            </Link>
          ) : null}
        </PageToolbar>

        {!queryValida ? (
          <EmptyState
            variant="card"
            size="sm"
            icon="search"
            title="Digite pelo menos 3 caracteres"
            description="Use a barra de busca para encontrar artigos, regras e referências do compêndio."
          />
        ) : busca.erro ? (
          <div className="space-y-3">
            <ErrorAlert message={busca.erro} />
            <Link
              href={`/compendio/busca?q=${encodeURIComponent(queryTrim)}${livroCodigo ? `&livroCodigo=${encodeURIComponent(livroCodigo)}` : ''}`}
            >
              <Button size="sm" variant="secondary">
                Tentar novamente
              </Button>
            </Link>
          </div>
        ) : resultados.length === 0 ? (
          <EmptyState
            variant="card"
            size="sm"
            icon="search"
            title={`Nenhum resultado para "${queryTrim}"`}
            description="Tente usar outros termos ou palavras-chave relacionadas."
            action={
              <Link href={clearHref}>
                <Button size="sm" variant="secondary">
                  Limpar busca
                </Button>
              </Link>
            }
          />
        ) : (
          <section className="space-y-4">
            <SectionHeader
              icon="list"
              title="Resultados"
              count={resultados.length}
              description={`Mostrando resultados para "${queryTrim}"${escopo}.`}
            />

            {busca.busca?.truncated ? (
              <p className="text-xs text-app-muted">Mostrando os primeiros resultados mais relevantes. Refine o termo para reduzir a busca.</p>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {resultados.map((artigo) => (
                <div key={artigo.id} className="space-y-2">
                  <ArtigoCard
                    artigo={artigo}
                    livroCodigo={artigo.subcategoria?.categoria?.livro?.codigo}
                    categoriaCodigo={artigo.subcategoria?.categoria?.codigo || ''}
                    subcategoriaCodigo={artigo.subcategoria?.codigo || ''}
                  />
                  <p className="line-clamp-3 px-2 text-xs text-app-muted">{artigo.trecho}</p>
                </div>
              ))}
            </div>

            {(busca.busca?.totalPages ?? 1) > 1 ? (
              <div className="flex items-center justify-center gap-3">
                {pagina > 1 ? <Link href={`/compendio/busca?q=${encodeURIComponent(queryTrim)}${livroCodigo ? `&livroCodigo=${encodeURIComponent(livroCodigo)}` : ''}&page=${pagina - 1}`}><Button size="sm" variant="secondary">Anterior</Button></Link> : null}
                <span className="text-xs text-app-muted">Página {pagina} de {busca.busca?.totalPages}</span>
                {pagina < (busca.busca?.totalPages ?? 1) ? <Link href={`/compendio/busca?q=${encodeURIComponent(queryTrim)}${livroCodigo ? `&livroCodigo=${encodeURIComponent(livroCodigo)}` : ''}&page=${pagina + 1}`}><Button size="sm" variant="secondary">Próxima</Button></Link> : null}
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
