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

## 1.1 Navegacao por entidade

Para reduzir ambiguidade e facilitar manutencao, este README permanece como visao consolidada e os detalhes por entidade ficam nestes arquivos (na mesma pasta `documentacao-unica/`):

- matriz de acesso: [`entidades/autorizacao-matriz.md`](./entidades/autorizacao-matriz.md)
- auth/usuarios/campanhas: [`entidades/auth-usuarios-campanhas.md`](./entidades/auth-usuarios-campanhas.md)
- catalogos de progressao (cla/classes/trilhas/caminhos/origens/habilidades): [`entidades/catalogos-progressao.md`](./entidades/catalogos-progressao.md)
- tecnicas amaldicoadas (tecnica/habilidade/variacao): [`entidades/tecnicas-amaldicoadas.md`](./entidades/tecnicas-amaldicoadas.md)
- catalogos menores (pericias/proficiencias/tipos-grau/condicoes/alinhamentos): [`entidades/catalogos-menores.md`](./entidades/catalogos-menores.md)
- personagens-base (regras, payloads, import/export): [`entidades/personagens-base.md`](./entidades/personagens-base.md)
- inventario (espacos, grau xama, vestir, modificacoes): [`entidades/inventario.md`](./entidades/inventario.md)
- equipamentos/modificacoes: [`entidades/equipamentos-modificacoes.md`](./entidades/equipamentos-modificacoes.md)
- compendio: [`entidades/compendio.md`](./entidades/compendio.md)
- suplementos/homebrews: [`entidades/suplementos-homebrews.md`](./entidades/suplementos-homebrews.md)
- erros de operacao e debug (codigo -> acao): [`entidades/erros-operacao-debug.md`](./entidades/erros-operacao-debug.md)
- checklist de cobertura de erros (back x front): [`entidades/checklist-cobertura-erros-front-back.md`](./entidades/checklist-cobertura-erros-front-back.md)
- auditoria de consistencia (docs x regras x schema): [`entidades/auditoria-consistencia.md`](./entidades/auditoria-consistencia.md)

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
- `npm run test`
- `npm run test:watch`

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
  - rotas de escrita de `classes`, `clas`, `origens`, `trilhas` e `habilidades`
  - rotas de escrita de `equipamentos`
  - rotas de escrita de `modificacoes`
  - rotas de escrita de `compendio` (categorias/subcategorias/artigos)
  - rotas de escrita de `tecnicas-amaldicoadas` (tecnicas/habilidades/variacoes)
  - rotas de escrita de `proficiencias`, `tipos-grau` e `condicoes`

Observacoes importantes:

- `equipamentos`: leitura publica; escrita com `JWT+Admin`
- `modificacoes`: leitura com `JWT`; escrita com `JWT+Admin`
- `compendio`: leitura publica; escrita com `JWT+Admin`
- `tecnicas-amaldicoadas`: leitura com `JWT`; escrita com `JWT+Admin`
- `proficiencias`, `tipos-grau` e `condicoes`: leitura com `JWT`; escrita com `JWT+Admin`
- `classes`, `clas`, `origens`, `trilhas` e `habilidades`: leitura com `JWT`; escrita com `JWT+Admin`

## 4.2 Formato padrao de erro

Envelope de erro esperado (global):

```json
{
  "statusCode": 400,
  "timestamp": "2026-03-08T12:00:00.000Z",
  "path": "/rota",
  "method": "POST",
  "traceId": "7f8a36b6-3f2f-45b0-9f76-5d0f5d01f31c",
  "code": "CODIGO_ERRO",
  "error": "Bad Request",
  "message": "Mensagem",
  "details": {},
  "field": "campo"
}
```

Observacoes:

- resposta de erro retorna `traceId` e tambem envia o header `x-request-id`
- campo `error` segue o nome HTTP padrao (`Bad Request`, `Unauthorized`, etc.)
- para validacao de DTO (`400`), o backend usa `code: VALIDATION_ERROR` e inclui `details.validationErrors`
- para validacao de DTO (`400`), o backend tenta inferir `field` com base na primeira mensagem de validacao (ex.: `quantidade`)
- para validacoes de `fonte/suplementoId`, os codigos esperados sao `FONTE_SUPLEMENTO_OBRIGATORIA` e `SUPLEMENTO_ID_OBRIGATORIO`
- em `NODE_ENV=development`, o backend pode incluir `stack` e `errorType`
- mapa de erro por entidade e acao de debug: [`entidades/erros-operacao-debug.md`](./entidades/erros-operacao-debug.md)

No frontend:

- `ApiError` encapsula `status`, `code`, `body`, `method`, `endpoint` e `requestId`
- `error-handler.ts` traduz codigos conhecidos para mensagens amigaveis
- `extrairContextoErro` consolida contexto tecnico (status/code/metodo/endpoint/requestId)
- `formatarErroComContexto` pode anexar contexto tecnico na mensagem final para debug de tela

## 4.3 Paginacao e envelopes de lista

Ha dois padroes de lista no backend hoje:

1. Padrao `items/total/page/limit/totalPages`
2. Padrao `dados/paginacao` com:
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

Detalhamento:

- endpoint simples de disponibilidade da API
- usado como verificador basico de deploy/uptime (sem dependencia de auth)

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

Detalhamento:

- `POST /auth/register`
  - cria usuario via `UsuarioService` com hash de senha (`bcrypt`)
  - retorno inclui: `id`, `apelido`, `email`, `role`, `criadoEm`
  - nao retorna `senhaHash`
  - erro esperado: `USUARIO_EMAIL_DUPLICADO` (422)
- `POST /auth/login`
  - valida email/senha sem revelar se o email existe
  - retorno:
    - `access_token` (JWT)
    - `usuario` (`id`, `email`, `apelido`, `role`)
  - erro esperado: `CREDENCIAIS_INVALIDAS` (401) para qualquer falha de credencial

Integracao frontend:

- [`assistenterpg-front/src/lib/api/auth.ts`](../assistenterpg-front/src/lib/api/auth.ts) cobre `register`, `login` e `get me` (via `/usuarios/me`).

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

Detalhamento:

- `GET /usuarios/me`
  - retorna perfil do usuario autenticado sem `senhaHash`
  - campos principais: `id`, `apelido`, `email`, `role`, `criadoEm`, `atualizadoEm`
- `GET /usuarios/me/estatisticas`
  - retorno esperado:
    - `campanhas`
    - `personagens`
    - `artigosLidos` (atualmente sempre `0`)
- `GET /usuarios/me/preferencias`
  - retorna preferencias do usuario
  - se nao houver registro, o backend cria um com defaults e retorna
- `PATCH /usuarios/me/preferencias`
  - body: [`AtualizarPreferenciasDto`](../assistenterpg-back/src/usuario/dto/atualizar-preferencias.dto.ts)
    - `notificacoesEmail?`, `notificacoesPush?`, `notificacoesConvites?`, `notificacoesAtualizacoes?` (boolean)
    - `idioma?` (string)
  - persistencia via `upsert`
- `PATCH /usuarios/me/senha`
  - body: [`AlterarSenhaDto`](../assistenterpg-back/src/usuario/dto/alterar-senha.dto.ts)
    - `senhaAtual` (string)
    - `novaSenha` (string, min 6)
  - retorno de sucesso: `{ "mensagem": "Senha alterada com sucesso" }`
  - erro esperado: `USUARIO_SENHA_INCORRETA` (401)
- `GET /usuarios/me/exportar`
  - headers de download: `Content-Disposition: attachment; filename=\"dados-assistenterpg.json\"`
  - retorna snapshot com:
    - dados basicos do usuario
    - personagens
    - campanhas (como dono/membro)
    - preferencias
- `DELETE /usuarios/me`
  - body: [`ExcluirContaDto`](../assistenterpg-back/src/usuario/dto/excluir-conta.dto.ts)
  - valida senha antes de excluir
  - retorno de sucesso: `{ "mensagem": "Conta excluida com sucesso" }`

Integracao frontend:

- [`assistenterpg-front/src/lib/api/usuarios.ts`](../assistenterpg-front/src/lib/api/usuarios.ts) cobre:
  - estatisticas
  - preferencias (get/patch)
  - alteracao de senha
  - exportacao de dados (download `blob`)
  - exclusao da conta

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

Detalhamento:

- `POST /campanhas`
  - body: [`CreateCampanhaDto`](../assistenterpg-back/src/campanha/dto/create-campanha.dto.ts)
    - `nome`: string obrigatoria, min 3, max 100
    - `descricao?`: string opcional, max 500
  - cria campanha com `status: "ATIVA"` e inclui contadores
- `GET /campanhas/minhas`
  - query opcional: `page`, `limit` ([`PaginationQueryDto`](../assistenterpg-back/src/common/dto/pagination-query.dto.ts))
  - sem paginacao: retorna array
  - com paginacao: retorna envelope `{ items, total, page, limit, totalPages }`
- `GET /campanhas/:id`
  - exige que usuario seja dono ou membro
  - inclui `dono`, `membros` e `_count` de personagens/sessoes
  - erro esperado: `CAMPANHA_ACESSO_NEGADO` (422)
- `DELETE /campanhas/:id`
  - apenas dono pode excluir
  - sucesso: `{ "message": "Campanha excluida com sucesso", "id": <campanhaId> }`
  - erro esperado: `CAMPANHA_APENAS_DONO` (422)
- `GET /campanhas/:id/membros`
  - exige acesso a campanha (dono ou membro)
