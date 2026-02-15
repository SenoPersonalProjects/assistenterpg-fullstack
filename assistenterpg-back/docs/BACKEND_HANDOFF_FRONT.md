# Backend handoff para integração com Front (repositório separado)

Este documento resume **como o backend funciona**, os riscos atuais e como o time/agent do front deve consumir a API sem acesso ao código fonte do backend.

## 1) Stack e arquitetura

- **Framework:** NestJS (arquitetura modular por domínio).
- **Banco:** Prisma ORM.
- **Autenticação:** JWT Bearer.
- **Cross-cutting global:**
  - `ValidationPipe` (`transform`, `whitelist`, `forbidNonWhitelisted`);
  - filtros globais de exceção;
  - interceptors de log e timeout;
  - CORS por variável de ambiente (`CORS_ORIGINS`).

## 2) Swagger/OpenAPI (fonte de contrato)

- **UI:** `GET /docs`
- **JSON OpenAPI:** `GET /docs/openapi.json`
- O Swagger está habilitado por padrão e pode ser desligado com `SWAGGER_ENABLED=false`.
- A versão de contrato exposta no Swagger usa `API_VERSION` (fallback `v1`).

## 2.1 Hierarquia de fonte da verdade (obrigatória)

1. Swagger/OpenAPI (`/docs` e `/docs/openapi.json`)
2. `docs/BACKEND_CONTRACT_VERSION.md`
3. `docs/CONTRATO_API_CHANGELOG.md`
4. `docs/API_CONTRACT_SNAPSHOT.md` e exemplos

> Se houver conflito entre exemplo e OpenAPI, o front deve seguir OpenAPI e registrar issue.

## 3) Regras de consumo para o front

### Auth

- Faça login em `POST /auth/login` e injete `Authorization: Bearer <token>` nas rotas protegidas.
- Em `401`, limpar sessão e redirecionar para login.

### Erros

- Tratar erro no front por envelope unificado:
  - `statusCode`
  - `message`
  - `code`
  - opcionais: `details`, `field`, `timestamp`, `path`, `method`

### Listagens

- Alguns endpoints retornam:
  1. array simples (`T[]`) quando sem paginação;
  2. envelope paginado (`{ items, total, page, limit, totalPages }`) quando com `page/limit`.
- Padronize no front com parser único de listagem.

## 4) Domínios e prioridade de implementação no front

1. **Auth + Usuário** (sessão, perfil, preferências).
2. **Campanhas** (lista, detalhe, membros, convites).
3. **Personagens-base** (create, preview, update, list).
4. **Compêndio** (categoria/subcategoria/artigo + busca).
5. **Inventário + Equipamentos + Modificações**.
6. **Homebrews e Suplementos**.

## 5) Documentos que o agente do front deve ler primeiro

1. `docs/API_CONTRACT_SNAPSHOT.md`
2. `docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md`
3. `docs/FRONT_ERROR_HANDLING_GUIDE.md`
4. `docs/FRONT_NEXT_INTEGRATION_PLAYBOOK.md`
5. `docs/BACKEND_CONTRACT_VERSION.md`

## 6) Problemas técnicos atuais conhecidos (para planejamento)

Para problemas de geração do Prisma Client no ambiente, use: `docs/PRISMA_GENERATE_TROUBLESHOOTING.md`.

- O ambiente local de build pode falhar sem geração do Prisma Client e variáveis de ambiente necessárias.
- O front deve priorizar consumo via contrato Swagger e exemplos versionados, evitando inferir formato por implementação interna.
- Recomenda-se manter pin de commit/tag do backend em cada sprint para evitar quebra silenciosa de contrato.

## 7) Checklist de handoff por sprint

- [ ] Atualizar `docs/BACKEND_CONTRACT_VERSION.md` com commit/tag do backend.
- [ ] Atualizar changelog de contrato (`docs/CONTRATO_API_CHANGELOG.md`).
- [ ] Validar endpoints usados pelo front no Swagger (`/docs`).
- [ ] Registrar no PR do front o commit do backend de referência.

## 8) Checklist obrigatório no PR do front

Use `docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md` em toda PR de integração com API.
