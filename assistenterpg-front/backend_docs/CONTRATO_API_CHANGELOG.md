# Changelog de contrato da API (foco front)

> Registre aqui apenas mudancas que impactam consumo do front.

## [Unreleased]

### Added

- Pacote unico de handoff para front adicionado em `docs/FRONT_CONTRACT_PACKAGE/` (snapshot OpenAPI versionado, matriz de paginacao/parametros, permissoes + usuarios de teste e catalogo de erros).
- Troubleshooting de geracao do Prisma Client em CI/proxy: `docs/PRISMA_GENERATE_TROUBLESHOOTING.md`.
- Checklist obrigatorio de PR do front para integracao (`docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`).
- Plano de execucao de estabilizacao em 3 PRs (`docs/PLANO_EXECUCAO_ESTABILIZACAO.md`).
- Implementacao inicial de Swagger/OpenAPI em runtime (`/docs` e `/docs/openapi.json`).
- Documento de handoff tecnico para front sem monorepo: `docs/BACKEND_HANDOFF_FRONT.md`.
- Arquivo de pinagem de versao de contrato: `docs/BACKEND_CONTRACT_VERSION.md`.
- Exemplos adicionais de request/response para inventario, homebrews e suplementos.
- Guia de revisao front-back em repositorios separados: `docs/GUIA_REVISAO_FRONT_COM_BACK.md`.
- Playbook de integracao Next.js: `docs/FRONT_NEXT_INTEGRATION_PLAYBOOK.md`.
- Snapshot de contrato para consumo do front: `docs/API_CONTRACT_SNAPSHOT.md`.
- Guia de entrada rapida para agente/time do front: `docs/FRONT_AGENT_START_HERE.md`.
- Endpoints de compartilhamento de ficha no wizard de personagem-base:
  - `GET /personagens-base/:id/exportar` (gera JSON de exportacao da ficha)
  - `POST /personagens-base/importar` (importa JSON e cria nova ficha para o usuario autenticado)
- Documento de handoff detalhado para front sobre wizard + import/export: `docs/WIZARD_PERSONAGEM_IMPORT_EXPORT_HANDOFF_2026-03-04.md`.

### Changed

- Atualizada a pinagem de versao do contrato em `docs/BACKEND_CONTRACT_VERSION.md` para alinhar a documentacao ao baseline de codigo entregue ao front.
- PR 1 de Build/Test Health iniciado com `prebuild` para validacao de Prisma Client e exclusao de `prisma/**` do build principal da aplicacao.
- `prebuild` agora tenta `prisma generate` automaticamente antes de falhar com instrucoes de troubleshooting.
- Endpoints de listagem de campanhas/compendio aceitam paginacao opcional (`page`, `limit`) com retorno hibrido (array ou envelope paginado).
- Correcao de bloqueador de execucao: `package.json` invalido (chave `prebuild` duplicada/mal formada), restaurando parse do npm e disponibilidade dos scripts.
- `POST /personagens-base/preview` agora valida itens de inventario em lote (nao mais apenas item a item), reduzindo falsos positivos no wizard.
- `POST /personagens-base` ajustado para evitar duplicacao de itens de inventario durante a criacao do personagem.

### Security

- Fluxo de auth/JWT e recomendacoes de CORS/JWT documentados para integracao do front.

---

## Convencao de entradas

Para cada mudanca:

1. modulo/endpoint afetado;
2. tipo da mudanca (`Added/Changed/Deprecated/Removed/Security`);
3. impacto no front;
4. acao necessaria no front.
