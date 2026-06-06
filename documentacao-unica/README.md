# AssistenteRPG - Documentação Única (Front + Back)

Atualizado em: 2026-03-12

## 1. Objetivo e escopo

Esta pasta (`documentacao-unica/`) é a única fonte de verdade da documentação técnica do projeto.

Cobertura desta documentação:

- arquitetura do sistema (frontend + backend)
- execução local e variáveis de ambiente
- autenticação/autorização
- contrato HTTP da API (rotas, requests, filtros, respostas, erros)
- tipos de dados aceitos (DTOs, enums e formatos de payload)
- comportamentos esperados e regras de negócio
- comportamento de integração do frontend com o backend

## 1.1 Navegação por entidade

Para reduzir ambiguidade e facilitar manutenção, este README permanece como visão consolidada e os detalhes por entidade ficam nestes arquivos (na mesma pasta `documentacao-unica/`):

- matriz de acesso: [`entidades/autorização-matriz.md`](./entidades/autorização-matriz.md)
- auth/usuários/campanhas: [`entidades/auth-usuários-campanhas.md`](./entidades/auth-usuários-campanhas.md)
- catálogos de progressão (cla/classes/trilhas/caminhos/origens/habilidades): [`entidades/catalogos-progressao.md`](./entidades/catalogos-progressao.md)
- técnicas amaldiçoadas (técnica/habilidade/variação): [`entidades/tecnicas-amaldicoadas.md`](./entidades/tecnicas-amaldicoadas.md)
- catálogos menores (perícias/proficiências/tipos-grau/condições/alinhamentos): [`entidades/catálogos-menores.md`](./entidades/catálogos-menores.md)
- personagens-base (regras, payloads, import/export): [`entidades/personagens-base.md`](./entidades/personagens-base.md)
- npcs/ameaças (ficha simplificada): [`entidades/npcs-ameacas.md`](./entidades/npcs-ameacas.md)
- inventário (espaços, grau xama, vestir, modificações): [`entidades/inventario.md`](./entidades/inventario.md)
- equipamentos/modificações: [`entidades/equipamentos-modificações.md`](./entidades/equipamentos-modificações.md)
- compendio: [`entidades/compendio.md`](./entidades/compendio.md)
- suplementos/homebrews: [`entidades/suplementos-homebrews.md`](./entidades/suplementos-homebrews.md)
- erros de operação e debug (codigo -> ação): [`entidades/erros-operação-debug.md`](./entidades/erros-operação-debug.md)
- checklist de cobertura de erros (back x front): [`entidades/checklist-cobertura-erros-front-back.md`](./entidades/checklist-cobertura-erros-front-back.md)
- auditoria de consistência (docs x regras x schema): [`entidades/auditoria-consistência.md`](./entidades/auditoria-consistência.md)

## 2. Arquitetura

### 2.1 Backend

- Stack: NestJS 11 + Prisma + MySQL
- Entrada: [`assistenterpg-back/src/main.ts`](../assistenterpg-back/src/main.ts)
- Módulos principais: [`assistenterpg-back/src/app.module.ts`](../assistenterpg-back/src/app.module.ts)
- Swagger: `/docs` e `/docs/openapi.json` somente quando `SWAGGER_ENABLED=true`

Comportamentos globais do backend:

- `ValidationPipe` global com:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `enableImplicitConversion: true`
- filtros globais de erro:
  - [`HttpExceptionFilter`](../assistenterpg-back/src/common/filters/http-exception.filter.ts)
  - [`AllExceptionsFilter`](../assistenterpg-back/src/common/filters/all-exceptions.filter.ts)
- interceptores globais:
  - logging HTTP
  - timeout de 30s

### 2.2 Frontend

- Stack: Next.js 16 + React 19 + Axios
- Cliente API principal:
  - [`assistenterpg-front/src/lib/api/axios-client.ts`](../assistenterpg-front/src/lib/api/axios-client.ts)
  - [`assistenterpg-front/src/lib/api/index.ts`](../assistenterpg-front/src/lib/api/index.ts)
- Tipos compartilhados no front:
  - [`assistenterpg-front/src/lib/types/index.ts`](../assistenterpg-front/src/lib/types/index.ts)

Comportamentos globais do frontend:

- autenticação por cookies HttpOnly (`assistenterpg_access` e `assistenterpg_refresh`) com CSRF
- interceptor Axios usa `withCredentials`, envia `X-CSRF-Token` em mutações e tenta `/auth/refresh` uma vez em `401`
- resposta `401/403` definitiva limpa estado local e redireciona para `/auth/login`
- lobby de sessão usa WebSocket (`socket.io`) em `assistenterpg-front/src/lib/realtime/sessão-socket.ts`
- fallback de navegação com loading global em `assistenterpg-front/src/app/loading.tsx`
- skeletons de rota por módulo (`campanhas`, `homebrews`, `personagens-base`, `npcs-ameacas`, `compendio`, `suplementos`, `configuracoes`, `notificações`, `home`) via `loading.tsx`
- componente reútilizavel de skeleton: `assistenterpg-front/src/components/ui/RouteLoadingSkeleton.tsx`
- normalização de listas paginadas aceita:
  - array puro
  - envelope com `items`
  - envelope com `dados/paginação`

## 3. Execução local

## 3.1 Backend

Diretório: `assistenterpg-back/`

Scripts relevantes:

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run test`
- `npm run seed`

## 3.2 Frontend

Diretório: `assistenterpg-front/`

Scripts relevantes:

- `npm run dev` (porta 3001)
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run test:watch`

## 3.3 Variáveis de ambiente

### Backend

- `PORT` (padrão: `3000`)
- `PORT_AUTO_RETRY` (`true/false`)
- `PORT_AUTO_RETRY_MAX` (padrão: `10`)
- `CORS_ORIGINS` (CSV, padrão `http://localhost:3001`)
- `SWAGGER_ENABLED` (`true` liga; qualquer outro valor desliga)
- `API_VERSION` (padrão `v1`)
- `JWT_SECRET` (obrigatório em produção)
- `NODE_ENV`
- `DATABASE_URL` (obrigatório para Prisma)
- `FRONTEND_URL` (base para links de email, padrão `http://localhost:3001`)
- `AUTH_COOKIE_SAME_SITE` (`lax|strict|none`; em produção cross-site use `none`)
- `AUTH_COOKIE_SECURE` (`true` obrigatório quando `AUTH_COOKIE_SAME_SITE=none`)
- `AUTH_BEARER_FALLBACK_ENABLED` (`true` habilita fallback Bearer; em produção deve ficar desligado por padrão)
- `TRUST_PROXY_HOPS` (`0` local; `1` no Render/reverse proxy confiável)
- `AUTH_RATE_LIMIT_HASH_SECRET` (obrigatório em produção, mínimo 32 caracteres)
- `AUTH_EMAIL_MODE` (`ethereal|smtp|console|resend`)
- `AUTH_EMAIL_FROM` (remetente exibido nos emails)
- `AUTH_EMAIL_FROM_NAME` (nome exibido no remetente)
- `RESEND_API_KEY` (obrigatório quando `AUTH_EMAIL_MODE=resend`)
- `AUTH_SMTP_HOST`, `AUTH_SMTP_PORT`, `AUTH_SMTP_SECURE`, `AUTH_SMTP_USER`, `AUTH_SMTP_PASS` (SMTP)
- `AUTH_RESET_TOKEN_TTL_MINUTES`, `AUTH_VERIFY_TOKEN_TTL_MINUTES`
- `AUTH_PENDING_REGISTRATION_TTL_HOURS`, `AUTH_EMAIL_CHANGE_TOKEN_TTL_MINUTES`
- `AUTH_WS_SESSION_RECHECK_SECONDS`
- `AUTH_SECURITY_CLEANUP_INTERVAL_MINUTES`, `AUTH_SECURITY_RETENTION_DAYS`
- `PRISMA_PREBUILD_AUTO_GENERATE` (`false` desliga tentativa automática de `prisma generate` no prebuild)

### Frontend

- `NEXT_PUBLIC_API_URL` (padrão: `http://localhost:3000`)

## 3.4 Notas de build

- backend:
  - `npm run build` executa `prebuild` e valida Prisma Client antes de compilar
  - se o client estiver desatualizado, o script tenta `prisma generate` (quando `PRISMA_PREBUILD_AUTO_GENERATE != false`)
- frontend:
  - rotas do compendio usam fallback seguro quando a API estiver indisponível durante build SSR
  - em indisponibilidade de API, `/compendio` renderiza estado vazio em vez de quebrar o `next build`

## 4. Contrato HTTP global

## 4.1 Autenticação e autorização

Login:

- `POST /auth/login` retorna:
  - `usuário` (`id`, `apelido`, `email`, `role`)
  - cookies HttpOnly de sessão e cookie CSRF legível pelo cliente

Registro:

- `POST /auth/register`

Proteção de rotas:

- sessão autenticada obrigatória na maioria das rotas de domínio
- backend extrai o access token do cookie HttpOnly; fallback Bearer existe apenas quando explícitamente habilitado
- admin guard aplicado em:
  - `POST /suplementos`
  - `PATCH /suplementos/:id`
  - `DELETE /suplementos/:id`
  - rotas de escrita de `classes`, `clas`, `origens`, `trilhas` e `habilidades`
  - rotas de escrita de `equipamentos`
  - rotas de escrita de `modificações`
  - rotas de escrita de `compendio` (categorias/subcategorias/artigos)
  - rotas de escrita de `tecnicas-amaldicoadas` (técnicas/habilidades/variacoes)
  - rotas de escrita de `proficiencias`, `tipos-grau` e `condicoes`

Observações importantes:

- `equipamentos`: leitura pública; escrita com `JWT+Admin`
- `modificações`: leitura com `JWT`; escrita com `JWT+Admin`
- `compendio`: leitura pública; escrita com `JWT+Admin`
- `tecnicas-amaldicoadas`: leitura com `JWT`; escrita com `JWT+Admin`
- `proficiencias`, `tipos-grau` e `condicoes`: leitura com `JWT`; escrita com `JWT+Admin`
- `classes`, `clas`, `origens`, `trilhas` e `habilidades`: leitura com `JWT`; escrita com `JWT+Admin`

## 4.2 Formato padrão de erro

Envelope de erro esperado (global):

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-08T12:00:00.000Z",
  "path": "/rota",
  "method": "POST",
  "traceId": "7f8a36b6-3f2f-45b0-9f76-5d0f5d01f31c",
  "code": "CODIGO_ERRO",
  "error": "Bad Request",
  "message": "Mensagem",
  "details": {},
  "field": "campo"
}
```

Observações:

- resposta de erro retorna `traceId` e também envia o header `x-request-id`
- campo `error` segue o nome HTTP padrão (`Bad Request`, `Unauthorized`, etc.)
- para validação de DTO (`400`), o backend usa `code: VALIDATION_ERROR` e inclui `details.validationErrors`
- para validação de DTO (`400`), o backend tenta inferir `field` com base na primeira mensagem de validação (ex.: `quantidade`)
- para validação de params/query por pipes (ex.: `ParseIntPipe`), o backend também usa `code: VALIDATION_ERROR`; `field` pode vir ausente quando a mensagem não identifica o nome do campo
- para validações de `fonte/suplementoId`, os codigos esperados são `FONTE_SUPLEMENTO_OBRIGATORIA` e `SUPLEMENTO_ID_OBRIGATORIO`
- em `NODE_ENV=development`, o backend pode incluir `stack` e `errorType`
- mapa de erro por entidade e ação de debug: [`entidades/erros-operação-debug.md`](./entidades/erros-operação-debug.md)

No frontend:

- `ApiError` encapsula `status`, `code`, `body`, `method`, `endpoint` e `requestId`
- `error-handler.ts` traduz codigos conhecidos para mensagens amigáveis
- `extrairContextoErro` consolida contexto técnico (status/code/metodo/endpoint/requestId)
- `formatarErroComContexto` pode anexar contexto técnico na mensagem final para debug de tela

## 4.3 Paginação e envelopes de lista

Ha dois padroes de lista no backend hoje:

1. Padrão `items/total/page/limit/totalPages`
2. Padrão `dados/paginação` com:
   - `paginação.pagina`
   - `paginação.limite`
   - `paginação.total`
   - `paginação.totalPaginas`

No frontend, `normalizeListResult` converte ambos para:

```ts
type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

## 5. Rotas e contratos por módulo

Legendas:

- `Auth: Publica` = sem JWT
- `Auth: JWT` = exige token
- `Auth: JWT+Admin` = exige token com role admin

## 5.1 Saude

- `GET /` - `Auth: Publica`
  - resposta: string (`Hello World!`)

Detalhamento:

- endpoint simples de disponibilidade da API
- usado como verificador básico de deploy/uptime (sem dependência de auth)

## 5.2 Auth

- `POST /auth/register` - `Auth: Publica`
  - body: [`RegisterDto`](../assistenterpg-back/src/auth/dto/register.dto.ts)
    - `apelido: string`
    - `email: email`
    - `senha: string` (min 8)
  - resposta: `{ mensagem }` genérica; o usuário só é criado após verificar o email

- `POST /auth/login` - `Auth: Publica`
  - body: [`LoginDto`](../assistenterpg-back/src/auth/dto/login.dto.ts)
  - resposta: [`LoginResponse`](../assistenterpg-front/src/lib/types/auth.types.ts)

- `POST /auth/forgot-password` - `Auth: Publica`
  - body: `ForgotPasswordDto` (`email`)
  - resposta: `{ mensagem }` (sempre genérica)

- `POST /auth/reset-password` - `Auth: Publica`
  - body: `ResetPasswordDto` (`token`, `novaSenha`)
  - resposta: `{ mensagem }`

- `POST /auth/verify-email` - `Auth: Publica`
  - body: `VerifyEmailDto` (`token`)
  - resposta: `{ mensagem }`

- `POST /auth/resend-verification-email` - `Auth: Publica`
  - body: `ResendVerificationEmailDto` (`email`)
  - resposta: `{ mensagem }` (sempre genérica)

- `POST /auth/verify-email-change` - `Auth: Publica`
  - body: `{ token }`
  - confirma o novo email e revoga todas as sessões

- `POST /auth/reactivate-account` - `Auth: Publica`
  - body: `{ email, senha }`
  - reativa apenas contas com status `DESATIVADA`

Detalhamento:

- `POST /auth/register`
  - cria `RegistroPendenteUsuario` com senha e token armazenados somente como hash
  - não sobrescreve dados de um pré-registro ativo e responde genericamente
  - `POST /auth/verify-email` promove o pré-registro para `Usuario` em transação
  - usuários legados não verificados continuam compatíveis temporariamente
- `POST /auth/login`
  - valida email/senha sem revelar se o email existe
  - exige email verificado (`AUTH_EMAIL_NAO_VERIFICADO` quando pendente)
  - retorno:
    - `usuário` (`id`, `email`, `apelido`, `role`, `emailVerificado`)
  - seta cookies de access/refresh HttpOnly e cookie CSRF
  - erro esperado: `CREDENCIAIS_INVALIDAS` (401) para qualquer falha de credencial
  - erro esperado: `AUTH_EMAIL_NAO_VERIFICADO` (403) para conta ainda não verificada

- `GET /auth/csrf`
  - retorna `{ csrfToken }`
  - exige sessão por cookie access ou refresh
- `POST /auth/refresh`
  - renova a sessão via refresh cookie e CSRF
  - rotaciona refresh token persistido como hash no banco e preserva a família da sessão
- `POST /auth/logout`
  - revoga toda a família da sessão atual e limpa cookies

- tokens de auth por email:
  - recuperação de senha e verificação de email usam tokens de uso único (`auth_tokens` no banco)
  - codigos: `AUTH_TOKEN_INVALIDO_OU_EXPIRADO` para link inválido/usado/expirado
  - reset, troca de senha, confirmação de email, desativação e exclusão revogam sessões antigas
- rate limit de segurança:
  - aplicado somente em endpoints sensíveis, por IP e por email/token/usuário conforme a ação
  - buckets compartilhados ficam em `limites_requisicao_seguranca`, com identificadores protegidos por HMAC
  - bloqueios retornam `429` e `Retry-After`
