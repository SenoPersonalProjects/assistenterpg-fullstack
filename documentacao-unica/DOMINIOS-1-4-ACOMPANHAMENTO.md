# Motor de Domínios 1.4

Status: Em validação

## Escopo deste lote

- [x] Estado persistente para Domínios, alvos, disputas e defesas anti-Domínio.
- [x] Abertura de NPC sob confirmação do mestre e abertura por habilidade marcada no catálogo.
- [x] Barreira fechada/aberta, integridade, rupturas, reforço e reconfiguração.
- [x] Disputa com Dominância e registro de eventos.
- [x] Cesta Oca, Domínio Simples e Amplificação como estados persistentes.
- [x] Painel inicial de Domínios e barreiras na sessão.
- [x] Gatilho auditável de Acerto Garantido no início do turno, sem impor dano de técnica customizada.
- [ ] Testes unitários e bateria manual da sessão.
- [x] Migration aplicada no TiDB de teste e seed `tecnicas-nao-inatas` validado remotamente.
- [ ] Bateria manual de Domínios, barreiras, disputas e defesas anti-Domínio.

## Fora deste lote

Epifania/Domínio Incompleto, mapa tático, barreiras permanentes, Adição/Subtração geral e Concentração global permanecem para a etapa seguinte, conforme a delimitação aprovada.

## Retomada

O núcleo foi publicado no commit `53fba4b`. Antes de encerrar o lote, concluir a bateria manual de Domínios, barreiras, disputas e defesas anti-Domínio.

## Atualização — 2026-09-16

- [x] Encerrar, colapsar ou interromper um Domínio aplica Esgotamento da Técnica e Esgotamento de Domínio, inclusive para NPCs.
- [x] A CI do frontend, backend e documentação foi validada após essa alteração.
- [x] TiDB de teste: 119 tabelas, 110 migrations e seed de técnicas não inatas concluído.

## Blindagem de fluxos — 2026-09-16

- [x] Listas explícitas de alvos são rejeitadas quando repetem participantes ou
  incluem personagens/NPCs que não pertencem à cena atual.
- [x] A defesa anti-Domínio valida o participante, cobra EA/PE na mesma
  transação, substitui a defesa equivalente anterior e registra uma chave de
  idempotência no histórico.
- [x] Reconfigurar ou estabilizar barreiras rejeita Domínios que não estejam
  ativos, evitando mutações após encerramento ou colapso.
- [x] `prisma-transaction-policy`, lint, builds e a CI serão mantidos como
  evidências automáticas; a bateria manual continua acumulada para a sessão.
