# Guia de Seguranca Pre-Release - AssistenteRPG

Este arquivo e o roteiro operacional para o agente Codex revisar, testar e corrigir a seguranca do AssistenteRPG antes da liberacao do app.

O objetivo e corrigir riscos reais primeiro. As Partes 0 a 4 cobriram hardening pre-release; a etapa seguinte migrou a sessao para cookies HttpOnly cross-site com refresh token e CSRF.

## Plano em partes

Regra de execucao: nao avancar para a proxima parte enquanto a parte atual nao tiver validacao minima e evidencia registrada neste arquivo.

| Parte | Objetivo | Status | Evidencia |
| --- | --- | --- | --- |
| Parte 0 | Organizar este guia em etapas executaveis. | corrigido | Secao `Plano em partes` adicionada. |
| Parte 1 | Corrigir achados confirmados e configuracao segura de baixo risco. | corrigido | `/configuracoes`, Swagger, CORS HTTP/WebSocket, Helmet e headers do Next ajustados; validacoes front/back passaram em 2026-05-22. |
| Parte 2 | Endurecer auth e abuso de endpoints. | corrigido | Rate limit em auth, senha minima 8, JWT secret forte em producao e testes de enumeracao/token reutilizado adicionados; backend passou em 2026-05-22. |
| Parte 3 | Revisar controle de acesso e IDOR por modulo. | corrigido | Testes focados adicionados para anotacoes, inventario, NPCs/ameacas, homebrews e amizades; backend passou em 2026-05-22. |
| Parte 4 | Executar pentest e aceite final. | corrigido | Matriz preenchida, audits de dependencias sem vulnerabilidades e validacoes completas em 2026-05-22. |
| Parte 5 | Migrar auth para cookies HttpOnly, refresh rotativo e CSRF. | corrigido | Modelo `SessaoAutenticacao`, cookies `assistenterpg_access/refresh/csrf`, CSRF guard, refresh rotativo, front sem Bearer em storage e validacoes completas em 2026-05-22. |

Validacao minima por parte:

- Parte 1: front `npm run lint`, `npm run test`, `npm run build`; back `npm run test`, `npm run build`; buscas de seguranca sem achados dos itens corrigidos.
- Parte 2: testes de auth/rate limit/senha e build do backend.
- Parte 3: testes de permissao por modulo e build do backend.
- Parte 4: validacao completa front/back, `git diff --check` e matriz de pentest preenchida.

## Estado inicial conhecido

Achados confirmados por inspeccao do repositorio:

- `/configuracoes` tem um botao `Voltar` apontando para `/`, o que envia usuario autenticado para a landing.
- `/configuracoes` exibe `ID do usuario` na UI. O `id` deve continuar existindo como dado interno, mas nao deve ser exibido ao usuario.
- Swagger esta habilitado por padrao quando `SWAGGER_ENABLED` nao e `false`.
- O front usa Bearer token em `localStorage` ou `sessionStorage`.
- `main.ts` usa `CORS_ORIGINS || 'http://localhost:3001'`.
- Gateways Socket.IO usam `origin: true` quando `CORS_ORIGINS` nao existe.
- JWT exige `JWT_SECRET` em producao, mas usa `dev-secret` fora de producao.
- `ValidationPipe` global ja esta configurado com `transform`, `whitelist` e `forbidNonWhitelisted`.
- Audits de dependencias foram corrigidos na Parte 4 com updates seguros, `npm audit fix` sem force e override de `postcss` no front para evitar downgrade indevido do Next.

## Ordem obrigatoria de trabalho

1. Criar branch ou confirmar worktree limpa:

```powershell
git status --short
```

2. Corrigir navegacao e exposicao de dados de usuario.
3. Fazer auditoria de configuracao, autenticacao e autorizacao.
4. Rodar pentest manual e automatizado conforme matriz abaixo.
5. Corrigir falhas encontradas.
6. Rodar validacoes finais.
7. Atualizar a tabela de resultados no fim deste arquivo.

## Correcoes imediatas obrigatorias

### Frontend

- Em `/configuracoes`, trocar o destino do botao `Voltar` de `/` para `/home`.
- Auditar todos os links/botoes com texto `Voltar`, `Voltar para`, `Cancelar` ou similares em rotas autenticadas.
- Regra: rotas autenticadas nao devem usar `/` como destino generico de retorno.
- Remover o campo `ID do usuario` da tela de configuracoes.
- Manter `usuario.id` no contexto/tipos apenas para uso interno de API, permissao e logs client-side necessarios.

