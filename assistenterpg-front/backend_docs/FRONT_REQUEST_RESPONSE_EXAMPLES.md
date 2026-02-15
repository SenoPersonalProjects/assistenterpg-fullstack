# Exemplos de Request/Response para o Front (Next.js)

> Objetivo: reduzir ambiguidades na implementação do front com exemplos concretos de payloads, headers e respostas.

## Convenções base

- Header autenticado:
  - `Authorization: Bearer <access_token>`
- JSON:
  - `Content-Type: application/json`
- Datas:
  - ISO string
- Erros:
  - envelope com `statusCode`, `code`, `message` (+ opcionais)

---

## 1) Auth

## `POST /auth/register`

### Request

```json
{
  "apelido": "Shinobi01",
  "email": "jogador@exemplo.com",
  "senha": "senhaSegura123"
}
```

### Response (201)

```json
{
  "id": 12,
  "apelido": "Shinobi01",
  "email": "jogador@exemplo.com",
  "role": "JOGADOR",
  "criadoEm": "2026-02-15T12:00:00.000Z"
}
```

## `POST /auth/login`

### Request

```json
{
  "email": "jogador@exemplo.com",
  "senha": "senhaSegura123"
}
```

### Response (200)

```json
{
  "access_token": "<jwt>",
  "usuario": {
    "id": 12,
    "email": "jogador@exemplo.com",
    "apelido": "Shinobi01",
    "role": "JOGADOR"
  }
}
```

### Erro comum (401)

```json
{
  "statusCode": 401,
  "code": "AUTH_CREDENCIAIS_INVALIDAS",
  "message": "Credenciais inválidas",
  "timestamp": "2026-02-15T12:05:00.000Z",
  "path": "/auth/login",
  "method": "POST"
}
```

---

## 2) Usuário autenticado

## `GET /usuarios/me`

### Response (200)

```json
{
  "id": 12,
  "apelido": "Shinobi01",
  "email": "jogador@exemplo.com",
  "role": "JOGADOR",
  "criadoEm": "2026-02-15T12:00:00.000Z",
  "atualizadoEm": "2026-02-15T13:00:00.000Z"
}
```

## `PATCH /usuarios/me/preferencias`

### Request

```json
{
  "tema": "dark",
  "mostrarDicas": true,
  "idioma": "pt-BR"
}
```

### Response (200)

```json
{
  "id": 3,
  "usuarioId": 12,
  "tema": "dark",
  "mostrarDicas": true,
  "idioma": "pt-BR"
}
```

---

## 3) Campanhas

## `GET /campanhas/minhas`

### Sem paginação (compat)

`GET /campanhas/minhas`

```json
[
  {
    "id": 101,
    "nome": "A Queda do Clã",
    "descricao": "Campanha principal",
    "dono": { "id": 12, "apelido": "Shinobi01" },
    "_count": { "membros": 4, "personagens": 6, "sessoes": 10 }
  }
]
```

### Com paginação

`GET /campanhas/minhas?page=1&limit=10`

