# Auth, Usuarios e Campanhas (Contrato Detalhado)

Atualizado em: 2026-03-12

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
- `GET /campanhas/:id/personagens/:personagemCampanhaId/modificadores`
  - query opcional:
    - `incluirInativos=true|false`
    - `sessaoId` (int >= 1)
    - `cenaId` (int >= 1)
- `POST /campanhas/:id/personagens/:personagemCampanhaId/modificadores`
  - body `AplicarModificadorPersonagemCampanhaDto`:
    - `campo`: `PV_MAX | PE_MAX | EA_MAX | SAN_MAX | DEFESA_BASE | DEFESA_EQUIPAMENTO | DEFESA_OUTROS | ESQUIVA | BLOQUEIO | DESLOCAMENTO | LIMITE_PE_EA_POR_TURNO | PRESTIGIO_GERAL | PRESTIGIO_CLA`
    - `valor`: int e diferente de `0`
    - `nome`: string obrigatoria (max 80)
    - `descricao?`: string opcional (max 500)
    - `sessaoId?`: int >= 1
    - `cenaId?`: int >= 1 (exige `sessaoId` no mesmo payload)
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
- `POST /campanhas/:id/sessoes/:sessaoId/turno/voltar`
- `POST /campanhas/:id/sessoes/:sessaoId/turno/pular`
- `PATCH /campanhas/:id/sessoes/:sessaoId/iniciativa/ordem`
  - body `AtualizarOrdemIniciativaSessaoDto`:
    - `ordem`: lista obrigatoria com `{ tipoParticipante: PERSONAGEM|NPC, id }`
    - `indiceTurnoAtual?`: inteiro opcional >= 0
- `GET /campanhas/:id/sessoes/:sessaoId/chat?afterId=`
- `POST /campanhas/:id/sessoes/:sessaoId/chat`
  - body `EnviarChatSessaoDto`:
    - `mensagem`: string obrigatoria (max 1000)
- `GET /campanhas/:id/sessoes/:sessaoId/eventos`
  - query opcional:
    - `limit`: int entre 1 e 200
    - `incluirChat`: boolean
- `POST /campanhas/:id/sessoes/:sessaoId/eventos/:eventoId/desfazer`
  - body opcional `DesfazerEventoSessaoDto`:
    - `motivo?`: string opcional (max 240)
- `POST /campanhas/:id/sessoes/:sessaoId/npcs`
  - body `AdicionarNpcSessaoDto`:
    - `npcAmeacaId` (obrigatorio)
    - `nomeExibicao?`, `vd?`, `defesa?`, `pontosVidaAtual?`, `pontosVidaMax?`, `machucado?`, `deslocamentoMetros?`, `notasCena?`
- `PATCH /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
  - body `AtualizarNpcSessaoDto`:
    - mesmos campos opcionais de edicao da instancia em cena (exceto `npcAmeacaId`)
- `DELETE /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
- `POST /campanhas/:id/sessoes/:sessaoId/personagens/:personagemSessaoId/habilidades/usar`
  - body `UsarHabilidadeSessaoDto`:
    - `habilidadeTecnicaId`: int >= 1
    - `variacaoHabilidadeId?`: int >= 1
    - `acumulos?`: int >= 0
- `POST /campanhas/:id/sessoes/:sessaoId/condicoes/aplicar`
  - body `AplicarCondicaoSessaoDto`:
    - `condicaoId`: int >= 1
    - `alvoTipo`: `PERSONAGEM | NPC`
    - `personagemSessaoId?`: int >= 1 (obrigatorio quando `alvoTipo=PERSONAGEM`)
    - `npcSessaoId?`: int >= 1 (obrigatorio quando `alvoTipo=NPC`)
    - `duracaoModo?`: `ATE_REMOVER | RODADAS | TURNOS_ALVO`
    - `duracaoValor?`: int >= 1 (obrigatorio quando `duracaoModo` for `RODADAS` ou `TURNOS_ALVO`)
    - `origemDescricao?`: string opcional (max 255)
    - `observacao?`: string opcional (max 2000)
- `POST /campanhas/:id/sessoes/:sessaoId/condicoes/:condicaoSessaoId/remover`
  - body opcional `RemoverCondicaoSessaoDto`:
    - `motivo?`: string opcional (max 2000)
- `POST /campanhas/:id/sessoes/:sessaoId/personagens/:personagemSessaoId/sustentacoes/:sustentacaoId/encerrar`
  - body opcional `EncerrarSustentacaoSessaoDto`:
    - `motivo?`: string opcional (max 240)
