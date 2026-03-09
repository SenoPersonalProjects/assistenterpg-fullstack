# Auth, Usuarios e Campanhas (Contrato Detalhado)

Atualizado em: 2026-03-09

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
  - `assistenterpg-back/prisma/schema.prisma` (models `Usuario`, `PreferenciaUsuario`, `Campanha`, `MembroCampanha`, `ConviteCampanha`, `PersonagemCampanha`, `PersonagemCampanhaModificador`, `PersonagemCampanhaHistorico`, `Sessao`, `Cena`, `PersonagemSessao`, `EventoSessao`)
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
- `GET /campanhas/:id/personagens`
- `POST /campanhas/:id/personagens`
  - body `VincularPersonagemCampanhaDto`:
    - `personagemBaseId: int >= 1`
- `PATCH /campanhas/:id/personagens/:personagemCampanhaId/recursos`
  - body `AtualizarRecursosPersonagemCampanhaDto`:
    - `pvAtual?`, `peAtual?`, `eaAtual?`, `sanAtual?` (int >= 0)
- `GET /campanhas/:id/personagens/:personagemCampanhaId/modificadores?incluirInativos=true|false`
- `POST /campanhas/:id/personagens/:personagemCampanhaId/modificadores`
  - body `AplicarModificadorPersonagemCampanhaDto`:
    - `campo`: `PV_MAX | PE_MAX | EA_MAX | SAN_MAX | DEFESA_BASE | DEFESA_EQUIPAMENTO | DEFESA_OUTROS | ESQUIVA | BLOQUEIO | DESLOCAMENTO | LIMITE_PE_EA_POR_TURNO | PRESTIGIO_GERAL | PRESTIGIO_CLA`
    - `valor`: int e diferente de `0`
    - `nome`: string obrigatoria (max 80)
    - `descricao?`: string opcional (max 500)
- `POST /campanhas/:id/personagens/:personagemCampanhaId/modificadores/:modificadorId/desfazer`
  - body opcional `DesfazerModificadorPersonagemCampanhaDto`:
    - `motivo?`: string opcional (max 500)
- `GET /campanhas/:id/personagens/:personagemCampanhaId/historico`
- `GET /campanhas/:id/sessoes`
- `POST /campanhas/:id/sessoes`
  - body `CreateSessaoCampanhaDto`:
    - `titulo?`: string opcional (max 120)
- `GET /campanhas/:id/sessoes/:sessaoId`
- `PATCH /campanhas/:id/sessoes/:sessaoId/cena`
  - body `AtualizarCenaSessaoDto`:
    - `tipo`: `LIVRE | INVESTIGACAO | FURTIVIDADE | COMBATE | OUTRA`
    - `nome?`: string opcional (max 120)
- `POST /campanhas/:id/sessoes/:sessaoId/turno/avancar`
- `GET /campanhas/:id/sessoes/:sessaoId/chat?afterId=`
- `POST /campanhas/:id/sessoes/:sessaoId/chat`
  - body `EnviarChatSessaoDto`:
    - `mensagem`: string obrigatoria (max 1000)
- `POST /campanhas/:id/sessoes/:sessaoId/npcs`
  - body `AdicionarNpcSessaoDto`:
    - `npcAmeacaId` (obrigatorio)
    - `nomeExibicao?`, `vd?`, `defesa?`, `pontosVidaAtual?`, `pontosVidaMax?`, `machucado?`, `deslocamentoMetros?`, `notasCena?`
