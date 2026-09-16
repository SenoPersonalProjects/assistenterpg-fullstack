import Link from 'next/link';
import type { Metadata } from 'next';
import { BookIndex } from '@/components/compendio/BookIndex';
import { ReaderShell } from '@/components/compendio/ReaderShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { apiBuscarLivroPorCodigo } from '@/lib/utils/compendio';
import { metadataPublica } from '@/lib/seo/site';

type Props = {
  params: Promise<{ livroCodigo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { livroCodigo } = await params;
  const livro = await apiBuscarLivroPorCodigo(livroCodigo);

  if (!livro || livro.status !== 'PUBLICADO') {
    return { title: 'Livro não encontrado', robots: { index: false, follow: false } };
  }

  return metadataPublica({
    title: livro.titulo,
    description: livro.descricao || `Índice e regras do livro ${livro.titulo}.`,
    path: `/compendio/livros/${livro.codigo}`,
  });
}

export default async function CompendioLivroPage({ params }: Props) {
  const { livroCodigo } = await params;
  const livro = await apiBuscarLivroPorCodigo(livroCodigo);

  if (!livro) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EmptyState
            variant="card"
            icon="book"
            title="Livro não encontrado"
            description="O livro solicitado não existe ou não está publicado."
          >
            <Link
              href="/compendio"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-app-border px-3 py-2 text-sm font-bold text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="mr-2 h-4 w-4" />
              Voltar ao compêndio
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  return (
    <ReaderShell livro={livro}>
      <BookIndex livro={livro} />
    </ReaderShell>
  );
}