- canal realtime de sessao (WebSocket):
  - namespace `/sessoes`
  - evento cliente -> servidor:
    - `sessao:join` (`{ campanhaId, sessaoId }`)
  - eventos servidor -> cliente:
    - `sessao:joined`
    - `sessao:erro`
    - `sessao:atualizada` (`CHAT_NOVA`, `CENA_ATUALIZADA`, `TURNO_AVANCADO`, `TURNO_RECUADO`, `TURNO_PULADO`, `ORDEM_INICIATIVA_ATUALIZADA`, `NPC_ATUALIZADO`, `SESSAO_ENCERRADA`, `SESSAO_EVENTO_DESFEITO`, `HABILIDADE_USADA`, `HABILIDADE_SUSTENTADA_ENCERRADA`, `CONDICAO_APLICADA`, `CONDICAO_REMOVIDA`)
    - `sessao:presenca` (`onlineUsuarioIds`)

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
  - listagem de personagens-base disponiveis para associacao:
    - `GET /campanhas/:id/personagens-base-disponiveis`
    - jogadores/observadores recebem apenas personagens proprios ainda nao vinculados na campanha.
    - mestres recebem personagens dos participantes (dono + membros), excluindo os ja vinculados.
  - associacao de personagem-base (`POST /campanhas/:id/personagens`) exige acesso a campanha.
  - desassociacao de personagem de campanha (`DELETE /campanhas/:id/personagens/:personagemCampanhaId`):
    - mestre pode desassociar qualquer ficha.
    - jogador/observador pode desassociar apenas ficha propria.
    - bloqueado quando a ficha ja participou de sessao (`CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA`).
  - regra de limite:
    - jogadores/observadores: 1 personagem por usuario em cada campanha.
    - mestres (dono ou membro `MESTRE`): sem limite de quantidade de personagens na campanha.
  - jogador/observador so pode associar personagem-base proprio.
  - mestre da campanha (dono ou membro com papel `MESTRE`) pode associar personagem de qualquer participante da campanha.
  - editar ficha de campanha (`recursos` e `modificadores`) segue regra:
    - mestre edita qualquer ficha da campanha.
    - jogador/observador edita apenas a propria ficha.
  - modificadores sao aplicados na ficha de campanha, sem alterar a ficha-base.
  - modificadores podem ser contextualizados por sessao/cena:
    - `sessaoId` valida se pertence a campanha.
    - `cenaId` valida se pertence a `sessaoId`.
    - `cenaId` sem `sessaoId` falha com `CENA_SESSAO_NOT_FOUND`.
  - cada modificador registra fonte (`nome`, `descricao`) e pode ser desfeito com seguranca.
  - todo ajuste manual relevante gera historico em `PersonagemCampanhaHistorico`.
