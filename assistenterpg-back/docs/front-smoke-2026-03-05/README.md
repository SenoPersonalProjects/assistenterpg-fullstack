# Front Smoke Package

Data de geracao: 2026-03-05

Este pacote contem fixtures e respostas reais capturadas para integrar o front sem acesso ao codigo backend.

## Estrutura

- `metadata.json`
  - base URL
  - usuario de smoke
  - personagem fixture
  - observacoes de contrato

- `fixtures/`
  - `personagem-export-valido.json`
  - `personagem-import-valido.json`
  - `personagem-import-referencia-invalida.json`

- `responses/`
  - `export-valido.response.json`
  - `import-valido.response.json`
  - `import-referencia-invalida.response.json`
  - `import-json-malformado.response.json`
  - `preview-itens-retorna-errosItens.response.json`
  - `preview-erro-atributos.response.json`
  - `preview-erro-caminho-sem-trilha.response.json`
  - `cors-preflight-localhost-3001.response.json`

- `scenarios/` (request + response completos)
  - `preview-201-errosItens.request-response.json`
  - `preview-422-erro-global.request-response.json`
  - `importar-400-referencia-invalida.request-response.json`

- `curl-snippets.txt`
  - exemplos de chamadas para reproducao manual

## Notas importantes

1. Preview de inventario invalido atualmente retorna `201` com `errosItens` no body.
2. Nao existe hoje payload de erro HTTP com `details.errosItens` em `/personagens-base/preview`.
3. Para esta rodada de smoke, usar `NEXT_PUBLIC_API_URL=http://localhost:3000`.
