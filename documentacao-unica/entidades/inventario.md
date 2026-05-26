# Inventario (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento detalha o contrato real do módulo `inventário`, cruzando:

- controller: `assistenterpg-back/src/inventario/inventario.controller.ts`
- service/engine/mapper:
  - `assistenterpg-back/src/inventario/inventario.service.ts`
  - `assistenterpg-back/src/inventario/engine/inventario.engine.ts`
  - `assistenterpg-back/src/inventario/inventario.mapper.ts`
- DTOs:
  - `assistenterpg-back/src/inventario/dto/*.ts`
- excecoes:
  - `assistenterpg-back/src/common/exceptions/inventario.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models de inventario/equipamentos/modificacoes)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/inventario.ts`
  - `assistenterpg-front/src/lib/types/inventario.types.ts`

## Matriz de autorização

- todas as rotas usam `Auth: JWT` (`@UseGuards(JwtAuthGuard)` no nível de classe)

## Endpoints

- `GET /inventario/personagem/:personagemBaseId`
  - retorno: `ResumoInventarioCompleto`

- `POST /inventario/preview-adicionar`
  - body: `PreviewItemDto`
  - válida simulacao de espacos + grau xama sem persistir

- `POST /inventario/preview`
  - body: `PreviewItensInventarioDto`
  - calcula preview completo do wizard (sem persistir)

- `POST /inventario/adicionar`
  - body: `AdicionarItemDto`
  - cria item + vínculos de modificação + recálculo de estado

- `PATCH /inventario/item/:itemId`
  - body: `AtualizarItemDto`
  - altera quantidade/equipado/nome/notas com validações de limite

- `DELETE /inventario/item/:itemId`
  - remove item e seus vínculos de modificação

- `POST /inventario/aplicar-modificacao`
  - body: `AplicarModificacaoDto`
  - aplica modificação ao item, recalcula categoria/espaços/estado

- `POST /inventario/remover-modificacao`
  - body: `RemoverModificacaoDto`
  - remove modificação do item e recalcula estado

## Payloads aceitos (DTO)

## `PreviewItemDto`

- `personagemBaseId: int`
- `equipamentoId: int`
- `quantidade?: int >= 1` (default `1`, aceita string numérica)
- `modificacoes?: int[]`

## `PreviewItensInventarioDto`

- `forca: int`
- `prestigioBase: int`
- `itens: ItemPreviewDto[]`

`ItemPreviewDto`:

- `equipamentoId: int`
- `quantidade: int`
- `equipado: boolean`
- `modificacoes?: int[]`
- `nomeCustomizado?: string | null`

## `AdicionarItemDto`

- `personagemBaseId: int`
- `equipamentoId: int`
- `quantidade?: int >= 1`
  - default `1`
  - aceita string numérica
  - string com número parcial (ex.: `"2abc"`) gera erro de validação
- `equipado?: boolean`
  - default `false`
  - aceita boolean, `"true"/"false"` e `"1"/"0"`
  - valor inválido gera erro de validação (`VALIDATION_ERROR`)
- `modificacoes?: int[]`
- `nomeCustomizado?: string | null`
- `notas?: string | null`
- `ignorarLimitesGrauXama?: boolean` (default `false`)

## `AtualizarItemDto`

- `quantidade?: int >= 1` (sem fallback quando ausente)
  - aceita número inteiro ou string inteira (ex.: `"3"`)
  - string com número parcial (ex.: `"3abc"`) gera erro de validação
- `equipado?: boolean`
  - aceita boolean, `"true"/"false"` e `"1"/"0"`
  - valor inválido gera erro de validação
- `nomeCustomizado?: string`
- `notas?: string`

## `AplicarModificacaoDto` e `RemoverModificacaoDto`

- `itemId: int`
- `modificacaoId: int`

## Respostas principais

## `GET /inventario/personagem/:id`

Retorna `ResumoInventarioCompleto`:

- `espacos`:
  - `espacosTotal`
  - `espacosOcupados`
  - `espacosDisponiveis`
  - `sobrecarregado`
- `grauXama`:
  - `grauAtual`
  - `prestigioMinimoRequisito`
- `resumoPorCategoria[]`:
  - `categoria`
  - `quantidadeItens`
  - `quantidadeTotal`
  - `limiteGrauXama`
  - `podeAdicionarMais`
- `podeAdicionarCategoria0`
- `statsEquipados`:
  - `defesaTotal`
  - `danosTotais[]`
  - `reducoesDano[]`
  - `penalidadeCarga`

## `POST /inventario/preview-adicionar`

Retorna `PreviewAdicionarItemResponse`:

- `espacos`
- `grauXama`:
  - `valido`
  - `erros[]`
  - `grauAtual`
  - `limitesAtuais`
  - `itensPorCategoriaAtual`
- `stats` (parcial do estado atual)

## CRUD de item/modificação

- `adicionar`, `atualizar`, `aplicar-modificacao`, `remover-modificacao` retornam item mapeado (`ItemInventarioDto`)
- `remover` retorna `{ sucesso: true, mensagem: "Item removido com sucesso" }`

## Regras de negocio (service + engine)

## Ownership e acesso

- todas as operações de personagem validam ownership (`personagemBase.donoId`)
- acesso não autorizado retorna `INVENTARIO_SEM_PERMISSAO`

## Espacos e capacidade

- espaço unitário de item:
  - `equipamento.espacos + soma(incrementoEspacos das modificacoes)`
  - resultado mínimo `0`
