# Revisão técnica do backend (NestJS + Prisma)

## Resumo executivo

O backend está bem modularizado por domínio e já possui boas fundações (DTO + ValidationPipe, guards, filtros, interceptors, Prisma centralizado). O principal risco atual não está no desenho macro, e sim em **confiabilidade de ambiente/pipeline** (geração do Prisma Client e build local), o que pode mascarar regressões.

Também havia lacuna de contrato oficial consumível pelo front; ela foi endereçada com Swagger/OpenAPI + documentação de handoff.

## Como o backend está estruturado

- **Core:** `AppModule` agrega módulos de auth, usuário, campanhas, personagens-base, compêndio, inventário, equipamentos, modificações, técnicas, homebrews e suplementos.
- **Entrada HTTP (`main.ts`):**
  - CORS configurável por env;
  - validação global estrita (`whitelist` + `forbidNonWhitelisted`);
  - filtros globais de exceção;
  - interceptors globais de logging e timeout;
  - Swagger/OpenAPI disponível em `/docs` e `/docs/openapi.json`.

## Riscos e pontos de atenção atuais

1. **Build local dependente de Prisma engines/client**
   - Sem Prisma Client gerado corretamente, erros de tipos explodem em cadeia.
   - Em alguns ambientes, download de engine Prisma pode falhar (ex.: bloqueio HTTP/403), travando build.

2. **Contratos híbridos de listagem**
   - Parte dos endpoints retorna array simples e parte retorna envelope paginado.
   - Front precisa normalizar isso em parser único para evitar bugs sutis de paginação.

3. **Dívida de tipagem em domínios complexos**
   - Alguns módulos de regras de negócio possuem superfície de tipos grande; vale endurecer testes de contrato por domínio para evoluir sem quebrar front.

## Recomendações fortes (próximas iterações)

1. **Versionar contrato OpenAPI por arquivo** (ex.: `docs/openapi/v1.json`, `v1.1.json`).
2. **Automatizar geração de OpenAPI em pipeline** e publicar como artifact.
3. **Criar smoke tests de contrato** (ex.: validar status/shape dos endpoints críticos consumidos pelo front).
4. **Pinagem obrigatória de commit/tag no front** via `BACKEND_CONTRACT_VERSION.md` a cada sprint.
5. **Definir política de breaking change** (semântica de versionamento e janela de depreciação).

## Material que o front deve usar como fonte de verdade

1. `/docs` (Swagger vivo).
2. `docs/BACKEND_HANDOFF_FRONT.md`.
3. `docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md`.
4. `docs/BACKEND_CONTRACT_VERSION.md`.
5. `docs/CONTRATO_API_CHANGELOG.md`.
