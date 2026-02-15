# Checklist obrigatório no PR do Front (integração com backend)

> Copie esta seção para cada PR do front que consome API.

## Referência de contrato

- [ ] Backend commit usado: `<sha>`
- [ ] Backend tag usada (se houver): `<tag>`
- [ ] API_VERSION: `<vX>`
- [ ] Swagger usado como fonte primária (`/docs` e `/docs/openapi.json`)

## Auth e sessão

- [ ] Bearer token aplicado nas rotas protegidas.
- [ ] Tratamento de `401` com limpeza de sessão e redirecionamento.
- [ ] Tratamento de `403` com estado de permissão negada.

## Erros

- [ ] Erro normalizado para tipo único no front (`statusCode`, `code`, `message`).
- [ ] `field errors` tratados em formulários.
- [ ] `global errors` tratados com toast/banner.

## Listagens

- [ ] Parser universal de lista implementado (`array` e `items`).
- [ ] Paginação testada com e sem `page/limit`.

## UX mínima por tela

- [ ] Estado de loading.
- [ ] Estado vazio (empty state).
- [ ] Estado de erro com retry.
- [ ] Confirmação para ação destrutiva.

## Evidências no PR

- [ ] Requests/responses relevantes anexados (ou screenshots do Swagger).
- [ ] Casos de erro documentados para endpoint crítico.