- `POST /campanhas/:id/membros`
  - body: [`AddMembroDto`](../assistenterpg-back/src/campanha/dto/add-membro.dto.ts)
    - `usuarioId` inteiro `>= 1`
    - `papel`: `MESTRE | JOGADOR | OBSERVADOR`
  - apenas dono pode gerenciar membros
- convites:
  - `POST /campanhas/:id/convites`
    - body: [`CreateConviteDto`](../assistenterpg-back/src/campanha/dto/create-convite.dto.ts)
    - campos:
      - `email` (email obrigatorio)
      - `papel` (`MESTRE | JOGADOR | OBSERVADOR`)
    - observacao de comportamento atual:
      - o convite persiste `email`, `codigo` e `papel`
  - `GET /campanhas/convites/pendentes`
    - retorna convites pendentes para o email do usuario logado
  - `POST /campanhas/convites/:codigo/aceitar`
    - valida codigo pendente e email do usuario
    - cria membro com o `papel` salvo no convite (fallback `JOGADOR` para dados legados)
  - `POST /campanhas/convites/:codigo/recusar`
    - marca convite como `RECUSADO`
- erros esperados de convite:
  - `CONVITE_NOT_FOUND` (404)
  - `CONVITE_INVALIDO` (422)
  - `CONVITE_NAO_PERTENCE_USUARIO` (422)

Integracao frontend:

- [`assistenterpg-front/src/lib/api/campanhas.ts`](../assistenterpg-front/src/lib/api/campanhas.ts) cobre:
  - listagem de campanhas do usuario
  - criacao e exclusao
  - detalhe de campanha
  - fluxo de convite (criar/listar pendentes/aceitar/recusar)

## 5.5 Personagens base

Detalhamento por entidade: [`entidades/personagens-base.md`](./entidades/personagens-base.md)

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
  - query opcional: `page`, `limit`
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

Detalhamento:

- autenticacao
  - todas as rotas do modulo usam `Auth: JWT` no nivel de classe
- criacao e preview
  - `POST /personagens-base`
    - body: [`CreatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts)
    - cria personagem, calcula derivados e pode criar itens iniciais via `InventarioService`
    - sucesso: resumo `{ id, nome, nivel, cla, origem, classe, trilha, caminho }`
  - `POST /personagens-base/preview`
    - usa o mesmo body do create
    - nao persiste em banco
    - retorna preview completo com derivados, pericias, graus, passivas, poderes, resistencias e inventario validado
    - `errosItens` pode existir para itens invalidos sem bloquear o preview inteiro
- consultas auxiliares de criacao
  - `GET /personagens-base/graus-treinamento/info?nivel=&intelecto=`
    - query: [`ConsultarInfoGrausTreinamentoDto`](../assistenterpg-back/src/personagem-base/dto/consultar-graus-treinamento.dto.ts)
    - retorna niveis elegiveis + limites de progressao
  - `POST /personagens-base/graus-treinamento/pericias-elegiveis`
    - body: [`ConsultarPericiasElegiveisDto`](../assistenterpg-back/src/personagem-base/dto/consultar-graus-treinamento.dto.ts)
  - `GET /personagens-base/passivas-disponiveis`
    - retorno agrupado por atributo (`INT`, `PRE`, `FOR`, `AGI`, `VIG`)
  - `GET /personagens-base/tecnicas-disponiveis?claId=&origemId=`
    - `claId` obrigatorio (inteiro)
    - `origemId` opcional (inteiro; invalido gera 400)
    - retorno: `{ hereditarias, naoHereditarias, todas }`
- consultas de personagem
  - `GET /personagens-base/meus`
    - sem `page/limit`: retorna lista resumida do usuario
    - com `page/limit`: retorna `{ items, total, page, limit, totalPages }`
  - `GET /personagens-base/:id`
    - query opcional: `incluirInventario=true`
    - retorna detalhe mapeado pelo [`personagem-base.mapper.ts`](../assistenterpg-back/src/personagem-base/personagem-base.mapper.ts)
  - `GET /personagens-base/:id/exportar`
    - headers de download JSON
    - retorno: [`PersonagemBaseExportResponse`](../assistenterpg-front/src/lib/types/personagem.types.ts)
  - `POST /personagens-base/importar`
    - body: [`ImportarPersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/importar-personagem-base.dto.ts)
    - resolve referencias opcionais por `id/nome/codigo` antes de criar
- atualizacao e exclusao
  - `PATCH /personagens-base/:id`
    - body parcial: [`UpdatePersonagemBaseDto`](../assistenterpg-back/src/personagem-base/dto/update-personagem-base.dto.ts)
    - rebuild completo do estado final (graus/pericias/proficiencias/habilidades/resistencias)
    - quando `itensInventario` e enviado, o inventario e sincronizado na mesma operacao
    - `itensInventario: []` limpa os itens do personagem
  - `DELETE /personagens-base/:id`
    - remove personagem e relacionamentos associados
    - retorno: `{ "sucesso": true }`
- erros esperados (principais)
  - `PERSONAGEM_BASE_NOT_FOUND` (404)
  - erros de regra de negocio/validacao vindos da engine e do modulo de personagem em [`personagem.exception.ts`](../assistenterpg-back/src/common/exceptions/personagem.exception.ts) (ex.: trilha incompativel, tecnica inata invalida, limites de passivas/graus/pericias)

Integracao frontend:

- [`assistenterpg-front/src/lib/api/personagens-base.ts`](../assistenterpg-front/src/lib/api/personagens-base.ts) cobre CRUD, preview, export/import e endpoints de graus de treinamento.
- [`assistenterpg-front/src/lib/api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts) consome `GET /personagens-base/passivas-disponiveis`.

## 5.6 Inventario

Detalhamento por entidade: [`entidades/inventario.md`](./entidades/inventario.md)

Controller com `JwtAuthGuard` no nivel de classe (`Auth: JWT`):

- `GET /inventario/personagem/:personagemBaseId`
- `POST /inventario/preview-adicionar`
  - body: [`PreviewItemDto`](../assistenterpg-back/src/inventario/dto/preview-item.dto.ts)
- `POST /inventario/preview`
  - body: [`PreviewItensInventarioDto`](../assistenterpg-back/src/inventario/dto/preview-itens-inventario.dto.ts)
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

Detalhamento:

- autenticacao
  - todas as rotas estao protegidas por `JwtAuthGuard` no nivel de classe
  - observacao: apesar de comentario antigo no controller, `POST /inventario/preview` tambem exige JWT
- consultas
  - `GET /inventario/personagem/:personagemBaseId`
    - retorna [`ResumoInventarioCompleto`](../assistenterpg-back/src/inventario/engine/inventario.types.ts):
      - `espacos`
      - `grauXama`
      - `resumoPorCategoria`
      - `podeAdicionarCategoria0`
      - `statsEquipados`
  - `POST /inventario/preview-adicionar`
    - body: [`PreviewItemDto`](../assistenterpg-back/src/inventario/dto/preview-item.dto.ts)
    - simula adicao de 1 item sem persistir e valida espaco + grau xama
  - `POST /inventario/preview`
    - body: [`PreviewItensInventarioDto`](../assistenterpg-back/src/inventario/dto/preview-itens-inventario.dto.ts)
    - simula lista completa para wizard (calcula categoria final, espacos, grau xama e itens por categoria)
- CRUD de itens
  - `POST /inventario/adicionar`
    - body: [`AdicionarItemDto`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts)
    - valida ownership, compatibilidade de modificacoes, limite 2x capacidade, regra de vestir e grau xama
  - `PATCH /inventario/item/:itemId`
    - body: [`AtualizarItemDto`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts)
    - valida novamente limites quando altera `quantidade`/`equipado`
  - `DELETE /inventario/item/:itemId`
    - remove item + vinculos de modificacoes
    - sucesso: `{ "sucesso": true, "mensagem": "Item removido com sucesso" }`
- modificacoes em item
  - `POST /inventario/aplicar-modificacao`
    - body: [`AplicarModificacaoDto`](../assistenterpg-back/src/inventario/dto/aplicar-modificacao.dto.ts)
  - `POST /inventario/remover-modificacao`
    - body: [`RemoverModificacaoDto`](../assistenterpg-back/src/inventario/dto/remover-modificacao.dto.ts)
  - ambos retornam item atualizado do inventario
- erros esperados (principais)
  - `INVENTARIO_PERSONAGEM_NOT_FOUND` (404)
  - `INVENTARIO_SEM_PERMISSAO` (403)
  - `INVENTARIO_ITEM_NOT_FOUND` (404)
  - `INVENTARIO_EQUIPAMENTO_NOT_FOUND` (404)
  - `INVENTARIO_CAPACIDADE_EXCEDIDA` (422)
  - `INVENTARIO_ESPACOS_INSUFICIENTES` (422)
  - `INVENTARIO_LIMITE_VESTIR_EXCEDIDO` (422)
  - `INVENTARIO_GRAU_XAMA_EXCEDIDO` (422)
  - `INVENTARIO_MODIFICACAO_NOT_FOUND` (404)
  - `INVENTARIO_MODIFICACAO_INVALIDA` (422)
  - `INVENTARIO_MODIFICACAO_INCOMPATIVEL` (422)
  - `INVENTARIO_MODIFICACAO_DUPLICADA` (422)
  - `INVENTARIO_MODIFICACAO_NAO_APLICADA` (422)

Integracao frontend:

- [`assistenterpg-front/src/lib/api/inventario.ts`](../assistenterpg-front/src/lib/api/inventario.ts) cobre busca de resumo, previews, CRUD de item e fluxo de modificacoes.
- [`assistenterpg-front/src/lib/utils/inventario.ts`](../assistenterpg-front/src/lib/utils/inventario.ts) concentra normalizacao e validacoes auxiliares usadas na UI de inventario.

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

Detalhamento:

- leitura publica
  - `GET /equipamentos`
    - query: [`FiltrarEquipamentosDto`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts)
      - `tipo`, `complexidadeMaldicao`, `proficienciaArma`, `proficienciaProtecao`, `alcance`, `tipoAcessorio`
      - `categoria` inteiro `0..4`
      - `fontes` como lista (ex.: `SISTEMA_BASE,SUPLEMENTO`)
      - `suplementoId` inteiro `>= 1`
      - `apenasAmaldicoados` boolean (`true/false`, `1/0`, `yes/no`, `on/off`)
      - `busca` textual
      - `pagina` (default `1`) e `limite` (default `20`, max `100`)
    - resposta: envelope `{ dados, paginacao }`
      - `dados`: lista de [`EquipamentoResumoDto`](../assistenterpg-back/src/equipamentos/dto/equipamento-resumo.dto.ts)
      - `paginacao`: `{ pagina, limite, total, totalPaginas }`
  - `GET /equipamentos/:id`
  - `GET /equipamentos/codigo/:codigo`
    - resposta: [`EquipamentoDetalhadoDto`](../assistenterpg-back/src/equipamentos/dto/equipamento-detalhado.dto.ts)
    - erro esperado: `EQUIPAMENTO_NOT_FOUND` (404)
- escrita admin (`Auth: JWT+Admin`)
  - `POST /equipamentos`
    - body: [`CriarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/criar-equipamento.dto.ts)
    - defaults de criacao relevantes:
      - `fonte`: `SISTEMA_BASE` quando `suplementoId` nao e informado
      - `complexidadeMaldicao`: `NENHUMA`
      - `categoria`: `CATEGORIA_0`
      - `espacos`: `1`
  - `PUT /equipamentos/:id`
    - body parcial: [`AtualizarEquipamentoDto`](../assistenterpg-back/src/equipamentos/dto/atualizar-equipamento.dto.ts)
  - `DELETE /equipamentos/:id`
    - sucesso: `204 No Content`
