# Wizard Backend Contract (Front-only)

Data: 2026-03-05  
Escopo: integracao do front com backend para criacao de personagem (wizard) + importacao/exportacao JSON.

## 1) Runtime e operacao local

- Base URL padrao: `http://localhost:3000`
- OpenAPI JSON: `http://localhost:3000/docs/openapi.json`
- CORS esperado para front local: `http://localhost:3001`
- Auth: JWT Bearer em `Authorization: Bearer <token>`

### Erro comum: `EADDRINUSE: address already in use :::3000`

Significa que ja existe um processo usando a porta 3000.

Comandos uteis:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Alternativa sem matar processo:

```powershell
$env:PORT=3002
npm run start:dev
```

## 2) Fluxo de autenticacao para o front

1. `POST /auth/login`
2. Guardar `access_token`
3. Enviar token em todas as rotas protegidas abaixo

Resposta de login:

```json
{
  "access_token": "<jwt>",
  "usuario": {
    "id": 2,
    "email": "front.wizard.smoke@test.local",
    "apelido": "FrontSmoke",
    "role": "USUARIO"
  }
}
```

## 3) Rotas do wizard (visao funcional)

### 3.1 Leitura de catalogos/apoio

- `GET /clas`
- `GET /origens`
- `GET /classes`
- `GET /classes/:id/trilhas`
- `GET /trilhas/:id/caminhos`
- `GET /habilidades/poderes-genericos`
- `GET /personagens-base/passivas-disponiveis`
- `GET /personagens-base/tecnicas-disponiveis?claId=<id>&origemId=<id opcional>`
- `GET /personagens-base/graus-treinamento/info?nivel=<n>&intelecto=<n>`
- `POST /personagens-base/graus-treinamento/pericias-elegiveis`

### 3.2 Preview do wizard

- `POST /personagens-base/preview`
- Entrada: payload de `CreatePersonagemBaseDto`
- Saida: personagem normalizado + derivados + pericias/proficiencias + inventario validado

Comportamento importante:

- Quando item de inventario e invalido, o endpoint pode retornar `201` com `errosItens` no body.
- Ou seja: erro de item no preview nao e necessariamente HTTP 4xx.

### 3.3 Criacao final

- `POST /personagens-base`
- Entrada: payload de `CreatePersonagemBaseDto`
- Saida resumida:

```json
{
  "id": 1,
  "nome": "Smoke Wizard Base",
  "nivel": 1,
  "cla": "Sem Cla",
  "origem": "Academico",
  "classe": "Especialista",
  "trilha": null,
  "caminho": null
}
```

### 3.4 Listar e detalhar personagem

- `GET /personagens-base/meus`
- `GET /personagens-base/:id`
- `GET /personagens-base/:id?incluirInventario=true`

### 3.5 Exportar/Importar ficha

- `GET /personagens-base/:id/exportar`
- `POST /personagens-base/importar`

## 4) Contrato de dados (campos principais)

## 4.1 `CreatePersonagemBaseDto` (resumo pratico)

Campos obrigatorios:

- `nome: string`
- `nivel: number`
- `claId: number`
- `origemId: number`
- `classeId: number`
- `agilidade|forca|intelecto|presenca|vigor: number`
- `estudouEscolaTecnica: boolean`
- `atributoChaveEa: "INT" | "PRE"`
- `proficienciasCodigos: string[]`
- `grausAprimoramento: { tipoGrauCodigo: string; valor: number }[]`
- `periciasClasseEscolhidasCodigos: string[]`
- `periciasOrigemEscolhidasCodigos: string[]`
- `periciasLivresCodigos: string[]`

Campos opcionais usados no wizard:

- `trilhaId`, `caminhoId`, `tecnicaInataId`, `alinhamentoId`
- `idade`, `prestigioBase`, `prestigioClaBase`, `background`
- `grausTreinamento`
- `poderesGenericos`
- `passivasAtributoIds`, `passivasAtributosAtivos`, `passivasAtributosConfig`
- `itensInventario`

## 4.2 Export payload

`GET /personagens-base/:id/exportar` retorna:

- `schema`
- `schemaVersion`
- `exportadoEm`
- `personagem` (shape compativel com `CreatePersonagemBaseDto`)
- `referencias` (fallback para resolver ids em import)

## 4.3 Import payload

`POST /personagens-base/importar` recebe:

```json
{
  "schema": "assistenterpg.personagem-base.v1",
  "schemaVersion": 1,
  "exportadoEm": "2026-03-05T05:13:41.710Z",
  "nomeSobrescrito": "Opcional",
  "personagem": {},
  "referencias": {}
}
```

Observacoes:

- O JSON de export pode ser enviado praticamente as-is.
- `nomeSobrescrito` so deve ser enviado quando preenchido.
- Campos fora do DTO sao bloqueados por `ValidationPipe` (whitelist + forbid).

## 5) Regra de resolucao de referencias no import

Para cada entidade importada (cla, origem, classe, trilha, caminho, alinhamento, tecnica, poderes, passivas, itens/modificacoes):

1. tenta `id` do payload
2. tenta `id` da `referencia`
3. tenta `codigo` (quando aplicavel)
4. tenta `nome`
5. se obrigatorio, ou se houve tentativa e nao resolveu -> `400`

Erro tipico:

```json
{
  "statusCode": 400,
  "code": "HTTP_EXCEPTION",
  "message": "Nao foi possivel resolver a referencia de cla na importacao."
}
```

## 6) Formato de erro padrao

Envelope:

- `statusCode`
- `timestamp`
- `path`
- `method`
- `code`
- `message`
- opcionais: `details`, `field`, `stack`

## 7) Matriz de status (rotas do wizard/import-export)

- `POST /personagens-base/preview`
  - `201`: preview valido (pode conter `errosItens`)
  - `400`: validacao de entrada/regra (ex: soma de atributos)
  - `422`: regra de negocio (ex: caminho sem trilha)
- `POST /personagens-base`
  - `201`: criado
  - `400/422`: validacoes/regras
- `GET /personagens-base/:id/exportar`
  - `200`: sucesso
  - `404`: personagem nao encontrado/nao pertence ao usuario
- `POST /personagens-base/importar`
  - `201`: importado
  - `400`: payload/referencia invalida
  - `422`: regra de negocio no fluxo de criacao

## 8) Evidencias reais para o front usar

Pacote de evidencias:

- `docs/front-smoke-2026-03-05/metadata.json`
- `docs/front-smoke-2026-03-05/fixtures/*`
- `docs/front-smoke-2026-03-05/responses/*`

Arquivos mais importantes:

- `responses/export-valido.response.json`
- `responses/import-valido.response.json`
- `responses/import-referencia-invalida.response.json`
- `responses/import-json-malformado.response.json`
- `responses/preview-itens-retorna-errosItens.response.json`
- `responses/preview-erro-atributos.response.json`
- `responses/preview-erro-caminho-sem-trilha.response.json`

## 9) Pontos de atencao para o front

1. No preview, tratar `errosItens` no body como erro funcional de inventario, mesmo com HTTP 201.
2. Nao assumir que toda falha vem em `details`.
3. Fazer parse local do JSON antes de chamar `/importar`.
4. Em import, enviar `referencias` quando presentes no arquivo exportado.
5. Usar fallback de mensagens por `statusCode + code + message`.