Comandos de busca sugeridos:

```powershell
rg -n "Voltar|Cancelar|href=\"/\"|href='/'|router\.push\('/'\)|router\.replace\('/'\)" assistenterpg-front/src/app assistenterpg-front/src/components -g "*.tsx" -g "*.ts"
rg -n "ID do usuario|ID do usu|usuario\?\.id|usuario.id|user.id" assistenterpg-front/src/app/configuracoes assistenterpg-front/src/components/configuracoes -g "*.tsx" -g "*.ts"
```

### Backend

- Confirmar que `SWAGGER_ENABLED` fica desabilitado por padrao em producao.
- Exigir `CORS_ORIGINS` explicito em producao para HTTP e WebSocket.
- Remover fallback permissivo de WebSocket em producao.
- Adicionar ou validar security headers com `helmet` no Nest.
- Adicionar headers de seguranca no Next quando aplicavel.

## Checklist backend

### Validacao de entrada

- Confirmar `ValidationPipe` global com:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
- Revisar DTOs sem limite de tamanho em strings. Adicionar `MaxLength` onde houver entrada livre.
- Revisar DTOs de senha para politica minima coerente. Hoje `MinLength(6)` existe, mas deve ser avaliado para producao.
- Revisar arrays e objetos aninhados para garantir `IsArray`, validacao por item e limites.
- Revisar imports JSON/homebrew/NPC/tecnicas para impedir payloads gigantes ou campos inesperados.

Busca sugerida:

```powershell
rg -n "export class .*Dto|@IsString|@IsOptional|@IsArray|@ValidateNested|@MaxLength|@MinLength" assistenterpg-back/src -g "*.ts"
rg -n "\$queryRaw|\$executeRaw|queryRawUnsafe|executeRawUnsafe|Prisma\.raw" assistenterpg-back/src -g "*.ts"
```

### Injection

Testar payloads em campos de texto, query params e imports:

```text
' OR '1'='1
" OR "1"="1
; DROP TABLE Usuario; --
{"$ne": null}
<script>alert(1)</script>
![x](javascript:alert(1))
[x](javascript:alert(1))
```

Resultado esperado:

- Prisma deve usar queries parametrizadas.
- DTO deve rejeitar tipos errados e campos extras.
- Markdown renderizado nao deve executar HTML/script.
- Erros nao devem vazar stack trace em producao.

### Controle de acesso

Auditar todos os controllers:

- Rotas privadas devem ter `JwtAuthGuard` ou `AuthGuard('jwt')`.
- Rotas administrativas devem ter `JwtAuthGuard` + `AdminGuard`, ou controller protegido por JWT e metodo protegido por `AdminGuard`.
- Services devem validar dono, membro ou papel antes de retornar/alterar dados.
- Troca manual de IDs na URL nao deve dar acesso a dados de outro usuario.

Modulos prioritarios:

- `usuario`
- `campanha`
- `personagem-base`
- `homebrews`
- `npcs-ameacas`
- `anotacoes`
- `amizades`
- `sessao`
- `compendio` admin
- `suplementos` admin

Busca sugerida:

```powershell
rg -n "@Controller|@UseGuards|@Get|@Post|@Patch|@Put|@Delete|AdminGuard|JwtAuthGuard|AuthGuard\\('jwt'\\)" assistenterpg-back/src -g "*.ts"
rg -n "usuarioId|donoId|membro|papel|MESTRE|ADMIN|isAdmin|ehMestre|garantirAcesso" assistenterpg-back/src -g "*.ts"
```

## Checklist auth e sessao

### Modelo atual apos Parte 5

O modelo atual usa cookies emitidos pela API:

- `assistenterpg_access`: JWT curto, HttpOnly, com `sid` da sessao.
- `assistenterpg_refresh`: segredo opaco longo, HttpOnly, salvo no banco apenas como hash e rotacionado em `/auth/refresh`.
- `assistenterpg_csrf`: token CSRF nao-HttpOnly no dominio da API, tambem retornado por `/auth/csrf`.
- `assistenterpg_auth_hint`: cookie nao sensivel do front, usado apenas pelo `proxy.ts` para UX de redirect.

