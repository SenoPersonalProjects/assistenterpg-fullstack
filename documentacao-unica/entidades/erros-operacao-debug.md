# Erros de Operacao e Debug (Por Entidade)

Atualizado em: 2026-03-11

## Escopo

Este guia consolida os codigos de erro mais relevantes do backend para operação e debug.
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
- Em validação (`400`), use `details.validationErrors` para exibir campos com erro.
- Em regras de negocio (`422`), use `details` para montar feedback orientado a acao.
- No frontend, a camada de API também tenta extrair `requestId` de `x-request-id`/`x-correlation-id` para facilitar suporte.
- Em telas críticas, mensagens podem incluir contexto técnico no formato:
  `status ... | code ... | METODO /rota | requestId ...`.

## Códigos transversais

| Código                           | HTTP  | Quando ocorre                                    | Ação recomendada                                                          |
| -------------------------------- | ----- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `VALIDATION_ERROR`               | `400` | DTO/pipe rejeita payload                         | Corrigir payload e campos obrigatórios; exibir `details.validationErrors` |
| `FIELD_REQUIRED`                 | `400` | Campo obrigatório faltando                       | Solicitar preenchimento do campo                                          |
| `INVALID_FORMAT`                 | `400` | Campo em formato inválido                        | Corrigir tipo/formato antes do envio                                      |
| `OUT_OF_RANGE`                   | `400` | Campo fora do limite esperado                    | Ajustar valor para faixa válida                                           |
| `DUPLICATE_VALUES`               | `400` | Lista com valores duplicados                     | Remover duplicidades no payload                                           |
| `FONTE_SUPLEMENTO_OBRIGATORIA`   | `400` | `suplementoId` enviado com `fonte != SUPLEMENTO` | Ajustar `fonte` para `SUPLEMENTO`                                         |
| `SUPLEMENTO_ID_OBRIGATORIO`      | `400` | `fonte = SUPLEMENTO` sem `suplementoId`          | Enviar `suplementoId` validação                                              |
| `REFERENCIA_IMPORTACAO_INVALIDA` | `400` | Importação de personagem sem resolver referência | Corrigir referências (`id/nome/codigo`) no arquivo de importação          |
| `ACESSO_NEGADO`                  | `403` | Usuário autenticado sem permissão                | Validar role/permissão no fluxo atual                                     |
| `DB_UNIQUE_VIOLATION`            | `500` | Conflito de unicidade no banco                   | Validar duplicidade antes de criar/atualizar                              |
| `DB_FOREIGN_KEY_VIOLATION`       | `500` | Relação com id inexistente                       | Garantir ids relacionados válidos                                         |
| `DB_RECORD_NOT_FOUND`            | `500` | Operacao de update/delete sem registro           | Recarregar entidade antes de persistir                                    |
| `INTERNAL_ERROR`                 | `500` | Erro não tratado                                 | Usar `traceId`, revisar stack em ambiente de desenvolvimento e logs       |

## Auth e Usuários

| Código                         | HTTP  | Quando ocorre                                      | Ação recomendada                                      |
| ------------------------------ | ----- | -------------------------------------------------- | ----------------------------------------------------- |
| `CREDENCIAIS_INVALIDAS`        | `401` | Login com email/senha inválidos                    | Pedir nova autenticação sem revelar qual campo falhou |
| `TOKEN_INVALIDO`               | `401` | Token expirado ou inválido                         | Limpar sessão e redirecionar para login               |
| `AUTH_TOKEN_INVALIDO_OU_EXPIRADO` | `401` | Link de reset/verificação inválido, usado ou expirado | Solicitar novo link (forgot/resend)                   |
| `AUTH_EMAIL_NAO_VERIFICADO`    | `403` | Login com credencial válida, mas email não verificado | Exibir CTA para reenviar verificação                  |
| `USUARIO_TOKEN_NAO_ENCONTRADO` | `401` | Token validação, mas usuário não existe               | Forcar logout e novo login                            |
| `USUARIO_NAO_AUTENTICADO`      | `401` | Rota protegida sem JWT                             | Solicitar login                                       |
| `USUARIO_NOT_FOUND`            | `404` | Usuário inexistente em consulta direta             | Recarregar estado local e validar id/email            |
| `USUARIO_EMAIL_DUPLICADO`      | `422` | Registro com email já utilizado                    | Exibir erro no campo email e sugerir recuperação      |
| `USUARIO_SENHA_INCORRETA`      | `401` | Alteração de senha/exclusão/login com senha errada | Solicitar senha novamente                             |

