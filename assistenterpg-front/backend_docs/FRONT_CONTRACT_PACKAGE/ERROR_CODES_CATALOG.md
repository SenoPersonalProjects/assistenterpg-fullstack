# Catálogo Formal de Códigos de Erro

## Envelope padrão de erro

```json
{
  "statusCode": 400,
  "message": "mensagem",
  "code": "CODIGO_ERRO",
  "details": {}
}
```

## Convenção UX para tratamento no front

- **Inline de formulário**: erros de validação de campo, credenciais e conflitos diretamente ligados ao input atual.
- **Toast global**: falhas de autorização, indisponibilidade, não encontrado em navegação, conflitos de estado e erros de negócio não vinculados a um campo específico.

---

## 1) Auth (prioridade alta)

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/auth/register` | `POST` | `400/VALIDATION_ERROR`, `409/USUARIO_EMAIL_DUPLICADO` | **Inline** |
| `/auth/login` | `POST` | `400/VALIDATION_ERROR`, `401/AUTH_CREDENCIAIS_INVALIDAS` | **Inline** |
| rotas protegidas (qualquer domínio) | `*` | `401/TOKEN_INVALIDO` ou `401/USUARIO_NAO_AUTENTICADO` | **Toast global** + redirect/login |

### Payload mínimo (erros críticos)

**Credenciais inválidas (login)**

```json
{
  "statusCode": 401,
  "code": "AUTH_CREDENCIAIS_INVALIDAS",
  "message": "Credenciais inválidas"
}
```

**Email duplicado (registro)**

```json
{
  "statusCode": 409,
  "code": "USUARIO_EMAIL_DUPLICADO",
  "message": "Email já cadastrado"
}
```

---

## 2) Campanhas (prioridade alta)

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/campanhas` | `POST` | `400/VALIDATION_ERROR` | **Inline** |
| `/campanhas/:id` | `GET` | `404/CAMPANHA_NOT_FOUND`, `403/CAMPANHA_ACESSO_NEGADO` | **Toast global** |
| `/campanhas/:id` | `DELETE` | `403/CAMPANHA_ACESSO_NEGADO`, `404/CAMPANHA_NOT_FOUND` | **Toast global** |
| `/campanhas/:id/membros` | `POST` | `403/CAMPANHA_ACESSO_NEGADO`, `409/USUARIO_JA_MEMBRO` | `USUARIO_JA_MEMBRO` = **Inline**; demais = **Toast** |
| `/campanhas/:id/convites` | `POST` | `422/CONVITE_INVALIDO`, `409/CONVITE_DUPLICADO`, `403/CAMPANHA_ACESSO_NEGADO` | `CONVITE_INVALIDO` = **Inline**; demais = **Toast** |
| `/campanhas/convites/:codigo/aceitar` | `POST` | `404/CONVITE_NOT_FOUND`, `422/CONVITE_EXPIRADO`, `409/USUARIO_JA_MEMBRO` | **Toast global** |

### Payload mínimo (erros críticos)

**Campanha não encontrada**

```json
{
  "statusCode": 404,
  "code": "CAMPANHA_NOT_FOUND",
  "message": "Campanha não encontrada"
}
```

**Acesso negado à campanha**

```json
{
  "statusCode": 403,
  "code": "CAMPANHA_ACESSO_NEGADO",
  "message": "Você não possui acesso a esta campanha"
}
```

---

## 3) Personagens-base (prioridade alta)

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/personagens-base` | `POST` | `400/VALIDATION_ERROR`, `422/INVALID_EA_KEY_ATTRIBUTE`, `422/TRAINING_RULE_INVALID` | **Inline** |
| `/personagens-base/preview` | `POST` | `422/POWER_RULE_INVALID`, `422/TRAINING_RULE_INVALID` | **Inline** |
| `/personagens-base/:id` | `GET` | `404/PERSONAGEM_BASE_NOT_FOUND`, `403/PERSONAGEM_BASE_ACESSO_NEGADO` | **Toast global** |
| `/personagens-base/:id` | `PATCH` | `400/VALIDATION_ERROR`, `403/PERSONAGEM_BASE_ACESSO_NEGADO`, `404/PERSONAGEM_BASE_NOT_FOUND` | `VALIDATION_ERROR` = **Inline**; demais = **Toast** |
| `/personagens-base/:id` | `DELETE` | `403/PERSONAGEM_BASE_ACESSO_NEGADO`, `404/PERSONAGEM_BASE_NOT_FOUND` | **Toast global** |

### Payload mínimo (erros críticos)

**Personagem não encontrado**

```json
{
  "statusCode": 404,
  "code": "PERSONAGEM_BASE_NOT_FOUND",
  "message": "Personagem-base não encontrado"
}
```

**Violação de regra de criação**

```json
{
  "statusCode": 422,
  "code": "INVALID_EA_KEY_ATTRIBUTE",
  "message": "Atributo-chave inválido para esta distribuição"
}
```

---

## 4) Compêndio (prioridade alta)

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/compendio/buscar` | `GET` | `400/COMPENDIO_BUSCA_INVALIDA` | **Inline** (campo busca) |
| `/compendio/categorias/codigo/:codigo` | `GET` | `404/COMPENDIO_CATEGORIA_NOT_FOUND` | **Toast global** |
| `/compendio/artigos/codigo/:codigo` | `GET` | `404/COMPENDIO_ARTIGO_NOT_FOUND` | **Toast global** |
| `/compendio/categorias` | `POST` | `403/AUTH_ACESSO_NEGADO`, `409/COMPENDIO_CATEGORIA_DUPLICADA` | `*_DUPLICADA` = **Inline**; `403` = **Toast** |
| `/compendio/artigos` | `POST` | `403/AUTH_ACESSO_NEGADO`, `409/COMPENDIO_ARTIGO_DUPLICADO`, `422/COMPENDIO_RELACAO_INVALIDA` | `*_DUPLICADO` e `*_INVALIDA` = **Inline**; `403` = **Toast** |
| `/compendio/*/:id` | `PUT/DELETE` | `403/AUTH_ACESSO_NEGADO`, `404/COMPENDIO_*_NOT_FOUND` | **Toast global** |

