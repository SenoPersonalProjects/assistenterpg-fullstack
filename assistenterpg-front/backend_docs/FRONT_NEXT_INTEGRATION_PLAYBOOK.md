# Playbook de integração Front (Next.js) ↔ Backend (AssistenteRPG)

> **Nota:** no repositório original do backend, estes arquivos ficam em `docs/`; neste espelho do front, eles foram disponibilizados em `backend_docs/`.

> Documento orientado para o time/agent que vai revisar o front **sem acesso direto ao repo do back**.

## 1) Premissas

- Front em **Next.js** (idealmente App Router).
- Backend em NestJS com JWT Bearer.
- Repositórios separados.
- Objetivo: front altamente componentizado e com forte reutilização.

---

## 2) Arquitetura recomendada no front (componentização + reuso)

## 2.1 Estrutura de pastas sugerida

```txt
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
  modules/
    auth/
      api/
      components/
      hooks/
      schemas/
      types/
    campanhas/
    compendio/
    personagens/
    inventario/
  shared/
    api/
      client.ts
      interceptors.ts
      errors.ts
      pagination.ts
    components/
      data-table/
      empty-state/
      error-state/
      form/
      modal/
    hooks/
    lib/
    types/
```

## 2.2 Regras de ouro para evitar acoplamento ruim

1. **UI não conversa direto com fetch/axios**: sempre via camada `modules/*/api`.
2. **Toda resposta externa é adaptada**: criar adapters por endpoint.
3. **Componentes de domínio não dependem de rota**: recebem dados via props.
4. **Lógica de paginação/erro/auth centralizada** em `shared/api`.

---

## 3) Contratos de erro e sucesso (normalização no front)

## 3.1 Erro (esperado do backend)

Campos comuns:
- `statusCode`
- `message`
- `code`
- `details` (opcional)
- `field` (opcional)
- `timestamp`, `path`, `method`

### Estratégia no front
- mapear para um tipo único `AppApiError`.
- separar:
  - `fieldErrors` (formulário)
  - `globalError` (toast/banner)

## 3.2 Listagens (atenção)

Há dois formatos possíveis hoje:
1. `T[]`
2. `{ items: T[]; total: number; page: number; limit: number; totalPages: number }`

O front deve normalizar para um único tipo interno:

```ts
type ListResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
```

Se vier array, preencher com defaults (`page=1`, `total=items.length`, etc.).

---

## 4) Auth/JWT no Next

## 4.1 Fluxo recomendado
1. `POST /auth/login`.
2. Salvar token em mecanismo consistente (preferir cookie httpOnly via BFF quando possível).
3. Injetar Bearer nas chamadas autenticadas.
4. Em `401`, limpar sessão e redirecionar para login.

## 4.2 Guard de rota
- middleware para rotas privadas (dashboard).
- fallback visual de sessão expirada.

---

## 5) Data fetching no Next (SSR/CSR)

## 5.1 Quando usar Server Components
- páginas públicas e leitura sem token sensível.
- SEO e performance de first paint.

## 5.2 Quando usar Client Components
- formulários complexos.
- interações intensas com estado local.
- páginas autenticadas com updates frequentes.

## 5.3 Estratégia prática
- Queries: React Query (ou SWR), chave por domínio + parâmetros.
- Mutations: invalidar caches por tag/chave do domínio.

---

## 6) Formulários e validação

- Espelhar validações essenciais de DTO no front (sem tentar replicar 100% do back).
- Sempre tratar retorno de erro do back como fonte final da verdade.
- Reutilizar componentes:
  - `TextField`, `SelectField`, `EnumSelect`, `SubmitButton`, `FieldError`.

---

## 7) Padrões de UX obrigatórios

1. estado de loading inicial;
2. estado vazio (empty state);
3. estado de erro com retry;
4. confirmação para ações destrutivas;
5. toasts para feedback de sucesso/erro.

---

## 8) Módulos de maior prioridade para implementação no front

1. Auth + sessão.
2. Campanhas (lista minhas, detalhe, membros, convites).
3. Personagens-base (criar, preview, listar meus, detalhe).
4. Compêndio (navegação por categoria/subcategoria/artigo + busca).
5. Inventário e equipamentos.

---

## 9) Estratégia de testes no front

- Unit: adapters, helpers de paginação/erro, hooks de domínio.
- Componentes: estados loading/empty/error.
- Integração: fluxo login -> acessar rota privada -> logout.
- E2E (quando possível): criar campanha, listar, convidar membro.

---

## 10) Como o agent do front deve usar este material

No começo da revisão do front:
1. Ler `backend_docs/GUIA_REVISAO_FRONT_COM_BACK.md`.
2. Ler `backend_docs/API_CONTRACT_SNAPSHOT.md`.
3. Ler este playbook.
4. Registrar no PR do front o commit do back usado como referência.

