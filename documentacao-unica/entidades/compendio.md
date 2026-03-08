# Compendio (Categorias, Subcategorias e Artigos)

Atualizado em: 2026-03-08

## Escopo

Documento de contrato do modulo `compendio`, com base em:

- controller: `assistenterpg-back/src/compendio/compendio.controller.ts`
- service: `assistenterpg-back/src/compendio/compendio.service.ts`
- DTOs: `assistenterpg-back/src/compendio/dto/*.ts`
- exceptions: `assistenterpg-back/src/common/exceptions/compendio.exception.ts`
- schema: `assistenterpg-back/prisma/schema.prisma` (models `CompendioCategoria`, `CompendioSubcategoria`, `CompendioArtigo`)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/compendio.ts`
  - `assistenterpg-front/src/lib/utils/compendio.ts`

## Matriz de autorizacao

- leitura (`GET`): publica
- escrita (`POST`, `PUT`, `DELETE`): `Auth: JWT+Admin`

## Endpoints

## Categorias

- `GET /compendio/categorias`
  - query:
    - `todas=true` retorna ativas + inativas
    - sem `todas=true` retorna apenas ativas
    - `page`/`limit` opcionais
  - resposta:
    - sem paginacao: array
    - com paginacao: `{ items, total, page, limit, totalPages }`

- `GET /compendio/categorias/codigo/:codigo`

- `POST /compendio/categorias` (`JWT+Admin`)
  - body `CreateCategoriaDto`:
    - `codigo`, `nome` obrigatorios
    - `descricao?`, `icone?`, `cor?`, `ordem?`, `ativo?`

- `PUT /compendio/categorias/:id` (`JWT+Admin`)
  - body `UpdateCategoriaDto` (partial)

- `DELETE /compendio/categorias/:id` (`JWT+Admin`)

## Subcategorias

- `GET /compendio/categorias/:categoriaId/subcategorias`
  - query:
    - `todas=true` para incluir inativas
    - `page`/`limit` opcionais

- `GET /compendio/subcategorias/codigo/:codigo`

- `POST /compendio/subcategorias` (`JWT+Admin`)
  - body `CreateSubcategoriaDto`:
    - `codigo`, `nome`, `categoriaId` obrigatorios
    - `descricao?`, `ordem?`, `ativo?`

- `PUT /compendio/subcategorias/:id` (`JWT+Admin`)
- `DELETE /compendio/subcategorias/:id` (`JWT+Admin`)

## Artigos

- `GET /compendio/artigos`
  - query:
    - `subcategoriaId?` (valida int; invalido gera 400)
    - `todas=true` para incluir inativos
    - `page`/`limit` opcionais

- `GET /compendio/artigos/codigo/:codigo`

- `POST /compendio/artigos` (`JWT+Admin`)
  - body `CreateArtigoDto`:
    - `codigo`, `titulo`, `conteudo`, `subcategoriaId` obrigatorios
    - `resumo?`, `ordem?`, `tags?`, `palavrasChave?`, `nivelDificuldade?`, `artigosRelacionados?`, `ativo?`, `destaque?`

- `PUT /compendio/artigos/:id` (`JWT+Admin`)
- `DELETE /compendio/artigos/:id` (`JWT+Admin`)

## Busca e destaques

- `GET /compendio/buscar?q=...`
  - exige `q` com pelo menos 3 caracteres
  - retorna no maximo 20 resultados

- `GET /compendio/destaques`
  - retorna no maximo 6 artigos ativos e destacados

## Regras de negocio

- codigos (`codigo`) de categoria/subcategoria/artigo sao unicos.
- remocao e protegida por relacao:
  - categoria nao pode ser removida se tiver subcategorias.
  - subcategoria nao pode ser removida se tiver artigos.
- listagens usam ordenacao por `ordem` crescente.
- leitura por codigo traz relacionamentos:
  - categoria -> subcategorias
  - subcategoria -> categoria + artigos
  - artigo -> subcategoria + categoria

## Erros esperados (codigos)

- categoria:
  - `COMPENDIO_CATEGORIA_NOT_FOUND`
  - `COMPENDIO_CATEGORIA_DUPLICADA`
  - `COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS`
- subcategoria:
  - `COMPENDIO_SUBCATEGORIA_NOT_FOUND`
  - `COMPENDIO_SUBCATEGORIA_DUPLICADA`
  - `COMPENDIO_SUBCATEGORIA_COM_ARTIGOS`
- artigo:
  - `COMPENDIO_ARTIGO_NOT_FOUND`
  - `COMPENDIO_ARTIGO_DUPLICADO`
- busca:
  - `COMPENDIO_BUSCA_INVALIDA`

## Consistencia com schema

- `CompendioCategoria.codigo`, `CompendioSubcategoria.codigo`, `CompendioArtigo.codigo` sao `@unique`.
- relacoes com cascade:
  - categoria -> subcategoria (`onDelete: Cascade`)
  - subcategoria -> artigo (`onDelete: Cascade`)
- campos de apoio indexados: `ordem`, `ativo`, `destaque`.
- `CompendioArtigo` possui `@@fulltext([titulo, resumo, palavrasChave])`.

## Integracao frontend

- cliente principal de compendio no front:
  - `assistenterpg-front/src/lib/api/compendio.ts`
- utilitarios/fallback SSR:
  - `assistenterpg-front/src/lib/utils/compendio.ts`

Comportamento relevante no front:

- em indisponibilidade de API durante build/SSR, ha fallback seguro para listas vazias e retorno `null` em buscas por codigo.
