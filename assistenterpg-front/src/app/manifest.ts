import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Assistente RPG — Maledicência RPG',
    short_name: 'Maledicência RPG',
    description:
      'Crie personagens, organize campanhas e consulte as regras de Maledicência RPG.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050816',
    theme_color: '#22d3ee',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icons/maledicencia-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/maledicencia-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/maledicencia-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
