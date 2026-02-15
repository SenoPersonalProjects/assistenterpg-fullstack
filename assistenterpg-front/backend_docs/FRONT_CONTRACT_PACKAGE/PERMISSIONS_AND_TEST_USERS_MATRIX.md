# Matriz de Permissões + Usuários de Teste

## Roles existentes

- `USUARIO`
- `ADMIN`

> Convenção para respostas de acesso negado no front:
>
> - `401` quando a rota exige autenticação e não há token/token é inválido.
> - `403` quando há token válido, mas o usuário não possui role suficiente ou quebra regra de ownership.

## Matriz por endpoint/método (prioridade: Auth, Campanhas, Personagens-base, Compêndio, Inventário/Homebrew/Suplementos)

| Domínio | Endpoint | Método | Roles permitidas | Status esperado p/ role não permitida | Regra de ownership/aplicação |
|---|---|---|---|---|---|
| Auth | `/auth/register` | `POST` | Público | N/A (público) | Sem ownership |
| Auth | `/auth/login` | `POST` | Público | N/A (público) | Sem ownership |
| Campanhas | `/campanhas` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação | Campanha criada com `dono = usuário logado` |
| Campanhas | `/campanhas/minhas` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação | Lista deve ser filtrada pelo usuário autenticado |
| Campanhas | `/campanhas/:id` | `GET` | `USUARIO`, `ADMIN` (membro/dono) | `401` sem autenticação; `403` sem vínculo | Somente dono/membro da campanha pode visualizar |
| Campanhas | `/campanhas/:id` | `DELETE` | `USUARIO`, `ADMIN` (com regra de dono) | `401` sem autenticação; `403` sem ownership | Somente dono (ou política administrativa explícita) pode remover |
| Campanhas | `/campanhas/:id/membros` | `GET` | `USUARIO`, `ADMIN` (membro/dono) | `401` sem autenticação; `403` sem vínculo | Leitura restrita à campanha do usuário |
| Campanhas | `/campanhas/:id/membros` | `POST` | `USUARIO`, `ADMIN` (dono/admin da campanha) | `401` sem autenticação; `403` sem ownership | Inserção de membro restrita ao gestor da campanha |
| Campanhas | `/campanhas/:id/convites` | `POST` | `USUARIO`, `ADMIN` (dono/admin da campanha) | `401` sem autenticação; `403` sem ownership | Convite só pode ser emitido por quem administra a campanha |
| Campanhas | `/campanhas/convites/pendentes` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação | Retorna apenas convites pendentes do usuário logado |
| Campanhas | `/campanhas/convites/:codigo/aceitar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` convite não pertence ao usuário | Código de convite deve estar associado ao usuário/escopo válido |
| Campanhas | `/campanhas/convites/:codigo/recusar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` convite não pertence ao usuário | Idem aceitar |
| Personagens-base | `/personagens-base` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação | Personagem criado com proprietário = usuário logado |
| Personagens-base | `/personagens-base/preview` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação | Preview apenas no contexto do usuário logado |
| Personagens-base | `/personagens-base/meus` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação | Sempre retornar somente personagens do próprio usuário |
| Personagens-base | `/personagens-base/:id` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Usuário só acessa personagem próprio (exceto regra administrativa explícita) |
| Personagens-base | `/personagens-base/:id` | `PATCH` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Edição restrita ao dono do personagem |
| Personagens-base | `/personagens-base/:id` | `DELETE` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Exclusão restrita ao dono do personagem |
| Compêndio | `/compendio/categorias` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/categorias/codigo/:codigo` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/categorias/:categoriaId/subcategorias` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/artigos` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/artigos/codigo/:codigo` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/buscar` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/destaques` | `GET` | Público (leitura) | N/A (público) | Sem ownership |
| Compêndio | `/compendio/categorias` | `POST` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/categorias/:id` | `PUT` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/categorias/:id` | `DELETE` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/subcategorias` | `POST` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/subcategorias/:id` | `PUT` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/subcategorias/:id` | `DELETE` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/artigos` | `POST` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/artigos/:id` | `PUT` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Compêndio | `/compendio/artigos/:id` | `DELETE` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | Gestão editorial apenas admin |
| Inventário | `/inventario/personagem/:personagemBaseId` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership do personagem | Inventário sempre vinculado a personagem do usuário |
| Inventário | `/inventario/preview-adicionar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Preview só para personagem próprio |
| Inventário | `/inventario/preview` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Preview só para personagem próprio |
| Inventário | `/inventario/adicionar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Item só pode ser adicionado ao inventário do personagem do usuário |
| Inventário | `/inventario/item/:itemId` | `PATCH` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Item deve pertencer a personagem do usuário |
| Inventário | `/inventario/item/:itemId` | `DELETE` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Remoção restrita ao dono do inventário |
| Inventário | `/inventario/aplicar-modificacao` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Modificação só em item do próprio inventário |
| Inventário | `/inventario/remover-modificacao` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Modificação só em item do próprio inventário |
| Homebrews | `/homebrews` | `GET` | Público/Autenticado (depende de filtro) | `401` apenas quando filtro exigir recursos privados | Público vê publicados; autenticado pode ver próprios conforme regra de serviço |
| Homebrews | `/homebrews/meus` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação | Sempre filtrado pelo usuário logado |
| Homebrews | `/homebrews` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação | `criadoPor = usuário logado` |
| Homebrews | `/homebrews/:id` | `PATCH/DELETE` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Usuário edita/remove somente homebrew próprio |
| Homebrews | `/homebrews/:id/publicar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Publicação só para autor (ou admin por política) |
| Homebrews | `/homebrews/:id/arquivar` | `POST` | `USUARIO`, `ADMIN` | `401` sem autenticação; `403` sem ownership | Arquivamento só para autor (ou admin por política) |
| Suplementos (consumo) | `/suplementos` e `/suplementos/:id` | `GET` | `USUARIO`, `ADMIN` | `401` sem autenticação | Sem ownership; acesso por sessão autenticada |
| Suplementos (consumo) | `/suplementos/:id/ativar` | `POST/PATCH` | `USUARIO`, `ADMIN` | `401` sem autenticação | Ativação é por contexto do usuário (library/perfil) |
| Suplementos (consumo) | `/suplementos/:id/desativar` | `DELETE` | `USUARIO`, `ADMIN` | `401` sem autenticação | Desativação é por contexto do usuário |
| Suplementos (gestão) | `/suplementos` | `POST` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | CRUD administrativo sem ownership individual |
| Suplementos (gestão) | `/suplementos/:id` | `PATCH/DELETE` | `ADMIN` | `401` sem autenticação; `403` role `USUARIO` | CRUD administrativo sem ownership individual |

## Usuários de teste recomendados para o front

| Perfil | Objetivo | Como obter |
|---|---|---|
| `front.user@test.local` | validar fluxos padrão autenticados + ownership do próprio usuário | criar via `POST /auth/register` |
| `front.admin@test.local` | validar bloqueios/liberação de rotas admin (`compendio` write, `suplementos` gestão) | criar via register e promover `role` para `ADMIN` no ambiente de teste |
| `front.user2@test.local` | validar erros de ownership (`403`) em recursos de outro usuário | criar via register sem privilégios |
| `front.viewer@test.local` (opcional) | validar sessão autenticada sem recursos vinculados | criar via register sem recursos vinculados |

## Cenários mínimos de validação

1. Requisição sem token para rota protegida (`/campanhas/minhas`) deve retornar `401`.
2. `USUARIO` tentando `POST /suplementos` deve retornar `403`.
3. `USUARIO` tentando editar/deletar recurso do `front.user2@test.local` (homebrew/personagem/campanha) deve retornar `403`.
4. `ADMIN` acessando endpoints admin de compêndio/suplementos deve ter sucesso (`2xx`).
