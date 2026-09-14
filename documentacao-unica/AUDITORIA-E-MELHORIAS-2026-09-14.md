# Auditoria e acompanhamento de melhorias — rodada 2

Atualizado em: 2026-09-14

## Objetivo e escopo

Este documento é o acompanhamento vivo da segunda rodada de melhorias do AssistenteRPG. Ele preserva oportunidades encontradas após a rodada anterior, seus critérios de aceite e as evidências necessárias para encerrá-las.

- Commit auditado: `0b5b707`.
- Escopo: revisão estática de fluxos de interface, contratos frontend/backend, componentes compartilhados, testes e documentação.
- Evidência automática: 8 arquivos e 38 testes direcionados do frontend aprovados.
- Limite: não havia navegador autenticado conectado; comportamentos visuais e por papel exigem bateria manual.
- Esta auditoria não aplicou código, migrations, seeds, deploys ou alterações remotas.

## Convenções de acompanhamento

Estados: `Pendente`, `Em andamento`, `Bloqueado`, `Em validação` e `Concluído`.

- Commit ou deploy isolado não encerra item.
- Cada lote registra testes automáticos; validações manuais permanecem acumuladas na bateria final.
- Lote pronto sem sua bateria manual permanece em `Em validação`.
- Etapa não aplicável exige justificativa datada.
- Ao interromper trabalho, registrar a próxima ação exata no histórico.

## Painel de progresso

Progresso atual: **1/15 implementação concluída**, **14/15 em validação**, **0/15 em andamento** e **0/15 pendentes**.

| ID | Lote | Prioridade | Status | Complementa | Próxima ação |
| --- | --- | --- | --- | --- | --- |
| R2-01 | 1 | P1 | Em validação | ARQ-02, UX-05 | Executar teste manual de paginação concorrente. |
| R2-02 | 1 | P1 | Em validação | UX-02 | Executar a bateria manual de rascunho no wizard. |
| R2-03 | 1 | P1 | Em validação | COD-03 | Confirmar limite em sessão autenticada. |
| R2-04 | 1 | P1 | Em validação | UX-02 | Executar teste manual de troca durante falha de envio. |
| R2-05 | 1 | P1 | Em validação | UX-05 | Simular falha de busca e validar repetição local. |
| R2-06 | 1 | P1 | Em validação | UX-02 | Forçar falha de exclusão autenticada. |
| R2-14 | 1 | P2 | Em validação | OPS-02 | Confirmar recepção do log no ambiente remoto. |
| R2-07 | 2 | P2 | Em validação | COD-04 | Executar busca autenticada além da primeira página. |
| R2-08 | 2 | P2 | Em validação | UX-05 | Validar siglas, trecho, relevância e paginação no compêndio. |
| R2-12 | 2 | P2 | Em validação | UX-03 | Validar salto de etapas e revisão de dependências no wizard. |
| R2-09 | 3 | P2 | Em validação | UX-04, DS-02 | Validar seletor por mouse, toque e teclado. |
| R2-10 | 3 | P2 | Em validação | UX-01 | Validar sobreposição e fechamento de notificações. |
| R2-11 | 3 | P2 | Em validação | UX-06 | Validar abas de sessão em desktop e mobile. |
| R2-13 | Transversal | P1 | Em validação | COD-01 | Executar a bateria manual consolidada dos três lotes. |
| R2-15 | Transversal | P2 | Concluído | DOC-01, DOC-03 | Manter o documento atualizado a cada lote. |

## Lotes de implementação

### Lote 1 — Confiabilidade

Itens: R2-01 a R2-06 e R2-14.

Evita perda de preenchimento, ações no destinatário errado, respostas obsoletas e falhas apresentadas como ausência de conteúdo.

Conclusão: testes do fluxo, builds aplicáveis e bateria manual de anotações, chats, confirmações e erro remoto registrados.

### Lote 2 — Consulta e produtividade

Itens: R2-07, R2-08 e R2-12.

Torna informação existente encontrável e reduz a navegação repetida em tarefas longas.

