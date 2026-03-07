# Confirmacoes de Contrato - Wizard / Import-Export

Data: 2026-03-05

## 1) Parser de erro do preview (confirmacao explicita)

Estado atual do backend:

1. `POST /personagens-base/preview` com item invalido de inventario retorna `201` com `errosItens` **top-level** no body.
2. O backend **nao** retorna `details.errosItens` em erro HTTP para preview.
3. Em erros HTTP de preview:
   - pode vir com `details` (ex.: `400 INVALID_ATTRIBUTE_SUM`)
   - pode vir sem `details` (ex.: `422 WAY_REQUIRES_PATH`)

Parser recomendado no front (ordem):

1. Se `status` for `201` e existir `body.errosItens`, tratar como erro funcional de inventario no preview.
2. Em erro HTTP, usar `details` quando existir.
3. Fallback sempre por `code` + `message`.

## 2) `errosItens` em sucesso 201 (confirmacao explicita)

Sim: continua top-level no body em `201`:

- `body.errosItens: Array<{ equipamentoId: number; erro: string }>`

Evidencia:

- `docs/front-smoke-2026-03-05/responses/preview-itens-retorna-errosItens.response.json`
- `docs/front-smoke-2026-03-05/scenarios/preview-201-errosItens.request-response.json`

## 3) `espacosInventario` (garantias de contrato)

Quando preview retorna sucesso (`201`), `espacosInventario` vem com:

- `base: number`
- `extra: number`
- `total: number`

Campos considerados minimos/garantidos no sucesso do preview:

- `espacosInventario.base`
- `espacosInventario.extra`
- `espacosInventario.total`

Em erros HTTP (`400`/`422`), `espacosInventario` pode nao existir no body de erro (normal).

## 4) Respostas reais atualizadas pedidas

Arquivos request+response completos:

1. Preview com erro global (`422`)
   - `docs/front-smoke-2026-03-05/scenarios/preview-422-erro-global.request-response.json`
2. Preview com `201` + `errosItens`
   - `docs/front-smoke-2026-03-05/scenarios/preview-201-errosItens.request-response.json`
3. Import com referencia invalida (`400`)
   - `docs/front-smoke-2026-03-05/scenarios/importar-400-referencia-invalida.request-response.json`

## 5) Ambiente de revisao desta rodada

- Porta final em execucao: `3000`
- Base URL recomendada para smoke: `http://localhost:3000`
- Valor recomendado no front:
  - `NEXT_PUBLIC_API_URL=http://localhost:3000`

Observacao operacional:

- Existe fallback automatico de porta no backend em dev.
- Para smoke deterministico no front, manter backend em porta fixa `3000`:

```powershell
$env:PORT=3000
$env:PORT_AUTO_RETRY=false
npm run start:dev
```
