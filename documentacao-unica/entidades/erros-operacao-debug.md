# Erros de Operacao e Debug (Por Entidade)

Atualizado em: 2026-03-08

## Escopo

Este guia consolida os codigos de erro mais relevantes do backend para operacao e debug.
Ele complementa o contrato global de erro descrito no README.

Formato de resposta esperado:

```json
{
  "statusCode": 422,
  "timestamp": "2026-03-08T12:00:00.000Z",
  "path": "/rota",
  "method": "POST",
  "traceId": "uuid",
  "code": "CODIGO_ERRO",
  "error": "Unprocessable Entity",
  "message": "Mensagem",
  "details": {},
  "field": "campo-opcional"
}
```

## Como usar no debug

- Sempre guarde `traceId` para correlacionar frontend, logs e backend.
- Priorize `code` para tratamento no frontend; `message` pode mudar.
- Em validacao (`400`), use `details.validationErrors` para exibir campos com erro.
- Em regras de negocio (`422`), use `details` para montar feedback orientado a acao.

## Codigos transversais

| Codigo                           | HTTP  | Quando ocorre                                    | Acao recomendada                                                          |
| -------------------------------- | ----- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `VALIDATION_ERROR`               | `400` | DTO/pipe rejeita payload                         | Corrigir payload e campos obrigatorios; exibir `details.validationErrors` |
| `FIELD_REQUIRED`                 | `400` | Campo obrigatorio faltando                       | Solicitar preenchimento do campo                                          |
| `INVALID_FORMAT`                 | `400` | Campo em formato invalido                        | Corrigir tipo/formato antes do envio                                      |
| `OUT_OF_RANGE`                   | `400` | Campo fora do limite esperado                    | Ajustar valor para faixa valida                                           |
| `DUPLICATE_VALUES`               | `400` | Lista com valores duplicados                     | Remover duplicidades no payload                                           |
| `FONTE_SUPLEMENTO_OBRIGATORIA`   | `400` | `suplementoId` enviado com `fonte != SUPLEMENTO` | Ajustar `fonte` para `SUPLEMENTO`                                         |
| `SUPLEMENTO_ID_OBRIGATORIO`      | `400` | `fonte = SUPLEMENTO` sem `suplementoId`          | Enviar `suplementoId` valido                                              |
| `REFERENCIA_IMPORTACAO_INVALIDA` | `400` | Importacao de personagem sem resolver referencia | Corrigir referencias (`id/nome/codigo`) no arquivo de importacao          |
| `ACESSO_NEGADO`                  | `403` | Usuario autenticado sem permissao                | Validar role/permissao no fluxo atual                                     |
| `DB_UNIQUE_VIOLATION`            | `500` | Conflito de unicidade no banco                   | Validar duplicidade antes de criar/atualizar                              |
| `DB_FOREIGN_KEY_VIOLATION`       | `500` | Relacao com id inexistente                       | Garantir ids relacionados validos                                         |
| `DB_RECORD_NOT_FOUND`            | `500` | Operacao de update/delete sem registro           | Recarregar entidade antes de persistir                                    |
| `INTERNAL_ERROR`                 | `500` | Erro nao tratado                                 | Usar `traceId`, revisar stack em ambiente de desenvolvimento e logs       |

## Auth e Usuarios

| Codigo                         | HTTP  | Quando ocorre                                      | Acao recomendada                                      |
| ------------------------------ | ----- | -------------------------------------------------- | ----------------------------------------------------- |
| `CREDENCIAIS_INVALIDAS`        | `401` | Login com email/senha invalidos                    | Pedir nova autenticacao sem revelar qual campo falhou |
| `TOKEN_INVALIDO`               | `401` | Token expirado ou invalido                         | Limpar sessao e redirecionar para login               |
| `USUARIO_TOKEN_NAO_ENCONTRADO` | `401` | Token valido, mas usuario nao existe               | Forcar logout e novo login                            |
| `USUARIO_NAO_AUTENTICADO`      | `401` | Rota protegida sem JWT                             | Solicitar login                                       |
| `USUARIO_NOT_FOUND`            | `404` | Usuario inexistente em consulta direta             | Recarregar estado local e validar id/email            |
| `USUARIO_EMAIL_DUPLICADO`      | `422` | Registro com email ja utilizado                    | Exibir erro no campo email e sugerir recuperacao      |
| `USUARIO_SENHA_INCORRETA`      | `401` | Alteracao de senha/exclusao/login com senha errada | Solicitar senha novamente                             |

## Campanhas e Convites

