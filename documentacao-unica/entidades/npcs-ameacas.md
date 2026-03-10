# NPCs e Ameacas (Ficha Simplificada)

Atualizado em: 2026-03-10

## Escopo

Modulo para criacao e manutencao de fichas simplificadas de NPCs e Ameacas.

Objetivo:

- acelerar preparacao de encontros;
- manter ficha com campos essenciais de mesa;
- permitir evolucao futura (ex.: calculo de VD, marketplace, uso por campanha/sessao).

Arquivos principais:

- backend:
  - [`assistenterpg-back/src/npcs-ameacas/npcs-ameacas.controller.ts`](../../assistenterpg-back/src/npcs-ameacas/npcs-ameacas.controller.ts)
  - [`assistenterpg-back/src/npcs-ameacas/npcs-ameacas.service.ts`](../../assistenterpg-back/src/npcs-ameacas/npcs-ameacas.service.ts)
  - [`assistenterpg-back/src/npcs-ameacas/dto/create-npc-ameaca.dto.ts`](../../assistenterpg-back/src/npcs-ameacas/dto/create-npc-ameaca.dto.ts)
  - [`assistenterpg-back/src/npcs-ameacas/dto/update-npc-ameaca.dto.ts`](../../assistenterpg-back/src/npcs-ameacas/dto/update-npc-ameaca.dto.ts)
  - [`assistenterpg-back/prisma/schema.prisma`](../../assistenterpg-back/prisma/schema.prisma) (`model NpcAmeaca`)
- frontend:
  - [`assistenterpg-front/src/lib/api/npcs-ameacas.ts`](../../assistenterpg-front/src/lib/api/npcs-ameacas.ts)
  - [`assistenterpg-front/src/lib/types/npc-ameaca.types.ts`](../../assistenterpg-front/src/lib/types/npc-ameaca.types.ts)
  - [`assistenterpg-front/src/components/npc-ameaca/NpcAmeacaForm.tsx`](../../assistenterpg-front/src/components/npc-ameaca/NpcAmeacaForm.tsx)
  - [`assistenterpg-front/src/app/npcs-ameacas/page.tsx`](../../assistenterpg-front/src/app/npcs-ameacas/page.tsx)

## Autorizacao

Todas as rotas exigem JWT (`AuthGuard('jwt')`).

Regra de acesso:

- usuario autenticado so pode ver/editar/remover as proprias fichas (`donoId`).

## Endpoints

- `POST /npcs-ameacas`
- `GET /npcs-ameacas/meus`
  - query opcional:
    - `page`, `limit`
    - `nome`
    - `fichaTipo`: `NPC | AMEACA`
    - `tipo`: `HUMANO | FEITICEIRO | MALDICAO | ANIMAL | HIBRIDO | OUTRO`
    - `tamanho`: `MINUSCULO | PEQUENO | MEDIO | GRANDE | ENORME | COLOSSAL`
- `GET /npcs-ameacas/:id`
- `PATCH /npcs-ameacas/:id`
- `DELETE /npcs-ameacas/:id`

## Campos da ficha

Campos principais:

- identificacao:
  - `nome`
  - `descricao`
  - `fichaTipo` (`NPC` ou `AMEACA`)
  - `tipo`
  - `tamanho`
  - `vd` (placeholder)
- atributos:
  - `agilidade`, `forca`, `intelecto`, `presenca`, `vigor`
- pericias principais:
  - bonus:
    - `percepcao`, `iniciativa`, `fortitude`, `reflexos`, `vontade`, `luta`, `jujutsu`
  - dados (override opcional):
    - `percepcaoDados`, `iniciativaDados`, `fortitudeDados`, `reflexosDados`, `vontadeDados`, `lutaDados`, `jujutsuDados`
- combate:
  - `defesa`
  - `pontosVida`
  - `machucado` (opcional)
  - `deslocamentoMetros`
- listas:
  - `resistencias: string[]`
  - `vulnerabilidades: string[]`
  - `periciasEspeciais: { codigo, dados?, bonus?, descricao? }[]`
  - `passivas: { nome, descricao, gatilho?, alcance?, alvo?, duracao?, requisitos?, efeitoGuia? }[]`
  - `acoes: { nome, tipoExecucao?, alcance?, alvo?, duracao?, resistencia?, dtResistencia?, custoPE?, custoEA?, teste?, dano?, critico?, efeito?, requisitos?, descricao? }[]`
- apoio narrativo:
  - `usoTatico`

Observacao:

- `vd` permanece sem formula automatica nesta etapa.
- campos de `passivas` e `acoes` funcionam como guia de mesa para o mestre (sem automacao mecanica no sistema).
- `periciasEspeciais` aceitam apenas codigos oficiais de pericia (tabela `Pericia`).
- para dados de pericia, o sistema usa padrao por atributo quando nao houver override:
  - atributo `> 0`: rola `atributo` dados e pega o melhor.
  - atributo `<= 0`: rola `2 + abs(atributo)` dados e pega o pior.

