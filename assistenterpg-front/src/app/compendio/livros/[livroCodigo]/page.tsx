import Link from 'next/link';
import { BookIndex } from '@/components/compendio/BookIndex';
import { ReaderShell } from '@/components/compendio/ReaderShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { apiBuscarLivroPorCodigo } from '@/lib/utils/compendio';

type Props = {
  params: Promise<{ livroCodigo: string }>;
};

export default async function CompendioLivroPage({ params }: Props) {
  const { livroCodigo } = await params;
  const livro = await apiBuscarLivroPorCodigo(livroCodigo);

  if (!livro) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-4xl">
          <EmptyState
            variant="card"
            icon="book"
            title="Livro nao encontrado"
            description="O livro solicitado nao existe ou nao esta publicado."
            actionLabel="Voltar ao compendio"
          >
            <Link
              href="/compendio"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-app-border px-3 py-2 text-sm text-app-muted hover:text-app-fg"
            >
              <Icon name="back" className="mr-2 h-4 w-4" />
              Voltar ao compendio
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
