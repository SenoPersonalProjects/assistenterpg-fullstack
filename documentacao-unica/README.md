# AssistenteRPG - Documentacao Unica (Front + Back)

Atualizado em: 2026-03-08

## 1. Objetivo e escopo

Esta pasta (`documentacao-unica/`) e a unica fonte de verdade da documentacao tecnica do projeto.

Cobertura desta documentacao:

- arquitetura do sistema (frontend + backend)
- execucao local e variaveis de ambiente
- autenticacao/autorizacao
- contrato HTTP da API (rotas, requests, filtros, respostas, erros)
- tipos de dados aceitos (DTOs, enums e formatos de payload)
- comportamentos esperados e regras de negocio
- comportamento de integracao do frontend com o backend

## 2. Arquitetura

### 2.1 Backend

- Stack: NestJS 11 + Prisma + MySQL
- Entrada: [`assistenterpg-back/src/main.ts`](../assistenterpg-back/src/main.ts)
- Modulos principais: [`assistenterpg-back/src/app.module.ts`](../assistenterpg-back/src/app.module.ts)
- Swagger: `/docs` e `/docs/openapi.json` (quando `SWAGGER_ENABLED != false`)

Comportamentos globais do backend:

- `ValidationPipe` global com:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `enableImplicitConversion: true`
- filtros globais de erro:
  - [`HttpExceptionFilter`](../assistenterpg-back/src/common/filters/http-exception.filter.ts)
  - [`AllExceptionsFilter`](../assistenterpg-back/src/common/filters/all-exceptions.filter.ts)
- interceptores globais:
  - logging HTTP
  - timeout de 30s

### 2.2 Frontend

- Stack: Next.js 16 + React 19 + Axios
- Cliente API principal:
  - [`assistenterpg-front/src/lib/api/axios-client.ts`](../assistenterpg-front/src/lib/api/axios-client.ts)
  - [`assistenterpg-front/src/lib/api/index.ts`](../assistenterpg-front/src/lib/api/index.ts)
- Tipos compartilhados no front:
  - [`assistenterpg-front/src/lib/types/index.ts`](../assistenterpg-front/src/lib/types/index.ts)

Comportamentos globais do frontend:

- token JWT armazenado em `localStorage` (`assistenterpg_token`)
- interceptor Axios adiciona `Authorization: Bearer <token>`
- resposta `401` limpa token e redireciona para `/auth/login`
- normalizacao de listas paginadas aceita:
  - array puro
  - envelope com `items`
  - envelope com `dados/paginacao`

## 3. Execucao local

## 3.1 Backend

Diretorio: `assistenterpg-back/`

Scripts relevantes:

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run test`
- `npm run seed`

## 3.2 Frontend

Diretorio: `assistenterpg-front/`

Scripts relevantes:

- `npm run dev` (porta 3001)
- `npm run build`
- `npm run start`
- `npm run lint`

## 3.3 Variaveis de ambiente

### Backend

- `PORT` (padrao: `3000`)
- `PORT_AUTO_RETRY` (`true/false`)
- `PORT_AUTO_RETRY_MAX` (padrao: `10`)
- `CORS_ORIGINS` (CSV, padrao `http://localhost:3001`)
- `SWAGGER_ENABLED` (`false` desliga)
- `API_VERSION` (padrao `v1`)
- `JWT_SECRET` (obrigatorio em producao)
- `NODE_ENV`
- `DATABASE_URL` (obrigatorio para Prisma)
- `PRISMA_PREBUILD_AUTO_GENERATE` (`false` desliga tentativa automatica de `prisma generate` no prebuild)

### Frontend

- `NEXT_PUBLIC_API_URL` (padrao: `http://localhost:3000`)

## 3.4 Notas de build

- backend:
  - `npm run build` executa `prebuild` e valida Prisma Client antes de compilar
  - se o client estiver desatualizado, o script tenta `prisma generate` (quando `PRISMA_PREBUILD_AUTO_GENERATE != false`)
