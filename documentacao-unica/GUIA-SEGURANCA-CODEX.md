# Guia de Segurança Pr?-Release - AssistenteRPG

Este arquivo e o roteiro operacional para o agente Codex revisar, testar e corrigir a segurança do AssistenteRPG antes da liberação do app.

O objetivo é corrigir riscos reais primeiro. As Partes 0 a 4 cobriram hardening pr?-release; a etapa seguinte migrou a sessão para cookies HttpOnly cross-site com refresh token e CSRF.

## Plano em partes

Regra de execução: não avançar para a próxima parte enquanto a parte atual não tiver validação mínima e evidência registrada neste arquivo.

| Parte | Objetivo | Status | Evidência |
| --- | --- | --- | --- |
| Parte 0 | Organizar este guia em etapas executáveis. | corrigido | Seção `Plano em partes` adicionada. |
| Parte 1 | Corrigir achados confirmados e configuração segura de baixo risco. | corrigido | `/configuracoes`, Swagger, CORS HTTP/WebSocket, Helmet e headers do Next ajustados; validações front/back passaram em 2026-05-22. |
| Parte 2 | Endurecer auth e abuso de endpoints. | corrigido | Rate limit em auth, senha mínima 8, JWT secret forte em produção e testes de enumeração/token reutilizado adicionados; backend passou em 2026-05-22. |
| Parte 3 | Revisar controle de acesso e IDOR por módulo. | corrigido | Testes focados adicionados para anotações, inventário, NPCs/ameaças, homebrews e amizades; backend passou em 2026-05-22. |
| Parte 4 | Executar pentest e aceite final. | corrigido | Matriz preenchida, audits de dependências sem vulnerabilidades e validações completas em 2026-05-22. |
| Parte 5 | Migrar auth para cookies HttpOnly, refresh rotativo e CSRF. | corrigido | Modelo `SessãoAutenticação`, cookies `assistenterpg_access/refresh/csrf`, CSRF guard, refresh rotativo, front sem Bearer em storage e validações completas em 2026-05-22. |

Validação mínima por parte:

- Parte 1: front `npm run lint`, `npm run test`, `npm run build`; back `npm run test`, `npm run build`; buscas de segurança sem achados dos itens corrigidos.
- Parte 2: testes de auth/rate limit/senha e build do backend.
- Parte 3: testes de permissão por módulo e build do backend.
- Parte 4: validação completa front/back, `git diff --check` e matriz de pentest preenchida.

## Estado inicial conhecido

Achados confirmados por inspeccao do repositorio:

- `/configuracoes` tem um botão `Voltar` apontando para `/`, o que envia usuário autenticado para a landing.
- `/configuracoes` exibe `ID do usuário` na UI. O `id` deve continuar existindo como dado interno, mas não deve ser exibido ao usuário.
- Swagger está habilitado por padrão quando `SWAGGER_ENABLED` não é `false`.
- O front usa Bearer token em `localStorage` ou `sessionStorage`.
- `main.ts` usa `CORS_ORIGINS || 'http://localhost:3001'`.
- Gateways Socket.IO usam `origin: true` quando `CORS_ORIGINS` não existe.
- JWT exige `JWT_SECRET` em produção, mas usa `dev-secret` fora de produção.
- `ValidationPipe` global já esta configurado com `transform`, `whitelist` e `forbidNonWhitelisted`.
- Audits de dependências foram corrigidos na Parte 4 com updates seguros, `npm audit fix` sem force e override de `postcss` no front para evitar downgrade indevido do Next.

## Ordem obrigatória de trabalho

1. Criar branch ou confirmar worktree limpa:

```powershell
git status --short
```

2. Corrigir navegação e exposição de dados de usuário.
3. Fazer auditoria de configuração, autenticação e autorização.
4. Rodar pentest manual e automatizado conforme matriz abaixo.
5. Corrigir falhas encontradas.
6. Rodar validações finais.
7. Atualizar a tabela de resultados no fim deste arquivo.

## Correções imediatas obrigatórias

### Frontend