- envio de email:
  - `AUTH_EMAIL_MODE=ethereal` (apenas desenvolvimento/testes; não registra preview)
  - `AUTH_EMAIL_MODE=smtp` (envio real, depende do provedor SMTP configurado)
  - `AUTH_EMAIL_MODE=resend` (envio via HTTP usando `RESEND_API_KEY`)
  - `AUTH_EMAIL_MODE=console` (apenas desenvolvimento/testes; não registra corpo ou link)
  - `console` e `ethereal` são proibidos em produção
  - sem domínio próprio:
    - use uma conta real (ex.: Gmail) em `AUTH_SMTP_USER`
    - use senha de app em `AUTH_SMTP_PASS`
    - deixe `AUTH_EMAIL_FROM` vazio para usar automáticamente o `AUTH_SMTP_USER` como remetente
  - Resend:
    - defina `RESEND_API_KEY` e `AUTH_EMAIL_FROM` (ex.: `onboarding@resend.dev` para testes)

Integração frontend:

- [`assistenterpg-front/src/lib/api/auth.ts`](../assistenterpg-front/src/lib/api/auth.ts) cobre `register`, `login` e `get me` (via `/usuários/me`).

## 5.3 Usuários

Todas as rotas `Auth: JWT`:

- `GET /usuários/me`
- `GET /usuários/me/estatisticas`
- `GET /usuários/me/preferências`
- `PATCH /usuários/me/preferências`
  - body: [`AtualizarPreferênciasDto`](../assistenterpg-back/src/usuario/dto/atualizar-preferencias.dto.ts)
- `PATCH /usuários/me/senha`
  - body: [`AlterarSenhaDto`](../assistenterpg-back/src/usuario/dto/alterar-senha.dto.ts)
- `PATCH /usuários/me/email`
  - body: `{ novoEmail, senhaAtual }`
- `POST /usuários/me/desativar`
  - body: `{ senhaAtual }`
- `GET /usuários/me/exportar`
  - resposta: JSON para download
- `DELETE /usuários/me`
  - body: [`ExcluirContaDto`](../assistenterpg-back/src/usuario/dto/excluir-conta.dto.ts)

Detalhamento:

- `GET /usuários/me`
  - retorna perfil do usuário autenticado sem `senhaHash`
  - campos principais: `id`, `apelido`, `email`, `role`, `criadoEm`, `atualizadoEm`
- `GET /usuários/me/estatisticas`
  - retorno esperado:
    - `campanhas`
    - `personagens`
    - `artigosLidos` (atualmente sempre `0`)
- `GET /usuários/me/preferências`
  - retorna preferências do usuário
  - se não houver registro, o backend cria um com defaults e retorna
- `PATCH /usuários/me/preferências`
  - body: [`AtualizarPreferênciasDto`](../assistenterpg-back/src/usuario/dto/atualizar-preferencias.dto.ts)
    - `notificaçõesEmail?`, `notificaçõesPush?`, `notificaçõesConvites?`, `notificaçõesAtualizações?` (boolean)
    - `idioma?` (string)
  - persistencia via `upsert`
- `PATCH /usuários/me/senha`
  - body: [`AlterarSenhaDto`](../assistenterpg-back/src/usuario/dto/alterar-senha.dto.ts)
    - `senhaAtual` (string)
    - `novaSenha` (string, min 8)
  - retorno de sucesso: `{ "mensagem": "Senha alterada com sucesso" }`
  - erro esperado: `USUARIO_SENHA_INCORRETA` (401)
  - atualiza a senha e revoga todas as sessões/tokens antigos
- `PATCH /usuários/me/email`
  - valida senha atual e envia confirmação para o novo endereço
  - o email só muda após `POST /auth/verify-email-change`
- `POST /usuários/me/desativar`
  - valida senha atual, marca a conta como `DESATIVADA` e revoga acessos
- `GET /usuários/me/exportar`
  - headers de download: `Content-Disposition: attachment; filename=\"dados-assistenterpg.json\"`
  - retorna snapshot com:
    - dados básicos do usuário
    - personagens
    - campanhas (como dono/membro)
    - preferências
- `DELETE /usuários/me`
  - body: [`ExcluirContaDto`](../assistenterpg-back/src/usuario/dto/excluir-conta.dto.ts)
  - valida senha e anonimiza permanentemente email, apelido e credencial
  - preserva relações/conteúdo existentes e marca a conta como `EXCLUIDA`

Integração frontend:

- [`assistenterpg-front/src/lib/api/usuários.ts`](../assistenterpg-front/src/lib/api/usuários.ts) cobre:
  - estatisticas
  - preferências (get/patch)
  - alteração de senha
  - exportação de dados (download `blob`)
  - exclusão da conta

## 5.4 Campanhas

Controller com `AuthGuard('jwt')` no nível de classe (`Auth: JWT`):

- `POST /campanhas`
  - body: [`CreateCampanhaDto`](../assistenterpg-back/src/campanha/dto/create-campanha.dto.ts)
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit`
  - resposta: array ou paginado (`items`)
- `GET /campanhas/:id`
- `DELETE /campanhas/:id`
- `GET /campanhas/:id/membros`
- `POST /campanhas/:id/membros`
  - body: [`AddMembroDto`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
- `POST /campanhas/:id/convites`
  - body: [`CreateConviteDto`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
- `GET /campanhas/convites/pendentes`
- `POST /campanhas/convites/:codigo/aceitar`
- `POST /campanhas/convites/:codigo/recusar`
- `GET /campanhas/:id/personagens`
- `POST /campanhas/:id/personagens`
  - body: [`VincularPersonagemCampanhaDto`](../assistenterpg-back/src/campanha/dto/vincular-personagem-campanha.dto.ts)
- `PATCH /campanhas/:id/personagens/:personagemCampanhaId/recursos`
  - body: [`AtualizarRecursosPersonagemCampanhaDto`](../assistenterpg-back/src/campanha/dto/atualizar-recursos-personagem-campanha.dto.ts)
- `GET /campanhas/:id/personagens/:personagemCampanhaId/modificadores`
  - query opcional: `incluirInativos=true|false`, `sessaoId`, `cenaId`
- `POST /campanhas/:id/personagens/:personagemCampanhaId/modificadores`
  - body: [`AplicarModificadorPersonagemCampanhaDto`](../assistenterpg-back/src/campanha/dto/aplicar-modificador-personagem-campanha.dto.ts)
    - `sessaoId?`, `cenaId?` (contexto opcional de sessão/cena)
- `POST /campanhas/:id/personagens/:personagemCampanhaId/modificadores/:modificadorId/desfazer`
  - body opcional: [`DesfazerModificadorPersonagemCampanhaDto`](../assistenterpg-back/src/campanha/dto/desfazer-modificador-personagem-campanha.dto.ts)
- `GET /campanhas/:id/personagens/:personagemCampanhaId/historico`
- `GET /campanhas/:id/sessoes`
- `POST /campanhas/:id/sessoes`
  - body: [`CreateSessaoCampanhaDto`](../assistenterpg-back/src/sessao/dto/create-sessao-campanha.dto.ts)
- `GET /campanhas/:id/sessoes/:sessaoId`
- `PATCH /campanhas/:id/sessoes/:sessaoId/cena`
  - body: [`AtualizarCenaSessaoDto`](../assistenterpg-back/src/sessao/dto/atualizar-cena-sessao.dto.ts)
- `POST /campanhas/:id/sessoes/:sessaoId/turno/avançar`
- `POST /campanhas/:id/sessoes/:sessaoId/turno/voltar`
- `POST /campanhas/:id/sessoes/:sessaoId/turno/pular`
- `PATCH /campanhas/:id/sessoes/:sessaoId/iniciativa/ordem`
  - body: [`AtualizarOrdemIniciativaSessaoDto`](../assistenterpg-back/src/sessao/dto/atualizar-ordem-iniciativa-sessao.dto.ts)
- `GET /campanhas/:id/sessoes/:sessaoId/chat?afterId=`
- `POST /campanhas/:id/sessoes/:sessaoId/chat`
  - body: [`EnviarChatSessaoDto`](../assistenterpg-back/src/sessao/dto/enviar-chat-sessao.dto.ts)
- `GET /campanhas/:id/sessoes/:sessaoId/eventos`
  - query opcional: `limit` (1..200), `incluirChat` (`true|false`)
- `POST /campanhas/:id/sessoes/:sessaoId/eventos/:eventoId/desfazer`
  - body opcional: [`DesfazerEventoSessaoDto`](../assistenterpg-back/src/sessao/dto/desfazer-evento-sessao.dto.ts)
- rolagens de perícia (UI da sessão):
  - perícias podem ser roladas com regra de maior/menor para d20 multiplos
  - o chat recebe marcador `dice:v4` com `keepMode` (`HIGHEST|LOWEST|SUM`)
- `POST /campanhas/:id/sessoes/:sessaoId/npcs`
  - body: [`AdicionarNpcSessaoDto`](../assistenterpg-back/src/sessao/dto/adicionar-npc-sessao.dto.ts)
- `PATCH /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
  - body: [`AtualizarNpcSessaoDto`](../assistenterpg-back/src/sessao/dto/atualizar-npc-sessao.dto.ts)
- `DELETE /campanhas/:id/sessoes/:sessaoId/npcs/:npcSessaoId`
- `POST /campanhas/:id/sessoes/:sessaoId/personagens/:personagemSessaoId/habilidades/usar`
  - body: [`UsarHabilidadeSessaoDto`](../assistenterpg-back/src/sessao/dto/usar-habilidade-sessao.dto.ts)
    - `habilidadeTecnicaId`: int `>= 1`
    - `variaçãoHabilidadeId?`: int `>= 1`
    - `acumulos?`: int `>= 0`
- `POST /campanhas/:id/sessoes/:sessaoId/personagens/:personagemSessaoId/sustentações/:sustentaçãoId/encerrar`
  - body opcional: [`EncerrarSustentacaoSessaoDto`](../assistenterpg-back/src/sessao/dto/encerrar-sustentacao-sessao.dto.ts)
- canal realtime de sessão (WebSocket):
  - namespace: `/sessoes`
  - evento cliente -> servidor: `sessão:join` (`{ campanhaId, sessaoId }`)
  - eventos servidor -> cliente:
    - `sessão:joined`
    - `sessão:erro`
    - `sessão:atualizada` (`CHAT_NOVA | CENA_ATUALIZADA | TURNO_AVANCADO | TURNO_RECUADO | TURNO_PULADO | ORDEM_INICIATIVA_ATUALIZADA | NPC_ATUALIZADO | SESSAO_ENCERRADA | SESSAO_EVENTO_DESFEITO | HABILIDADE_USADA | HABILIDADE_SUSTENTADA_ENCERRADA`)
    - `sessão:presença` (`onlineUsuarioIds`)

Regra de negócio relevante:

- convites e acesso validam dono/membro e email do usuário

Detalhamento:

- `POST /campanhas`
  - body: [`CreateCampanhaDto`](../assistenterpg-back/src/campanha/dto/create-campanha.dto.ts)
    - `nome`: string obrigatória, min 3, max 100
    - `descricao?`: string opcional, max 500
  - cria campanha com `status: "ATIVA"` e inclui contadores
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit` ([`PaginationQueryDto`](../assistenterpg-back/src/common/dto/pagination-query.dto.ts))
  - sem paginação: retorna array
  - com paginação: retorna envelope `{ items, total, page, limit, totalPages }`
- `GET /campanhas/:id`
  - exige que usuário seja dono ou membro
  - inclui `dono`, `membros` e `_count` de personagens/sessões
  - erro esperado: `CAMPANHA_ACESSO_NEGADO` (422)
- `DELETE /campanhas/:id`
  - apenas dono pode excluir
  - sucesso: `{ "message": "Campanha excluida com sucesso", "id": <campanhaId> }`
  - erro esperado: `CAMPANHA_APENAS_DONO` (422)
- `GET /campanhas/:id/membros`
  - exige acesso a campanha (dono ou membro)
- `POST /campanhas/:id/membros`
  - body: [`AddMembroDto`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
    - `usuarioId` inteiro `>= 1`
    - `papel`: `MESTRE | JOGADOR | OBSERVADOR`
  - apenas dono pode gerenciar membros
- convites:
  - `POST /campanhas/:id/convites`
    - body: [`CreateConviteDto`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
    - campos:
      - `email` (email obrigatório)
      - `papel` (`MESTRE | JOGADOR | OBSERVADOR`)
    - regras de negócio adicionais:
      - apenas o dono da campanha pode enviar convite
      - bloqueia convite para o email do dono da campanha
      - bloqueia convite para usuário que já e membro da campanha
      - bloqueia convite pendente duplicado para o mesmo email na mesma campanha
      - gera `codigo` único com retry automático (até 5 tentativas em colisao)
  - `GET /campanhas/convites/pendentes`
    - retorna convites pendentes para o email do usuário logado
  - `POST /campanhas/convites/:codigo/aceitar`
    - valida codigo pendente e email do usuário
    - cria membro com o `papel` salvo no convite (fallback `JOGADOR` para dados legados)
    - aplica transação para criar membro e marcar convite como `ACEITO` de forma atomica
  - `POST /campanhas/convites/:codigo/recusar`
    - marca convite como `RECUSADO`
- erros esperados de convite:
  - `CONVITE_NOT_FOUND` (404)
  - `CONVITE_INVALIDO` (422)
  - `CONVITE_NAO_PERTENCE_USUARIO` (422)
  - `CONVITE_DUPLICADO_PENDENTE` (422)
  - `CONVITE_CODIGO_INDISPONIVEL` (500)
- personagens de campanha:
  - `GET /campanhas/:id/personagens-base-disponíveis` retorna os personagens-base elegiveis para associação:
    - jogadores/observadores recebem apenas os próprios personagens ainda não associados.
    - mestres (dono ou membro `MESTRE`) recebem personagens dos participantes da campanha (incluindo dono), excluindo os já associados.
  - associação de personagem-base:
    - jogadores e observadores seguem limite de 1 personagem por usuário na campanha.
    - mestres (dono ou membro com papel `MESTRE`) podem associar multiplos personagens.
  - desassociação de personagem-base:
    - `DELETE /campanhas/:id/personagens/:personagemCampanhaId`
    - mestre pode desassociar qualquer ficha; jogador/observador desassocia apenas a própria.
    - bloqueia desassociação quando a ficha já participou de sessão (`CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA`).
  - mestres (dono ou membro com papel `MESTRE`) podem editar qualquer ficha da campanha.
  - jogadores/observadores editam apenas a própria ficha da campanha.
  - modificadores alteram apenas `PersonagemCampanha` (não alteram `PersonagemBase`).
  - modificadores podem ser contextualizados por sessão/cena:
    - `sessaoId` precisa pertencer a campanha.
    - `cenaId` precisa pertencer a `sessaoId`.
    - `cenaId` sem `sessaoId` retorna `CENA_SESSAO_NOT_FOUND`.
  - cada modificador guarda fonte (`nome`, `descricao`) e pode ser desfeito com segurança.
  - histórico de alterações e persistido em `PersonagemCampanhaHistorico`.
- sessões de campanha:
  - apenas mestre pode iniciar sessão, atualizar cena e controlar turno (`avançar`, `voltar`, `pular`).
  - apenas mestre pode reordenar manualmente a iniciativa (`PATCH /iniciativa/ordem`).
  - apenas mestre pode encerrar sessão (`POST /campanhas/:id/sessoes/:sessaoId/encerrar`).
  - doo e membros podem entrar no lobby e usar chat.
  - detalhe da sessão retorna `participantes` da campanha (apelido/papel/flag de dono).
  - detalhe da sessão retorna `iniciativa` com ordem unificada de personagens + aliados/ameaças da cena atual.
  - cada participante da iniciativa inclui `valorIniciativa` (inteiro) para leitura de mesa.
  - ao reordenar iniciativa, a INI e normalizada em passos de 1 ponto entre vizinhos (regra `+1/-1` por posicao).
  - reordenação pode ser feita por botões (subir/descer) e drag-and-drop no lobby do mestre.
  - iniciativa e controlada por participante da cena (personagem/NPC), não por usuário.
  - presença online do lobby é sincronizada por WebSocket (`sessão:presença`).
  - frontend mantém polling de fallback (3s desconectado / 15s conectado) para resiliencia quando o socket cair.
  - `LIVRE` não usa contagem de rodada/turno.
  - em `LIVRE`, `turnoAtual`, `rodadaAtual`, `indiceTurnoAtual` e `iniciativa.indiceAtual` retornam `null` no detalhe.
  - `POST /turno/avançar`, `POST /turno/voltar`, `POST /turno/pular` e `PATCH /iniciativa/ordem` em `LIVRE` retornam erro de negócio (`SESSAO_TURNO_INDISPONIVEL`).
  - `PATCH /iniciativa/ordem` valida o conjunto exato de participantes em cena; payload inválido retorna `SESSAO_ORDEM_INICIATIVA_INVALIDA`.
  - cards da sessão respeitam permissão:
    - mestre ve/edita todos.
    - jogador edita apenas o próprio card e ve os demais em modo resumido.
  - cards completos da sessão incluem:
    - `tecnicaInata` (com habilidades/variacoes filtradas por graus)
    - `técnicasNãoInatas` (habilitadas por grau; sem escolha manual do jogador)
    - `sustentaçõesAtivas` por personagem da sessão
  - uso de habilidades em sessão:
    - `POST /personagens/:personagemSessaoId/habilidades/usar` consome custo imediato de `EA/PE`.
    - `acumulos` aplica escalonamento quando a habilidade/variação suporta acumulo; o limite segue o grau de aprimoramento vinculado.
    - escalonamento pode cobrar custo extra em `EA` e `PE` por acumulo (`escalonamentoCustoEA` e `escalonamentoCustoPE`).
    - escalonamento tipado (`escalonamentoTipo` + `escalonamentoEfeito`) suporta casos de dano, cura, regras de barreira e outros efeitos guiados.
    - para habilidades sustentadas, cria sustentação ativa com custo por rodada.
    - custo de sustentação usa `custoSustentaçãoEA` e `custoSustentaçãoPE` da habilidade/variação; fallback padrão `1 EA/rodada` e `0 PE/rodada`.
    - custo de sustentação inicia no uso e passa a cobrar por rodada a partir da rodada seguinte.
    - quando a rodada avanca, o backend cobra sustentação automáticamente e encerra se faltar `EA` ou `PE`.
    - limite por turno usa a soma combinada `PE + EA` do turno atual do participante.
    - exceção: uso base (sem variação e sem acumulos) ignora validação de limite por turno.
    - encerramento manual usa `POST /sustentações/:sustentaçãoId/encerrar`.
  - frontend aplica trava anti-clique para uso de habilidade (cooldown curto de segurança) para evitar gasto duplicado acidental.
  - no card de técnicas do lobby, variações de habilidade exibem metadados e custos completos (incluindo sustentação/rodada quando aplicável), mantendo ação rapida de uso.
  - habilidades/variacoes com sustentação ativa exibem marcador visual de quantidade (`Ativa xN`) no próprio bloco.
  - cada card de personagem no lobby possui filtro `Mostrar somente sustentadas ativas` para focar apenas habilidades/variacoes atualmente sustentadas.
  - preferencia desse filtro e salva em `localStorage` por usuário/sessão (`usuarioId + campanhaId + sessaoId`).
  - painel central da sessão (cena atual, rodada/turo e status) é visível para todos.
  - coluna direita do lobby concentra participantes online, timeline de eventos e chat.
  - escudo do mestre (coluna esquerda para mestres) possui busca, modo `Resumo/Detalhado` e secoes recolhiveis com guias operacionais da mesa.
  - no modo detalhado, cada guia organiza subtopicos em acordeoes internos automáticos (baseados em secoes `##`), para leitura rapida em mesa.
  - no modo detalhado, os tópicos operacionais principais já estão preenchidos (perícias, condições, domínios, dificuldades, teste unido, tipos de dano/ações, ferimentos, insanidade, situações especiais, multidões, interlúdio, investigação, furtividade e perseguição).
  - timeline operacional da sessão (`GET /eventos`) traz eventos estruturados (cena/turno/npc/chat opcional).
  - desfazer evento de sessão (`POST /eventos/:eventoId/desfazer`) segue regra de segurança:
    - apenas mestre pode desfazer.
    - apenas o último evento reversível ainda não desfeito pode ser revertido (modelo pilha/LIFO).
    - eventos já desfeitos ficam marcados no `dados` (`desfeito`, `desfeitoEm`, `desfeitoPorId`, `motivoDesfazer`).
    - tipos reversiveis atuais: `TURNO_AVANCADO`, `TURNO_RECUADO`, `TURNO_PULADO`, `ORDEM_INICIATIVA_ATUALIZADA`, `CENA_ATUALIZADA`, `NPC_ADICIONADO`, `NPC_ATUALIZADO`, `NPC_REMOVIDO`.
  - no lobby, o botão `Ajustes narrativos` do card abre o mesmo modal de edição da ficha de campanha, já contextualizado com `sessaoId/cenaId` atuais.
  - no modal contextualizado, o histórico possui filtros rápidos combinados:
    - contexto: `Todos`, `Sessão atual` e `Cena atual`.
    - tipo de evento: `Todos os tipos` + tipos retornados no histórico (ex.: `MODIFICADOR_APLICADO`, `MODIFICADOR_DESFEITO`, `RECURSOS_ATUALIZADOS`).
  - Aliados/Ameacas em sessão:
    - apenas mestre adiciona/edita/remove na cena atual.
    - cada instância fica vinculada a uma `cenaId`.
    - `passivas` e `ações` são guias de mesa (não há automação mecânica).
