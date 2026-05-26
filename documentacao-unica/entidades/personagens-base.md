# Personagens Base (Contrato Detalhado)

Atualizado em: 2026-03-12

## Escopo

Este documento detalha o contrato real do módulo `personagens-base`, cruzando:

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
- exceções:
  - `assistenterpg-back/src/common/exceptions/personagem.exception.ts`
- schema:
  - `assistenterpg-back/prisma/schema.prisma` (models de `PersonagemBase` e relacionamentos)
- integracao frontend:
  - `assistenterpg-front/src/lib/api/personagens-base.ts`
  - `assistenterpg-front/src/lib/types/personagem.types.ts`
  - `assistenterpg-front/src/app/personagens-base/novo/page.tsx`
  - `assistenterpg-front/src/components/personagem-base/create/modal/FontesConteudoModal.tsx`
  - `assistenterpg-front/src/lib/utils/fontes-conteudo.ts`

## Matriz de autorizacao

- todas as rotas do módulo usam `Auth: JWT` (`@UseGuards(AuthGuard('jwt'))` no controller)

## Endpoints

## Criacao e preview

- `POST /personagens-base`
  - body: `CreatePersonagemBaseDto`
  - cria personagem + relacionamentos + (opcional) itens iniciais de inventário em transação
  - resposta: resumo `{ id, nome, nível, cla, origem, classe, trilha, caminho }`

- `POST /personagens-base/preview`
  - body: `CreatePersonagemBaseDto`
  - não persiste em banco
  - retorna dto normalizado + derivados + perícias + graus + passivas + poderes + resistencias + preview de itens
  - se algum item de inventário for inválido, o preview retorna `errosItens` sem falhar tudo

## Endpoints auxiliares de criação

- `GET /personagens-base/graus-treinamento/info?nivel=<int>&intelecto=<int>`
  - query: `ConsultarInfoGrausTreinamentoDto`
  - retorno:
    - `niveisDisponiveis` (subset de `[3, 7, 11, 16]`, cada um com `maxMelhorias = 2 + intelecto`)
    - `limitesGrau` (`graduado: 3`, `veterano: 9`, `expert: 16`)

- `POST /personagens-base/graus-treinamento/perícias-elegiveis`
  - body: `ConsultarPericiasElegiveisDto`
  - entrada: `periciasComGrauInicial: string[]`
  - retorno: array de perícias existentes com `grauAtual: 5`

- `GET /personagens-base/passivas-disponíveis`
  - retorno agrupado por atributo (`AGI`, `FOR`, `INT`, `PRE`, `VIG`)
  - cada item inclui: `id`, `codigo`, `nome`, `nível`, `requisito`, `descricao`, `efeitos`

- `GET /personagens-base/tecnicas-disponiveis?claId=<int>&origemId=<int?>`
  - `claId` obrigatório (`ParseIntPipe`)
  - `origemId` opcional (`ParseIntPipe` opcional)
  - retorno: `{ hereditárias, naoHereditarias, todas }`
  - se origem bloqueia técnica hereditária, as hereditárias são filtradas

Contrato de erro validado em teste de integracao:

- `GET /personagens-base/tecnicas-disponiveis?claId=abc` -> `400`, `code: VALIDATION_ERROR`
- `GET /personagens-base/tecnicas-disponiveis?claId=1&origemId=abc` -> `400`, `code: VALIDATION_ERROR`
- `GET /personagens-base/graus-treinamento/info?nivel=0&intelecto=1` -> `400`, `code: VALIDATION_ERROR`, `field: nivel`

## Consulta e manutencao

- `GET /personagens-base/meus`
  - query opcional: `page`, `limit`
  - sem `page/limit`: lista resumida do usuário autenticado
  - com `page/limit`: `{ items, total, page, limit, totalPages }`

- `GET /personagens-base/:id?incluirInventario=true|false`
  - retorna detalhe completo mapeado em `personagem-base.mapper.ts`
  - `incluirInventario=true` adiciona resumo agregado do inventário

- `PATCH /personagens-base/:id`
  - body: `UpdatePersonagemBaseDto` (parcial)
  - fluxo real:
    - carrega estado atual
    - monta `dtoCompleto`
    - revalida regras de origem/cla/técnica e trilha/caminho
    - recalcula estado completo no engine
    - aplica rebuild de relacionamentos
    - quando `itensInventario` e enviado, o inventário é sincronizado no mesmo fluxo:
      - remove itens/modificacoes atuais
      - recria os itens enviados via `InventarioService`
      - `itensInventario: []` limpa o inventário do personagem

