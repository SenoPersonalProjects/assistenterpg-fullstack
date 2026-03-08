# Personagens Base (Contrato Detalhado)

Atualizado em: 2026-03-08

## Escopo

Este documento detalha o contrato real do modulo `personagens-base`, cruzando:

- controller: `assistenterpg-back/src/personagem-base/personagem-base.controller.ts`
- service/mapper/persistence:
  - `assistenterpg-back/src/personagem-base/personagem-base.service.ts`
  - `assistenterpg-back/src/personagem-base/personagem-base.mapper.ts`
  - `assistenterpg-back/src/personagem-base/personagem-base.persistence.ts`
- DTOs:
  - `assistenterpg-back/src/personagem-base/dto/create-personagem-base.dto.ts`
  - `assistenterpg-back/src/personagem-base/dto/update-personagem-base.dto.ts`
  - `assistenterpg-back/src/personagem-base/dto/importar-personagem-base.dto.ts`
  - `assistenterpg-back/src/personagem-base/dto/consultar-graus-treinamento.dto.ts`
- regras de negocio/engine:
  - `assistenterpg-back/src/personagem-base/engine/personagem-base.engine.ts`
  - `assistenterpg-back/src/personagem-base/regras-criacao/*.ts`
- excecoes:
  - `assistenterpg-back/src/common/exceptions/personagem.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models de `PersonagemBase` e relacionamentos)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/personagens-base.ts`
  - `assistenterpg-front/src/lib/types/personagem.types.ts`

## Matriz de autorizacao

- todas as rotas do modulo usam `Auth: JWT` (`@UseGuards(AuthGuard('jwt'))` no controller)

## Endpoints

## Criacao e preview

- `POST /personagens-base`
  - body: `CreatePersonagemBaseDto`
  - cria personagem + relacionamentos + (opcional) itens iniciais de inventario em transacao
  - resposta: resumo `{ id, nome, nivel, cla, origem, classe, trilha, caminho }`

- `POST /personagens-base/preview`
  - body: `CreatePersonagemBaseDto`
  - nao persiste em banco
  - retorna dto normalizado + derivados + pericias + graus + passivas + poderes + resistencias + preview de itens
  - se algum item de inventario for invalido, o preview retorna `errosItens` sem falhar tudo

## Endpoints auxiliares de criacao

- `GET /personagens-base/graus-treinamento/info?nivel=<int>&intelecto=<int>`
  - query: `ConsultarInfoGrausTreinamentoDto`
  - retorno:
    - `niveisDisponiveis` (subset de `[3, 7, 11, 16]`, cada um com `maxMelhorias = 2 + intelecto`)
    - `limitesGrau` (`graduado: 3`, `veterano: 9`, `expert: 16`)

- `POST /personagens-base/graus-treinamento/pericias-elegiveis`
  - body: `ConsultarPericiasElegiveisDto`
  - entrada: `periciasComGrauInicial: string[]`
  - retorno: array de pericias existentes com `grauAtual: 5`

- `GET /personagens-base/passivas-disponiveis`
  - retorno agrupado por atributo (`AGI`, `FOR`, `INT`, `PRE`, `VIG`)
  - cada item inclui: `id`, `codigo`, `nome`, `nivel`, `requisito`, `descricao`, `efeitos`

- `GET /personagens-base/tecnicas-disponiveis?claId=<int>&origemId=<int?>`
  - `claId` obrigatorio (`ParseIntPipe`)
  - `origemId` opcional (`ParseIntPipe` opcional)
  - retorno: `{ hereditarias, naoHereditarias, todas }`
  - se origem bloqueia tecnica hereditaria, as hereditarias sao filtradas

## Consulta e manutencao

- `GET /personagens-base/meus`
  - lista resumida do usuario autenticado

- `GET /personagens-base/:id?incluirInventario=true|false`
  - retorna detalhe completo mapeado em `personagem-base.mapper.ts`
  - `incluirInventario=true` adiciona resumo agregado do inventario

- `PATCH /personagens-base/:id`
  - body: `UpdatePersonagemBaseDto` (parcial)
  - fluxo real:
    - carrega estado atual
    - monta `dtoCompleto`
    - revalida regras de origem/cla/tecnica e trilha/caminho
    - recalcula estado completo no engine
    - aplica rebuild de relacionamentos
  - observacao importante:
    - `UpdatePersonagemBaseDto` possui campo `itensInventario`, mas o fluxo de update nao aplica esse campo
    - inventario deve ser alterado pelos endpoints de `/inventario`

