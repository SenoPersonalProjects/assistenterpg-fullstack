import type { ReactNode } from 'react';
import type { CompendioLivro } from '@/lib/utils/compendio';
import { ReaderSidebar } from './ReaderSidebar';

type ReaderShellProps = {
  livro: CompendioLivro;
  activeCategoriaCodigo?: string;
  activeSubcategoriaCodigo?: string;
  activeArtigoCodigo?: string;
  children: ReactNode;
};

export function ReaderShell({
  livro,
  activeCategoriaCodigo,
  activeSubcategoriaCodigo,
  activeArtigoCodigo,
  children,
}: ReaderShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-app-bg lg:pl-80">
      <ReaderSidebar
        livro={livro}
        activeCategoriaCodigo={activeCategoriaCodigo}
        activeSubcategoriaCodigo={activeSubcategoriaCodigo}
        activeArtigoCodigo={activeArtigoCodigo}
      />
      <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</div>
    </main>
  );
}