| Codigo                         | HTTP  | Quando ocorre                                | Acao recomendada                             |
| ------------------------------ | ----- | -------------------------------------------- | -------------------------------------------- |
| `CAMPANHA_NOT_FOUND`           | `404` | Campanha nao existe                          | Atualizar lista e remover referencia local   |
| `CAMPANHA_ACESSO_NEGADO`       | `422` | Usuario sem acesso (nao dono/nao membro)     | Bloquear navegacao para recursos da campanha |
| `CAMPANHA_APENAS_DONO`         | `422` | Acao exclusiva do dono                       | Exibir CTA de permissao insuficiente         |
| `USUARIO_JA_MEMBRO`            | `422` | Tentativa de adicionar membro duplicado      | Evitar convite duplicado para mesmo usuario  |
| `CONVITE_NOT_FOUND`            | `404` | Codigo de convite inexistente                | Solicitar novo convite                       |
| `CONVITE_INVALIDO`             | `422` | Convite expirado/ja respondido/invalido      | Encerrar fluxo de aceite e exibir motivo     |
| `CONVITE_NAO_PERTENCE_USUARIO` | `422` | Email do convite nao bate com usuario logado | Pedir login com conta correta                |

## Personagens Base

| Codigo                              | HTTP          | Quando ocorre                             | Acao recomendada                                     |
| ----------------------------------- | ------------- | ----------------------------------------- | ---------------------------------------------------- |
| `PERSONAGEM_BASE_NOT_FOUND`         | `404`         | Personagem nao existe                     | Atualizar lista e invalidar cache local              |
| `ATTRIBUTE_NOT_INTEGER`             | `400`         | Atributo nao inteiro                      | Garantir parse numerico no formulario                |
| `ATTRIBUTE_OUT_OF_RANGE`            | `400`         | Atributo fora do intervalo                | Aplicar limite minimo/maximo no input                |
| `INVALID_ATTRIBUTE_SUM`             | `400`         | Soma de atributos invalida para o nivel   | Recalcular distribuicao automaticamente              |
| `PERICIAS_LIVRES_EXCEDEM_LIMITE`    | `422`         | Pericias livres acima do permitido        | Bloquear submissao e mostrar contador restante       |
| `GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL` | `422`         | Distribuicao de graus acima do total      | Rebalancear pontos antes de salvar                   |
| `PATH_INCOMPATIBLE_WITH_CLASS`      | `422`         | Trilha incompativel com classe            | Refiltrar trilhas apos selecionar classe             |
| `WAY_INCOMPATIBLE_WITH_PATH`        | `422`         | Caminho nao pertence a trilha escolhida   | Limpar caminho ao trocar trilha                      |
| `POWER_*`                           | `422`         | Regras de poderes genericos nao atendidas | Exibir validacao guiada por requisito no builder     |
| `TRAINING_*`                        | `400/422/404` | Regras de treino/pericia violadas         | Guiar usuario por nivel, pericia e progressao valida |

## Inventario

| Codigo                                | HTTP  | Quando ocorre                         | Acao recomendada                                 |
| ------------------------------------- | ----- | ------------------------------------- | ------------------------------------------------ |
| `INVENTARIO_PERSONAGEM_NOT_FOUND`     | `404` | Personagem alvo nao existe            | Recarregar personagem e inventario               |
| `INVENTARIO_SEM_PERMISSAO`            | `403` | Usuario sem acesso ao inventario      | Bloquear acao e voltar para tela anterior        |
| `INVENTARIO_ITEM_NOT_FOUND`           | `404` | Item nao existe no inventario         | Sincronizar estado local e remover item fantasma |
| `INVENTARIO_EQUIPAMENTO_NOT_FOUND`    | `404` | Equipamento referenciado nao existe   | Recarregar catalogo de equipamentos              |
| `INVENTARIO_CAPACIDADE_EXCEDIDA`      | `422` | Excesso de capacidade total           | Reduzir quantidade/itens antes de aplicar        |
| `INVENTARIO_ESPACOS_INSUFICIENTES`    | `422` | Espacos disponiveis insuficientes     | Ajustar carga ou remover itens                   |
| `INVENTARIO_GRAU_XAMA_EXCEDIDO`       | `422` | Limite por grau xama violado          | Rebalancear categoria e complexidade             |
| `INVENTARIO_MODIFICACAO_INCOMPATIVEL` | `422` | Modificacao nao compativel com item   | Filtrar opcoes incompativeis no frontend         |
| `INVENTARIO_MODIFICACAO_DUPLICADA`    | `422` | Mesma modificacao aplicada duas vezes | Bloquear duplicidade no seletor                  |

## Equipamentos e Modificacoes

