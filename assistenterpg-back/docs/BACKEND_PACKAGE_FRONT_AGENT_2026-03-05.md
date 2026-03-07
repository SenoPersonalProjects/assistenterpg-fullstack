# Pacote para agente do front (wizard import/export)

Data de geração: 2026-03-05

## 1) Ambiente de teste acessível

- Base URL da API: `http://localhost:3000`
- OpenAPI JSON atual: `http://localhost:3000/docs/openapi.json`
- CORS para front em `http://localhost:3001`: **confirmado**
  - evidência em: `docs/front-smoke-2026-03-05/responses/cors-preflight-localhost-3001.response.json`
- Backend em execução para smoke: `npm run start:dev`

## 2) Credenciais e fixtures

- Usuário de smoke:
  - email: `front.wizard.smoke@test.local`
  - senha: `FrontSmoke123`
  - role: `USUARIO`
  - userId: `2`
- Personagem-base fixture (para export):
  - id: `1`
  - nome: `Smoke Wizard Base`

Metadados completos:
- `docs/front-smoke-2026-03-05/metadata.json`

## 3) Contrato real de erro do preview (`POST /personagens-base/preview`)

Observação importante:
- Hoje **não existe** payload de erro HTTP com `details.errosItens` no endpoint de preview.
- Quando há item inválido de inventário, o backend retorna **201** com `errosItens` no corpo de sucesso.

Exemplos reais capturados:

1. Caso com `errosItens` (no body de sucesso, não em `details`)
   - arquivo: `docs/front-smoke-2026-03-05/responses/preview-itens-retorna-errosItens.response.json`
   - status: `201`

2. Erro com `details` sem `errosItens`
   - arquivo: `docs/front-smoke-2026-03-05/responses/preview-erro-atributos.response.json`
   - status: `400`
   - code: `INVALID_ATTRIBUTE_SUM`

3. Erro só com `code/message` (sem `details`)
   - arquivo: `docs/front-smoke-2026-03-05/responses/preview-erro-caminho-sem-trilha.response.json`
   - status: `422`
   - code: `WAY_REQUIRES_PATH`

## 4) Contrato real de importação (`POST /personagens-base/importar`)

Confirmações:
- JSON de export pode ser enviado praticamente **as is**: **sim**
  - após ajuste para aceitar `referencias.personagemIdOriginal`.
- `nomeSobrescrito`: enviar apenas quando preenchido: **sim**.
- `referencias`: preservar e enviar quando existir: **sim**.
- Campos proibidos/ignorados:
  - campos não previstos no DTO são rejeitados por `ValidationPipe` (`forbidNonWhitelisted: true`).
  - `passivasAtributoIds` no payload é aceito no DTO, mas não é gravado como coluna direta (sanitizado no persistence).

## 5) Cenários para smoke test (request + resposta esperada)

a) Export válido
- request: `GET /personagens-base/1/exportar`
- status esperado: `200`
- response real: `docs/front-smoke-2026-03-05/responses/export-valido.response.json`

b) Import válido
- request body: `docs/front-smoke-2026-03-05/fixtures/personagem-import-valido.json`
- status esperado: `201`
- response real: `docs/front-smoke-2026-03-05/responses/import-valido.response.json`

c) Import inválido (JSON quebrado no cliente)
- esperado no front: falhar no parse local e não chamar backend.
- fallback se bater no backend com JSON malformado: `400`
- response real: `docs/front-smoke-2026-03-05/responses/import-json-malformado.response.json`

d) Import com referência inválida
- request body: `docs/front-smoke-2026-03-05/fixtures/personagem-import-referencia-invalida.json`
- status esperado: `400`
- response real: `docs/front-smoke-2026-03-05/responses/import-referencia-invalida.response.json`

## 6) Arquivos de teste entregues

Fixtures:
- `docs/front-smoke-2026-03-05/fixtures/personagem-export-valido.json`
- `docs/front-smoke-2026-03-05/fixtures/personagem-import-valido.json`
- `docs/front-smoke-2026-03-05/fixtures/personagem-import-referencia-invalida.json`

Respostas capturadas:
- `docs/front-smoke-2026-03-05/responses/*.json`

Snippets de requisição:
- `docs/front-smoke-2026-03-05/curl-snippets.txt`

## 7) Ajustes aplicados no backend para viabilizar smoke

1. Sanitização no persistence para não tentar persistir `passivasAtributoIds` como coluna de `personagemBase`.
2. DTO de import atualizado para aceitar `referencias.personagemIdOriginal` (compatível com export as-is).
3. Ordem dos filtros globais ajustada para preservar status/codes HTTP corretos em vez de cair em `500 INTERNAL_ERROR`.
