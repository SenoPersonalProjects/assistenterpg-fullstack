# Equipamentos e Modificacoes (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento cobre `equipamentos` e `modificacoes`, cruzando:

- controllers:
  - `assistenterpg-back/src/equipamentos/equipamentos.controller.ts`
  - `assistenterpg-back/src/modificacoes/modificacoes.controller.ts`
- services:
  - `assistenterpg-back/src/equipamentos/equipamentos.service.ts`
  - `assistenterpg-back/src/modificacoes/modificacoes.service.ts`
- DTOs:
  - `assistenterpg-back/src/equipamentos/dto/*.ts`
  - `assistenterpg-back/src/modificacoes/dto/*.ts`
- exceptions:
  - `equipamento.exception.ts`
  - `modificacao.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models de catalogo, modificacoes e inventario)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/equipamentos.ts`
  - `assistenterpg-front/src/lib/api/modificacoes.ts`
  - `assistenterpg-front/src/lib/api/suplemento-conteudos.ts`

## Matriz de autorizacao

- `equipamentos`
  - leitura (`GET`): publica
  - escrita (`POST`, `PUT`, `DELETE`): `JWT+Admin`
- `modificacoes`
  - leitura (`GET`): `JWT`
  - escrita (`POST`, `PATCH`, `DELETE`): `JWT+Admin`

## Endpoints

## Equipamentos (`/equipamentos`)

- `GET /equipamentos`
  - filtros: `FiltrarEquipamentosDto`
  - resposta: `{ dados, paginacao }`
- `GET /equipamentos/:id`
- `GET /equipamentos/codigo/:codigo`
- `POST /equipamentos` (`JWT+Admin`)
  - body `CriarEquipamentoDto`
- `PUT /equipamentos/:id` (`JWT+Admin`)
  - body `AtualizarEquipamentoDto` (partial)
- `DELETE /equipamentos/:id` (`JWT+Admin`)
  - retorno: `204 No Content`

### Filtros de equipamentos

- `tipo?`, `fontes?` (csv), `suplementoId?`
- `complexidadeMaldicao?`
- `proficienciaArma?`, `proficienciaProtecao?`
- `alcance?`, `tipoAcessorio?`
- `categoria?` (0..4)
- `apenasAmaldicoados?` (parse robusto de boolean: `true/false/1/0/yes/no/on/off`)
- `busca?`
- `pagina?` (min 1), `limite?` (1..100)

## Modificacoes (`/modificacoes`)

- `GET /modificacoes` (`JWT`)
  - filtros: `FiltrarModificacoesDto`
  - resposta: `{ dados, paginacao }`
- `GET /modificacoes/:id` (`JWT`)
- `GET /modificacoes/equipamento/:equipamentoId/compativeis` (`JWT`)
- `POST /modificacoes` (`JWT+Admin`)
  - body `CreateModificacaoDto`
- `PATCH /modificacoes/:id` (`JWT+Admin`)
  - body `UpdateModificacaoDto` (partial)
- `DELETE /modificacoes/:id` (`JWT+Admin`)

### Filtros de modificacoes

- `tipo?`, `fontes?` (csv), `suplementoId?`, `busca?`
- `pagina?` (min 1), `limite?` (1..100)

## Payloads de escrita

## `CriarEquipamentoDto` (resumo)

Obrigatorios:

- `codigo` (3..50)
- `nome` (3..200)
- `tipo` (`TipoEquipamento`)

Comuns opcionais:

- `fonte?`, `suplementoId?`
- `descricao?`, `categoria?`, `espacos?`, `complexidadeMaldicao?`
- `tipoUso?`, `tipoAmaldicoado?`, `efeito?`, `efeitoMaldicao?`
- `requerFerramentasAmaldicoadas?`

Campos especificos por tipo tambem sao aceitos (arma/protecao/acessorio/municao/explosivo).

## `CreateModificacaoDto` (resumo)

- `codigo` (3..50)
- `nome` (3..100)
- `descricao?` (max 1000)
- `tipo` (`TipoModificacao`)
- `incrementoEspacos` (int)
- `restricoes?` (`RestricoesModificacao`)
- `efeitosMecanicos?` (json)
- `fonte?`, `suplementoId?`
- `equipamentosCompativeisIds?` (int[])

## Regras de negocio

## Equipamentos

- listagem aplica filtros dinamicos + busca textual (`nome`, `descricao`, `codigo`).
- quando `apenasAmaldicoados=true`, inclui:
  - `ITEM_AMALDICOADO`
  - `FERRAMENTA_AMALDICOADA`
  - ou `complexidadeMaldicao != NENHUMA`
- fonte/suplemento e validado no create/update:
  - suplemento informado exige `fonte=SUPLEMENTO`
  - `fonte=SUPLEMENTO` exige suplemento.
- `DELETE` bloqueia se equipamento esta em uso em inventario base/campanha.

## Modificacoes

- codigo duplicado e bloqueado.
- create/update validam existencia de `equipamentosCompativeisIds`.
- `DELETE` bloqueia se modificacao estiver em uso em inventario.
- `validarRestricoes` avalia compatibilidade por tipo, categoria, complexidade, proficiencia, alcance e conflitos de codigo.

## Pontos de atencao

- em `buscarCompativeisComEquipamento`, a busca inicial agora considera vinculo explicito (`equipamentosApplicaveis`) ou ausencia de vinculo; a decisao final continua passando por `validarRestricoes`.
- `GET /equipamentos` aceita filtro numerico de categoria `0..4`; categoria `ESPECIAL` nao possui filtro numerico dedicado nesse endpoint.

## Erros esperados (codigos)

- equipamentos:
  - `EQUIPAMENTO_NOT_FOUND`
  - `EQUIPAMENTO_CODIGO_DUPLICADO`
  - `EQUIPAMENTO_EM_USO`
- modificacoes:
  - `MODIFICACAO_NOT_FOUND`
  - `MODIFICACAO_CODIGO_DUPLICADO`
  - `MODIFICACAO_SUPLEMENTO_NOT_FOUND`
  - `MODIFICACAO_FONTE_INVALIDA`
  - `MODIFICACAO_EQUIPAMENTOS_INVALIDOS`
  - `MODIFICACAO_EM_USO`
  - `MODIFICACAO_EQUIPAMENTO_NOT_FOUND`

## Consistencia com schema

- `EquipamentoCatalogo.codigo` e `@unique`.
- `ModificacaoEquipamento.codigo` e `@unique`.
- relacao N:N de compatibilidade:
  - `EquipamentoModificacaoAplicavel` com `@@unique([equipamentoId, modificacaoId])`.
- relacoes de inventario com modificacoes tambem sao unicas por item:
  - `InventarioItemBaseModificacao @@unique([itemId, modificacaoId])`
  - `InventarioItemCampanhaModificacao @@unique([itemId, modificacaoId])`

## Integracao frontend

- clientes de leitura wizard/listagens:
  - `assistenterpg-front/src/lib/api/equipamentos.ts`
  - `assistenterpg-front/src/lib/api/modificacoes.ts`
- clientes de escrita admin:
  - `assistenterpg-front/src/lib/api/suplemento-conteudos.ts`