## Campanhas e Convites

| Código                         | HTTP  | Quando ocorre                                | Ação recomendada                             |
| ------------------------------ | ----- | -------------------------------------------- | -------------------------------------------- |
| `CAMPANHA_NOT_FOUND`           | `404` | Campanha não existe                          | Atualizar lista e remover referência local   |
| `CAMPANHA_ACESSO_NEGADO`       | `422` | Usuario sem acesso (não dono/não membro)     | Bloquear navegação para recursos da campanha |
| `CAMPANHA_APENAS_DONO`         | `422` | Ação exclusiva do dono                       | Exibir CTA de permissão insuficiente         |
| `CAMPANHA_APENAS_MESTRE`       | `422` | Ação exclusiva de mestre na campanha         | Desabilitar controles de sessão para jogador |
| `CAMPANHA_PERSONAGEM_ASSOCIACAO_NEGADA` | `422` | Tentativa de associar personagem sem permissão | Restringir seleção ao personagem autorizado  |
| `CAMPANHA_PERSONAGEM_LIMITE_USUARIO` | `422` | Jogador/observador tentou associar segundo personagem na campanha | Mostrar regra de 1 personagem para não-mestres |
| `CAMPANHA_PERSONAGEM_EDICAO_NEGADA` | `422` | Usuario tentou editar ficha de campanha sem permissão | Desabilitar ações de edição na UI            |
| `CAMPANHA_PERSONAGEM_DESASSOCIACAO_NEGADA` | `422` | Tentativa de desassociar personagem que já participou de sessão | Informar bloqueio e orientar uso de nova ficha na campanha |
| `PERSONAGEM_CAMPANHA_NOT_FOUND` | `404` | Ficha de campanha inexistente/fora da campanha | Recarregar lista e limpar referência local   |
| `CAMPANHA_MODIFICADOR_NOT_FOUND` | `404` | Modificador inexistente para aquela ficha     | Atualizar lista de modificadores             |
| `CAMPANHA_MODIFICADOR_JA_DESFEITO` | `422` | Tentativa de desfazer modificador já desfeito | Impedir segundo undo da mesma entrada        |
| `SESSAO_CAMPANHA_NOT_FOUND`    | `404` | Sessão não existe ou não pertence a campanha | Voltar para tela da campanha e recarregar lista |
| `SESSAO_TURNO_INDISPONIVEL`    | `422` | Avanço de turno em cena `LIVRE`              | Trocar cena para combate/investigação/furtividade antes de avancar turno |
| `USUARIO_JA_MEMBRO`            | `422` | Tentativa de adicionar membro duplicado      | Evitar convite duplicado para mesmo usuário  |
| `CONVITE_NOT_FOUND`            | `404` | Código de convite inexistente                | Solicitar novo convite                       |
| `CONVITE_INVALIDO`             | `422` | Convite expirado/já respondido/inválido      | Encerrar fluxo de aceite e exibir motivo     |
| `CONVITE_NAO_PERTENCE_USUARIO` | `422` | Email do convite não bate com usuário logado | Pedir login com conta correta                |
| `CONVITE_DUPLICADO_PENDENTE`   | `422` | Ja existe convite pendente para o mesmo email| Orientar a reutilizar/aguardar convite atual |
| `CONVITE_CODIGO_INDISPONIVEL`  | `500` | Falha em gerar codigo único de convite       | Solicitar nova tentativa e logar incidente   |

## NPC (Aliados e Ameaças)

| Código                 | HTTP  | Quando ocorre                               | Ação recomendada                               |
| ---------------------- | ----- | ------------------------------------------- | ---------------------------------------------- |
| `NPC_AMEACA_NOT_FOUND` | `404` | Ficha inexistente ou fora do escopo do dono | Recarregar lista e remover referencia da UI    |

## Personagens Base

