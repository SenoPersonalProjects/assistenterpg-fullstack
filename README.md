# AssistenteRPG

Monorepo com backend NestJS/Prisma/MySQL e frontend Next.js/React.

## Estrutura

- `assistenterpg-back/`: API, Prisma, seeds e regras de negócio.
- `assistenterpg-front/`: interface web.
- `documentacao-unica/`: documentação técnica e scripts operacionais.

## Pré-requisitos

- Git.
- Node.js 20+.
- npm.
- Docker Desktop, se for usar o MySQL local via compose.
- MySQL 8 local/remoto, ou TiDB compatível com MySQL.

## Setup local rápido

### 1. Instalar dependências

```powershell
cd assistenterpg-back
npm ci

cd ..\assistenterpg-front
npm ci
```

### 2. Criar arquivos de ambiente

```powershell
cd ..\assistenterpg-back
Copy-Item .env.example .env

cd ..\assistenterpg-front
Copy-Item .env.local.example .env.local
```

Valores locais principais:

- backend `DATABASE_URL`: por padrão aponta para `mysql://assistenterpg:assistenterpg_dev@localhost:3306/assistenterpg`.
- backend `JWT_SECRET`: troque por qualquer string local forte com 32+ caracteres.
- backend `CORS_ORIGINS`: mantenha `http://localhost:3001` para o front local.
- frontend `NEXT_PUBLIC_API_URL`: mantenha `http://localhost:3000` no `.env.local` para a API local.

Se `assistenterpg-front/.env` estiver apontando para Render/producao, mantenha-o fora do Git e crie `assistenterpg-front/.env.local` a partir de `.env.local.example`. No Next.js, `.env.local` sobrepoe `.env` durante o desenvolvimento local.

Não copie valores reais de produção para arquivos versionados.

### 3. Subir banco local

O compose do backend sobe um MySQL 8 local.

```powershell
cd ..\assistenterpg-back
docker compose up -d mysql
```

Se usar outro MySQL/TiDB, ajuste `DATABASE_URL` no `.env`.

### 4. Preparar Prisma e banco

```powershell
cd assistenterpg-back
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Seeds específicos úteis:

```powershell
npm run seed:sobrevivendo
npm run seed:compendio
npm run seed:modificações-aplicaveis
```

### 5. Rodar a API

```powershell
cd assistenterpg-back
npm run start:dev
```

API local:

- `http://localhost:3000`
- Swagger local, se `SWAGGER_ENABLED=true`: `http://localhost:3000/docs`

### 6. Rodar o front

Em outro terminal:

```powershell
cd assistenterpg-front
npm run dev
```

Front local:

- `http://localhost:3001`

## Comandos de validação

Backend:

```powershell
cd assistenterpg-back
npm run test
npm run build
```

Frontend:

```powershell
cd assistenterpg-front
npm run lint
npm run test
npm run build
```

## Autenticação local

O app usa cookies HttpOnly para access/refresh token, CSRF e `withCredentials`.

Para local:

- `AUTH_COOKIE_SAME_SITE=lax`
- `AUTH_COOKIE_SECURE=false`
- `FRONTEND_URL=http://localhost:3001`
- `CORS_ORIGINS=http://localhost:3001,http://127.0.0.1:3001`

Para produção cross-site, como Vercel + Render:

- `AUTH_COOKIE_SAME_SITE=none`
- `AUTH_COOKIE_SECURE=true`
- `CORS_ORIGINS` com a origem exata do front.
- `FRONTEND_URL` com a URL pública do front.
- Vercel deve configurar `NEXT_PUBLIC_API_URL` para a URL pública do Render.
- Render deve configurar `NODE_ENV=production`, `TRUST_PROXY_HOPS=1` e `CORS_ORIGINS` explicitamente. Não use `*` com `credentials: true`.

## Google OAuth, Calendar e agendamento

A integração Google é opcional e vem desabilitada por padrão.

Para habilitar localmente:

- Crie um OAuth Client Web no Google Cloud.
- Configure o redirect autorizado como `http://localhost:3000/auth/google/callback`.
- No `assistenterpg-back/.env`, defina:
  - `GOOGLE_OAUTH_ENABLED=true`
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GOOGLE_OAUTH_CALLBACK_URL=http://localhost:3000/auth/google/callback`
  - `GOOGLE_TOKEN_ENCRYPTION_KEY` com segredo local forte de 32+ caracteres

Para Google Calendar, o app usa o escopo mínimo `https://www.googleapis.com/auth/calendar.events`.
O evento é criado no calendário da conta Google vinculada pelo mestre, e membros da campanha com email verificado entram como convidados.

Em produção:

- Use callback HTTPS público do backend.
- Configure OAuth consent screen no Google Cloud.
- Não registre tokens, authorization code ou refresh token.
- Mantenha `GOOGLE_TOKEN_ENCRYPTION_KEY` fora do Git e estável entre deploys.

O scheduler local de agendamentos usa:

- `SESSION_SCHEDULER_ENABLED=true`
- `SESSION_SCHEDULER_INTERVAL_MS=60000`
- `SESSION_SCHEDULER_BATCH_SIZE=20`
- `SESSION_LAZY_ACTIVATION_ENABLED=true`

Como fallback, a API também processa agendamentos vencidos ao listar sessões/agendamentos da campanha.

## Atualizar TiDB sem recriar banco

O fluxo padrão para atualizar dados/migrations no TiDB é não destrutivo:

```powershell
powershell -ExecutionPolicy Bypass -File documentacao-unica\update-tidb.ps1 `
  -OpsFile documentacao-unica\PRIVATE-OPS.md `
  -RemoteDatabase test `
  -BackDir assistenterpg-back `
  -Migrate `
  -Seeds compendio `
  -BackupBefore `
  -ConfirmationText "ATUALIZAR test"
```

O arquivo `documentacao-unica/PRIVATE-OPS.md` é privado e fica fora do Git.

Use `documentacao-unica/sync-tidb.ps1` somente quando a intenção for recriar o banco remoto inteiro a partir do dump local.

## O que não deve ir para o Git

- `.env` e qualquer arquivo com segredo real.
- `documentacao-unica/PRIVATE-OPS.md`.
- `dist/`, `dist-test/`, `.next/`, `coverage/`, `node_modules/`.
- evidências geradas em `assistenterpg-front/evidence/`.
- dumps, backups, certificados privados e chaves.

Consulte `documentacao-unica/GUIA-REPOSITORIO-GIT.md` para o checklist completo.

## Troubleshooting

### Prisma Client desatualizado

```powershell
cd assistenterpg-back
npx prisma generate
```

### Porta ocupada

- API usa `PORT=3000`.
- Front usa porta `3001`.
- Ajuste `PORT` no backend ou finalize o processo que ocupa a porta.

### Erro de CORS/cookie

Confirme:

- `NEXT_PUBLIC_API_URL` no front aponta para a API correta.
- `CORS_ORIGINS` no back inclui exatamente a origem do front.
- Em local, cookies usam `SameSite=Lax` e `Secure=false`.
- Em produção cross-site, cookies usam `SameSite=None` e `Secure=true`.

### Swagger não abre

Swagger só é habilitado quando `SWAGGER_ENABLED=true`.
