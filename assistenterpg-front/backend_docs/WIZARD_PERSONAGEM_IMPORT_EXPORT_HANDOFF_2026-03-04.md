# Wizard de Personagem + Import/Export (Handoff Front)

Data: 2026-03-04  
Escopo: backend `personagens-base` (wizard de criacao + compartilhamento de ficha por JSON)

## 1) O que foi feito

### 1.1 Novos endpoints

- `GET /personagens-base/:id/exportar`
  - Exporta uma ficha existente em JSON, no formato pronto para reimportacao.
  - Retorna metadados (`schema`, `schemaVersion`, `exportadoEm`) + `personagem` + `referencias`.

- `POST /personagens-base/importar`
  - Recebe o JSON exportado e cria uma nova ficha para o usuario autenticado.
  - Usa validacoes do fluxo normal de criacao (`criar`) para manter regras do wizard.
  - Suporta `nomeSobrescrito` para importar com outro nome.

### 1.2 Bugs corrigidos no wizard

- Correcao de duplicacao de itens ao criar personagem:
  - Antes: itens podiam entrar duas vezes na criacao (persistencia + `InventarioService.adicionarItem`).
  - Agora: o estado base e persistido sem `itensInventario`, e os itens entram apenas via `InventarioService` (fluxo validado).

- Correcao de validacao de inventario no preview:
  - Antes: validacao era feita item a item isolado.
  - Agora: tentativa principal e em lote (`previewItensInventario` com todos os itens).
  - Fallback mantido por item para retornar erros localizados quando houver falha por item.

## 2) Arquivos alterados

- `src/personagem-base/dto/importar-personagem-base.dto.ts` (novo)
  - DTO de importacao com:
    - `personagem` (payload principal)
    - `schema`, `schemaVersion`, `exportadoEm`
    - `nomeSobrescrito`
    - `referencias` (fallback de resolucao de IDs por nome/codigo)

- `src/personagem-base/personagem-base.controller.ts`
  - Adicionados:
    - `GET :id/exportar`
    - `POST importar`

- `src/personagem-base/personagem-base.service.ts`
  - Novos metodos:
    - `exportar`
    - `importar`
    - helpers de resolucao de referencias para importacao
  - Ajustes de wizard:
    - criacao sem persistir `itensInventario` diretamente no estado base
    - preview de inventario em lote

- `docs/API_CONTRACT_SNAPSHOT.md`
  - Atualizada lista de rotas de `personagens-base`.

- `docs/CONTRATO_API_CHANGELOG.md`
  - Atualizado changelog de contrato com novos endpoints e correcoes.

## 3) Contrato de exportacao

Resposta de `GET /personagens-base/:id/exportar`:

```json
{
  "schema": "assistenterpg.personagem-base.v1",
  "schemaVersion": 1,
  "exportadoEm": "2026-03-04T12:34:56.789Z",
  "personagem": {
    "nome": "Megumi",
    "nivel": 7,
    "claId": 1,
    "origemId": 2,
    "classeId": 3,
    "trilhaId": 4,
    "caminhoId": null,
    "agilidade": 2,
    "forca": 1,
    "intelecto": 4,
    "presenca": 1,
    "vigor": 2,
    "estudouEscolaTecnica": true,
    "idade": 18,
    "prestigioBase": 95,
    "prestigioClaBase": null,
    "alinhamentoId": null,
    "background": null,
    "atributoChaveEa": "INT",
    "tecnicaInataId": 10,
    "proficienciasCodigos": [],
    "grausAprimoramento": [],
    "grausTreinamento": [],
    "poderesGenericos": [],
    "passivasAtributoIds": [],
    "passivasAtributosAtivos": [],
    "passivasAtributosConfig": {},
    "periciasClasseEscolhidasCodigos": [],
    "periciasOrigemEscolhidasCodigos": [],
    "periciasLivresCodigos": [],
    "periciasLivresExtras": 0,
    "itensInventario": []
  },
  "referencias": {
    "cla": { "id": 1, "nome": "Zenin" },
    "origem": { "id": 2, "nome": "..." },
    "classe": { "id": 3, "nome": "..." },
    "trilha": { "id": 4, "nome": "..." },
    "caminho": null,
    "alinhamento": null,
    "tecnicaInata": { "id": 10, "codigo": "TEN_SHADOWS", "nome": "..." },
    "poderesGenericos": [],
    "passivas": [],
    "itensInventario": []
  }
}
```

Nota importante:

- `grausAprimoramento` e exportado com `valorLivre` (nao com total incluindo bonus), para nao duplicar bonus ao importar.

## 4) Contrato de importacao

Request de `POST /personagens-base/importar`:

```json
{
  "schema": "assistenterpg.personagem-base.v1",
  "schemaVersion": 1,
  "nomeSobrescrito": "Megumi (Importado)",
  "personagem": { "...payload de CreatePersonagemBaseDto..." },
  "referencias": { "...fallbacks opcionais..." }
}
```

Resposta:

```json
{
  "id": 123,
  "nome": "Megumi (Importado)",
  "nivel": 7,
  "cla": "Zenin",
  "origem": "...",
  "classe": "...",
  "trilha": "...",
  "caminho": null,
  "importado": true,
  "schema": "assistenterpg.personagem-base.v1",
  "schemaVersion": 1,
  "importadoEm": "2026-03-04T12:40:00.000Z"
}
```

## 5) Como implementar no front (sugestao direta)

### 5.1 Tela de personagem criado

- Adicionar botao `Exportar JSON` no detalhe da ficha.
- Chamar `GET /personagens-base/:id/exportar`.
- Gerar download local de arquivo (`Blob`) com nome sugerido:
  - `personagem-<nome>-<yyyy-mm-dd>.json`

### 5.2 Importacao

- Adicionar acao `Importar JSON` (lista de personagens ou wizard step inicial).
- Fluxo recomendado:
  1. selecionar arquivo `.json`
  2. fazer parse local
  3. enviar objeto para `POST /personagens-base/importar`
  4. em sucesso, redirecionar para ficha criada
  5. em erro 400/422, mostrar motivo no modal

### 5.3 States de UX para nao quebrar o wizard

- `loading` de upload/importacao com bloqueio de submit.
- tratamento claro de erros por regra (ex.: classe/trilha invalida, poder inexistente, item invalido).
- fallback de nome duplicado:
  - permitir `nomeSobrescrito` antes de enviar.

## 6) Sugestoes de melhoria de front-end do wizard

- Stepper com validacao por etapa:
  - bloquear avancar sem dados minimos validos por etapa.

- Preview incremental mais claro:
  - cards fixos para `Atributos Derivados`, `Pericias`, `Inventario`, `Erros`.
  - destacar mudancas por diff quando o usuario altera escolhas.

- Inventario no wizard:
  - validar em lote no front para espelhar comportamento do backend.
  - mostrar `espacos ocupados / total` em tempo real.
  - avisos visuais para sobrecarga e limites de categoria.

- Poderes/passivas:
  - mostrar prerequisitos no UI antes da selecao.
  - exibir por que uma opcao esta bloqueada.

- Import/export UX:
  - modal com preview minimo do arquivo (nome, nivel, classe, trilha) antes de confirmar importacao.
  - opcao de sobrescrever nome no mesmo modal.
  - historico local dos ultimos 3 arquivos importados (somente metadados, sem persistir dados sensiveis).

## 7) Observacoes de compatibilidade

- Endpoints antigos do wizard foram preservados.
- Fluxo de criacao continua usando validacoes do mesmo service/engine.
- Importacao reutiliza o mesmo fluxo de `criar`, evitando regras paralelas.
