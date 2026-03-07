// app/compendio/[categoria]/[subcategoria]/[artigo]/page.tsx
// ✅ FINAL - Usa EmptyState + CompendioLayout + Badge corrigido

import { apiBuscarArtigoPorCodigo } from '@/lib/utils/compendio';
import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { Badge } from '@/components/ui/Badge';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { EmptyState } from '@/components/ui/EmptyState';

type Props = {
  params: Promise<{ categoria: string; subcategoria: string; artigo: string }>;
};

export default async function ArtigoPage({ params }: Props) {
  const { categoria: codigoCategoria, subcategoria: codigoSubcategoria, artigo: codigoArtigo } = await params;
  const artigoData = await apiBuscarArtigoPorCodigo(codigoArtigo);

  if (!artigoData) {
    return (
      <CompendioLayout
        title="Artigo não encontrado"
        backHref={`/compendio/${codigoCategoria}/${codigoSubcategoria}`}
        backLabel="Voltar à Subcategoria"
        icon="error"
      >
        <EmptyState
          variant="card"
          icon="document"
          title="Artigo não encontrado"
          description="Este artigo não existe ou foi removido."
        />
      </CompendioLayout>
    );
  }

  const categoriaNome = artigoData.subcategoria?.categoria?.nome || 'Categoria';
  const subcategoriaNome = artigoData.subcategoria?.nome || 'Subcategoria';

  return (
    <CompendioLayout
      title={artigoData.titulo}
      subtitle={`${subcategoriaNome} • ${categoriaNome}`}
      backHref={`/compendio/${codigoCategoria}/${codigoSubcategoria}`}
      backLabel="← Todos os artigos"
      icon="document"
    >
      <article className="bg-app-surface border border-app-border rounded-xl p-8 prose prose-app max-w-none">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-app-fg mb-4 leading-tight">
            {artigoData.titulo}
          </h1>
          
          {artigoData.resumo && (
            <p className="text-xl text-app-muted mb-6 leading-relaxed">
              {artigoData.resumo}
            </p>
          )}

          {/* Metadados */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 text-sm text-app-muted">
              📁 {subcategoriaNome}
            </div>
            
            {artigoData.nivelDificuldade && (
              <Badge color="blue" size="sm">
                {artigoData.nivelDificuldade}
              </Badge>
            )}
            
            {artigoData.tags && artigoData.tags.length > 0 && (
              <>
                <span className="text-app-muted text-xs mx-1">•</span>
                {artigoData.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <Badge key={idx} color="gray" size="sm">
                    {tag}
                  </Badge>
                ))}
                {artigoData.tags.length > 3 && (
                  <Badge color="gray" size="sm">
                    +{artigoData.tags.length - 3}
                  </Badge>
                )}
              </>
            )}
          </div>
        </header>

        {/* Conteúdo */}
        <ArtigoContent conteudo={artigoData.conteudo} />

        {/* Artigos relacionados */}
        {artigoData.artigosRelacionados && artigoData.artigosRelacionados.length > 0 && (
          <div className="mt-16 pt-12 border-t border-app-border">
            <h2 className="text-2xl font-bold text-app-fg mb-8 flex items-center gap-3">
              📖 Você também pode gostar
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artigoData.artigosRelacionados.slice(0, 6).map((codigo: string, idx: number) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-app-muted to-app-surface rounded-xl p-6 group-hover:shadow-lg transition-all duration-200 mb-3"></div>
                  <div className="h-5 bg-app-muted rounded w-3/4 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-app-muted rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </CompendioLayout>
  );
}
