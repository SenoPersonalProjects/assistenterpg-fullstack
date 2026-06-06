# Auth, Usuários e Campanhas (Contrato Detalhado)

Atualizado em: 2026-03-12

## Escopo

Este documento detalha o contrato real dos módulos `auth`, `usuario` e `campanha`, cruzando:

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
- integração frontend:
  - `assistenterpg-front/src/lib/api/auth.ts`
  - `assistenterpg-front/src/lib/api/usuarios.ts`
  - `assistenterpg-front/src/lib/api/campanhas.ts`

## Matriz de autorização

- `auth`
  - `POST /auth/register`: pública
  - `POST /auth/login`: pública
  - `POST /auth/forgot-password`: pública
  - `POST /auth/reset-password`: pública
  - `POST /auth/verify-email`: pública
  - `POST /auth/resend-verification-email`: pública
  - `POST /auth/verify-email-change`: pública
  - `POST /auth/reactivate-account`: pública
- `usuarios`
  - todas as rotas: `Auth: JWT` (`@UseGuards(JwtAuthGuard)` no controller)
- `campanhas`
  - todas as rotas: `Auth: JWT` (`@UseGuards(AuthGuard('jwt'))` no controller)

## Endpoints

## Auth

- `POST /auth/register`
  - body `RegisterDto`:
    - `apelido: string` (obrigatório)
    - `email: email` (obrigatório)
    - `senha: string` (obrigatório, min 8)
  - retorna mensagem genérica e cria somente um registro pendente

- `POST /auth/login`
  - body `LoginDto`:
    - `email: email`
    - `senha: string`
  - retorno:
    - `usuario: { id, email, apelido, role, emailVerificado }`
  - seta cookies HttpOnly de access/refresh e cookie CSRF

- `POST /auth/forgot-password`
  - body `ForgotPasswordDto`:
    - `email: email`
  - retorno:
    - `mensagem: string` (sempre genérica, sem revelar existência do email)

- `POST /auth/reset-password`
  - body `ResetPasswordDto`:
    - `token: string`
    - `novaSenha: string` (min 8)
  - retorno:
    - `mensagem: string`

- `POST /auth/verify-email`
  - body `VerifyEmailDto`:
    - `token: string`
  - retorno:
    - `mensagem: string`

- `POST /auth/resend-verification-email`
  - body `ResendVerificationEmailDto`:
    - `email: email`
  - retorno:
    - `mensagem: string` (sempre genérica)

- `POST /auth/verify-email-change`
  - body: `{ token }`
- `POST /auth/reactivate-account`
  - body: `{ email, senha }`

## Usuários (`/usuarios/me`)

- `GET /usuarios/me`
- `GET /usuarios/me/estatisticas`
- `GET /usuarios/me/preferências`
- `PATCH /usuarios/me/preferências`
  - body `AtualizarPreferênciasDto`:
    - `notificacoesEmail?`, `notificacoesPush?`, `notificacoesConvites?`, `notificacoesAtualizacoes?` (boolean)
    - `idioma?` (string)
- `PATCH /usuarios/me/senha`
  - body `AlterarSenhaDto`:
    - `senhaAtual: string`
    - `novaSenha: string` (min 8)
- `PATCH /usuarios/me/email`
  - body: `{ novoEmail, senhaAtual }`
- `POST /usuarios/me/desativar`
  - body: `{ senhaAtual }`
- `GET /usuarios/me/exportar`
  - JSON com header de download (`dados-assistenterpg.json`)
- `DELETE /usuarios/me`
  - body `ExcluirContaDto`:
    - `senhaAtual: string`

## Campanhas

