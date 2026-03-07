# Mensagem pronta para o agente do front

Use este texto como "copiar e colar":

```txt
Segue pacote backend para implementar e validar wizard + import/export sem acesso ao codigo do back.

Documentos principais (ordem de leitura):
1) docs/FRONT_ONLY_WIZARD_BACKEND_CONTRACT_2026-03-05.md
2) docs/FRONT_ONLY_WIZARD_TEST_MATRIX_2026-03-05.md
3) docs/BACKEND_PACKAGE_FRONT_AGENT_2026-03-05.md
4) docs/WIZARD_CONTRATO_CONFIRMACOES_2026-03-05.md
5) docs/front-smoke-2026-03-05/README.md

Contrato e evidencias reais:
- OpenAPI: http://localhost:3000/docs/openapi.json
- Evidencias capturadas: docs/front-smoke-2026-03-05/responses/*.json
- Fixtures prontos: docs/front-smoke-2026-03-05/fixtures/*.json
- Cenarios request+response: docs/front-smoke-2026-03-05/scenarios/*.json

Ambiente:
- Base URL: http://localhost:3000
- CORS liberado para: http://localhost:3001
- NEXT_PUBLIC_API_URL recomendado: http://localhost:3000
- Usuario smoke:
  - email: front.wizard.smoke@test.local
  - senha: FrontSmoke123
  - personagem fixture para export: id 1

Ponto critico do wizard:
- Em POST /personagens-base/preview, item invalido de inventario pode vir com HTTP 201 e `errosItens` no body.
- Nao espere apenas erros 4xx para renderizar erro de inventario no preview.
- Confirmacao explicita de parser:
  1) 201 + `body.errosItens` (top-level)
  2) em erro HTTP usar `details` quando existir
  3) fallback por `code` + `message`

3 cenarios request+response completos para validacao:
1) POST /personagens-base/preview -> 422 erro global
   - docs/front-smoke-2026-03-05/scenarios/preview-422-erro-global.request-response.json
2) POST /personagens-base/preview -> 201 com errosItens
   - docs/front-smoke-2026-03-05/scenarios/preview-201-errosItens.request-response.json
3) POST /personagens-base/importar -> 400 referencia invalida
   - docs/front-smoke-2026-03-05/scenarios/importar-400-referencia-invalida.request-response.json

Objetivo da sua implementacao:
- Exportar JSON no detalhe da ficha.
- Importar JSON na listagem (ou entrada do fluxo) com parse local + nome sobrescrito opcional.
- Tratar corretamente cenarios da matriz de testes.
```