- Em `/configuracoes`, trocar o destino do botão `Voltar` de `/` para `/home`.
- Auditar todos os links/botões com texto `Voltar`, `Voltar para`, `Cancelar` ou similares em rotas autenticadas.
- Regra: rotas autenticadas não devem usar `/` como destino genérico de retorno.
- Remover o campo `ID do usuário` da tela de configurações.
- Manter `usuário.id` no contexto/tipos apenas para uso interno de API, permissão e logs client-side necessários.

Comandos de busca sugeridos:

```powershell
rg -n "Voltar|Cancelar|href=\"/\"|href='/'|router\.push\('/'\)|router\.replace\('/'\)" assistenterpg-front/src/app assistenterpg-front/src/components -g "*.tsx" -g "*.ts"
rg -n "ID do usuário|ID do usu|usuário\?\.id|usuário.id|user.id" assistenterpg-front/src/app/configuracoes assistenterpg-front/src/components/configuracoes -g "*.tsx" -g "*.ts"
```

### Backend

- Confirmar que `SWAGGER_ENABLED` fica desabilitado por padrão em produção.
- Exigir `CORS_ORIGINS` explícito em produção para HTTP e WebSocket.
- Remover fallback permissivo de WebSocket em produção.
- Adicionar ou validar security headers com `helmet` no Nest.
- Adicionar headers de segurança no Next quando aplicável.

## Checklist backend

### Validação de entrada

