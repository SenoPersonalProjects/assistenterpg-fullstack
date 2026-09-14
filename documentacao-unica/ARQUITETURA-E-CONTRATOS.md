# Arquitetura e contratos de fronteira

## Fonte de verdade por camada

- Backend: DTOs, guards e serviços NestJS são a autoridade de validação e
  autorização.
- Frontend: `lib/types/` representa o contrato consumido, e `lib/api/`
  concentra transporte HTTP e normalização de envelopes.
- Sessão: `lib/campanha/sessao-atualizacoes.ts` normaliza snapshots recebidos
  antes do consumo pela UI; campos de condições ausentes equivalem a `[]`.
- Realtime: Socket.IO é acelerador. Polling e sincronização por visibilidade
  são contingências, não fontes concorrentes de verdade.

## Regras de evolução

1. Alterar primeiro o DTO/backend e seu teste de contrato.
2. Manter respostas resumidas e completas como uniões discriminadas pela
   propriedade `visibilidade`.
3. Normalizar payload externo na camada API antes de renderizar componentes.
4. Preservar compatibilidade para campos legados apenas na normalização;
   componentes não devem inferir dados privados ausentes.
5. Para WebSocket, reutilizar a mesma normalização do carregamento HTTP.

## Teste de fronteira mínimo

Ao modificar sessão, campanha ou privacidade, validar pelo menos:

- mestre, dono/controlador e terceiro recebem as visibilidades corretas;
- listas ausentes, nulas e vazias não desmontam a página;
- uma atualização incremental não sobrescreve alteração otimista confirmada;
- payload novo continua compatível com o snapshot anterior suportado.

Os tipos de controles de tela permanecem próximos aos componentes. Tipos de
transporte, estado de sessão e normalizadores pertencem a `lib/`, para evitar
que a UI se torne a fonte implícita do contrato.
