# Catalogos de Progressao (Cla, Classe, Trilha, Caminho, Origem, Habilidade)

Atualizado em: 2026-03-08

## Escopo

Este documento cobre os modulos de progressao de personagem:

- `clas`
- `classes`
- `trilhas` (inclui `caminhos`)
- `origens`
- `habilidades`

Fontes auditadas:

- controllers: `assistenterpg-back/src/*/*.controller.ts`
- services: `assistenterpg-back/src/*/*.service.ts`
- DTOs:
  - `assistenterpg-back/src/clas/dto/*.ts`
  - `assistenterpg-back/src/classes/dto/*.ts`
  - `assistenterpg-back/src/trilhas/dto/*.ts`
  - `assistenterpg-back/src/origens/dto/*.ts`
  - `assistenterpg-back/src/habilidades/dto/*.ts`
- exceptions:
  - `cla.exception.ts`, `classe.exception.ts`, `trilha.exception.ts`, `origem.exception.ts`, `habilidade.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma`
- integracao frontend:
  - `assistenterpg-front/src/lib/api/catalogos.ts`
  - `assistenterpg-front/src/lib/api/suplemento-conteudos.ts`

## Matriz de autorizacao (comportamento atual)

- todos os controllers deste bloco usam `Auth: JWT` no nivel de classe.
- rotas de leitura (`GET`) permanecem com `Auth: JWT`.
- rotas de escrita (`POST/PATCH/DELETE`) usam `Auth: JWT+Admin` via `AdminGuard`.

## Endpoints

## Cla (`/clas`)

- `GET /clas`
- `GET /clas/:id`
- `POST /clas`
- `PATCH /clas/:id`
- `DELETE /clas/:id`

`CreateClaDto` (campos principais):

- `nome: string` (3..100)
- `descricao?: string` (max 2000)
- `grandeCla: boolean`
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`
- `tecnicasHereditariasIds?: int[]`

## Classes (`/classes`)

- `GET /classes`
- `GET /classes/:id`
- `GET /classes/:id/trilhas`
- `POST /classes`
- `PATCH /classes/:id`
- `DELETE /classes/:id`

`CreateClasseDto`:

- `nome: string` (obrigatorio, max 100)
- `descricao?: string | null` (max 2000)
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`

## Trilhas e caminhos (`/trilhas`)

Trilhas:

- `GET /trilhas?classeId=<int?>`
- `GET /trilhas/:id`
- `POST /trilhas`
- `PATCH /trilhas/:id`
- `DELETE /trilhas/:id`
- `GET /trilhas/:id/caminhos`
- `GET /trilhas/:id/habilidades`

Caminhos:

- `POST /trilhas/caminhos`
- `PATCH /trilhas/caminhos/:id`
- `DELETE /trilhas/caminhos/:id`

`CreateTrilhaDto` (principais):

- `classeId: int`
- `nome: string` (3..100)
- `descricao?: string` (max 1000)
- `requisitos?: json`
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`
- `habilidades?: [{ habilidadeId, nivelConcedido, caminhoId? }]`

`CreateCaminhoDto` (principais):

- `trilhaId: int`
- `nome: string` (3..100)
- `descricao?: string` (max 1000)
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`
- `habilidades?: [{ habilidadeId, nivelConcedido }]`

## Origens (`/origens`)

- `GET /origens`
- `GET /origens/:id`
- `POST /origens`
- `PATCH /origens/:id`
- `DELETE /origens/:id`

`CreateOrigemDto` (principais):