- `POST /campanhas`
  - body `CreateCampanhaDto`:
    - `nome: string` (3..100)
    - `descricao?: string` (max 500)
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit`
  - sem paginação: array
  - com paginação: `{ items, total, page, limit, totalPages }`
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
    - `nome`: string obrigatória (max 80)
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
- `POST /campanhas/:id/sessoes/:sessaoId/turno/avançar`
- `POST /campanhas/:id/sessoes/:sessaoId/turno/voltar`
- `POST /campanhas/:id/sessoes/:sessaoId/turno/pular`
- `PATCH /campanhas/:id/sessoes/:sessaoId/iniciativa/ordem`
  - body `AtualizarOrdemIniciativaSessaoDto`:
    - `ordem`: lista obrigatória com `{ tipoParticipante: PERSONAGEM|NPC, id }`
    - `indiceTurnoAtual?`: inteiro opcional >= 0
- `GET /campanhas/:id/sessoes/:sessaoId/chat?afterId=`
- `POST /campanhas/:id/sessoes/:sessaoId/chat`
  - body `EnviarChatSessaoDto`:
    - `mensagem`: string obrigatória (max 1000)
- `GET /campanhas/:id/sessoes/:sessaoId/eventos`
  - query opcional:
    - `limit`: int entre 1 e 200
    - `incluirChat`: boolean
- `POST /campanhas/:id/sessoes/:sessaoId/eventos/:eventoId/desfazer`
  - body opcional `DesfazerEventoSessaoDto`:
    - `motivo?`: string opcional (max 240)
- `POST /campanhas/:id/sessoes/:sessaoId/npcs`
  - body `AdicionarNpcSessaoDto`:
    - `npcAmeacaId` (obrigatório)
    - `nomeExibicao?`, `vd?`, `defesa?`, `pontosVidaAtual?`, `pontosVidaMax?`, `machucado?`, `deslocamentoMetros?`, `notasCena?`
- `PATCH /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
  - body `AtualizarNpcSessaoDto`:
    - mesmos campos opcionais de edição da instância em cena (exceto `npcAmeacaId`)
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
    - `personagemSessaoId?`: int >= 1 (obrigatório quando `alvoTipo=PERSONAGEM`)
    - `npcSessaoId?`: int >= 1 (obrigatório quando `alvoTipo=NPC`)
    - `duracaoModo?`: `ATE_REMOVER | RODADAS | TURNOS_ALVO`
    - `duracaoValor?`: int >= 1 (obrigatório quando `duracaoModo` for `RODADAS` ou `TURNOS_ALVO`)
    - `origemDescricao?`: string opcional (max 255)
    - `observacao?`: string opcional (max 2000)
- `POST /campanhas/:id/sessoes/:sessaoId/condicoes/:condicaoSessaoId/remover`
  - body opcional `RemoverCondicaoSessaoDto`:
    - `motivo?`: string opcional (max 2000)
- `POST /campanhas/:id/sessoes/:sessaoId/personagens/:personagemSessaoId/sustentacoes/:sustentacaoId/encerrar`
  - body opcional `EncerrarSustentacaoSessaoDto`:
    - `motivo?`: string opcional (max 240)
- canal realtime de sessão (WebSocket):
  - namespace `/sessoes`
  - evento cliente -> servidor:
    - `sessao:join` (`{ campanhaId, sessaoId }`)
  - eventos servidor -> cliente:
    - `sessao:joined`
    - `sessao:erro`
    - `sessao:atualizada` (`CHAT_NOVA`, `CENA_ATUALIZADA`, `TURNO_AVANCADO`, `TURNO_RECUADO`, `TURNO_PULADO`, `ORDEM_INICIATIVA_ATUALIZADA`, `NPC_ATUALIZADO`, `SESSAO_ENCERRADA`, `SESSAO_EVENTO_DESFEITO`, `HABILIDADE_USADA`, `HABILIDADE_SUSTENTADA_ENCERRADA`, `CONDICAO_APLICADA`, `CONDICAO_REMOVIDA`)
    - `sessao:presenca` (`onlineUsuarioIds`)

## Regras de negócio

## Auth

- registro cria pré-registro expirável; `Usuario` só é criado após verificar email.
- pré-registro e tokens armazenam somente hashes e respostas públicas são genéricas.
- login não vaza se email existe ou não:
  - qualquer falha de email/senha retorna `CREDENCIAIS_INVALIDAS`.
- login exige email verificado:
  - se credenciais válidas e email não verificado, retorna `AUTH_EMAIL_NAO_VERIFICADO` (403).
- recuperação de senha:
  - usa token temporário de uso único (`AuthToken`, tipo `RECUPERACAO_SENHA`).
  - resposta de solicitação é sempre genérica para evitar enumeração de usuários.
  - reset consome token, troca senha e revoga sessões/tokens na mesma transação.
- verificação de email:
  - usa token temporário de uso único (`AuthToken`, tipo `VERIFICACAO_EMAIL`).
  - reenvio inválida tokens anteriores ativos antes de gerar novo link.
- envio de email real sem domínio:
  - `AUTH_EMAIL_MODE=smtp`
  - pode usar conta pessoal (ex.: Gmail) com senha de app
  - `AUTH_EMAIL_FROM` pode ficar vazio para usar o mesmo endereco de `AUTH_SMTP_USER` como remetente

## Usuários

- `GET /usuarios/me` remove `senhaHash` da resposta.
- preferências usam `upsert`:
  - se usuário não tiver preferências, o `GET` cria defaults automáticamente.
- troca de senha:
  - válida senha atual, atualiza e revoga todas as sessões.