```json
{
  "items": [
    {
      "id": 101,
      "nome": "A Queda do Clã",
      "descricao": "Campanha principal",
      "dono": { "id": 12, "apelido": "Shinobi01" },
      "_count": { "membros": 4, "personagens": 6, "sessoes": 10 }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## `POST /campanhas`

### Request

```json
{
  "nome": "Nova Saga",
  "descricao": "Descrição opcional"
}
```

### Response (201)

```json
{
  "id": 150,
  "nome": "Nova Saga",
  "descricao": "Descrição opcional",
  "status": "ATIVA",
  "dono": {
    "id": 12,
    "apelido": "Shinobi01",
    "email": "jogador@exemplo.com"
  },
  "_count": { "membros": 0, "personagens": 0, "sessoes": 0 }
}
```

---

## 4) Compêndio

## `GET /compendio/categorias?todas=false&page=1&limit=20`

```json
{
  "items": [
    {
      "id": 1,
      "codigo": "CATEG_REGRAS",
      "nome": "Regras",
      "ordem": 1,
      "ativo": true,
      "subcategorias": []
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

## `GET /compendio/artigos?subcategoriaId=2`

```json
[
  {
    "id": 21,
    "codigo": "ART_ATAQUE",
    "titulo": "Ataques",
    "ordem": 1,
    "ativo": true,
    "subcategoria": {
      "id": 2,
      "codigo": "SUBC_COMBATE",
      "categoria": {
        "id": 1,
        "codigo": "CATEG_REGRAS"
      }
    }
  }
]
```

---

## 5) Tratamento de erro (exemplos úteis)

## Erro de validação (400)

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": [
    "email must be an email",
    "senha must be longer than or equal to 6 characters"
  ],
  "path": "/auth/register",
  "method": "POST"
}
```

## Erro de permissão (403)

```json
{
  "statusCode": 403,
  "code": "AUTH_ACESSO_NEGADO",
  "message": "Acesso negado",
  "path": "/campanhas/101",
  "method": "DELETE"
}
```

## Erro de não encontrado (404)

```json
{
  "statusCode": 404,
  "code": "CAMPANHA_NAO_ENCONTRADA",
  "message": "Campanha não encontrada",
  "path": "/campanhas/99999",
  "method": "GET"
}
```

---

## 6) Função de normalização recomendada no front

```ts
export function normalizeListResponse<T>(data: unknown) {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      page: 1,
      limit: data.length,
      total: data.length,
      totalPages: 1,
    };
  }

  const maybe = data as any;
  if (maybe?.items && Array.isArray(maybe.items)) {
    return {
      items: maybe.items as T[],
      page: Number(maybe.page ?? 1),
      limit: Number(maybe.limit ?? maybe.items.length),
      total: Number(maybe.total ?? maybe.items.length),
      totalPages: Number(maybe.totalPages ?? 1),
    };
  }

  throw new Error('Formato de lista inesperado vindo da API');
}
```

---

## 6) Inventário

## `GET /inventario/personagem/:personagemBaseId`

### Response (200)

```json
{
  "personagemBaseId": 88,
  "capacidade": {
    "usado": 12,
    "total": 20
  },
  "itens": [
    {
      "id": 501,
      "equipamentoId": 31,
      "nome": "Katana de Treino",
      "quantidade": 1,
      "modificacoes": [
        {
          "id": 9001,
          "codigo": "MOD_FIO_REFORCADO",
          "nome": "Fio Reforçado"
        }
      ]
    }
  ]
}
```

## `POST /inventario/adicionar`

### Request

```json
{
  "personagemBaseId": 88,
  "equipamentoId": 31,
  "quantidade": 1
}
```

### Response (201)

```json
{
  "id": 501,
  "personagemBaseId": 88,
  "equipamentoId": 31,
  "quantidade": 1
}
```

---

## 7) Homebrews

## `POST /homebrews`

### Request

```json
{
  "tipo": "TECNICA",
  "nome": "Rajada da Lua",
  "dados": {
    "descricao": "Golpe de avanço com dano crescente",
    "grau": "GRAU_2"
  },
  "publico": false
}
```

### Response (201)

```json
{
  "id": 73,
  "tipo": "TECNICA",
  "nome": "Rajada da Lua",
  "status": "RASCUNHO",
  "publico": false,
  "criadoPor": {
    "id": 12,
    "apelido": "Shinobi01"
  }
}
```

## `GET /homebrews?tipo=TECNICA&page=1&limit=10`

### Response (200)

```json
{
  "items": [
    {
      "id": 73,
      "tipo": "TECNICA",
      "nome": "Rajada da Lua",
      "status": "RASCUNHO",
      "publico": false
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 8) Suplementos

## `POST /suplementos`

### Request

```json
{
  "codigo": "SUP_EXPANSAO_ORIENTE",
  "nome": "Expansão Oriente",
  "descricao": "Novas técnicas e equipamentos",
  "ativo": true
}
```

### Response (201)

```json
{
  "id": 9,
  "codigo": "SUP_EXPANSAO_ORIENTE",
  "nome": "Expansão Oriente",
  "ativo": true,
  "criadoEm": "2026-02-15T16:00:00.000Z"
}
```

## `PATCH /suplementos/:id/ativar`

### Request

```json
{
  "ativo": false
}
```

### Response (200)

```json
{
  "id": 9,
  "codigo": "SUP_EXPANSAO_ORIENTE",
  "nome": "Expansão Oriente",
  "ativo": false
}
```