Em producao cross-site Vercel + Render, configurar cookies como `SameSite=None; Secure`, usar `withCredentials: true` no front e exigir `CORS_ORIGINS` exato. O backend continua sendo a fronteira real de seguranca.

Bearer token fica somente como fallback temporario fora de producao ou com `AUTH_BEARER_FALLBACK_ENABLED=true`; em producao, sem essa env, o fallback fica desligado.

### Testes obrigatorios

- Login com credenciais validas.
- Login com senha errada sem revelar se o email existe.
- Registro com email ja existente sem vazar dados sensiveis.
- Recuperacao de senha sem enumerar email.
- Reset de senha com token invalido, expirado e reutilizado.
- Verificacao de email com token invalido, expirado e reutilizado.
- Logout revogando sessao, limpando cookies e bloqueando chamadas futuras.
- Access expirado com refresh valido renovando uma vez e repetindo a chamada.
- Refresh antigo reutilizado revogando sessoes ativas do usuario.
- Mutacoes sem `X-CSRF-Token` sendo bloqueadas quando houver sessao por cookie.
- Acesso direto a rota privada sem cookie auxiliar redirecionando para `/auth/login`.
- Usuario logado acessando `/` ou `/auth/*` redirecionando corretamente.

### Hardening recomendado nesta fase

- Exigir `JWT_SECRET` forte em qualquer ambiente de deploy, nao apenas `NODE_ENV=production`.
- Revisar expiracao atual de JWT de 7 dias.
- Adicionar rate limit para:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
  - `/auth/resend-verification-email`
  - `/auth/reset-password`
- Nao logar tokens, senhas, Authorization ou payloads sensiveis.

### Fase futura

Planejar migracao para dominio proprio:

- front em `app.seudominio.com`;
- API em `api.seudominio.com`;
- cookies com `SameSite=Lax` quando o fluxo permitir;
- avaliacao de CSP mais restritiva depois de estabilizar assets externos.

## Checklist configuracao e transporte

### Variaveis obrigatorias em producao

Validar no ambiente de deploy:

```text
NODE_ENV=production
JWT_SECRET=<segredo forte>
FRONTEND_URL=https://...
NEXT_PUBLIC_API_URL=https://...
CORS_ORIGINS=https://...
SWAGGER_ENABLED=false
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
AUTH_BEARER_FALLBACK_ENABLED=false
```

### HTTP e WebSocket

- HTTP CORS deve aceitar apenas origens conhecidas.
- WebSocket `/sessoes` e `/presenca` devem seguir as mesmas origens.
- Sem fallback `origin: true` em producao.
- `credentials: true` so deve existir com lista de origens explicita.

### HTTPS/TLS

Validar no provedor:

- HTTP redireciona para HTTPS.
- TLS 1.2+ ativo.
- Certificado valido.
- HSTS ativo se o dominio ja estiver estabilizado.
- API e front usam URLs HTTPS em producao.

### Headers

Recomendar Helmet no Nest:

- `X-Content-Type-Options`
- `Referrer-Policy`
- `X-Frame-Options` ou CSP `frame-ancestors`
- CSP basica compativel com Next e assets atuais
- desabilitar `X-Powered-By`

No Next, revisar `next.config.ts` para headers de seguranca quando aplicavel.

## Pentest manual e automatizado

Preencher uma linha por teste real executado.