- `DELETE /personagens-base/:id`
  - remove personagem e tabelas relacionadas (inventario, habilidades, poderes, passivas, resistencias, etc)
  - retorno: `{ "sucesso": true }`

## Exportacao e importacao

- `GET /personagens-base/:id/exportar`
  - resposta em JSON com headers de download
  - formato:
    - `schema`
    - `schemaVersion`
    - `exportadoEm`
    - `personagem` (`CreatePersonagemBaseDto`)
    - `referencias` (ids/nomes/codigos auxiliares para resolver catalogos na importacao)

- `POST /personagens-base/importar`
  - body: `ImportarPersonagemBaseDto`
  - resolve referencias por `id`, `nome` e/ou `codigo` antes de criar
  - permite `nomeSobrescrito`
  - resposta inclui metadados de importacao:
    - `importado: true`
    - `schema`
    - `schemaVersion`
    - `importadoEm`

## Payloads aceitos (DTO)

## `CreatePersonagemBaseDto` (campos principais)

- identificacao/base:
  - `nome: string` (obrigatorio)
  - `nivel: int >= 1`
  - `claId: int`
  - `origemId: int`
  - `classeId: int`
  - `trilhaId?: int | null`
  - `caminhoId?: int | null`
- atributos:
  - `agilidade`, `forca`, `intelecto`, `presenca`, `vigor`: `int` de `0` a `7`
- outros:
  - `estudouEscolaTecnica: boolean`
  - `idade?: int | null`
  - `prestigioBase?: int`
  - `prestigioClaBase?: int | null`
  - `alinhamentoId?: int | null`
  - `background?: string | null`
  - `atributoChaveEa: "INT" | "PRE"` (enum `AtributoBaseEA`)
  - `tecnicaInataId?: int | null`
- listas:
  - `proficienciasCodigos: string[]`
  - `grausAprimoramento: Array<{ tipoGrauCodigo: string; valor: int }>`
  - `grausTreinamento?: Array<{ nivel: 3|7|11|16; melhorias: [...] }>`
  - `poderesGenericos?: Array<{ habilidadeId: int; config?: json }>`
  - `passivasAtributoIds?: int[]`
  - `passivasAtributosAtivos?: Array<"AGI"|"FOR"|"INT"|"PRE"|"VIG">`
  - `passivasAtributosConfig?: { INT_I?: ..., INT_II?: ... }`
  - `periciasClasseEscolhidasCodigos: string[]`
  - `periciasOrigemEscolhidasCodigos: string[]`
  - `periciasLivresCodigos: string[]`
  - `periciasLivresExtras?: int`
  - `itensInventario?: ItemInventarioDto[]`

## `ItemInventarioDto` (dentro de create/import)

- `equipamentoId: int`
- `quantidade: int` de `1` a `99`
- `equipado?: boolean`
- `modificacoesIds?: int[]`
- `nomeCustomizado?: string | null`
- `notas?: string | null`

## `UpdatePersonagemBaseDto`

- mesmo conjunto de campos, porem todos opcionais (`Partial`)
- validacoes de faixa/tipo seguem as mesmas do create

## Regras de negocio (engine + regras-criacao)

## Atributos

- cada atributo deve ser inteiro entre `0` e `7`
- soma obrigatoria:
  - `9 + quantidade de marcos atingidos`
  - marcos: `4, 7, 10, 13, 16, 19`

## Passivas

- elegibilidade por atributo com valor `>= 3`
- maximo de 2 atributos com passivas
- quando existem mais de 2 elegiveis:
  - no create/update (`strictPassivas=true`) exige escolha explicita de 2
  - no preview (`strictPassivas=false`) pode retornar `passivasNeedsChoice`
- passivas de intelecto (`INT_I`/`INT_II`) validam:
  - limite de escolhas extra (pericias/proficiencias)
  - pericia de treino obrigatoria
  - limite de grau maximo ao aplicar bonus

## Pericias

- pericias de origem e classe com grupos de escolha validam cardinalidade (1 por grupo)
- escola tecnica aplica regra adicional sobre `JUJUTSU`
- pericias livres:
  - limite final = `classe.periciasLivresBase + intelecto + extras de passivas`

## Graus de treinamento

- niveis validos para evolucao: `3`, `7`, `11`, `16`
- por nivel, max melhorias: `2 + intelecto`
- progressao valida somente em passos de `+5`
- limite por nivel:
  - `10` (Graduado) requer nivel `>= 3`
  - `15` (Veterano) requer nivel `>= 9`
  - `20` (Expert) requer nivel `>= 16`

## Graus de aprimoramento

