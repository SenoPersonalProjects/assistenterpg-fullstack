import { describe, expect, it } from 'vitest';
import { metadataPublica, serializarJsonLd, urlApiPublica, urlPublica } from './site';

describe('SEO público', () => {
  it('monta URLs canônicas na origem pública', () => {
    expect(urlPublica('/compendio')).toBe(
      'https://assistenterpg-fullstack.vercel.app/compendio',
    );
  });

  it('mantém uma origem pública para o sitemap consultar o Compêndio', () => {
    expect(urlApiPublica('/compendio/livros')).toMatch(/\/compendio\/livros$/);
  });

  it('declara metadata indexável com canonical e Open Graph', () => {
    const metadata = metadataPublica({
      title: 'Compêndio',
      description: 'Regras públicas',
      path: '/compendio',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://assistenterpg-fullstack.vercel.app/compendio',
    );
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ type: 'website', locale: 'pt_BR' });
  });

  it('escapa conteúdo perigoso ao serializar JSON-LD', () => {
    expect(serializarJsonLd({ nome: '</script><script>alert(1)</script>' })).not.toContain(
      '</script>',
    );
  });
});