| Area | Cenario | Como testar | Resultado esperado | Status | Evidencia | Correcao |
| --- | --- | --- | --- | --- | --- | --- |
| Auth | Login brute force | Repetir tentativas invalidas no mesmo email/IP | Bloqueio ou rate limit | corrigido | `@nestjs/throttler` aplicado em `POST /auth/login`; metadata test em `auth.controller.spec.ts`. | |
| Auth | Enumeracao em forgot password | Testar email existente e inexistente | Mesma resposta publica | passou | Teste automatizado em `auth.service.spec.ts` compara respostas de email existente/inexistente. | |
| Auth | Reset token reutilizado | Usar mesmo token duas vezes | Segunda tentativa falha | passou | Teste automatizado em `auth-token.service.spec.ts` cobre `updateMany.count = 0`. | |
| Auth | Refresh token rotativo | Usar refresh, depois reutilizar o antigo | Antigo falha e sessoes ativas sao revogadas | corrigido | `auth-session.service.spec.ts` cobre rotacao para nova sessao e reuse de refresh revogado. | |
| Auth | CSRF em mutacoes | Enviar mutacao com cookies sem `X-CSRF-Token` | 403 | corrigido | `CsrfGuard` global exige CSRF para metodos mutantes quando ha sessao por cookie; `auth-session.service.spec.ts` valida hash CSRF. | |
| Auth | Token em storage | Inspecionar `localStorage/sessionStorage` | Nenhum JWT novo salvo no browser | corrigido | Front removeu `access_token` do contrato, apagou Bearer no Axios/Sockets e limpa `assistenterpg_token` legado no bootstrap. | |
| Rotas privadas | Sem sessao | Abrir `/home`, `/campanhas`, `/configuracoes` sem marcador de sessao | Redireciona para login | corrigido | `proxy.ts` usa apenas `assistenterpg_auth_hint` para UX; backend nega dados sem cookies HttpOnly validos. | |
| Configuracoes | ID na UI | Abrir `/configuracoes` | Nao exibe ID do usuario | corrigido | Campo removido de `assistenterpg-front/src/app/configuracoes/page.tsx`; busca por `ID do usuario` sem achados. | |
| Navegacao | Voltar autenticado | Clicar voltar em telas privadas | Nao vai para landing | passou | `/configuracoes` volta para `/home`; busca por `href="/"`, `router.push('/')` e `router.replace('/')` em rotas/componentes autenticados sem achados. | |
| Campanhas | IDOR detalhe | Usuario A tenta abrir campanha de usuario B | 403/404 | passou | `campanha.access.service.spec.ts` cobre usuario que nao e dono nem membro; services usam `garantirAcesso`. | |
| Campanhas | IDOR personagem | Trocar `personagemCampanhaId` na URL/API | 403/404 | passou | `campanha.access.service.spec.ts` cobre personagem de outra campanha e edicao por membro sem permissao. | |
| Campanhas | Papel mestre | Jogador tenta encerrar sessao/alterar cena | 403 | passou | Inspecao de `SessaoService`: operacoes mutantes sensiveis chamam `assertMestre`; `sessao.service.spec.ts` cobre fluxo de mestre e testes existentes cobrem regras de turno. | |
| Anotacoes | Anotacao de outro usuario | Trocar `id` em update/delete | 403/404 | passou | Testes automatizados em `anotacoes.service.spec.ts` cobrem listagem por `usuarioId`, edicao e remocao cross-user. | |
| Inventario | Item de outro personagem | Trocar `itemId` em PATCH/DELETE | 403/404 | passou | Testes automatizados em `inventario.service.spec.ts` cobrem update/delete/modificacao com `validarPropriedade` falhando. | |
| NPCs/Ameacas | NPC de outro usuario | Trocar `id` em detalhe/update/delete | 403/404 | passou | Testes automatizados em `npcs-ameacas.service.spec.ts` validam `findFirst({ id, donoId })` e bloqueio de update/delete. | |
| Homebrews | Editar homebrew de outro usuario | Trocar `id` no endpoint | 403/404 | corrigido | Testes automatizados em `homebrews.service.spec.ts`; `HomebrewSemPermissaoException` deixou de ser reembalada como `HomebrewDadosInvalidosException`. | |
| Homebrews | Import JSON malicioso | Enviar payload gigante/campos extras/script | corrigido | `ImportarHomebrewJsonDto` passou a limitar metadados e `items` a 100 entradas; `importar-homebrew-json.dto.spec.ts` cobre payload excessivo. | |
| Compendio admin | Usuario comum edita artigo | Chamar PUT/POST admin sem ADMIN | 403 | passou | `compendio.controller.spec.ts` valida guards `JwtAuthGuard + AdminGuard` nas rotas administrativas. | |
| Suplementos admin | Usuario comum altera suplemento | Chamar rotas admin sem ADMIN | 403 | passou | Inspecao de `suplementos.controller.ts`: rotas de escrita usam `JwtAuthGuard + AdminGuard`. | |
| Amizades | Resolver usuario | Buscar por apelido/email | Nao expoe email indevido | passou | `amizades.service.spec.ts` valida retorno sem email e query com `select: { id, apelido }`. | |
| Amizades | Remover amizade alheia | Trocar `usuarioId` | 403/404 | passou | Testes automatizados em `amizades.service.spec.ts` cobrem aceitar/cancelar solicitacao alheia e remover relacao nao aceita. | |
| WebSocket sessoes | Join sem acesso | Emitir `sessao:join` em campanha alheia | `ACESSO_NEGADO` | passou | `sessao.gateway.spec.ts` cobre rejeicao de `validarAcessoSessao` e emissao de `ACESSO_NEGADO`. | |
| WebSocket presenca | Presenca de nao amigo | Usuario nao amigo conectado | Nao aparece online | passou | `amizades.service.spec.ts` cobre usuario online que nao e amigo aceito sem exposicao na lista. | |
| Markdown | XSS em compendio/guia | Renderizar script/link javascript | Nao executa | passou | Busca mostrou `ReactMarkdown` sem `rehypeRaw`; unico `dangerouslySetInnerHTML` e o script controlado de tema em `layout.tsx`. | |
| Logs | Segredos em logs | Forcar erro com senha/token | Logs redigem segredo | passou | `LoggingInterceptor` redige `senha`, `senhaAtual`, `novaSenha`, `password`, `token`, `access_token` e `authorization`; logs de socket nao imprimem o token. | |