- frontend:
  - rotas do compendio usam fallback seguro quando a API estiver indisponivel durante build SSR
  - em indisponibilidade de API, `/compendio` renderiza estado vazio em vez de quebrar o `next build`

## 4. Contrato HTTP global

## 4.1 Autenticacao e autorizacao

Login:

- `POST /auth/login` retorna:
  - `access_token`
  - `usuario` (`id`, `apelido`, `email`, `role`)

Registro:

- `POST /auth/register`

Protecao de rotas:

- JWT obrigatorio na maioria das rotas de dominio
- admin guard aplicado em:
  - `POST /suplementos`
  - `PATCH /suplementos/:id`
  - `DELETE /suplementos/:id`
  - rotas de escrita de `equipamentos`
  - rotas de escrita de `modificacoes`
  - rotas de escrita de `compendio` (categorias/subcategorias/artigos)

Observacoes importantes:

- `equipamentos`: leitura publica; escrita com `JWT+Admin`
- `modificacoes`: leitura com `JWT`; escrita com `JWT+Admin`
- `compendio`: leitura publica; escrita com `JWT+Admin`

## 4.2 Formato padrao de erro

Envelope de erro esperado (global):

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-08T12:00:00.000Z",
  "path": "/rota",
  "method": "POST",
  "code": "CODIGO_ERRO",
  "message": "Mensagem",
  "details": {},
  "field": "campo"
}
```

No frontend:

- `ApiError` encapsula `status`, `code` e `body`
- `error-handler.ts` traduz codigos conhecidos para mensagens amigaveis

## 4.3 Paginacao e envelopes de lista

Ha dois padroes de lista no backend hoje:

1) Padrao `items/total/page/limit/totalPages`
2) Padrao `dados/paginacao` com:
   - `paginacao.pagina`
   - `paginacao.limite`
   - `paginacao.total`
   - `paginacao.totalPaginas`

No frontend, `normalizeListResult` converte ambos para:

```ts
type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

## 5. Rotas e contratos por modulo

Legendas:

- `Auth: Publica` = sem JWT
- `Auth: JWT` = exige token
- `Auth: JWT+Admin` = exige token com role admin

## 5.1 Saude

- `GET /` - `Auth: Publica`
  - resposta: string (`Hello World!`)

## 5.2 Auth

- `POST /auth/register` - `Auth: Publica`
  - body: [`RegisterDto`](../assistenterpg-back/src/auth/dto/register.dto.ts)
    - `apelido: string`
    - `email: email`
    - `senha: string` (min 6)
  - resposta: usuario criado (sem `senhaHash`)

- `POST /auth/login` - `Auth: Publica`
  - body: [`LoginDto`](../assistenterpg-back/src/auth/dto/login.dto.ts)
  - resposta: [`LoginResponse`](../assistenterpg-front/src/lib/types/auth.types.ts)

## 5.3 Usuarios

Todas as rotas `Auth: JWT`:

- `GET /usuarios/me`
- `GET /usuarios/me/estatisticas`
- `GET /usuarios/me/preferencias`
- `PATCH /usuarios/me/preferencias`
  - body: [`AtualizarPreferenciasDto`](../assistenterpg-back/src/usuario/dto/atualizar-preferencias.dto.ts)
- `PATCH /usuarios/me/senha`
  - body: [`AlterarSenhaDto`](../assistenterpg-back/src/usuario/dto/alterar-senha.dto.ts)
- `GET /usuarios/me/exportar`
  - resposta: JSON para download
- `DELETE /usuarios/me`
  - body: [`ExcluirContaDto`](../assistenterpg-back/src/usuario/dto/excluir-conta.dto.ts)

## 5.4 Campanhas

Controller com `AuthGuard('jwt')` no nivel de classe (`Auth: JWT`):