- erros esperados de personagem/modificador de campanha:
  - `CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA` (422)
  - `CAMPANHA_PERSONAGEM_LIMITE_USUARIO` (422)
  - `CAMPANHA_PERSONAGEM_EDICAO_NEGADA` (422)
  - `CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA` (422)
  - `PERSONAGEM_CAMPANHA_NOT_FOUND` (404)
  - `CAMPANHA_MODIFICADOR_NOT_FOUND` (404)
  - `CAMPANHA_MODIFICADOR_JA_DESFEITO` (422)
  - `CAMPANHA_APENAS_MESTRE` (422)
  - `SESSAO_CAMPANHA_NOT_FOUND` (404)
  - `CENA_SESSAO_NOT_FOUND` (404)
  - `SESSAO_TURNO_INDISPONIVEL` (422)
  - `SESSAO_ORDEM_INICIATIVA_INVALIDA` (422)
  - `SESSAO_EVENTO_NOT_FOUND` (404)
  - `SESSAO_EVENTO_DESFAZER_NAO_PERMITIDO` (422)
  - `SESSAO_HABILIDADE_NAO_DISPONIVEL` (422)
  - `SESSAO_RECURSO_INSUFICIENTE` (422)
  - `SESSAO_VARIACAO_HABILIDADE_NOT_FOUND` (422)
  - `SESSAO_HABILIDADE_SEM_ESCALONAMENTO` (422)
  - `SESSAO_ACUMULO_EXCEDE_GRAU` (422)
  - `SESSAO_LIMITE_PEEA_EXCEDIDO` (422)
  - `SESSAO_SUSTENTACAO_NOT_FOUND` (422)
  - `NPC_AMEACA_NOT_FOUND` (404)
  - `NPC_SESSAO_NOT_FOUND` (404)

Integração frontend:

- [`assistenterpg-front/src/lib/api/campanhas.ts`](../assistenterpg-front/src/lib/api/campanhas.ts) cobre:
  - listagem de campanhas do usuário
  - criação e exclusão
  - detalhe de campanha
  - fluxo de convite (criar/listar pendentes/aceitar/recusar)
  - personagens de campanha (listar, associar, atualizar recursos, aplicar/desfazer modificadores, histórico)
  - listagem de personagens-base disponíveis por campanha para suportar associação por mestres
  - sessões de campanha (listar, criar, detalhe, atualizar cena, controlar turno `avançar/voltar/pular`, reordenar iniciativa, listar/enviar chat, listar timeline de eventos, desfazer último evento reversível)
  - realtime de sessões (join/presença/eventos) via `assistenterpg-front/src/lib/realtime/sessão-socket.ts`
  - notificação local de atualização de pendencias de convite (`apiInscreverAtualizaçãoConvitesPendentes` / `apiNotificarConvitesPendentesAtualizados`) para manter badge da navbar sincronizado
  - sugestão de associação de personagem ao entrar na campanha (não obrigatória) no componente [`CampaignCharactersSection`](../assistenterpg-front/src/components/campanha/CampaignCharactersSection.tsx)

## 5.5 Personagens base

Detalhamento por entidade: [`entidades/personagens-base.md`](./entidades/personagens-base.md)

Controller com `AuthGuard('jwt')` (`Auth: JWT`):

