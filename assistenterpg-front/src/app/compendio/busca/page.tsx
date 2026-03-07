// app/compendio/busca/page.tsx
// ✅ CORRIGIDO - Usa EmptyState genérico

import { apiBuscarCompendio } from '@/lib/utils/compendio';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioLayout } from '@/components/compendio/CompendioLayout';
import { EmptyState } from '@/components/ui/EmptyState'; // ✅ Genérico
import { CompendioGrid } from '@/components/compendio/CompendioGrid';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const { q: query } = await searchParams;

  if (!query || query.trim().length < 3) {
    return (
      <CompendioLayout
        title="🔍 Buscar no Compêndio"
        breadcrumbs={[{ label: 'Busca', href: '/compendio/busca' }]}
      >
        <EmptyState
          variant="card"
          icon="search"
          title="Digite pelo menos 3 caracteres"
          description="Use a barra de busca acima para encontrar artigos, regras e referências do compêndio."
        />
      </CompendioLayout>
    );
  }

  const resultados = await apiBuscarCompendio(query);

  return (
    <CompendioLayout
      title="🔍 Resultados da busca"
      subtitle={`"${query}" • ${resultados.length} resultado(s)`}
      breadcrumbs={[{ label: 'Busca', href: '/compendio/busca' }]}
    >
      {resultados.length === 0 ? (
        <EmptyState
          variant="card"
          icon="search"
          title={`Nenhum resultado para "${query}"`}
          description="Tente usar outros termos ou palavras-chave relacionadas."
        >
          <div className="mt-6 text-sm text-app-muted space-y-2">
            <p>💡 <strong>Dicas de busca:</strong></p>
            <ul className="text-left ml-4 space-y-1 mt-2">
              <li>• &quot;atributos base&quot;</li>
              <li>• &quot;perícias lista&quot;</li>
              <li>• &quot;jujutsu combate&quot;</li>
              <li>• &quot;classes combatente&quot;</li>
            </ul>
          </div>
        </EmptyState>
      ) : (
        <CompendioGrid
          title={`${resultados.length} resultado(s) encontrados`}
          description={`Mostrando resultados para "${query}". Refine sua busca se necessário.`}
        >
          {resultados.map((artigo) => (
            <ArtigoCard
              key={artigo.id}
              artigo={artigo}
              categoriaCodigo={artigo.subcategoria?.categoria?.codigo || ''}
              subcategoriaCodigo={artigo.subcategoria?.codigo || ''}
            />
          ))}
        </CompendioGrid>
      )}
    </CompendioLayout>
  );
}

