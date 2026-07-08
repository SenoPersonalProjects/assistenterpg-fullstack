import { CompendioGrid } from '@/components/compendio/CompendioGrid';
import { SubcategoriaCard } from '@/components/compendio/SubcategoriaCard';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiBuscarCategoriaPorCodigo } from '@/lib/utils/compendio';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';

type Props = {
  params: Promise<{ categoria: string }>;
};

export default async function CategoriaPage({ params }: Props) {
  const { categoria: codigoCategoria } = await params;
  const categoriaData = await apiBuscarCategoriaPorCodigo(codigoCategoria);

  if (!categoriaData) {
    return (
      <CompendioLayout
        title="Categoria não encontrada"
        backHref="/compendio"
        backLabel="Compêndio"
        icon="error"
      >
        <EmptyState
          variant="card"
          icon="search"
          title="Categoria não encontrada"
          description="A categoria solicitada não existe ou foi removida."
        />
      </CompendioLayout>
    );
  }

  const subcategorias = (categoriaData.subcategorias || []).flatMap((item) =>
    Array.isArray(item) ? item : [item],
  );
  const totalSubcategorias = subcategorias.length;
  const totalArtigos = subcategorias.reduce((acc, sub) => {
    return acc + (sub.artigos?.length || 0);
  }, 0);
  const categoriaNome = stripCompendioDisplayNumber(categoriaData.nome);

  return (
    <CompendioLayout
      title={categoriaNome}
      subtitle={categoriaData.descricao || undefined}
      backHref="/compendio"
      backLabel="Compêndio"
      icon="rules"
      breadcrumbs={[
        { label: 'Compêndio', href: '/compendio' },
        { label: categoriaNome, href: `/compendio/${categoriaData.codigo}` },
      ]}
      stats={[
        { label: 'Subcategorias', value: totalSubcategorias },
        { label: 'Artigos', value: totalArtigos },
      ]}
    >
      {totalSubcategorias === 0 ? (
        <EmptyState
          variant="card"
          icon="folder"
          title="Sem conteúdo ainda"
          description="Esta categoria está em desenvolvimento. Novos artigos serão adicionados em breve."
        />
      ) : (
        <CompendioGrid
          title="Subcategorias"
          description={`Explore tópicos sobre ${categoriaNome.toLowerCase()}.`}
        >
          {subcategorias.map((subcategoria) => (
            <SubcategoriaCard
              key={subcategoria.id}
              subcategoria={subcategoria}
              categoriaCodigo={categoriaData.codigo}
            />
          ))}
        </CompendioGrid>
      )}
    </CompendioLayout>
  );
}