- `POST /campanhas`
  - body: [`CreateCampanhaDto`](../assistenterpg-back/src/campanha/dto/create-campanha.dto.ts)
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit`
  - resposta: array ou paginado (`items`)
- `GET /campanhas/:id`
- `DELETE /campanhas/:id`
- `GET /campanhas/:id/membros`
- `POST /campanhas/:id/membros`
  - body: [`AddMembroDto`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
- `POST /campanhas/:id/convites`
  - body: [`CreateConviteDto`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
- `GET /campanhas/convites/pendentes`
- `POST /campanhas/convites/:codigo/aceitar`
- `POST /campanhas/convites/:codigo/recusar`

Regra de negocio relevante:

- convites e acesso validam dono/membro e email do usuario

## 5.5 Personagens base

Controller com `AuthGuard('jwt')` (`Auth: JWT`):

- `POST /personagens-base`
  - body: [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
- `POST /personagens-base/preview`
  - mesmo body do create
  - calcula sem persistir
  - pode retornar `errosItens` sem falhar criacao do preview
- `GET /personagens-base/graus-treinamento/info?nivel=&intelecto=`
- `POST /personagens-base/graus-treinamento/pericias-elegiveis`
- `GET /personagens-base/passivas-disponiveis`
- `GET /personagens-base/tecnicas-disponiveis?claId=&origemId=`
- `GET /personagens-base/meus`
- `GET /personagens-base/:id`
  - query opcional: `incluirInventario=true`
- `PATCH /personagens-base/:id`
  - body: [`UpdatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/update-personagem-base.dto.ts)
- `DELETE /personagens-base/:id`
- `GET /personagens-base/:id/exportar`
  - resposta: [`PersonagemBaseExportResponse`](../assistenterpg-front/src/lib/types/personagem.types.ts)
- `POST /personagens-base/importar`
  - body: [`ImportarPersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/importar-personagem-base.dto.ts)

Regras importantes:

- validacao forte de atributos, passivas, poderes, pericias e vinculos de classe/trilha/caminho
- importacao resolve referencias de catalogo (id/codigo/nome) antes de criar

## 5.6 Inventario

Controller com `JwtAuthGuard` no nivel de classe (`Auth: JWT`):

- `GET /inventario/personagem/:personagemBaseId`
- `POST /inventario/preview-adicionar`
  - body: [`PreviewItemDto`](../assistenterpg-back/src/inventario/dto/preview-item.dto.ts)
- `POST /inventario/preview`
  - body: [`PreviewItensInventarioDto`](../assistenterpg-back/src/inventario/dto/preview-itens-inventario.dto.ts)
  - nota: comentario no controller fala "sem autenticacao", mas na pratica esta protegido por guard de classe
- `POST /inventario/adicionar`
  - body: [`AdicionarItemDto`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts)
- `PATCH /inventario/item/:itemId`
- `DELETE /inventario/item/:itemId`
- `POST /inventario/aplicar-modificacao`
- `POST /inventario/remover-modificacao`

Comportamentos esperados:

- valida ownership do personagem
- valida limite de espaco e sobrecarga
- valida regras de Grau Xama
- valida compatibilidade de modificacoes e conflitos

Tipos de resposta:

- resumo inventario: [`ResumoInventarioCompleto`](../assistenterpg-back/src/inventario/engine/inventario.types.ts)
- preview adicionar item: [`PreviewAdicionarItemResponse`](../assistenterpg-back/src/inventario/engine/inventario.types.ts)

## 5.7 Equipamentos

Rotas:

- leitura:
  - `GET /equipamentos` - `Auth: Publica`
    - query: [`FiltrarEquipamentosDto`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts)
    - resposta: `{ dados, paginacao }`
  - `GET /equipamentos/:id` - `Auth: Publica`
  - `GET /equipamentos/codigo/:codigo` - `Auth: Publica`
- escrita:
  - `POST /equipamentos` - `Auth: JWT+Admin`
    - body: [`CriarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/criar-equipamento.dto.ts)
  - `PUT /equipamentos/:id` - `Auth: JWT+Admin`
  - `DELETE /equipamentos/:id` - `Auth: JWT+Admin`