| Codigo                               | HTTP  | Quando ocorre                            | Acao recomendada                               |
| ------------------------------------ | ----- | ---------------------------------------- | ---------------------------------------------- |
| `EQUIPAMENTO_NOT_FOUND`              | `404` | Equipamento inexistente                  | Recarregar listagem e remover referencia local |
| `EQUIPAMENTO_CODIGO_DUPLICADO`       | `422` | Codigo ja cadastrado                     | Validar unicidade antes de salvar              |
| `EQUIPAMENTO_EM_USO`                 | `422` | Equipamento vinculado a inventarios      | Impedir exclusao e mostrar impacto             |
| `MODIFICACAO_NOT_FOUND`              | `404` | Modificacao inexistente                  | Atualizar lista                                |
| `MODIFICACAO_CODIGO_DUPLICADO`       | `422` | Codigo de modificacao repetido           | Ajustar codigo                                 |
| `MODIFICACAO_FONTE_INVALIDA`         | `422` | Regra `fonte/suplementoId` invalida      | Corrigir payload conforme regra                |
| `MODIFICACAO_EQUIPAMENTOS_INVALIDOS` | `404` | IDs de equipamentos vinculados invalidos | Revisar vinculos e ids enviados                |
| `MODIFICACAO_EM_USO`                 | `422` | Modificacao aplicada em inventario       | Bloquear exclusao e orientar limpeza previa    |

## Catalogos de Progressao e Menores

| Codigo                                                                                     | HTTP      | Quando ocorre                          | Acao recomendada                           |
| ------------------------------------------------------------------------------------------ | --------- | -------------------------------------- | ------------------------------------------ |
| `CLASSE_NOT_FOUND`, `CLA_NOT_FOUND`, `ORIGEM_NOT_FOUND`                                    | `404`     | Entidade base nao encontrada           | Recarregar catalogos                       |
| `CLASSE_EM_USO`, `CLA_EM_USO`, `ORIGEM_EM_USO`                                             | `422`     | Exclusao com referencias ativas        | Exibir impacto e cancelar exclusao         |
| `TRILHA_NOT_FOUND`, `CAMINHO_NOT_FOUND`                                                    | `404`     | Trilha/caminho inexistente             | Refiltrar lista e limpar selecao           |
| `TRILHA_EM_USO`, `CAMINHO_EM_USO`                                                          | `422`     | Exclusao com uso em personagem         | Exigir desvinculo antes da exclusao        |
| `HABILIDADE_NOT_FOUND`, `HABILIDADE_EM_USO`                                                | `404/422` | Habilidade inexistente ou referenciada | Revalidar vinculos de classe/trilha/origem |
| `TIPO_GRAU_NOT_FOUND`, `PROFICIENCIA_NOT_FOUND`, `PERICIA_NOT_FOUND`, `CONDICAO_NOT_FOUND` | `404`     | Catalogo menor com id/codigo invalido  | Sincronizar cache de catalogos             |

## Suplementos, Homebrews e Compendio

| Codigo                              | HTTP  | Quando ocorre                                     | Acao recomendada                     |
| ----------------------------------- | ----- | ------------------------------------------------- | ------------------------------------ |
| `SUPLEMENTO_NOT_FOUND`              | `404` | Suplemento inexistente                            | Recarregar lista de suplementos      |
| `SUPLEMENTO_CODIGO_DUPLICADO`       | `422` | Codigo de suplemento repetido                     | Ajustar codigo                       |
| `SUPLEMENTO_COM_CONTEUDO_VINCULADO` | `422` | Tentativa de excluir suplemento com conteudo      | Impedir exclusao e orientar migracao |
| `SUPLEMENTO_NAO_PUBLICADO`          | `422` | Ativacao de suplemento nao publicado              | Publicar antes de ativar             |
| `HOMEBREW_NOT_FOUND`                | `404` | Homebrew inexistente                              | Atualizar listagem local             |
| `HOMEBREW_DADOS_INVALIDOS`          | `400` | Payload de homebrew invalido                      | Corrigir validacoes de formulario    |
| `HOMEBREW_SEM_PERMISSAO`            | `403` | Usuario sem permissao sobre homebrew              | Bloquear acao                        |
| `COMPENDIO_*_NOT_FOUND`             | `404` | Categoria/subcategoria/artigo inexistente         | Recarregar arvore do compendio       |
| `COMPENDIO_*_DUPLICADA`             | `422` | Codigo duplicado em categoria/subcategoria/artigo | Ajustar codigo antes de salvar       |
| `COMPENDIO_BUSCA_INVALIDA`          | `400` | Busca com query curta/invalida                    | Exigir minimo de caracteres          |

## Observacoes finais

- Nem todo erro de runtime vira codigo de dominio; nesses casos o fallback e `INTERNAL_ERROR`.
- Para incidentes reais, comece por: `traceId`, `code`, `details`, endpoint e payload.
- Se um codigo novo entrar no backend, atualize em conjunto:
  - este guia;
  - `assistenterpg-front/src/lib/api/error-handler.ts`;
  - testes de contrato de erro no backend.