| Código                              | HTTP          | Quando ocorre                             | Ação recomendada                                     |
| ----------------------------------- | ------------- | ----------------------------------------- | ---------------------------------------------------- |
| `PERSONAGEM_BASE_NOT_FOUND`         | `404`         | Personagem não existe                     | Atualizar lista e invalidar cache local              |
| `ATTRIBUTE_NOT_INTEGER`             | `400`         | Atributo não inteiro                      | Garantir parse numérico no formulario                |
| `ATTRIBUTE_OUT_OF_RANGE`            | `400`         | Atributo fora do intervalo                | Aplicar limite mínimo/máximo no input                |
| `INVALID_ATTRIBUTE_SUM`             | `400`         | Soma de atributos inválida para o nível   | Recalcular distribuicao automaticamente              |
| `PERICIAS_LIVRES_EXCEDEM_LIMITE`    | `422`         | Perícias livres acima do permitido        | Bloquear submissao e mostrar contador restante       |
| `GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL` | `422`         | Distribuicao de graus acima do total      | Rebalancear pontos antes de salvar                   |
| `PATH_INCOMPATIBLE_WITH_CLASS`      | `422`         | Trilha incompatível com classe            | Refiltrar trilhas após selecionar classe             |
| `WAY_INCOMPATIBLE_WITH_PATH`        | `422`         | Caminho não pertence a trilha escolhida   | Limpar caminho ao trocar trilha                      |
| `POWER_*`                           | `422`         | Regras de poderes genéricos não atendidas | Exibir validação guiada por requisito no builder     |
| `TRAINING_*`                        | `400/422/404` | Regras de treino/perícia violadas         | Guiar usuário por nível, perícia e progressão válida |

## Inventário

| Código                                | HTTP  | Quando ocorre                         | Ação recomendada                                 |
| ------------------------------------- | ----- | ------------------------------------- | ------------------------------------------------ |
| `INVENTARIO_PERSONAGEM_NOT_FOUND`     | `404` | Personagem alvo não existe            | Recarregar personagem e inventário               |
| `INVENTARIO_SEM_PERMISSAO`            | `403` | Usuario sem acesso ao inventário      | Bloquear ação e voltar para tela anterior        |
| `INVENTARIO_ITEM_NOT_FOUND`           | `404` | Item não existe no inventário         | Sincronizar estado local e remover item fantasma |
| `INVENTARIO_EQUIPAMENTO_NOT_FOUND`    | `404` | Equipamento referenciado não existe   | Recarregar catálogo de equipamentos              |
| `INVENTARIO_CAPACIDADE_EXCEDIDA`      | `422` | Excesso de capacidade total           | Reduzir quantidade/itens antes de aplicar        |
| `INVENTARIO_ESPACOS_INSUFICIENTES`    | `422` | Espaços disponíveis insuficientes     | Ajustar carga ou remover itens                   |
| `INVENTARIO_GRAU_XAMA_EXCEDIDO`       | `422` | Limite por grau xama violado          | Rebalancear categoria e complexidade             |
| `INVENTARIO_MODIFICACAO_INCOMPATIVEL` | `422` | Modificação não compatível com item   | Filtrar opções incompatíveis no frontend         |
| `INVENTARIO_MODIFICACAO_DUPLICADA`    | `422` | Mesma modificação aplicada duas vezes | Bloquear duplicidade no seletor                  |

## Equipamentos e Modificações

| Código                               | HTTP  | Quando ocorre                            | Ação recomendada                               |
| ------------------------------------ | ----- | ---------------------------------------- | ---------------------------------------------- |
| `EQUIPAMENTO_NOT_FOUND`              | `404` | Equipamento inexistente                  | Recarregar listagem e remover referência local |
| `EQUIPAMENTO_CODIGO_DUPLICADO`       | `422` | Código já cadastrado                     | Validar unicidade antes de salvar              |
| `EQUIPAMENTO_EM_USO`                 | `422` | Equipamento vinculado a inventários      | Impedir exclusão e mostrar impacto             |
| `MODIFICACAO_NOT_FOUND`              | `404` | Modificação inexistente                  | Atualizar lista                                |
| `MODIFICACAO_CODIGO_DUPLICADO`       | `422` | Código de modificacao repetido           | Ajustar codigo                                 |
| `MODIFICACAO_FONTE_INVALIDA`         | `422` | Regra `fonte/suplementoId` inválida      | Corrigir payload conforme regra                |
| `MODIFICACAO_EQUIPAMENTOS_INVALIDOS` | `404` | IDs de equipamentos vinculados inválidos | Revisar vínculos e ids enviados                |
| `MODIFICACAO_EM_USO`                 | `422` | Modificação aplicada em inventario       | Bloquear exclusão e orientar limpeza prévia    |