Regras importantes:

- valida `fonte` x `suplementoId`
- impede delete se equipamento estiver em uso

## 5.8 Modificacoes

Rotas:

- leitura:
  - `GET /modificacoes` - `Auth: JWT`
    - query: [`FiltrarModificacoesDto`](../assistenterpg-back/src/modificacoes/dto/filtrar-modificacoes.dto.ts)
    - resposta: `{ dados, paginacao }`
  - `GET /modificacoes/:id` - `Auth: JWT`
  - `GET /modificacoes/equipamento/:equipamentoId/compativeis` - `Auth: JWT`
- escrita:
  - `POST /modificacoes` - `Auth: JWT+Admin`
    - body: [`CreateModificacaoDto`](../assistenterpg-back/src/modificacoes/dto/create-modificacao.dto.ts)
  - `PATCH /modificacoes/:id` - `Auth: JWT+Admin`
  - `DELETE /modificacoes/:id` - `Auth: JWT+Admin`

Regras importantes:

- valida restricoes por tipo/categoria/complexidade
- valida conflitos entre modificacoes
- impede delete em uso

## 5.9 Suplementos

Rotas:

- `GET /suplementos` - `Auth: JWT`
- `GET /suplementos/:id` - `Auth: JWT`
- `GET /suplementos/codigo/:codigo` - `Auth: JWT`
- `GET /suplementos/me/ativos` - `Auth: JWT`
- `POST /suplementos/:id/ativar` - `Auth: JWT`
- `DELETE /suplementos/:id/desativar` - `Auth: JWT`
- `POST /suplementos` - `Auth: JWT+Admin`
- `PATCH /suplementos/:id` - `Auth: JWT+Admin`
- `DELETE /suplementos/:id` - `Auth: JWT+Admin`

DTOs:

- create: [`CreateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/create-suplemento.dto.ts)
- update: [`UpdateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/update-suplemento.dto.ts)
- filtro: [`FiltrarSuplementosDto`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts)

Regra de negocio:

- usuario so ativa suplemento `PUBLICADO`
- delete admin falha se houver conteudo vinculado (classes, origens, habilidades etc)

## 5.10 Homebrews

Controller com `AuthGuard('jwt')` (`Auth: JWT`):

- `GET /homebrews`
- `GET /homebrews/meus`
- `GET /homebrews/:id`
- `GET /homebrews/codigo/:codigo`
- `POST /homebrews`
- `PATCH /homebrews/:id`
- `DELETE /homebrews/:id`
- `PATCH /homebrews/:id/publicar`
- `PATCH /homebrews/:id/arquivar`

DTOs:

- create: [`CreateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/create-homebrew.dto.ts)
- update: [`UpdateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/update-homebrew.dto.ts)
- filtro: [`FiltrarHomebrewsDto`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts)

Regras importantes:

- leitura para nao admin: somente `PUBLICADO` ou proprio autor
- publicar/arquivar requer dono ou admin
- `dados` varia por tipo e passa por validacao especializada

## 5.11 Compendio

Rotas:

- leitura (publica):
  - categorias:
    - `GET /compendio/categorias`
    - `GET /compendio/categorias/codigo/:codigo`
  - subcategorias:
    - `GET /compendio/categorias/:categoriaId/subcategorias`
    - `GET /compendio/subcategorias/codigo/:codigo`
  - artigos:
    - `GET /compendio/artigos`
    - `GET /compendio/artigos/codigo/:codigo`
  - busca:
    - `GET /compendio/buscar?q=...` (minimo 3 caracteres)
    - `GET /compendio/destaques`
