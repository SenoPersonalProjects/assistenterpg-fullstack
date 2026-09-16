import type { MetadataRoute } from 'next';
import { urlPublica } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/compendio', '/compendio/livros/'],
      disallow: [
        '/api/',
        '/auth/',
        '/amigos',
        '/anotacoes',
        '/campanhas',
        '/configuracoes',
        '/home',
        '/homebrews',
        '/mundo',
        '/notificacoes',
        '/npcs-ameacas',
        '/personagens-base',
        '/suplementos',
        '/compendio/admin',
        '/compendio/busca',
      ],
    },
    sitemap: urlPublica('/sitemap.xml'),
  };
}
