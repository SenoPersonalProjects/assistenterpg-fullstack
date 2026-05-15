import type {
  CompendioArtigoResumido,
  CompendioLivro,
} from '@/lib/utils/compendio';

export type CompendioArticleEntry = {
  index: number;
  livroCodigo: string;
  categoriaCodigo: string;
  categoriaNome: string;
  categoriaIcone: string | null;
  subcategoriaCodigo: string;
  subcategoriaNome: string;
  artigo: CompendioArtigoResumido;
  href: string;
};

export type CompendioBookCounts = {
  categorias: number;
  subcategorias: number;
  artigos: number;
};

export function getCompendioArticleHref(
  livroCodigo: string,
  categoriaCodigo: string,
  subcategoriaCodigo: string,
  artigoCodigo: string,
): string {
  return `/compendio/livros/${livroCodigo}/${categoriaCodigo}/${subcategoriaCodigo}/${artigoCodigo}`;
}

export function getCompendioBookHref(livroCodigo: string): string {
  return `/compendio/livros/${livroCodigo}`;
}

export function getCompendioArticleEntries(
  livro: CompendioLivro,
): CompendioArticleEntry[] {
  const entries: CompendioArticleEntry[] = [];

  for (const categoria of livro.categorias ?? []) {
    for (const subcategoria of categoria.subcategorias ?? []) {
      for (const artigo of subcategoria.artigos ?? []) {
        entries.push({
          index: entries.length,
          livroCodigo: livro.codigo,
          categoriaCodigo: categoria.codigo,
          categoriaNome: categoria.nome,
          categoriaIcone: categoria.icone,
          subcategoriaCodigo: subcategoria.codigo,
          subcategoriaNome: subcategoria.nome,
          artigo,
          href: getCompendioArticleHref(
            livro.codigo,
            categoria.codigo,
            subcategoria.codigo,
            artigo.codigo,
          ),
        });
      }
    }
  }

  return entries;
}

export function getCompendioBookCounts(livro: CompendioLivro): CompendioBookCounts {
  const categorias = livro.categorias?.length ?? 0;
  const subcategorias =
    livro.categorias?.reduce((total, categoria) => {
      return total + (categoria.subcategorias?.length ?? 0);
    }, 0) ?? 0;
  const artigos = getCompendioArticleEntries(livro).length;

  return { categorias, subcategorias, artigos };
}

export function getFirstCompendioArticleHref(livro: CompendioLivro): string | null {
  return getCompendioArticleEntries(livro)[0]?.href ?? null;
}

export function getAdjacentCompendioEntries(
  livro: CompendioLivro,
  categoriaCodigo: string,
  subcategoriaCodigo: string,
  artigoCodigo: string,
): { prev: CompendioArticleEntry | null; next: CompendioArticleEntry | null } {
  const entries = getCompendioArticleEntries(livro);
  const currentIndex = entries.findIndex(
    (entry) =>
      entry.categoriaCodigo === categoriaCodigo &&
      entry.subcategoriaCodigo === subcategoriaCodigo &&
      entry.artigo.codigo === artigoCodigo,
  );

  if (currentIndex < 0) {
    return { prev: null, next: null };
  }

  return {
    prev: entries[currentIndex - 1] ?? null,
    next: entries[currentIndex + 1] ?? null,
  };
}