- `DELETE /personagens-base/:id`
  - remove personagem e tabelas relacionadas (inventário, habilidades, poderes, passivas, resistencias, etc)
  - retorno: `{ "sucesso": true }`

## Exportacao e importação

- `GET /personagens-base/:id/exportar`
  - resposta em JSON com headers de download
  - formato:
    - `schema`
    - `schemaVersion`
    - `exportadoEm`
    - `personagem` (`CreatePersonagemBaseDto`)
    - `referências` (ids/nomes/codigos auxiliares para resolver catálogos na importação)

- `POST /personagens-base/importar`
  - body: `ImportarPersonagemBaseDto`
  - resolve referências por `id`, `nome` e/ou `codigo` antes de criar
  - permite `nomeSobrescrito`
  - resposta inclui metadados de importação:
    - `importado: true`
    - `schema`
    - `schemaVersion`
    - `importadoEm`

## Payloads aceitos (DTO)

## `CreatePersonagemBaseDto` (campos principais)

- identificacao/base:
  - `nome: string` (obrigatório)
  - `nível: int >= 1`
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
  - `grausTreinamento?: Array<{ nível: 3|7|11|16; melhorias: [...] }>`
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
- validações de faixa/tipo seguem as mesmas do create

## Regras de negocio (engine + regras-criação)

## Atributos

- cada atributo deve ser inteiro entre `0` e `7`
- soma obrigatória:
  - `9 + quantidade de marcos atingidos`
  - marcos: `4, 7, 10, 13, 16, 19`

## Passivas

- elegibilidade por atributo com valor `>= 3`
- máximo de 2 atributos com passivas
- quando existem mais de 2 elegiveis:
  - no create/update (`strictPassivas=true`) exige escolha explícita de 2
  - no preview (`strictPassivas=false`) pode retornar `passivasNeedsChoice`
- passivas de intelecto (`INT_I`/`INT_II`) validam:
  - limite de escolhas extra (perícias/proficiencias)
  - perícia de treino obrigatória
  - limite de grau máximo ao aplicar bônus

## PV em Barras (Blefe Mortal / Corpo Amaldicoado Independente)

- `atributosDerivados.pvBarrasTotal`:
  - Numero total de barras de PV (default `1`).
  - Quando `>= 2`, o PV atual representa **apenas a barra ativa**.
- `PersonagemCampanha` (campanha/sessão):
  - `pvBarrasTotal`, `pvBarrasRestantes`
  - `nucleoAmaldicoadoAtivo`, `nucleosDisponiveis`
  - `pvBarraMaxAtual` (calculado)
- Regra de cálculo:
  - `pvBarraMaxBase = floor(pvMax / pvBarrasTotal)`
  - ultima barra recebe o restante
  - `pvAtual` e clamp sempre usam `pvBarraMaxAtual`

## Perícias

- perícias de origem e classe com grupos de escolha validam cardinalidade (1 por grupo)
- escola técnica aplica regra adicional sobre `JUJUTSU`
- perícias livres:
  - limite final = `classe.periciasLivresBase + intelecto + extras de passivas`

## Graus de treinamento

- níveis válidos para evolução: `3`, `7`, `11`, `16`
- por nível, max melhorias: `2 + intelecto`
- progressão válida somente em passos de `+5`
- limite por nível:
  - `10` (Graduado) requer nível `>= 3`
  - `15` (Veterano) requer nível `>= 9`
  - `20` (Expert) requer nível `>= 16`

## Graus de aprimoramento

- graus livres base por nível: marcos `[2, 8, 14, 18]`
- extras:
  - habilidades com `mecânicasEspeciais.graus_livres`
  - `INT_II` pode conceder +1 grau em tipo escolhido
- cada tipo de grau deve ficar no intervalo `0..5`
- bônus de habilidades/poderes não pode ultrapassar `5`

## Poderes genéricos

- slots por nível: marcos `[3, 6, 9, 12, 15, 18]`
- repeticao só quando `mecânicasEspeciais.repetivel=true`
- válida requisitos de:
  - nível mínimo
  - perícias
  - atributos
  - graus
  - pre-requisito de outros poderes
- válida `config` quando poder exige `escolha`

## Config de habilidades (habilidadesConfig)

- campo opcional no DTO para registrar escolhas de habilidades/origens/trilhas
- formato:
  - `[{ habilidadeId: number, config: { periciasCodigos?: string[] } }]`
