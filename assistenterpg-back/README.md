# AssistenteRPG Backend

API backend do AssistenteRPG (NestJS + Prisma), com módulos de autenticação, usuário, campanhas, compêndio, personagens, inventário, equipamentos, homebrews e suplementos.

## Requisitos

- Node.js 20+
- NPM 10+
- Variáveis de ambiente (mínimo):
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGINS` (opcional, default: `http://localhost:3001`)
  - `PORT` (opcional, default: `3000`)
  - `API_VERSION` (opcional, default: `v1`)
  - `SWAGGER_ENABLED` (opcional, default: `true`)

## Setup

```bash
npm install
```

## Rodando em desenvolvimento

```bash
npm run start:dev
```

## Swagger / OpenAPI

Com a API em execução:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs/openapi.json`

## Scripts úteis

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
npm run seed
```

## Documentação para integração front (repo separado)

- **Start aqui (agente front):** `docs/FRONT_AGENT_START_HERE.md`
- Snapshot de contrato: `docs/API_CONTRACT_SNAPSHOT.md`
- Exemplos request/response: `docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md`
- Guia de integração Next.js: `docs/FRONT_NEXT_INTEGRATION_PLAYBOOK.md`
- Handoff técnico completo: `docs/BACKEND_HANDOFF_FRONT.md`
- Versão de contrato por sprint: `docs/BACKEND_CONTRACT_VERSION.md`
- Changelog de contrato: `docs/CONTRATO_API_CHANGELOG.md`
- Checklist para PR do front: `docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`
- Plano de execução (3 PRs): `docs/PLANO_EXECUCAO_ESTABILIZACAO.md`
- Troubleshooting Prisma Generate: `docs/PRISMA_GENERATE_TROUBLESHOOTING.md`
