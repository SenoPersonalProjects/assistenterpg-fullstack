# Tecnicas Amaldicoadas (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento detalha o contrato real de `tecnicas-amaldicoadas` cruzando:

- rotas/controller: `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts`
- regras de negocio/service: `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`
- validacao de entrada/DTOs: `assistenterpg-back/src/tecnicas-amaldicoadas/dto/*.ts`
- persistencia/schema: `assistenterpg-back/prisma/schema.prisma` (models `TecnicaAmaldicoada`, `HabilidadeTecnica`, `VariacaoHabilidade`)
- integracao frontend admin: `assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx` e `TecnicaHabilidadesModal.tsx`

## Autorizacao

- leitura (`GET`): `Auth: JWT`
- escrita (`POST`, `PATCH`, `DELETE`): `Auth: JWT+Admin`

## Endpoints

## Tecnicas

- `GET /tecnicas-amaldicoadas`
  - query: `FiltrarTecnicasDto`
  - booleans aceitos em query: `true/false`, `1/0`, `yes/no`, `on/off`
- `GET /tecnicas-amaldicoadas/:id`
- `GET /tecnicas-amaldicoadas/codigo/:codigo`
- `GET /tecnicas-amaldicoadas/cla/:claId`
- `POST /tecnicas-amaldicoadas`
- `PATCH /tecnicas-amaldicoadas/:id`
- `DELETE /tecnicas-amaldicoadas/:id`

Campos de create (principais):

- obrigatorios: `codigo`, `nome`, `descricao`, `tipo`
- opcionais: `hereditaria`, `clasHereditarios`, `linkExterno`, `fonte`, `suplementoId`, `requisitos`

## Habilidades da Tecnica

- `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
- `GET /tecnicas-amaldicoadas/habilidades/:id`
- `POST /tecnicas-amaldicoadas/habilidades`
- `PATCH /tecnicas-amaldicoadas/habilidades/:id`
- `DELETE /tecnicas-amaldicoadas/habilidades/:id`

Campos de create (principais):

- obrigatorios: `tecnicaId`, `codigo`, `nome`, `descricao`, `execucao`, `efeito`
- opcionais: `requisitos`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoDano`, `ordem`

## Variacoes de Habilidade

- `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
- `GET /tecnicas-amaldicoadas/variacoes/:id`
- `POST /tecnicas-amaldicoadas/variacoes`
- `PATCH /tecnicas-amaldicoadas/variacoes/:id`
- `DELETE /tecnicas-amaldicoadas/variacoes/:id`

Campos de create (principais):

- obrigatorios: `habilidadeTecnicaId`, `nome`, `descricao`
- opcionais: `substituiCustos`, `custoPE`, `custoEA`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`

## Regras de Negocio

## Tecnica

- `codigo` e `nome` nao podem repetir (validacao + `@unique` em schema)
- `hereditaria=true` exige `tipo=INATA`
- tecnica hereditaria exige pelo menos 1 cla vinculado
- `fonte/suplementoId` precisam ser coerentes:
  - `fonte=SUPLEMENTO` exige `suplementoId`
  - `fonte!=SUPLEMENTO` nao pode carregar `suplementoId`
- `DELETE` bloqueia tecnica em uso (personagem base/campanha)

## Habilidade Tecnica

- `tecnicaId` deve existir
- `codigo` da habilidade e globalmente unico (`@unique`)
- campos JSON (`requisitos`, `testesExigidos`, `dadosDano`, `escalonamentoDano`) sao normalizados para `null` quando vazios

## Variacao

- `habilidadeTecnicaId` deve existir
- variacao pertence sempre a uma habilidade tecnica existente
- campos JSON (`dadosDano`, `escalonamentoDano`, `requisitos`) sao normalizados/atualizados como opcionais

## Persistencia (Schema)

Restrições principais:

- `TecnicaAmaldicoada.codigo` -> `@unique`
- `TecnicaAmaldicoada.nome` -> `@unique`
- `HabilidadeTecnica.codigo` -> `@unique`
- `TecnicaCla` -> `@@unique([tecnicaId, claId])`
- `TecnicaAmaldicoada.hereditaria` -> `@default(false)`
- `HabilidadeTecnica.custoPE/custoEA/escalonamentoCustoEA` -> defaults `0`
- `VariacaoHabilidade.substituiCustos` -> `@default(false)`
- `ordem` em habilidade/variacao -> `@default(0)`

## Comportamento Esperado no Frontend

- painel admin de tecnicas:
  - listagem/filtro de tecnicas
  - CRUD de tecnica
  - modal dedicado para CRUD de habilidades/variacoes
- campos estruturados com editores guiados no modal:
  - `requisitos`
  - `testesExigidos`
  - `dadosDano`
  - `escalonamentoDano`
- fallback avancado para JSON livre (quando necessario)