- `PATCH /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
  - body `AtualizarNpcSessaoDto`:
    - mesmos campos opcionais de edicao da instancia em cena (exceto `npcAmeacaId`)
- `DELETE /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`

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
- criacao de convite tambem valida:
  - email do convite nao pode ser do dono da campanha
  - email do convite nao pode ser de membro atual da campanha
  - nao pode existir outro convite `PENDENTE` para o mesmo email na mesma campanha
  - geracao de `codigo` unico com retry automatico (ate 5 tentativas)
- aceitar convite valida:
  - convite existe
  - convite esta `PENDENTE`
  - email do usuario logado e igual ao email do convite
  - usuario ainda nao e membro
- ao aceitar convite, membro entra com o `papel` salvo no convite (fallback `JOGADOR` para legados).
- aceite de convite ocorre em transacao (cria membro + marca convite como `ACEITO` no mesmo bloco atomico).
- personagem de campanha:
  - associacao de personagem-base (`POST /campanhas/:id/personagens`) exige acesso a campanha.
  - regra de limite: 1 personagem por usuario em cada campanha (`@@unique([campanhaId, donoId])`).
  - jogador/observador so pode associar personagem-base proprio.
  - mestre da campanha (dono ou membro com papel `MESTRE`) pode associar personagem de qualquer participante da campanha.
  - editar ficha de campanha (`recursos` e `modificadores`) segue regra:
    - mestre edita qualquer ficha da campanha.
    - jogador/observador edita apenas a propria ficha.
  - modificadores sao aplicados na ficha de campanha, sem alterar a ficha-base.
  - cada modificador registra fonte (`nome`, `descricao`) e pode ser desfeito com seguranca.
  - todo ajuste manual relevante gera historico em `PersonagemCampanhaHistorico`.
- sessoes de campanha:
  - apenas mestre (dono ou membro `MESTRE`) pode:
    - iniciar sessao
    - trocar cena
    - avancar turno
    - adicionar/editar/remover NPCs/Ameacas da cena
  - participantes da campanha podem:
    - abrir detalhe do lobby
    - listar/enviar mensagens no chat
  - regra de cena livre:
    - `LIVRE` nao possui contagem de rodadas/turnos.
    - em `LIVRE`, detalhe retorna `rodadaAtual`, `indiceTurnoAtual` e `turnoAtual` como `null`.
    - `POST /turno/avancar` em `LIVRE` falha com `SESSAO_TURNO_INDISPONIVEL`.
  - visibilidade de cards:
    - mestre ve/edita todos os cards.
    - jogador ve card completo apenas do proprio personagem e cards resumidos dos demais.
  - NPCs/Ameacas em sessao:
    - cada instancia fica vinculada a uma `cenaId` em `NpcAmeacaSessao`.
    - a cena atual retorna lista `npcs` junto do detalhe da sessao.
    - passivas/acoes das instancias sao guias descritivos para o mestre (nao aplicam automacao de efeito).

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
  - `CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA`
  - `CAMPANHA_PERSONAGEM_LIMITE_USUARIO`
  - `CAMPANHA_PERSONAGEM_EDICAO_NEGADA`
  - `CAMPANHA_APENAS_MESTRE`
  - `PERSONAGEM_CAMPANHA_NOT_FOUND`
  - `CAMPANHA_MODIFICADOR_NOT_FOUND`
  - `CAMPANHA_MODIFICADOR_JA_DESFEITO`
  - `SESSAO_CAMPANHA_NOT_FOUND`
  - `SESSAO_TURNO_INDISPONIVEL`
  - `NPC_AMEACA_NOT_FOUND`
  - `NPC_SESSAO_NOT_FOUND`
  - `USUARIO_JA_MEMBRO`
  - `CONVITE_NOT_FOUND`
  - `CONVITE_INVALIDO`
  - `CONVITE_NAO_PERTENCE_USUARIO`
  - `CONVITE_DUPLICADO_PENDENTE`
  - `CONVITE_CODIGO_INDISPONIVEL`

## Consistencia com schema

- `Usuario.email` e `@unique`.
- `Usuario.role` usa enum `RoleUsuario` (`USUARIO`, `ADMIN`).
- `PreferenciaUsuario.usuarioId` e `@unique` (1:1 com usuario).
- `MembroCampanha` possui `@@unique([campanhaId, usuarioId])`.
- `ConviteCampanha.codigo` e `@unique`.
- `PersonagemCampanha` possui:
  - `@@unique([campanhaId, personagemBaseId])`
  - `@@unique([campanhaId, donoId])`
- `PersonagemCampanhaModificador` guarda modificadores narrativos com soft-undo (`ativo`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`).
- `PersonagemCampanhaHistorico` guarda trilha de auditoria de alteracoes de ficha de campanha.
- `Sessao` guarda estado do lobby (`status`, `cenaAtualTipo`, `cenaAtualNome`, `rodadaAtual`, `indiceTurnoAtual`, `iniciadoEm`, `encerradoEm`).
- `Cena` versiona troca de cena por sessao.
- `EventoSessao` guarda eventos estruturados do lobby (chat, troca de cena, turno).
- `PersonagemSessao` representa cada personagem participante na sessao atual.
- `NpcAmeacaSessao` representa cada NPC/Ameaca adicionado em uma cena da sessao.
- `Campanha.status` e `ConviteCampanha.status` sao `String` no schema (nao enum).

## Integracao frontend

- auth:
  - `apiRegister`, `apiLogin`, `apiGetMe`
- usuarios:
  - estatisticas, preferencias, alterar senha, exportar dados e excluir conta
- campanhas:
  - listar minhas, criar/excluir, detalhe, fluxo de convites
  - personagens de campanha (associacao/edicao/modificadores/historico)
  - sessoes de campanha (CRUD de lobby + chat + controle de cena/turno)

Arquivos:

- `assistenterpg-front/src/lib/api/auth.ts`
- `assistenterpg-front/src/lib/api/usuarios.ts`
- `assistenterpg-front/src/lib/api/campanhas.ts`