- espaço total ocupado:
  - soma de `(espacoUnitario * quantidade)` para todos os itens
- capacidade normal:
  - `espacosInventarioBase + espacosInventarioExtra`
- limite absoluto para adição/alteração:
  - máximo `2x` da capacidade normal (`validarLimite2xCapacidade`)
- flag `sobrecarregado`:
  - verdadeiro quando ocupacao passa da capacidade normal

## Espaços extras por item

- engine calcula espaços extras por itens com `espacos=0` e texto de efeito indicando aumento de capacidade
- esse valor atualiza `personagemBase.espacosInventarioExtra`

## Sistema de vestir

Regras para itens equipados:

- máximo de `5` itens vestiveis equipados
- máximo de `2` vestimentas
  - vestimenta = acessorio com `tipoAcessorio=VESTIMENTA`
- violacao gera `INVENTARIO_LIMITE_VESTIR_EXCEDIDO`

## Categoria final por modificações

Progressão aplicada por quantidade de modificacoes:

- `CATEGORIA_0 -> CATEGORIA_4 -> CATEGORIA_3 -> CATEGORIA_2 -> CATEGORIA_1 -> ESPECIAL`

## Grau xama (prestigio)

- grau calculado por `prestigioBase`
- limites por categoria carregados de `GrauFeiticeiroLimite.limitesPorCategoria`
- `CATEGORIA_0` é tratada como ilimitada na validação de limites
- quando limites são excedidos:
  - preview retorna `grauXama.valido=false` com erros
  - create real bloqueia por padrão (`INVENTARIO_GRAU_XAMA_EXCEDIDO`)
  - pode ser ignorado somente com `ignorarLimitesGrauXama=true`

## Modificações

- ids de modificação devem existir
- modificação precisa ser compatível com equipamento (`EquipamentoModificacaoAplicavel`)
- item não pode ter duplicidade da mesma modificação
- ao aplicar/remover:
  - recalcula categoria e espaços do item
  - recalcula estado global do inventário

## Recálculo de estado após mudanças

Após `adicionar/atualizar/remover/aplicar/remover-modificacao`, o service executa:

- recálculo de `espacosOcupados`, `espacosInventarioExtra`, `sobrecarregado`
- recálculo de `defesaEquipamento` (somente itens equipados)
- rebuild de `PersonagemBaseResistencia` a partir dos itens equipados/modificações

## Erros esperados (principais códigos)

- `INVENTARIO_PERSONAGEM_NOT_FOUND`
- `INVENTARIO_SEM_PERMISSAO`
- `INVENTARIO_ITEM_NOT_FOUND`
- `INVENTARIO_EQUIPAMENTO_NOT_FOUND`
- `INVENTARIO_LIMITE_VESTIR_EXCEDIDO`
- `INVENTARIO_CAPACIDADE_EXCEDIDA`
- `INVENTARIO_ESPACOS_INSUFICIENTES`
- `INVENTARIO_GRAU_XAMA_EXCEDIDO`
- `INVENTARIO_MODIFICACAO_NOT_FOUND`
- `INVENTARIO_MODIFICACAO_INVALIDA`
- `INVENTARIO_MODIFICACAO_INCOMPATIVEL`
- `INVENTARIO_MODIFICACAO_DUPLICADA`
- `INVENTARIO_MODIFICACAO_NAO_APLICADA`

Tambem podem surgir erros de banco (via `database.exception.ts`), por exemplo:

- `DB_UNIQUE_VIOLATION`
- `DB_FOREIGN_KEY_VIOLATION`
- `DB_RECORD_NOT_FOUND`

Para erros de validação de DTO (`400`):

- `code` esperado: `VALIDATION_ERROR`
- `details.validationErrors`: lista de mensagens de validação
- `field`: quando possível, o backend infere o primeiro campo inválido a partir da mensagem (ex.: `quantidade`)
- cobertura de contrato HTTP inclui invalidações em:
  - `GET /inventario/personagem/:personagemBaseId` (param inválido)
  - `PATCH /inventario/item/:itemId`
  - `POST /inventario/adicionar`
  - `POST /inventario/aplicar-modificacao`
  - `POST /inventario/remover-modificacao`

## Consistência com schema (Prisma)

Modelos e constraints relevantes:

- `InventarioItemBase`
  - relação com `PersonagemBase` e `EquipamentoCatalogo`
  - campos: `quantidade`, `equipado`, `espacosCalculados`, `categoriaCalculada`, `nomeCustomizado`, `notas`
- `InventarioItemBaseModificacao`
  - `@@unique([itemId, modificacaoId])`
- `EquipamentoCatalogo`
  - `codigo @unique`
  - `categoria`, `espacos`, `tipo`, `complexidadeMaldicao`
  - relações com danos/reduções e itens de inventário
- `ModificacaoEquipamento`
  - `codigo @unique`
  - `incrementoEspacos`, `restricoes`, `efeitosMecanicos`
- `EquipamentoModificacaoAplicavel`
  - `@@unique([equipamentoId, modificacaoId])`
- `GrauFeiticeiroLimite`
  - `prestigioMin @unique`
  - `grau @unique`
  - `limitesPorCategoria` (json)

## Integracao frontend

- API client:
  - `assistenterpg-front/src/lib/api/inventario.ts`
- tipos:
  - `assistenterpg-front/src/lib/types/inventario.types.ts`
- `personagens-base` também envia itens iniciais via `itensInventario` em create/import