Conclusão: busca paginada e relevante, atalhos testados e bateria manual de compêndio, anotações e wizard registrada.

### Lote 3 — Consistência da interface

Itens: R2-09 a R2-11.

Reduz ambiguidade de controles e torna camadas, seletores e abas consistentes para mouse, toque e teclado.

Conclusão: testes de interação, verificação desktop/mobile e inspeção de foco, Escape e leitor de tela quando aplicável.

### Testes transversais

R2-13 acompanha os três lotes e somente pode ser concluído quando cada lote tiver ao menos uma jornada crítica automatizada com resultado registrado.

## Achados detalhados

### R2-01 — Consultas de anotações não podem competir

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: ARQ-02 e UX-05.

**Diagnóstico.** Mudança de página pode solicitar a página escolhida e reexecutar carga da página 1; respostas fora de ordem podem exibir conteúdo incompatível com o indicador. Atualizações também substituem a lista pelo loading.

**Melhoria.** Centralizar parâmetros de consulta, cancelar ou ignorar resposta obsoleta e preservar a lista durante revalidação.

**Critérios de aceite.**

- [ ] Trocas rápidas de página não mostram conteúdo de outra página.
- [ ] Filtro, criação, edição e exclusão mantêm a página coerente.
- [ ] Atualização em segundo plano preserva conteúdo visível.
- [ ] Há teste para resposta antiga chegar por último.

### R2-02 — Proteger dados não salvos

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: UX-02.

**Diagnóstico.** Fechar anotações limpa o formulário imediatamente. O wizard de personagem mantém estado somente em memória.

**Melhoria.** Criar guarda compartilhada de alterações, confirmação de descarte e rascunhos locais versionados e segregados por conta.

**Critérios de aceite.**

- [ ] Escape, clique externo, cancelar e navegação avisam sobre edição.
- [ ] Anotação e wizard podem restaurar ou descartar rascunho explicitamente.
- [ ] Salvar limpa somente o rascunho correspondente.
- [ ] Credenciais, tokens e conteúdo de outra conta não são persistidos.

### R2-03 — Definir um único limite para mensagens de sessão

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: COD-03.

**Diagnóstico.** A tela permite 120 caracteres, o hook rejeita mais de 100 e o DTO aceita 800.

**Melhoria.** Definir o limite de produto uma vez e compartilhá-lo entre contador, bloqueio, erro e backend.

**Critérios de aceite.**

- [ ] Interface, hook e backend aceitam o mesmo limite.
- [ ] Casos vazio, limite e limite + 1 têm cobertura.
- [ ] Contador e ação de enviar apresentam orientação coerente.

### R2-04 — Isolar rascunhos por conversa de amigos

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: UX-02.

**Diagnóstico.** Um único estado de rascunho atende todas as conversas; trocar de amigo carrega o texto, e falha tardia pode restaurá-lo na conversa errada.

**Melhoria.** Chavear rascunho, envio pendente, falha e reenvio pelo ID do destinatário original.

**Critérios de aceite.**

- [ ] Alternar conversas mantém cada rascunho no destinatário correto.
- [ ] Falha oferece reenvio sem mover o texto para outra conversa.
- [ ] Realtime não descarta rascunho local.

### R2-05 — Diferenciar falha de ausência de dados

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: UX-05.

**Diagnóstico.** Busca do compêndio converte falha remota em lista vazia; cargas do chat de amigos não exibem erro contextual em todos os casos.

**Melhoria.** Adotar estado remoto comum com conteúdo preservado, loading, vazio real, erro contextual e nova tentativa.

**Critérios de aceite.**

- [ ] Falha não produz “nenhum resultado” ou “sem mensagens”.
- [ ] Revalidação preserva o último conteúdo seguro.
- [ ] A pessoa pode repetir a ação no local da falha.
- [ ] Contratos legados continuam normalizados na API.

### R2-06 — Não fechar confirmação após erro tratado internamente

Prioridade: P1  
Status: Em validação  
Lote: 1  
Complementa: UX-02.