- alteração de email:
  - exige senha atual e só efetiva após confirmar o novo endereço.
- desativação:
  - exige senha atual e pode ser revertida pelo próprio usuário com email/senha.
- exclusão de conta:
  - exige senha e anonimiza permanentemente sem apagar relações.
- exportação inclui snapshot de:
  - dados do usuário
  - personagens base
  - campanhas onde e dono/membro
  - preferências

## Campanhas

- campanha criada com `status: "ATIVA"`.
- acesso ao detalhe/lista de membros exige ser dono ou membro.
- apenas dono pode:
  - excluir campanha
  - adicionar membro
  - enviar convite
- criação de convite também válida:
  - email do convite não pode ser do dono da campanha
  - email do convite não pode ser de membro atual da campanha
  - não pode existir outro convite `PENDENTE` para o mesmo email na mesma campanha
  - geracao de `codigo` único com retry automático (até 5 tentativas)
- aceitar convite válida:
  - convite existe
  - convite está `PENDENTE`
  - email do usuário logado e igual ao email do convite
  - usuário ainda não é membro
- ao aceitar convite, membro entra com o `papel` salvo no convite (fallback `JOGADOR` para legados).
- aceite de convite ocorre em transacao (cria membro + marca convite como `ACEITO` no mesmo bloco atomico).
- personagem de campanha:
  - listagem de personagens-base disponíveis para associação:
    - `GET /campanhas/:id/personagens-base-disponíveis`
    - jogadores/observadores recebem apenas personagens próprios ainda não vinculados na campanha.
    - mestres recebem personagens dos participantes (dono + membros), excluindo os já vinculados.
  - associação de personagem-base (`POST /campanhas/:id/personagens`) exige acesso a campanha.
  - desassociação de personagem de campanha (`DELETE /campanhas/:id/personagens/:personagemCampanhaId`):
    - mestre pode desassociar qualquer ficha.
    - jogador/observador pode desassociar apenas ficha própria.
    - bloqueado quando a ficha já participou de sessão (`CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA`).
  - regra de limite:
    - jogadores/observadores: 1 personagem por usuário em cada campanha.
    - mestres (dono ou membro `MESTRE`): sem limite de quantidade de personagens na campanha.
  - jogador/observador só pode associar personagem-base próprio.
  - mestre da campanha (dono ou membro com papel `MESTRE`) pode associar personagem de qualquer participante da campanha.
  - editar ficha de campanha (`recursos` e `modificadores`) segue regra:
    - mestre edita qualquer ficha da campanha.
    - jogador/observador edita apenas a própria ficha.
  - modificadores são aplicados na ficha de campanha, sem alterar a ficha-base.
  - modificadores podem ser contextualizados por sessão/cena:
    - `sessaoId` válida se pertence a campanha.
    - `cenaId` válida se pertence a `sessaoId`.
    - `cenaId` sem `sessaoId` falha com `CENA_SESSAO_NOT_FOUND`.
  - cada modificador registra fonte (`nome`, `descricao`) e pode ser desfeito com segurança.
  - todo ajuste manual relevante gera histórico em `PersonagemCampanhaHistorico`.
