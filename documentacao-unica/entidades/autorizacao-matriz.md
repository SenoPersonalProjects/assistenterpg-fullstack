# Matriz de Autorizacao (JWT x JWT+Admin)

Atualizado em: 2026-03-08

## Convencoes

- `Publica`: rota sem guard de autenticacao
- `JWT`: exige autenticacao
- `JWT+Admin`: exige autenticacao com role `ADMIN`

## Matriz por modulo

- `auth`
  - `POST /auth/register`, `POST /auth/login`: Publica
- `usuarios`
  - leitura/escrita de perfil: JWT
- `campanhas`
  - principal e convites: JWT
- `personagens-base`
  - principal: JWT
- `inventario`
  - principal: JWT
- `homebrews`
  - principal: JWT (regras de dono/admin aplicadas em service)
- `suplementos`
  - leitura/ativacao: JWT
  - create/update/delete: JWT+Admin
- `compendio`
  - leitura: Publica
  - create/update/delete categorias/subcategorias/artigos: JWT+Admin
- `equipamentos`
  - leitura: Publica
  - create/update/delete: JWT+Admin
- `modificacoes`
  - leitura: JWT
  - create/update/delete: JWT+Admin
- `classes`, `clas`, `origens`, `trilhas`, `caminhos`, `habilidades`
  - principal: JWT
- `tecnicas-amaldicoadas` (tecnica/habilidade/variacao)
  - leitura (`GET`): JWT
  - escrita (`POST/PATCH/DELETE`): JWT+Admin
- `proficiencias`, `tipos-grau`, `condicoes`
  - leitura (`GET`): JWT
  - escrita (`POST/PATCH/DELETE`): JWT+Admin
- `pericias`, `alinhamentos`
  - leitura: JWT

## Fontes de validacao

- Controllers do backend (`assistenterpg-back/src/**/*controller.ts`)
- Specs de metadata de guards:
  - `assistenterpg-back/src/modificacoes/modificacoes.controller.spec.ts`
  - `assistenterpg-back/src/equipamentos/equipamentos.controller.spec.ts`
  - `assistenterpg-back/src/compendio/compendio.controller.spec.ts`
  - `assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.spec.ts`
  - `assistenterpg-back/src/proficiencias/proficiencias.controller.spec.ts`
  - `assistenterpg-back/src/tipos-grau/tipos-grau.controller.spec.ts`
  - `assistenterpg-back/src/condicoes/condicoes.controller.spec.ts`
