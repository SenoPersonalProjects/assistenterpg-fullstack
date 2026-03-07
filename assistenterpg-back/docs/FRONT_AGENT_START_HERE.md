# FRONT_AGENT_START_HERE

Guia de entrada rápida para o agente/time que vai revisar ou implementar o front sem acesso ao repositório do backend.

## 1) Sequência obrigatória (não pular)

1. Ler `docs/BACKEND_CONTRACT_VERSION.md`.
2. Ler `docs/CONTRATO_API_CHANGELOG.md`.
3. Validar contrato em `/docs/openapi.json` (fonte oficial).
4. Usar o pacote único `docs/FRONT_CONTRACT_PACKAGE/` como fonte principal de handoff para o front.
5. Usar `docs/API_CONTRACT_SNAPSHOT.md` + `docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md` para acelerar implementação.
6. Aplicar `docs/FRONT_ERROR_HANDLING_GUIDE.md` para padronizar UX de erro.
7. Fechar PR com `docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`.

## 2) Regras de ouro de integração

- Sempre considerar OpenAPI como fonte de verdade.
- Não inferir payload por “achismo”/implementação visual.
- Tratar respostas de lista em formato híbrido:
  - array simples (`T[]`) **ou**
  - envelope paginado (`{ items, total, page, limit, totalPages }`).
- Tratar erro da API com envelope padrão:
  - `statusCode`, `message`, `code` (+ opcionais `details`, `field`, `timestamp`, `path`, `method`).
- Injetar `Authorization: Bearer <token>` nas rotas protegidas.

## 3) Priorização de telas/módulos no front

1. Auth + Sessão
2. Campanhas
3. Personagens-base
4. Compêndio
5. Inventário + Equipamentos + Modificações
6. Homebrews + Suplementos

## 4) Entregáveis mínimos em cada PR de front

- Referência explícita do backend consumido (commit/tag em `BACKEND_CONTRACT_VERSION.md`).
- Evidência de validação contra OpenAPI (`/docs` ou `/docs/openapi.json`).
- Checklist de integração anexado (`FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`).
- Evidência de tratamento dos estados: loading, vazio, erro, sucesso.

## 5) Nota operacional importante

Foi corrigido um bloqueador de execução no backend (`package.json` inválido por chave `prebuild` duplicada/mal formada). Com isso, o projeto volta a ser parseável pelo npm e os scripts ficam acessíveis normalmente.

## 6) Pacote wizard/import-export (leitura obrigatoria para este modulo)

1. `docs/FRONT_ONLY_WIZARD_BACKEND_CONTRACT_2026-03-05.md`
2. `docs/FRONT_ONLY_WIZARD_TEST_MATRIX_2026-03-05.md`
3. `docs/BACKEND_PACKAGE_FRONT_AGENT_2026-03-05.md`
4. `docs/front-smoke-2026-03-05/README.md`
5. `docs/WIZARD_BACKEND_UNIFICADO_HANDOFF_2026-03-05.md` (documento unificado do modulo)
6. `docs/WIZARD_CONTRATO_CONFIRMACOES_2026-03-05.md` (confirmacoes explicitas de parser/erros/espacos)