- Confirmar `ValidationPipe` global com:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
- Revisar DTOs sem limite de tamanho em strings. Adicionar `MaxLength` onde houver entrada livre.
- Revisar DTOs de senha para política mínima coerente. Hoje `MinLength(6)` existe, mas deve ser avaliado para produção.
- Revisar arrays e objetos aninhados para garantir `IsArray`, validação por item e limites.
- Revisar imports JSON/homebrew/NPC/técnicas para impedir payloads gigantes ou campos inesperados.

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
; DROP TABLE Usuário; --
{"$ne": null}
<script>alert(1)</script>
![x](javascript:alert(1))
[x](javascript:alert(1))
```

Resultado esperado:

- Prisma deve usar queries parametrizadas.
- DTO deve rejeitar tipos errados e campos extras.
- Markdown renderizado não deve executar HTML/script.
- Erros não devem vazar stack trace em produção.

### Controle de acesso

Auditar todos os controllers:

- Rotas privadas devem ter `JwtAuthGuard` ou `AuthGuard('jwt')`.
- Rotas administrativas devem ter `JwtAuthGuard` + `AdminGuard`, ou controller protegido por JWT e metodo protegido por `AdminGuard`.
- Services devem validar dono, membro ou papel antes de retornar/alterar dados.
- Troca manual de IDs na URL não deve dar acesso a dados de outro usuário.

Modulos prioritarios:

- `usuário`
- `campanha`
- `personagem-base`
- `homebrews`
- `npcs-ameacas`
- `anotações`
- `amizades`
- `sessão`
- `compendio` admin
- `suplementos` admin

Busca sugerida:

```powershell
rg -n "@Controller|@UseGuards|@Get|@Post|@Patch|@Put|@Delete|AdminGuard|JwtAuthGuard|AuthGuard\\('jwt'\\)" assistenterpg-back/src -g "*.ts"
rg -n "usuarioId|donoId|membro|papel|MESTRE|ADMIN|isAdmin|ehMestre|garantirAcesso" assistenterpg-back/src -g "*.ts"
```

## Checklist auth e sessão

### Modelo atual após Parte 5

O modelo atual usa cookies emitidos pela API:

- `assistenterpg_access`: JWT curto, HttpOnly, com `sid` da sessão.
- `assistenterpg_refresh`: segredo opaco longo, HttpOnly, salvo no banco apenas como hash e rotacionado em `/auth/refresh`.
- `assistenterpg_csrf`: token CSRF não-HttpOnly no domínio da API, também retornado por `/auth/csrf`.
- `assistenterpg_auth_hint`: cookie não sensível do front, usado apenas pelo `proxy.ts` para UX de redirect.

Em produção cross-site Vercel + Render, configurar cookies como `SameSite=None; Secure`, usar `withCredentials: true` no front e exigir `CORS_ORIGINS` exato. O backend continua sendo a fronteira real de segurança.

Bearer token fica somente como fallback temporário fora de produção ou com `AUTH_BEARER_FALLBACK_ENABLED=true`; em produção, sem essa env, o fallback fica desligado.

### Testes obrigatórios

- Login com credenciais válidas.
- Login com senha errada sem revelar se o email existe.
- Registro com email já existente sem vazar dados sensíveis.
- Recuperação de senha sem enumerar email.
- Reset de senha com token inválido, expirado e reutilizado.
- Verificação de email com token inválido, expirado e reutilizado.
- Logout revogando sessão, limpando cookies e bloqueando chamadas futuras.
- Access expirado com refresh validação renovando uma vez e repetindo a chamada.
- Refresh antigo reutilizado revogando sessões ativas do usuário.
- Mutações sem `X-CSRF-Token` sendo bloqueadas quando houver sessão por cookie.
- Acesso direto a rota privada sem cookie auxiliar redirecionando para `/auth/login`.
- Usuário logado acessando `/` ou `/auth/*` redirecionando corretamente.

### Hardening recomendado nesta fase

- Exigir `JWT_SECRET` forte em qualquer ambiente de deploy, não apenas `NODE_ENV=production`.
- Revisar expiração atual de JWT de 7 dias.
- Adicionar rate limit para:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
  - `/auth/resend-verification-email`
  - `/auth/reset-password`
- Não logar tokens, senhas, Authorization ou payloads sensíveis.

### Fase futura

Planejar migração para domínio próprio:

- front em `app.seudomínio.com`;
- API em `api.seudomínio.com`;
- cookies com `SameSite=Lax` quando o fluxo permitir;
- avaliação de CSP mais restritiva depois de estabilizar assets externos.

## Checklist configuração e transporte

### Variaveis obrigatórias em produção

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
- Sem fallback `origin: true` em produção.
- `credentials: true` só deve existir com lista de origens explícita.

### HTTPS/TLS

Validar no provedor:

- HTTP redireciona para HTTPS.
- TLS 1.2+ ativo.
- Certificado validação.
- HSTS ativo se o domínio já estiver estabilizado.
- API e front usam URLs HTTPS em produção.

### Headers

Recomendar Helmet no Nest:

- `X-Content-Type-Options`
- `Referrer-Policy`
- `X-Frame-Options` ou CSP `frame-ancestors`
- CSP básica compatível com Next e assets atuais
- desabilitar `X-Powered-By`

No Next, revisar `next.config.ts` para headers de segurança quando aplicável.

## Pentest manual e automatizado

Preencher uma linha por teste real executado.

| Area | Cenario | Como testar | Resultado esperado | Status | Evidência | Correção |
| --- | --- | --- | --- | --- | --- | --- |
| Auth | Login brute force | Repetir tentativas inválidas no mesmo email/IP | Bloqueio ou rate limit | corrigido | `@nestjs/throttler` aplicado em `POST /auth/login`; metadata test em `auth.controller.spec.ts`. | |
| Auth | Enumeração em forgot password | Testar email existente e inexistente | Mesma resposta pública | passou | Teste automatizado em `auth.service.spec.ts` compara respostas de email existente/inexistente. | |
| Auth | Reset token reutilizado | Usar mesmo token duas vezes | Segunda tentativa falha | passou | Teste automatizado em `auth-token.service.spec.ts` cobre `updateMany.count = 0`. | |
| Auth | Refresh token rotativo | Usar refresh, depois reutilizar o antigo | Antigo falha e sessões ativas são revogadas | corrigido | `auth-session.service.spec.ts` cobre rotação para nova sessão e reuse de refresh revogado. | |
| Auth | CSRF em mutações | Enviar mutação com cookies sem `X-CSRF-Token` | 403 | corrigido | `CsrfGuard` global exige CSRF para metodos mutantes quando ha sessão por cookie; `auth-session.service.spec.ts` válida hash CSRF. | |
| Auth | Token em storage | Inspecionar `localStorage/sessionStorage` | Nenhum JWT novo salvo no browser | corrigido | Front removeu `access_token` do contrato, apagou Bearer no Axios/Sockets e limpa `assistenterpg_token` legado no bootstrap. | |
| Rotas privadas | Sem sessão | Abrir `/home`, `/campanhas`, `/configuracoes` sem marcador de sessão | Redireciona para login | corrigido | `proxy.ts` usa apenas `assistenterpg_auth_hint` para UX; backend nega dados sem cookies HttpOnly válidos. | |
| Configurações | ID na UI | Abrir `/configuracoes` | Não exibe ID do usuário | corrigido | Campo removido de `assistenterpg-front/src/app/configuracoes/page.tsx`; busca por `ID do usuário` sem achados. | |
| Navegação | Voltar autenticado | Clicar voltar em telas privadas | Não vai para landing | passou | `/configuracoes` volta para `/home`; busca por `href="/"`, `router.push('/')` e `router.replace('/')` em rotas/componentes autenticados sem achados. | |
| Campanhas | IDOR detalhe | Usuário A tenta abrir campanha de usuário B | 403/404 | passou | `campanha.access.service.spec.ts` cobre usuário que não é dono nem membro; services usam `garantirAcesso`. | |
| Campanhas | IDOR personagem | Trocar `personagemCampanhaId` na URL/API | 403/404 | passou | `campanha.access.service.spec.ts` cobre personagem de outra campanha e edição por membro sem permissão. | |
| Campanhas | Papel mestre | Jogador tenta encerrar sessão/alterar cena | 403 | passou | Inspeção de `SessãoService`: operações mutantes sensíveis chamam `assertMestre`; `sessão.service.spec.ts` cobre fluxo de mestre e testes existentes cobrem regras de turno. | |
| Anotações | Anotação de outro usuário | Trocar `id` em update/delete | 403/404 | passou | Testes automatizados em `anotações.service.spec.ts` cobrem listagem por `usuarioId`, edição e remoção cross-user. | |
| Inventário | Item de outro personagem | Trocar `itemId` em PATCH/DELETE | 403/404 | passou | Testes automatizados em `inventario.service.spec.ts` cobrem update/delete/modificação com `validarPropriedade` falhando. | |
| NPCs/Ameaças | NPC de outro usuário | Trocar `id` em detalhe/update/delete | 403/404 | passou | Testes automatizados em `npcs-ameacas.service.spec.ts` validam `findFirst({ id, donoId })` e bloqueio de update/delete. | |
| Homebrews | Editar homebrew de outro usuário | Trocar `id` no endpoint | 403/404 | corrigido | Testes automatizados em `homebrews.service.spec.ts`; `HomebrewSemPermissaoException` deixou de ser reembalada como `HomebrewDadosInvalidosException`. | |
| Homebrews | Import JSON malicioso | Enviar payload gigante/campos extras/script | corrigido | `ImportarHomebrewJsonDto` passou a limitar metadados e `items` a 100 entradas; `importar-homebrew-json.dto.spec.ts` cobre payload excessivo. | |
| Compendio admin | Usuário comum edita artigo | Chamar PUT/POST admin sem ADMIN | 403 | passou | `compendio.controller.spec.ts` válida guards `JwtAuthGuard + AdminGuard` nas rotas administrativas. | |
| Suplementos admin | Usuário comum altera suplemento | Chamar rotas admin sem ADMIN | 403 | passou | Inspeção de `suplementos.controller.ts`: rotas de escrita usam `JwtAuthGuard + AdminGuard`. | |
| Amizades | Resolver usuário | Buscar por apelido/email | Não expoe email indevido | passou | `amizades.service.spec.ts` válida retorno sem email e query com `select: { id, apelido }`. | |
| Amizades | Remover amizade alheia | Trocar `usuarioId` | 403/404 | passou | Testes automatizados em `amizades.service.spec.ts` cobrem aceitar/cancelar solicitação alheia e remover relação não aceita. | |
| WebSocket sessões | Join sem acesso | Emitir `sessão:join` em campanha alheia | `ACESSO_NEGADO` | passou | `sessão.gateway.spec.ts` cobre rejeição de `validarAcessoSessão` e emissão de `ACESSO_NEGADO`. | |
| WebSocket presenca | Presenca de não amigo | Usuário não amigo conectado | Não aparece online | passou | `amizades.service.spec.ts` cobre usuário online que não é amigo aceito sem exposição na lista. | |
| Markdown | XSS em compêndio/guia | Renderizar script/link javascript | Não executa | passou | Busca mostrou `ReactMarkdown` sem `rehypeRaw`; único `dangerouslySetInnerHTML` é o script controlado de tema em `layout.tsx`. | |
| Logs | Segredos em logs | Forcar erro com senha/token | Logs redigem segredo | passou | `LoggingInterceptor` redige `senha`, `senhaAtual`, `novaSenha`, `password`, `token`, `access_token` e `authorization`; logs de socket não imprimem o token. | |

## Comandos de validação

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
rg -n "dev-secret|SWAGGER_ENABLED|origin: true|localStorage|sessionStorage|dangerouslySetInnerHTML|ID do usuário|ID do usu" assistenterpg-front/src assistenterpg-back/src -g "*.ts" -g "*.tsx"
```

Observação: `assistenterpg-back` tem `npm run lint` configurado com `--fix`; se o objetivo for somente auditar sem alterar arquivos, usar `npx eslint "{src,apps,libs,test}/**/*.ts"` em vez do script.

