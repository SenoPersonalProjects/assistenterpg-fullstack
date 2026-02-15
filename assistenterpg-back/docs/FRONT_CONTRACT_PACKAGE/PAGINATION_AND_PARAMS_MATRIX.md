# Matriz de Paginação e Parâmetros por Endpoint

## Convenções

- Paginação padrão (quando aplicada): `page` e `limit`.
- Limites validados em `PaginationQueryDto`: `page >= 1`, `limit >= 1`, `limit <= 100`.
- Alguns módulos usam alias em PT-BR (`pagina`, `limite`).

## Matriz

| Domínio | Endpoint | Query params | Tipo de resposta esperado |
|---|---|---|---|
| Campanhas | `GET /campanhas/minhas` | `page`, `limit` (opcionais) | Híbrido: array sem paginação ou envelope paginado |
| Compêndio | `GET /compendio/categorias` | `todas`, `page`, `limit` | Híbrido: array ou envelope paginado |
| Compêndio | `GET /compendio/categorias/:categoriaId/subcategorias` | `todas`, `page`, `limit` | Híbrido: array ou envelope paginado |
| Compêndio | `GET /compendio/artigos` | `subcategoriaId`, `todas`, `page`, `limit` | Híbrido: array ou envelope paginado |
| Compêndio | `GET /compendio/buscar` | `q` (obrigatório) | Array de resultados |
| Homebrews | `GET /homebrews` | `nome`, `tipo`, `status`, `usuarioId`, `apenasPublicados`, `pagina`, `limite` | Envelope paginado do módulo |
| Homebrews | `GET /homebrews/meus` | `nome`, `tipo`, `status`, `usuarioId`, `apenasPublicados`, `pagina`, `limite` | Envelope paginado do módulo |

## Recomendação de parser no frontend

1. Se retorno for array, normalizar para `{ items, total, page, limit, totalPages }`.
2. Se retorno possuir `items`, assumir paginado.
3. Tratar divergência como quebra de contrato e abrir issue com referência do endpoint.
