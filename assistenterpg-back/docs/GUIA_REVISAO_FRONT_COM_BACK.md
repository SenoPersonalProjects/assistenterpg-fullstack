# Guia grande de revisão do Front considerando este Back (sem monorepo)

> Objetivo: permitir revisar/implementar o front **com contexto completo do backend** mesmo com repositórios separados.

---

## 0) Documentos complementares (leitura obrigatória)

Além deste guia, use também:
- `docs/API_CONTRACT_SNAPSHOT.md` (mapa rápido de endpoints/contratos para implementação de telas)
- `docs/FRONT_NEXT_INTEGRATION_PLAYBOOK.md` (boas práticas para Next componentizado + reuso)
- `docs/CONTRATO_API_CHANGELOG.md` (fonte de mudanças que impactam o front)
- `docs/FRONT_REQUEST_RESPONSE_EXAMPLES.md` (payloads e respostas de referência)
- `docs/FRONT_ERROR_HANDLING_GUIDE.md` (tratativa de erros para UX consistente)

---

## 1) Preciso migrar para monorepo?

**Não, não é obrigatório.**

Você consegue manter front e back em repositórios separados e ainda ter revisão integrada se padronizar:
1. contrato de API (rotas, payloads, erros);
2. versão do contrato (changelog/compatibilidade);
3. ambiente de integração local (URL base, CORS, auth);
4. checklist de validação cruzada front↔back.

Monorepo ajuda em DX (CI único, versionamento conjunto), mas **não é pré-requisito**.

---

## 2) Estratégia recomendada para 2 repositórios

### Modelo de operação
- **Back repo** = fonte da verdade da API e regras de negócio.
- **Front repo** = consumidor dos contratos publicados pelo back.
- Toda revisão de front deve responder: “isso está aderente ao contrato do back em `<commit/tag>`?”.

### Versionamento de contrato
- Definir uma convenção simples no back, por exemplo:
  - `docs/CONTRATO_API_CHANGELOG.md`;
  - cada alteração de endpoint/DTO/resposta/erro entra no changelog.
- O front fixa o consumo em uma referência (release/tag/commit do back).

### Integração local
- Front usa `API_BASE_URL` por ambiente (`.env.local`, `.env.staging`, `.env.prod`).
- Back publica `CORS_ORIGINS` com origem do front local/staging.

---

## 3) O que o front precisa saber deste backend

