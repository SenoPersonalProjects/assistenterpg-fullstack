# Guia Frontend - Contrato Real de Fonte/Suplementos

## Objetivo

Documento de contrato para implementacao do front sem ambiguidade sobre `fonte` e `suplementoId` nos modulos:

- `cla`
- `classes`
- `trilhas`
- `caminhos`
- `origens`
- `equipamentos`
- `habilidades`
- `tecnicas-amaldicoadas`
- `modificacoes` (ja tinha suporte; referencia no fim)

Data de referencia deste documento: `2026-02-16`.

## 1) Status OpenAPI

- Endpoint oficial do backend: `GET /docs/openapi.json`.
- No repositorio atual, nao existe snapshot bruto versionado (`openapi.v1.<sha>.json`) com schemas completos.
- O arquivo `docs/FRONT_CONTRACT_PACKAGE/OPENAPI_SNAPSHOT_VERSIONED.md` descreve o procedimento de captura.
- Enquanto o snapshot bruto nao for anexado, este documento e o contrato operacional para o front.

### Como capturar o snapshot real

1. Subir o backend com build limpo.
2. Capturar:

```bash
curl -sS http://localhost:3000/docs/openapi.json -o openapi.v1.<commit>.json
```

3. Versionar o arquivo gerado no pacote de contrato do front.

## 2) Convencoes Globais

- `ValidationPipe` global:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
- Auth por JWT onde houver `@UseGuards(AuthGuard('jwt'))` ou `JwtAuthGuard`.
- Formato de erro padrao (com filtros globais):
  - `statusCode`, `timestamp`, `path`, `method`, `code`, `message`
  - opcional: `details`, `field`

## 3) Enums Relevantes

### `TipoFonte`

- `SISTEMA_BASE`
- `SUPLEMENTO`
- `HOMEBREW`

### `TipoHabilidade` (modulo `habilidades`)

- `RECURSO_CLASSE`
- `EFEITO_GRAU`
- `PODER_GENERICO`
- `MECANICA_ESPECIAL`
- `HABILIDADE_ORIGEM`
- `HABILIDADE_TRILHA`
- `ESCOLA_TECNICA`

### `TipoTecnicaAmaldicoada` (modulo `tecnicas-amaldicoadas`)

- `INATA`
- `NAO_INATA`

### Enums de `equipamentos`

- `TipoEquipamento`: `ARMA`, `MUNICAO`, `PROTECAO`, `ACESSORIO`, `EXPLOSIVO`, `ITEM_OPERACIONAL`, `ITEM_AMALDICOADO`, `FERRAMENTA_AMALDICOADA`, `GENERICO`
- `CategoriaEquipamento`: `CATEGORIA_0`, `CATEGORIA_4`, `CATEGORIA_3`, `CATEGORIA_2`, `CATEGORIA_1`, `ESPECIAL`
- `ComplexidadeMaldicao`: `NENHUMA`, `SIMPLES`, `COMPLEXA`
- `ProficienciaArma`: `SIMPLES`, `TATICA`, `PESADA`
- `EmpunhaduraArma`: `LEVE`, `UMA_MAO`, `DUAS_MAOS`
- `TipoArma`: `CORPO_A_CORPO`, `A_DISTANCIA`
- `SubtipoArmaDistancia`: `ARREMESSO`, `DISPARO`, `FOGO`
- `AlcanceArma`: `ADJACENTE`, `CURTO`, `MEDIO`, `LONGO`, `EXTREMO`
- `ProficienciaProtecao`: `LEVE`, `PESADA`, `ESCUDO`
- `TipoProtecao`: `VESTIVEL`, `EMPUNHAVEL`
- `TipoAcessorio`: `KIT_PERICIA`, `UTENSILIO`, `VESTIMENTA`
- `TipoExplosivo`: `GRANADA_ATORDOAMENTO`, `GRANADA_FRAGMENTACAO`, `GRANADA_FUMACA`, `GRANADA_INCENDIARIA`, `MINA_ANTIPESSOAL`
- `TipoUsoEquipamento`: `CONSUMIVEL`, `VESTIVEL`, `GERAL`
- `TipoAmaldicoado`: `ARMA`, `PROTECAO`, `ITEM`, `ARTEFATO`

