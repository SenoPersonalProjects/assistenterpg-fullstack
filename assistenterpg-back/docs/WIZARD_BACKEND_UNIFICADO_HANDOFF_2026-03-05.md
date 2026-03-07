# Wizard de Personagem (Backend) - Handoff Unificado para Front

Data: 2026-03-05  
Escopo: tudo que o front precisa para integrar o wizard de criacao, preview, revisao, exportacao e importacao de personagem-base sem acesso ao codigo backend.

## 1) Como usar este documento

Ordem recomendada:

1. Este documento (visao completa do modulo wizard).
2. `docs/front-smoke-2026-03-05/README.md` (onde estao fixtures e respostas reais).
3. `http://localhost:3000/docs/openapi.json` (fonte oficial de contrato).

## 2) Ambiente e operacao local

- Base URL padrao: `http://localhost:3000`
- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /docs/openapi.json`
- CORS esperado para front local: `http://localhost:3001`
- Auth: JWT Bearer (`Authorization: Bearer <token>`)

## 3) Correcao do erro de porta (`EADDRINUSE`)

### Problema

Erro:

`listen EADDRINUSE: address already in use :::3000`

Isso acontece quando ja existe processo escutando a porta 3000 (ex.: outra instancia do backend aberta).

### Correcao aplicada no backend

Foi implementado fallback automatico de porta no bootstrap (`src/main.ts`):

- Em dev, se a porta preferencial estiver ocupada, o backend tenta a proxima porta automaticamente.
- Tentativas controladas por:
  - `PORT_AUTO_RETRY` (`true|false`)
  - `PORT_AUTO_RETRY_MAX` (default `10`)
- Em producao, fallback automatico pode ser desativado por `PORT_AUTO_RETRY=false`.

### Como resolver manualmente (quando quiser manter porta fixa 3000)

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Ou subir em outra porta:

```powershell
$env:PORT=3002
npm run start:dev
```

## 4) Rotas do wizard/import-export (contrato funcional)

Todas protegidas por JWT.

### 4.1 Criacao e preview

- `POST /personagens-base`
- `POST /personagens-base/preview`

### 4.2 Rotas auxiliares do wizard

- `GET /personagens-base/graus-treinamento/info`
- `POST /personagens-base/graus-treinamento/pericias-elegiveis`
- `GET /personagens-base/passivas-disponiveis`
- `GET /personagens-base/tecnicas-disponiveis`

### 4.3 Gestao basica

- `GET /personagens-base/meus`
- `GET /personagens-base/:id`
- `PATCH /personagens-base/:id`
- `DELETE /personagens-base/:id`

### 4.4 Compartilhamento por JSON

- `GET /personagens-base/:id/exportar`
- `POST /personagens-base/importar`

## 5) Tipo de dados de entrada (payload de wizard)

Base: `CreatePersonagemBaseDto`

Campos principais:

- Identificacao:
  - `nome`, `nivel`
- Selecao principal:
  - `claId`, `origemId`, `classeId`, `trilhaId?`, `caminhoId?`
- Atributos:
  - `agilidade`, `forca`, `intelecto`, `presenca`, `vigor`
- Flags/meta:
  - `estudouEscolaTecnica`, `atributoChaveEa`, `idade?`, `background?`, `prestigioBase?`, `alinhamentoId?`, `tecnicaInataId?`
- Escolhas do sistema:
  - `proficienciasCodigos[]`
  - `grausAprimoramento[]`
  - `grausTreinamento[]`
  - `poderesGenericos[]`
  - `passivasAtributoIds[]`
  - `passivasAtributosAtivos[]`
  - `passivasAtributosConfig`
  - `periciasClasseEscolhidasCodigos[]`
  - `periciasOrigemEscolhidasCodigos[]`
  - `periciasLivresCodigos[]`
- Inventario (wizard):
  - `itensInventario[]` com `equipamentoId`, `quantidade`, `equipado?`, `modificacoesIds?`, `nomeCustomizado?`, `notas?`

## 6) Logica backend do wizard (fim a fim)

## 6.1 Preview (`POST /personagens-base/preview`)

1. Valida DTO.
2. Executa engine de personagem com `strictPassivas: false`.
3. Calcula derivados, habilidades, pericias, proficiencias.
4. Valida inventario em lote via `InventarioService.previewItensInventario`.
5. Se lote falhar, faz fallback item-a-item para retornar erros localizados.
6. Retorna objeto de preview consolidado.

### Comportamento importante para o front

