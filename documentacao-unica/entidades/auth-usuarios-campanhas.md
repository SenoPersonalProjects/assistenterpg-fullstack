# Auth, Usuarios e Campanhas (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento detalha o contrato real dos modulos `auth`, `usuario` e `campanha`, cruzando:

- controllers:
  - `assistenterpg-back/src/auth/auth.controller.ts`
  - `assistenterpg-back/src/usuario/usuario.controller.ts`
  - `assistenterpg-back/src/campanha/campanha.controller.ts`
- services:
  - `assistenterpg-back/src/auth/auth.service.ts`
  - `assistenterpg-back/src/usuario/usuario.service.ts`
  - `assistenterpg-back/src/campanha/campanha.service.ts`
- DTOs:
  - `assistenterpg-back/src/auth/dto/*.ts`
  - `assistenterpg-back/src/usuario/dto/*.ts`
  - `assistenterpg-back/src/campanha/dto/*.ts`
- exceptions:
  - `assistenterpg-back/src/common/exceptions/auth.exception.ts`
  - `assistenterpg-back/src/common/exceptions/usuario.exception.ts`
  - `assistenterpg-back/src/common/exceptions/campanha.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models `Usuario`, `PreferenciaUsuario`, `Campanha`, `MembroCampanha`, `ConviteCampanha`)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/auth.ts`
  - `assistenterpg-front/src/lib/api/usuarios.ts`
  - `assistenterpg-front/src/lib/api/campanhas.ts`

## Matriz de autorizacao

- `auth`
  - `POST /auth/register`: publica
  - `POST /auth/login`: publica
- `usuarios`
  - todas as rotas: `Auth: JWT` (`@UseGuards(JwtAuthGuard)` no controller)
- `campanhas`
  - todas as rotas: `Auth: JWT` (`@UseGuards(AuthGuard('jwt'))` no controller)

## Endpoints

## Auth

- `POST /auth/register`
  - body `RegisterDto`:
    - `apelido: string` (obrigatorio)
    - `email: email` (obrigatorio)
    - `senha: string` (obrigatorio, min 6)
  - retorna usuario criado (sem `senhaHash`):
    - `id`, `apelido`, `email`, `role`, `criadoEm`

- `POST /auth/login`
  - body `LoginDto`:
    - `email: email`
    - `senha: string`
  - retorno:
    - `access_token`
    - `usuario: { id, email, apelido, role }`

## Usuarios (`/usuarios/me`)

- `GET /usuarios/me`
- `GET /usuarios/me/estatisticas`
- `GET /usuarios/me/preferencias`
- `PATCH /usuarios/me/preferencias`
  - body `AtualizarPreferenciasDto`:
    - `notificacoesEmail?`, `notificacoesPush?`, `notificacoesConvites?`, `notificacoesAtualizacoes?` (boolean)
    - `idioma?` (string)
- `PATCH /usuarios/me/senha`
  - body `AlterarSenhaDto`:
    - `senhaAtual: string`
    - `novaSenha: string` (min 6)
- `GET /usuarios/me/exportar`
  - JSON com header de download (`dados-assistenterpg.json`)
- `DELETE /usuarios/me`
  - body `ExcluirContaDto`:
    - `senha: string`

## Campanhas

- `POST /campanhas`
  - body `CreateCampanhaDto`:
    - `nome: string` (3..100)
    - `descricao?: string` (max 500)
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit`
  - sem paginacao: array
  - com paginacao: `{ items, total, page, limit, totalPages }`
- `GET /campanhas/:id`
- `DELETE /campanhas/:id`
- `GET /campanhas/:id/membros`
- `POST /campanhas/:id/membros`
  - body `AddMembroDto`:
    - `usuarioId: int >= 1`
    - `papel: MESTRE | JOGADOR | OBSERVADOR`
- `POST /campanhas/:id/convites`
  - body `CreateConviteDto`:
    - `email: email`
    - `papel: MESTRE | JOGADOR | OBSERVADOR`
- `GET /campanhas/convites/pendentes`
- `POST /campanhas/convites/:codigo/aceitar`
- `POST /campanhas/convites/:codigo/recusar`

## Regras de negocio

## Auth

- registro valida unicidade de email e gera hash (`bcrypt`).
- login nao vaza se email existe ou nao:
  - qualquer falha de email/senha retorna `CREDENCIAIS_INVALIDAS`.

## Usuarios

- `GET /usuarios/me` remove `senhaHash` da resposta.
- preferencias usam `upsert`:
  - se usuario nao tiver preferencias, o `GET` cria defaults automaticamente.
- troca de senha:
  - valida senha atual antes de atualizar.
- exclusao de conta:
  - valida senha antes do `delete`.
- exportacao inclui snapshot de:
  - dados do usuario
  - personagens base
  - campanhas onde e dono/membro
  - preferencias

## Campanhas

- campanha criada com `status: "ATIVA"`.
- acesso ao detalhe/lista de membros exige ser dono ou membro.
- apenas dono pode:
  - excluir campanha
  - adicionar membro
  - enviar convite
- aceitar convite valida:
  - convite existe
  - convite esta `PENDENTE`
  - email do usuario logado e igual ao email do convite
  - usuario ainda nao e membro
- ao aceitar convite, membro entra com papel fixo `JOGADOR`.

## Pontos de atencao

- `ConviteCampanha` agora persiste `papel`; aceitar convite aplica o papel salvo.
- DTOs `UpdateCampanhaDto`, `UpdateStatusCampanhaDto` e `AnswerConviteDto` existem, mas nao ha rotas publicadas usando esses DTOs no controller atual.

## Erros esperados (codigos)

- auth:
  - `CREDENCIAIS_INVALIDAS`
  - `TOKEN_INVALIDO`
  - `USUARIO_NAO_AUTENTICADO`
  - `ACESSO_NEGADO`
- usuario:
  - `USUARIO_NOT_FOUND`
  - `USUARIO_EMAIL_DUPLICADO`
  - `USUARIO_SENHA_INCORRETA`
- campanha/convites:
  - `CAMPANHA_NOT_FOUND`
  - `CAMPANHA_ACESSO_NEGADO`
  - `CAMPANHA_APENAS_DONO`
  - `USUARIO_JA_MEMBRO`
  - `CONVITE_NOT_FOUND`
  - `CONVITE_INVALIDO`
  - `CONVITE_NAO_PERTENCE_USUARIO`

## Consistencia com schema

- `Usuario.email` e `@unique`.
- `Usuario.role` usa enum `RoleUsuario` (`USUARIO`, `ADMIN`).
- `PreferenciaUsuario.usuarioId` e `@unique` (1:1 com usuario).
- `MembroCampanha` possui `@@unique([campanhaId, usuarioId])`.
- `ConviteCampanha.codigo` e `@unique`.
- `Campanha.status` e `ConviteCampanha.status` sao `String` no schema (nao enum).

## Integracao frontend

- auth:
  - `apiRegister`, `apiLogin`, `apiGetMe`
- usuarios:
  - estatisticas, preferencias, alterar senha, exportar dados e excluir conta
- campanhas:
  - listar minhas, criar/excluir, detalhe, fluxo de convites

Arquivos:

- `assistenterpg-front/src/lib/api/auth.ts`
- `assistenterpg-front/src/lib/api/usuarios.ts`
- `assistenterpg-front/src/lib/api/campanhas.ts`
