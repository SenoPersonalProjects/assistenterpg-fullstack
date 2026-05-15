import { apiBuscarCompendio, apiBuscarLivroPorCodigo } from '@/lib/utils/compendio';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompendioGrid } from '@/components/compendio/CompendioGrid';

type Props = {
  searchParams: Promise<{ q?: string; livroCodigo?: string }>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const { q: query, livroCodigo } = await searchParams;
  const livro = livroCodigo ? await apiBuscarLivroPorCodigo(livroCodigo) : null;

  if (!query || query.trim().length < 3) {
    return (
      <CompendioLayout
        title="Buscar no Compendio"
        breadcrumbs={[{ label: 'Busca', href: '/compendio/busca' }]}
      >
        <div className="mb-6">
          <CompendioSearch livroCodigo={livroCodigo} />
        </div>
        <EmptyState
          variant="card"
          icon="search"
          title="Digite pelo menos 3 caracteres"
          description="Use a barra de busca para encontrar artigos, regras e referencias do compendio."
        />
      </CompendioLayout>
    );
  }

  const resultados = await apiBuscarCompendio(query, livroCodigo);
  const escopo = livro ? ` em ${livro.titulo}` : '';

  return (
    <CompendioLayout
      title="Resultados da busca"
      subtitle={`"${query}"${escopo} - ${resultados.length} resultado(s)`}
      breadcrumbs={[{ label: 'Busca', href: '/compendio/busca' }]}
    >
      <div className="mb-6">
        <CompendioSearch livroCodigo={livroCodigo} />
      </div>

      {resultados.length === 0 ? (
        <EmptyState
          variant="card"
          icon="search"
          title={`Nenhum resultado para "${query}"`}
          description="Tente usar outros termos ou palavras-chave relacionadas."
        />
      ) : (
        <CompendioGrid
          title={`${resultados.length} resultado(s) encontrados`}
          description={`Mostrando resultados para "${query}".`}
        >
          {resultados.map((artigo) => (
            <ArtigoCard
              key={artigo.id}
              artigo={artigo}
              livroCodigo={artigo.subcategoria?.categoria?.livro?.codigo}
              categoriaCodigo={artigo.subcategoria?.categoria?.codigo || ''}
              subcategoriaCodigo={artigo.subcategoria?.codigo || ''}
            />
          ))}
        </CompendioGrid>
      )}
    </CompendioLayout>
  );
}
