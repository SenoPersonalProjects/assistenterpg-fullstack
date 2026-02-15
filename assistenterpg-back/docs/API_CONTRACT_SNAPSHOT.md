# Snapshot de contrato da API (para consumo do front)

> Snapshot funcional e pragmático para revisão de front. Não substitui Swagger/OpenAPI, mas cobre o necessário para implementação.

## Convenções gerais

- Base URL: configurada por ambiente (`API_BASE_URL`).
- Auth: Bearer token nas rotas protegidas.
- Erros: envelope com `statusCode`, `message`, `code` (podendo ter `details`, `field`).
- Listas: podem retornar array simples **ou** formato paginado em endpoints com `page`/`limit`.

---

## 1) Auth

### `POST /auth/register`
- body: `{ apelido, email, senha }`
- sucesso: usuário criado (sem senha)

### `POST /auth/login`
- body: `{ email, senha }`
- sucesso: `{ access_token, usuario: { id, email, apelido, role } }`

---

## 2) Usuário (protegido)

- `GET /usuarios/me`
- `GET /usuarios/me/estatisticas`
- `GET /usuarios/me/preferencias`
- `PATCH /usuarios/me/preferencias`
- `PATCH /usuarios/me/senha`
- `GET /usuarios/me/exportar`
- `DELETE /usuarios/me`

---

## 3) Campanhas (protegido)

- `POST /campanhas`
- `GET /campanhas/minhas` (`page`, `limit` opcionais)
- `GET /campanhas/:id`
- `DELETE /campanhas/:id`
- `GET /campanhas/:id/membros`
- `POST /campanhas/:id/membros`
- `POST /campanhas/:id/convites`
- `GET /campanhas/convites/pendentes`
- `POST /campanhas/convites/:codigo/aceitar`
- `POST /campanhas/convites/:codigo/recusar`

### Observação de resposta
- `GET /campanhas/minhas`:
  - sem paginação: `Campanha[]`
  - com paginação: `{ items, total, page, limit, totalPages }`

---

## 4) Compêndio

### Categorias
- `GET /compendio/categorias` (`todas`, `page`, `limit`)
- `GET /compendio/categorias/codigo/:codigo`
- `POST /compendio/categorias`
- `PUT /compendio/categorias/:id`
- `DELETE /compendio/categorias/:id`

### Subcategorias
- `GET /compendio/categorias/:categoriaId/subcategorias` (`todas`, `page`, `limit`)
- `GET /compendio/subcategorias/codigo/:codigo`
- `POST /compendio/subcategorias`
- `PUT /compendio/subcategorias/:id`
- `DELETE /compendio/subcategorias/:id`

### Artigos
- `GET /compendio/artigos` (`subcategoriaId`, `todas`, `page`, `limit`)
- `GET /compendio/artigos/codigo/:codigo`
- `POST /compendio/artigos`
- `PUT /compendio/artigos/:id`
- `DELETE /compendio/artigos/:id`

### Outros
- `GET /compendio/buscar?q=...`
- `GET /compendio/destaques`

### Observação de resposta
- `categorias`, `subcategorias`, `artigos` têm retorno híbrido array/paginado.

---

## 5) Personagens-base (protegido)

- `POST /personagens-base`
- `POST /personagens-base/preview`
- `GET /personagens-base/graus-treinamento/info`
- `POST /personagens-base/graus-treinamento/pericias-elegiveis`
- `GET /personagens-base/passivas-disponiveis`
- `GET /personagens-base/tecnicas-disponiveis`
- `GET /personagens-base/meus`
- `GET /personagens-base/:id`
- `PATCH /personagens-base/:id`
- `DELETE /personagens-base/:id`

---

## 6) Inventário (protegido)

- `GET /inventario/personagem/:personagemBaseId`
- `POST /inventario/preview-adicionar`
- `POST /inventario/preview`
- `POST /inventario/adicionar`
- `PATCH /inventario/item/:itemId`
- `DELETE /inventario/item/:itemId`
- `POST /inventario/aplicar-modificacao`
- `POST /inventario/remover-modificacao`

---

## 7) Equipamentos e Modificações

### Equipamentos
- `GET /equipamentos`
- `GET /equipamentos/:id`
- `GET /equipamentos/codigo/:codigo`
- `POST /equipamentos`
- `PUT /equipamentos/:id`
- `DELETE /equipamentos/:id`

### Modificações
- `GET /modificacoes`
- `GET /modificacoes/:id`
- `GET /modificacoes/equipamento/:equipamentoId/compativeis`
- `POST /modificacoes`
- `PATCH /modificacoes/:id`
- `DELETE /modificacoes/:id`

---

## 8) Técnicas amaldiçoadas

- `GET /tecnicas-amaldicoadas`
- `GET /tecnicas-amaldicoadas/codigo/:codigo`
- `GET /tecnicas-amaldicoadas/cla/:claId`
- `GET /tecnicas-amaldicoadas/:id`
- `POST /tecnicas-amaldicoadas`
- `PATCH /tecnicas-amaldicoadas/:id`
- `DELETE /tecnicas-amaldicoadas/:id`

### Habilidades técnicas
- `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
- `GET /tecnicas-amaldicoadas/habilidades/:id`
- `POST /tecnicas-amaldicoadas/habilidades`
- `PATCH /tecnicas-amaldicoadas/habilidades/:id`
- `DELETE /tecnicas-amaldicoadas/habilidades/:id`

### Variações
- `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
- `GET /tecnicas-amaldicoadas/variacoes/:id`
- `POST /tecnicas-amaldicoadas/variacoes`
- `PATCH /tecnicas-amaldicoadas/variacoes/:id`
- `DELETE /tecnicas-amaldicoadas/variacoes/:id`

---

## 9) Catálogo base / demais domínios

CRUD/listagem em:
- `classes`, `clas`, `origens`, `trilhas`, `habilidades`, `proficiencias`, `tipos-grau`, `condicoes`

Listagem simples em:
- `alinhamentos`, `pericias`

Homebrews e Suplementos:
- possuem endpoints de listagem, detalhe, CRUD e ações específicas (publicar/arquivar, ativar/desativar).

---

## 10) Recomendação de parser universal no front

Implementar uma função utilitária para respostas de lista:

1. Se `Array.isArray(data)` => transformar para `ListResult` com defaults.
2. Se `data.items` existe => usar dados paginados.
3. Caso contrário => lançar erro de contrato inesperado.

