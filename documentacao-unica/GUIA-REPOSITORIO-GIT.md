# Guia de Repositório e Git

Este guia define o que deve ou não ser versionado no AssistenteRPG.

## Deve ir para o Git

- Codigo fonte do backend e frontend.
- `package.json` e `package-lock.json` dos dois apps.
- `prisma/schema.prisma`.
- `prisma/migrations/**/migration.sql`.
- seeds versionados e assets públicos dos seeds.
- documentação pública em `documentacao-unica/`.
- scripts operacionais sem segredo, como `update-tidb.ps1` e `sync-tidb.ps1`.
- imagens e assets públicos usados pela aplicação.
- `.env.example` com placeholders seguros.

## Nunca deve ir para o Git

- `.env`, `.env.local`, `.env.production` ou variações com valores reais.
- `documentacao-unica/PRIVATE-OPS.md`.
- tokens JWT, refresh tokens, cookies, senhas, chaves privadas e certificados privados.
- dumps SQL, backups de banco e exports com dados reais.
- `node_modules/`.
- builds e artefatos gerados: `dist/`, `dist-test/`, `.next/`, `out/`, `build/`, `coverage/`.
- evidências locais de teste/smoke em `assistenterpg-front/evidence/`.

## Estado corrigido

Foram removidos do estado atual do Git:

- `assistenterpg-back/dist-test/`, que continha artefatos compilados.
- `assistenterpg-front/evidence/front-smoke-2026-03-05/`, que continha evidências geradas e um `access_token` antigo.

Esta limpeza não reescreve o histórico Git. Se um segredo real ainda existir no histórico remoto, o procedimento correto é:

1. rotacionar o segredo imediatamente;
2. avaliar impacto;
3. decidir se vale reescrever histórico com ferramenta apropriada, como `git filter-repo`;
4. coordenar force push e realinhamento dos clones.

## Checklist antes de commitar

```powershell
git status --short
git diff --check
git ls-files | rg "dist-test|front-smoke|PRIVATE-OPS|\.env$|eyJ[A-Za-z0-9_-]+\."
git check-ignore -v assistenterpg-back/.env assistenterpg-front/.env documentacao-unica/PRIVATE-OPS.md
git check-ignore -v assistenterpg-back/dist-test/test.js assistenterpg-front/evidence/front-smoke-2026-03-05/00-login.json
```

Resultado esperado:

- `git diff --check` sem erros.
- `git ls-files ...` sem arquivos sensíveis/gerados.
- `git check-ignore` mostrando regra aplicável para arquivos privados e artefatos.

## Regras práticas

- Se o arquivo é necessário para compilar/rodar em outra máquina e não contém segredo, ele provavelmente deve ir para o Git.
- Se o arquivo pode ser recriado por `npm ci`, `npm run build`, `npm run test`, seed, script ou export local, ele provavelmente não deve ir para o Git.
- Se o arquivo contém credencial ou dado real de usuário, ele não deve ir para o Git mesmo que facilite desenvolvimento.
- Para documentar variáveis, use `.env.example`, nunca `.env` real.