## Comandos de validacao

Frontend:

```powershell
cd assistenterpg-front
npm run lint
npm run test
npm run build
```

Backend:

```powershell
cd assistenterpg-back
npm run lint
npm run test
npm run build
```

Checks adicionais:

```powershell
git diff --check
rg -n "dev-secret|SWAGGER_ENABLED|origin: true|localStorage|sessionStorage|dangerouslySetInnerHTML|ID do usuario|ID do usu" assistenterpg-front/src assistenterpg-back/src -g "*.ts" -g "*.tsx"
```

Observacao: `assistenterpg-back` tem `npm run lint` configurado com `--fix`; se o objetivo for somente auditar sem alterar arquivos, usar `npx eslint "{src,apps,libs,test}/**/*.ts"` em vez do script.

## Criterios de aceite para liberar

- Nenhuma tela autenticada manda o usuario para `/` ao clicar em voltar.
- Configuracoes nao exibe ID do usuario.
- Swagger desabilitado por padrao em producao.
- CORS HTTP e WebSocket restritos a origens configuradas em producao.
- Rotas privadas exigem JWT.
- Rotas admin exigem ADMIN.
- Troca manual de IDs nao permite ler ou alterar dados de outro usuario.
- Payloads com campos extras sao rejeitados.
- Payloads de injection nao causam execucao, vazamento ou alteracao indevida.
- Erros em producao nao retornam stack trace.
- Logs nao contem senha, token ou Authorization.
- Front passa `lint`, `test` e `build`.
- Back passa `lint`, `test` e `build`.

## Registro de execucao

Atualizar esta tabela ao final da implementacao.

