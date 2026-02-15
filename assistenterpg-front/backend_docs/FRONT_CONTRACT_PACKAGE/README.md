# FRONT_CONTRACT_PACKAGE

Pasta única para handoff do contrato backend -> frontend.

## Conteúdo

1. `openapi.v1.2c77d9a.json`
   - **fonte offline primária** do contrato OpenAPI baseline (`assistenterpg-back@2c77d9a`).
2. `OPENAPI_SNAPSHOT_VERSIONED.md`
   - referência versionada do snapshot OpenAPI (metadados de captura e checksum).
3. `PAGINATION_AND_PARAMS_MATRIX.md`
   - matriz de endpoints com paginação e parâmetros de query esperados.
4. `PERMISSIONS_AND_TEST_USERS_MATRIX.md`
   - matriz de permissões por domínio + perfis de usuários de teste.
5. `ERROR_CODES_CATALOG.md`
   - catálogo formal de códigos de erro para padronização de UX no front.

## Baseline desta pasta

- Backend repo: `assistenterpg-back`
- Commit baseline: `2c77d9a`
- API_VERSION: `v1`
- Fonte oficial de contrato online: `/docs/openapi.json`
- Fonte offline primária: `openapi.v1.2c77d9a.json`