- regras de consistencia backend
  - quando `suplementoId` e informado, `fonte` deve ser `SUPLEMENTO`
  - quando `fonte=SUPLEMENTO`, `suplementoId` e obrigatorio
- erros esperados
  - `EQUIPAMENTO_NOT_FOUND` (404)
  - `EQUIPAMENTO_CODIGO_DUPLICADO` (422)
  - `EQUIPAMENTO_EM_USO` (422)
  - `SUPLEMENTO_NOT_FOUND` (404)
  - `BadRequestException` (400) para combinacao invalida de `fonte`/`suplementoId`

Integracao frontend:

- [`assistenterpg-front/src/lib/api/equipamentos.ts`](../assistenterpg-front/src/lib/api/equipamentos.ts) cobre leitura e normalizacao da listagem (`normalizeListResult`), alem da consulta por `id` e por `codigo`.

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

Detalhamento:

- leitura (`Auth: JWT`)
  - `GET /modificacoes`
    - query: [`FiltrarModificacoesDto`](../assistenterpg-back/src/modificacoes/dto/filtrar-modificacoes.dto.ts)
      - `tipo`, `fontes`, `suplementoId`, `busca`, `pagina`, `limite`
      - `fontes` aceita lista separada por virgula
      - `pagina` default `1`; `limite` default `50` (max `100`)
    - resposta: envelope `{ dados, paginacao }`
      - `dados`: lista de [`ModificacaoDetalhadaDto`](../assistenterpg-back/src/modificacoes/dto/modificacao-detalhada.dto.ts)
  - `GET /modificacoes/:id`
    - erro esperado: `MODIFICACAO_NOT_FOUND` (404)
  - `GET /modificacoes/equipamento/:equipamentoId/compativeis`
    - valida existencia do equipamento base
    - retorna apenas modificacoes que passam em `validarRestricoes(...)`
    - erro esperado: `MODIFICACAO_EQUIPAMENTO_NOT_FOUND` (404)
- escrita admin (`Auth: JWT+Admin`)
  - `POST /modificacoes`
    - body: [`CreateModificacaoDto`](../assistenterpg-back/src/modificacoes/dto/create-modificacao.dto.ts)
    - campos relevantes:
      - `codigo`, `nome`, `tipo`, `incrementoEspacos` obrigatorios
      - `restricoes` e `efeitosMecanicos` como JSON livre
      - `equipamentosCompatíveisIds` opcional para vinculos iniciais
  - `PATCH /modificacoes/:id`
    - body parcial: [`UpdateModificacaoDto`](../assistenterpg-back/src/modificacoes/dto/update-modificacao.dto.ts)
    - quando `equipamentosCompatíveisIds` e enviado:
      - lista substitui os vinculos atuais (inclusive `[]` para limpar)
  - `DELETE /modificacoes/:id`
    - sucesso: `{ "message": "Modificacao removida com sucesso" }`
- erros esperados
  - `MODIFICACAO_NOT_FOUND` (404)
  - `MODIFICACAO_CODIGO_DUPLICADO` (422)
  - `MODIFICACAO_SUPLEMENTO_NOT_FOUND` (404)
  - `MODIFICACAO_FONTE_INVALIDA` (422)
  - `MODIFICACAO_EQUIPAMENTOS_INVALIDOS` (404)
  - `MODIFICACAO_EM_USO` (422)

Integracao frontend:

- [`assistenterpg-front/src/lib/api/modificacoes.ts`](../assistenterpg-front/src/lib/api/modificacoes.ts) cobre listagem, detalhe e compativeis por equipamento, com mapeamento de campos de `restricoes` para o shape de UI (`apenasAmaldicoadas`, `requerComplexidade`).

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

Detalhamento:

- listagem e consulta (`Auth: JWT`)
  - `GET /suplementos`
    - query: [`FiltrarSuplementosDto`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts)
      - `nome`, `codigo`, `status`, `autor`, `apenasAtivos`
      - `apenasAtivos` aceita `true/false`, `1/0`, `yes/no`, `on/off`
    - resposta: array de [`SuplementoCatalogoDto`](../assistenterpg-back/src/suplementos/dto/suplemento-catalogo.dto.ts) ordenado por `nome`
    - quando autenticado, cada item pode incluir `ativo` (suplemento ativo para o usuario)
  - `GET /suplementos/:id`
  - `GET /suplementos/codigo/:codigo`
  - erros esperados: `SUPLEMENTO_NOT_FOUND` (404)
- ativacao/desativacao do usuario (`Auth: JWT`)
  - `GET /suplementos/me/ativos`
    - retorna apenas suplementos `PUBLICADO` ativos para o usuario
  - `POST /suplementos/:id/ativar`
    - sucesso: `{ "message": "Suplemento ativado com sucesso" }`
    - erros esperados:
      - `SUPLEMENTO_NOT_FOUND` (404)
      - `SUPLEMENTO_NAO_PUBLICADO` (422)
      - `SUPLEMENTO_JA_ATIVO` (422)
  - `DELETE /suplementos/:id/desativar`
    - sucesso: `{ "message": "Suplemento desativado com sucesso" }`
    - erro esperado: `SUPLEMENTO_NAO_ATIVO` (404)
- admin (`Auth: JWT+Admin`)
  - `POST /suplementos`
    - body: [`CreateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/create-suplemento.dto.ts)
      - `codigo`, `nome` obrigatorios
      - `descricao`, `versao`, `status`, `icone`, `banner`, `tags`, `autor` opcionais
    - erro esperado: `SUPLEMENTO_CODIGO_DUPLICADO` (422)
  - `PATCH /suplementos/:id`
    - body parcial: [`UpdateSuplementoDto`](../assistenterpg-back/src/suplementos/dto/update-suplemento.dto.ts)
  - `DELETE /suplementos/:id`
    - bloqueia exclusao quando houver conteudo vinculado
    - erros esperados: `SUPLEMENTO_NOT_FOUND` (404), `SUPLEMENTO_COM_CONTEUDO_VINCULADO` (422)
    - sucesso: `{ "message": "Suplemento deletado com sucesso" }`

Integracao frontend:

- [`assistenterpg-front/src/lib/api/suplementos.ts`](../assistenterpg-front/src/lib/api/suplementos.ts) cobre leitura, ativacao/desativacao e CRUD admin de suplementos.

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

Detalhamento:

- listagem (`Auth: JWT`)
  - `GET /homebrews`
  - `GET /homebrews/meus`
  - query: [`FiltrarHomebrewsDto`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts)
    - `nome`, `tipo`, `status`, `usuarioId`, `apenasPublicados`, `pagina`, `limite`
    - `apenasPublicados` aceita `true/false`, `1/0`, `yes/no`, `on/off`
    - `usuarioId`, `pagina`, `limite` devem ser `>= 1` quando informados
  - resposta: envelope paginado `{ dados, paginacao }` com ordenacao por `criadoEm desc`
- consulta (`Auth: JWT`)
  - `GET /homebrews/:id`
  - `GET /homebrews/codigo/:codigo`
  - resposta: [`HomebrewDetalhadoDto`](../assistenterpg-back/src/homebrews/dto/homebrew-detalhado.dto.ts)
  - erros esperados:
    - `HOMEBREW_NOT_FOUND` (404)
    - `HOMEBREW_SEM_PERMISSAO` (403) para conteudo nao publicado de outro usuario
- criacao e edicao (`Auth: JWT`)
  - `POST /homebrews`
    - body: [`CreateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/create-homebrew.dto.ts)
    - `tipo` + `dados` passam por validacao especializada por categoria
  - `PATCH /homebrews/:id`
    - body parcial: [`UpdateHomebrewDto`](../assistenterpg-back/src/homebrews/dto/update-homebrew.dto.ts)
    - ao alterar `dados`, a versao e incrementada automaticamente (`patch +1`)
  - erros esperados:
    - `HOMEBREW_DADOS_INVALIDOS` (400)
    - `HOMEBREW_SEM_PERMISSAO` (403) para edicao sem ser dono/admin