- escrita (admin):
  - categorias:
    - `POST /compendio/categorias` - `Auth: JWT+Admin`
    - `PUT /compendio/categorias/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/categorias/:id` - `Auth: JWT+Admin`
  - subcategorias:
    - `POST /compendio/subcategorias` - `Auth: JWT+Admin`
    - `PUT /compendio/subcategorias/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/subcategorias/:id` - `Auth: JWT+Admin`
  - artigos:
    - `POST /compendio/artigos` - `Auth: JWT+Admin`
    - `PUT /compendio/artigos/:id` - `Auth: JWT+Admin`
    - `DELETE /compendio/artigos/:id` - `Auth: JWT+Admin`

Comportamento esperado:

- listagens aceitam modo paginado e nao paginado
- `buscar` falha se `q` tiver menos de 3 caracteres

## 5.12 Catalogos de conteudo (classes/clas/origens/trilhas/habilidades/tecnicas/pericias/proficiencias/tipos-grau/condicoes/alinhamentos)

Auth atual:

- maioria `Auth: JWT` por guard no nivel de classe

Rotas principais:

- `classes`
  - `POST /classes`
  - `GET /classes`
  - `GET /classes/:id`
  - `GET /classes/:id/trilhas`
  - `PATCH /classes/:id`
  - `DELETE /classes/:id`
- `clas`
  - `POST /clas`
  - `GET /clas`
  - `GET /clas/:id`
  - `PATCH /clas/:id`
  - `DELETE /clas/:id`
- `origens`
  - `POST /origens`
  - `GET /origens`
  - `GET /origens/:id`
  - `PATCH /origens/:id`
  - `DELETE /origens/:id`
- `trilhas`
  - `POST /trilhas`
  - `GET /trilhas`
  - `GET /trilhas/:id`
  - `PATCH /trilhas/:id`
  - `DELETE /trilhas/:id`
  - `GET /trilhas/:id/caminhos`
  - `GET /trilhas/:id/habilidades`
  - `POST /trilhas/caminhos`
  - `PATCH /trilhas/caminhos/:id`
  - `DELETE /trilhas/caminhos/:id`
- `habilidades`
  - `GET /habilidades/poderes-genericos`
  - `GET /habilidades`
  - `GET /habilidades/:id`
  - `POST /habilidades`
  - `PATCH /habilidades/:id`
  - `DELETE /habilidades/:id`
- `tecnicas-amaldicoadas`
  - `GET /tecnicas-amaldicoadas`
  - `GET /tecnicas-amaldicoadas/codigo/:codigo`
  - `GET /tecnicas-amaldicoadas/cla/:claId`
  - `GET /tecnicas-amaldicoadas/:id`
  - `POST /tecnicas-amaldicoadas`
  - `PATCH /tecnicas-amaldicoadas/:id`
  - `DELETE /tecnicas-amaldicoadas/:id`
  - `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
  - `GET /tecnicas-amaldicoadas/habilidades/:id`
  - `POST /tecnicas-amaldicoadas/habilidades`
  - `PATCH /tecnicas-amaldicoadas/habilidades/:id`
  - `DELETE /tecnicas-amaldicoadas/habilidades/:id`
  - `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
  - `GET /tecnicas-amaldicoadas/variacoes/:id`
  - `POST /tecnicas-amaldicoadas/variacoes`
  - `PATCH /tecnicas-amaldicoadas/variacoes/:id`
  - `DELETE /tecnicas-amaldicoadas/variacoes/:id`
- `pericias`
  - `GET /pericias`
  - `GET /pericias/:id`
- `proficiencias`
  - `POST /proficiencias`
  - `GET /proficiencias`
  - `GET /proficiencias/:id`
  - `PATCH /proficiencias/:id`
  - `DELETE /proficiencias/:id`
- `tipos-grau`
  - `POST /tipos-grau`
  - `GET /tipos-grau`
  - `GET /tipos-grau/:id`
  - `PATCH /tipos-grau/:id`
  - `DELETE /tipos-grau/:id`
