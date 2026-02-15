// app/compendio/page.tsx
import { apiListarCategorias, apiListarDestaques } from '@/lib/utils/compendio';
import { CategoriaCard } from '@/components/compendio/CategoriaCard';
import { ArtigoCard } from '@/components/compendio/ArtigoCard';
import { CompendioSearch } from '@/components/compendio/CompendioSearch';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default async function CompendioPage() {
  const categorias = await apiListarCategorias();
  const destaques = await apiListarDestaques();

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-app-fg flex items-center gap-2">
              <Icon name="rules" className="w-8 h-8" />
              Compêndio
            </h1>
            <p className="text-app-muted">Regras e referências do sistema Jujutsu Kaisen RPG</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">Voltar</Button>
          </Link>
        </div>

        <div className="mb-8">
          <CompendioSearch />
        </div>

        {destaques.length > 0 && (
          <section className="mb-8">
            <SectionTitle icon="star">Artigos em Destaque</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {destaques.map((artigo) => (
                <ArtigoCard
                  key={artigo.id}
                  artigo={artigo}
                  categoriaCodigo={artigo.subcategoria?.categoria?.codigo || ''}
                  subcategoriaCodigo={artigo.subcategoria?.codigo || ''}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle>Categorias</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {categorias.map((categoria) => (
              <CategoriaCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
