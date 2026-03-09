# Catalogos Menores (Pericias, Proficiencias, Tipos de Grau, Condicoes, Alinhamentos)

Atualizado em: 2026-03-08

## Escopo

Detalhamento do contrato real (controller + service + DTO + schema) para:

- `pericias`
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

- `pericias`
  - leitura: `Auth: JWT`
  - escrita: nao exposta neste modulo
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
  - escrita: nao exposta neste modulo

## Endpoints e Formato de Requisicao

## Pericias

- `GET /pericias`
- `GET /pericias/:id`

Retorno tipico:

- `id`, `codigo`, `nome`, `descricao`, `atributoBase`, `somenteTreinada`, `penalizaPorCarga`, `precisaKit`

## Proficiencias

- `GET /proficiencias`
- `GET /proficiencias/:id`
- `POST /proficiencias`
- `PATCH /proficiencias/:id`
- `DELETE /proficiencias/:id`

Body create:

- `codigo` (string, max 50) obrigatorio
- `nome` (string, min 2, max 100) obrigatorio
- `descricao` (string, max 5000) opcional/null
- `tipo` (string, max 50) obrigatorio
- `categoria` (string, max 50) obrigatorio
- `subtipo` (string, max 50) opcional/null

## Tipos de Grau

- `GET /tipos-grau`
- `GET /tipos-grau/:id`
- `POST /tipos-grau`
- `PATCH /tipos-grau/:id`
- `DELETE /tipos-grau/:id`

Body create:

- `codigo` (string, max 50) obrigatorio
- `nome` (string, min 2, max 100) obrigatorio
- `descricao` (string, max 5000) opcional/null

## Condicoes

- `GET /condicoes`
- `GET /condicoes/:id`
- `POST /condicoes`
- `PATCH /condicoes/:id`
- `DELETE /condicoes/:id`

Body create:

- `nome` (string, min 3, max 100) obrigatorio
- `descricao` (string, min 10) obrigatorio

Retorno de listagem inclui:

- `_count.condicoesPersonagemSessao`

## Alinhamentos

- `GET /alinhamentos`

Retorno tipico:

- `id`, `nome`, `descricao`

## Regras de Negocio (Service)

## Proficiencias

- `findAll` ordena por `nome`
- `findOne` valida existencia (`PROFICIENCIA_NOT_FOUND` em nao encontrado)
- exclusao retorna `{ sucesso: true }`
- unicidade de `codigo` e garantida pelo schema (`@unique`) e erro de banco mapeado

## Tipos de Grau

- `findAll` ordena por `nome`
- `findOne` valida existencia (`TIPO_GRAU_NOT_FOUND`)
- exclusao retorna `{ sucesso: true }`
- unicidade de `codigo` garantida pelo schema (`@unique`)

## Condicoes

- nome duplicado e bloqueado (`CONDICAO_NOME_DUPLICADO`)
- `findAll` ordena por `nome` e retorna `_count.condicoesPersonagemSessao`
- `DELETE` bloqueia quando existe vinculo em sessao (`CONDICAO_EM_USO`)
- sucesso de `DELETE`: `{ "message": "Condicao removida com sucesso" }`

## Alinhamentos / Pericias

- leitura de catalogo, ordenacao por `nome` (alinhamentos) e por regra de dominio em pericias

## Contrato de erro validado em teste de integracao

- pericias:
  - `GET /pericias/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
- proficiencias:
  - `GET /proficiencias/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /proficiencias` com `nome` invalido -> `400`, `code: VALIDATION_ERROR`, `field: nome`
- tipos-grau:
  - `GET /tipos-grau/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /tipos-grau` com `nome` invalido -> `400`, `code: VALIDATION_ERROR`, `field: nome`
- condicoes:
  - `GET /condicoes/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /condicoes` com `descricao` invalida -> `400`, `code: VALIDATION_ERROR` (`field` pode ficar ausente quando a mensagem customizada nao inclui o nome tecnico do campo)

## Consistencia com Schema

Restrições de schema relevantes:

- `Proficiencia.codigo` -> `@unique`
- `TipoGrau.codigo` -> `@unique`
- `Condicao.nome` -> `@unique`
- `Condicao.descricao` -> `String @db.Text` (obrigatorio)

## Integracao Frontend

Leitura:

- `assistenterpg-front/src/lib/api/catalogos.ts`
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
