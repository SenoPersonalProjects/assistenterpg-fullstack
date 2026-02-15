# Matriz de Permissões + Usuários de Teste

## Roles existentes

- `USUARIO`
- `ADMIN`

## Matriz de permissões (visão funcional)

| Domínio | Endpoint(s) exemplo | Acesso |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | Público |
| Usuário | `GET/PATCH /usuarios/me` e derivados | `USUARIO` e `ADMIN` autenticados |
| Campanhas | `campanhas/*` | `USUARIO` e `ADMIN` autenticados |
| Inventário | `inventario/*` | `USUARIO` e `ADMIN` autenticados |
| Personagens-base | `personagens-base/*` | `USUARIO` e `ADMIN` autenticados |
| Homebrews | `homebrews/*` | autenticado; regras de ownership no serviço; `ADMIN` com privilégios adicionais |
| Suplementos (consumo) | `GET /suplementos*`, `POST /suplementos/:id/ativar`, `DELETE /suplementos/:id/desativar` | `USUARIO` e `ADMIN` autenticados |
| Suplementos (gestão) | `POST/PATCH/DELETE /suplementos` | Apenas `ADMIN` |

## Usuários de teste recomendados para o front

| Perfil | Objetivo | Como obter |
|---|---|---|
| `front.user@test.local` | validar fluxos padrão autenticados | criar via `POST /auth/register` |
| `front.admin@test.local` | validar bloqueios/liberação de rotas admin | criar via register e promover `role` para `ADMIN` no ambiente de teste |
| `front.viewer@test.local` (opcional) | validar sessão sem dados próprios | criar via register sem recursos vinculados |

## Cenários mínimos de validação

1. `USUARIO` acessa endpoint de gestão admin de suplementos => deve receber `403`.
2. `ADMIN` acessa endpoint de gestão admin de suplementos => deve ter sucesso.
3. Usuário autenticado acessa recurso de outro usuário sem permissão => erro de negócio/forbidden conforme endpoint.