| Etapa | Status | Evidencia | Observacoes |
| --- | --- | --- | --- |
| Guia criado | passou | `documentacao-unica/GUIA-SEGURANCA-CODEX.md` | Guia organizado em partes e atualizado com evidencias da Parte 1. |
| Voltar em `/configuracoes` corrigido | corrigido | `assistenterpg-front/src/app/configuracoes/page.tsx` | Destino alterado para `/home`. |
| ID do usuario removido da UI | corrigido | `assistenterpg-front/src/app/configuracoes/page.tsx`; busca por textos de ID de usuario sem achados relevantes | `usuario.id` segue disponivel apenas para uso interno. |
| Auditoria de links `Voltar` | passou | Busca por `href="/"`, `router.push('/')` e `router.replace('/')` sem achados | Escopo: rotas/componentes autenticados do front. |
| Swagger em producao revisado | corrigido | `assistenterpg-back/src/common/config/security.config.ts`; `assistenterpg-back/src/main.ts` | Swagger so habilita com `SWAGGER_ENABLED=true`. |
| CORS HTTP/WebSocket revisado | corrigido | `security.config.ts`, `main.ts`, `sessao.gateway.ts`, `presenca.gateway.ts`; busca por `origin: true` sem achados | `CORS_ORIGINS` passa a ser obrigatorio em producao. |
| Rate limit de auth | corrigido | `@nestjs/throttler`; `assistenterpg-back/src/auth/auth.controller.ts`; `auth.controller.spec.ts` | Aplicado em login, register, forgot-password, reset-password e resend-verification-email. |
| Politica minima de senha | corrigido | `AUTH_PASSWORD_MIN_LENGTH = 8`; DTOs de cadastro, reset e alteracao de senha; `auth-password-policy.dto.spec.ts` | Senhas antigas nao sao invalidadas; regra atua apenas em novos fluxos de troca/cadastro/reset. |
| JWT secret em producao | corrigido | `resolveJwtSecret`; `auth.module.ts`, `jwt.strategy.ts`, `sessao.module.ts`, `amizades.module.ts`; busca por fallback antigo sem achados | `dev-secret` permanece somente como fallback fora de producao. |
| Enumeracao e reset token | passou | `auth.service.spec.ts`; `auth-token.service.spec.ts` | Forgot/resend nao diferenciam existencia publica; token consumido nao pode ser reutilizado. |
| DTOs e validation revisados | corrigido | DTOs de auth endurecidos; `ImportarHomebrewJsonDto` recebeu limites; busca por `$queryRaw`/`queryRawUnsafe` sem achados em `src` | Ainda existe trabalho futuro possivel de limites finos em todos os DTOs grandes, mas sem bypass confirmado nesta rodada. |
| Guards e permissoes revisados | corrigido | Novos testes em `anotacoes.service.spec.ts`, `inventario.service.spec.ts`, `npcs-ameacas.service.spec.ts`, `homebrews.service.spec.ts`, `amizades.service.spec.ts`; cobertura existente em campanhas/sessao/compendio | Foi corrigido bug em `homebrews.service.ts` que reembalava 403 como erro de dados invalidos. |
| Pentest manual executado | passou | Matriz de pentest acima preenchida; buscas de raw SQL, markdown raw, Swagger/CORS e links de retorno executadas | Parte manual foi por inspecao estatica e testes unitarios focados, sem browser e2e autenticado. |
| Headers de seguranca | corrigido | `helmet` no Nest; `assistenterpg-front/next.config.ts` | Inclui `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy`. |
| Front lint/test/build | passou | `npm run lint`; `npm run test` 18 arquivos/107 testes; `npm run build` com Next 16.2.6 | Executado em 2026-05-22. |
| Back lint/test/build | passou | `npx eslint "{src,apps,libs,test}/**/*.ts"`; `npm run test` 74 suites/318 testes; `npm run build` | `npm run lint` usa `--fix`; auditoria sem alteracao usou ESLint direto. |
| `git diff --check` | passou | `git diff --check` | Apenas warnings normais de CRLF no Windows. |
| Parte 2 - auth focado | passou | `npx jest src/auth --runInBand`; `npx eslint "{src,apps,libs,test}/**/*.ts"`; `npm run test` 70 suites/295 testes; `npm run build` | `npx tsc --noEmit` bruto nao e criterio do projeto: falha por spec existente importar arquivo de `prisma/seeds` fora de `rootDir`. |
| Parte 3 - IDOR focado | passou | `npx jest src/anotacoes src/inventario/inventario.service.spec.ts src/npcs-ameacas src/homebrews/homebrews.service.spec.ts src/amizades --runInBand`; backend lint/test/build | Cobertura adicionada para troca manual de IDs em anotacoes, inventario, NPCs/ameacas, homebrews e amizades. |
| Parte 4 - pentest e aceite | passou | `npx jest src/campanha/campanha.access.service.spec.ts src/sessao/sessao.gateway.spec.ts src/homebrews/dto/importar-homebrew-json.dto.spec.ts src/amizades --runInBand`; lint/test/build completos; audits front/back sem vulnerabilidades | Inclui correcao do proxy/cookie auxiliar, dependencia segura e matriz preenchida. |
| Parte 5 - cookies HttpOnly + refresh | corrigido | `npx prisma validate`; `npx prisma migrate deploy`; back `npm run lint`, `npm run test -- --runInBand`, `npm run build`; front `npm run lint`, `npm run test`, `npm run build`; audits front/back sem vulnerabilidades; `git diff --check` | Migration `20260522102000_add_sessoes_autenticacao` aplicada localmente; refresh token opaco com hash, rotacao e deteccao de reuse; proxy do front virou apenas UX. |
| Audit de dependencias front/back | corrigido | `npm audit --omit=dev --audit-level=moderate` no front e no back retornou `found 0 vulnerabilities` | Front usa override de `postcss` 8.5.15 porque `npm audit fix --force` sugeria downgrade indevido para Next 9. |