**Diagnóstico.** ConfirmDialog mantém-se aberto quando a promise rejeita, mas alguns consumidores capturam o erro e retornam sucesso ao diálogo.

**Melhoria.** Padronizar retorno de mutações confirmadas: erro chega ao diálogo ou retorna resultado explícito de falha.

**Critérios de aceite.**

- [ ] Falha mantém a confirmação aberta e preserva contexto.
- [ ] Erro aparece junto à ação e permite nova tentativa.
- [ ] Sucesso fecha uma vez e atualiza a tela.
- [ ] Há teste para exclusão e ação não destrutiva falharem.

### R2-14 — Tornar erros de cliente observáveis de fato

Prioridade: P2  
Status: Em validação  
Lote: 1  
Complementa: OPS-02.

**Diagnóstico.** O observador emite CustomEvent, mas não foi encontrado consumidor versionado que o envie a coleta ou alerta.

**Melhoria.** Conectar o evento a coletor aprovado, com sanitização, amostragem, rota e versão de deploy, sem segredos.

**Critérios de aceite.**

- [ ] Erro JavaScript e rejeição não tratada chegam ao coletor homologado.
- [ ] Evento não inclui token, cookie, URL de banco ou payload sensível.
- [ ] Indisponibilidade do coletor não afeta a interface.
- [ ] Há forma verificável de confirmar recebimento em homologação.

### R2-07 — Buscar anotações fora da página atual

Prioridade: P2  
Status: Em validação  
Lote: 2  
Complementa: COD-04.

**Diagnóstico.** A pesquisa filtra apenas itens da página carregada; anotações em outras páginas não são encontradas.

**Melhoria.** Levar termo ao backend e combiná-lo com filtros de campanha, sessão e paginação.

**Critérios de aceite.**

- [ ] Busca encontra título e conteúdo em qualquer página acessível.
- [ ] Paginação, total e filtros representam o resultado pesquisado.
- [ ] Limpar busca restaura a consulta previsivelmente.
- [ ] Termo é validado e tratado sem interpolação insegura.

### R2-08 — Melhorar a busca do compêndio

Prioridade: P2  
Status: Em validação  
Lote: 2  
Complementa: UX-05.

**Diagnóstico.** A busca bloqueia termos menores de três caracteres, limita a 20 resultados e ordena por posição editorial. Siglas como PV, PE, EA, DT e RD ficam indisponíveis ou pouco previsíveis.

**Melhoria.** Reconhecer siglas permitidas, ordenar por relevância, informar total/continuação e mostrar trecho encontrado com caminho do tópico.

**Critérios de aceite.**

- [ ] Siglas oficiais retornam tópicos corretos.
- [ ] Título ou palavra-chave exata recebe prioridade.
- [ ] Há acesso a resultados além da primeira página.
- [ ] Falhas seguem o estado remoto de R2-05.

### R2-12 — Reduzir revisões repetitivas no wizard

Prioridade: P2  
Status: Em validação  
Lote: 2  
Complementa: UX-03.

**Diagnóstico.** A navegação permite somente etapa anterior ou seguinte; revisar escolha distante exige atravessar vários passos.

**Melhoria.** Permitir retorno direto a etapas já visitadas e válidas, além de atalhos de edição no resumo, preservando dependências.

**Critérios de aceite.**

- [ ] Etapas válidas visitadas podem ser reabertas diretamente.
- [ ] Mudança que invalida dependentes solicita revisão dos campos afetados.
- [ ] Erro final direciona ao primeiro passo relevante com foco visível.
- [ ] Criação e edição mantêm o mesmo comportamento.

### R2-09 — Corrigir semântica dos seletores reutilizáveis

Prioridade: P2  
Status: Em validação  
Lote: 3  
Complementa: UX-04 e DS-02.

**Diagnóstico.** SelectModal coloca botão de remover dentro de cartão com papel de botão; teclado pode alcançar o cartão e abrir o seletor. Rótulo, ajuda e erro não estão ligados integralmente ao acionador.