## Persistencia

Model Prisma: `NpcAmeaca`.

Pontos importantes:

- relacao `Usuario 1:N NpcAmeaca` via `donoId`;
- listas estruturadas sao salvas em colunas JSON;
- indexes:
  - `NpcAmeaca_donoId_idx`
  - `NpcAmeaca_donoId_nome_idx`

Migration:

- [`assistenterpg-back/prisma/migrations/20260309173000_add_npcs_ameacas/migration.sql`](../../assistenterpg-back/prisma/migrations/20260309173000_add_npcs_ameacas/migration.sql)
- [`assistenterpg-back/prisma/migrations/20260310183000_npc_ameaca_enums_pericias_dados/migration.sql`](../../assistenterpg-back/prisma/migrations/20260310183000_npc_ameaca_enums_pericias_dados/migration.sql)

## Erros esperados

- `NPC_AMEACA_NOT_FOUND` (`404`):
  - id inexistente ou sem acesso (na pratica, nao encontrado para o dono autenticado).
- erros transversais:
  - `VALIDATION_ERROR` (`400`) para DTO/params invalidos.
  - erros de banco (`DB_*`) via `handlePrismaError`.

## Integracao frontend

Rotas de pagina:

- `/npcs-ameacas`
- `/npcs-ameacas/novo`
- `/npcs-ameacas/[id]`
- `/npcs-ameacas/[id]/editar`

Cliente:

- `apiGetMeusNpcsAmeacas`
- `apiGetNpcAmeaca`
- `apiCreateNpcAmeaca`
- `apiUpdateNpcAmeaca`
- `apiDeleteNpcAmeaca`

## Uso em sessoes/cenas de campanha

NPCs/Ameacas podem ser instanciados na cena atual de uma sessao de campanha.

Persistencia:

- `model NpcAmeacaSessao` em [`assistenterpg-back/prisma/schema.prisma`](../../assistenterpg-back/prisma/schema.prisma)
- migration:
  - [`assistenterpg-back/prisma/migrations/20260309194500_npc_ameaca_sessao/migration.sql`](../../assistenterpg-back/prisma/migrations/20260309194500_npc_ameaca_sessao/migration.sql)

Regras:

- apenas mestre pode adicionar/editar/remover NPCs na sessao;
- cada instancia fica vinculada a uma `cenaId` (controle por cena);
- a instancia guarda snapshot (nome/valores/passivas/acoes) para uso em mesa;
- passivas e acoes continuam descritivas (guia), sem efeitos automatizados.

Endpoints relacionados (modulo de sessao):

- `POST /campanhas/:campanhaId/sessoes/:sessaoId/npcs`
- `PATCH /campanhas/:campanhaId/sessoes/:sessaoId/npcs/:npcSessaoId`
- `DELETE /campanhas/:campanhaId/sessoes/:sessaoId/npcs/:npcSessaoId`

## Exemplo de payload (criacao)

```json
{
  "nome": "Akane Fujimoto",
  "descricao": "Civil vulneravel, alvo de resgate.",
  "fichaTipo": "NPC",
  "tipo": "HUMANO",
  "tamanho": "MEDIO",
  "vd": 15,
  "agilidade": 1,
  "forca": 0,
  "intelecto": 1,
  "presenca": 2,
  "vigor": 1,
  "percepcao": 2,
  "iniciativa": 3,
  "fortitude": 3,
  "reflexos": 3,
  "vontade": 4,
  "luta": 2,
  "jujutsu": 0,
  "percepcaoDados": 1,
  "iniciativaDados": 1,
  "fortitudeDados": 1,
  "reflexosDados": 1,
  "vontadeDados": 1,
  "lutaDados": 1,
  "jujutsuDados": 1,
  "defesa": 12,
  "pontosVida": 22,
  "machucado": 11,
  "deslocamentoMetros": 6,
  "resistencias": ["mental leve"],
  "vulnerabilidades": ["dano fisico"],
  "periciasEspeciais": [
    { "codigo": "DIPLOMACIA", "dados": 2, "bonus": 6 },
    { "codigo": "INTUICAO", "dados": 2, "bonus": 4 }
  ],
  "passivas": [
    { "nome": "Fragil", "descricao": "Recebe +2 dano fisico." }
  ],
  "acoes": [
    {
      "nome": "Empurrar/Defesa desesperada",
      "tipoExecucao": "PADRAO",
      "teste": "1d20+2",
      "dano": "1d3",
      "efeito": "Afasta alvo para ganhar tempo."
    }
  ],
  "usoTatico": "Objetivo de resgate e dilema moral."
}
```
