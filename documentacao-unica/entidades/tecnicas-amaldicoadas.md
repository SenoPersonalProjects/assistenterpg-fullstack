# Técnicas Amaldicoadas (Contrato Detalhado)

Atualizado em: 2026-03-12

## Escopo

Este documento detalha o contrato real de `tecnicas-amaldicoadas` cruzando:

- rotas/controller: `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts`
- regras de negocio/service: `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`
- validação de entrada/DTOs: `assistenterpg-back/src/tecnicas-amaldicoadas/dto/*.ts`
- persistencia/schema: `assistenterpg-back/prisma/schema.prisma` (models `TecnicaAmaldicoada`, `HabilidadeTecnica`, `VariacaoHabilidade`)
- integracao frontend admin: `assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx` e `TecnicaHabilidadesModal.tsx`

## Autorizacao

- leitura (`GET`): `Auth: JWT`
- escrita (`POST`, `PATCH`, `DELETE`): `Auth: JWT+Admin`

## Endpoints

## Técnicas

- `GET /tecnicas-amaldicoadas`
  - query: `FiltrarTecnicasDto`
  - booleans aceitos em query: `true/false`, `1/0`, `yes/no`, `on/off`
- `GET /tecnicas-amaldicoadas/importar-json/guia`
- `GET /tecnicas-amaldicoadas/exportar-json`
  - query opcional: filtros de `FiltrarTecnicasDto` + `id` + `incluirIds`
- `GET /tecnicas-amaldicoadas/:id`
- `GET /tecnicas-amaldicoadas/codigo/:codigo`
- `GET /tecnicas-amaldicoadas/cla/:claId`
- `POST /tecnicas-amaldicoadas/importar-json`
- `POST /tecnicas-amaldicoadas`
- `PATCH /tecnicas-amaldicoadas/:id`
- `DELETE /tecnicas-amaldicoadas/:id`

Campos de create (principais):

- obrigatorios: `codigo`, `nome`, `descricao`, `tipo`
- opcionais: `hereditária`, `clasHereditarios`, `linkExterno`, `fonte`, `suplementoId`, `requisitos`

## Habilidades da Técnica

- `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
- `GET /tecnicas-amaldicoadas/habilidades/:id`
- `POST /tecnicas-amaldicoadas/habilidades`
- `PATCH /tecnicas-amaldicoadas/habilidades/:id`
- `DELETE /tecnicas-amaldicoadas/habilidades/:id`

Campos de create (principais):

- obrigatorios: `tecnicaId`, `codigo`, `nome`, `descricao`, `execucao`, `efeito`
- opcionais: `requisitos`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `críticoValor`, `críticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `ordem`

Valores suportados em `execucao`:

- `ACAO_LIVRE`
- `ACAO_MOVIMENTO`
- `ACAO_PADRAO`
- `ACAO_COMPLETA`
- `RITUAL_ETAPAS`
- `AO_ATACAR`
- `REACAO`
- `REACAO_ESPECIAL`
- `REACAO_BLOQUEIO`
- `REACAO_ESQUIVA`
- `SUSTENTADA`

## Variacoes de Habilidade

- `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
- `GET /tecnicas-amaldicoadas/variacoes/:id`
- `POST /tecnicas-amaldicoadas/variacoes`
- `PATCH /tecnicas-amaldicoadas/variacoes/:id`
- `DELETE /tecnicas-amaldicoadas/variacoes/:id`

Campos de create (principais):

- obrigatorios: `habilidadeTecnicaId`, `nome`, `descricao`
- opcionais: `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `críticoValor`, `críticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`

## Regras de Negocio

## Técnica

- `codigo` e `nome` não podem repetir (validação + `@unique` em schema)
- `hereditária=true` exige `tipo=INATA`
- técnica hereditária exige pelo menos 1 cla vinculado
- `fonte/suplementoId` precisam ser coerentes:
  - `fonte=SUPLEMENTO` exige `suplementoId`
  - `fonte!=SUPLEMENTO` não pode carregar `suplementoId`
- `DELETE` bloqueia técnica em uso (personagem base/campanha)

## Habilidade Técnica

- `tecnicaId` deve existir
- `codigo` da habilidade e globalmente único (`@unique`)
- campos JSON (`requisitos`, `testesExigidos`, `dadosDano`, `escalonamentoEfeito`, `escalonamentoDano`) são normalizados para `null` quando vazios

## Variacao

- `habilidadeTecnicaId` deve existir
- variação pertence sempre a uma habilidade técnica existente
- campos JSON (`dadosDano`, `escalonamentoEfeito`, `escalonamentoDano`, `requisitos`) são normalizados/atualizados como opcionais

## Importacao e Exportacao JSON

- schema atual:
  - `schema`: `tecnicas-amaldicoadas.import-export`
  - `schemaVersion`: `1`
- formato esperado:
  - `modo`: `UPSERT`
  - `técnicas`: array de técnicas com estrutura aninhada de `habilidades` e `variações`
  - flags opcionais:
    - `substituirHabilidadesAusentes`
    - `substituirVariacoesAusentes`
- regra de upsert:
  - técnica por `codigo`
  - habilidade por `codigo`
  - variação por `id` (quando informado) ou `nome` dentro da habilidade
- retorno da importação:
  - total recebido
  - contadores de criação/atualização/remoção por nível (`técnicas`, `habilidades`, `variações`)
  - lista de avisos (`avisos`)
