# OpenAPI Snapshot Versionado

## Baseline oficial

- Commit: `2c77d9a`
- API_VERSION: `v1`
- Endpoint canônico: `/docs/openapi.json`
- Nome de arquivo recomendado para versionamento no front: `openapi.v1.2c77d9a.json`

## Snapshot anexado neste pacote

- Arquivo: `openapi.v1.2c77d9a.json`
- SHA-256: `5ef28939737aea5dc886c36f89c5f191c02d1f1c1f2d36af5a8691269ef94764`
- Capturado em: `2026-02-15T16:54:21Z`

## Procedimento de captura do snapshot

> Execute em um ambiente onde o backend esteja subindo sem erros de compilação.

```bash
curl -sS http://localhost:3000/docs/openapi.json -o openapi.v1.2c77d9a.json
sha256sum openapi.v1.2c77d9a.json
```

## Metadados mínimos para anexar ao arquivo no front

- `backendRepo`: `assistenterpg-back`
- `backendCommit`: `2c77d9a`
- `apiVersion`: `v1`
- `capturedAt`: `<ISO-8601>`
- `sha256`: `<checksum>`

## Observação operacional

No estado atual deste repositório, o servidor não sobe localmente por erros TypeScript existentes (`Found 282 error(s)` em `npm run start`), então o snapshot JSON bruto deve ser capturado em um ambiente de release/staging onde o build esteja íntegro.
