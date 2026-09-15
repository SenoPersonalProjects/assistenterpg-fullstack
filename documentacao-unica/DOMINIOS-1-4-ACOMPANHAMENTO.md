# Motor de Domínios 1.4

Status: Em validação

## Escopo deste lote

- [x] Estado persistente para Domínios, alvos, disputas e defesas anti-Domínio.
- [x] Abertura de NPC sob confirmação do mestre e abertura por habilidade marcada no catálogo.
- [x] Barreira fechada/aberta, integridade, rupturas, reforço e reconfiguração.
- [x] Disputa com Dominância e registro de eventos.
- [x] Cesta Oca, Domínio Simples e Amplificação como estados persistentes.
- [x] Painel inicial de Domínios e barreiras na sessão.
- [ ] Gatilho automático de Acerto Garantido no início do turno.
- [ ] Testes unitários e bateria manual da sessão.
- [ ] Backup, migration e seed no TiDB; validação remota e publicação.

## Fora deste lote

Epifania/Domínio Incompleto, mapa tático, barreiras permanentes, Adição/Subtração geral e Concentração global permanecem para a etapa seguinte, conforme a delimitação aprovada.

## Retomada

Antes de publicar, concluir o gatilho auditável de Acerto Garantido, cobrir permissões e disputas, executar os builds completos e usar `update-tidb.ps1` com backup, migration e seed `tecnicas-nao-inatas`.
