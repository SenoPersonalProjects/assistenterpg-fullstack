import type { MetadataRoute } from 'next';
import type { CompendioLivro } from '@/lib/utils/compendio';
import { urlApiPublica, urlPublica } from '@/lib/seo/site';

// O sitemap é uma entrada para crawlers: ele não pode depender de o backend
// estar acordado a cada visita. O Next/Vercel mantém a última versão válida e
// a revalida em segundo plano, preservando a resposta anterior se a consulta
// ao catálogo falhar temporariamente.
export const revalidate = 3600;

async function listarLivrosPublicosParaSitemap(): Promise<CompendioLivro[]> {
  try {
    const resposta = await fetch(urlApiPublica('/compendio/livros'), {
      cache: 'force-cache',
      next: { revalidate },
    });

    if (!resposta.ok) return [];
    return (await resposta.json()) as CompendioLivro[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const livros = await listarLivrosPublicosParaSitemap();
  const entradas: MetadataRoute.Sitemap = [
    { url: urlPublica('/'), changeFrequency: 'weekly', priority: 1 },
    { url: urlPublica('/compendio'), changeFrequency: 'daily', priority: 0.9 },
  ];

  for (const livro of livros) {
    if (livro.status !== 'PUBLICADO') continue;

    entradas.push({
      url: urlPublica(`/compendio/livros/${livro.codigo}`),
      lastModified: new Date(livro.atualizadoEm),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    for (const categoria of livro.categorias ?? []) {
      if (!categoria.ativo) continue;

      for (const subcategoria of categoria.subcategorias ?? []) {
        if (!subcategoria.ativo) continue;

        for (const artigo of subcategoria.artigos ?? []) {
          if (!artigo.ativo) continue;

          entradas.push({
            url: urlPublica(
              `/compendio/livros/${livro.codigo}/${categoria.codigo}/${subcategoria.codigo}/${artigo.codigo}`,
            ),
            changeFrequency: 'monthly',
            priority: artigo.destaque ? 0.8 : 0.7,
          });
        }
      }
    }
  }

  return entradas;
}
