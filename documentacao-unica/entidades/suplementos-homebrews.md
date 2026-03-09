# Suplementos e Homebrews (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento cobre os modulos `suplementos` e `homebrews`, cruzando:

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
- permissoes por regra de negocio no service:
  - leitura de homebrew nao publicado: apenas dono ou admin
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
- `apenasAtivos` aceita `true/false/1/0/yes/no/on/off`; valor invalido retorna `400 VALIDATION_ERROR` (com parse estrito no valor bruto da query)

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
- `apenasPublicados` aceita `true/false/1/0/yes/no/on/off`; valor invalido retorna `400 VALIDATION_ERROR` (com parse estrito no valor bruto da query)

## Payloads de escrita

## `CreateSuplementoDto`

- `codigo`, `nome` obrigatorios
- `descricao?`, `versao?`, `status?`, `icone?`, `banner?`, `tags?`, `autor?`

## `CreateHomebrewDto`

- base:
  - `nome` (obrigatorio)
  - `descricao?`
  - `status?` (default `RASCUNHO`)
  - `tags?`
  - `versao?`
- especifico:
  - `tipo` (`TipoHomebrewConteudo`) obrigatorio
  - `dados` obrigatorio (estrutura varia pelo `tipo`)

## Regras de negocio

## Suplementos

- `codigo` unico.
- ativacao do suplemento por usuario:
  - exige suplemento existente
  - exige `status=PUBLICADO`
  - bloqueia ativacao duplicada para o mesmo usuario
- desativacao exige que suplemento esteja ativo para o usuario.
- exclusao de suplemento bloqueada se houver conteudo vinculado (cla/classes/trilhas/caminhos/origens/equipamentos/habilidades/tecnicas/modificacoes).

## Homebrews

- codigo e gerado no backend: `USER_<usuarioId>_HB_<timestamp>`.
- validacao dos dados:
  - validacao estrutural por tipo (`validateHomebrewDados`)
  - validacao custom complementar por tipo (`validate-homebrew-*.ts`)
- leitura:
  - nao publicado so para dono/admin
  - publicado pode ser lido por usuarios autenticados
- update:
  - se `dados` mudar, versao e incrementada automaticamente (patch semver)
- publicar:
  - bloqueia se ja estiver publicado
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
  - `POST /suplementos` com `icone` invalido -> `400`, `code: VALIDATION_ERROR`, `field: icone`
  - `GET /suplementos/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR` (mensagem de `ParseIntPipe`)
- homebrews:
  - `GET /homebrews?pagina=0` -> `400`, `code: VALIDATION_ERROR`, `field: pagina`
  - `POST /homebrews` com `tipo` invalido -> `400`, `code: VALIDATION_ERROR`, `field: tipo`
  - `GET /homebrews/:id` com `id` invalido -> `400`, `code: VALIDATION_ERROR` (mensagem de `ParseIntPipe`)

## Consistencia com schema

- `Suplemento.codigo` e `@unique`.
- relacionamento usuario-suplemento:
  - `UsuarioSuplemento` com `@@unique([usuarioId, suplementoId])`.
- `Homebrew`:
  - `dados` e `Json` obrigatorio
  - `status` usa enum `StatusPublicacao`
  - `tipo` usa enum `TipoHomebrewConteudo`
  - unicidade por usuario/codigo: `@@unique([usuarioId, codigo])`

## Integracao frontend

- suplementos:
  - `assistenterpg-front/src/lib/api/suplementos.ts`
- homebrews:
  - `assistenterpg-front/src/lib/api/homebrews.ts`

Observacao de contrato front/back:

- os clientes frontend ja usam `pagina/limite` (PT-BR) para listagem de homebrews, alinhado ao DTO do backend.
