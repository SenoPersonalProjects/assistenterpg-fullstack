# Suplementos e Homebrews (Contrato Detalhado)

Atualizado em: 2026-03-09

## Escopo

Este documento cobre os módulos `suplementos` e `homebrews`, cruzando:

- controllers:
  - `assistenterpg-back/src/suplementos/suplementos.controller.ts`
  - `assistenterpg-back/src/homebrews/homebrews.controller.ts`
- services:
  - `assistenterpg-back/src/suplementos/suplementos.service.ts`
  - `assistenterpg-back/src/homebrews/homebrews.service.ts`
- DTOs:
  - `assistenterpg-back/src/suplementos/dto/*.ts`
  - `assistenterpg-back/src/homebrews/dto/**/*.ts`
- validators homebrew:
  - `assistenterpg-back/src/homebrews/validators/*.ts`
- exceptions:
  - `suplemento.exception.ts`
  - `homebrew.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models `Suplemento`, `UsuarioSuplemento`, `Homebrew`)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/suplementos.ts`
  - `assistenterpg-front/src/lib/api/homebrews.ts`

## Matriz de autorizacao

## Suplementos

- todas as rotas exigem JWT.
- rotas admin (`JWT+Admin`):
  - `POST /suplementos`
  - `PATCH /suplementos/:id`
  - `DELETE /suplementos/:id`

## Homebrews

- todas as rotas exigem JWT.
- permissões por regra de negocio no service:
  - leitura de homebrew não publicado: apenas dono ou admin
  - editar/deletar/publicar/arquivar: apenas dono ou admin

## Endpoints

## Suplementos (`/suplementos`)

Leitura/uso:

- `GET /suplementos` (filtros opcionais)
- `GET /suplementos/:id`
- `GET /suplementos/codigo/:codigo`
- `GET /suplementos/me/ativos`
- `POST /suplementos/:id/ativar`
- `DELETE /suplementos/:id/desativar`

Admin:

- `POST /suplementos`
  - body `CreateSuplementoDto`
- `PATCH /suplementos/:id`
  - body `UpdateSuplementoDto` (sem `codigo`)
- `DELETE /suplementos/:id`

Filtros de listagem (`FiltrarSuplementosDto`):

- `nome?`, `codigo?`, `status?`, `autor?`, `apenasAtivos?`
- `apenasAtivos` aceita `true/false/1/0/yes/no/on/off`; valor inválido retorna `400 VALIDATION_ERROR` (com parse estrito no valor bruto da query)

## Homebrews (`/homebrews`)

- `GET /homebrews/meus`
- `GET /homebrews/codigo/:codigo`
- `GET /homebrews`
- `GET /homebrews/:id`
- `POST /homebrews`
- `PATCH /homebrews/:id`
- `DELETE /homebrews/:id`
- `PATCH /homebrews/:id/publicar`
- `PATCH /homebrews/:id/arquivar`

Filtros de listagem (`FiltrarHomebrewsDto`):

- `nome?`, `tipo?`, `status?`, `usuarioId?`, `apenasPublicados?`, `pagina?`, `limite?`
- `apenasPublicados` aceita `true/false/1/0/yes/no/on/off`; valor inválido retorna `400 VALIDATION_ERROR` (com parse estrito no valor bruto da query)

## Payloads de escrita

## `CreateSuplementoDto`

- `codigo`, `nome` obrigatórios
- `descricao?`, `versao?`, `status?`, `icone?`, `banner?`, `tags?`, `autor?`

## `CreateHomebrewDto`

- base:
  - `nome` (obrigatório)
  - `descricao?`
  - `status?` (default `RASCUNHO`)
  - `tags?`
  - `versao?`
- específico:
  - `tipo` (`TipoHomebrewConteudo`) obrigatório
  - `dados` obrigatório (estrutura varia pelo `tipo`)

## Regras de negocio

## Suplementos

- `codigo` único.
- ativação do suplemento por usuário:
  - exige suplemento existente
  - exige `status=PUBLICADO`
  - bloqueia ativação duplicada para o mesmo usuário
- desativação exige que suplemento esteja ativo para o usuário.
- exclusão de suplemento bloqueada se houver conteúdo vinculado (cla/classes/trilhas/caminhos/origens/equipamentos/habilidades/técnicas/modificações).

## Homebrews