- `POST /personagens-base`
  - body: [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
- `POST /personagens-base/preview`
  - mesmo body do create
  - calcula sem persistir
  - pode retornar `errosItens` sem falhar criação do preview
- `GET /personagens-base/graus-treinamento/info?nivel=&intelecto=`
- `POST /personagens-base/graus-treinamento/perícias-elegiveis`
- `GET /personagens-base/passivas-disponíveis`
- `GET /personagens-base/tecnicas-disponiveis?claId=&origemId=`
- `GET /personagens-base/meus`
  - query opcional: `page`, `limit`
- `GET /personagens-base/:id`
  - query opcional: `incluirInventario=true`
- `PATCH /personagens-base/:id`
  - body: [`UpdatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/update-personagem-base.dto.ts)
- `DELETE /personagens-base/:id`
- `GET /personagens-base/:id/exportar`
  - resposta: [`PersonagemBaseExportResponse`](../assistenterpg-front/src/lib/types/personagem.types.ts)
- `POST /personagens-base/importar`
  - body: [`ImportarPersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/importar-personagem-base.dto.ts)

Regras importantes:

- validação forte de atributos, passivas, poderes, perícias e vínculos de classe/trilha/caminho
- importação resolve referências de catálogo (id/codigo/nome) antes de criar

Detalhamento:

- autenticação
  - todas as rotas do módulo usam `Auth: JWT` no nível de classe
- criação e preview
  - `POST /personagens-base`
    - body: [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
    - cria personagem, calcula derivados e pode criar itens iniciais via `InventarioService`
    - sucesso: resumo `{ id, nome, nível, cla, origem, classe, trilha, caminho }`
  - `POST /personagens-base/preview`
    - usa o mesmo body do create
    - não persiste em banco
    - retorna preview completo com derivados, perícias, graus, passivas, poderes, resistências e inventário validado
    - `errosItens` pode existir para itens inválidos sem bloquear o preview inteiro
- consultas auxiliares de criação
  - `GET /personagens-base/graus-treinamento/info?nivel=&intelecto=`
    - query: [`ConsultarInfoGrausTreinamentoDto`](../assistenterpg-back/src/personagem-base/dto/consultar-graus-treinamento.dto.ts)
    - retorna níveis elegiveis + limites de progressão
  - `POST /personagens-base/graus-treinamento/perícias-elegiveis`
    - body: [`ConsultarPeríciasElegiveisDto`](../assistenterpg-back/src/personagem-base/dto/consultar-graus-treinamento.dto.ts)
  - `GET /personagens-base/passivas-disponíveis`
    - retorno agrupado por atributo (`INT`, `PRE`, `FOR`, `AGI`, `VIG`)
  - `GET /personagens-base/tecnicas-disponiveis?claId=&origemId=`
    - `claId` obrigatório (inteiro)
    - `origemId` opcional (inteiro; inválido gera 400)
    - retorno: `{ hereditarias, naoHereditarias, todas }`
- consultas de personagem
  - `GET /personagens-base/meus`
    - sem `page/limit`: retorna lista resumida do usuário
    - com `page/limit`: retorna `{ items, total, page, limit, totalPages }`
  - `GET /personagens-base/:id`
    - query opcional: `incluirInventario=true`
    - retorna detalhe mapeado pelo [`personagem-base.mapper.ts`](../assistenterpg-back/src/personagem-base/personagem-base.mapper.ts)
  - `GET /personagens-base/:id/exportar`
    - headers de download JSON
    - retorno: [`PersonagemBaseExportResponse`](../assistenterpg-front/src/lib/types/personagem.types.ts)
  - `POST /personagens-base/importar`
    - body: [`ImportarPersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/importar-personagem-base.dto.ts)
    - resolve referências opcionais por `id/nome/codigo` antes de criar
- atualização e exclusão
  - `PATCH /personagens-base/:id`
    - body parcial: [`UpdatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/update-personagem-base.dto.ts)
    - rebuild completo do estado final (graus/perícias/proficiências/habilidades/resistências)
    - quando `itensInventario` é enviado, o inventário é sincronizado na mesma operação
    - `itensInventario: []` limpa os itens do personagem
  - `DELETE /personagens-base/:id`
    - remove personagem e relacionamentos associados
    - retorno: `{ "sucesso": true }`
- erros esperados (principais)
  - `PERSONAGEM_BASE_NOT_FOUND` (404)
  - erros de regra de negócio/validação vindos da engine e do módulo de personagem em [`personagem.exception.ts`](../assistenterpg-back/src/common/exceptions/personagem.exception.ts) (ex.: trilha incompatível, técnica inata invalida, limites de passivas/graus/perícias)

Integração frontend:

- [`assistenterpg-front/src/lib/api/personagens-base.ts`](../assistenterpg-front/src/lib/api/personagens-base.ts) cobre CRUD, preview, export/import e endpoints de graus de treinamento.
- [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts) consome `GET /personagens-base/passivas-disponíveis`.
- [`assistenterpg-front/src/app/personagens-base/novo/page.tsx`](../assistenterpg-front/src/app/personagens-base/novo/page.tsx) agora abre o modal de fontes antes da criação, mantendo `SISTEMA_BASE` fixo e permitindo habilitar suplementos/homebrews por seleção.
- [`assistenterpg-front/src/components/personagem-base/create/modal/FontesConteudoModal.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/FontesConteudoModal.tsx) centraliza a pergunta de fontes extras e reútiliza o padrão visual de modal.
- [`assistenterpg-front/src/lib/utils/fontes-conteudo.ts`](../assistenterpg-front/src/lib/utils/fontes-conteudo.ts) aplica o filtro local por `fonte/suplementoId/homebrewId` nos catálogos exibidos pelo wizard e persiste a seleção no `localStorage` por `usuarioId`.

## 5.6 Inventario

Detalhamento por entidade: [`entidades/inventario.md`](./entidades/inventario.md)

Controller com `JwtAuthGuard` no nível de classe (`Auth: JWT`):

- `GET /inventario/personagem/:personagemBaseId`
- `POST /inventario/preview-adicionar`
  - body: [`PreviewItemDto`](../assistenterpg-back/src/inventario/dto/preview-item.dto.ts)
- `POST /inventario/preview`
  - body: [`PreviewItensInventarioDto`](../assistenterpg-back/src/inventario/dto/preview-itens-inventario.dto.ts)
- `POST /inventario/adicionar`
  - body: [`AdicionarItemDto`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts)
- `PATCH /inventario/item/:itemId`
- `DELETE /inventario/item/:itemId`
- `POST /inventario/aplicar-modificacao`
- `POST /inventario/remover-modificacao`

Comportamentos esperados:

- valida ownership do personagem
- valida limite de espaço e sobrecarga
- valida regras de Grau Xama
- valida compatibilidade de modificações e conflitos

Tipos de resposta:

- resumo de inventário: [`ResumoInventarioCompleto`](../assistenterpg-back/src/inventario/engine/inventario.types.ts)
- preview adicionar item: [`PreviewAdicionarItemResponse`](../assistenterpg-back/src/inventario/engine/inventario.types.ts)

Detalhamento:

- autenticação
  - todas as rotas estão protegidas por `JwtAuthGuard` no nível de classe
  - observação: apesar de comentário antigo no controller, `POST /inventario/preview` também exige JWT
- consultas
  - `GET /inventario/personagem/:personagemBaseId`
    - retorna [`ResumoInventarioCompleto`](../assistenterpg-back/src/inventario/engine/inventario.types.ts):
      - `espaços`
      - `grauXama`
      - `resumoPorCategoria`
      - `podeAdicionarCategoria0`
      - `statsEquipados`
  - `POST /inventario/preview-adicionar`
    - body: [`PreviewItemDto`](../assistenterpg-back/src/inventario/dto/preview-item.dto.ts)
    - simula adição de 1 item sem persistir e valida espaço + grau xama
  - `POST /inventario/preview`
    - body: [`PreviewItensInventarioDto`](../assistenterpg-back/src/inventario/dto/preview-itens-inventario.dto.ts)
    - simula lista completa para wizard (calcula categoria final, espaços, grau xama e itens por categoria)
- CRUD de itens
  - `POST /inventario/adicionar`
    - body: [`AdicionarItemDto`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts)
    - valida ownership, compatibilidade de modificações, limite 2x capacidade, regra de vestir e grau xama
  - `PATCH /inventario/item/:itemId`
    - body: [`AtualizarItemDto`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts)
    - valida novamente limites quando altera `quantidade`/`equipado`
  - `DELETE /inventario/item/:itemId`
    - remove item + vínculos de modificações
    - sucesso: `{ "sucesso": true, "mensagem": "Item removido com sucesso" }`
- modificações em item
  - `POST /inventario/aplicar-modificacao`
    - body: [`AplicarModificacaoDto`](../assistenterpg-back/src/inventario/dto/aplicar-modificacao.dto.ts)
  - `POST /inventario/remover-modificacao`
    - body: [`RemoverModificacaoDto`](../assistenterpg-back/src/inventario/dto/remover-modificacao.dto.ts)
  - ambos retornam item atualizado do inventário
- erros esperados (principais)
  - `INVENTARIO_PERSONAGEM_NOT_FOUND` (404)
  - `INVENTARIO_SEM_PERMISSAO` (403)
  - `INVENTARIO_ITEM_NOT_FOUND` (404)
  - `INVENTARIO_EQUIPAMENTO_NOT_FOUND` (404)
  - `INVENTARIO_CAPACIDADE_EXCEDIDA` (422)
  - `INVENTARIO_ESPACOS_INSUFICIENTES` (422)
  - `INVENTARIO_LIMITE_VESTIR_EXCEDIDO` (422)
  - `INVENTARIO_GRAU_XAMA_EXCEDIDO` (422)
  - `INVENTARIO_MODIFICACAO_NOT_FOUND` (404)
  - `INVENTARIO_MODIFICACAO_INVALIDA` (422)
  - `INVENTARIO_MODIFICACAO_INCOMPATIVEL` (422)
  - `INVENTARIO_MODIFICACAO_DUPLICADA` (422)
  - `INVENTARIO_MODIFICACAO_NAO_APLICADA` (422)

Integração frontend:

- [`assistenterpg-front/src/lib/api/inventario.ts`](../assistenterpg-front/src/lib/api/inventario.ts) cobre busca de resumo, previews, CRUD de item e fluxo de modificações.
- [`assistenterpg-front/src/lib/utils/inventario.ts`](../assistenterpg-front/src/lib/utils/inventario.ts) concentra normalização e validações auxiliares usadas na UI de inventário.

## 5.7 Equipamentos

Rotas:

- leitura:
  - `GET /equipamentos` - `Auth: Publica`
    - query: [`FiltrarEquipamentosDto`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts)
    - resposta: `{ dados, paginação }`
  - `GET /equipamentos/:id` - `Auth: Publica`
  - `GET /equipamentos/codigo/:codigo` - `Auth: Publica`
- escrita:
  - `POST /equipamentos` - `Auth: JWT+Admin`
    - body: [`CriarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/criar-equipamento.dto.ts)
  - `PUT /equipamentos/:id` - `Auth: JWT+Admin`
  - `DELETE /equipamentos/:id` - `Auth: JWT+Admin`

Regras importantes:

- valida `fonte` x `suplementoId`
- impede delete se equipamento estiver em uso

Detalhamento:

- leitura pública
  - `GET /equipamentos`
    - query: [`FiltrarEquipamentosDto`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts)
      - `tipo`, `complexidadeMaldicao`, `proficienciaArma`, `proficienciaProtecao`, `alcance`, `tipoAcessorio`
      - `categoria` inteiro `0..4`
      - `fontes` como lista (ex.: `SISTEMA_BASE,SUPLEMENTO`)
      - `suplementoId` inteiro `>= 1`
      - `apenasAmaldicoados` boolean (`true/false`, `1/0`, `yes/no`, `on/off`)
      - `busca` textual
      - `pagina` (default `1`) e `limite` (default `20`, max `100`)
    - resposta: envelope `{ dados, paginação }`
      - `dados`: lista de [`EquipamentoResumoDto`](../assistenterpg-back/src/equipamentos/dto/equipamento-resumo.dto.ts)
      - `paginação`: `{ pagina, limite, total, totalPaginas }`
  - `GET /equipamentos/:id`
  - `GET /equipamentos/codigo/:codigo`
    - resposta: [`EquipamentoDetalhadoDto`](../assistenterpg-back/src/equipamentos/dto/equipamento-detalhado.dto.ts)
    - erro esperado: `EQUIPAMENTO_NOT_FOUND` (404)
- escrita admin (`Auth: JWT+Admin`)
  - `POST /equipamentos`
    - body: [`CriarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/criar-equipamento.dto.ts)
    - defaults de criação relevantes:
      - `fonte`: `SISTEMA_BASE` quando `suplementoId` não é informado
      - `complexidadeMaldicao`: `NENHUMA`
      - `categoria`: `CATEGORIA_0`
      - `espaços`: `1`
  - `PUT /equipamentos/:id`
    - body parcial: [`AtualizarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/atualizar-equipamento.dto.ts)
  - `DELETE /equipamentos/:id`
    - sucesso: `204 No Content`
- regras de consistência backend
  - quando `suplementoId` e informado, `fonte` deve ser `SUPLEMENTO`
  - quando `fonte=SUPLEMENTO`, `suplementoId` é obrigatório
- erros esperados
  - `EQUIPAMENTO_NOT_FOUND` (404)
  - `EQUIPAMENTO_CODIGO_DUPLICADO` (422)
  - `EQUIPAMENTO_EM_USO` (422)
  - `SUPLEMENTO_NOT_FOUND` (404)
  - `BadRequestException` (400) para combinação invalida de `fonte`/`suplementoId`

Integração frontend:

- [`assistenterpg-front/src/lib/api/equipamentos.ts`](../assistenterpg-front/src/lib/api/equipamentos.ts) cobre leitura e normalização da listagem (`normalizeListResult`), além da consulta por `id` e por `codigo`.

## 5.8 Modificações

Rotas:

- leitura:
  - `GET /modificações` - `Auth: JWT`
    - query: [`FiltrarModificaçõesDto`](../assistenterpg-back/src/modificacoes/dto/filtrar-modificações.dto.ts)
    - resposta: `{ dados, paginação }`
  - `GET /modificações/:id` - `Auth: JWT`
  - `GET /modificações/equipamento/:equipamentoId/compativeis` - `Auth: JWT`
- escrita:
  - `POST /modificações` - `Auth: JWT+Admin`
    - body: [`CreateModificaçãoDto`](../assistenterpg-back/src/modificacoes/dto/create-modificação.dto.ts)
  - `PATCH /modificações/:id` - `Auth: JWT+Admin`
  - `DELETE /modificações/:id` - `Auth: JWT+Admin`

Regras importantes:

- valida restrições por tipo/categoria/complexidade
- valida conflitos entre modificações
- impede delete em uso

Detalhamento:

- leitura (`Auth: JWT`)
  - `GET /modificações`
    - query: [`FiltrarModificaçõesDto`](../assistenterpg-back/src/modificacoes/dto/filtrar-modificações.dto.ts)
      - `tipo`, `fontes`, `suplementoId`, `busca`, `pagina`, `limite`
      - `fontes` aceita lista separada por virgula
      - `pagina` default `1`; `limite` default `50` (max `100`)
    - resposta: envelope `{ dados, paginação }`
      - `dados`: lista de [`ModificaçãoDetalhadaDto`](../assistenterpg-back/src/modificacoes/dto/modificação-detalhada.dto.ts)
  - `GET /modificações/:id`
    - erro esperado: `MODIFICACAO_NOT_FOUND` (404)
  - `GET /modificações/equipamento/:equipamentoId/compativeis`
    - valida existência do equipamento base
    - retorna apenas modificações que passam em `validarRestricoes(...)`
    - erro esperado: `MODIFICACAO_EQUIPAMENTO_NOT_FOUND` (404)
- escrita admin (`Auth: JWT+Admin`)
  - `POST /modificações`
    - body: [`CreateModificaçãoDto`](../assistenterpg-back/src/modificacoes/dto/create-modificação.dto.ts)
    - campos relevantes:
      - `codigo`, `nome`, `tipo`, `incrementoEspacos` obrigatórios
      - `restricoes` e `efeitosMecanicos` como JSON livre
      - `equipamentosCompatíveisIds` opcional para vínculos iniciais
  - `PATCH /modificações/:id`
    - body parcial: [`UpdateModificaçãoDto`](../assistenterpg-back/src/modificacoes/dto/update-modificação.dto.ts)
    - quando `equipamentosCompatíveisIds` e enviado:
      - lista substitui os vínculos atuais (inclusive `[]` para limpar)
  - `DELETE /modificações/:id`
    - sucesso: `{ "message": "Modificação removida com sucesso" }`
- erros esperados
  - `MODIFICACAO_NOT_FOUND` (404)
  - `MODIFICACAO_CODIGO_DUPLICADO` (422)
  - `MODIFICACAO_SUPLEMENTO_NOT_FOUND` (404)
  - `MODIFICACAO_FONTE_INVALIDA` (422)
  - `MODIFICACAO_EQUIPAMENTOS_INVALIDOS` (404)
  - `MODIFICACAO_EM_USO` (422)

Integração frontend:

- [`assistenterpg-front/src/lib/api/modificações.ts`](../assistenterpg-front/src/lib/api/modificações.ts) cobre listagem, detalhe e compatíveis por equipamento, com mapeamento de campos de `restricoes` para o shape de UI (`apenasAmaldicoadas`, `requerComplexidade`).

## 5.9 Suplementos

Rotas:

- `GET /suplementos` - `Auth: JWT`
- `GET /suplementos/:id` - `Auth: JWT`
- `GET /suplementos/codigo/:codigo` - `Auth: JWT`
- `GET /suplementos/me/ativos` - `Auth: JWT`
- `POST /suplementos/:id/ativar` - `Auth: JWT`
- `DELETE /suplementos/:id/desativar` - `Auth: JWT`
- `POST /suplementos` - `Auth: JWT+Admin`
- `PATCH /suplementos/:id` - `Auth: JWT+Admin`
- `DELETE /suplementos/:id` - `Auth: JWT+Admin`

DTOs:

- create: [`CreateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/create-suplemento.dto.ts)
- update: [`UpdateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/update-suplemento.dto.ts)
- filtro: [`FiltrarSuplementosDto`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts)

Regra de negócio:

- usuário só ativa suplemento `PUBLICADO`
- delete admin falha se houver conteúdo vinculado (classes, origens, habilidades etc)

Detalhamento:

- listagem e consulta (`Auth: JWT`)
  - `GET /suplementos`
    - query: [`FiltrarSuplementosDto`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts)
      - `nome`, `codigo`, `status`, `autor`, `apenasAtivos`
      - `apenasAtivos` aceita `true/false`, `1/0`, `yes/no`, `on/off`
    - resposta: array de [`SuplementoCatalogoDto`](../assistenterpg-back/src/suplementos/dto/suplemento-catálogo.dto.ts) ordenado por `nome`
    - quando autenticado, cada item pode incluir `ativo` (suplemento ativo para o usuário)
  - `GET /suplementos/:id`
  - `GET /suplementos/codigo/:codigo`
  - erros esperados: `SUPLEMENTO_NOT_FOUND` (404)
- ativação/desativação do usuário (`Auth: JWT`)
  - `GET /suplementos/me/ativos`
    - retorna apenas suplementos `PUBLICADO` ativos para o usuário
  - `POST /suplementos/:id/ativar`
    - sucesso: `{ "message": "Suplemento ativado com sucesso" }`
    - erros esperados:
      - `SUPLEMENTO_NOT_FOUND` (404)
      - `SUPLEMENTO_NAO_PUBLICADO` (422)
      - `SUPLEMENTO_JA_ATIVO` (422)
  - `DELETE /suplementos/:id/desativar`
    - sucesso: `{ "message": "Suplemento desativado com sucesso" }`
    - erro esperado: `SUPLEMENTO_NAO_ATIVO` (404)
- admin (`Auth: JWT+Admin`)
  - `POST /suplementos`
    - body: [`CreateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/create-suplemento.dto.ts)
      - `codigo`, `nome` obrigatórios
      - `descricao`, `versao`, `status`, `icone`, `banner`, `tags`, `autor` opcionais
    - erro esperado: `SUPLEMENTO_CODIGO_DUPLICADO` (422)
  - `PATCH /suplementos/:id`
    - body parcial: [`UpdateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/update-suplemento.dto.ts)
  - `DELETE /suplementos/:id`
    - bloqueia exclusão quando houver conteúdo vinculado
    - erros esperados: `SUPLEMENTO_NOT_FOUND` (404), `SUPLEMENTO_COM_CONTEUDO_VINCULADO` (422)
    - sucesso: `{ "message": "Suplemento deletado com sucesso" }`

Integração frontend:

- [`assistenterpg-front/src/lib/api/suplementos.ts`](../assistenterpg-front/src/lib/api/suplementos.ts) cobre leitura, ativação/desativação e CRUD admin de suplementos.

## 5.10 Homebrews

Controller com `AuthGuard('jwt')` (`Auth: JWT`):

- `GET /homebrews`
- `GET /homebrews/meus`
- `GET /homebrews/:id`
- `GET /homebrews/codigo/:codigo`
- `POST /homebrews`
- `PATCH /homebrews/:id`
- `DELETE /homebrews/:id`
- `PATCH /homebrews/:id/publicar`
- `PATCH /homebrews/:id/arquivar`

DTOs:

- create: [`CreateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/create-homebrew.dto.ts)
- update: [`UpdateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/update-homebrew.dto.ts)
- filtro: [`FiltrarHomebrewsDto`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts)

Regras importantes:

- leitura para não admin: somente `PUBLICADO` ou próprio autor
- públicar/arquivar requer dono ou admin
- `dados` varia por tipo e passa por validação especializada

Detalhamento:

- listagem (`Auth: JWT`)
  - `GET /homebrews`
  - `GET /homebrews/meus`
  - query: [`FiltrarHomebrewsDto`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts)
    - `nome`, `tipo`, `status`, `usuarioId`, `apenasPublicados`, `pagina`, `limite`
    - `apenasPublicados` aceita `true/false`, `1/0`, `yes/no`, `on/off`
    - `usuarioId`, `pagina`, `limite` devem ser `>= 1` quando informados
  - resposta: envelope paginado `{ dados, paginação }` com ordenação por `criadoEm desc`
- consulta (`Auth: JWT`)
  - `GET /homebrews/:id`
  - `GET /homebrews/codigo/:codigo`
  - resposta: [`HomebrewDetalhadoDto`](../assistenterpg-back/src/homebrews/dto/homebrew-detalhado.dto.ts)
  - erros esperados:
    - `HOMEBREW_NOT_FOUND` (404)
    - `HOMEBREW_SEM_PERMISSAO` (403) para conteúdo não públicado de outro usuário
- criação e edição (`Auth: JWT`)
  - `POST /homebrews`
    - body: [`CreateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/create-homebrew.dto.ts)
    - `tipo` + `dados` passam por validação especializada por categoria
  - `PATCH /homebrews/:id`
    - body parcial: [`UpdateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/update-homebrew.dto.ts)
    - ao alterar `dados`, a versão é incrementada automáticamente (`patch +1`)
  - erros esperados:
    - `HOMEBREW_DADOS_INVALIDOS` (400)
    - `HOMEBREW_SEM_PERMISSAO` (403) para edição sem ser dono/admin
- ciclo de vida (`Auth: JWT`)
  - `PATCH /homebrews/:id/publicar`
    - erro esperado: `HOMEBREW_JA_PUBLICADO` (422)
  - `PATCH /homebrews/:id/arquivar`
  - ambas exigem dono ou admin
- exclusão (`Auth: JWT`)
  - `DELETE /homebrews/:id`
  - exige dono ou admin
  - erro esperado: `HOMEBREW_SEM_PERMISSAO` (403)

Integração frontend:

- [`assistenterpg-front/src/lib/api/homebrews.ts`](../assistenterpg-front/src/lib/api/homebrews.ts) cobre listagem/consulta/criação/edição/públicação/arquivamento/exclusão, com normalização de listas paginadas.

## 5.11 Compendio

Rotas:

- leitura (pública):
  - categorias:
    - `GET /compendio/categorias`
    - `GET /compendio/categorias/codigo/:codigo`
  - subcategorias:
    - `GET /compendio/categorias/:categoriaId/subcategorias`
    - `GET /compendio/subcategorias/codigo/:codigo`
  - artigos:
    - `GET /compendio/artigos`
    - `GET /compendio/artigos/codigo/:codigo`
  - busca:
    - `GET /compendio/buscar?q=...` (mínimo 3 caracteres)
    - `GET /compendio/destaques`
- escrita (admin):
  - categorias:
    - `POST /compendio/categorias` - `Auth: JWT+Admin`
    - `PUT /compendio/categorias/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/categorias/:id` - `Auth: JWT+Admin`
  - subcategorias:
    - `POST /compendio/subcategorias` - `Auth: JWT+Admin`
    - `PUT /compendio/subcategorias/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/subcategorias/:id` - `Auth: JWT+Admin`
  - artigos:
    - `POST /compendio/artigos` - `Auth: JWT+Admin`
    - `PUT /compendio/artigos/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/artigos/:id` - `Auth: JWT+Admin`

Comportamento esperado:

- listagens aceitam modo paginado é não paginado
- `buscar` falha se `q` tiver menos de 3 caracteres

Detalhamento:

- leitura pública
  - categorias:
    - `GET /compendio/categorias`
      - query:
        - `todas=true` inclui inativas (default: apenas ativas)
        - `page`, `limit` opcionais para paginação
      - resposta:
        - sem `page/limit`: array
        - com `page/limit`: `{ items, total, page, limit, totalPages }`
    - `GET /compendio/categorias/codigo/:codigo`
      - inclui subcategorias ativas da categoria
      - erro esperado: `COMPENDIO_CATEGORIA_NOT_FOUND` (404)
  - subcategorias:
    - `GET /compendio/categorias/:categoriaId/subcategorias`
      - query:
        - `todas=true` inclui inativas (default: apenas ativas)
        - `page`, `limit` opcionais
      - pode retornar array ou envelope paginado
    - `GET /compendio/subcategorias/codigo/:codigo`
      - inclui categoria e artigos ativos
      - erro esperado: `COMPENDIO_SUBCATEGORIA_NOT_FOUND` (404)
  - artigos:
    - `GET /compendio/artigos`
      - query:
        - `subcategoriaId` opcional (inteiro; inválido gera 400)
        - `todas=true` inclui inativos (default: apenas ativos)
        - `page`, `limit` opcionais
      - pode retornar array ou envelope paginado
    - `GET /compendio/artigos/codigo/:codigo`
      - inclui subcategoria e categoria
      - erro esperado: `COMPENDIO_ARTIGO_NOT_FOUND` (404)
  - busca e destaques:
    - `GET /compendio/buscar?q=...`
      - `q` mínimo 3 caracteres
      - limite interno: 20 itens
      - erro esperado: `COMPENDIO_BUSCA_INVALIDA` (400)
    - `GET /compendio/destaques`
      - retorna até 6 artigos ativos com `destaque=true`
- escrita admin (`Auth: JWT+Admin`)
  - categorias:
    - `POST /compendio/categorias`
      - body: [`CreateCategoriaDto`](../assistenterpg-back/src/compendio/dto/create-categoria.dto.ts)
    - `PUT /compendio/categorias/:id`
      - body parcial: [`UpdateCategoriaDto`](../assistenterpg-back/src/compendio/dto/update-categoria.dto.ts)
    - `DELETE /compendio/categorias/:id`
      - bloqueia exclusão com subcategorias vinculadas
      - erros: `COMPENDIO_CATEGORIA_NOT_FOUND` (404), `COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS` (422)
  - subcategorias:
    - `POST /compendio/subcategorias`
      - body: [`CreateSubcategoriaDto`](../assistenterpg-back/src/compendio/dto/create-subcategoria.dto.ts)
    - `PUT /compendio/subcategorias/:id`
      - body parcial: [`UpdateSubcategoriaDto`](../assistenterpg-back/src/compendio/dto/update-subcategoria.dto.ts)
    - `DELETE /compendio/subcategorias/:id`
      - bloqueia exclusão com artigos vinculados
      - erros: `COMPENDIO_SUBCATEGORIA_NOT_FOUND` (404), `COMPENDIO_SUBCATEGORIA_COM_ARTIGOS` (422)
  - artigos:
    - `POST /compendio/artigos`
      - body: [`CreateArtigoDto`](../assistenterpg-back/src/compendio/dto/create-artigo.dto.ts)
    - `PUT /compendio/artigos/:id`
      - body parcial: [`UpdateArtigoDto`](../assistenterpg-back/src/compendio/dto/update-artigo.dto.ts)
    - `DELETE /compendio/artigos/:id`
      - erro esperado: `COMPENDIO_ARTIGO_NOT_FOUND` (404)

Integração frontend:

- consumo principal via fetch SSR em [`assistenterpg-front/src/lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts):
  - categorias/subcategorias/artigos por codigo
  - busca textual
  - destaques
  - fallback resiliente para indisponibilidade de API em build/runtime

## 5.12 Catálogos de conteúdo (classes/clas/origens/trilhas/habilidades/técnicas/perícias/proficiências/tipos-grau/condições/alinhamentos)

Auth atual:

- maioria `Auth: JWT` por guard no nível de classe
- rotas de escrita críticas usam `Auth: JWT+Admin` (guard no metodo)

Rotas principais:

- `classes`
  - `POST /classes`
  - `GET /classes`
  - `GET /classes/:id`
  - `GET /classes/:id/trilhas`
  - `PATCH /classes/:id`
  - `DELETE /classes/:id`
- `clas`
  - `POST /clas`
  - `GET /clas`
  - `GET /clas/:id`
  - `PATCH /clas/:id`
  - `DELETE /clas/:id`
- `origens`
  - `POST /origens`
  - `GET /origens`
  - `GET /origens/:id`
  - `PATCH /origens/:id`
  - `DELETE /origens/:id`
- `trilhas`
  - `POST /trilhas`
  - `GET /trilhas`
  - `GET /trilhas/:id`
  - `PATCH /trilhas/:id`
  - `DELETE /trilhas/:id`
  - `GET /trilhas/:id/caminhos`
  - `GET /trilhas/:id/habilidades`
  - `POST /trilhas/caminhos`
  - `PATCH /trilhas/caminhos/:id`
  - `DELETE /trilhas/caminhos/:id`
- `habilidades`
  - `GET /habilidades/poderes-genéricos`
  - `GET /habilidades`
  - `GET /habilidades/:id`
  - `POST /habilidades`
  - `PATCH /habilidades/:id`
  - `DELETE /habilidades/:id`
- `tecnicas-amaldicoadas`
  - `GET /tecnicas-amaldicoadas`
  - `GET /tecnicas-amaldicoadas/importar-json/guia`
  - `GET /tecnicas-amaldicoadas/exportar-json`
  - `GET /tecnicas-amaldicoadas/codigo/:codigo`
  - `GET /tecnicas-amaldicoadas/cla/:claId`
  - `GET /tecnicas-amaldicoadas/:id`
  - `POST /tecnicas-amaldicoadas/importar-json`
  - `POST /tecnicas-amaldicoadas`
  - `PATCH /tecnicas-amaldicoadas/:id`
  - `DELETE /tecnicas-amaldicoadas/:id`
  - `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
  - `GET /tecnicas-amaldicoadas/habilidades/:id`
  - `POST /tecnicas-amaldicoadas/habilidades`
  - `PATCH /tecnicas-amaldicoadas/habilidades/:id`
  - `DELETE /tecnicas-amaldicoadas/habilidades/:id`
  - `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
  - `GET /tecnicas-amaldicoadas/variacoes/:id`
  - `POST /tecnicas-amaldicoadas/variacoes`
  - `PATCH /tecnicas-amaldicoadas/variacoes/:id`
  - `DELETE /tecnicas-amaldicoadas/variacoes/:id`
- `perícias`
  - `GET /perícias`
  - `GET /perícias/:id`
- `proficiencias`
  - `POST /proficiencias`
  - `GET /proficiencias`
  - `GET /proficiencias/:id`
  - `PATCH /proficiencias/:id`
  - `DELETE /proficiencias/:id`
- `tipos-grau`
  - `POST /tipos-grau`
  - `GET /tipos-grau`
  - `GET /tipos-grau/:id`
  - `PATCH /tipos-grau/:id`
  - `DELETE /tipos-grau/:id`
- `condicoes`
  - `POST /condicoes`
  - `GET /condicoes`
  - `GET /condicoes/:id`
  - `PATCH /condicoes/:id`
  - `DELETE /condicoes/:id`
- `alinhamentos`
  - `GET /alinhamentos`

Detalhamento do bloco `classes`, `clas` e `origens`:

- `classes` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /classes`
    - body: [`CreateClasseDto`](../assistenterpg-back/src/classes/dto/create-classe.dto.ts)
      - `nome`: string obrigatória, max 100
      - `descricao`: string opcional/null, max 2000
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
    - regras:
      - `nome` duplicado falha com `CLASSE_NOME_DUPLICADO` (422)
      - se `suplementoId` for informado, `fonte` deve ser `SUPLEMENTO`
      - se `fonte=SUPLEMENTO`, `suplementoId` torna-se obrigatório
  - `GET /classes`
    - resposta: array ordenado por `nome`
    - cada item retorna catálogo enriquecido: `perícias`, `proficiencias`, `habilidadesIniciais`, `fonte`, `suplementoId`
  - `GET /classes/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta no mesmo formato de catálogo enriquecido
    - erro esperado: `CLASSE_NOT_FOUND` (404)
  - `GET /classes/:id/trilhas`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta: array `{ id, nome, descricao, classeId }` ordenado por `nome`
  - `PATCH /classes/:id`
    - body parcial: [`UpdateClasseDto`](../assistenterpg-back/src/classes/dto/update-classe.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
    - reaplica validações de nome/fonte/suplemento
  - `DELETE /classes/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - bloqueia exclusão se houver personagens vinculados
    - erros esperados: `CLASSE_NOT_FOUND` (404), `CLASSE_EM_USO` (422)
    - sucesso: `{ "sucesso": true }`
- `clas` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /clas`
    - body: [`CreateClaDto`](../assistenterpg-back/src/clas/dto/create-cla.dto.ts)
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string opcional, max 2000
      - `grandeCla`: boolean obrigatório
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `tecnicasHereditariasIds`: array opcional de inteiros
    - regras:
      - `nome` duplicado falha com `CLA_NOME_DUPLICADO` (422)
      - IDs em `tecnicasHereditariasIds` devem existir e ser técnicas com `hereditaria=true`
      - IDs inválidos falham com `CLA_TECNICAS_INVALIDAS` (422)
  - `GET /clas`
    - resposta: array ordenado por `nome`
    - inclui `técnicasHereditarias` e `_count` (`personagensBase`, `personagensCampanha`)
  - `GET /clas/:id`
    - `id` inteiro obrigatório
    - inclui `técnicasHereditarias` (com dados da técnica) e `_count`
    - erro esperado: `CLA_NOT_FOUND` (404)
  - `PATCH /clas/:id`
    - body parcial: [`UpdateClaDto`](../assistenterpg-back/src/clas/dto/update-cla.dto.ts)
    - se `tecnicasHereditariasIds` for enviado, o vinculo e substituido (delete/recreate)
  - `DELETE /clas/:id`
    - bloqueia exclusão se houver personagens vinculados
    - erros esperados: `CLA_NOT_FOUND` (404), `CLA_EM_USO` (422)
    - sucesso: `{ "message": "Cla removido com sucesso" }`
- `origens` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /origens`
    - body: [`CreateOrigemDto`](../assistenterpg-back/src/origens/dto/create-origem.dto.ts)
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string opcional, max 2000
      - `requisitosTexto`: string opcional, max 500
      - `requerGrandeCla`, `requerTécnicaHeriditaria`, `bloqueiaTécnicaHeriditaria`: boolean opcionais
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `perícias`: array opcional de objetos `{ períciaId, tipo: FIXA|ESCOLHA, grupoEscolha? }`
      - `habilidadesIds`: array opcional de inteiros
    - regras:
      - `nome` duplicado falha com `ORIGEM_NOME_DUPLICADO` (422)
      - `períciaId` inexistente falha com `ORIGEM_PERICIAS_INVALIDAS` (404)
      - `habilidadeId` inexistente falha com `ORIGEM_HABILIDADES_INVALIDAS` (404)
      - campos booleanos ausentes entram como `false`
  - `GET /origens`
    - resposta: array ordenado por `nome`
    - inclui `perícias` (com `perícia`), `habilidadesOrigem`, `habilidadesIniciais` e `_count`
  - `GET /origens/:id`
    - `id` inteiro obrigatório
    - mesmo formato enriquecido do `findAll`
    - erro esperado: `ORIGEM_NOT_FOUND` (404)
  - `PATCH /origens/:id`
    - body parcial: [`UpdateOrigemDto`](../assistenterpg-back/src/origens/dto/update-origem.dto.ts)
    - se `perícias` for enviado, relação e substituida (delete/recreate)
    - se `habilidadesIds` for enviado, relação e substituida (delete/recreate)
  - `DELETE /origens/:id`
    - bloqueia exclusão se houver personagens vinculados
    - erros esperados: `ORIGEM_NOT_FOUND` (404), `ORIGEM_EM_USO` (422)
    - sucesso: `{ "message": "Origem removida com sucesso" }`

Integração frontend neste bloco:

- leitura de catálogo:
  - [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts): `apiGetClasses`, `apiGetClas`, `apiGetOrigens`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts): `apiAdminCreate*` e `apiAdminUpdate*` para `classes`, `clas` e `origens`
  - observação: o frontend atual não expõe função de delete para esses três módulos, embora os endpoints `DELETE` existam no backend

Detalhamento do bloco `trilhas`, `caminhos` e `habilidades`:

- `trilhas` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /trilhas`
    - body: [`CreateTrilhaDto`](../assistenterpg-back/src/trilhas/dto/create-trilha.dto.ts)
      - `classeId`: inteiro obrigatório
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `requisitos`: JSON opcional
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `habilidades`: array opcional de `{ habilidadeId, nivelConcedido, caminhoId? }`
    - regras:
      - classe inexistente falha com `TRILHA_CLASSE_NOT_FOUND` (404)
      - nome duplicado falha com `TRILHA_NOME_DUPLICADO` (422)
      - validação `fonte/suplementoId` segue a mesma regra dos outros catálogos
  - `GET /trilhas?classeId=...`
    - `classeId` opcional (inteiro)
    - resposta: array ordenado por `nome`, com `classe`, `caminhos` e `_count`
  - `GET /trilhas/:id`
    - `id` inteiro obrigatório
    - resposta detalhada com `classe`, `caminhos`, `habilidadesTrilha` e `_count`
    - erro esperado: `TRILHA_NOT_FOUND` (404)
  - `PATCH /trilhas/:id`
    - body parcial: [`UpdateTrilhaDto`](../assistenterpg-back/src/trilhas/dto/update-trilha.dto.ts)
    - permite atualizar `classeId` (validando existência da classe)
    - quando `habilidades` e enviado, a lista da trilha e substituida (`deleteMany + create`)
    - `habilidades: []` limpa os vínculos da trilha
  - `DELETE /trilhas/:id`
    - bloqueia exclusão se houver personagens vinculados
    - erros esperados: `TRILHA_NOT_FOUND` (404), `TRILHA_EM_USO` (422)
    - sucesso: `{ "message": "Trilha removida com sucesso" }`
- `caminhos` (subrotas em `trilhas`, `GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /trilhas/caminhos`
    - body: [`CreateCaminhoDto`](../assistenterpg-back/src/trilhas/dto/create-caminho.dto.ts)
      - `trilhaId`: inteiro obrigatório
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `fonte`, `suplementoId` opcionais (mesma regra de consistência)
      - `habilidades`: array opcional de `{ habilidadeId, nivelConcedido }`
    - regras:
      - trilha inexistente falha com `TRILHA_NOT_FOUND` (404)
      - nome duplicado falha com `CAMINHO_NOME_DUPLICADO` (422)
  - `PATCH /trilhas/caminhos/:id`
    - body parcial: [`UpdateCaminhoDto`](../assistenterpg-back/src/trilhas/dto/update-caminho.dto.ts)
    - se `trilhaId` for enviado, valida trilha de destino
    - quando `habilidades` e enviado, substitui somente as habilidades do caminho
    - `habilidades: []` limpa os vínculos do caminho
  - `DELETE /trilhas/caminhos/:id`
    - bloqueia exclusão se houver personagens vinculados
    - erros esperados: `CAMINHO_NOT_FOUND` (404), `CAMINHO_EM_USO` (422)
    - sucesso: `{ "message": "Caminho removido com sucesso" }`
  - leitura relacionada:
    - `GET /trilhas/:id/caminhos`: lista simplificada `{ id, nome, descricao, trilhaId }`
    - `GET /trilhas/:id/habilidades`: lista consolidada por nível com nome/descricao da habilidade e caminho associado
- `habilidades` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `GET /habilidades/poderes-genéricos`
    - resposta: poderes genéricos calculados pela regra de criação de personagem
  - `GET /habilidades`
    - query: [`FilterHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/filter-habilidade.dto.ts)
      - `tipo`, `origem`, `fonte`, `suplementoId`, `busca`, `pagina`, `limite`
    - resposta paginada em envelope `{ dados, paginação }`
  - `GET /habilidades/:id`
    - `id` inteiro obrigatório
    - resposta detalhada com `efeitosGrau`, vínculos (`classes`, `trilhas`, `origens`) e `_count`
    - erro esperado: `HABILIDADE_NOT_FOUND` (404)
  - `POST /habilidades`
    - body: [`CreateHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/create-habilidade.dto.ts)
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `tipo`: enum `TipoHabilidade` obrigatório
      - `origem`: string opcional, max 50
      - `requisitos`, `mecânicasEspeciais`: JSON opcionais
      - `fonte`, `suplementoId`: opcionais
      - `efeitosGrau`: array opcional `{ tipoGrauCodigo, valor?, escalonamentoPorNivel? }`
    - regras:
      - nome duplicado falha com `HABILIDADE_NOME_DUPLICADO` (422)
      - `tipoGrauCodigo` inválido em `efeitosGrau` falha com `TIPO_GRAU_NOT_FOUND` (404)
  - `PATCH /habilidades/:id`
    - body parcial: [`UpdateHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/update-habilidade.dto.ts)
    - `efeitosGrau` substitui a lista existente (`deleteMany + create`)
    - `efeitosGrau: []` limpa os efeitos de grau da habilidade
  - `DELETE /habilidades/:id`
    - bloqueia exclusão quando a habilidade está vinculada a personagens/catálogos
    - erros esperados: `HABILIDADE_NOT_FOUND` (404), `HABILIDADE_EM_USO` (422)
    - sucesso: `{ "message": "Habilidade removida com sucesso" }`

Integração frontend neste bloco:

- leitura de catálogo:
  - [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts): `apiGetTrilhas`, `apiGetTrilhasDaClasse`, `apiGetCaminhosDaTrilha`, `apiGetHabilidades`, `apiGetPoderesGenericos`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts): `apiAdminCreate/UpdateTrilha`, `apiAdminCreate/UpdateCaminho`, `apiAdminCreate/UpdateHabilidade`
  - observação: frontend atual não expõe função de delete para `trilhas`, `caminhos` e `habilidades`, apesar dos endpoints `DELETE` existirem no backend