- `condicoes`
  - `POST /condicoes`
  - `GET /condicoes`
  - `GET /condicoes/:id`
  - `PATCH /condicoes/:id`
  - `DELETE /condicoes/:id`
- `alinhamentos`
  - `GET /alinhamentos`

## 6. Tipos de dados e enums aceitos

Fonte principal de enums:

- [`assistenterpg-front/src/lib/types/homebrew-enums.ts`](../assistenterpg-front/src/lib/types/homebrew-enums.ts)

Enums centrais usados em requests/responses:

- atributos: `AGI | FOR | INT | PRE | VIG`
- papel de campanha: `MESTRE | JOGADOR | OBSERVADOR`
- role usuario: `USUARIO | ADMIN`
- status publicacao: `RASCUNHO | PUBLICADO | ARQUIVADO`
- fonte: `SISTEMA_BASE | SUPLEMENTO | HOMEBREW`
- tipo tecnica: `INATA | NAO_INATA`
- tipo habilidade:
  - `RECURSO_CLASSE`
  - `EFEITO_GRAU`
  - `PODER_GENERICO`
  - `MECANICA_ESPECIAL`
  - `HABILIDADE_ORIGEM`
  - `HABILIDADE_TRILHA`
  - `ESCOLA_TECNICA`
- tipo equipamento:
  - `ARMA`
  - `MUNICAO`
  - `PROTECAO`
  - `ACESSORIO`
  - `EXPLOSIVO`
  - `ITEM_OPERACIONAL`
  - `ITEM_AMALDICOADO`
  - `FERRAMENTA_AMALDICOADA`
  - `GENERICO`

Para payloads completos:

- personagem: [`personagem.types.ts`](../assistenterpg-front/src/lib/types/personagem.types.ts)
- inventario/equipamentos/modificacoes: [`inventario.types.ts`](../assistenterpg-front/src/lib/types/inventario.types.ts)
- catalogos: [`catalogo.types.ts`](../assistenterpg-front/src/lib/types/catalogo.types.ts)
- suplementos: [`suplemento.types.ts`](../assistenterpg-front/src/lib/types/suplemento.types.ts)
- conteudo admin suplementos: [`suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts)

## 7. Integracao frontend-backend

## 7.1 Camada API do frontend

Arquivos principais:

- auth: [`api/auth.ts`](../assistenterpg-front/src/lib/api/auth.ts)
- usuarios: [`api/usuarios.ts`](../assistenterpg-front/src/lib/api/usuarios.ts)
- campanhas: [`api/campanhas.ts`](../assistenterpg-front/src/lib/api/campanhas.ts)
- personagens: [`api/personagens-base.ts`](../assistenterpg-front/src/lib/api/personagens-base.ts)
- inventario: [`api/inventario.ts`](../assistenterpg-front/src/lib/api/inventario.ts)
- catalogos: [`api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts)
- equipamentos/modificacoes: [`api/equipamentos.ts`](../assistenterpg-front/src/lib/api/equipamentos.ts), [`api/modificacoes.ts`](../assistenterpg-front/src/lib/api/modificacoes.ts)
- suplementos/admin conteudos: [`api/suplementos.ts`](../assistenterpg-front/src/lib/api/suplementos.ts), [`api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts)
- homebrews: [`api/homebrews.ts`](../assistenterpg-front/src/lib/api/homebrews.ts)
- compendio (fetch separado): [`lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts)

## 7.2 Rotas de paginas frontend

Paginas principais existentes:

- auth: `/auth/login`, `/auth/register`
- home: `/home`
- campanhas: `/campanhas`, `/campanhas/[id]`
- personagens: `/personagens-base`, `/personagens-base/novo`, `/personagens-base/[id]`
- compendio: `/compendio` e rotas filhas
- suplementos: `/suplementos`, `/suplementos/admin`, `/suplementos/admin/[modulo]`
- homebrews: `/homebrews`, `/homebrews/novo`, `/homebrews/[id]`, `/homebrews/[id]/editar`
- configuracoes: `/configuracoes`

## 8. Consistencia, completude e observacoes tecnicas

## 8.1 O que foi validado nesta consolidacao

- inventario completo de docs antigos de front e back
- leitura direta dos controllers, services e DTOs do backend
- leitura direta dos clientes API e tipos do frontend
- comparacao dos formatos reais de resposta usados no codigo

## 8.2 Correcao aplicada no codigo durante esta consolidacao

Foram adicionadas validacoes class-validator em DTOs de campanha:

- [`add-membro.dto.ts`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
- [`create-convite.dto.ts`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
- [`answer-convite.dto.ts`](../assistenterpg-back/src/campanha/dto/answer-convite.dto.ts)

Impacto:

- requests validos continuam funcionando
- payloads invalidos passam a falhar mais cedo com erro estruturado

Correcoes adicionais aplicadas apos a consolidacao inicial:

- frontend compendio:
  - [`assistenterpg-front/src/lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts) agora trata indisponibilidade da API com fallback seguro
  - buscas por codigo retornam `null` em fallback/404 para alinhar com as paginas dinamicas
  - [`assistenterpg-front/src/app/compendio/page.tsx`](../assistenterpg-front/src/app/compendio/page.tsx) exibe estado vazio amigavel quando API nao responde no build
- backend prebuild Prisma:
  - [`assistenterpg-back/scripts/check-prisma-client.js`](../assistenterpg-back/scripts/check-prisma-client.js) foi corrigido para remover bloco duplicado que quebrava `npm run build`
- backend autorizacao de escrita:
  - [`assistenterpg-back/src/modificacoes/modificacoes.controller.ts`](../assistenterpg-back/src/modificacoes/modificacoes.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/equipamentos/equipamentos.controller.ts`](../assistenterpg-back/src/equipamentos/equipamentos.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/compendio/compendio.controller.ts`](../assistenterpg-back/src/compendio/compendio.controller.ts): CRUD de categorias/subcategorias/artigos agora exige `JWT+Admin`

## 8.3 Pontos de atencao (nao alterados para evitar quebra)

- padrao de paginacao ainda heterogeneo no backend
- backend ainda falha em `npm run lint` por alto volume de pendencias antigas de tipagem/estilo
- ha comentarios de debug antigos em alguns controllers/services (nao afetam contrato)

## 9. Guia rapido de requests (exemplos)

## 9.1 Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@dominio.com",
  "senha": "123456"
}
```

## 9.2 Criar personagem base

```http
POST /personagens-base
Authorization: Bearer <token>
Content-Type: application/json
```

Body completo em:

- [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
- [`CreatePersonagemBasePayload`](../assistenterpg-front/src/lib/types/personagem.types.ts)

## 9.3 Listar equipamentos com filtros

```http
GET /equipamentos?tipo=ARMA&pagina=1&limite=20&busca=katana
```

Resposta:

- envelope `{ dados, paginacao }`

## 9.4 Preview de inventario do wizard

```http
POST /inventario/preview
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "forca": 2,
  "prestigioBase": 3,
  "itens": [
    { "equipamentoId": 10, "quantidade": 1, "equipado": true, "modificacoes": [2] }
  ]
}
```

## 9.5 Ativar suplemento

```http
POST /suplementos/12/ativar
Authorization: Bearer <token>
```

Retorno esperado:

```json
{ "message": "Suplemento ativado com sucesso" }
```

## 10. Politica desta pasta

- Nao criar documentacao paralela em `assistenterpg-back/docs` ou `assistenterpg-front/backend_docs`.
- Toda alteracao de contrato/front/back deve atualizar este arquivo.
