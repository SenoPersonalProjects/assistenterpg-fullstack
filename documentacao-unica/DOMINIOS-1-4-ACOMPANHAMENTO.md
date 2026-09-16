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
