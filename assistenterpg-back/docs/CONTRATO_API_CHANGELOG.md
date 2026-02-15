# Changelog de contrato da API (foco front)

> Registre aqui apenas mudanças que impactam consumo do front.

## [Unreleased]

### Added

- Pacote único de handoff para front adicionado em `docs/FRONT_CONTRACT_PACKAGE/` (snapshot OpenAPI versionado, matriz de paginação/parâmetros, permissões + usuários de teste e catálogo de erros).
- Troubleshooting de geração do Prisma Client em CI/proxy: `docs/PRISMA_GENERATE_TROUBLESHOOTING.md`.
- Checklist obrigatório de PR do front para integração (`docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`).
- Plano de execução de estabilização em 3 PRs (`docs/PLANO_EXECUCAO_ESTABILIZACAO.md`).
- Implementação inicial de Swagger/OpenAPI em runtime (`/docs` e `/docs/openapi.json`).
- Documento de handoff técnico para front sem monorepo: `docs/BACKEND_HANDOFF_FRONT.md`.
- Arquivo de pinagem de versão de contrato: `docs/BACKEND_CONTRACT_VERSION.md`.
- Exemplos adicionais de request/response para inventário, homebrews e suplementos.
- Guia de revisão front↔back em repositórios separados: `docs/GUIA_REVISAO_FRONT_COM_BACK.md`.
- Playbook de integração Next.js: `docs/FRONT_NEXT_INTEGRATION_PLAYBOOK.md`.
- Snapshot de contrato para consumo do front: `docs/API_CONTRACT_SNAPSHOT.md`.
- Guia de entrada rápida para agente/time do front: `docs/FRONT_AGENT_START_HERE.md`.

### Changed

- Atualizada a pinagem de versão do contrato em `docs/BACKEND_CONTRACT_VERSION.md` para alinhar a documentação ao baseline de código entregue ao front.
- PR 1 de Build/Test Health iniciado com `prebuild` para validação de Prisma Client e exclusão de `prisma/**` do build principal da aplicação.
- `prebuild` agora tenta `prisma generate` automaticamente antes de falhar com instruções de troubleshooting.
- Endpoints de listagem de campanhas/compêndio aceitam paginação opcional (`page`, `limit`) com retorno híbrido (array ou envelope paginado).
- Correção de bloqueador de execução: `package.json` inválido (chave `prebuild` duplicada/mal formada), restaurando parse do npm e disponibilidade dos scripts.

### Security

- Fluxo de auth/JWT e recomendações de CORS/JWT documentados para integração do front.

---

## Convenção de entradas

Para cada mudança:

1. módulo/endpoint afetado;
2. tipo da mudança (`Added/Changed/Deprecated/Removed/Security`);
3. impacto no front;
4. ação necessária no front.