- usado quando `mecânicasEspeciais.escolha.tipo = "PERICIAS"`
- deve respeitar a quantidade exigida e regras de permissão (perícias/atributos base)

## Mecanicas especiais (habilidades/origens)

- `mecânicasEspeciais.escolha`:
  - `{ tipo: "PERICIAS", quantidade?: number, periciasPermitidas?: string[], atributosBasePermitidos?: string[] }`
  - quando presente, exige `habilidadesConfig` com `periciasCodigos`
- `mecânicasEspeciais.periciasBonusEscolha`:
  - bônus fixo aplicado em cada perícia escolhida
- `mecânicasEspeciais.periciasTreinadasEscolha`:
  - se `true`, perícia escolhida vira treinada (ou recebe bônus)
- `mecânicasEspeciais.bonusSeJaTreinadoEscolha`:
  - bônus aplicado quando a perícia já era treinada
- `mecânicasEspeciais.periciasBonus`:
  - objeto `{"CODIGO_PERICIA": bônus}` (pode ser negativo)
  - soma no `bonusExtra` da perícia durante o recálculo do estado
- `mecânicasEspeciais.periciasAtributoBase`:
  - objeto `{"CODIGO_PERICIA": "AGI|FOR|INT|PRE|VIG"}`
  - sobrescreve o atributo-base da perícia no preview/detalhe/sessão
- `mecânicasEspeciais.resistencias`:
  - aceita número fixo ou atributo (ex.: `"MENTAL": "INTELECTO"`)
  - atributos aceitos: `FOR/AGI/INT/PRE/VIG` (ou nomes completos)
- `mecânicasEspeciais.recursos.atributoChaveEa`:
  - `"INT"` ou `"PRE"`
  - sobrescreve o atributo-chave usado no cálculo de EA/PE
- `mecânicasEspeciais.pvExtra`:
  - bônus fixo em PV máximo
- `mecânicasEspeciais.sanPorNivel`:
  - bônus por nível aplicado ao SAN máximo
- `mecânicasEspeciais.sanidade.multiplicadorInicial`:
  - multiplicador aplicado ao SAN máximo final (ex.: `0.5`)
- `mecânicasEspeciais.prestigioClaBase`:
  - se `prestigioClaBase` não vier no DTO, a habilidade define o valor base
- `mecânicasEspeciais.itens.reduzCategoriaEm`:
  - reduz em `N` etapas a categoria de **um** item (ex.: origem Engenheiro)
  - ordem de categorias: `0 -> 4 -> 3 -> 2 -> 1 -> ESPECIAL`
- `mecânicasEspeciais.itens.excetoTipos`:
  - lista de tipos de equipamento que **não** podem receber a redução (ex.: `['ARMA']`)
- `mecânicasEspeciais.economia.creditoCategoriaBonus`:
  - bônus aplicado ao limite de credito (ex.: origem Magnata)
  - cada ponto sobe um nível na tabela de credito

## Origem, cla, técnica, trilha e caminho

- origem e cla precisam existir
- origem pode exigir grande cla
- técnica inata:
  - deve existir
  - deve ser do tipo `INATA`
  - regras de hereditariedade e compatibilidade com cla são validadas
- trilha:
  - deve existir e pertencer a classe
  - pode exigir perícias específicas
- caminho:
  - exige trilha informada
  - deve pertencer a trilha selecionada

## Integracao com inventario

- preview válida itens via `InventarioService.previewItensInventario`
- create adiciona itens via `InventarioService.adicionarItem` na mesma transacao do personagem
- update sincroniza inventario quando o campo `itensInventario` e enviado no `PATCH /personagens-base/:id`
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

## Treinamento/graus/perícias

- `TRAINING_LEVEL_INVALID`
- `TRAINING_EXCEEDS_IMPROVEMENTS`
- `TRAINING_SKILL_NOT_FOUND`
- `TRAINING_INVALID_PROGRESSION`
- `TRAINING_LEVEL_REQUIREMENT`
- `GRAUS_APRIMORAMENTO_EXCEDEM_TOTAL`
- `GRADE_OUT_OF_RANGE`
- `GRADE_EXCEEDS_MAX_WITH_BONUS`
- `PERICIAS_LIVRES_EXCEDEM_LIMITE`

## Poderes e técnicas

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
  - campos de inventário/derivados/resistências persistidos no próprio modelo
  - relações com `Cla`, `Origem`, `Classe`, `Trilha`, `Caminho`, `Alinhamento`, `TecnicaAmaldicoada`
