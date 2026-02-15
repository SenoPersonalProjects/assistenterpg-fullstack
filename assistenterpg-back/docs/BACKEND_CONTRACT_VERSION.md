# BACKEND_CONTRACT_VERSION

Arquivo para front/agent fixar exatamente qual versão do backend foi usada na sprint.

## Referência atual

- Backend repo: `assistenterpg-back`
- Commit de referência: `2c77d9a`
- Versão de contrato (API_VERSION): `v1`
- Swagger UI: `/docs`
- OpenAPI JSON: `/docs/openapi.json`
- Data de atualização: `2026-02-15`
- Status de baseline da sprint: `PENDENTE (validação técnica reprovada em 2026-02-15)`

## Modelo para próximas sprints

```md
- Sprint: <nome/numero>
- Backend commit: <sha>
- Backend tag (opcional): <tag>
- API_VERSION: <vX>
- Mudanças de contrato relevantes: <resumo>
- PR(s) do front vinculadas: <links>
```

## Processo de atualização

1. Atualize o commit/tag após merge em `dev`/`main`.
2. Atualize `API_VERSION` quando houver breaking change.
3. Registre impacto no `docs/CONTRATO_API_CHANGELOG.md`.
4. Exija referência deste arquivo no PR do front.
