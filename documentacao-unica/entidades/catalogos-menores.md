# Catalogos Menores (Perícias, Proficiencias, Tipos de Grau, Condicoes, Alinhamentos)

Atualizado em: 2026-03-08

## Escopo

Detalhamento do contrato real (controller + service + DTO + schema) para:

- `perícias`
- `proficiencias`
- `tipos-grau`
- `condicoes`
- `alinhamentos`

Fontes base:

- controllers: `assistenterpg-back/src/*/*.controller.ts`
- services: `assistenterpg-back/src/*/*.service.ts`
- DTOs: `assistenterpg-back/src/*/dto/*.ts`
- schema: `assistenterpg-back/prisma/schema.prisma`

## Matriz de Autorizacao

- `perícias`
  - leitura: `Auth: JWT`
  - escrita: não exposta neste módulo
- `proficiencias`
  - leitura (`GET`): `Auth: JWT`
  - escrita (`POST/PATCH/DELETE`): `Auth: JWT+Admin`
- `tipos-grau`
  - leitura (`GET`): `Auth: JWT`
  - escrita (`POST/PATCH/DELETE`): `Auth: JWT+Admin`
- `condicoes`
  - leitura (`GET`): `Auth: JWT`
  - escrita (`POST/PATCH/DELETE`): `Auth: JWT+Admin`
- `alinhamentos`
  - leitura: `Auth: JWT`
  - escrita: não exposta neste módulo

## Endpoints e Formato de Requisicao

## Perícias

- `GET /perícias`
- `GET /perícias/:id`

Retorno tipico:

- `id`, `codigo`, `nome`, `descricao`, `atributoBase`, `somenteTreinada`, `penalizaPorCarga`, `precisaKit`

## Proficiencias

- `GET /proficiencias`
- `GET /proficiencias/:id`
- `POST /proficiencias`
- `PATCH /proficiencias/:id`
- `DELETE /proficiencias/:id`

Body create:

- `codigo` (string, max 50) obrigatório
- `nome` (string, min 2, max 100) obrigatório
- `descricao` (string, max 5000) opcional/null
- `tipo` (string, max 50) obrigatório
- `categoria` (string, max 50) obrigatório
- `subtipo` (string, max 50) opcional/null

## Tipos de Grau

- `GET /tipos-grau`
- `GET /tipos-grau/:id`
- `POST /tipos-grau`
- `PATCH /tipos-grau/:id`
- `DELETE /tipos-grau/:id`

Body create:

- `codigo` (string, max 50) obrigatório
- `nome` (string, min 2, max 100) obrigatório
- `descricao` (string, max 5000) opcional/null

## Condicoes

- `GET /condicoes`
- `GET /condicoes/:id`
- `POST /condicoes`
- `PATCH /condicoes/:id`
- `DELETE /condicoes/:id`

Body create:

- `nome` (string, min 3, max 100) obrigatório
- `descricao` (string, min 10) obrigatório

Retorno de listagem inclui:

- `_count.condicoesPersonagemSessao`

## Alinhamentos

- `GET /alinhamentos`

Retorno tipico:

- `id`, `nome`, `descricao`

## Regras de Negocio (Service)

## Proficiencias

- `findAll` ordena por `nome`
- `findOne` válida existência (`PROFICIENCIA_NOT_FOUND` em não encontrado)
- exclusao retorna `{ sucesso: true }`
- unicidade de `codigo` e garantida pelo schema (`@unique`) e erro de banco mapeado

## Tipos de Grau

- `findAll` ordena por `nome`
- `findOne` válida existência (`TIPO_GRAU_NOT_FOUND`)
- exclusao retorna `{ sucesso: true }`
- unicidade de `codigo` garantida pelo schema (`@unique`)

## Condicoes

- nome duplicado é bloqueado (`CONDICAO_NOME_DUPLICADO`)
- `findAll` ordena por `nome` e retorna `_count.condicoesPersonagemSessao`
- `DELETE` bloqueia quando existe vinculo em sessão (`CONDICAO_EM_USO`)
- sucesso de `DELETE`: `{ "message": "Condição removida com sucesso" }`

## Alinhamentos / Perícias

- leitura de catálogo, ordenacao por `nome` (alinhamentos) e por regra de domínio em perícias

## Contrato de erro validado em teste de integracao

- perícias:
  - `GET /perícias/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR`
- proficiencias:
  - `GET /proficiencias/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR`
  - `POST /proficiencias` com `nome` inválido -> `400`, `code: VALIDATION_ERROR`, `field: nome`
- tipos-grau:
  - `GET /tipos-grau/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR`
  - `POST /tipos-grau` com `nome` inválido -> `400`, `code: VALIDATION_ERROR`, `field: nome`
- condicoes:
  - `GET /condicoes/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR`
  - `POST /condicoes` com `descricao` inválida -> `400`, `code: VALIDATION_ERROR` (`field` pode ficar ausente quando a mensagem customizada não inclui o nome técnico do campo)

## Consistencia com Schema

Restrições de schema relevantes:

- `Proficiencia.codigo` -> `@unique`
- `TipoGrau.codigo` -> `@unique`
- `Condicao.nome` -> `@unique`
- `Condicao.descricao` -> `String @db.Text` (obrigatório)

## Integracao Frontend

Leitura:

- `assistenterpg-front/src/lib/api/catálogos.ts`
  - `apiGetPericias`
  - `apiGetProficiencias`
  - `apiGetTiposGrau`
  - `apiGetAlinhamentos`

Escrita admin:

- `assistenterpg-front/src/lib/api/suplemento-conteudos.ts`
  - proficiencias: CRUD completo
  - tipos-grau: CRUD completo
  - condicoes: CRUD completo

UI admin:

- `assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx`
- `assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx`
- `assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx`
