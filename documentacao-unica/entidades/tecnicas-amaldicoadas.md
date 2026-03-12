# Tecnicas Amaldicoadas (Contrato Detalhado)

Atualizado em: 2026-03-12

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
- opcionais: `hereditaria`, `clasHereditarios`, `linkExterno`, `fonte`, `suplementoId`, `requisitos`

## Habilidades da Tecnica

- `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
- `GET /tecnicas-amaldicoadas/habilidades/:id`
- `POST /tecnicas-amaldicoadas/habilidades`
- `PATCH /tecnicas-amaldicoadas/habilidades/:id`
- `DELETE /tecnicas-amaldicoadas/habilidades/:id`

Campos de create (principais):

- obrigatorios: `tecnicaId`, `codigo`, `nome`, `descricao`, `execucao`, `efeito`
- opcionais: `requisitos`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `testesExigidos`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `grauTipoGrauCodigo`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `ordem`

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
- opcionais: `substituiCustos`, `custoPE`, `custoEA`, `custoSustentacaoEA`, `custoSustentacaoPE`, `execucao`, `area`, `alcance`, `alvo`, `duracao`, `resistencia`, `dtResistencia`, `criticoValor`, `criticoMultiplicador`, `danoFlat`, `danoFlatTipo`, `dadosDano`, `escalonaPorGrau`, `escalonamentoCustoEA`, `escalonamentoCustoPE`, `escalonamentoTipo`, `escalonamentoEfeito`, `escalonamentoDano`, `efeitoAdicional`, `requisitos`, `ordem`

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
- campos JSON (`requisitos`, `testesExigidos`, `dadosDano`, `escalonamentoEfeito`, `escalonamentoDano`) sao normalizados para `null` quando vazios

## Variacao

- `habilidadeTecnicaId` deve existir
- variacao pertence sempre a uma habilidade tecnica existente
- campos JSON (`dadosDano`, `escalonamentoEfeito`, `escalonamentoDano`, `requisitos`) sao normalizados/atualizados como opcionais

## Importacao e Exportacao JSON

- schema atual:
  - `schema`: `tecnicas-amaldicoadas.import-export`
  - `schemaVersion`: `1`
- formato esperado:
  - `modo`: `UPSERT`
  - `tecnicas`: array de tecnicas com estrutura aninhada de `habilidades` e `variacoes`
  - flags opcionais:
    - `substituirHabilidadesAusentes`
    - `substituirVariacoesAusentes`
- regra de upsert:
  - tecnica por `codigo`
  - habilidade por `codigo`
  - variacao por `id` (quando informado) ou `nome` dentro da habilidade
- retorno da importacao:
  - total recebido
  - contadores de criacao/atualizacao/remocao por nivel (`tecnicas`, `habilidades`, `variacoes`)
  - lista de avisos (`avisos`)
- guia oficial:
  - `GET /tecnicas-amaldicoadas/importar-json/guia` retorna exemplos minimo/completo e campos obrigatorios

Exemplo minimo:

```json
{
  "schema": "tecnicas-amaldicoadas.import-export",
  "schemaVersion": 1,
  "modo": "UPSERT",
  "tecnicas": [
    {
      "codigo": "TEC_EXEMPLO",
      "nome": "Tecnica Exemplo",
      "descricao": "Descricao resumida da tecnica.",
      "tipo": "INATA",
      "hereditaria": false,
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
- `TecnicaAmaldicoada.hereditaria` -> `@default(false)`
- `HabilidadeTecnica.custoPE/custoEA/escalonamentoCustoEA/escalonamentoCustoPE` -> defaults `0`
- `HabilidadeTecnica.escalonamentoTipo` -> default `OUTRO`
- `HabilidadeTecnica.custoSustentacaoEA` -> opcional (`null`), com fallback de `1` no runtime de sessao quando `duracao` for sustentada
- `HabilidadeTecnica.custoSustentacaoPE` -> opcional (`null`), com fallback de `0` no runtime de sessao quando `duracao` for sustentada
- `VariacaoHabilidade.substituiCustos` -> `@default(false)`
- `VariacaoHabilidade.custoSustentacaoEA` -> opcional (`null`), podendo sobrescrever custo por rodada da habilidade base
- `VariacaoHabilidade.custoSustentacaoPE` -> opcional (`null`), podendo sobrescrever custo em `PE` por rodada da habilidade base
- `ordem` em habilidade/variacao -> `@default(0)`

## Comportamento Esperado no Frontend

- painel admin de tecnicas:
  - listagem/filtro de tecnicas
  - CRUD de tecnica
  - importacao/exportacao JSON (guia + exportar filtradas + exportar por linha + importar arquivo/conteudo)
  - modal dedicado para CRUD de habilidades/variacoes
- painel admin de habilidades:
  - CRUD de poderes genericos continua no modulo `habilidades`
  - fluxo de criacao unificado: o botao `Nova habilidade` abre seletor de tipo (`PODER_GENERICO`, `HABILIDADE_TECNICA_INATA`, `HABILIDADE_TECNICA_NAO_INATA`)
  - quando tipo for tecnica, o seletor exige tecnica alvo (inata/nao inata) e abre o CRUD dedicado da tecnica escolhida
  - quando tipo for poder generico, abre diretamente o editor generico no mesmo modulo
- formulario de homebrew de tecnicas:
  - usa o mesmo padrao guiado para `execucao`, `area`, `alcance` e `duracao`
  - permite fallback para texto livre em `alcance` e `duracao` quando necessario
- campos estruturados com editores guiados no modal:
  - `requisitos`
  - `testesExigidos`
  - `dadosDano`
  - `escalonamentoDano`
- campos semiestruturados com presets + fallback livre:
  - `alcance`: `PESSOAL`, `TOQUE`, `CORPO A CORPO (1,5m)`, `CURTO (9m)`, `MEDIO (18m)`, `LONGO (36m)`, `EXTREMO (90m)`, `ILIMITADO` ou texto personalizado
  - `duracao`: `INSTANTANEA`, `CENA`, `SUSTENTADA`, `PERMANENTE` ou texto personalizado
- fallback avancado para JSON livre (quando necessario)

## Seed base de tecnicas nao-inatas

- foi adicionado seed idempotente para tecnicas nao-inatas do sistema base em:
  - `assistenterpg-back/prisma/seeds/tecnicas/tecnicas-nao-inatas.ts`
- esse seed cria/atualiza:
  - containers `TecnicaAmaldicoada` com `tipo=NAO_INATA`, `fonte=SISTEMA_BASE`, `hereditaria=false`
  - `HabilidadeTecnica` por tecnica (com `codigo` unico global)
  - `VariacaoHabilidade` por habilidade
- ao reseedar, o processo remove habilidades/variacoes obsoletas dentro das tecnicas nao-inatas seedadas para evitar legado incorreto.
- o pipeline principal de seed agora executa:
  - `seedTecnicasInatas(prisma)`
  - `seedTecnicasNaoInatas(prisma)`
  - arquivo: `assistenterpg-back/prisma/seeds.ts`
- no fluxo de personagem-base, tecnicas nao-inatas/habilidades/variacoes sao habilitadas automaticamente pelos graus de aprimoramento (via `requisitos.graus`), sem escolha manual do jogador na ficha.
- no detalhe de personagem-base, a tecnica inata selecionada tambem e retornada com suas habilidades/variacoes para exibicao direta na aba de poderes.
- no fluxo de sessao de campanha, uso de habilidade aplica custo imediato e, quando sustentada, registra custo por rodada com base em `custoSustentacaoEA` + `custoSustentacaoPE` (habilidade/variacao), com fallback `1 EA/rodada` + `0 PE/rodada`.
- no fluxo de sessao, acúmulos suportam custo adicional de `EA` e `PE` (`escalonamentoCustoEA` + `escalonamentoCustoPE`) e salvam resumo tipado por `escalonamentoTipo`/`escalonamentoEfeito` no evento de timeline.