- ciclo de vida (`Auth: JWT`)
  - `PATCH /homebrews/:id/publicar`
    - erro esperado: `HOMEBREW_JA_PUBLICADO` (422)
  - `PATCH /homebrews/:id/arquivar`
  - ambas exigem dono ou admin
- exclusao (`Auth: JWT`)
  - `DELETE /homebrews/:id`
  - exige dono ou admin
  - erro esperado: `HOMEBREW_SEM_PERMISSAO` (403)

Integracao frontend:

- [`assistenterpg-front/src/lib/api/homebrews.ts`](../assistenterpg-front/src/lib/api/homebrews.ts) cobre listagem/consulta/criacao/edicao/publicacao/arquivamento/exclusao, com normalizacao de listas paginadas.

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

Detalhamento:

- leitura publica
  - categorias:
    - `GET /compendio/categorias`
      - query:
        - `todas=true` inclui inativas (default: apenas ativas)
        - `page`, `limit` opcionais para paginacao
      - resposta:
        - sem `page/limit`: array
        - com `page/limit`: `{ items, total, page, limit, totalPages }`
    - `GET /compendio/categorias/codigo/:codigo`
      - inclui subcategorias ativas da categoria
      - erro esperado: `COMPENDIO_CATEGORIA_NOT_FOUND` (404)
  - subcategorias:
    - `GET /compendio/categorias/:categoriaId/subcategorias`
      - query:
        - `todas=true` inclui inativas (default: apenas ativas)
        - `page`, `limit` opcionais
      - pode retornar array ou envelope paginado
    - `GET /compendio/subcategorias/codigo/:codigo`
      - inclui categoria e artigos ativos
      - erro esperado: `COMPENDIO_SUBCATEGORIA_NOT_FOUND` (404)
  - artigos:
    - `GET /compendio/artigos`
      - query:
        - `subcategoriaId` opcional (inteiro; invalido gera 400)
        - `todas=true` inclui inativos (default: apenas ativos)
        - `page`, `limit` opcionais
      - pode retornar array ou envelope paginado
    - `GET /compendio/artigos/codigo/:codigo`
      - inclui subcategoria e categoria
      - erro esperado: `COMPENDIO_ARTIGO_NOT_FOUND` (404)
  - busca e destaques:
    - `GET /compendio/buscar?q=...`
      - `q` minimo 3 caracteres
      - limite interno: 20 itens
      - erro esperado: `COMPENDIO_BUSCA_INVALIDA` (400)
    - `GET /compendio/destaques`
      - retorna ate 6 artigos ativos com `destaque=true`
- escrita admin (`Auth: JWT+Admin`)
  - categorias:
    - `POST /compendio/categorias`
      - body: [`CreateCategoriaDto`](../assistenterpg-back/src/compendio/dto/create-categoria.dto.ts)
    - `PUT /compendio/categorias/:id`
      - body parcial: [`UpdateCategoriaDto`](../assistenterpg-back/src/compendio/dto/update-categoria.dto.ts)
    - `DELETE /compendio/categorias/:id`
      - bloqueia exclusao com subcategorias vinculadas
      - erros: `COMPENDIO_CATEGORIA_NOT_FOUND` (404), `COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS` (422)
  - subcategorias:
    - `POST /compendio/subcategorias`
      - body: [`CreateSubcategoriaDto`](../assistenterpg-back/src/compendio/dto/create-subcategoria.dto.ts)
    - `PUT /compendio/subcategorias/:id`
      - body parcial: [`UpdateSubcategoriaDto`](../assistenterpg-back/src/compendio/dto/update-subcategoria.dto.ts)
    - `DELETE /compendio/subcategorias/:id`
      - bloqueia exclusao com artigos vinculados
      - erros: `COMPENDIO_SUBCATEGORIA_NOT_FOUND` (404), `COMPENDIO_SUBCATEGORIA_COM_ARTIGOS` (422)
  - artigos:
    - `POST /compendio/artigos`
      - body: [`CreateArtigoDto`](../assistenterpg-back/src/compendio/dto/create-artigo.dto.ts)
    - `PUT /compendio/artigos/:id`
      - body parcial: [`UpdateArtigoDto`](../assistenterpg-back/src/compendio/dto/update-artigo.dto.ts)
    - `DELETE /compendio/artigos/:id`
      - erro esperado: `COMPENDIO_ARTIGO_NOT_FOUND` (404)

Integracao frontend:

- consumo principal via fetch SSR em [`assistenterpg-front/src/lib/utils/compendio.ts`](../assistenterpg-front/src/lib/utils/compendio.ts):
  - categorias/subcategorias/artigos por codigo
  - busca textual
  - destaques
  - fallback resiliente para indisponibilidade de API em build/runtime

## 5.12 Catalogos de conteudo (classes/clas/origens/trilhas/habilidades/tecnicas/pericias/proficiencias/tipos-grau/condicoes/alinhamentos)

Auth atual:

- maioria `Auth: JWT` por guard no nivel de classe
- rotas de escrita criticas usam `Auth: JWT+Admin` (guard no metodo)

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

Detalhamento do bloco `classes`, `clas` e `origens`:

- `classes` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /classes`
    - body: [`CreateClasseDto`](../assistenterpg-back/src/classes/dto/create-classe.dto.ts)
      - `nome`: string obrigatoria, max 100
      - `descricao`: string opcional/null, max 2000
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
    - regras:
      - `nome` duplicado falha com `CLASSE_NOME_DUPLICADO` (422)
      - se `suplementoId` for informado, `fonte` deve ser `SUPLEMENTO`
      - se `fonte=SUPLEMENTO`, `suplementoId` torna-se obrigatorio
  - `GET /classes`
    - resposta: array ordenado por `nome`
    - cada item retorna catalogo enriquecido: `pericias`, `proficiencias`, `habilidadesIniciais`, `fonte`, `suplementoId`
  - `GET /classes/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta no mesmo formato de catalogo enriquecido
    - erro esperado: `CLASSE_NOT_FOUND` (404)
  - `GET /classes/:id/trilhas`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta: array `{ id, nome, descricao, classeId }` ordenado por `nome`
  - `PATCH /classes/:id`
    - body parcial: [`UpdateClasseDto`](../assistenterpg-back/src/classes/dto/update-classe.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
    - reaplica validacoes de nome/fonte/suplemento
  - `DELETE /classes/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - bloqueia exclusao se houver personagens vinculados
    - erros esperados: `CLASSE_NOT_FOUND` (404), `CLASSE_EM_USO` (422)
    - sucesso: `{ "sucesso": true }`
- `clas` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /clas`
    - body: [`CreateClaDto`](../assistenterpg-back/src/clas/dto/create-cla.dto.ts)
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string opcional, max 2000
      - `grandeCla`: boolean obrigatorio
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `tecnicasHereditariasIds`: array opcional de inteiros
    - regras:
      - `nome` duplicado falha com `CLA_NOME_DUPLICADO` (422)
      - IDs em `tecnicasHereditariasIds` devem existir e ser tecnicas com `hereditaria=true`
      - IDs invalidos falham com `CLA_TECNICAS_INVALIDAS` (422)
  - `GET /clas`
    - resposta: array ordenado por `nome`
    - inclui `tecnicasHereditarias` e `_count` (`personagensBase`, `personagensCampanha`)
  - `GET /clas/:id`
    - `id` inteiro obrigatorio
    - inclui `tecnicasHereditarias` (com dados da tecnica) e `_count`
    - erro esperado: `CLA_NOT_FOUND` (404)
  - `PATCH /clas/:id`
    - body parcial: [`UpdateClaDto`](../assistenterpg-back/src/clas/dto/update-cla.dto.ts)
    - se `tecnicasHereditariasIds` for enviado, o vinculo e substituido (delete/recreate)
  - `DELETE /clas/:id`
    - bloqueia exclusao se houver personagens vinculados
    - erros esperados: `CLA_NOT_FOUND` (404), `CLA_EM_USO` (422)
    - sucesso: `{ "message": "Cla removido com sucesso" }`
- `origens` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /origens`
    - body: [`CreateOrigemDto`](../assistenterpg-back/src/origens/dto/create-origem.dto.ts)
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string opcional, max 2000
      - `requisitosTexto`: string opcional, max 500
      - `requerGrandeCla`, `requerTecnicaHeriditaria`, `bloqueiaTecnicaHeriditaria`: boolean opcionais
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `pericias`: array opcional de objetos `{ periciaId, tipo: FIXA|ESCOLHA, grupoEscolha? }`
      - `habilidadesIds`: array opcional de inteiros
    - regras:
      - `nome` duplicado falha com `ORIGEM_NOME_DUPLICADO` (422)
      - `periciaId` inexistente falha com `ORIGEM_PERICIAS_INVALIDAS` (404)
      - `habilidadeId` inexistente falha com `ORIGEM_HABILIDADES_INVALIDAS` (404)
      - campos booleanos ausentes entram como `false`
  - `GET /origens`
    - resposta: array ordenado por `nome`
    - inclui `pericias` (com `pericia`), `habilidadesOrigem`, `habilidadesIniciais` e `_count`
  - `GET /origens/:id`
    - `id` inteiro obrigatorio
    - mesmo formato enriquecido do `findAll`
    - erro esperado: `ORIGEM_NOT_FOUND` (404)
  - `PATCH /origens/:id`
    - body parcial: [`UpdateOrigemDto`](../assistenterpg-back/src/origens/dto/update-origem.dto.ts)
    - se `pericias` for enviado, relacao e substituida (delete/recreate)
    - se `habilidadesIds` for enviado, relacao e substituida (delete/recreate)
  - `DELETE /origens/:id`
    - bloqueia exclusao se houver personagens vinculados
    - erros esperados: `ORIGEM_NOT_FOUND` (404), `ORIGEM_EM_USO` (422)
    - sucesso: `{ "message": "Origem removida com sucesso" }`

Integracao frontend neste bloco:

- leitura de catalogo:
  - [`assistenterpg-front/src/lib/api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts): `apiGetClasses`, `apiGetClas`, `apiGetOrigens`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts): `apiAdminCreate*` e `apiAdminUpdate*` para `classes`, `clas` e `origens`
  - observacao: o frontend atual nao expoe funcao de delete para esses tres modulos, embora os endpoints `DELETE` existam no backend