## Critérios de aceite para liberar

- Nenhuma tela autenticada manda o usuário para `/` ao clicar em voltar.
- Configurações não exibe ID do usuário.
- Swagger desabilitado por padrão em produção.
- CORS HTTP e WebSocket restritos a origens configuradas em produção.
- Rotas privadas exigem JWT.
- Rotas admin exigem ADMIN.
- Troca manual de IDs não permite ler ou alterar dados de outro usuário.
- Payloads com campos extras são rejeitados.
- Payloads de injection não causam execução, vazamento ou alteração indevida.
- Erros em produção não retornam stack trace.
- Logs não contem senha, token ou Authorization.
- Front passa `lint`, `test` e `build`.
- Back passa `lint`, `test` e `build`.

## Registro de execução

Atualizar esta tabela ao final da implementação.

| Etapa | Status | Evidência | Observações |
| --- | --- | --- | --- |
| Guia criado | passou | `documentacao-unica/GUIA-SEGURANCA-CODEX.md` | Guia organizado em partes e atualizado com evidências da Parte 1. |
| Voltar em `/configuracoes` corrigido | corrigido | `assistenterpg-front/src/app/configuracoes/page.tsx` | Destino alterado para `/home`. |
| ID do usuário removido da UI | corrigido | `assistenterpg-front/src/app/configuracoes/page.tsx`; busca por textos de ID de usuário sem achados relevantes | `usuário.id` segue disponível apenas para uso interno. |
| Auditoria de links `Voltar` | passou | Busca por `href="/"`, `router.push('/')` e `router.replace('/')` sem achados | Escopo: rotas/componentes autenticados do front. |
| Swagger em produção revisado | corrigido | `assistenterpg-back/src/common/config/security.config.ts`; `assistenterpg-back/src/main.ts` | Swagger só habilita com `SWAGGER_ENABLED=true`. |
| CORS HTTP/WebSocket revisado | corrigido | `security.config.ts`, `main.ts`, `sessão.gateway.ts`, `presenca.gateway.ts`; busca por `origin: true` sem achados | `CORS_ORIGINS` passa a ser obrigatório em produção. |
| Rate limit de auth | corrigido | `@nestjs/throttler`; `assistenterpg-back/src/auth/auth.controller.ts`; `auth.controller.spec.ts` | Aplicado em login, register, forgot-password, reset-password e resend-verification-email. |
| Política mínima de senha | corrigido | `AUTH_PASSWORD_MIN_LENGTH = 8`; DTOs de cadastro, reset e alteração de senha; `auth-password-policy.dto.spec.ts` | Senhas antigas não são invalidadas; regra atua apenas em novos fluxos de troca/cadastro/reset. |
| JWT secret em produção | corrigido | `resolveJwtSecret`; `auth.module.ts`, `jwt.strategy.ts`, `sessão.module.ts`, `amizades.module.ts`; busca por fallback antigo sem achados | `dev-secret` permanece somente como fallback fora de produção. |
| Enumeração e reset token | passou | `auth.service.spec.ts`; `auth-token.service.spec.ts` | Forgot/resend não diferenciam existência pública; token consumido não pode ser reutilizado. |
| DTOs e validation revisados | corrigido | DTOs de auth endurecidos; `ImportarHomebrewJsonDto` recebeu limites; busca por `$queryRaw`/`queryRawUnsafe` sem achados em `src` | Ainda existe trabalho futuro possível de limites finos em todos os DTOs grandes, mas sem bypass confirmado nesta rodada. |
| Guards e permissões revisados | corrigido | Novos testes em `anotações.service.spec.ts`, `inventario.service.spec.ts`, `npcs-ameacas.service.spec.ts`, `homebrews.service.spec.ts`, `amizades.service.spec.ts`; cobertura existente em campanhas/sessão/compendio | Foi corrigido bug em `homebrews.service.ts` que reembalava 403 como erro de dados inválidos. |
| Pentest manual executado | passou | Matriz de pentest acima preenchida; buscas de raw SQL, markdown raw, Swagger/CORS e links de retorno executadas | Parte manual foi por inspeção estatica e testes unitarios focados, sem browser e2e autenticado. |
| Headers de segurança | corrigido | `helmet` no Nest; `assistenterpg-front/next.config.ts` | Inclui `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy`. |
| Front lint/test/build | passou | `npm run lint`; `npm run test` 18 arquivos/107 testes; `npm run build` com Next 16.2.6 | Executado em 2026-05-22. |
| Back lint/test/build | passou | `npx eslint "{src,apps,libs,test}/**/*.ts"`; `npm run test` 74 suites/318 testes; `npm run build` | `npm run lint` usa `--fix`; auditoria sem alteração usou ESLint direto. |
| `git diff --check` | passou | `git diff --check` | Apenas warnings normais de CRLF no Windows. |
| Parte 2 - auth focado | passou | `npx jest src/auth --runInBand`; `npx eslint "{src,apps,libs,test}/**/*.ts"`; `npm run test` 70 suites/295 testes; `npm run build` | `npx tsc --noEmit` bruto não é critério do projeto: falha por spec existente importar arquivo de `prisma/seeds` fora de `rootDir`. |
| Parte 3 - IDOR focado | passou | `npx jest src/anotações src/inventario/inventario.service.spec.ts src/npcs-ameacas src/homebrews/homebrews.service.spec.ts src/amizades --runInBand`; backend lint/test/build | Cobertura adicionada para troca manual de IDs em anotações, inventário, NPCs/ameaças, homebrews e amizades. |
| Parte 4 - pentest e aceite | passou | `npx jest src/campanha/campanha.access.service.spec.ts src/sessao/sessao.gateway.spec.ts src/homebrews/dto/importar-homebrew-json.dto.spec.ts src/amizades --runInBand`; lint/test/build completos; audits front/back sem vulnerabilidades | Inclui correção do proxy/cookie auxiliar, dependência segura e matriz preenchida. |
| Parte 5 - cookies HttpOnly + refresh | corrigido | `npx prisma validate`; `npx prisma migrate deploy`; back `npm run lint`, `npm run test -- --runInBand`, `npm run build`; front `npm run lint`, `npm run test`, `npm run build`; audits front/back sem vulnerabilidades; `git diff --check` | Migration `20260522102000_add_sessoes_autenticação` aplicada localmente; refresh token opaco com hash, rotação e detecção de reuse; proxy do front virou apenas UX. |
| Audit de dependências front/back | corrigido | `npm audit --omit=dev --audit-level=moderate` no front e no back retornou `found 0 vulnerabilities` | Front usa override de `postcss` 8.5.15 porque `npm audit fix --force` sugeria downgrade indevido para Next 9. |
