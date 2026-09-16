import type { Metadata } from 'next';

export const SITE_NAME = 'Assistente RPG — Maledicência RPG';
export const SITE_DESCRIPTION =
  'Ferramenta para criar personagens, organizar campanhas e consultar as regras de Maledicência RPG.';

const FALLBACK_SITE_URL = 'https://assistenterpg-fullstack.vercel.app';
const FALLBACK_PUBLIC_API_URL = 'https://assistenterpg-fullstack.onrender.com';

function normalizarUrlBase(valor: string | undefined) {
  const candidata = valor?.trim() || FALLBACK_SITE_URL;
  return new URL(candidata.endsWith('/') ? candidata : `${candidata}/`);
}

export const siteUrl = normalizarUrlBase(process.env.NEXT_PUBLIC_SITE_URL);
export const apiPublicaUrl = normalizarUrlBase(
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_PUBLIC_API_URL,
);

export function urlPublica(caminho = '/') {
  return new URL(caminho, siteUrl).toString();
}

export function urlApiPublica(caminho: string) {
  return new URL(caminho, apiPublicaUrl).toString();
}

export function metadataPublica({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  const canonical = urlPublica(path);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type,
      locale: 'pt_BR',
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: urlPublica('/images/logos/logo-padrao.png'),
          width: 1200,
          height: 1200,
          alt: 'Marca do Maledicência RPG',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [urlPublica('/images/logos/logo-padrao.png')],
    },
  };
}

export function serializarJsonLd(valor: unknown) {
  return JSON.stringify(valor).replace(/</g, '\\u003c');
}
