# SEO e favicon

## Superfície pública

O domínio canônico padrão é `https://assistenterpg-fullstack.vercel.app`.
Defina `NEXT_PUBLIC_SITE_URL` no ambiente do frontend quando houver um domínio
próprio; o valor deve conter a origem HTTPS completa, sem caminho adicional.

São indexáveis:

- a landing (`/`);
- o índice do Compêndio;
- livros e artigos publicados do Compêndio.

Rotas de autenticação, dados de usuário, campanhas, fichas, administração e a
busca parametrizada do Compêndio permanecem com `noindex, nofollow`. O sitemap
é montado a partir dos livros, categorias, subcategorias e artigos ativos e
publicados retornados pela API pública.

## Marca e instalação

Os ícones derivam de `logo-padrao.png`, a marca do dado com olhos azul-ciano.
O frontend publica favicon, ícones Apple, ícones de instalação e manifest em
`/manifest.webmanifest`.

## Operação após domínio próprio

1. Atualize `NEXT_PUBLIC_SITE_URL` no ambiente de produção e publique o front.
2. Abra `https://<dominio>/robots.txt` e `https://<dominio>/sitemap.xml`.
3. Cadastre e valide a propriedade no Google Search Console pelo método de DNS
   ou pelo método recomendado pelo provedor do domínio.
4. Envie o sitemap em **Sitemaps** no Search Console.
5. Use a inspeção de URL para validar a landing e pelo menos um artigo público
   após cada mudança estrutural importante no Compêndio.

A verificação atual do Google Search Console é uma meta tag pública, servida
pela aplicação. Para substituir o valor ao trocar de propriedade, configure
`GOOGLE_SITE_VERIFICATION` no ambiente de produção da Vercel; ela tem
precedência sobre o valor de verificação atual centralizado no metadata.

## Critérios editoriais

- Publique somente artigos revisados, com título, resumo e conteúdo úteis.
- Mantenha códigos de livro, categoria, subcategoria e artigo estáveis: eles
  compõem as URLs canônicas.
- Desative ou arquive conteúdo removido; não reutilize sua URL para outro tema.
- Prefira links internos entre artigos relacionados e páginas de livro.