Detalhamento do bloco `trilhas`, `caminhos` e `habilidades`:

- `trilhas` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /trilhas`
    - body: [`CreateTrilhaDto`](../assistenterpg-back/src/trilhas/dto/create-trilha.dto.ts)
      - `classeId`: inteiro obrigatorio
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `requisitos`: JSON opcional
      - `fonte`: enum `TipoFonte` opcional
      - `suplementoId`: inteiro opcional, `>= 1`
      - `habilidades`: array opcional de `{ habilidadeId, nivelConcedido, caminhoId? }`
    - regras:
      - classe inexistente falha com `TRILHA_CLASSE_NOT_FOUND` (404)
      - nome duplicado falha com `TRILHA_NOME_DUPLICADO` (422)
      - validacao `fonte/suplementoId` segue a mesma regra dos outros catalogos
  - `GET /trilhas?classeId=...`
    - `classeId` opcional (inteiro)
    - resposta: array ordenado por `nome`, com `classe`, `caminhos` e `_count`
  - `GET /trilhas/:id`
    - `id` inteiro obrigatorio
    - resposta detalhada com `classe`, `caminhos`, `habilidadesTrilha` e `_count`
    - erro esperado: `TRILHA_NOT_FOUND` (404)
  - `PATCH /trilhas/:id`
    - body parcial: [`UpdateTrilhaDto`](../assistenterpg-back/src/trilhas/dto/update-trilha.dto.ts)
    - permite atualizar `classeId` (validando existencia da classe)
    - quando `habilidades` e enviado, a lista da trilha e substituida (`deleteMany + create`)
    - `habilidades: []` limpa os vinculos da trilha
  - `DELETE /trilhas/:id`
    - bloqueia exclusao se houver personagens vinculados
    - erros esperados: `TRILHA_NOT_FOUND` (404), `TRILHA_EM_USO` (422)
    - sucesso: `{ "message": "Trilha removida com sucesso" }`
- `caminhos` (subrotas em `trilhas`, `GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `POST /trilhas/caminhos`
    - body: [`CreateCaminhoDto`](../assistenterpg-back/src/trilhas/dto/create-caminho.dto.ts)
      - `trilhaId`: inteiro obrigatorio
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `fonte`, `suplementoId` opcionais (mesma regra de consistencia)
      - `habilidades`: array opcional de `{ habilidadeId, nivelConcedido }`
    - regras:
      - trilha inexistente falha com `TRILHA_NOT_FOUND` (404)
      - nome duplicado falha com `CAMINHO_NOME_DUPLICADO` (422)
  - `PATCH /trilhas/caminhos/:id`
    - body parcial: [`UpdateCaminhoDto`](../assistenterpg-back/src/trilhas/dto/update-caminho.dto.ts)
    - se `trilhaId` for enviado, valida trilha de destino
    - quando `habilidades` e enviado, substitui somente as habilidades do caminho
    - `habilidades: []` limpa os vinculos do caminho
  - `DELETE /trilhas/caminhos/:id`
    - bloqueia exclusao se houver personagens vinculados
    - erros esperados: `CAMINHO_NOT_FOUND` (404), `CAMINHO_EM_USO` (422)
    - sucesso: `{ "message": "Caminho removido com sucesso" }`
  - leitura relacionada:
    - `GET /trilhas/:id/caminhos`: lista simplificada `{ id, nome, descricao, trilhaId }`
    - `GET /trilhas/:id/habilidades`: lista consolidada por nivel com nome/descricao da habilidade e caminho associado
- `habilidades` (`GET: JWT`, `POST/PATCH/DELETE: JWT+Admin`)
  - `GET /habilidades/poderes-genericos`
    - resposta: poderes genericos calculados pela regra de criacao de personagem
  - `GET /habilidades`
    - query: [`FilterHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/filter-habilidade.dto.ts)
      - `tipo`, `origem`, `fonte`, `suplementoId`, `busca`, `pagina`, `limite`
    - resposta paginada em envelope `{ dados, paginacao }`
  - `GET /habilidades/:id`
    - `id` inteiro obrigatorio
    - resposta detalhada com `efeitosGrau`, vinculos (`classes`, `trilhas`, `origens`) e `_count`
    - erro esperado: `HABILIDADE_NOT_FOUND` (404)
  - `POST /habilidades`
    - body: [`CreateHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/create-habilidade.dto.ts)
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string opcional, max 1000
      - `tipo`: enum `TipoHabilidade` obrigatorio
      - `origem`: string opcional, max 50
      - `requisitos`, `mecanicasEspeciais`: JSON opcionais
      - `fonte`, `suplementoId`: opcionais
      - `efeitosGrau`: array opcional `{ tipoGrauCodigo, valor?, escalonamentoPorNivel? }`
    - regras:
      - nome duplicado falha com `HABILIDADE_NOME_DUPLICADO` (422)
      - `tipoGrauCodigo` invalido em `efeitosGrau` falha com `TIPO_GRAU_NOT_FOUND` (404)
  - `PATCH /habilidades/:id`
    - body parcial: [`UpdateHabilidadeDto`](../assistenterpg-back/src/habilidades/dto/update-habilidade.dto.ts)
    - `efeitosGrau` substitui a lista existente (`deleteMany + create`)
    - `efeitosGrau: []` limpa os efeitos de grau da habilidade
  - `DELETE /habilidades/:id`
    - bloqueia exclusao quando a habilidade esta vinculada a personagens/catalogos
    - erros esperados: `HABILIDADE_NOT_FOUND` (404), `HABILIDADE_EM_USO` (422)
    - sucesso: `{ "message": "Habilidade removida com sucesso" }`

Integracao frontend neste bloco:

- leitura de catalogo:
  - [`assistenterpg-front/src/lib/api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts): `apiGetTrilhas`, `apiGetTrilhasDaClasse`, `apiGetCaminhosDaTrilha`, `apiGetHabilidades`, `apiGetPoderesGenericos`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts): `apiAdminCreate/UpdateTrilha`, `apiAdminCreate/UpdateCaminho`, `apiAdminCreate/UpdateHabilidade`
  - observacao: frontend atual nao expoe funcao de delete para `trilhas`, `caminhos` e `habilidades`, apesar dos endpoints `DELETE` existirem no backend

Detalhamento do bloco `tecnicas-amaldicoadas`:

- detalhamento completo por entidade: [`entidades/tecnicas-amaldicoadas.md`](./entidades/tecnicas-amaldicoadas.md)

- auth atual:
  - leitura (`GET`) com `Auth: JWT`
  - escrita (`POST/PATCH/DELETE`) com `Auth: JWT+Admin`
- tecnicas (`/tecnicas-amaldicoadas`)
  - `GET /tecnicas-amaldicoadas`
    - query: [`FiltrarTecnicasDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts)
      - `nome`, `codigo`, `tipo`, `claId`, `claNome`, `fonte`, `suplementoId`
      - booleans: `hereditaria`, `incluirHabilidades`, `incluirClas`
      - booleans aceitos: `true/false`, `1/0`, `yes/no`, `on/off`
      - `claId` e `suplementoId` devem ser `>= 1` quando informados
    - resposta: lista de [`TecnicaDetalhadaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/tecnica-detalhada.dto.ts)
    - padrao de include:
      - `incluirClas=false` remove `clasHereditarios`
      - `incluirHabilidades=false` remove `habilidades`
  - `GET /tecnicas-amaldicoadas/:id`
    - `id` inteiro obrigatorio
    - erro esperado: `TECNICA_NOT_FOUND` (404)
  - `GET /tecnicas-amaldicoadas/codigo/:codigo`
    - erro esperado: `TECNICA_NOT_FOUND` (404)
  - `GET /tecnicas-amaldicoadas/cla/:claId`
    - `claId` inteiro obrigatorio
    - retorna tecnicas hereditarias vinculadas ao cla
  - `POST /tecnicas-amaldicoadas`
    - body: [`CreateTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts)
      - `codigo`, `nome`, `descricao`, `tipo` obrigatorios
      - `hereditaria`, `clasHereditarios`, `linkExterno`, `fonte`, `suplementoId`, `requisitos` opcionais
      - `clasHereditarios` (quando informado) deve ser array de strings nao vazias; o backend faz `trim` de cada entrada antes de validar
    - regras:
      - codigo/nome duplicado: `TECNICA_CODIGO_OU_NOME_DUPLICADO` (422)
      - tecnica `hereditaria` deve ser `INATA`: `TECNICA_NAO_INATA_HEREDITARIA` (422)
      - tecnica `hereditaria` exige pelo menos 1 cla: `TECNICA_HEREDITARIA_SEM_CLA` (422)
      - cla inexistente em `clasHereditarios`: `TECNICA_CLA_NOT_FOUND` (404)
      - `suplementoId` invalido: `TECNICA_SUPLEMENTO_NOT_FOUND` (404)
  - `PATCH /tecnicas-amaldicoadas/:id`
    - body parcial: [`UpdateTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-tecnica.dto.ts)
    - regras relevantes:
      - `codigo` nao e atualizavel nesse endpoint
      - `clasHereditarios` (quando informado) deve seguir a mesma validacao do create (strings nao vazias com `trim`)
      - nao permite transformar em tecnica hereditaria sem cla vinculado
      - quando `hereditaria=false`, vinculos de cla sao limpos
      - quando `clasHereditarios` e enviado, os vinculos sao substituidos
      - nome duplicado: `TECNICA_CODIGO_OU_NOME_DUPLICADO` (422)
  - `DELETE /tecnicas-amaldicoadas/:id`
    - bloqueia exclusao quando tecnica estiver em uso por personagem
    - erro esperado: `TECNICA_EM_USO` (422)
    - sucesso: `{ "sucesso": true }`
- habilidades de tecnica
  - `GET /tecnicas-amaldicoadas/:tecnicaId/habilidades`
  - `GET /tecnicas-amaldicoadas/habilidades/:id`
  - `POST /tecnicas-amaldicoadas/habilidades`
    - body: [`CreateHabilidadeTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts)
      - `tecnicaId`, `codigo`, `nome`, `descricao`, `execucao`, `efeito` obrigatorios
      - campos de dano/custo/escalonamento sao opcionais
      - `tecnicaId` deve ser `>= 1`
    - regras:
      - tecnica inexistente: `TECNICA_NOT_FOUND` (404)
      - codigo duplicado: `HABILIDADE_CODIGO_DUPLICADO` (422)
  - `PATCH /tecnicas-amaldicoadas/habilidades/:id`
    - body parcial: [`UpdateHabilidadeTecnicaDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-habilidade-tecnica.dto.ts)
  - `DELETE /tecnicas-amaldicoadas/habilidades/:id`
    - sucesso: `{ "sucesso": true }`
    - erro esperado: `HABILIDADE_TECNICA_NOT_FOUND` (404)
- variacoes de habilidade tecnica
  - `GET /tecnicas-amaldicoadas/habilidades/:habilidadeId/variacoes`
  - `GET /tecnicas-amaldicoadas/variacoes/:id`
  - `POST /tecnicas-amaldicoadas/variacoes`
    - body: [`CreateVariacaoHabilidadeDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts)
      - `habilidadeTecnicaId`, `nome`, `descricao` obrigatorios
      - `habilidadeTecnicaId` deve ser `>= 1`
  - `PATCH /tecnicas-amaldicoadas/variacoes/:id`
    - body parcial: [`UpdateVariacaoHabilidadeDto`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/update-variacao.dto.ts)
  - `DELETE /tecnicas-amaldicoadas/variacoes/:id`
    - sucesso: `{ "sucesso": true }`
    - erro esperado: `VARIACAO_HABILIDADE_NOT_FOUND` (404)

Integracao frontend neste bloco:

- leitura/publicacao em catalogo:
  - [`assistenterpg-front/src/lib/api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts): `apiGetTecnicasAmaldicoadas`, `apiGetTecnicasInatas`
- escrita/admin:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts):
    - tecnicas: `apiAdminCreateTecnicaAmaldicoada`, `apiAdminUpdateTecnicaAmaldicoada`
    - habilidades de tecnica: `apiAdminGetHabilidadesDaTecnica`, `apiAdminGetHabilidadeDaTecnica`, `apiAdminCreateHabilidadeDaTecnica`, `apiAdminUpdateHabilidadeDaTecnica`, `apiAdminDeleteHabilidadeDaTecnica`
    - variacoes: `apiAdminGetVariacoesDaHabilidadeTecnica`, `apiAdminGetVariacaoDaHabilidadeTecnica`, `apiAdminCreateVariacaoDaHabilidadeTecnica`, `apiAdminUpdateVariacaoDaHabilidadeTecnica`, `apiAdminDeleteVariacaoDaHabilidadeTecnica`
- interface admin:
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx) agora expoe acao `Habilidades` por tecnica
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx) cobre CRUD de habilidades e variacoes em modal dedicado, incluindo campos avancados com entrada guiada para `requisitos`, `testesExigidos`, `dadosDano` e `escalonamentoDano` (mantendo modo JSON avancado como fallback)

Detalhamento do bloco de catalogos menores:

- detalhamento completo por entidade: [`entidades/catalogos-menores.md`](./entidades/catalogos-menores.md)

- `pericias` (`Auth: JWT`)
  - `GET /pericias`
    - resposta: array ordenado por `atributoBase` e `nome`
    - campos: `id`, `codigo`, `nome`, `descricao`, `atributoBase`, `somenteTreinada`, `penalizaPorCarga`, `precisaKit`
  - `GET /pericias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `PERICIA_NOT_FOUND` (404)
- `proficiencias` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /proficiencias`
    - body: [`CreateProficienciaDto`](../assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts)
      - `codigo`: string obrigatoria, max 50
      - `nome`: string obrigatoria, min 2, max 100
      - `descricao`: string opcional/null, max 5000
      - `tipo`: string obrigatoria, max 50
      - `categoria`: string obrigatoria, max 50
      - `subtipo`: string opcional/null, max 50
  - `GET /proficiencias`
    - resposta: array ordenado por `nome`
  - `GET /proficiencias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `PROFICIENCIA_NOT_FOUND` (404)
  - `PATCH /proficiencias/:id`
    - body parcial: [`UpdateProficienciaDto`](../assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
  - `DELETE /proficiencias/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta esperada: `{ "sucesso": true }`
  - observacao de erro de banco:
    - `codigo` e unico no schema; duplicidade gera `DB_UNIQUE_VIOLATION`
- `tipos-grau` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /tipos-grau`
    - body: [`CreateTipoGrauDto`](../assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts)
      - `codigo`: string obrigatoria, max 50
      - `nome`: string obrigatoria, min 2, max 100
      - `descricao`: string opcional/null, max 5000
  - `GET /tipos-grau`
    - resposta: array ordenado por `nome`
  - `GET /tipos-grau/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - erros esperados: `TIPO_GRAU_NOT_FOUND` (404)
  - `PATCH /tipos-grau/:id`
    - body parcial: [`UpdateTipoGrauDto`](../assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts)
    - `id` deve ser inteiro (`ParseIntPipe`)
  - `DELETE /tipos-grau/:id`
    - `id` deve ser inteiro (`ParseIntPipe`)
    - resposta esperada: `{ "sucesso": true }`
  - observacao de erro de banco:
    - `codigo` e unico no schema; duplicidade gera `DB_UNIQUE_VIOLATION`
- `condicoes` (`GET: Auth: JWT | POST/PATCH/DELETE: Auth: JWT+Admin`)
  - `POST /condicoes`
    - body: [`CreateCondicaoDto`](../assistenterpg-back/src/condicoes/dto/create-condicao.dto.ts)
      - `nome`: string obrigatoria, min 3, max 100
      - `descricao`: string obrigatoria, min 10
    - erros esperados: `CONDICAO_NOME_DUPLICADO` (422)
  - `GET /condicoes`
    - resposta: array ordenado por `nome`
    - cada item inclui `_count.condicoesPersonagemSessao`
  - `GET /condicoes/:id`
    - `id` inteiro obrigatorio
    - inclui `_count.condicoesPersonagemSessao`
    - erros esperados: `CONDICAO_NOT_FOUND` (404)
  - `PATCH /condicoes/:id`
    - body parcial: [`UpdateCondicaoDto`](../assistenterpg-back/src/condicoes/dto/update-condicao.dto.ts)
    - erros esperados: `CONDICAO_NOT_FOUND` (404), `CONDICAO_NOME_DUPLICADO` (422)
  - `DELETE /condicoes/:id`
    - bloqueia remocao se houver uso em sessao
    - erros esperados: `CONDICAO_NOT_FOUND` (404), `CONDICAO_EM_USO` (422)
    - sucesso: `{ "message": "Condicao removida com sucesso" }`
- `alinhamentos` (`Auth: JWT`)
  - `GET /alinhamentos`
    - resposta: array ordenado por `nome`
    - campos: `id`, `nome`, `descricao`

Integracao frontend neste bloco:

- leitura via [`assistenterpg-front/src/lib/api/catalogos.ts`](../assistenterpg-front/src/lib/api/catalogos.ts):
  - `apiGetPericias`
  - `apiGetProficiencias`
  - `apiGetTiposGrau`
  - `apiGetAlinhamentos`
- escrita/admin via [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts):
  - proficiencias: `apiAdminGetProficiencias`, `apiAdminGetProficiencia`, `apiAdminCreateProficiencia`, `apiAdminUpdateProficiencia`, `apiAdminDeleteProficiencia`
  - tipos-grau: `apiAdminGetTiposGrau`, `apiAdminGetTipoGrau`, `apiAdminCreateTipoGrau`, `apiAdminUpdateTipoGrau`, `apiAdminDeleteTipoGrau`
  - condicoes: `apiAdminGetCondicoes`, `apiAdminGetCondicao`, `apiAdminCreateCondicao`, `apiAdminUpdateCondicao`, `apiAdminDeleteCondicao`
- interface admin:
  - [`assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx), [`assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx) cobrem CRUD completo desses catalogos
  - [`assistenterpg-front/src/lib/constants/suplemento-admin.ts`](../assistenterpg-front/src/lib/constants/suplemento-admin.ts) e [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) foram ampliados para expor os novos modulos no painel admin

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
- execucao de testes unitarios de controllers focados em contrato de autorizacao

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
- backend tratativa de erros e observabilidade:
  - [`assistenterpg-back/src/common/http/error-response.util.ts`](../assistenterpg-back/src/common/http/error-response.util.ts) centraliza normalizacao do contrato de erro (`code`, `error`, `message`, `details`, `field`)
  - [`assistenterpg-back/src/common/filters/http-exception.filter.ts`](../assistenterpg-back/src/common/filters/http-exception.filter.ts) e [`assistenterpg-back/src/common/filters/all-exceptions.filter.ts`](../assistenterpg-back/src/common/filters/all-exceptions.filter.ts) agora usam o mesmo formato padrao, incluindo `VALIDATION_ERROR` para erros de DTO e `x-request-id/traceId` consistente
  - [`assistenterpg-back/src/common/interceptors/logging.interceptor.ts`](../assistenterpg-back/src/common/interceptors/logging.interceptor.ts) passa a logar status real da resposta e mascarar campos sensiveis no body (`senha`, `token`, etc.)
  - [`assistenterpg-back/src/common/http/error-response.util.spec.ts`](../assistenterpg-back/src/common/http/error-response.util.spec.ts) cobre casos-base de normalizacao para evitar regressao de contrato
  - [`assistenterpg-back/src/common/filters/error-contract.integration.spec.ts`](../assistenterpg-back/src/common/filters/error-contract.integration.spec.ts) valida no nivel HTTP o envelope final de erro para cenarios de validacao, erro de dominio (incluindo `CAMPANHA_NOT_FOUND`/`INVENTARIO_ESPACOS_INSUFICIENTES`), erro inesperado e geracao/eco de `x-request-id`
  - validacoes de catalogo relacionadas a `fonte/suplementoId` passaram a retornar codigos de dominio (`FONTE_SUPLEMENTO_OBRIGATORIA` e `SUPLEMENTO_ID_OBRIGATORIO`) em vez de `BAD_REQUEST` generico
- cobertura de paginacao e contrato de lista:
  - [`assistenterpg-front/src/lib/api/pagination.test.ts`](../assistenterpg-front/src/lib/api/pagination.test.ts) cobre normalizacao de envelopes `items/total/page/limit/totalPages`, `dados/paginacao` e payloads malformados
  - [`assistenterpg-front/src/lib/utils/lista-paginada.ts`](../assistenterpg-front/src/lib/utils/lista-paginada.ts) centraliza regra de ajuste de pagina fora do range (ex.: ultima pagina fica vazia apos exclusao)
  - [`assistenterpg-front/src/lib/utils/lista-paginada.test.ts`](../assistenterpg-front/src/lib/utils/lista-paginada.test.ts) cobre cenarios de ajuste/aplicacao de dados e normalizacao de `totalPages`
  - [`assistenterpg-front/src/app/campanhas/page.tsx`](../assistenterpg-front/src/app/campanhas/page.tsx) e [`assistenterpg-front/src/app/personagens-base/page.tsx`](../assistenterpg-front/src/app/personagens-base/page.tsx) passaram a reutilizar a mesma regra de fallback de pagina
  - [`assistenterpg-back/src/common/dto/pagination-query.dto.spec.ts`](../assistenterpg-back/src/common/dto/pagination-query.dto.spec.ts) cobre limites de `page/limit` no DTO
  - [`assistenterpg-back/src/common/dto/pagination-query.integration.spec.ts`](../assistenterpg-back/src/common/dto/pagination-query.integration.spec.ts) valida no nivel HTTP conversao de query string para numero e retorno de `VALIDATION_ERROR` para valores fora da regra
- backend autorizacao de escrita:
  - [`assistenterpg-back/src/classes/classes.controller.ts`](../assistenterpg-back/src/classes/classes.controller.ts), [`assistenterpg-back/src/clas/clas.controller.ts`](../assistenterpg-back/src/clas/clas.controller.ts), [`assistenterpg-back/src/origens/origens.controller.ts`](../assistenterpg-back/src/origens/origens.controller.ts), [`assistenterpg-back/src/trilhas/trilhas.controller.ts`](../assistenterpg-back/src/trilhas/trilhas.controller.ts) e [`assistenterpg-back/src/habilidades/habilidades.controller.ts`](../assistenterpg-back/src/habilidades/habilidades.controller.ts): rotas de escrita (`POST/PATCH/DELETE`) agora exigem `JWT+Admin`, mantendo leitura (`GET`) com `JWT`
  - [`assistenterpg-back/src/modificacoes/modificacoes.controller.ts`](../assistenterpg-back/src/modificacoes/modificacoes.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/equipamentos/equipamentos.controller.ts`](../assistenterpg-back/src/equipamentos/equipamentos.controller.ts): create/update/delete agora exigem `JWT+Admin`
  - [`assistenterpg-back/src/compendio/compendio.controller.ts`](../assistenterpg-back/src/compendio/compendio.controller.ts): CRUD de categorias/subcategorias/artigos agora exige `JWT+Admin`
  - [`assistenterpg-back/src/proficiencias/proficiencias.controller.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts) e [`assistenterpg-back/src/condicoes/condicoes.controller.ts`](../assistenterpg-back/src/condicoes/condicoes.controller.ts): `POST/PATCH/DELETE` agora exigem `JWT+Admin`, mantendo `GET` com `JWT`
- backend contrato de leitura do compendio:
  - [`assistenterpg-back/src/compendio/compendio.controller.ts`](../assistenterpg-back/src/compendio/compendio.controller.ts): `GET /compendio/artigos` agora usa `ParseIntPipe` em `subcategoriaId`, retornando `400` para query invalida em vez de ignorar filtro silenciosamente
- backend contrato de leitura de personagem-base:
  - [`assistenterpg-back/src/personagem-base/personagem-base.controller.ts`](../assistenterpg-back/src/personagem-base/personagem-base.controller.ts): `GET /personagens-base/tecnicas-disponiveis` agora valida `origemId` com `ParseIntPipe` opcional, retornando `400` para query invalida em vez de ignorar silenciosamente
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts): `PATCH /personagens-base/:id` agora sincroniza `itensInventario` quando enviado (inclusive limpeza com array vazio)
  - [`assistenterpg-back/src/personagem-base/personagem-base.service.spec.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.spec.ts) cobre cenarios de sincronizacao de inventario no update (`undefined`, lista vazia e lista com itens)
  - [`assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx`](../assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseWizard.tsx) agora envia `itensInventario: []` em vez de omitir o campo quando o inventario e esvaziado
- backend contrato de DTO do inventario:
  - [`assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.ts) e [`assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.ts): parse de boolean/int ficou estrito para evitar fallback silencioso em payload invalido (ex.: `"abc"` nao vira `false` nem `3`), mesmo com `enableImplicitConversion` global ligado
  - [`assistenterpg-back/src/inventario/dto/adicionar-item.dto.spec.ts`](../assistenterpg-back/src/inventario/dto/adicionar-item.dto.spec.ts) e [`assistenterpg-back/src/inventario/dto/atualizar-item.dto.spec.ts`](../assistenterpg-back/src/inventario/dto/atualizar-item.dto.spec.ts) cobrem conversoes validas e rejeicao de entradas invalidas
  - [`assistenterpg-back/src/common/http/error-response.util.ts`](../assistenterpg-back/src/common/http/error-response.util.ts): `VALIDATION_ERROR` agora tenta inferir `field` a partir das mensagens do class-validator
  - [`assistenterpg-back/src/common/filters/error-contract.integration.spec.ts`](../assistenterpg-back/src/common/filters/error-contract.integration.spec.ts) valida o contrato de erro para `PATCH /inventario/item/:itemId`, `POST /inventario/adicionar`, `POST /inventario/aplicar-modificacao` e `POST /inventario/remover-modificacao` com payload invalido
- backend contrato de catalogos menores:
  - IDs de rota de [`assistenterpg-back/src/classes/classes.controller.ts`](../assistenterpg-back/src/classes/classes.controller.ts), [`assistenterpg-back/src/pericias/pericias.controller.ts`](../assistenterpg-back/src/pericias/pericias.controller.ts), [`assistenterpg-back/src/proficiencias/proficiencias.controller.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.ts) e [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.ts) agora usam `ParseIntPipe` para falhar com 400 em params invalidos
  - DTOs [`assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts`](../assistenterpg-back/src/proficiencias/dto/create-proficiencia.dto.ts), [`assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts`](../assistenterpg-back/src/proficiencias/dto/update-proficiencia.dto.ts), [`assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts`](../assistenterpg-back/src/tipos-grau/dto/create-tipo-grau.dto.ts) e [`assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts`](../assistenterpg-back/src/tipos-grau/dto/update-tipo-grau.dto.ts) agora possuem validacao `class-validator` consistente com `ValidationPipe` global
- backend contrato de trilhas/caminhos:
  - [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts): `PATCH /trilhas/:id` agora aplica `classeId` quando enviado (com validacao de existencia da classe)
  - [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts): `PATCH /trilhas/:id` e `PATCH /trilhas/caminhos/:id` agora aceitam array vazio para limpar habilidades vinculadas
- backend contrato de tecnicas-amaldicoadas:
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts): parse de boolean em query foi corrigido (`false`/`0` nao sao mais convertidos para `true`)
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-habilidade-tecnica.dto.ts) e [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-variacao.dto.ts): IDs agora exigem `>= 1` quando informados; `clasHereditarios` tambem passou a exigir strings nao vazias (com `trim`) no create/update
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts): `PATCH /tecnicas-amaldicoadas/:id` agora valida nome duplicado e mantem consistencia de vinculos de cla ao alternar `hereditaria`
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.ts): rotas de escrita (`POST/PATCH/DELETE`) agora exigem `JWT+Admin`, mantendo leitura (`GET`) com `JWT`
- frontend cliente de tecnicas-amaldicoadas:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts) agora expoe cliente completo para habilidades/variacoes de tecnica (GET/GET by id/POST/PATCH/DELETE)
  - [`assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts) recebeu tipagem dedicada para payloads/respostas de habilidades e variacoes de tecnica
  - [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicasAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TecnicaHabilidadesModal.tsx) passaram a integrar esses endpoints na UI admin
  - o modal de habilidades/variacoes foi ampliado para editar tambem campos avancados do contrato (execucao/area/alcance/alvo/duracao/resistencia/criticos/dano/escalonamento/requisitos), priorizando editores guiados e mantendo modo JSON apenas como fallback para casos complexos
- frontend cliente/admin de catalogos menores:
  - [`assistenterpg-front/src/lib/api/suplemento-conteudos.ts`](../assistenterpg-front/src/lib/api/suplemento-conteudos.ts) agora expoe CRUD completo de `proficiencias`, `tipos-grau` e `condicoes`
  - [`assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts`](../assistenterpg-front/src/lib/types/suplemento-conteudo.types.ts) recebeu payloads/tipos para `Create/Update` desses catalogos e `CondicaoCatalogo`
  - [`assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/ProficienciasAdminPanel.tsx), [`assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/TiposGrauAdminPanel.tsx) e [`assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx`](../assistenterpg-front/src/components/suplemento-admin/panels/CondicoesAdminPanel.tsx) integram esse CRUD no painel admin
  - [`assistenterpg-front/src/lib/constants/suplemento-admin.ts`](../assistenterpg-front/src/lib/constants/suplemento-admin.ts) e [`assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx`](../assistenterpg-front/src/app/suplementos/admin/[modulo]/page.tsx) ganharam os novos modulos (`proficiencias`, `tipos-grau`, `condicoes`)
- backend contrato de filtros (suplementos/homebrews):
  - [`assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.ts) e [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts): parse de boolean em query foi corrigido (`false`/`0` nao sao mais convertidos para `true`)
  - [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.ts): `usuarioId`, `pagina` e `limite` agora exigem `>= 1`
- backend contrato de filtros (equipamentos):
  - [`assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.ts): parse de `apenasAmaldicoados` em query foi corrigido (`false`/`0` nao sao mais convertidos para `true`)
- testes de DTO:
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.spec.ts) cobre parse de boolean, rejeicao de valor invalido e validacao de `claId/suplementoId`
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/dto/create-tecnica.dto.spec.ts) cobre normalizacao e validacao de `clasHereditarios` (strings vazias/espacos)
  - [`assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.spec.ts`](../assistenterpg-back/src/suplementos/dto/filtrar-suplementos.dto.spec.ts), [`assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.spec.ts`](../assistenterpg-back/src/homebrews/dto/filtrar-homebrews.dto.spec.ts) e [`assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.spec.ts`](../assistenterpg-back/src/equipamentos/dto/filtrar-equipamentos.dto.spec.ts) cobrem parse de boolean e limites minimos de filtros