- sessoes de campanha:
  - apenas mestre (dono ou membro `MESTRE`) pode:
    - iniciar sessao
    - encerrar sessao
    - trocar cena
    - controlar turno (`avancar`, `voltar`, `pular`)
    - reordenar iniciativa
    - adicionar/editar/remover aliados/ameacas da cena
    - aplicar/remover condicoes na instancia de personagem ou NPC da sessao
  - participantes da campanha podem:
    - abrir detalhe do lobby
    - listar/enviar mensagens no chat
  - detalhe da sessao inclui `participantes` da campanha (apelido/papel/ehDono) para o lobby.
  - detalhe da sessao inclui `iniciativa` com ordem unificada de personagens e aliados/ameacas da cena.
  - cada item de iniciativa retorna `valorIniciativa` inteiro.
  - ao reordenar iniciativa, os valores sao normalizados com diferenca de 1 ponto por posicao (`+1/-1` entre vizinhos).
  - reordenacao pode ser feita por botoes ou drag-and-drop no painel do mestre.
  - iniciativa e por participante da cena (`PERSONAGEM` ou `NPC`), nao por usuario.
  - status online da mesa e propagado por `sessao:presenca`.
  - frontend mantem polling de fallback para sincronizacao silenciosa quando websocket estiver indisponivel.
  - regra de cena livre:
    - `LIVRE` nao possui contagem de rodadas/turnos.
    - em `LIVRE`, detalhe retorna `rodadaAtual`, `indiceTurnoAtual`, `turnoAtual` e `iniciativa.indiceAtual` como `null`.
    - `POST /turno/avancar`, `POST /turno/voltar`, `POST /turno/pular` e `PATCH /iniciativa/ordem` em `LIVRE` falham com `SESSAO_TURNO_INDISPONIVEL`.
  - `PATCH /iniciativa/ordem` valida a lista exata de participantes da cena; payload divergente retorna `SESSAO_ORDEM_INICIATIVA_INVALIDA`.
  - visibilidade de cards:
    - mestre ve/edita todos os cards.
    - jogador ve card completo apenas do proprio personagem e cards resumidos dos demais.
  - cards completos retornam:
    - `tecnicaInata` com habilidades/variacoes filtradas por grau.
    - `tecnicasNaoInatas` habilitadas por grau (sem escolha manual do jogador).
    - `sustentacoesAtivas` por personagem da sessao.
    - `condicoesAtivas` por personagem da sessao.
  - uso de habilidades em sessao:
    - consumo imediato de `EA/PE` no momento do uso.
    - `acumulos` habilita escalonamento quando a habilidade/variacao suporta acumulo, limitado pelo grau de aprimoramento da tecnica.
    - escalonamento suporta custo adicional em `EA` e `PE` por acumulo.
    - escalonamento tipado (`escalonamentoTipo` + `escalonamentoEfeito`) permite representar dano, cura, regras e outros efeitos guiados.
    - habilidades sustentadas criam sustentacao ativa vinculada ao personagem da sessao.
    - custo por rodada usa `custoSustentacaoEA` quando definido; fallback padrao `1 EA/rodada`.
    - sustentacao passa a cobrar por rodada a partir da rodada seguinte a ativacao.
    - ao avancar rodada, o backend cobra sustentacao automaticamente e encerra se faltar `EA`.
    - limite de gasto por turno usa soma combinada `PE + EA` no turno atual.
    - excecao de limite: uso base (sem variacao e sem acumulos) pode ultrapassar o limite apenas se for o primeiro uso do turno (`gasto atual = 0`).
    - apos qualquer gasto no turno, novos usos (inclusive uso base) passam a respeitar o limite combinado normalmente.
    - encerramento manual da sustentacao usa rota dedicada.
  - frontend aplica cooldown curto anti-duplo-clique no uso de habilidade/variacao.
  - no lobby da sessao, as variacoes de habilidade sao exibidas em bloco proprio com metadados de execucao/alcance/alvo/duracao, custo base e custo de sustentacao por rodada.
  - habilidades e variacoes com sustentacao ativa recebem marcador visual (`Ativa xN`) no proprio card de tecnica.
  - cada card de personagem possui filtro rapido `Mostrar somente sustentadas ativas`, limitando a listagem para habilidades/variacoes atualmente sustentadas.
  - estado do filtro rapido e persistido em `localStorage` por `usuarioId + campanhaId + sessaoId`, mantendo preferencia entre navegacoes.
  - painel central da sessao (cena/rodada/turno/status) e compartilhado para todos os participantes.
  - coluna direita do lobby concentra participantes online, timeline de eventos e chat.
  - timeline de eventos:
    - `GET /eventos` retorna eventos estruturados da sessao (chat opcional).
    - cada evento retorna `descricao`, `desfeito` e `podeDesfazer` (para mestres no ultimo evento reversivel da pilha).
  - desfazer seguro de evento:
    - apenas mestre pode desfazer.
    - apenas o ultimo evento reversivel ainda nao desfeito pode ser revertido (LIFO).
    - eventos desfeitos recebem marcacao no JSON `dados` (`desfeito`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`).
    - tipos reversiveis atuais: `TURNO_AVANCADO`, `TURNO_RECUADO`, `TURNO_PULADO`, `ORDEM_INICIATIVA_ATUALIZADA`, `CENA_ATUALIZADA`, `NPC_ADICIONADO`, `NPC_ATUALIZADO`, `NPC_REMOVIDO`, `CONDICAO_APLICADA`, `CONDICAO_REMOVIDA`.
  - escudo do mestre (V1):
    - painel de consulta rapida com busca, modo `Resumo/Detalhado` e secoes recolhiveis.
    - inclui conteudo operacional inicial para: pericias, condicoes, conflitos/expansao de dominio, dificuldades, teste unido, tipos de dano/acoes, ferimentos, insanidade, situacoes especiais, multidoes, interludio, investigacao, furtividade, perseguicao e aspectos congenitos.
    - modo detalhado preenchido em nivel completo/literal para os topicos operacionais da V1, com fallback para resumo quando necessario.
    - no modo detalhado, cada guia quebra automaticamente em subtopicos colapsaveis usando secoes markdown `##`.
    - topico `Aspectos congenitos` foi atualizado com versao detalhada completa (dons especiais + restricoes congenitas, com requisitos, bonus e limitacoes).
  - card editavel da sessao oferece `Ajustes narrativos`, reaproveitando o modal de ficha de campanha com contexto de `sessaoId/cenaId`.
  - no modal contextualizado, o historico permite filtros rapidos combinados:
    - contexto: `Todos`, `Sessao atual` e `Cena atual`.
    - tipo de evento: `Todos os tipos` + tipos presentes no historico retornado.
  - aliados/ameacas em sessao:
    - cada instancia fica vinculada a uma `cenaId` em `NpcAmeacaSessao`.
    - a cena atual retorna lista `npcs` junto do detalhe da sessao.
    - passivas/acoes das instancias sao guias descritivos para o mestre (nao aplicam automacao de efeito).
    - cada instancia tambem retorna `condicoesAtivas`.
  - condicoes em sessao:
    - aplicacao manual aceita modos de duracao `ATE_REMOVER`, `RODADAS` e `TURNOS_ALVO`.
    - expiracao automatica ocorre quando `restanteDuracao` chega a zero (modos `RODADAS` e `TURNOS_ALVO`).
    - automacoes de recurso:
      - `MACHUCADO` quando `PV` fica em metade ou menos.
      - `MORRENDO` quando `PV` chega a `0` ou menos.
      - `CAIDO` junto com `MORRENDO` quando `PV` chega a `0` ou menos.
      - `ENLOUQUECENDO` quando `SAN` chega a `0` ou menos (personagem).

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
  - `CENA_SESSAO_NOT_FOUND`
  - `SESSAO_TURNO_INDISPONIVEL`
  - `SESSAO_ORDEM_INICIATIVA_INVALIDA`
  - `SESSAO_EVENTO_NOT_FOUND`
  - `SESSAO_EVENTO_DESFAZER_NAO_PERMITIDO`
  - `SESSAO_HABILIDADE_NAO_DISPONIVEL`
  - `SESSAO_RECURSO_INSUFICIENTE`
  - `SESSAO_VARIACAO_HABILIDADE_NOT_FOUND`
  - `SESSAO_HABILIDADE_SEM_ESCALONAMENTO`
  - `SESSAO_ACUMULO_EXCEDE_GRAU`
  - `SESSAO_LIMITE_PEEA_EXCEDIDO`
  - `SESSAO_SUSTENTACAO_NOT_FOUND`
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
  - `@@index([campanhaId, donoId])`
- `PersonagemCampanhaModificador` guarda modificadores narrativos com soft-undo (`ativo`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`) e contexto opcional (`sessaoId`, `cenaId`).
- `PersonagemCampanhaHistorico` guarda trilha de auditoria de alteracoes de ficha de campanha.
- `Sessao` guarda estado do lobby (`status`, `cenaAtualTipo`, `cenaAtualNome`, `rodadaAtual`, `indiceTurnoAtual`, `iniciadoEm`, `encerradoEm`).
- `Cena` versiona troca de cena por sessao.
- `EventoSessao` guarda eventos estruturados do lobby (chat, troca de cena, turno).
- `PersonagemSessao` representa cada personagem participante na sessao atual.
- `PersonagemSessaoHabilidadeSustentada` guarda sustentacoes ativas da sessao (custo/rodada, rodada de ativacao e encerramento).
- `NpcAmeacaSessao` representa cada aliado/ameaca adicionado em uma cena da sessao.
- `Campanha.status` e `ConviteCampanha.status` sao `String` no schema (nao enum).

## Integracao frontend

- auth:
  - `apiRegister`, `apiLogin`, `apiGetMe`
- usuarios:
  - estatisticas, preferencias, alterar senha, exportar dados e excluir conta
- campanhas:
  - listar minhas, criar/excluir, detalhe, fluxo de convites
  - personagens de campanha (associacao/edicao/modificadores/historico)
  - sessoes de campanha (CRUD de lobby + chat + controle de cena/turno + timeline de eventos + desfazer seguro)
  - realtime do lobby (join, atualizacoes e presenca) via `assistenterpg-front/src/lib/realtime/sessao-socket.ts`
  - listagem em `assistenterpg-front/src/app/campanhas/page.tsx` com preview modal antes da navegacao completa

Arquivos:

- `assistenterpg-front/src/lib/api/auth.ts`
- `assistenterpg-front/src/lib/api/usuarios.ts`
- `assistenterpg-front/src/lib/api/campanhas.ts`
- `assistenterpg-front/src/components/campanha/CampaignPreviewModal.tsx`
- `assistenterpg-front/src/components/campanha/CampaignCard.tsx`