## 4) Regras de Negocio de `fonte` e `suplementoId`

Regras aplicadas nos services dos modulos-alvo:

1. `suplementoId` informado exige `fonte = SUPLEMENTO`.
2. `fonte = SUPLEMENTO` exige `suplementoId`.
3. Se vier `suplementoId` e nao vier `fonte`, backend infere `fonte = SUPLEMENTO`.
4. Se nao vier nenhum dos dois na criacao, backend usa `fonte = SISTEMA_BASE`.
5. Se `suplementoId` nao existir, retorna `404`.

Observacao importante:

- `HOMEBREW` e aceito em `fonte`, mas nao existe `homebrewId` nesses modulos. O vinculo com homebrew continua em modelo separado.

## 5) Autorizacao e Escopo

### Acesso por modulo

- `classes`, `clas`, `trilhas`, `origens`, `habilidades`, `tecnicas-amaldicoadas`: exigem JWT para todas as rotas desses controllers.
- `equipamentos`: controller atual nao aplica guard no nivel de classe/metodo.

### Perfil ADMIN

- Nestes modulos de conteudo, nao ha `AdminGuard` aplicado atualmente.
- Logo, a autorizacao efetiva hoje e "usuario autenticado" (exceto `equipamentos`, que esta sem guard no controller).

### Escopo por suplementos ativos do usuario

- Listagens de conteudo (`classes`, `clas`, `trilhas`, `origens`, `habilidades`, `equipamentos`, `tecnicas`) nao filtram automaticamente por suplementos ativos do usuario.
- O recorte por suplemento ocorre apenas por filtro explicito (`fonte`, `fontes`, `suplementoId`).

## 6) Contrato de Create/Update por Modulo

Legendas:

- `obrigatorio`: campo obrigatorio no payload.
- `opcional`: pode omitir.
- `nullable`: pode enviar `null` sem quebrar validacao de DTO nesse endpoint.

### 6.1 `classes`

#### Create

- Metodo/rota: `POST /classes`
- Auth: JWT

Campos:

- `nome`: `string` (obrigatorio)
- `descricao`: `string | null` (opcional, nullable)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)

Resposta: objeto `Classe` (inclui `fonte` e `suplementoId`).

#### Update

- Metodo/rota: `PATCH /classes/:id`
- Auth: JWT

Atencao contratual:

- `UpdateClasseDto` atual nao possui decorators de validacao.
- Com `ValidationPipe` (`whitelist + forbidNonWhitelisted`), payloads com campos podem ser barrados antes do service.
- O service possui logica para `nome`, `descricao`, `fonte`, `suplementoId`, mas o DTO atual precisa ajuste para contrato ficar estavel.

### 6.2 `clas`

#### Create

- Metodo/rota: `POST /clas`
- Auth: JWT

Campos:

- `nome`: `string` (obrigatorio)
- `descricao`: `string` (opcional, nullable)
- `grandeCla`: `boolean` (obrigatorio)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)
- `tecnicasHereditariasIds`: `number[]` (opcional)

#### Update

- Metodo/rota: `PATCH /clas/:id`
- Auth: JWT
- DTO: `Partial<CreateClaDto>`

Campos identicos ao create, todos opcionais.

### 6.3 `trilhas`

#### Create trilha

- Metodo/rota: `POST /trilhas`
- Auth: JWT

Campos:

- `classeId`: `number` (obrigatorio)
- `nome`: `string` (obrigatorio)
- `descricao`: `string` (opcional, nullable)
- `requisitos`: `any` (opcional, nullable)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)
- `habilidades`: array opcional de:
  - `habilidadeId`: `number` (obrigatorio)
  - `nivelConcedido`: `number` (obrigatorio)
  - `caminhoId`: `number` (opcional)