Detalhamento do bloco `tecnicas-amaldicoadas`:

- detalhamento completo por entidade: [`entidades/tecnicas-amaldicoadas.md`](./entidades/tecnicas-amaldicoadas.md)

- auth atual:
  - leitura (`GET`) com `Auth: JWT`
  - escrita (`POST/PATCH/DELETE`) com `Auth: JWT+Admin`
- técnicas (`/tecnicas-amaldicoadas`)
  - `GET /tecnicas-amaldicoadas`
    - query: [`FiltrarTecnicasDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts)
      - `nome`, `codigo`, `tipo`, `claId`, `claNome`, `fonte`, `suplementoId`
      - booleans: `hereditaria`, `incluirHabilidades`, `incluirClas`
      - booleans aceitos: `true/false`, `1/0`, `yes/no`, `on/off`
      - `claId` e `suplementoId` devem ser `>= 1` quando informados
    - resposta: lista de [`TecnicaDetalhadaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/tecnica-detalhada.dto.ts)
    - padrão de include:
      - `incluirClas=false` remove `clasHereditarios`
      - `incluirHabilidades=false` remove `habilidades`
  - `GET /tecnicas-amaldicoadas/importar-json/guia`
    - resposta: schema + regras + exemplos mínimo/completo do formato JSON oficial
  - `GET /tecnicas-amaldicoadas/exportar-json`
    - query opcional: filtros de `FiltrarTecnicasDto` + `id` + `incluirIds`
    - retorna payload pronto para round-trip no `POST /importar-json`
  - `GET /tecnicas-amaldicoadas/:id`
    - `id` inteiro obrigatório
    - erro esperado: `TECNICA_NOT_FOUND` (404)
  - `GET /tecnicas-amaldicoadas/codigo/:codigo`
    - erro esperado: `TECNICA_NOT_FOUND` (404)
  - `GET /tecnicas-amaldicoadas/cla/:claId`
    - `claId` inteiro obrigatório
    - retorna técnicas hereditarias vinculadas ao cla
  - `POST /tecnicas-amaldicoadas/importar-json`
    - body: `{ schema?, schemaVersion?, modo?, substituirHabilidadesAusentes?, substituirVariaçõesAusentes?, técnicas: [...] }`
    - modo atual: `UPSERT` (técnica por `codigo`, habilidade por `codigo`, variação por `id` ou `nome`)
    - resposta: resumo com contadores de criação/atualização/remoção + avisos
  - `POST /tecnicas-amaldicoadas`
    - body: [`CreateTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts)
      - `codigo`, `nome`, `descricao`, `tipo` obrigatórios
      - `hereditaria`, `clasHereditarios`, `linkExterno`, `fonte`, `suplementoId`, `requisitos` opcionais
      - `clasHereditarios` (quando informado) deve ser array de strings não vazias; o backend faz `trim` de cada entrada antes de validar
    - regras:
      - codigo/nome duplicado: `TECNICA_CODIGO_OU_NOME_DUPLICADO` (422)
      - técnica `hereditaria` deve ser `INATA`: `TECNICA_NAO_INATA_HEREDITARIA` (422)
      - técnica `hereditaria` exige pelo menos 1 cla: `TECNICA_HEREDITARIA_SEM_CLA` (422)
      - cla inexistente em `clasHereditarios`: `TECNICA_CLA_NOT_FOUND` (404)
      - `suplementoId` inválido: `TECNICA_SUPLEMENTO_NOT_FOUND` (404)
  - `PATCH /tecnicas-amaldicoadas/:id`
    - body parcial: [`UpdateTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-tecnica.dto.ts)
    - regras relevantes:
      - `codigo` não é atualizavel nesse endpoint
      - `clasHereditarios` (quando informado) deve seguir a mesma validação do create (strings não vazias com `trim`)
      - não permite transformar em técnica hereditaria sem cla vinculado
      - quando `hereditaria=false`, vínculos de cla são limpos
      - quando `clasHereditarios` e enviado, os vínculos são substituidos
      - nome duplicado: `TECNICA_CODIGO_OU_NOME_DUPLICADO` (422)
  - `DELETE /tecnicas-amaldicoadas/:id`
    - bloqueia exclusão quando técnica estiver em uso por personagem
    - erro esperado: `TECNICA_EM_USO` (422)
    - sucesso: `{ "sucesso": true }`