- codigo é gerado no backend: `USER_<usuarioId>_HB_<timestamp>`.
- validação dos dados:
  - validação estrutural por tipo (`validateHomebrewDados`)
  - validação custom complementar por tipo (`validate-homebrew-*.ts`)
  - para `tipo=EQUIPAMENTO`, `dados.tipo` é obrigatório e define o DTO de validação.
  - `EQUIPAMENTO.GENERICO` é aceito e usa apenas campos base (`tipo`, `categoria`, `espacos`, `tipoUso?`, `efeito?`).
  - `EQUIPAMENTO.FERRAMENTA_AMALDICOADA`:
    - `tipoAmaldicoado` aceito: `ARMA`, `PROTECAO`, `ARTEFATO` (não aceita `ITEM`).
    - exige um subtipo correspondente (`armaAmaldicoada`, `protecaoAmaldicoada` ou `artefatoAmaldicoado`).
    - em `armaAmaldicoada.dadosArma` e `protecaoAmaldicoada.dadosProtecao`, os campos base de equipamento não são exigidos (apenas os campos específicos).
  - `EQUIPAMENTO.ITEM_AMALDICOADO` aceita apenas `tipoAmaldicoado=ITEM`.
  - mensagens de erro de validação de `dados` retornam caminhos detalhados (incluindo campos aninhados).
- leitura:
  - não publicado só para dono/admin
  - publicado pode ser lido por usuários autenticados
- update:
  - se `dados` mudar, versão é incrementada automaticamente (patch semver)
  - se `tipo` mudar (mesmo sem `dados` no patch), os `dados` persistidos são revalidados com o novo tipo e a versão é incrementada.
- publicar:
  - bloqueia se já estiver publicado
- arquivar:
  - troca status para `ARQUIVADO`

## Erros esperados (codigos)

- suplementos:
  - `SUPLEMENTO_NOT_FOUND`
  - `SUPLEMENTO_CODIGO_DUPLICADO`
  - `SUPLEMENTO_COM_CONTEUDO_VINCULADO`
  - `SUPLEMENTO_NAO_PUBLICADO`
  - `SUPLEMENTO_JA_ATIVO`
  - `SUPLEMENTO_NAO_ATIVO`
- homebrews:
  - `HOMEBREW_NOT_FOUND`
  - `HOMEBREW_JA_PUBLICADO`
  - `HOMEBREW_DADOS_INVALIDOS`
  - `HOMEBREW_SEM_PERMISSAO`

## Contrato de erro validado em teste de integracao

- suplementos:
  - `GET /suplementos?apenasAtivos=talvez` -> `400`, `code: VALIDATION_ERROR`, `field: apenasAtivos`
  - `POST /suplementos` com `icone` inválido -> `400`, `code: VALIDATION_ERROR`, `field: icone`
  - `GET /suplementos/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR` (mensagem de `ParseIntPipe`)
- homebrews:
  - `GET /homebrews?pagina=0` -> `400`, `code: VALIDATION_ERROR`, `field: pagina`
  - `POST /homebrews` com `tipo` inválido -> `400`, `code: VALIDATION_ERROR`, `field: tipo`
  - `GET /homebrews/:id` com `id` inválido -> `400`, `code: VALIDATION_ERROR` (mensagem de `ParseIntPipe`)

## Consistencia com schema

- `Suplemento.codigo` e `@unique`.
- relacionamento usuário-suplemento:
  - `UsuarioSuplemento` com `@@unique([usuarioId, suplementoId])`.
- `Homebrew`:
  - `dados` e `Json` obrigatório
  - `status` usa enum `StatusPublicacao`
  - `tipo` usa enum `TipoHomebrewConteudo`
  - unicidade por usuário/codigo: `@@unique([usuarioId, codigo])`

## Integracao frontend

- suplementos:
  - `assistenterpg-front/src/lib/api/suplementos.ts`
- homebrews:
  - `assistenterpg-front/src/lib/api/homebrews.ts`
  - listagem em `assistenterpg-front/src/app/homebrews/page.tsx` com preview modal antes da navegação completa
  - componentes de UI:
    - `assistenterpg-front/src/components/homebrew/HomebrewPreviewModal.tsx`
    - `assistenterpg-front/src/components/homebrew/homebrewUi.ts`
    - `assistenterpg-front/src/components/homebrew/HomebrewCard.tsx`

Observacao de contrato front/back:

- os clientes frontend já usam `pagina/limite` (PT-BR) para listagem de homebrews, alinhado ao DTO do backend.