#### Update trilha

- Metodo/rota: `PATCH /trilhas/:id`
- Auth: JWT
- DTO: `Partial<CreateTrilhaDto>`

#### Create caminho

- Metodo/rota: `POST /trilhas/caminhos`
- Auth: JWT

Campos:

- `trilhaId`: `number` (obrigatorio)
- `nome`: `string` (obrigatorio)
- `descricao`: `string` (opcional, nullable)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)
- `habilidades`: array opcional de:
  - `habilidadeId`: `number` (obrigatorio)
  - `nivelConcedido`: `number` (obrigatorio)

#### Update caminho

- Metodo/rota: `PATCH /trilhas/caminhos/:id`
- Auth: JWT
- DTO: `Partial<CreateCaminhoDto>`

### 6.4 `origens`

#### Create

- Metodo/rota: `POST /origens`
- Auth: JWT

Campos:

- `nome`: `string` (obrigatorio)
- `descricao`: `string` (opcional, nullable)
- `requisitosTexto`: `string` (opcional, nullable)
- `requerGrandeCla`: `boolean` (opcional)
- `requerTecnicaHeriditaria`: `boolean` (opcional)
- `bloqueiaTecnicaHeriditaria`: `boolean` (opcional)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)
- `pericias`: array opcional de:
  - `periciaId`: `number` (obrigatorio)
  - `tipo`: `'FIXA' | 'ESCOLHA'` (obrigatorio)
  - `grupoEscolha`: `number` (opcional)
- `habilidadesIds`: `number[]` (opcional)

#### Update

- Metodo/rota: `PATCH /origens/:id`
- Auth: JWT
- DTO: `Partial<CreateOrigemDto>`

### 6.5 `habilidades`

#### Create

- Metodo/rota: `POST /habilidades`
- Auth: JWT

Campos:

- `nome`: `string` (obrigatorio)
- `descricao`: `string` (opcional, nullable)
- `tipo`: `TipoHabilidade` (obrigatorio)
- `origem`: `string` (opcional, nullable)
- `requisitos`: `any` (opcional, nullable)
- `mecanicasEspeciais`: `any` (opcional, nullable)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional, `>= 1`)
- `efeitosGrau`: array opcional de:
  - `tipoGrauCodigo`: `string` (obrigatorio)
  - `valor`: `number` (opcional)
  - `escalonamentoPorNivel`: `any` (opcional)

#### Update

- Metodo/rota: `PATCH /habilidades/:id`
- Auth: JWT
- DTO: `Partial<CreateHabilidadeDto>`

### 6.6 `equipamentos`

#### Create

- Metodo/rota: `POST /equipamentos`
- Auth: sem guard no controller atual

Base obrigatoria:

- `codigo`: `string`
- `nome`: `string`
- `tipo`: `TipoEquipamento`

Base opcional:

- `descricao`: `string`
- `fonte`: `TipoFonte`
- `suplementoId`: `number` (`>= 1`)
- `categoria`: `CategoriaEquipamento`
- `espacos`: `number`
- `complexidadeMaldicao`: `ComplexidadeMaldicao`
- `tipoUso`: `TipoUsoEquipamento`
- `tipoAmaldicoado`: `TipoAmaldicoado`
- `efeito`: `string`
- `efeitoMaldicao`: `string`
- `requerFerramentasAmaldicoadas`: `boolean`

Campos de arma (quando aplicavel):

- `proficienciaArma`, `empunhaduras[]`, `tipoArma`, `subtipoDistancia`, `agil`, `criticoValor`, `criticoMultiplicador`, `alcance`, `tipoMunicaoCodigo`, `habilidadeEspecial`

Campos de protecao (quando aplicavel):

- `proficienciaProtecao`, `tipoProtecao`, `bonusDefesa`, `penalidadeCarga`

Campos de municao (quando aplicavel):