- habilidades de técnica
  - `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
  - `GET /tecnicas-amaldicoadas/habilidades/:id`
  - `POST /tecnicas-amaldicoadas/habilidades`
    - body: [`CreateHabilidadeTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts)
      - `tecnicaId`, `codigo`, `nome`, `descricao`, `execucao`, `efeito` obrigatórios
      - campos de dano/custo/escalonamento são opcionais
      - `tecnicaId` deve ser `>= 1`
    - regras:
      - técnica inexistente: `TECNICA_NOT_FOUND` (404)
      - codigo duplicado: `HABILIDADE_CODIGO_DUPLICADO` (422)
  - `PATCH /tecnicas-amaldicoadas/habilidades/:id`
    - body parcial: [`UpdateHabilidadeTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-habilidade-tecnica.dto.ts)
  - `DELETE /tecnicas-amaldicoadas/habilidades/:id`
    - sucesso: `{ "sucesso": true }`
    - erro esperado: `HABILIDADE_TECNICA_NOT_FOUND` (404)
- variações de habilidade técnica
  - `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
  - `GET /tecnicas-amaldicoadas/variacoes/:id`
  - `POST /tecnicas-amaldicoadas/variacoes`
    - body: [`CreateVariacaoHabilidadeDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts)
      - `habilidadeTecnicaId`, `nome`, `descricao` obrigatórios
      - `habilidadeTecnicaId` deve ser `>= 1`
  - `PATCH /tecnicas-amaldicoadas/variacoes/:id`
    - body parcial: [`UpdateVariacaoHabilidadeDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-variacao.dto.ts)
  - `DELETE /tecnicas-amaldicoadas/variacoes/:id`
    - sucesso: `{ "sucesso": true }`
    - erro esperado: `VARIACAO_HABILIDADE_NOT_FOUND` (404)

Integração frontend neste bloco:

- leitura/públicação em catálogo:
  - [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts): `apiGetTécnicasAmaldicoadas`, `apiGetTécnicasInatas`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts):
    - técnicas: `apiAdminCreateTecnicaAmaldicoada`, `apiAdminUpdateTecnicaAmaldicoada`
    - import/export JSON: `apiAdminGetGuiaImportaçãoTécnicasJson`, `apiAdminExportarTécnicasJson`, `apiAdminImportarTécnicasJson`
    - habilidades de técnica: `apiAdminGetHabilidadesDaTecnica`, `apiAdminGetHabilidadeDaTecnica`, `apiAdminCreateHabilidadeDaTecnica`, `apiAdminUpdateHabilidadeDaTecnica`, `apiAdminDeleteHabilidadeDaTecnica`
    - variações: `apiAdminGetVariacoesDaHabilidadeTecnica`, `apiAdminGetVariacaoDaHabilidadeTecnica`, `apiAdminCreateVariacaoDaHabilidadeTecnica`, `apiAdminUpdateVariacaoDaHabilidadeTecnica`, `apiAdminDeleteVariacaoDaHabilidadeTecnica`