### Payload mínimo (erros críticos)

**Artigo duplicado**

```json
{
  "statusCode": 409,
  "code": "COMPENDIO_ARTIGO_DUPLICADO",
  "message": "Já existe artigo com o mesmo código"
}
```

**Busca inválida**

```json
{
  "statusCode": 400,
  "code": "COMPENDIO_BUSCA_INVALIDA",
  "message": "Parâmetro de busca inválido"
}
```

---

## 5) Inventário / Homebrew / Suplementos (prioridade alta)

### 5.1 Inventário

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/inventario/personagem/:personagemBaseId` | `GET` | `404/PERSONAGEM_BASE_NOT_FOUND`, `403/INVENTARIO_ACESSO_NEGADO` | **Toast global** |
| `/inventario/adicionar` | `POST` | `400/VALIDATION_ERROR`, `422/INVENTARIO_CAPACIDADE_EXCEDIDA`, `404/INVENTARIO_ITEM_NOT_FOUND` | `VALIDATION_ERROR` = **Inline**; demais = **Toast** |
| `/inventario/item/:itemId` | `PATCH` | `403/INVENTARIO_ACESSO_NEGADO`, `404/INVENTARIO_ITEM_NOT_FOUND`, `422/INVENTARIO_MODIFICACAO_INCOMPATIVEL` | `422` pode ser **Inline**; demais **Toast** |
| `/inventario/aplicar-modificacao` | `POST` | `422/INVENTARIO_MODIFICACAO_INCOMPATIVEL`, `404/INVENTARIO_ITEM_NOT_FOUND` | **Inline** quando em modal de modificação; fallback **Toast** |

**Payload mínimo crítico (capacidade excedida)**

```json
{
  "statusCode": 422,
  "code": "INVENTARIO_CAPACIDADE_EXCEDIDA",
  "message": "Capacidade do inventário excedida"
}
```

### 5.2 Homebrews

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/homebrews` | `POST` | `400/VALIDATION_ERROR`, `409/HOMEBREW_CODIGO_DUPLICADO` | **Inline** |
| `/homebrews/:id` | `PATCH/DELETE` | `403/HOMEBREW_ACESSO_NEGADO`, `404/HOMEBREW_NOT_FOUND` | **Toast global** |
| `/homebrews/:id/publicar` | `POST` | `403/HOMEBREW_ACESSO_NEGADO`, `422/HOMEBREW_STATUS_INVALIDO` | **Toast global** |
| `/homebrews/:id/arquivar` | `POST` | `403/HOMEBREW_ACESSO_NEGADO`, `422/HOMEBREW_STATUS_INVALIDO` | **Toast global** |

**Payload mínimo crítico (acesso negado)**

```json
{
  "statusCode": 403,
  "code": "HOMEBREW_ACESSO_NEGADO",
  "message": "Você não pode alterar este homebrew"
}
```

### 5.3 Suplementos

| Endpoint | Método | Erros prováveis (`status/code`) | Tratamento UX |
|---|---|---|---|
| `/suplementos` | `GET` | `401/USUARIO_NAO_AUTENTICADO` | **Toast global** + fluxo de login |
| `/suplementos/:id/ativar` | `POST/PATCH` | `404/SUPLEMENTO_NOT_FOUND`, `409/SUPLEMENTO_JA_ATIVO`, `422/SUPLEMENTO_NAO_PUBLICADO` | `SUPLEMENTO_JA_ATIVO` = feedback local (inline/badge); demais = **Toast** |
| `/suplementos/:id/desativar` | `DELETE` | `404/SUPLEMENTO_NOT_FOUND`, `409/SUPLEMENTO_JA_INATIVO` | feedback local + **Toast** opcional |
| `/suplementos` | `POST` | `403/AUTH_ACESSO_NEGADO`, `409/SUPLEMENTO_CODIGO_DUPLICADO` | `409` = **Inline**; `403` = **Toast** |
| `/suplementos/:id` | `PATCH/DELETE` | `403/AUTH_ACESSO_NEGADO`, `404/SUPLEMENTO_NOT_FOUND` | **Toast global** |

**Payload mínimo crítico (suplemento não publicado)**

```json
{
  "statusCode": 422,
  "code": "SUPLEMENTO_NAO_PUBLICADO",
  "message": "Suplemento ainda não está publicado"
}
```

---

## Observações de implementação

1. Tratar `401` de forma centralizada no client HTTP (logout + redirect para login).
2. Mapear `code` -> tradução/mensagem amigável em um catálogo local do front.
3. Para erro **Inline**, priorizar `details`/`field` quando o backend fornecer; usar `message` como fallback.
4. Para erro **Toast**, registrar telemetria (`endpoint`, `statusCode`, `code`) para priorização de correções.