**Melhoria.** Separar controles interativos e completar semântica, foco e associações ARIA, sem mudar contratos de catálogo.

**Critérios de aceite.**

- [ ] Enter/Espaço em remover não abre o seletor.
- [ ] Rótulo, ajuda, erro, estado expandido e diálogo são anunciados.
- [ ] Valor salvo pode ser identificado, substituído ou removido.
- [ ] Mouse, toque e teclado têm comportamento equivalente.

### R2-10 — Unificar notificações à gestão de camadas

Prioridade: P2  
Status: Em validação  
Lote: 3  
Complementa: UX-01.

**Diagnóstico.** Notificações usam Escape e z-index próprios, enquanto diálogos compartilham pilha de camadas.

**Melhoria.** Integrar o popover à política compartilhada de foco, Escape e camadas, mantendo posicionamento por CSS.

**Critérios de aceite.**

- [ ] Notificação e diálogo deixam somente a camada superior interativa.
- [ ] Escape fecha somente a camada superior.
- [ ] Foco retorna ao sino após fechamento apropriado.
- [ ] Desktop, mobile, rolagem e zero notificações permanecem utilizáveis.

### R2-11 — Tornar abas de sessão mais descobertas e acessíveis

Prioridade: P2  
Status: Em validação  
Lote: 3  
Complementa: UX-06.

**Diagnóstico.** Algumas abas mostram somente ícones. Há nome acessível, mas descoberta por toque é baixa e não há teclado completo de tabs ou vínculo explícito aos painéis.

**Melhoria.** Exibir contexto da aba ativa e implementar teclado e relacionamento aba/painel completos.

**Critérios de aceite.**

- [ ] Aba ativa possui rótulo visível em telas compactas.
- [ ] Setas, Home e End percorrem abas habilitadas.
- [ ] Cada aba aponta ao painel com IDs estáveis.
- [ ] Contadores não substituem nome da ação.

### R2-13 — Cobrir jornadas críticas de interface

Prioridade: P1  
Status: Em validação  
Lote: Transversal.

**Diagnóstico.** A suíte cobre majoritariamente funções e contratos; não prova integralmente foco, rascunhos, troca de conversa, paginação concorrente ou sobreposição.

**Melhoria.** Adicionar testes de interação determinísticos às jornadas críticas, com fixtures e falhas simuladas.

**Critérios de aceite.**

- [ ] Lote 1 cobre paginação, rascunho, falha de chat e confirmação.
- [ ] Lote 2 cobre busca global, resultado vazio e salto de etapa.
- [ ] Lote 3 cobre teclado de seletor, abas e camadas de notificação.
- [ ] Testes rodam no comando padrão e não dependem de produção.

### R2-15 — Manter o acompanhamento confiável

Prioridade: P2  
Status: Concluído  
Lote: Transversal  
Complementa: DOC-01 e DOC-03.

**Diagnóstico.** A auditoria anterior informa uma melhoria concluída, embora seu painel marque COD-01 e COD-02 como concluídos. Novos achados precisam de IDs próprios para não apagar o diagnóstico anterior.

**Melhoria.** Manter esta rodada como documento ativo, corrigir a contagem anterior e relacionar os dois acompanhamentos.

**Critérios de aceite.**

- [ ] Índice aponta rodada 2 como acompanhamento ativo e rodada 1 como histórico relevante.
- [ ] Os 15 IDs e os três lotes estão presentes sem duplicidade.
- [ ] Rodada 1 informa corretamente 2/23 concluídos.
- [ ] Validador de documentação e `git diff --check` aprovam.

## Bateria consolidada de validação manual

Registrar data, navegador, papel, viewport e evidência no histórico ao final dos lotes.

### Lote 1

- [ ] Criar/editar anotação, fechar com texto alterado e restaurar rascunho após recarga.
- [ ] Alternar rapidamente páginas, filtros e busca de anotações sob rede lenta.
- [ ] Escrever rascunhos em duas conversas, alternar e simular falha de envio.
- [ ] Simular falha de busca e mensagens, confirmando erro contextual e repetição.
- [ ] Forçar falha em confirmação de exclusão e confirmar que permanece aberta.
- [ ] Verificar recebimento de erro de cliente em homologação sem dados sensíveis.