- `duracaoCenas`, `recuperavel`

Campos de acessorio (quando aplicavel):

- `tipoAcessorio`, `periciaBonificada`, `bonusPericia`, `requereEmpunhar`, `maxVestimentas`

Campos de explosivo (quando aplicavel):

- `tipoExplosivo`

#### Update

- Metodo/rota: `PUT /equipamentos/:id`
- Auth: sem guard no controller atual
- DTO: mesmos campos do create, todos opcionais

### 6.7 `tecnicas-amaldicoadas`

#### Create tecnica

- Metodo/rota: `POST /tecnicas-amaldicoadas`
- Auth: JWT

Campos:

- `codigo`: `string` (obrigatorio)
- `nome`: `string` (obrigatorio)
- `descricao`: `string` (obrigatorio)
- `tipo`: `TipoTecnicaAmaldicoada` (obrigatorio)
- `hereditaria`: `boolean` (opcional)
- `clasHereditarios`: `string[]` (opcional; nomes de cla)
- `linkExterno`: `string` (opcional, nullable)
- `fonte`: `TipoFonte` (opcional)
- `suplementoId`: `number` (opcional)
- `requisitos`: `any` (opcional, nullable)

Observacao:

- Diferente dos outros modulos, o DTO atual de tecnica nao aplica `@Min(1)` em `suplementoId`.

#### Update tecnica

- Metodo/rota: `PATCH /tecnicas-amaldicoadas/:id`
- Auth: JWT
- DTO: `Partial<CreateTecnicaDto>` sem `codigo` (`codigo` nao atualiza)

Campos de habilidade tecnica e variacao continuam sem `fonte` proprio (herdam da tecnica pai).

## 7) Contrato de Listagem por Modulo

### Matriz (rota, query params, paginacao, shape)

- `GET /classes`
  - query: nenhuma
  - paginacao: nao
  - resposta: `ClasseCatalogoDto[]`

- `GET /clas`
  - query: nenhuma
  - paginacao: nao
  - resposta: `Cla[]` com includes (`tecnicasHereditarias`, `_count`)

- `GET /trilhas`
  - query: `classeId?: number`
  - paginacao: nao
  - resposta: `Trilha[]` com includes

- `GET /trilhas/:id/caminhos`
  - query: nenhuma
  - paginacao: nao
  - resposta: array simples mapeado (`id`, `nome`, `descricao`, `trilhaId`)

- `GET /origens`
  - query: nenhuma
  - paginacao: nao
  - resposta: `Origem[]` com includes + `habilidadesIniciais`

- `GET /habilidades`
  - query:
    - `tipo?: TipoHabilidade`
    - `origem?: string`
    - `fonte?: TipoFonte`
    - `suplementoId?: number`
    - `busca?: string`
    - `pagina?: number` (default 1)
    - `limite?: number` (default 20)
  - paginacao: sim
  - resposta:

```json
{
  "dados": ["..."],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 100,
    "totalPaginas": 5
  }
}
```

- `GET /equipamentos`
  - query:
    - `tipo?: TipoEquipamento`
    - `fontes?: TipoFonte[]` (aceita CSV `SISTEMA_BASE,SUPLEMENTO` ou repetido `fontes=SISTEMA_BASE&fontes=SUPLEMENTO`)
    - `suplementoId?: number`
    - `complexidadeMaldicao?: ComplexidadeMaldicao`
    - `proficienciaArma?: ProficienciaArma`
    - `proficienciaProtecao?: ProficienciaProtecao`
    - `alcance?: AlcanceArma`
    - `tipoAcessorio?: TipoAcessorio`
    - `categoria?: number`
    - `apenasAmaldicoados?: boolean`
    - `busca?: string`
    - `pagina?: number` (default 1)
    - `limite?: number` (default 20)
  - paginacao: sim
  - resposta: envelope `{ dados, paginacao }`

