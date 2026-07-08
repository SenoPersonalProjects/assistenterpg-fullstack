import { ArtigoContent } from '@/components/compendio/ArtigoContent';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { apiBuscarArtigoPorCodigo } from '@/lib/utils/compendio';
import { stripCompendioDisplayNumber } from '@/lib/utils/compendio-display';

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
        backLabel="Voltar à subcategoria"
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

  const categoriaNome = stripCompendioDisplayNumber(
    artigoData.subcategoria?.categoria?.nome || 'Categoria',
  );
  const subcategoriaNome = stripCompendioDisplayNumber(
    artigoData.subcategoria?.nome || 'Subcategoria',
  );
  const artigoTitulo = stripCompendioDisplayNumber(artigoData.titulo);

  return (
    <CompendioLayout
      title={artigoTitulo}
      subtitle={`${subcategoriaNome} • ${categoriaNome}`}
      backHref={`/compendio/${codigoCategoria}/${codigoSubcategoria}`}
      backLabel="Todos os artigos"
      icon="document"
      breadcrumbs={[
        { label: 'Compêndio', href: '/compendio' },
        { label: categoriaNome, href: `/compendio/${codigoCategoria}` },
        { label: subcategoriaNome, href: `/compendio/${codigoCategoria}/${codigoSubcategoria}` },
        { label: artigoTitulo, href: `/compendio/${codigoCategoria}/${codigoSubcategoria}/${codigoArtigo}` },
      ]}
    >
      <article className="mx-auto max-w-3xl space-y-6">
        {artigoData.resumo ? (
          <p className="text-base font-medium leading-7 text-app-muted">{artigoData.resumo}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-y border-white/5 py-3">
          <Badge color="blue" size="sm">
            {subcategoriaNome}
          </Badge>

          {artigoData.nivelDificuldade ? (
            <Badge color="purple" size="sm">
              {artigoData.nivelDificuldade}
            </Badge>
          ) : null}

          {artigoData.tags?.slice(0, 6).map((tag: string) => (
            <Badge key={tag} color="gray" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="prose prose-app max-w-none">
          <ArtigoContent conteudo={artigoData.conteudo} titulo={artigoData.titulo} />
        </div>

        {artigoData.artigosRelacionados && artigoData.artigosRelacionados.length > 0 ? (
          <section className="border-t border-white/5 pt-5">
            <SectionHeader
              icon="book"
              title="Conteúdos relacionados"
              description="Referências cadastradas neste artigo."
              count={artigoData.artigosRelacionados.length}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {artigoData.artigosRelacionados.slice(0, 8).map((codigo: string) => (
                <Badge key={codigo} color="gray" size="sm">
                  {codigo}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </CompendioLayout>
  );
}