- sessões de campanha:
  - apenas mestre (dono ou membro `MESTRE`) pode:
    - iniciar sessão
    - encerrar sessão
    - trocar cena
    - controlar turno (`avançar`, `voltar`, `pular`)
    - reordenar iniciativa
    - adicionar/editar/remover aliados/ameaças da cena
    - aplicar/remover condições na instância de personagem ou NPC da sessão
  - participantes da campanha podem:
    - abrir detalhe do lobby
    - listar/enviar mensagens no chat
  - detalhe da sessão inclui `participantes` da campanha (apelido/papel/ehDono) para o lobby.
  - detalhe da sessão inclui `iniciativa` com ordem unificada de personagens e aliados/ameaças da cena.
  - cada item de iniciativa retorna `valorIniciativa` inteiro.
  - ao reordenar iniciativa, os valores são normalizados com diferenca de 1 ponto por posicao (`+1/-1` entre vizinhos).
  - reordenação pode ser feita por botões ou drag-and-drop no painel do mestre.
  - iniciativa e por participante da cena (`PERSONAGEM` ou `NPC`), não por usuário.
  - status online da mesa é propagado por `sessao:presenca`.
  - frontend mantém polling de fallback para sincronizacao silenciosa quando websocket estiver indisponível.
  - regra de cena livre:
    - `LIVRE` não possui contagem de rodadas/turnos.
    - em `LIVRE`, detalhe retorna `rodadaAtual`, `indiceTurnoAtual`, `turnoAtual` e `iniciativa.indiceAtual` como `null`.
    - `POST /turno/avançar`, `POST /turno/voltar`, `POST /turno/pular` e `PATCH /iniciativa/ordem` em `LIVRE` falham com `SESSAO_TURNO_INDISPONIVEL`.
  - `PATCH /iniciativa/ordem` válida a lista exata de participantes da cena; payload divergente retorna `SESSAO_ORDEM_INICIATIVA_INVALIDA`.
  - visibilidade de cards:
    - mestre ve/edita todos os cards.
    - jogador ve card completo apenas do próprio personagem e cards resumidos dos demais.
  - cards completos retornam:
    - `tecnicaInata` com habilidades/variacoes filtradas por grau.
    - `tecnicasNaoInatas` habilitadas por grau (sem escolha manual do jogador).
    - `sustentacoesAtivas` por personagem da sessão.
    - `condicoesAtivas` por personagem da sessão.
  - uso de habilidades em sessão:
    - consumo imediato de `EA/PE` no momento do uso.
    - `acumulos` habilita escalonamento quando a habilidade/variação suporta acumulo, limitado pelo grau de aprimoramento da técnica.
    - escalonamento suporta custo adicional em `EA` e `PE` por acumulo.
    - escalonamento tipado (`escalonamentoTipo` + `escalonamentoEfeito`) permite representar dano, cura, regras e outros efeitos guiados.
    - habilidades sustentadas criam sustentação ativa vinculada ao personagem da sessão.
    - custo por rodada usa `custoSustentacaoEA` quando definido; fallback padrão `1 EA/rodada`.
    - sustentação passa a cobrar por rodada a partir da rodada seguinte a ativação.
    - ao avançar rodada, o backend cobra sustentação automáticamente e encerra se faltar `EA`.
    - limite de gasto por turno usa soma combinada `PE + EA` no turno atual.
    - exceção de limite: uso base (sem variação e sem acumulos) pode ultrapassar o limite apenas se for o primeiro uso do turno (`gasto atual = 0`).
    - após qualquer gasto no turno, novos usos (inclusive uso base) passam a respeitar o limite combinado normalmente.
    - encerramento manual da sustentação usa rota dedicada.
  - frontend aplica cooldown curto anti-duplo-clique no uso de habilidade/variação.
  - no lobby da sessão, as variações de habilidade são exibidas em bloco próprio com metadados de execução/alcance/alvo/duração, custo base e custo de sustentação por rodada.
  - habilidades e variações com sustentação ativa recebem marcador visual (`Ativa xN`) no próprio card de técnica.
  - cada card de personagem possui filtro rápido `Mostrar somente sustentadas ativas`, limitando a listagem para habilidades/variacoes atualmente sustentadas.
  - estado do filtro rápido e persistido em `localStorage` por `usuarioId + campanhaId + sessaoId`, mantendo preferência entre navegações.
  - painel central da sessão (cena/rodada/turno/status) é compartilhado para todos os participantes.
  - coluna direita do lobby concentra participantes online, timeline de eventos e chat.
  - timeline de eventos:
    - `GET /eventos` retorna eventos estruturados da sessão (chat opcional).
    - cada evento retorna `descricao`, `desfeito` e `podeDesfazer` (para mestres no último evento reversível da pilha).
  - desfazer seguro de evento:
    - apenas mestre pode desfazer.
    - apenas o último evento reversível ainda não desfeito pode ser revertido (LIFO).
    - eventos desfeitos recebem marcacao no JSON `dados` (`desfeito`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`).
    - tipos reversiveis atuais: `TURNO_AVANCADO`, `TURNO_RECUADO`, `TURNO_PULADO`, `ORDEM_INICIATIVA_ATUALIZADA`, `CENA_ATUALIZADA`, `NPC_ADICIONADO`, `NPC_ATUALIZADO`, `NPC_REMOVIDO`, `CONDICAO_APLICADA`, `CONDICAO_REMOVIDA`.
  - escudo do mestre (V1):
    - painel de consulta rápida com busca, modo `Resumo/Detalhado` e secoes recolhiveis.
    - inclui conteúdo operacional inicial para: perícias, condições, conflitos/expansão de domínio, dificuldades, teste unido, tipos de dano/ações, ferimentos, insanidade, situações especiais, multidões, interlúdio, investigação, furtividade, perseguição e aspectos congênitos.
    - modo detalhado preenchido em nível completo/literal para os tópicos operacionais da V1, com fallback para resumo quando necessário.
    - no modo detalhado, cada guia quebra automáticamente em subtopicos colapsaveis usando secoes markdown `##`.
    - tópico `Aspectos congenitos` foi atualizado com versão detalhada completa (dons especiais + restrições congenitas, com requisitos, bônus e limitações).
  - card editável da sessão oferece `Ajustes narrativos`, reaproveitando o modal de ficha de campanha com contexto de `sessaoId/cenaId`.
  - no modal contextualizado, o histórico permite filtros rápidos combinados:
    - contexto: `Todos`, `Sessão atual` e `Cena atual`.
    - tipo de evento: `Todos os tipos` + tipos presentes no histórico retornado.
  - aliados/ameaças em sessão:
    - cada instância fica vinculada a uma `cenaId` em `NpcAmeacaSessao`.
    - a cena atual retorna lista `npcs` junto do detalhe da sessão.
    - passivas/ações das instâncias são guias descritivos para o mestre (não aplicam automação de efeito).
    - cada instância também retorna `condicoesAtivas`.
  - condições em sessão:
    - aplicação manual aceita modos de duração `ATE_REMOVER`, `RODADAS` e `TURNOS_ALVO`.
    - expiracao automática ocorre quando `restanteDuracao` chega a zero (modos `RODADAS` e `TURNOS_ALVO`).
    - automações de recurso:
      - `MACHUCADO` quando `PV` fica em metade ou menos.
      - `MORRENDO` quando `PV` chega a `0` ou menos.
      - `CAIDO` junto com `MORRENDO` quando `PV` chega a `0` ou menos.
      - `ENLOUQUECENDO` quando `SAN` chega a `0` ou menos (personagem).

## Pontos de atencao

- `ConviteCampanha` agora persiste `papel`; aceitar convite aplica o papel salvo.
- DTOs `UpdateCampanhaDto`, `UpdateStatusCampanhaDto` e `AnswerConviteDto` existem, mas não ha rotas públicadas usando esses DTOs no controller atual.

## Erros esperados (codigos)

- auth:
  - `CREDENCIAIS_INVALIDAS`
  - `TOKEN_INVALIDO`
  - `USUARIO_NAO_AUTENTICADO`
  - `ACESSO_NEGADO`
- usuário:
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
- `PreferenciaUsuario.usuarioId` e `@unique` (1:1 com usuário).
- `MembroCampanha` possui `@@unique([campanhaId, usuarioId])`.
- `ConviteCampanha.codigo` e `@unique`.
- `PersonagemCampanha` possui:
  - `@@unique([campanhaId, personagemBaseId])`
  - `@@index([campanhaId, donoId])`
- `PersonagemCampanhaModificador` guarda modificadores narrativos com soft-undo (`ativo`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`) e contexto opcional (`sessaoId`, `cenaId`).
- `PersonagemCampanhaHistorico` guarda trilha de auditoria de alterações de ficha de campanha.
- `Sessao` guarda estado do lobby (`status`, `cenaAtualTipo`, `cenaAtualNome`, `rodadaAtual`, `indiceTurnoAtual`, `iniciadoEm`, `encerradoEm`).
- `Cena` versiona troca de cena por sessão.
- `EventoSessao` guarda eventos estruturados do lobby (chat, troca de cena, turno).
- `PersonagemSessao` representa cada personagem participante na sessão atual.
- `PersonagemSessaoHabilidadeSustentada` guarda sustentações ativas da sessão (custo/rodada, rodada de ativação e encerramento).
- `NpcAmeacaSessao` representa cada aliado/ameaça adicionado em uma cena da sessão.
- `Campanha.status` e `ConviteCampanha.status` são `String` no schema (não enum).

## Integracao frontend

- auth:
  - `apiRegister`, `apiLogin`, `apiGetMe`
- usuários:
  - estatisticas, preferências, alterar senha, exportar dados e excluir conta
- campanhas:
  - listar minhas, criar/excluir, detalhe, fluxo de convites
  - personagens de campanha (associação/edição/modificadores/histórico)
  - sessões de campanha (CRUD de lobby + chat + controle de cena/turno + timeline de eventos + desfazer seguro)
  - realtime do lobby (join, atualizações e presença) via `assistenterpg-front/src/lib/realtime/sessao-socket.ts`
  - listagem em `assistenterpg-front/src/app/campanhas/page.tsx` com preview modal antes da navegação completa

Arquivos:

- `assistenterpg-front/src/lib/api/auth.ts`
- `assistenterpg-front/src/lib/api/usuarios.ts`
- `assistenterpg-front/src/lib/api/campanhas.ts`
- `assistenterpg-front/src/components/campanha/CampaignPreviewModal.tsx`
- `assistenterpg-front/src/components/campanha/CampaignCard.tsx`
