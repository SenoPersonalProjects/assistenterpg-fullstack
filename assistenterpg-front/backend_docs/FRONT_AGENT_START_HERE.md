# FRONT_AGENT_START_HERE

> **Nota:** no repositório original do backend, estes arquivos ficam em `docs/`; neste espelho do front, eles foram disponibilizados em `backend_docs/`.

Guia de entrada rápida para o agente/time que vai revisar ou implementar o front sem acesso ao repositório do backend.

## 1) Sequência obrigatória (não pular)

1. Ler `backend_docs/BACKEND_CONTRACT_VERSION.md`.
2. Ler `backend_docs/CONTRATO_API_CHANGELOG.md`.
3. Validar contrato em `/docs/openapi.json` (fonte oficial).
4. Usar o pacote único `backend_docs/FRONT_CONTRACT_PACKAGE/` como fonte principal de handoff para o front.
5. Usar `backend_docs/API_CONTRACT_SNAPSHOT.md` + `backend_docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md` para acelerar implementação.
6. Aplicar `backend_docs/FRONT_ERROR_HANDLING_GUIDE.md` para padronizar UX de erro.
7. Fechar PR com `backend_docs/FRONT_PR_CHECKLIST_BACKEND_CONTRACT.md`.

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