### Lote 2

- [ ] Encontrar anotação fora da primeira página por título e conteúdo.
- [ ] Buscar PV, PE, EA, DT e RD, consultar trecho e abrir tópico.
- [ ] Revisar etapa distante no wizard e confirmar atualização de dependentes.

### Lote 3

- [ ] Usar seletor por mouse, toque e teclado, incluindo remoção da escolha.
- [ ] Abrir notificações com e sem pendências, sobrepor confirmação e fechar por Escape.
- [ ] Navegar abas por toque, Tab, setas, Home e End em desktop e mobile.

### Registro da bateria

| Data | Lote | Ambiente/papel | Itens executados | Resultado | Evidência/pendência |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

## Histórico de acompanhamento

| Data | Itens | Alteração | Evidências | Próxima ação |
| --- | --- | --- | --- | --- |
| 2026-09-14 | R2-13 | Infraestrutura DOM de testes adicionada com configuração de aliases; jornadas de teclado das abas, seleção/remoção no SelectModal e abertura/fechamento de notificações foram cobertas de forma determinística. | Frontend: 71 arquivos e 389 testes aprovados; build aprovado. | Executar a bateria manual consolidada e registrar evidências por lote. |
| 2026-09-14 | R2-09, R2-10, R2-11 | SelectModal passou a isolar a remoção do acionador e expõe relações ARIA; notificações usam a pilha compartilhada de diálogos, foco e Escape; SessionTabs ganhou setas, Home, End, IDs e rótulo da aba ativa em tela compacta. | Build e lint do frontend aprovados; `git diff --check` sem divergências. | Executar bateria manual de seletor, notificações e abas. |
| 2026-09-14 | R2-07, R2-08, R2-12 | A busca de anotações passou a ser paginada no backend por título, conteúdo, campanha e sessão; o compêndio ganhou rota paginada, relevância, trechos e suporte às siglas PV, PE, EA, DT e RD; o wizard permite reabrir etapas visitadas e editar etapas diretamente da revisão. | Testes focados de anotações/compêndio aprovados; build do frontend e validação Prisma aprovadas. | Executar bateria manual de busca global, compêndio e revisão do wizard. |
| 2026-09-14 | R2-01, R2-03, R2-04, R2-06, R2-14 | Consulta de anotações passou a ignorar resposta obsoleta; chat de sessão usa limite único; chat de amigos isolou rascunhos/erros por destinatário; exclusão de anotação propaga falha ao diálogo; erros de cliente ganharam coleta autenticada e sanitizada. | Frontend: 12 testes focados, lint e build aprovados. Backend: 4 testes focados, lint e build aprovados. | Executar bateria manual autenticada e confirmar logs remotos. |
| 2026-09-14 | R2-02, R2-05 | Anotações e wizard ganharam rascunhos locais versionados e segregados por conta, com restauração, descarte explícito e limpeza após criação; a busca do compêndio passou a diferenciar falha remota de resultado vazio e oferece nova tentativa local. Estados de erro do chat de amigos também ficaram explícitos. | Testes unitários de rascunho e busca, lint e builds registrados nesta entrega. | Executar a bateria manual de rascunhos, chats e falha de busca. |
| 2026-09-14 | R2-15 | Índice, 15 IDs, lotes e contagem da rodada 1 validados; R2-15 concluído. | `node documentacao-unica/validar-documentacao.mjs` aprovado para 25 arquivos; `git diff --check` aprovado. | Iniciar Lote 1; atualizar este registro na mesma entrega de implementação. |
| 2026-09-14 | R2-01 a R2-15 | Segunda rodada criada a partir de auditoria estática focada em usabilidade. | Commit `0b5b707`; 38 testes direcionados aprovados; sem navegador autenticado conectado. | Validar documento e iniciar Lote 1. |