- `GET /tecnicas-amaldicoadas`
  - query:
    - `nome?: string`
    - `codigo?: string`
    - `tipo?: TipoTecnicaAmaldicoada`
    - `hereditaria?: boolean`
    - `claId?: number`
    - `claNome?: string`
    - `fonte?: TipoFonte`
    - `suplementoId?: number`
    - `incluirHabilidades?: boolean`
    - `incluirClas?: boolean`
  - paginacao: nao
  - resposta: `TecnicaDetalhadaDto[]`

## 8) Onde `fonte` e `suplementoId` voltam na resposta

- `classes`:
  - `GET /classes`: sim
  - `GET /classes/:id`: sim
- `clas`:
  - `GET /clas`: sim (escalares do model)
  - `GET /clas/:id`: sim
- `trilhas`:
  - `GET /trilhas`: sim no objeto `trilha`
  - `GET /trilhas/:id`: sim no objeto `trilha`
  - `GET /trilhas/:id/caminhos`: nao (mapper atual nao inclui)
- `origens`:
  - `GET /origens`: sim
  - `GET /origens/:id`: sim
- `habilidades`:
  - `GET /habilidades`: sim
  - `GET /habilidades/:id`: sim
- `equipamentos`:
  - `GET /equipamentos`: sim (`EquipamentoResumoDto`)
  - `GET /equipamentos/:id`: sim (`EquipamentoDetalhadoDto`)
  - `GET /equipamentos/codigo/:codigo`: sim
- `tecnicas-amaldicoadas`:
  - `GET /tecnicas-amaldicoadas`: sim
  - `GET /tecnicas-amaldicoadas/:id`: sim
  - `GET /tecnicas-amaldicoadas/codigo/:codigo`: sim

## 9) Regras de PATCH/UPDATE envolvendo `fonte`

Regra pratica em todos os modulos com suporte:

- Se enviar apenas `suplementoId`, backend infere `fonte = SUPLEMENTO`.
- Se enviar `fonte = SUPLEMENTO` sem `suplementoId`, erro `400`.
- Para migrar de `SUPLEMENTO -> SISTEMA_BASE` (ou `HOMEBREW`), envie os dois no mesmo update:
  - `fonte` novo
  - `suplementoId: null`

Exemplos:

1. Estado atual: `fonte=SUPLEMENTO`, `suplementoId=3`
   - payload: `{ "fonte": "SISTEMA_BASE" }`
   - resultado: `400` (ainda existe `suplementoId` final)

2. Estado atual: `fonte=SUPLEMENTO`, `suplementoId=3`
   - payload: `{ "suplementoId": null }`
   - resultado: `400` (`fonte` final continua `SUPLEMENTO`)

3. Estado atual: `fonte=SUPLEMENTO`, `suplementoId=3`
   - payload: `{ "fonte": "SISTEMA_BASE", "suplementoId": null }`
   - resultado: sucesso

4. Estado atual: `fonte=SISTEMA_BASE`, `suplementoId=null`
   - payload: `{ "suplementoId": 5 }`
   - resultado: sucesso, `fonte` vira `SUPLEMENTO`

## 10) Erros Padronizados (com exemplos)

### 10.1 Erro 400 de combinacao invalida `fonte/suplementoId`

Exemplo de payload de resposta:

```json
{
  "statusCode": 400,
  "timestamp": "2026-02-16T12:00:00.000Z",
  "path": "/habilidades",
  "method": "POST",
  "code": "HTTP_EXCEPTION",
  "message": "Quando suplementoId for informado, fonte deve ser SUPLEMENTO",
  "details": {
    "message": "Quando suplementoId for informado, fonte deve ser SUPLEMENTO",
    "error": "Bad Request",
    "statusCode": 400
  }
}
```

Outra mensagem de 400 valida para essa regra:

- `fonte SUPLEMENTO exige suplementoId`

### 10.2 Erro 404 de suplemento inexistente

Para `classes`, `clas`, `trilhas`, `origens`, `habilidades`, `equipamentos`:

```json
{
  "statusCode": 404,
  "timestamp": "2026-02-16T12:00:00.000Z",
  "path": "/equipamentos",
  "method": "POST",
  "code": "SUPLEMENTO_NOT_FOUND",
  "message": "Suplemento nao encontrado",
  "details": {
    "identificador": 999
  }
}
```

Para `tecnicas-amaldicoadas`:

```json
{
  "statusCode": 404,
  "timestamp": "2026-02-16T12:00:00.000Z",
  "path": "/tecnicas-amaldicoadas",
  "method": "POST",
  "code": "TECNICA_SUPLEMENTO_NOT_FOUND",
  "message": "Suplemento com ID 999 nao encontrado",
  "details": {
    "suplementoId": 999
  }
}
```

## 11) Exemplos Rapidos de Request/Response

### Create de suplemento content (habilidade)

Request:

```json
{
  "nome": "Ataque Coordenado",
  "tipo": "PODER_GENERICO",
  "descricao": "Descricao...",
  "suplementoId": 3
}
```

Response (trecho):

```json
{
  "id": 100,
  "nome": "Ataque Coordenado",
  "tipo": "PODER_GENERICO",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

### Listagem paginada (equipamentos)

Request:

`GET /equipamentos?fontes=SISTEMA_BASE,SUPLEMENTO&suplementoId=3&pagina=1&limite=20`

Response (trecho):

```json
{
  "dados": [
    {
      "id": 1,
      "codigo": "ESPADA_X",
      "nome": "Espada X",
      "fonte": "SUPLEMENTO",
      "suplementoId": 3
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 1,
    "totalPaginas": 1
  }
}
```

## 12) Modificacoes

`modificacoes` ja possui suporte a `fonte/suplementoId` e filtros por fonte/suplemento.
Nao houve mudanca estrutural adicional neste patch para esse modulo.

## 13) Pendencias recomendadas (backend)

1. Corrigir `UpdateClasseDto` para refletir o contrato real de update.
2. Publicar snapshot bruto real do OpenAPI (`openapi.v1.<commit>.json`) junto ao pacote do front.
3. Decidir e documentar se `equipamentos` deve exigir JWT/Admin, alinhando com os demais modulos.
4. Opcional: padronizar `@Min(1)` em `suplementoId` de `Create/UpdateTecnicaDto`.

## 14) Exemplos por modulo (Create/Update/List)

Observacao: respostas abaixo sao "trechos" com campos-chave para o front.

### 14.1 classes

Create (`POST /classes`):

```json
{
  "nome": "Sentinela Arcano",
  "descricao": "Classe do suplemento X",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

Update (`PATCH /classes/:id`) - intencao de limpar suplemento:

```json
{
  "fonte": "SISTEMA_BASE",
  "suplementoId": null
}
```

List (`GET /classes`) response trecho:

```json
[
  {
    "id": 10,
    "nome": "Sentinela Arcano",
    "fonte": "SUPLEMENTO",
    "suplementoId": 3
  }
]
```

### 14.2 clas

Create (`POST /clas`):

```json
{
  "nome": "Kakyn",
  "grandeCla": true,
  "fonte": "SUPLEMENTO",
  "suplementoId": 3,
  "tecnicasHereditariasIds": [12]
}
```

Update (`PATCH /clas/:id`):

```json
{
  "descricao": "Descricao atualizada",
  "fonte": "HOMEBREW",
  "suplementoId": null
}
```

List (`GET /clas`) response trecho:

```json
[
  {
    "id": 4,
    "nome": "Kakyn",
    "grandeCla": true,
    "fonte": "SUPLEMENTO",
    "suplementoId": 3
  }
]
```

### 14.3 trilhas

Create trilha (`POST /trilhas`):

```json
{
  "classeId": 10,
  "nome": "Guardiao das Runas",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

Update trilha (`PATCH /trilhas/:id`):

```json
{
  "nome": "Guardiao das Runas Avancado",
  "suplementoId": 5
}
```

List trilhas (`GET /trilhas?classeId=10`) response trecho:

```json
[
  {
    "id": 22,
    "classeId": 10,
    "nome": "Guardiao das Runas",
    "fonte": "SUPLEMENTO",
    "suplementoId": 3
  }
]
```

Create caminho (`POST /trilhas/caminhos`):

```json
{
  "trilhaId": 22,
  "nome": "Caminho da Lamina",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

Update caminho (`PATCH /trilhas/caminhos/:id`):

```json
{
  "fonte": "SISTEMA_BASE",
  "suplementoId": null
}
```

List caminhos (`GET /trilhas/:id/caminhos`) response trecho:

```json
[
  {
    "id": 30,
    "nome": "Caminho da Lamina",
    "descricao": "...",
    "trilhaId": 22
  }
]
```

### 14.4 origens

Create (`POST /origens`):

```json
{
  "nome": "Filho das Dunas",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3,
  "pericias": [
    { "periciaId": 1, "tipo": "FIXA" }
  ],
  "habilidadesIds": [100]
}
```

Update (`PATCH /origens/:id`):

```json
{
  "bloqueiaTecnicaHeriditaria": true,
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

List (`GET /origens`) response trecho:

```json
[
  {
    "id": 7,
    "nome": "Filho das Dunas",
    "fonte": "SUPLEMENTO",
    "suplementoId": 3,
    "habilidadesIniciais": []
  }
]
```

### 14.5 habilidades

Create (`POST /habilidades`):

```json
{
  "nome": "Golpe Harmonico",
  "tipo": "PODER_GENERICO",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

Update (`PATCH /habilidades/:id`):

```json
{
  "fonte": "SISTEMA_BASE",
  "suplementoId": null
}
```

List (`GET /habilidades?fonte=SUPLEMENTO&suplementoId=3&pagina=1&limite=20`) response trecho:

```json
{
  "dados": [
    {
      "id": 100,
      "nome": "Golpe Harmonico",
      "tipo": "PODER_GENERICO",
      "fonte": "SUPLEMENTO",
      "suplementoId": 3
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 1,
    "totalPaginas": 1
  }
}
```

### 14.6 equipamentos

Create (`POST /equipamentos`):

```json
{
  "codigo": "ESPADA_X",
  "nome": "Espada X",
  "tipo": "ARMA",
  "fonte": "SUPLEMENTO",
  "suplementoId": 3,
  "proficienciaArma": "SIMPLES"
}
```

Update (`PUT /equipamentos/:id`):

```json
{
  "fonte": "SISTEMA_BASE",
  "suplementoId": null
}
```

List (`GET /equipamentos?fontes=SISTEMA_BASE,SUPLEMENTO&suplementoId=3`) response trecho:

```json
{
  "dados": [
    {
      "id": 1,
      "codigo": "ESPADA_X",
      "nome": "Espada X",
      "fonte": "SUPLEMENTO",
      "suplementoId": 3
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 1,
    "totalPaginas": 1
  }
}
```

### 14.7 tecnicas-amaldicoadas

Create tecnica (`POST /tecnicas-amaldicoadas`):

```json
{
  "codigo": "TEC_KAKYN_01",
  "nome": "Danca de Areia",
  "descricao": "...",
  "tipo": "INATA",
  "hereditaria": true,
  "clasHereditarios": ["Kakyn"],
  "fonte": "SUPLEMENTO",
  "suplementoId": 3
}
```

Update tecnica (`PATCH /tecnicas-amaldicoadas/:id`):

```json
{
  "fonte": "HOMEBREW",
  "suplementoId": null
}
```

List (`GET /tecnicas-amaldicoadas?fonte=SUPLEMENTO&suplementoId=3`) response trecho:

```json
[
  {
    "id": 12,
    "codigo": "TEC_KAKYN_01",
    "nome": "Danca de Areia",
    "fonte": "SUPLEMENTO",
    "suplementoId": 3
  }
]
```