- guia oficial:
  - `GET /tecnicas-amaldicoadas/importar-json/guia` retorna exemplos mínimo/completo e campos obrigatorios

Exemplo mínimo:

```json
{
  "schema": "tecnicas-amaldicoadas.import-export",
  "schemaVersion": 1,
  "modo": "UPSERT",
  "técnicas": [
    {
      "codigo": "TEC_EXEMPLO",
      "nome": "Técnica Exemplo",
      "descricao": "Descricao resumida da técnica.",
      "tipo": "INATA",
      "hereditária": false,
      "fonte": "SISTEMA_BASE",
      "habilidades": []
    }
  ]
}
```

## Persistencia (Schema)

Restrições principais:

- `TecnicaAmaldicoada.codigo` -> `@unique`
- `TecnicaAmaldicoada.nome` -> `@unique`
- `HabilidadeTecnica.codigo` -> `@unique`
- `TecnicaCla` -> `@@unique([tecnicaId, claId])`
- `TecnicaAmaldicoada.hereditária` -> `@default(false)`
- `HabilidadeTecnica.custoPE/custoEA/escalonamentoCustoEA/escalonamentoCustoPE` -> defaults `0`
- `HabilidadeTecnica.escalonamentoTipo` -> default `OUTRO`
- `HabilidadeTecnica.custoSustentacaoEA` -> opcional (`null`), com fallback de `1` no runtime de sessão quando `duracao` for sustentada
- `HabilidadeTecnica.custoSustentacaoPE` -> opcional (`null`), com fallback de `0` no runtime de sessão quando `duracao` for sustentada
- `VariacaoHabilidade.substituiCustos` -> `@default(false)`
- `VariacaoHabilidade.custoSustentacaoEA` -> opcional (`null`), podendo sobrescrever custo por rodada da habilidade base
- `VariacaoHabilidade.custoSustentacaoPE` -> opcional (`null`), podendo sobrescrever custo em `PE` por rodada da habilidade base
- `ordem` em habilidade/variação -> `@default(0)`

## Comportamento Esperado no Frontend

- painel admin de técnicas:
  - listagem/filtro de técnicas
  - CRUD de técnica
  - importação/exportação JSON (guia + exportar filtradas + exportar por linha + importar arquivo/conteúdo)
  - modal dedicado para CRUD de habilidades/variacoes
- painel admin de habilidades:
  - CRUD de poderes genéricos continua no módulo `habilidades`
  - fluxo de criação unificado: o botão `Nova habilidade` abre seletor de tipo (`PODER_GENERICO`, `HABILIDADE_TECNICA_INATA`, `HABILIDADE_TECNICA_NAO_INATA`)
  - quando tipo for técnica, o seletor exige técnica alvo (inata/não inata) e abre o CRUD dedicado da técnica escolhida
  - quando tipo for poder genérico, abre diretamente o editor genérico no mesmo módulo
- formulario de homebrew de técnicas:
  - usa o mesmo padrão guiado para `execucao`, `area`, `alcance` e `duracao`
  - permite fallback para texto livre em `alcance` e `duracao` quando necessário
- campos estruturados com editores guiados no modal:
  - `requisitos`
  - `testesExigidos`
  - `dadosDano`
  - `escalonamentoDano`
- campos semiestruturados com presets + fallback livre:
  - `alcance`: `PESSOAL`, `TOQUE`, `CORPO A CORPO (1,5m)`, `CURTO (9m)`, `MEDIO (18m)`, `LONGO (36m)`, `EXTREMO (90m)`, `ILIMITADO` ou texto personalizado
  - `duracao`: `INSTANTANEA`, `CENA`, `SUSTENTADA`, `PERMANENTE` ou texto personalizado
- fallback avancado para JSON livre (quando necessário)

## Seed base de técnicas não-inatas

- foi adicionado seed idempotente para técnicas não-inatas do sistema base em:
  - `assistenterpg-back/prisma/seeds/tecnicas/tecnicas-nao-inatas.ts`
- esse seed cria/atualiza:
  - containers `TecnicaAmaldicoada` com `tipo=NAO_INATA`, `fonte=SISTEMA_BASE`, `hereditária=false`
  - `HabilidadeTecnica` por técnica (com `codigo` único global)
  - `VariacaoHabilidade` por habilidade
- ao reseedar, o processo remove habilidades/variacoes obsoletas dentro das técnicas não-inatas seedadas para evitar legado incorreto.
- o pipeline principal de seed agora executa:
  - `seedTecnicasInatas(prisma)`
  - `seedTecnicasNaoInatas(prisma)`
  - arquivo: `assistenterpg-back/prisma/seeds.ts`
- no fluxo de personagem-base, técnicas não-inatas/habilidades/variacoes são habilitadas automaticamente pelos graus de aprimoramento (via `requisitos.graus`), sem escolha manual do jogador na ficha.
- no detalhe de personagem-base, a técnica inata selecionada também é retornada com suas habilidades/variacoes para exibição direta na aba de poderes.
- no fluxo de sessão de campanha, uso de habilidade aplica custo imediato e, quando sustentada, registra custo por rodada com base em `custoSustentacaoEA` + `custoSustentacaoPE` (habilidade/variação), com fallback `1 EA/rodada` + `0 PE/rodada`.
- no fluxo de sessão, acúmulos suportam custo adicional de `EA` e `PE` (`escalonamentoCustoEA` + `escalonamentoCustoPE`) é salvam resumo tipado por `escalonamentoTipo`/`escalonamentoEfeito` no evento de timeline.
