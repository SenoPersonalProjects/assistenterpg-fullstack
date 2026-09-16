import type { MetadataRoute } from 'next';
import { apiListarLivros } from '@/lib/utils/compendio';
import { urlPublica } from '@/lib/seo/site';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const livros = await apiListarLivros();
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
