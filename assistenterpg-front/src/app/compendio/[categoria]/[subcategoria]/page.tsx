// app/compendio/[categoria]/[subcategoria]/page.tsx
// ✅ FINAL - Usa EmptyState genérico

import { apiBuscarSubcategoriaPorCodigo } from '@/lib/utils/compendio';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { EmptyState } from '@/components/ui/EmptyState'; // ✅ Genérico
import { CompendioGrid } from '@/components/compendio/CompendioGrid';

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
        backLabel="Voltar à Categoria"
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
  const artigosDestaque = artigos.filter((a: any) => a.destaque).length;
  const categoriaNome = subcategoriaData.categoria?.nome || 'Categoria';

  return (
    <CompendioLayout
      title={subcategoriaData.nome}
      subtitle={subcategoriaData.descricao || undefined}
      backHref={`/compendio/${codigoCategoria}`}
      backLabel="Voltar à Categoria"
      icon="document"
      breadcrumbs={[
        { label: 'Compêndio', href: '/compendio' },
        { label: categoriaNome, href: `/compendio/${codigoCategoria}` },
        { label: subcategoriaData.nome, href: `/compendio/${codigoCategoria}/${subcategoriaData.codigo}` },
      ]}
      stats={[
        { label: 'Artigos', value: totalArtigos },
        ...(artigosDestaque > 0 ? [{ label: 'Destaques', value: artigosDestaque }] : []),
      ]}
    >
      {totalArtigos === 0 ? (
        <EmptyState
          variant="card"
          icon="document"
          title="Nenhum artigo disponível"
          description="Esta subcategoria ainda não possui artigos."
        >
          <div className="mt-6 rounded-lg border border-app-border bg-app-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                <span className="text-2xl">📝</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-app-fg mb-2">Conteúdo em breve</h3>
                <p className="text-sm text-app-muted leading-relaxed">
                  {subcategoriaData.descricao || 'Artigos detalhados serão adicionados aqui.'}
                </p>
              </div>
            </div>
          </div>
        </EmptyState>
      ) : (
        <>
          {artigosDestaque > 0 && (
            <div className="mb-8">
              <CompendioGrid 
                title={`Destaques (${artigosDestaque})`}
                description="Artigos recomendados desta subcategoria"
              >
                {artigos
                  .filter((artigo: any) => artigo.destaque)
                  .map((artigo: any) => (
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

          <CompendioGrid 
            title={`Artigos (${totalArtigos})`}
            description="Lista completa desta subcategoria"
          >
            {artigos.map((artigo: any) => (
              <ArtigoCard
                key={artigo.id}
                artigo={artigo}
                categoriaCodigo={codigoCategoria}
                subcategoriaCodigo={subcategoriaData.codigo}
              />
            ))}
          </CompendioGrid>

          <div className="mt-8 rounded-lg border border-app-border bg-app-surface p-4">
            <div className="flex items-center gap-3 text-sm text-app-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-app-primary/10">
                <span className="text-lg">💡</span>
              </div>
              <p>Clique em um artigo para ler o conteúdo completo.</p>
            </div>
          </div>
        </>
      )}
    </CompendioLayout>
  );
}