## Catálogos de Progressão e Menores

| Código                                                                                     | HTTP      | Quando ocorre                          | Ação recomendada                           |
| ------------------------------------------------------------------------------------------ | --------- | -------------------------------------- | ------------------------------------------ |
| `CLASSE_NOT_FOUND`, `CLA_NOT_FOUND`, `ORIGEM_NOT_FOUND`                                    | `404`     | Entidade base não encontrada           | Recarregar catálogos                       |
| `CLASSE_EM_USO`, `CLA_EM_USO`, `ORIGEM_EM_USO`                                             | `422`     | Exclusao com referências ativas        | Exibir impacto e cancelar exclusão         |
| `TRILHA_NOT_FOUND`, `CAMINHO_NOT_FOUND`                                                    | `404`     | Trilha/caminho inexistente             | Refiltrar lista e limpar seleção           |
| `TRILHA_EM_USO`, `CAMINHO_EM_USO`                                                          | `422`     | Exclusão com uso em personagem         | Exigir desvínculo antes da exclusão        |
| `HABILIDADE_NOT_FOUND`, `HABILIDADE_EM_USO`                                                | `404/422` | Habilidade inexistente ou referenciada | Revalidar vínculos de classe/trilha/origem |
| `TIPO_GRAU_NOT_FOUND`, `PROFICIENCIA_NOT_FOUND`, `PERICIA_NOT_FOUND`, `CONDICAO_NOT_FOUND` | `404`     | Catálogo menor com id/codigo inválido  | Sincronizar cache de catálogos             |

## Suplementos, Homebrews e Compêndio

| Código                              | HTTP  | Quando ocorre                                     | Ação recomendada                     |
| ----------------------------------- | ----- | ------------------------------------------------- | ------------------------------------ |
| `SUPLEMENTO_NOT_FOUND`              | `404` | Suplemento inexistente                            | Recarregar lista de suplementos      |
| `SUPLEMENTO_CODIGO_DUPLICADO`       | `422` | Código de suplemento repetido                     | Ajustar codigo                       |
| `SUPLEMENTO_COM_CONTEUDO_VINCULADO` | `422` | Tentativa de excluir suplemento com conteúdo      | Impedir exclusão e orientar migração |
| `SUPLEMENTO_NAO_PUBLICADO`          | `422` | Ativacao de suplemento não publicado              | Publicar antes de ativar             |
| `HOMEBREW_NOT_FOUND`                | `404` | Homebrew inexistente                              | Atualizar listagem local             |
| `HOMEBREW_DADOS_INVALIDOS`          | `400` | Payload de homebrew inválido                      | Corrigir validações de formulário    |
| `HOMEBREW_SEM_PERMISSAO`            | `403` | Usuario sem permissão sobre homebrew              | Bloquear ação                        |
| `COMPENDIO_*_NOT_FOUND`             | `404` | Categoria/subcategoria/artigo inexistente         | Recarregar árvore do compêndio       |
| `COMPENDIO_*_DUPLICADA`             | `422` | Código duplicado em categoria/subcategoria/artigo | Ajustar codigo antes de salvar       |
| `COMPENDIO_BUSCA_INVALIDA`          | `400` | Busca com query curta/inválida                    | Exigir mínimo de caracteres          |

## Observações finais

- Nem todo erro de runtime vira código de domínio; nesses casos o fallback é `INTERNAL_ERROR`.
- Para incidentes reais, comece por: `traceId`, `code`, `details`, endpoint e payload.
- Se um codigo novo entrar no backend, atualize em conjunto:
  - este guia;
  - `assistenterpg-front/src/lib/api/error-handler.ts`;
  - testes de contrato de erro no backend.