- `nome: string` (3..100)
- `descricao?: string` (max 2000)
- `requisitosTexto?: string` (max 500)
- `requerGrandeCla?: boolean`
- `requerTecnicaHeriditaria?: boolean`
- `bloqueiaTecnicaHeriditaria?: boolean`
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`
- `pericias?: [{ periciaId, tipo: FIXA|ESCOLHA, grupoEscolha? }]`
- `habilidadesIds?: int[]`

## Habilidades (`/habilidades`)

- `GET /habilidades/poderes-genericos`
- `GET /habilidades` (com filtros)
- `GET /habilidades/:id`
- `POST /habilidades`
- `PATCH /habilidades/:id`
- `DELETE /habilidades/:id`

`FilterHabilidadeDto`:

- `tipo?`, `origem?`, `fonte?`, `suplementoId?`, `busca?`, `pagina?`, `limite?`

`CreateHabilidadeDto` (principais):

- `nome: string` (3..100)
- `descricao?: string` (max 1000)
- `tipo: TipoHabilidade`
- `origem?: string`
- `requisitos?: json`
- `mecanicasEspeciais?: json`
- `fonte?: TipoFonte`
- `suplementoId?: int >= 1`
- `efeitosGrau?: [{ tipoGrauCodigo, valor?, escalonamentoPorNivel? }]`

## Regras de negocio

## Regras comuns

- nome duplicado e bloqueado em todos os catalogos principais.
- varios modulos validam consistencia de `fonte` x `suplementoId`:
  - se `suplementoId` for informado, suplemento precisa existir e `fonte` deve ser `SUPLEMENTO`.
  - se `fonte` for `SUPLEMENTO`, deve existir `suplementoId`.

## Cla

- valida se tecnicas fornecidas existem e sao hereditarias antes de salvar.
- `PATCH` pode substituir lista de tecnicas hereditarias (delete/recreate).
- `DELETE` bloqueia quando cla esta em uso por personagem base/campanha.

## Classes

- retorno de `GET /classes` e mapeado para `ClasseCatalogoDto` com:
  - pericias da classe
  - proficiencias
  - habilidades iniciais de nivel 1
- `DELETE` bloqueia quando classe esta em uso.

## Trilhas/caminhos

- criacao de trilha exige classe existente.
- `PATCH` de trilha aceita mudar `classeId` e regravar habilidades.
- `PATCH` de trilha/caminho aceita array vazio para limpar habilidades vinculadas.
- `DELETE` de trilha/caminho bloqueia quando ha personagens vinculados.

## Origens

- valida pericias e habilidades fornecidas antes de salvar.
- origem retorna tambem `habilidadesIniciais` (derivado de `habilidadesOrigem`).
- `PATCH` atualiza pericias/habilidades por rebuild (delete/recreate).
- `DELETE` bloqueia quando origem esta em uso.

## Habilidades

- valida `tipoGrauCodigo` em `efeitosGrau`.
- listagem retorna envelope `{ dados, paginacao }`.
- `GET /habilidades/poderes-genericos` reutiliza regra da engine de personagem para manter consistencia de calculo.
- `DELETE` bloqueia quando habilidade esta vinculada a personagens/classes/trilhas/origens.

## Erros esperados (codigos)

- cla:
  - `CLA_NOT_FOUND`
  - `CLA_NOME_DUPLICADO`
  - `CLA_TECNICAS_INVALIDAS`
  - `CLA_EM_USO`
- classes:
  - `CLASSE_NOT_FOUND`
  - `CLASSE_NOME_DUPLICADO`
  - `CLASSE_EM_USO`
- trilhas/caminhos:
  - `TRILHA_NOT_FOUND`
  - `TRILHA_CLASSE_NOT_FOUND`
  - `TRILHA_NOME_DUPLICADO`
  - `TRILHA_EM_USO`
  - `CAMINHO_NOT_FOUND`
  - `CAMINHO_NOME_DUPLICADO`
  - `CAMINHO_EM_USO`
- origens:
  - `ORIGEM_NOT_FOUND`
  - `ORIGEM_NOME_DUPLICADO`
  - `ORIGEM_PERICIAS_INVALIDAS`
  - `ORIGEM_HABILIDADES_INVALIDAS`
  - `ORIGEM_EM_USO`
- habilidades:
  - `HABILIDADE_NOT_FOUND`
  - `HABILIDADE_NOME_DUPLICADO`
  - `TIPO_GRAU_NOT_FOUND`
  - `HABILIDADE_EM_USO`

## Contrato de erro validado em teste de integracao

- trilhas:
  - `GET /trilhas?classeId=abc` -> `400`, `code: VALIDATION_ERROR` (parse de query)
  - `POST /trilhas` com `classeId` invalido -> `400`, `code: VALIDATION_ERROR`, `field: classeId`
- classes:
  - `GET /classes/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /classes` com `suplementoId` invalido -> `400`, `code: VALIDATION_ERROR`, `field: suplementoId`
- clas:
  - `GET /clas/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /clas` com `suplementoId` invalido -> `400`, `code: VALIDATION_ERROR`, `field: suplementoId`
- origens:
  - `GET /origens/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR`
  - `POST /origens` com `suplementoId` invalido -> `400`, `code: VALIDATION_ERROR`, `field: suplementoId`
- habilidades:
  - `GET /habilidades?pagina=0` -> `400`, `code: VALIDATION_ERROR`, `field: pagina`
  - `POST /habilidades` com `suplementoId` invalido -> `400`, `code: VALIDATION_ERROR`, `field: suplementoId`

## Consistencia com schema

Restricoes relevantes em `schema.prisma`:

- unicidade por nome:
  - `Cla.nome`, `Classe.nome`, `Trilha.nome`, `Caminho.nome`, `Origem.nome`, `Habilidade.nome` = `@unique`
- fonte/suplemento:
  - todos esses modelos possuem `fonte` + `suplementoId` + relacao opcional com `Suplemento`
- tabelas de relacionamento com `@@unique`:
  - `ClassePericia` (`classeId`, `periciaId`)
  - `ClasseProficiencia` (`classeId`, `proficienciaId`)
  - `OrigemPericia` (`origemId`, `periciaId`)
  - `HabilidadeClasse` (`classeId`, `habilidadeId`, `nivelConcedido`)
  - `HabilidadeTrilha` (`trilhaId`, `habilidadeId`, `nivelConcedido`)
  - `HabilidadeOrigem` (`origemId`, `habilidadeId`)
  - `HabilidadeEfeitoGrau` (`habilidadeId`, `tipoGrauCodigo`)

## Integracao frontend

Leitura de catalogos (wizard/fichas):

- `assistenterpg-front/src/lib/api/catalogos.ts`

Escrita para painel admin de suplementos:

- `assistenterpg-front/src/lib/api/suplemento-conteudos.ts`

## Ponto de atencao

- como a protecao de escrita agora depende de `AdminGuard`, qualquer regressao nesses decorators deve ser coberta por testes de metadata de guard.