- `GrauPersonagemBase`
  - `@@unique([personagemBaseId, tipoGrauId])`
- `PersonagemBasePericia`
  - `@@unique([personagemBaseId, periciaId])`
- `PersonagemBaseProficiencia`
  - `@@unique([personagemBaseId, proficienciaId])`
- `GrauTreinamentoPersonagemBase`
  - `@@unique([personagemBaseId, nível, periciaCodigo])`
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
  - `assistenterpg-front/src/lib/api/catálogos.ts` (`passivas-disponíveis`)
- listagem:
  - `assistenterpg-front/src/app/personagens-base/page.tsx` com pre-visualizacao em modal antes da navegação completa
  - componente: `assistenterpg-front/src/components/personagem-base/PersonagemBasePreviewModal.tsx`

### Técnicas não-inatas na ficha (aba Poderes)

- a tela de detalhe do personagem (`assistenterpg-front/src/app/personagens-base/[id]/page.tsx`) passou a renderizar, dentro da aba `Poderes`, duas subsecoes explícitas:
  - `Técnica Inata` (técnica escolhida no personagem; um personagem possui apenas uma técnica inata, com múltiplas habilidades/variações)
  - `Técnicas Não Inatas` (derivadas automaticamente dos graus de aprimoramento do personagem)
- regra de negócio atual:
  - o jogador **não escolhe manualmente** habilidades não-inatas
  - o backend calcula as técnicas/habilidades/variações disponíveis com base em `grausAprimoramento` e `requisitos.graus`
  - a persistência da relação ocorre em `PersonagemBaseTecnica` (`tecnicasAprendidas`) no create/update
- o cálculo centraliza em:
  - `assistenterpg-back/src/personagem-base/regras-criacao/regras-tecnicas-nao-inatas.ts`
  - `assistenterpg-back/src/personagem-base/personagem-base.service.ts` (`listarTecnicasNaoInatasAtivasPorGraus`)
  - `assistenterpg-back/src/personagem-base/personagem-base.mapper.ts` (filtro final de habilidades e variações por grau no detalhe)
- no frontend, a aba `Poderes` usa as técnicas não-inatas que já vem do `GET /personagens-base/:id` (campo `tecnicasNaoInatas`), sem nova consulta manual ao catálogo para montar essa lista.
- o detalhe do personagem também retorna `tecnicaInata` completa (com habilidades e variações), permitindo exibir as habilidades da técnica inata diretamente na ficha.
- a renderizacao detalhada (metadados, efeito, requisitos e variações por habilidade) foi centralizada em:
  - `assistenterpg-front/src/components/personagem-base/sections/SecaoPoderes.tsx`

### Fluxo de fontes de conteúdo (frontend de criação)

- antes de preencher o wizard de criação, a tela `app/personagens-base/novo/page.tsx` abre o modal `FontesConteudoModal`.
- o sistema base é sempre considerado ativo e não pode ser removido.
- o usuário pode habilitar fontes extras:
  - suplementos oficiais ativos (`GET /suplementos/me/ativos`)
  - homebrews acessiveis (merge de `GET /homebrews?apenasPublicados=true` com `GET /homebrews/meus`)
- a seleção é persistida localmente no navegador por `usuarioId` (chave de storage dedicada), evitando reconfiguração a cada abertura da tela.
- após confirmar o modal, o frontend aplica filtro local por `fonte/suplementoId/homebrewId` usando `lib/utils/fontes-conteudo.ts` em:
  - classes, clas, origens, técnicas inatas, trilhas, equipamentos e modificações.
- o catálogo de técnicas inatas agora é buscado com `incluirHabilidades=true`:
  - `assistenterpg-front/src/lib/api/catálogos.ts` (`apiGetTecnicasInatas`)
  - cada técnica inata passa a carregar também `habilidades` (e variações) no payload usado pelo wizard.
- no passo `Cla e técnica inata` do wizard:
  - `assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepClaTecnica.tsx`
  - ao selecionar uma técnica, o usuário visualiza o "pacote" com preview das habilidades liberadas (nome, execução/duração/alcance e custo base).
- no passo de revisao:
  - `assistenterpg-front/src/components/personagem-base/create/wizard/PersonagemBaseStepRevisao.tsx`
  - o resumo exibe contador de habilidades da técnica inata e highlights das primeiras habilidades cadastradas.
- ao alterar fontes, o wizard e reiniciado (remount por chave de seleção) para evitar inconsistencias de estado entre seleção antiga e novo catálogo visivel.
