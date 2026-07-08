import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioGrid } from '@/components/compendio/CompendioGrid';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  apiBuscarSubcategoriaPorCodigo,
  type CompendioArtigoResumido,
} from '@/lib/utils/compendio';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';

type Props = {
  params: Promise<{ categoria: string; subcategoria: string }>;
};

export default async function SubcategoriaPage({ params }: Props) {
  const { categoria: codigoCategoria, subcategoria: codigoSubcategoria } = await params;
  const subcategoriaData = await apiBuscarSubcategoriaPorCodigo(codigoSubcategoria);

  if (!subcategoriaData) {
    return (
      <CompendioLayout
        title="Subcategoria não encontrada"
        backHref={`/compendio/${codigoCategoria}`}
        backLabel="Voltar à categoria"
        icon="error"
        breadcrumbs={[
          { label: 'Compêndio', href: '/compendio' },
          { label: 'Categoria', href: `/compendio/${codigoCategoria}` },
        ]}
      >
        <EmptyState
          variant="card"
          icon="search"
          title="Subcategoria não encontrada"
          description="Esta subcategoria não existe ou foi removida."
        />
      </CompendioLayout>
    );
  }

  const artigos = subcategoriaData.artigos || [];
  const totalArtigos = artigos.length;
  const artigosDestaque = artigos.filter((artigo: CompendioArtigoResumido) => artigo.destaque);
  const categoriaNome = stripCompendioDisplayNumber(
    subcategoriaData.categoria?.nome || 'Categoria',
  );
  const subcategoriaNome = stripCompendioDisplayNumber(subcategoriaData.nome);

  return (
    <CompendioLayout
      title={subcategoriaNome}
      subtitle={subcategoriaData.descricao || undefined}
      backHref={`/compendio/${codigoCategoria}`}
      backLabel="Voltar à categoria"
      icon="document"
      breadcrumbs={[
        { label: 'Compêndio', href: '/compendio' },
        { label: categoriaNome, href: `/compendio/${codigoCategoria}` },
        { label: subcategoriaNome, href: `/compendio/${codigoCategoria}/${subcategoriaData.codigo}` },
      ]}
      stats={[
        { label: 'Artigos', value: totalArtigos },
        ...(artigosDestaque.length > 0 ? [{ label: 'Destaques', value: artigosDestaque.length }] : []),
      ]}
    >
      {totalArtigos === 0 ? (
        <EmptyState
          variant="card"
          icon="document"
          title="Nenhum artigo disponível"
          description={subcategoriaData.descricao || 'Esta subcategoria ainda não possui artigos.'}
        />
      ) : (
        <div className="space-y-6">
          {artigosDestaque.length > 0 ? (
            <CompendioGrid
              title="Destaques"
              description="Artigos recomendados desta subcategoria."
            >
              {artigosDestaque.map((artigo: CompendioArtigoResumido) => (
                <ArtigoCard
                  key={artigo.id}
                  artigo={artigo}
                  categoriaCodigo={codigoCategoria}
                  subcategoriaCodigo={subcategoriaData.codigo}
                />
              ))}
            </CompendioGrid>
          ) : null}

          <CompendioGrid
            title="Artigos"
            description="Lista completa desta subcategoria."
          >
            {artigos.map((artigo: CompendioArtigoResumido) => (
              <ArtigoCard
                key={artigo.id}
                artigo={artigo}
                categoriaCodigo={codigoCategoria}
                subcategoriaCodigo={subcategoriaData.codigo}
              />
            ))}
          </CompendioGrid>
        </div>
      )}
    </CompendioLayout>
  );
}
