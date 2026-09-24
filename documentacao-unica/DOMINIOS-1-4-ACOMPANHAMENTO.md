# Motor de Domínios 1.4

Status: Em validação

## Escopo deste lote

- [x] Estado persistente para Domínios, alvos, disputas e defesas anti-Domínio.
- [x] Abertura de NPC sob confirmação do mestre e abertura por habilidade marcada no catálogo.
- [x] Barreira fechada/aberta, integridade, rupturas, reforço e reconfiguração.
- [x] Disputa com Dominância e registro de eventos.
- [x] Cesta Oca, Domínio Simples e Amplificação como estados persistentes.
- [x] Painel inicial de Domínios e barreiras na sessão.
- [x] Fluxo guiado de criação de disputa, com participantes/alvos selecionados por nome e explicação de Dominância.
- [x] Linha do tempo de Domínios no histórico do mestre, com contexto, filtros e detalhes estruturados.
- [x] Avisos operacionais de abertura interrompível, Instabilidade, barreira e neutralização de Acerto Garantido.
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
- [x] O endpoint direto de defesa é exclusivo do mestre/NPC; personagens usam
  a habilidade catalogada, cujo custo é calculado pelo backend e não pelo
  cliente.
- [x] Reconfigurar ou estabilizar barreiras rejeita Domínios que não estejam
  ativos, evitando mutações após encerramento ou colapso.
- [x] `prisma-transaction-policy`, lint, builds e a CI serão mantidos como
  evidências automáticas; a bateria manual continua acumulada para a sessão.

## Bateria manual pendente

- [ ] Abrir um Domínio de personagem e confirmar a formação pelo mestre; verificar o evento e o Acerto Garantido no turno do alvo.
- [ ] Interromper, desfazer e colapsar um Domínio; verificar os dois Esgotamentos e o descanso em interlúdio.
- [ ] Criar uma disputa com dois e três Domínios, usar Refinar/Forçar/Pressionar e conferir Dominância, empate e encerramento.
- [ ] Registrar Ruptura, Reforçar e Reconfigurar uma barreira fechada; confirmar que Domínio aberto não aceita Integridade.
- [ ] Ativar Cesta Oca, Domínio Simples e Amplificação; verificar recursos, substituição da defesa e permissão de mestre/controlador/terceiro.
- [ ] Repetir uma ação com a mesma requisição no navegador/rede e confirmar que o histórico e os recursos não são duplicados.

## Concentração e barreiras narrativas — 2026-09-23

- [x] Um dano de uma única ação igual ou superior a 50% dos PV máximos torna o
  Domínio Instável automaticamente; um Domínio já Instável colapsa. A disputa
  perde Dominância apenas uma vez por essa mesma ocorrência.
- [x] A sessão mantém uma única Concentração importante por personagem, salvo
  metadado explícito da própria habilidade. Domínio e Domínio Simples usam essa
  regra geral.
- [x] Barreiras permanentes são entidades narrativas de cena com escala,
  complexidade, regras, âncora, Concentração e responsável opcional. Não há
  posição, mapa, dano ou bloqueio automático inventado pelo sistema.
- [ ] Validar no navegador a criação e o encerramento de uma barreira narrativa
  com e sem responsável, e a Instabilidade automática após dano devastador.
- [x] O uso de habilidade aceita Ajustes Ritualísticos estruturados. O servidor
  limita a quantidade pelo grau da Técnica, aplica o custo de `+2 EA` quando
  selecionado e registra os demais efeitos para resolução narrativa auditável.

- [x] A ficha de sessão expõe o modal **Ajustes** tanto para a aplicação-base
  quanto para cada variação. Ele orienta Adição/Subtração, limita a escolha
  pelo Grau em Técnica Amaldiçoada e mostra o custo extra antes da ativação.
- [x] O histórico da sessão converte os ajustes persistidos em texto legível;
  efeitos sem resolução mecânica genérica continuam explicitamente sob
  resolução da mesa, sem o sistema inventar dano ou condição.

## UX operacional de Domínios — 2026-09-23

- [x] O mestre cria disputa sem IDs: escolhe dois ou mais Domínios ativos e,
  opcionalmente, os personagens/NPCs na região de colisão.
- [x] A tela explica a Dominância (0 inicial, margem de +1 a +3, vitória em
  3, no máximo três resoluções e colapso no empate final).
- [x] O servidor impede que um Domínio ativo entre em duas disputas e impede
  Pressionar um Domínio que não pertence à mesma disputa.
- [x] Cartões exibem abertura interrompível, Instabilidade, estado de barreira
  e neutralização do Acerto Garantido, com origem por disputa ou defesa.
- [x] A Timeline do mestre destaca eventos de Domínio e permite filtrar por
  personagem, NPC, Domínio e categoria de evento, sem expor contexto extra a
  jogadores.
- [x] Todo encerramento ou colapso registra o motivo explícito no histórico,
  inclusive interrupção, ruptura e empate final.
- [ ] Validar manualmente no navegador a seleção de alvos, Pressionar,
  Registro de Ruptura e os filtros combinados durante uma sessão real.

## Resposta de turno e Epifania — 2026-09-24

- [x] Avançar, recuar e pular turno agora devolvem a atualização de iniciativa
  antes de processar a fila de efeitos automáticos. O processamento continua
  protegido por transação e concorrência, roda em segundo plano e emite uma
  atualização realtime ao concluir.
- [x] A interface informa que os efeitos automáticos estão sendo aplicados,
  sem induzir o usuário a reprocessar manualmente uma fila normal.
- [x] A Epifania passou a expor o resultado da rolagem e a próxima DT quando
  falha, evitando o fechamento silencioso que parecia não executar nada.
- [ ] Em uma sessão com vários efeitos de início de turno, confirmar que a
  troca de turno responde sem espera longa e que a atualização realtime final
  registra os efeitos, recursos e condições corretos.

## Desempenho dos efeitos automáticos — 2026-09-24

- [x] A iniciativa alternada passou a usar a mesma confirmação imediata da
  iniciativa comum. O lado novo aparece antes da fila terminar e a sessão é
  atualizada novamente quando os efeitos concluírem.
- [x] Os passos pendentes de um mesmo avanço são processados em uma transação
  única, com locks de sessão e evento adquiridos uma só vez. Isso reduz idas ao
  TiDB em viradas de rodada, sem perder atomicidade: se um passo falhar, o lote
  inteiro volta para pendente e pode ser reprocessado de forma auditável.
- [ ] Medir numa sessão real a virada com sustentação, duração e recuperação
  ativa; confirmar a redução de latência e que o histórico contém todos os
  eventos esperados após a atualização realtime final.

## Feedback operacional de barreiras — 2026-09-24

- [x] Ações de Domínio retornam um resultado estruturado e persistem o mesmo
  contexto no histórico. O painel mostra uma confirmação acessível com título,
  participante e efeito imediato.
- [x] Formar, interromper, desfazer, estabilizar, refinar, forçar, pressionar,
  reforçar, reconfigurar e registrar Ruptura possuem textos próprios; Ruptura
  informa ganho, totais e colapso quando a Integridade é superada.
- [x] Erros de regra permanecem no alerta de validação, sem simular sucesso.
- [ ] Conferir no navegador uma ação de reforço, reconfiguração, estabilização
  e ruptura seguida de colapso, verificando confirmação, cartão e histórico.