- testes de contrato de auth:
  - [`assistenterpg-back/src/modificacoes/modificacoes.controller.spec.ts`](../assistenterpg-back/src/modificacoes/modificacoes.controller.spec.ts), [`assistenterpg-back/src/equipamentos/equipamentos.controller.spec.ts`](../assistenterpg-back/src/equipamentos/equipamentos.controller.spec.ts) e [`assistenterpg-back/src/compendio/compendio.controller.spec.ts`](../assistenterpg-back/src/compendio/compendio.controller.spec.ts) agora validam via metadata quais rotas sao publicas/JWT/JWT+Admin, reduzindo risco de regressao de autorizacao
  - [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.spec.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.controller.spec.ts) agora valida por metadata a separacao `GET=JWT` e `POST/PATCH/DELETE=JWT+Admin` para tecnicas/habilidades/variacoes
  - [`assistenterpg-back/src/proficiencias/proficiencias.controller.spec.ts`](../assistenterpg-back/src/proficiencias/proficiencias.controller.spec.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.controller.spec.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.controller.spec.ts) e [`assistenterpg-back/src/condicoes/condicoes.controller.spec.ts`](../assistenterpg-back/src/condicoes/condicoes.controller.spec.ts) agora validam por metadata a separacao `GET=JWT` e `POST/PATCH/DELETE=JWT+Admin`
- baseline de lint no backend:
  - [`assistenterpg-back/eslint.config.mjs`](../assistenterpg-back/eslint.config.mjs) foi ajustado para tratar `no-unsafe-*` como `warn`, permitindo `npm run lint` passar sem mascarar o debito historico
  - erros de lint de baixo esforco (imports/variaveis nao usadas, `require-await`, `no-case-declarations`) foram corrigidos em modulos afetados
  - tipagem Prisma aplicada em [`assistenterpg-back/src/equipamentos/equipamentos.service.ts`](../assistenterpg-back/src/equipamentos/equipamentos.service.ts), [`assistenterpg-back/src/inventario/inventario.service.ts`](../assistenterpg-back/src/inventario/inventario.service.ts), [`assistenterpg-back/src/modificacoes/modificacoes.service.ts`](../assistenterpg-back/src/modificacoes/modificacoes.service.ts), [`assistenterpg-back/src/origens/origens.service.ts`](../assistenterpg-back/src/origens/origens.service.ts), [`assistenterpg-back/src/trilhas/trilhas.service.ts`](../assistenterpg-back/src/trilhas/trilhas.service.ts), [`assistenterpg-back/src/usuario/usuario.service.ts`](../assistenterpg-back/src/usuario/usuario.service.ts), [`assistenterpg-back/src/proficiencias/proficiencias.service.ts`](../assistenterpg-back/src/proficiencias/proficiencias.service.ts), [`assistenterpg-back/src/tipos-grau/tipos-grau.service.ts`](../assistenterpg-back/src/tipos-grau/tipos-grau.service.ts), [`assistenterpg-back/src/pericias/pericias.service.ts`](../assistenterpg-back/src/pericias/pericias.service.ts), [`assistenterpg-back/src/classes/classes.service.ts`](../assistenterpg-back/src/classes/classes.service.ts), [`assistenterpg-back/src/suplementos/suplementos.service.ts`](../assistenterpg-back/src/suplementos/suplementos.service.ts), [`assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts`](../assistenterpg-back/src/tecnicas-amaldicoadas/tecnicas-amaldicoadas.service.ts), [`assistenterpg-back/src/homebrews/homebrews.service.ts`](../assistenterpg-back/src/homebrews/homebrews.service.ts), [`assistenterpg-back/src/personagem-base/personagem-base.service.ts`](../assistenterpg-back/src/personagem-base/personagem-base.service.ts), [`assistenterpg-back/src/personagem-base/personagem-base.mapper.ts`](../assistenterpg-back/src/personagem-base/personagem-base.mapper.ts), [`assistenterpg-back/src/personagem-base/personagem-base.persistence.ts`](../assistenterpg-back/src/personagem-base/personagem-base.persistence.ts), regras de criacao de `personagem-base` e filtros globais de erro, removendo casts inseguros (`any`/`unknown as`) nos fluxos principais desses modulos
  - reducao mensuravel de warnings globais `no-unsafe-*`: `1987 -> 1755 -> 1732 -> 1636 -> 1557 -> 1462 -> 1217 -> 236 -> 124 -> 101 -> 75 -> 36 -> 21 -> 0` (medicao em 2026-03-08)
- testes de fallback no frontend:
  - [`assistenterpg-front/src/lib/utils/compendio.test.ts`](../assistenterpg-front/src/lib/utils/compendio.test.ts) cobre fallback de categorias/destaques/busca por codigo/busca textual
  - [`assistenterpg-front/package.json`](../assistenterpg-front/package.json) agora expoe scripts `test` e `test:watch` via Vitest
- contrato de tipos no frontend:
  - [`assistenterpg-front/src/lib/types/inventario.types.ts`](../assistenterpg-front/src/lib/types/inventario.types.ts): `InventarioCompletoDto` foi alinhado com o retorno real de `GET /inventario/personagem/:id` (`{ espacos, grauXama, resumoPorCategoria, podeAdicionarCategoria0, statsEquipados }`)

## 8.3 Pontos de atencao (nao alterados para evitar quebra)

- padrao de paginacao ainda heterogeneo no backend
- backend passa em `npm run lint` sem warnings (medicao de 2026-03-08), com `errors=0` e `warnings=0` em `src`
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
    {
      "equipamentoId": 10,
      "quantidade": 1,
      "equipado": true,
      "modificacoes": [2]
    }
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