Quando ha item invalido de inventario no preview:

- pode retornar `201` com `errosItens` no corpo (nao necessariamente 4xx).
- o front deve tratar `errosItens` como erro funcional de inventario na UI.

## 6.2 Criacao final (`POST /personagens-base`)

1. Remove `itensInventario` do DTO base para evitar duplicacao.
2. Executa engine (`strictPassivas: true`).
3. Persiste base + relacoes de personagem.
4. Adiciona inventario exclusivamente via `InventarioService.adicionarItem`.
5. Retorna resumo da ficha criada.

## 6.3 Export (`GET /personagens-base/:id/exportar`)

Retorna:

- `schema`
- `schemaVersion`
- `exportadoEm`
- `personagem` (shape compativel com create)
- `referencias` (fallback para resolver IDs em outro ambiente/base)

Ponto relevante:

- `grausAprimoramento` sao exportados como `valorLivre` (sem duplicar bonus na reimportacao).

## 6.4 Import (`POST /personagens-base/importar`)

Entrada:

- `schema?`, `schemaVersion?`, `exportadoEm?`
- `nomeSobrescrito?`
- `personagem`
- `referencias?`

Processo:

1. Le `personagem`.
2. Resolve IDs por referencia com fallback:
   - id atual -> id referencia -> codigo -> nome
3. Se obrigatorio ou houve tentativa e nao resolveu -> erro `400`.
4. Monta DTO final.
5. Reusa fluxo de `criar` (mesmas regras do wizard).

## 7) Contrato de erro para o front

Envelope padrao:

- `statusCode`
- `timestamp`
- `path`
- `method`
- `code`
- `message`
- opcionais: `details`, `field`, `stack` (ambiente de dev)

Exemplos reais:

- `400` com `details`: `INVALID_ATTRIBUTE_SUM`
- `422` sem `details`: `WAY_REQUIRES_PATH`
- `400` import referencia invalida: mensagem de resolucao de referencia

Arquivos de evidencia:

- `docs/front-smoke-2026-03-05/responses/preview-erro-atributos.response.json`
- `docs/front-smoke-2026-03-05/responses/preview-erro-caminho-sem-trilha.response.json`
- `docs/front-smoke-2026-03-05/responses/import-referencia-invalida.response.json`

## 8) Import/export: regras que o front deve seguir

1. O JSON exportado pode ser reenviado quase as-is.
2. `nomeSobrescrito` so enviar se usuario preencher.
3. Preservar `referencias` quando existirem.
4. Fazer parse local do arquivo JSON antes de chamar backend.
5. Se parse local falhar, bloquear envio e mostrar erro amigavel.

## 9) Pacote de smoke (pronto para QA/front)

Local:

- `docs/front-smoke-2026-03-05/`

Conteudo:

- `fixtures/personagem-export-valido.json`
- `fixtures/personagem-import-valido.json`
- `fixtures/personagem-import-referencia-invalida.json`
- `responses/*.response.json`
- `scenarios/*.request-response.json` (request+response completos dos cenarios criticos)
- `metadata.json`
- `curl-snippets.txt`

Confirmacoes explicitas de contrato (parser/erros/espacos):

- `docs/WIZARD_CONTRATO_CONFIRMACOES_2026-03-05.md`

## 10) Status e codigos esperados (resumo rapido)

- `GET /personagens-base/:id/exportar`
  - `200` sucesso
  - `404` nao encontrado/nao pertence ao usuario

- `POST /personagens-base/importar`
  - `201` sucesso
  - `400` payload/referencia invalida
  - `422` regra de negocio da criacao

- `POST /personagens-base/preview`
  - `201` preview gerado (inclusive com `errosItens`)
  - `400` validacao
  - `422` regra de negocio

## 11) Checklist de implementacao front (wizard)

1. Botao `Exportar JSON` na pagina de detalhe.
2. Botao `Importar JSON` na listagem/entrada do fluxo.
3. Modal de import com:
   - upload `.json`
   - parse local
   - preview minimo
   - `nomeSobrescrito` opcional
4. Tratamento de erro por `statusCode + code + message`.
5. No preview do wizard, renderizar `errosItens` mesmo com status `201`.
6. Redirecionar para detalhe da nova ficha apos import `201`.

## 12) Mensagem pronta para o agente do front

Use:

- `docs/FRONT_AGENT_MESSAGE_WIZARD_BACKEND_2026-03-05.md`

Esse arquivo ja contem instrucoes objetivas para copiar e colar no agente do front.