## 3.1 Stack e comportamento global
- NestJS + Prisma (MySQL).
- Validação global via `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, transformação ativa).
- Filtros globais de exceção (`HttpExceptionFilter` + fallback).

**Impacto no front:**
- campos extras no payload podem gerar erro de validação;
- o front deve tratar resposta de erro padronizada (`statusCode`, `message`, `code`, etc.).

## 3.2 Autenticação
- Login/registro em `auth`.
- Rotas protegidas com JWT (Bearer token).

**Impacto no front:**
- precisa de camada de sessão/token (storage + refresh de estado do usuário).
- interceptador HTTP deve anexar `Authorization: Bearer <token>`.

## 3.3 Paginação (já implementada)
- Alguns endpoints aceitam `page`/`limit` (ex.: campanhas minhas e listagens de compêndio).
- Sem `page`/`limit`, muitos endpoints ainda retornam array simples por compatibilidade.

**Impacto no front:**
- criar parser resiliente para dois formatos:
  1. `T[]`
  2. `{ items: T[], total, page, limit, totalPages }`

---

## 4) Inventário de módulos/rotas principais para mapeamento de telas

> Use esta lista como mapa de features do front.

- `auth`: `POST /auth/register`, `POST /auth/login`
- `usuarios`: perfil/me, estatísticas, preferências, senha, exportação, exclusão
- `campanhas`: CRUD parcial + membros + convites
- `personagens-base`: criação/preview/listagem/meus/atualização/remoção + consultas auxiliares
- `compendio`: categorias/subcategorias/artigos + busca + destaques
- `homebrews`: listagem, CRUD, publicar/arquivar, consulta por código
- `suplementos`: listagem, detalhe, ativação/desativação, CRUD
- `equipamentos`, `modificacoes`, `inventario`
- `tecnicas-amaldicoadas` (técnicas + habilidades + variações)
- `classes`, `clas`, `origens`, `trilhas`, `habilidades`, `proficiencias`, `pericias`, `tipos-grau`, `condicoes`, `alinhamentos`

---

## 5) Como revisar front usando este guia (processo prático)

### Passo A — definir baseline técnico
- Front informa no PR: “Baseado no back `<commit hash>`”.
- Validar `API_BASE_URL` e ambiente de teste.

### Passo B — mapear tela ↔ endpoint
Para cada tela:
1. endpoint(s) consumido(s);
2. parâmetros/query/body;
3. formato de sucesso;
4. formato de erro esperado;
5. estados de loading/empty/error.

### Passo C — validar contratos críticos
- campos obrigatórios vs opcionais;
- enums (render e validação de formulário);
- paginação e ordenação;
- autenticação/autorização.

### Passo D — validar UX orientada a regra de negócio
- mensagens de erro legíveis para códigos mais comuns;
- fallback de sessão expirada (401);
- prevenção de ações sem permissão;
- confirmação para ações destrutivas (delete/arquivar).

---

## 6) Padrão de cliente HTTP recomendado no front

Criar um `apiClient` com:
- `baseURL` por ambiente;
- interceptador de request para token;
- interceptador de response para mapear erro de API em erro de domínio do front;
- utilitário `isPaginatedResponse()` para detectar resposta paginada.

Exemplo de estratégia (conceitual):
1. se `response.data.items` existe => usar paginação;
2. senão, tratar como lista simples.

---

## 7) Matriz mínima de erros para o front tratar bem

- `400` validação (campos inválidos)
- `401` não autenticado/token inválido
- `403` sem permissão
- `404` recurso não encontrado
- `409` conflito (duplicidade)
- `422` regra de negócio inválida
- `500` erro interno

### UX sugerida
- toast para erro global;
- mensagem inline para campo inválido;
- telas de fallback (vazia/erro/permissão).

---

## 8) Organização sugerida no repositório do front

Estrutura sugerida:
- `src/api/` (cliente HTTP, adapters, contratos)
- `src/modules/<dominio>/` (pages, hooks, services locais)
- `src/shared/components/`
- `src/shared/types/`
- `src/shared/errors/`
- `src/shared/pagination/`

### Convenção útil
- Um arquivo `contracts.ts` por domínio de API consumido (campanhas, compêndio etc.).
- Um adapter de transformação para cada endpoint que normalize o formato para UI.

---

## 9) Como manter sincronia sem monorepo (recomendação forte)

1. No **back**:
   - manter `docs/GUIA_REVISAO_FRONT_COM_BACK.md` (este arquivo) e atualizar a cada mudança de contrato;
   - manter changelog de contrato.
2. No **front**:
   - guardar referência do commit do back em arquivo `BACKEND_CONTRACT_VERSION.md`.
3. No PR do front:
   - seção obrigatória “Contratos tocados”.
4. No PR do back que afeta front:
   - checklist “breaking change?” + “ação necessária no front?”.

---

## 10) Opções de acoplamento entre repos (sem monorepo)

### Opção 1 — Apenas documentação versionada (mais simples)
- Usa este guia + changelog.
- Menor overhead.

### Opção 2 — Repo front com `git submodule` apontando para o back (somente leitura)
- Bom para revisões com contexto local sem copiar código.
- Requer disciplina com atualização de ponteiro.

### Opção 3 — Pacote de contratos compartilhado
- Extrair contratos DTO/tipos para pacote npm interno (`@assistenterpg/contracts`).
- Front e back dependem da mesma versão de tipos.
- Melhor escalabilidade, mais esforço inicial.

**Recomendação para você agora:** começar com Opção 1 + 2; migrar para Opção 3 quando estabilizar mais os domínios.

---

## 11) Checklist de revisão do front (copiar e colar em PR)

- [ ] PR referencia commit/tag do back
- [ ] endpoints mapeados por tela
- [ ] tratamento de loading/empty/error
- [ ] tratamento de 401/403/404/409/500
- [ ] validação de formulário alinhada aos DTOs
- [ ] paginação testada (`page/limit`)
- [ ] fluxo autenticado testado com token real
- [ ] estados de permissão revisados
- [ ] sem contrato implícito não documentado

---

## 12) Próximos incrementos recomendados no back para ajudar o front

1. Padronizar paginação para todos os endpoints de lista.
2. Padronizar envelope de resposta para listagens (eliminar retorno híbrido array vs paginado em versão futura).
3. Adicionar documentação de erro por endpoint (códigos de negócio esperados).
4. (Opcional) gerar OpenAPI/Swagger e publicar artefato versionado por release.

---

## 13) Decisão prática para sua pergunta

- **Você não precisa adotar monorepo.**
- Com este guia + disciplina de versionamento de contrato, conseguimos revisar o front com contexto do back tranquilamente.
- Se quiser mais robustez depois, evoluímos para pacote de contratos compartilhado.

