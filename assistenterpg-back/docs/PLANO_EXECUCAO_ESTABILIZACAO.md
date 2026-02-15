# Plano de execução: estabilização backend + contrato para front

Objetivo: reduzir risco de integração front/back em repositórios separados e aumentar previsibilidade do contrato.

## Visão geral (3 PRs)

## PR 1 — Build/Test Health (prioridade máxima)

**Meta:** deixar pipeline minimamente confiável.

### Escopo

- Corrigir erros de tipagem que quebram `npm run build`.
- Garantir geração/compatibilidade do Prisma Client no ambiente de CI.
- Corrigir DTOs/services com descompasso de propriedades.

### Critérios de aceite

- `npm run build` verde.
- `npm run test` executável sem quebra global de bootstrap.
- Falhas residuais documentadas com issue vinculada.

### Saída esperada

- Backend compilando de forma previsível para evitar drift entre doc e runtime.

### Status atual

- Etapa inicial aplicada em `docs/PR1_BUILD_HEALTH_STATUS.md`.

---

## PR 2 — Contrato versionado (OpenAPI + governança)

**Meta:** transformar Swagger em artefato versionado por sprint/release.

### Escopo

- Definir processo de geração de `openapi.json` versionado.
- Publicar artefato versionado (`v1.json`, `v1.1.json`, etc.) sob `docs/openapi/`.
- Registrar breaking changes em `docs/CONTRATO_API_CHANGELOG.md`.

### Critérios de aceite

- Arquivo OpenAPI versionado disponível no repositório.
- `docs/BACKEND_CONTRACT_VERSION.md` atualizado com commit/tag correto.
- Diferenças de contrato entre versões rastreáveis por git diff.

### Saída esperada

- Front com referência estável e auditável por versão.

---

## PR 3 — Handoff blindado para o agente do front

**Meta:** reduzir erro de implementação no front por ambiguidades de consumo.

### Escopo

- Checklist operacional para PR do front (auth, erros, paginação, estados de UI).
- Matriz de risco por domínio (Auth, Campanhas, Personagens-base, Inventário).
- Regras de fallback em respostas híbridas (`array` vs `items`).

### Critérios de aceite

- Front consegue iniciar implementação sem ler código do backend.
- Checklist obrigatório anexado no PR do front.
- Handoff cobre exemplos de sucesso e erro por domínio crítico.

### Saída esperada

- Menos retrabalho de integração e menos bugs de contrato.

---

## Ordem recomendada

1. PR 1 (estabilidade técnica)
2. PR 2 (governança de contrato)
3. PR 3 (operação do handoff)

---

## Definition of Done global

- [ ] Build estável.
- [ ] Contrato versionado por release.
- [ ] Commit/tag de referência registrado e consumido pelo front.
- [ ] Changelog de contrato atualizado.
- [ ] PR do front citando versão exata do backend.