- interface admin:
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx) agora expõe CRUD manual + importação/exportação JSON (guia, exportar filtradas e por técnica, importar arquivo/conteúdo)
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx) cobre CRUD de habilidades e variações em modal dedicado, incluindo campos avançados com entrada guiada para `requisitos`, `testesExigidos`, `dadosDano` e escalonamento (tipado e fallback JSON)
  - [`assistenterpg-front/src/components/suplemento-admin/habilidades/HabilidadesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/habilidades/HabilidadesAdminPanel.tsx) ganhou fluxo de seleção de técnica (inata/não inata) para abrir o CRUD dedicado de habilidades técnicas, mantendo `poder genérico` no módulo de habilidades

Detalhamento do bloco de catálogos menores:

- detalhamento completo por entidade: [`entidades/catálogos-menores.md`](./entidades/catálogos-menores.md)

- `perícias` (`Auth: JWT`)
  - `GET /perícias`
    - resposta: array ordenado por `atributoBase` e `nome`
    - campos: `id`, `codigo`, `nome`, `descricao`, `atributoBase`, `somenteTreinada`, `penalizaPorCarga`, `precisaKit`
  - `GET /perícias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `PERICIA_NOT_FOUND` (404)
- `proficiencias` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /proficiencias`
    - body: [`CreateProficienciaDto`](../assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts)
      - `codigo`: string obrigatória, max 50
      - `nome`: string obrigatória, min 2, max 100
      - `descricao`: string opcional/null, max 5000
      - `tipo`: string obrigatória, max 50
      - `categoria`: string obrigatória, max 50
      - `subtipo`: string opcional/null, max 50
  - `GET /proficiencias`
    - resposta: array ordenado por `nome`
  - `GET /proficiencias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `PROFICIENCIA_NOT_FOUND` (404)
  - `PATCH /proficiencias/:id`
    - body parcial: [`UpdateProficienciaDto`](../assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
  - `DELETE /proficiencias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta esperada: `{ "sucesso": true }`
  - observação de erro de banco:
    - `codigo` e único no schema; duplicidade gera `DB_UNIQUE_VIOLATION`
- `tipos-grau` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /tipos-grau`
    - body: [`CreateTipoGrauDto`](../assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts)
      - `codigo`: string obrigatória, max 50
      - `nome`: string obrigatória, min 2, max 100
      - `descricao`: string opcional/null, max 5000
  - `GET /tipos-grau`
    - resposta: array ordenado por `nome`
  - `GET /tipos-grau/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `TIPO_GRAU_NOT_FOUND` (404)
  - `PATCH /tipos-grau/:id`
    - body parcial: [`UpdateTipoGrauDto`](../assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
  - `DELETE /tipos-grau/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta esperada: `{ "sucesso": true }`
  - observação de erro de banco:
    - `codigo` e único no schema; duplicidade gera `DB_UNIQUE_VIOLATION`
- `condicoes` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /condicoes`
    - body: [`CreateCondicaoDto`](../assistenterpg-back/src/condicoes/dto/create-condicao.dto.ts)
      - `nome`: string obrigatória, min 3, max 100
      - `descricao`: string obrigatória, min 10
    - erros esperados: `CONDICAO_NOME_DUPLICADO` (422)
  - `GET /condicoes`
    - resposta: array ordenado por `nome`
    - cada item inclui `_count.condicoesPersonagemSessão`
  - `GET /condicoes/:id`
    - `id` inteiro obrigatório
    - inclui `_count.condicoesPersonagemSessão`
    - erros esperados: `CONDICAO_NOT_FOUND` (404)
  - `PATCH /condicoes/:id`
    - body parcial: [`UpdateCondicaoDto`](../assistenterpg-back/src/condicoes/dto/update-condicao.dto.ts)
    - erros esperados: `CONDICAO_NOT_FOUND` (404), `CONDICAO_NOME_DUPLICADO` (422)
  - `DELETE /condicoes/:id`
    - bloqueia remoção se houver uso em sessão
    - erros esperados: `CONDICAO_NOT_FOUND` (404), `CONDICAO_EM_USO` (422)
    - sucesso: `{ "message": "Condição removida com sucesso" }`
- `alinhamentos` (`Auth: JWT`)
  - `GET /alinhamentos`
    - resposta: array ordenado por `nome`
    - campos: `id`, `nome`, `descricao`

Integração frontend neste bloco:

- leitura via [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts):
  - `apiGetPerícias`
  - `apiGetProficiencias`
  - `apiGetTiposGrau`
  - `apiGetAlinhamentos`
- escrita/admin via [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts):
  - proficiências: `apiAdminGetProficiencias`, `apiAdminGetProficiencia`, `apiAdminCreateProficiencia`, `apiAdminUpdateProficiencia`, `apiAdminDeleteProficiencia`
  - tipos-grau: `apiAdminGetTiposGrau`, `apiAdminGetTipoGrau`, `apiAdminCreateTipoGrau`, `apiAdminUpdateTipoGrau`, `apiAdminDeleteTipoGrau`
  - condições: `apiAdminGetCondicoes`, `apiAdminGetCondicao`, `apiAdminCreateCondicao`, `apiAdminUpdateCondicao`, `apiAdminDeleteCondicao`
- interface admin:
  - [`assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx), [`assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx) cobrem CRUD completo desses catálogos
  - [`assistenterpg-front/src/lib/constants/suplemento-admin.ts`](../assistenterpg-front/src/lib/constants/suplemento-admin.ts) e [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) foram ampliados para expor os novos módulos no painel admin

## 5.13 NPC (Aliados/Ameacas)

Controller com `AuthGuard('jwt')` no nível de classe (`Auth: JWT`):

- `POST /npcs-ameacas`
  - body: [`CreateNpcAmeacaDto`](../assistenterpg-back/src/npcs-ameacas/dto/create-npc-ameaca.dto.ts)
- `GET /npcs-ameacas/meus`
  - query opcional: `page`, `limit`, `nome`, `fichaTipo`, `tipo`, `tamanho`
  - resposta: `{ items, total, page, limit, totalPages }`
- `GET /npcs-ameacas/:id`
- `PATCH /npcs-ameacas/:id`
  - body: [`UpdateNpcAmeacaDto`](../assistenterpg-back/src/npcs-ameacas/dto/update-npc-ameaca.dto.ts)
- `DELETE /npcs-ameacas/:id`

Detalhamento:

- módulo de ficha simplificada para aliado/ameaca (VD placeholder, atributos, perícias principais, defesa/PV, deslocamento, resistências/vulnerabilidades, passivas e ações).
- acesso sempre restrito ao dono da ficha (`donoId`).
- listas estruturadas (`períciasEspeciais`, `passivas`, `ações`, `resistências`, `vulnerabilidades`) são persistidas em JSON.
- exclusão retorna `{ message, id }`.

Integração frontend:

- cliente HTTP: [`assistenterpg-front/src/lib/api/npcs-ameacas.ts`](../assistenterpg-front/src/lib/api/npcs-ameacas.ts)
- tipos: [`assistenterpg-front/src/lib/types/npc-ameaca.types.ts`](../assistenterpg-front/src/lib/types/npc-ameaca.types.ts)
- telas:
  - [`assistenterpg-front/src/app/npcs-ameacas/page.tsx`](../assistenterpg-front/src/app/npcs-ameacas/page.tsx)
  - [`assistenterpg-front/src/app/npcs-ameacas/novo/page.tsx`](../assistenterpg-front/src/app/npcs-ameacas/novo/page.tsx)
  - [`assistenterpg-front/src/app/npcs-ameacas/[id]/page.tsx`](../assistenterpg-front/src/app/npcs-ameacas/[id]/page.tsx)
  - [`assistenterpg-front/src/app/npcs-ameacas/[id]/editar/page.tsx`](../assistenterpg-front/src/app/npcs-ameacas/[id]/editar/page.tsx)
  - formulario reútilizavel: [`assistenterpg-front/src/components/npc-ameaca/NpcAmeacaForm.tsx`](../assistenterpg-front/src/components/npc-ameaca/NpcAmeacaForm.tsx)

## 6. Tipos de dados e enums aceitos

Fonte principal de enums:

- [`assistenterpg-front/src/lib/types/homebrew-enums.ts`](../assistenterpg-front/src/lib/types/homebrew-enums.ts)

Enums centrais usados em requests/responses:

- atributos: `AGI | FOR | INT | PRE | VIG`
- papel de campanha: `MESTRE | JOGADOR | OBSERVADOR`
- role usuário: `USUARIO | ADMIN`
- status públicação: `RASCUNHO | PUBLICADO | ARQUIVADO`
- fonte: `SISTEMA_BASE | SUPLEMENTO | HOMEBREW`
- tipo técnica: `INATA | NAO_INATA`
- tipo habilidade:
  - `RECURSO_CLASSE`
  - `EFEITO_GRAU`
  - `PODER_GENERICO`
  - `MECANICA_ESPECIAL`
  - `HABILIDADE_ORIGEM`
  - `HABILIDADE_TRILHA`
  - `ESCOLA_TECNICA`
- tipo equipamento:
  - `ARMA`
  - `MUNICAO`
  - `PROTECAO`
  - `ACESSORIO`
  - `EXPLOSIVO`
  - `ITEM_OPERACIONAL`
  - `ITEM_AMALDICOADO`
  - `FERRAMENTA_AMALDICOADA`
  - `GENERICO`

Para payloads completos:

- personagem: [`personagem.types.ts`](../assistenterpg-front/src/lib/types/personagem.types.ts)
- npcs/ameaças: [`npc-ameaca.types.ts`](../assistenterpg-front/src/lib/types/npc-ameaca.types.ts)
- inventário/equipamentos/modificações: [`inventario.types.ts`](../assistenterpg-front/src/lib/types/inventario.types.ts)
- catálogos: [`catalogo.types.ts`](../assistenterpg-front/src/lib/types/catalogo.types.ts)
- suplementos: [`suplemento.types.ts`](../assistenterpg-front/src/lib/types/suplemento.types.ts)
- conteúdo admin suplementos: [`suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts)

## 7. Integração frontend-backend

## 7.1 Camada API do frontend

Arquivos principais:

- auth: [`api/auth.ts`](../assistenterpg-front/src/lib/api/auth.ts)
- usuários: [`api/usuários.ts`](../assistenterpg-front/src/lib/api/usuários.ts)
- campanhas: [`api/campanhas.ts`](../assistenterpg-front/src/lib/api/campanhas.ts)
- personagens: [`api/personagens-base.ts`](../assistenterpg-front/src/lib/api/personagens-base.ts)
- npcs/ameaças: [`api/npcs-ameacas.ts`](../assistenterpg-front/src/lib/api/npcs-ameacas.ts)
- inventário: [`api/inventario.ts`](../assistenterpg-front/src/lib/api/inventario.ts)
- catálogos: [`api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts)
- equipamentos/modificações: [`api/equipamentos.ts`](../assistenterpg-front/src/lib/api/equipamentos.ts), [`api/modificações.ts`](../assistenterpg-front/src/lib/api/modificações.ts)
- suplementos/admin conteúdos: [`api/suplementos.ts`](../assistenterpg-front/src/lib/api/suplementos.ts), [`api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts)
- homebrews: [`api/homebrews.ts`](../assistenterpg-front/src/lib/api/homebrews.ts)
- compendio (fetch separado): [`lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts)

## 7.2 Rotas de páginas frontend

Páginas principais existentes:

- auth: `/auth/login`, `/auth/register`
- home: `/home`
- campanhas: `/campanhas`, `/campanhas/[id]`
- personagens: `/personagens-base`, `/personagens-base/novo`, `/personagens-base/[id]`
- npcs/ameaças: `/npcs-ameacas`, `/npcs-ameacas/novo`, `/npcs-ameacas/[id]`, `/npcs-ameacas/[id]/editar`
- compendio: `/compendio` e rotas filhas
- suplementos: `/suplementos`, `/suplementos/admin`, `/suplementos/admin/[modulo]`
- homebrews: `/homebrews`, `/homebrews/novo`, `/homebrews/[id]`, `/homebrews/[id]/editar`
- configurações: `/configuracoes`

## 8. Consistencia, completude e observações técnicas

## 8.1 O que foi validado nesta consolidação

- inventário completo de docs antigos de front e back
- leitura direta dos controllers, services e DTOs do backend
- leitura direta dos clientes API e tipos do frontend
- comparação dos formatos reais de resposta usados no codigo
- execução de testes unitarios de controllers focados em contrato de autorização

## 8.2 Correção aplicada no codigo durante está consolidação

Foram adicionadas validações class-validator em DTOs de campanha:

- [`add-membro.dto.ts`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
- [`create-convite.dto.ts`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
- [`answer-convite.dto.ts`](../assistenterpg-back/src/campanha/dto/answer-convite.dto.ts)

Impacto:

- requests válidos continuam funcionando
- payloads inválidos passam a falhar mais cedo com erro estruturado

Correções adicionais aplicadas após a consolidação inicial:

- frontend compendio:
  - [`assistenterpg-front/src/lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts) agora trata indisponibilidade da API com fallback seguro
  - buscas por codigo retornam `null` em fallback/404 para alinhar com as páginas dinâmicas
  - [`assistenterpg-front/src/app/compendio/page.tsx`](../assistenterpg-front/src/app/compendio/page.tsx) exibe estado vazio amigavel quando API não responde no build
- frontend performance e responsividade:
  - [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) passou a carregar painéis admin via `dynamic import`, reduzindo JS inicial do módulo
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx) evita chamadas redundantes de preview usando hash do payload
  - [`assistenterpg-front/src/app/personagens-base/page.tsx`](../assistenterpg-front/src/app/personagens-base/page.tsx), [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) e [`assistenterpg-front/src/app/suplementos/admin/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/page.tsx) receberam ajustes de layout para evitar overflow em telas pequenas
  - [`assistenterpg-front/src/lib/api/equipamentos.ts`](../assistenterpg-front/src/lib/api/equipamentos.ts) e [`assistenterpg-front/src/lib/api/modificações.ts`](../assistenterpg-front/src/lib/api/modificações.ts) agora expõem `apiGetTodosEquipamentos` e `apiGetTodasModificações`, carregando todas as páginas em paralelo (após a primeira) para reduzir latência em listas grandes
  - [`assistenterpg-front/src/lib/api/catálogos.ts`](../assistenterpg-front/src/lib/api/catálogos.ts) passou a expor `apiGetCatalogosBasicos` com cache curto e dedupe de request em voo para evitar repetição de chamadas idênticas em navegação sequencial
  - [`assistenterpg-front/src/app/personagens-base/novo/page.tsx`](../assistenterpg-front/src/app/personagens-base/novo/page.tsx) e [`assistenterpg-front/src/components/personagem-base/sections/usePersonagemBaseDetalhe.ts`](../assistenterpg-front/src/components/personagem-base/sections/usePersonagemBaseDetalhe.ts) passaram a reútilizar os novos carregadores compartilhados, reduzindo round-trips e garantindo catálogo completo de inventário
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepInventario.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepInventario.tsx) deixou de buscar catálogos localmente e passou a reútilizar `equipamentos/modificações` vindos do wizard; também trocou buscas repetidas por `Map` (`equipamentoPorId`) em filtros/validações, reduzindo custo de render com listas grandes
  - [`assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx) passou a usar `Set` de IDs selecionados para validação/render da lista de modificações, reduzindo verificações `O(n)` repetidas no map da UI
  - [`assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalEquipamento.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalEquipamento.tsx) e [`assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx) agora fazem render incremental (`mostrar mais`) para reduzir custo de DOM em listas grandes
  - [`assistenterpg-front/src/lib/api/inventario.ts`](../assistenterpg-front/src/lib/api/inventario.ts) passou a aplicar cache curto + dedupe de requests em voo no `POST /inventario/preview`, removendo logs de debug e reduzindo chamadas repetidas no wizard
  - [`assistenterpg-front/src/hooks/useInventarioPreview.ts`](../assistenterpg-front/src/hooks/useInventarioPreview.ts) adicionou dedupe de sincronização em voo por hash de payload para evitar chamadas concorrentes idênticas
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepInventario.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepInventario.tsx) passou a usar `useDeferredValue` na busca de itens/equipamentos e render incremental da lista principal de itens
  - [`assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalEquipamento.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalEquipamento.tsx) e [`assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx`](../assistenterpg-front/src/components/personagem-base/create/modal/InventarioModalModificações.tsx) agora resetam limite incremental ao trocar busca/categoria/equipamento, evitando render excessivo herdado da seleção anterior
  - [`assistenterpg-front/src/app/personagens-base/page.tsx`](../assistenterpg-front/src/app/personagens-base/page.tsx), [`assistenterpg-front/src/components/suplemento-admin/habilidades/HabilidadesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/habilidades/HabilidadesAdminPanel.tsx), [`assistenterpg-front/src/components/suplemento-admin/panels/EquipamentosAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/EquipamentosAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx) receberam ajustes de layout mobile-first (`flex-wrap`, paginação empilhada em telas pequenas, botões fluidos) para reduzir overflow horizontal
  - [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) ampliou o container para `max-w-7xl`, melhorando leitura dos painéis tabulares no desktop sem quebrar mobile
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx) removeu o atraso artificial de `100ms` na troca de etapa, mantendo transicao visual sem penalizar responsividade
  - [`assistenterpg-front/src/hooks/useInventarioPreview.ts`](../assistenterpg-front/src/hooks/useInventarioPreview.ts) foi simplificado (remoção de logs detalhados e dedupe por hash de payload) para reduzir ruído e chamadas redundantes no fluxo de sincronização do inventário
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepPoderes.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepPoderes.tsx) e [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepPerícias.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepPerícias.tsx) passaram a usar busca com `useDeferredValue` e lista incremental (`mostrar mais`) para manter digitação/render fluido com catálogos grandes
  - [`assistenterpg-front/src/lib/api/catálogos.test.ts`](../assistenterpg-front/src/lib/api/catálogos.test.ts), [`assistenterpg-front/src/lib/api/equipamentos.test.ts`](../assistenterpg-front/src/lib/api/equipamentos.test.ts), [`assistenterpg-front/src/lib/api/modificações.test.ts`](../assistenterpg-front/src/lib/api/modificações.test.ts) e [`assistenterpg-front/src/lib/api/inventario.test.ts`](../assistenterpg-front/src/lib/api/inventario.test.ts) validam cache/dedupe e agregação paginada para evitar regressão
- backend performance (queries e indices):
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts) removeu N+1 no preview de resistências (lookup em lote por `codigo`) e paralelizou carregamento de perícias/proficiências/tipos de grau com `Promise.all`
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts) trocou `findMany(...).length` por `count()` no resumo de inventário para reduzir custo de leitura em personagens com muitos itens
  - [`assistenterpg-back/prisma/schema.prisma`](../assistenterpg-back/prisma/schema.prisma) recebeu indices adicionais para filtros/listagens frequentes:
    - `Campanha`: `donoId`, `donoId+criadoEm`
    - `MembroCampanha`: `usuarioId`, `usuarioId+campanhaId`
    - `PersonagemBase`: `donoId`, `donoId+nome`
    - `PersonagemCampanha`: `campanhaId`, `personagemBaseId`, `donoId`, `campanhaId+personagemBaseId (unique)`, `campanhaId+donoId (unique)`
    - `PersonagemCampanhaModificador`: `personagemCampanhaId+ativo`, `campanhaId+criadoEm`, `sessaoId`, `cenaId`, `campanhaId+personagemCampanhaId+sessaoId+ativo`, `campanhaId+personagemCampanhaId+cenaId+ativo`
    - `PersonagemCampanhaHistorico`: `personagemCampanhaId+criadoEm`, `campanhaId+criadoEm`
    - `ConviteCampanha`: `email+status+criadoEm`, `campanhaId+status`
    - `Homebrew`: `usuarioId+criadoEm`, `status+criadoEm`
- backend prebuild Prisma:
  - [`assistenterpg-back/scripts/check-prisma-client.js`](../assistenterpg-back/scripts/check-prisma-client.js) foi corrigido para remover bloco duplicado que quebrava `npm run build`
- backend tratativa de erros e observabilidade:
  - [`assistenterpg-back/src/common/http/error-response.util.ts`](../assistenterpg-back/src/common/http/error-response.util.ts) centraliza normalização do contrato de erro (`code`, `error`, `message`, `details`, `field`)
  - [`assistenterpg-back/src/common/filters/http-exception.filter.ts`](../assistenterpg-back/src/common/filters/http-exception.filter.ts) e [`assistenterpg-back/src/common/filters/all-exceptions.filter.ts`](../assistenterpg-back/src/common/filters/all-exceptions.filter.ts) agora usam o mesmo formato padrão, incluindo `VALIDATION_ERROR` para erros de DTO e `x-request-id/traceId` consistente
  - [`assistenterpg-back/src/common/interceptors/logging.interceptor.ts`](../assistenterpg-back/src/common/interceptors/logging.interceptor.ts) passa a logar status real da resposta e mascarar campos sensíveis no body (`senha`, `token`, etc.)
  - [`assistenterpg-back/src/common/http/error-response.util.spec.ts`](../assistenterpg-back/src/common/http/error-response.util.spec.ts) cobre casos-base de normalização para evitar regressão de contrato
  - [`assistenterpg-back/src/common/filters/error-contract.integration.spec.ts`](../assistenterpg-back/src/common/filters/error-contract.integration.spec.ts) valida no nível HTTP o envelope final de erro para cenarios de validação, erro de domínio (incluindo `CAMPANHA_NOT_FOUND`/`INVENTARIO_ESPACOS_INSUFICIENTES`), erro inesperado e geração/eco de `x-request-id`
  - validações de catálogo relacionadas a `fonte/suplementoId` passaram a retornar codigos de domínio (`FONTE_SUPLEMENTO_OBRIGATORIA` e `SUPLEMENTO_ID_OBRIGATORIO`) em vez de `BAD_REQUEST` genérico
- cobertura de paginação e contrato de lista:
  - [`assistenterpg-front/src/lib/api/pagination.test.ts`](../assistenterpg-front/src/lib/api/pagination.test.ts) cobre normalização de envelopes `items/total/page/limit/totalPages`, `dados/paginação` e payloads malformados
  - [`assistenterpg-front/src/lib/utils/lista-paginada.ts`](../assistenterpg-front/src/lib/utils/lista-paginada.ts) centraliza regra de ajuste de página fora do range (ex.: última página fica vazia após exclusão)
  - [`assistenterpg-front/src/lib/utils/lista-paginada.test.ts`](../assistenterpg-front/src/lib/utils/lista-paginada.test.ts) cobre cenarios de ajuste/aplicação de dados e normalização de `totalPages`
  - [`assistenterpg-front/src/app/campanhas/page.tsx`](../assistenterpg-front/src/app/campanhas/page.tsx) e [`assistenterpg-front/src/app/personagens-base/page.tsx`](../assistenterpg-front/src/app/personagens-base/page.tsx) passaram a reútilizar a mesma regra de fallback de página
  - [`assistenterpg-back/src/common/dto/pagination-query.dto.spec.ts`](../assistenterpg-back/src/common/dto/pagination-query.dto.spec.ts) cobre limites de `page/limit` no DTO
  - [`assistenterpg-back/src/common/dto/pagination-query.integration.spec.ts`](../assistenterpg-back/src/common/dto/pagination-query.integration.spec.ts) valida no nível HTTP conversão de query string para número e retorno de `VALIDATION_ERROR` para valores fora da regra
- backend autorização de escrita:
  - [`assistenterpg-back/src/classes/classes.controller.ts`](../assistenterpg-back/src/classes/classes.controller.ts), [`assistenterpg-back/src/clas/clas.controller.ts`](../assistenterpg-back/src/clas/clas.controller.ts), [`assistenterpg-back/src/origens/origens.controller.ts`](../assistenterpg-back/src/origens/origens.controller.ts), [`assistenterpg-back/src/trilhas/trilhas.controller.ts`](../assistenterpg-back/src/trilhas/trilhas.controller.ts) e [`assistenterpg-back/src/habilidades/habilidades.controller.ts`](../assistenterpg-back/src/habilidades/habilidades.controller.ts): rotas de escrita (`POST/PATCH/DELETE`) agora exigem `JWT+Admin`, mantendo leitura (`GET`) com `JWT`
  - [`assistenterpg-back/src/modificacoes/modificações.controller.ts`](../assistenterpg-back/src/modificacoes/modificações.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/equipamentos/equipamentos.controller.ts`](../assistenterpg-back/src/equipamentos/equipamentos.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/compendio/compendio.controller.ts`](../assistenterpg-back/src/compendio/compendio.controller.ts): CRUD de categorias/subcategorias/artigos agora exige `JWT+Admin`
  - [`assistenterpg-back/src/proficiencias/proficiencias.controller.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts) e [`assistenterpg-back/src/condicoes/condicoes.controller.ts`](../assistenterpg-back/src/condicoes/condicoes.controller.ts): `POST/PATCH/DELETE` agora exigem `JWT+Admin`, mantendo `GET` com `JWT`