- graus livres base por nivel: marcos `[2, 8, 14, 18]`
- extras:
  - habilidades com `mecanicasEspeciais.graus_livres`
  - `INT_II` pode conceder +1 grau em tipo escolhido
- cada tipo de grau deve ficar no intervalo `0..5`
- bonus de habilidades/poderes nao pode ultrapassar `5`

## Poderes genericos

- slots por nivel: marcos `[3, 6, 9, 12, 15, 18]`
- repeticao so quando `mecanicasEspeciais.repetivel=true`
- valida requisitos de:
  - nivel minimo
  - pericias
  - atributos
  - graus
  - pre-requisito de outros poderes
- valida `config` quando poder exige `escolha`

## Origem, cla, tecnica, trilha e caminho

- origem e cla precisam existir
- origem pode exigir grande cla
- tecnica inata:
  - deve existir
  - deve ser do tipo `INATA`
  - regras de hereditariedade e compatibilidade com cla sao validadas
- trilha:
  - deve existir e pertencer a classe
  - pode exigir pericias especificas
- caminho:
  - exige trilha informada
  - deve pertencer a trilha selecionada

## Integracao com inventario

- preview valida itens via `InventarioService.previewItensInventario`
- create adiciona itens via `InventarioService.adicionarItem` na mesma transacao do personagem
- em caso de erro de item no create, a transacao inteira e revertida

## Erros esperados (principais codigos)

## Entidade e relacionamento

- `PERSONAGEM_BASE_NOT_FOUND`
- `UPDATE_PERSONAGEM_FAILED`
- `CLASS_NOT_FOUND`
- `CLAN_NOT_FOUND`
- `ORIGIN_NOT_FOUND`
- `PATH_NOT_FOUND`
- `WAY_NOT_FOUND`

## Validacao de atributos/passivas

- `ATTRIBUTE_NOT_INTEGER`
- `ATTRIBUTE_OUT_OF_RANGE`
- `INVALID_ATTRIBUTE_SUM`
- `INVALID_EA_KEY_ATTRIBUTE`
- `TOO_MANY_PASSIVES`
- `INELIGIBLE_PASSIVES`
- `PASSIVES_CHOICE_REQUIRED`
- `PASSIVE_REQUIREMENT_NOT_MET`

## Treinamento/graus/pericias

- `TRAINING_LEVEL_INVALID`
- `TRAINING_EXCEEDS_IMPROVEMENTS`
- `TRAINING_SKILL_NOT_FOUND`
- `TRAINING_INVALID_PROGRESSION`
- `TRAINING_LEVEL_REQUIREMENT`
- `GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL`
- `GRADE_OUT_OF_RANGE`
- `GRADE_EXCEEDS_MAX_WITH_BONUS`
- `PERICIAS_LIVRES_EXCEDEM_LIMITE`

## Poderes e tecnicas

- `POWERS_EXCEED_SLOTS`
- `POWERS_NOT_FOUND`
- `POWER_NOT_REPEATABLE`
- `POWER_REQUIRES_CHOICE`
- `POWER_CONFIG_INVALID`
- `INNATE_TECHNIQUE_NOT_FOUND`
- `INNATE_TECHNIQUE_INVALID_TYPE`
- `HEREDITARY_TECHNIQUE_INCOMPATIBLE`

## Consistencia com schema (Prisma)

Modelos e constraints relevantes:

- `PersonagemBase`
  - campos de inventario/derivados/resistencias persistidos no proprio modelo
  - relacoes com `Cla`, `Origem`, `Classe`, `Trilha`, `Caminho`, `Alinhamento`, `TecnicaAmaldicoada`
- `GrauPersonagemBase`
  - `@@unique([personagemBaseId, tipoGrauId])`
- `PersonagemBasePericia`
  - `@@unique([personagemBaseId, periciaId])`
- `PersonagemBaseProficiencia`
  - `@@unique([personagemBaseId, proficienciaId])`
- `GrauTreinamentoPersonagemBase`
  - `@@unique([personagemBaseId, nivel, periciaCodigo])`
- `PersonagemBasePassiva`
  - `@@unique([personagemBaseId, passivaId])`
- `PersonagemBaseResistencia`
  - `@@unique([personagemBaseId, resistenciaTipoId])`

## Integracao frontend

- API client:
  - `assistenterpg-front/src/lib/api/personagens-base.ts`
- tipos:
  - `assistenterpg-front/src/lib/types/personagem.types.ts`
- consumo auxiliar:
  - `assistenterpg-front/src/lib/api/catalogos.ts` (`passivas-disponiveis`)

