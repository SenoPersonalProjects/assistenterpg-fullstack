# Wizard Test Matrix (Front-only)

Data: 2026-03-05  
Objetivo: validar integracao do front com backend sem acesso ao codigo do backend.

## Ambiente

- API: `http://localhost:3000`
- CORS front local: `http://localhost:3001`
- Usuario de smoke:
  - email: `front.wizard.smoke@test.local`
  - senha: `FrontSmoke123`

## Cenarios principais

1. Login
   - rota: `POST /auth/login`
   - esperado: `201` + `access_token`
   - evidencia: `docs/front-smoke-2026-03-05/metadata.json`

2. Export valido
   - rota: `GET /personagens-base/:id/exportar`
   - fixture id: `1`
   - esperado: `200` + JSON com `schema`, `schemaVersion`, `personagem`, `referencias`
   - evidencia: `docs/front-smoke-2026-03-05/responses/export-valido.response.json`

3. Import valido
   - rota: `POST /personagens-base/importar`
   - body: `docs/front-smoke-2026-03-05/fixtures/personagem-import-valido.json`
   - esperado: `201` + `{ importado: true }`
   - evidencia: `docs/front-smoke-2026-03-05/responses/import-valido.response.json`

4. Import com referencia invalida
   - rota: `POST /personagens-base/importar`
   - body: `docs/front-smoke-2026-03-05/fixtures/personagem-import-referencia-invalida.json`
   - esperado: `400`
   - evidencia: `docs/front-smoke-2026-03-05/responses/import-referencia-invalida.response.json`

5. Import com JSON malformado
   - rota: `POST /personagens-base/importar`
   - body: JSON quebrado
   - esperado no front: bloquear antes de chamar backend
   - fallback backend: `400`
   - evidencia: `docs/front-smoke-2026-03-05/responses/import-json-malformado.response.json`

6. Preview valido com inventario invalido
   - rota: `POST /personagens-base/preview`
   - esperado atual: `201` com `errosItens` no body (nao em `details`)
   - evidencia: `docs/front-smoke-2026-03-05/responses/preview-itens-retorna-errosItens.response.json`

7. Preview com erro de validacao de atributos
   - rota: `POST /personagens-base/preview`
   - esperado: `400`, code `INVALID_ATTRIBUTE_SUM`, com `details`
   - evidencia: `docs/front-smoke-2026-03-05/responses/preview-erro-atributos.response.json`

8. Preview com erro de regra sem details
   - rota: `POST /personagens-base/preview`
   - esperado: `422`, code `WAY_REQUIRES_PATH`
   - evidencia: `docs/front-smoke-2026-03-05/responses/preview-erro-caminho-sem-trilha.response.json`

## Criterios de aceite no front

1. Exporta JSON e baixa arquivo sem corromper encoding.
2. Importa JSON valido e redireciona para detalhe do personagem criado.
3. Mostra erro amigavel para JSON malformado sem depender do backend.
4. Mostra erro amigavel para referencia invalida (`400`).
5. No preview, trata `errosItens` mesmo com status `201`.
6. Mapeia mensagens por `statusCode + code + message` com fallback.

## Regressao minima recomendada

1. Criacao normal de personagem sem import/export.
2. Preview sem itens de inventario.
3. Preview com item valido.
4. Preview com item invalido.
5. Import valido com `nomeSobrescrito`.
6. Export de personagem sem trilha/caminho.