- backend contrato de leitura do compendio:
  - [`assistenterpg-back/src/compendio/compendio.controller.ts`](../assistenterpg-back/src/compendio/compendio.controller.ts): `GET /compendio/artigos` agora usa `ParseIntPipe` em `subcategoriaId`, retornando `400` para query inválida em vez de ignorar filtro silenciosamente
- backend contrato de leitura de personagem-base:
  - [`assistenterpg-back/src/personagem-base/personagem-base.controller.ts`](../assistenterpg-back/src/personagem-base/personagem-base.controller.ts): `GET /personagens-base/tecnicas-disponiveis` agora valida `origemId` com `ParseIntPipe` opcional, retornando `400` para query inválida em vez de ignorar silenciosamente
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts): `PATCH /personagens-base/:id` agora sincroniza `itensInventario` quando enviado (inclusive limpeza com array vazio)
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.spec.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.spec.ts) cobre cenários de sincronização de inventário no update (`undefined`, lista vazia e lista com itens)
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx) agora envia `itensInventario: []` em vez de omitir o campo quando o inventário é esvaziado
- backend contrato de DTO do inventário:
  - [`assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts) e [`assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts): parse de boolean/int ficou estrito para evitar fallback silencioso em payload inválido (ex.: `"abc"` não vira `false` nem `3`), mesmo com `enableImplicitConversion` global ligado
  - [`assistenterpg-back/src/inventario/dto/adicionar-item.dto.spec.ts`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.spec.ts) e [`assistenterpg-back/src/inventario/dto/atualizar-item.dto.spec.ts`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.spec.ts) cobrem conversões válidas e rejeição de entradas inválidas
  - [`assistenterpg-back/src/common/http/error-response.util.ts`](../assistenterpg-back/src/common/http/error-response.util.ts): `VALIDATION_ERROR` agora cobre validação de DTO e parse de params/query (pipes), tentando inferir `field` quando possível
  - [`assistenterpg-back/src/common/filters/error-contract.integration.spec.ts`](../assistenterpg-back/src/common/filters/error-contract.integration.spec.ts) valida o contrato de erro para `inventario`, `equipamentos`, `suplementos` e `homebrews`, cobrindo payload/query/param inválidos (incluindo `ParseIntPipe` e validação de DTO com `field` inferido quando possível)
  - [`assistenterpg-back/src/common/filters/error-contract-modulos.integration.spec.ts`](../assistenterpg-back/src/common/filters/error-contract-modulos.integration.spec.ts) amplia cobertura de contrato de erro para `compendio`, `personagens-base`, `trilhas`, `classes`, `clas`, `origens`, `habilidades`, `modificações`, `perícias`, `proficiencias`, `tipos-grau` e `condicoes` com cenarios inválidos de query/body/param
- backend contrato de catálogos menores:
  - IDs de rota de [`assistenterpg-back/src/classes/classes.controller.ts`](../assistenterpg-back/src/classes/classes.controller.ts), [`assistenterpg-back/src/pericias/perícias.controller.ts`](../assistenterpg-back/src/pericias/perícias.controller.ts), [`assistenterpg-back/src/proficiencias/proficiencias.controller.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.ts) e [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts) agora usam `ParseIntPipe` para falhar com 400 em params inválidos
  - DTOs [`assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts`](../assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts), [`assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts`](../assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts), [`assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts`](../assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts) e [`assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts`](../assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts) agora possuem validação `class-validator` consistente com `ValidationPipe` global
- backend contrato de trilhas/caminhos:
  - [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts): `PATCH /trilhas/:id` agora aplica `classeId` quando enviado (com validação de existência da classe)
  - [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts): `PATCH /trilhas/:id` e `PATCH /trilhas/caminhos/:id` agora aceitam array vazio para limpar habilidades vinculadas
- backend contrato de tecnicas-amaldicoadas:
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts): parse de boolean em query foi corrigido e endurecido para usar valor bruto da query (evitando coerção silenciosa com `enableImplicitConversion`)
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts) e [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts): IDs agora exigem `>= 1` quando informados; `clasHereditarios` também passou a exigir strings não vazias (com `trim`) no create/update
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts): `PATCH /tecnicas-amaldicoadas/:id` agora valida nome duplicado e mantém consistência de vínculos de cla ao alternar `hereditaria`
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts): rotas de escrita (`POST/PATCH/DELETE`) agora exigem `JWT+Admin`, mantendo leitura (`GET`) com `JWT`
- frontend cliente de tecnicas-amaldicoadas:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts) agora expõe cliente completo para habilidades/variacoes de técnica (GET/GET by id/POST/PATCH/DELETE)
  - [`assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts) recebeu tipagem dedicada para payloads/respostas de habilidades e variações de técnica
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx) passaram a integrar esses endpoints na UI admin
  - o modal de habilidades/variacoes foi ampliado para editar também campos avançados do contrato (execução/área/alcance/alvo/duração/resistência/críticos/dano/escalonamento/requisitos), priorizando editores guiados e mantendo modo JSON apenas como fallback para casos complexos
  - seed de técnicas não inatas básicas foi adicionado em [`assistenterpg-back/prisma/seeds/tecnicas/tecnicas-nao-inatas.ts`](../assistenterpg-back/prisma/seeds/tecnicas/tecnicas-nao-inatas.ts) e integrado no pipeline principal [`assistenterpg-back/prisma/seeds.ts`](../assistenterpg-back/prisma/seeds.ts)
  - a ficha de personagem (aba `Poderes`) agora exibe subseções de `Técnica Inata` e `Técnicas Não Inatas` com habilidades/variações vindas de `GET /tecnicas-amaldicoadas?tipo=NAO_INATA&incluirHabilidades=true`
  - arquivos principais do frontend impactados: [`assistenterpg-front/src/components/personagem-base/sections/usePersonagemBaseDetalhe.ts`](../assistenterpg-front/src/components/personagem-base/sections/usePersonagemBaseDetalhe.ts), [`assistenterpg-front/src/components/personagem-base/sections/SeçãoPoderes.tsx`](../assistenterpg-front/src/components/personagem-base/sections/SeçãoPoderes.tsx) e [`assistenterpg-front/src/lib/types/catalogo.types.ts`](../assistenterpg-front/src/lib/types/catalogo.types.ts)
- frontend cliente/admin de catálogos menores:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts) agora expõe CRUD completo de `proficiencias`, `tipos-grau` e `condicoes`
  - [`assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts) recebeu payloads/tipos para `Create/Update` desses catálogos e `CondicaoCatalogo`
  - [`assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx), [`assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx) integram esse CRUD no painel admin
  - [`assistenterpg-front/src/lib/constants/suplemento-admin.ts`](../assistenterpg-front/src/lib/constants/suplemento-admin.ts) e [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) ganharam os novos módulos (`proficiencias`, `tipos-grau`, `condicoes`)
- backend contrato de filtros (suplementos/homebrews):
  - [`assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts) e [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts): parse de boolean em query foi corrigido e endurecido para usar valor bruto da query, evitando aceitar valores inválidos quando `enableImplicitConversion` estiver ativo
  - [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts): `usuarioId`, `pagina` e `limite` agora exigem `>= 1`
- backend contrato de filtros (equipamentos):
  - [`assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts): parse de `apenasAmaldicoados` em query foi corrigido e endurecido para usar valor bruto da query, evitando aceitar string invalida com `enableImplicitConversion`
- testes de DTO:
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.spec.ts) cobre parse de boolean, rejeição de valor inválido (inclusive com `enableImplicitConversion`) e validação de `claId/suplementoId`
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.spec.ts) cobre normalização e validação de `clasHereditarios` (strings vazias/espaços)
  - [`assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.spec.ts`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.spec.ts), [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.spec.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.spec.ts) e [`assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.spec.ts`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.spec.ts) cobrem parse de boolean, rejeição com `enableImplicitConversion` e limites mínimos de filtros
- testes de contrato de auth:
  - [`assistenterpg-back/src/modificacoes/modificações.controller.spec.ts`](../assistenterpg-back/src/modificacoes/modificações.controller.spec.ts), [`assistenterpg-back/src/equipamentos/equipamentos.controller.spec.ts`](../assistenterpg-back/src/equipamentos/equipamentos.controller.spec.ts) e [`assistenterpg-back/src/compendio/compendio.controller.spec.ts`](../assistenterpg-back/src/compendio/compendio.controller.spec.ts) agora validam via metadata quais rotas são públicas/JWT/JWT+Admin, reduzindo risco de regressão de autorização
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.spec.ts) agora valida por metadata a separação `GET=JWT` e `POST/PATCH/DELETE=JWT+Admin` para técnicas/habilidades/variacoes
  - [`assistenterpg-back/src/proficiencias/proficiencias.controller.spec.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.spec.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.spec.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.spec.ts) e [`assistenterpg-back/src/condicoes/condicoes.controller.spec.ts`](../assistenterpg-back/src/condicoes/condicoes.controller.spec.ts) agora validam por metadata a separação `GET=JWT` e `POST/PATCH/DELETE=JWT+Admin`
- baseline de lint no backend:
  - [`assistenterpg-back/eslint.config.mjs`](../assistenterpg-back/eslint.config.mjs) foi ajustado para tratar `no-unsafe-*` como `warn`, permitindo `npm run lint` passar sem mascarar o debito histórico
  - erros de lint de baixo esforco (imports/variáveis não usadas, `require-await`, `no-case-declarations`) foram corrigidos em módulos afetados
  - tipagem Prisma aplicada em [`assistenterpg-back/src/equipamentos/equipamentos.service.ts`](../assistenterpg-back/src/equipamentos/equipamentos.service.ts), [`assistenterpg-back/src/inventario/inventario.service.ts`](../assistenterpg-back/src/inventario/inventario.service.ts), [`assistenterpg-back/src/modificacoes/modificacoes.service.ts`](../assistenterpg-back/src/modificacoes/modificacoes.service.ts), [`assistenterpg-back/src/origens/origens.service.ts`](../assistenterpg-back/src/origens/origens.service.ts), [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts), [`assistenterpg-back/src/usuario/usuario.service.ts`](../assistenterpg-back/src/usuario/usuario.service.ts), [`assistenterpg-back/src/proficiencias/proficiencias.service.ts`](../assistenterpg-back/src/proficiencias/proficiencias.service.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.service.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.service.ts), [`assistenterpg-back/src/pericias/pericias.service.ts`](../assistenterpg-back/src/pericias/pericias.service.ts), [`assistenterpg-back/src/classes/classes.service.ts`](../assistenterpg-back/src/classes/classes.service.ts), [`assistenterpg-back/src/suplementos/suplementos.service.ts`](../assistenterpg-back/src/suplementos/suplementos.service.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts), [`assistenterpg-back/src/homebrews/homebrews.service.ts`](../assistenterpg-back/src/homebrews/homebrews.service.ts), [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts), [`assistenterpg-back/src/personagem-base/personagem-base.mapper.ts`](../assistenterpg-back/src/personagem-base/personagem-base.mapper.ts), [`assistenterpg-back/src/personagem-base/personagem-base.persistence.ts`](../assistenterpg-back/src/personagem-base/personagem-base.persistence.ts), regras de criação de `personagem-base` e filtros globais de erro, removendo casts inseguros (`any`/`unknown as`) nos fluxos principais desses módulos
  - redução mensurável de warnings globais `no-unsafe-*`: `1987 -> 1755 -> 1732 -> 1636 -> 1557 -> 1462 -> 1217 -> 236 -> 124 -> 101 -> 75 -> 36 -> 21 -> 0` (medição em 2026-03-08)
- testes de fallback no frontend:
  - [`assistenterpg-front/src/lib/utils/compendio.test.ts`](../assistenterpg-front/src/lib/utils/compendio.test.ts) cobre fallback de categorias/destaques/busca por codigo/busca textual
  - [`assistenterpg-front/package.json`](../assistenterpg-front/package.json) agora expõe scripts `test` e `test:watch` via Vitest
- contrato de tipos no frontend:
  - [`assistenterpg-front/src/lib/types/inventario.types.ts`](../assistenterpg-front/src/lib/types/inventario.types.ts): `InventarioCompletoDto` foi alinhado com o retorno real de `GET /inventario/personagem/:id` (`{ espaços, grauXama, resumoPorCategoria, podeAdicionarCategoria0, statsEquipados }`)

## 8.3 Pontos de atencao (não alterados para evitar quebra)

- padrão de paginação ainda heterogeneo no backend
- backend passa em `npm run lint` sem warnings (medição de 2026-03-08), com `errors=0` e `warnings=0` em `src`
- há comentários de debug antigos em alguns controllers/services (não afetam contrato)

## 9. Guia rápido de requests (exemplos)

## 9.1 Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@domínio.com",
  "senha": "123456"
}
```

## 9.2 Criar personagem base

```http
POST /personagens-base
Authorization: Bearer <token>
Content-Type: application/json
```

Body completo em:

- [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
- [`CreatePersonagemBasePayload`](../assistenterpg-front/src/lib/types/personagem.types.ts)

## 9.3 Listar equipamentos com filtros

```http
GET /equipamentos?tipo=ARMA&pagina=1&limite=20&busca=katana
```

Resposta:

- envelope `{ dados, paginação }`

## 9.4 Preview de inventário do wizard

```http
POST /inventario/preview
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "forca": 2,
  "prestigioBase": 3,
  "itens": [
    {
      "equipamentoId": 10,
      "quantidade": 1,
      "equipado": true,
      "modificações": [2]
    }
  ]
}
```

## 9.5 Ativar suplemento

```http
POST /suplementos/12/ativar
Authorization: Bearer <token>
```

Retorno esperado:

```json
{ "message": "Suplemento ativado com sucesso" }
```

## 10. Política desta pasta

- Não criar documentação paralela em `assistenterpg-back/docs` ou `assistenterpg-front/backend_docs`.
- Toda alteração de contrato/front/back deve atualizar este arquivo.
