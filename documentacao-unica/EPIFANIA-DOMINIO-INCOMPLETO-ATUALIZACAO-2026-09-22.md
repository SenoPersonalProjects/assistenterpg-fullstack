# Epifania e Dominio Incompleto — atualizacao de implementacao

Status: Em validacao manual

## Entrega

- A Epifania usa uma Expansao completa cadastrada na Tecnica Inata efetiva
  como perfil autoritativo. Nome, custos e estrutura deixam de depender de
  valores digitados pelo mestre, e o servidor recusa uma habilidade externa.
- Sem uma Expansao cadastrada, o perfil narrativo e salvo na ficha da
  campanha e reutilizado nos proximos usos. Ele nao cria conteudo global.
- Uma Epifania bem-sucedida passa a criar o Dominio em `ABRINDO`. O mestre
  pode `FORMAR` ou `INTERROMPER`; os bonus do Dominio Incompleto so existem
  depois da formacao e a interrupcao continua usando o esgotamento antecipado.
- Disputas usam uma rolagem real de Jujutsu no servidor. O evento registra
  expressao, dados, total e ajustes. Dominio Incompleto aplica literalmente
  `-2d20`, respeitando o piso de `1d20` do resolvedor.

## Validacao manual pendente

- [ ] Formar e interromper uma Epifania, confirmando que os bonus so aparecem
  apos `FORMAR` e que a interrupcao gera uma rodada de esgotamento.
- [ ] Selecionar uma Expansao cadastrada e conferir a cobranca automatica.
- [ ] Salvar e reutilizar um perfil narrativo sem Expansao cadastrada.
- [ ] Conferir o evento de uma disputa com Dominio Incompleto e validar o
  ajuste `-2d20` e os dados rolados.

## Operacao e barreira de grau 1 — 2026-09-24

- [x] A Epifania aceita grau de barreira 1. Em Dominio fechado, esse grau
  cria Integridade 3 e DT estrutural 18; grau 2 permanece com Integridade 4 e
  DT 21. Assim, a reducao do requisito nao elimina o risco estrutural.
- [x] As limitacoes anteriores continuam cumulativas: sem Acerto Garantido,
  `-2d20` literal em Refinamento e esgotamento proprio do Dominio Incompleto.
- [x] O endpoint devolve o resultado da rolagem. A interface mostra falha,
  DT da proxima tentativa e confirma que nenhum recurso foi gasto; em sucesso,
  informa que o Dominio esta em abertura e exige `Formar` para ativar bonus.
- [x] A tentativa falha continua registrada no historico e nao e tratada como
  erro de transporte.

## Validacao manual adicional

- [ ] Tentar uma Epifania com grau 1: confirmar Integridade 3 e DT estrutural
  18 no cartao, alem das limitacoes de Dominio Incompleto.
- [ ] Falhar e ter sucesso em uma Epifania: conferir o aviso imediato de
  resultado, a DT reduzida na nova tentativa e a janela `Abrindo` antes de
  usar `Formar` ou `Interromper`.
