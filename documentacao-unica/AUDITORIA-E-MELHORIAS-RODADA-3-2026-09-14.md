# Auditoria e melhorias — rodada 3

Atualizado em: 2026-09-14  
Base auditada: `main` em `0d1c8d6`  
Escopo: experiência de uso, acessibilidade, navegação, desempenho de listagens e
manutenibilidade dos fluxos mais usados. Esta rodada não reabre os itens já
implementados nas rodadas 1 e 2.

## Contexto e conclusão

As rodadas anteriores já resolveram a maior parte das falhas transversais de
dados remotos, formulários, busca e componentes. A revisão atual encontrou
doze oportunidades novas e delimitadas. O maior ganho restante não é adicionar
mais recursos ao sistema: é tornar os fluxos existentes previsíveis em teclado,
mobile, catálogos grandes e sessões longas.

Há também uma **rodada 4 reservada**, de confiabilidade operacional. Ela não é
parte desta implementação e só deve começar após a homologação acumulada:

- upgrade compatível de Prisma 6 para 7;
- integração da telemetria sanitizada a uma ferramenta externa aprovada;
- ensaio de restauração, baseline de latência e replay de migrations em ambiente
  compatível com TiDB.

## Painel de progresso

Progresso atual: **0/12 concluídos**, **6/12 em validação**, **0/12 em andamento**
e **6/12 pendentes**.

| Lote | Foco | Itens |
| --- | --- | --- |
| 1 — Acessibilidade e feedback | Camadas móveis, foco, atalhos de conteúdo e mensagens assíncronas | R3-01 a R3-03, R3-11 |
| 2 — Navegação e escala de dados | Busca unificada, filtros compartilháveis e catálogos paginados | R3-04 a R3-07 |
| 3 — Sessão operacional | Permissões visíveis, densidade adaptativa e resiliência operacional | R3-08 a R3-10 |
| Transversal | Registro, testes e decisão para a rodada 4 | R3-12 |

Estados: `Pendente`, `Em andamento`, `Bloqueado`, `Em validação` e `Concluído`.

Um item só é concluído após os critérios específicos, testes automatizados
aplicáveis, publicação e evidência manual quando ela fizer sentido. As
validações manuais das rodadas 1 e 2 continuam acumuladas, sem duplicar código
nesta rodada.

## Lote 1 — Acessibilidade e feedback

### R3-01 — Unificar camadas móveis ao gerenciador de diálogos

Prioridade: P1  
Status: Em validação  
Complementa: UX-01, R2-10

**Evidência.** `AppShell` e `ReaderSidebar` criam sobreposições móveis próprias.
Elas fecham com clique/Escape, mas não usam `DialogProvider`, não prendem foco e
não devolvem foco ao botão de origem. Já `Modal`, confirmações e notificações
usam a política centralizada.

**Melhoria.** Extrair um drawer reutilizável sobre `DialogProvider` e migrar a
navegação principal e o índice do compêndio, mantendo o visual atual.

**Critérios de aceitação.**

- [ ] Drawer abre com foco inicial útil, mantém Tab/Shift+Tab dentro e retorna foco ao gatilho.
- [ ] Apenas a camada superior responde a Escape e ao fundo.
- [ ] Menu principal e índice do compêndio permanecem operáveis por toque, teclado e leitor de tela.

**Implementação 2026-09-14.** `MobileDrawer` reutiliza `DialogProvider`,
`Portal` e a escala de camadas; navegação principal e índice móvel do compêndio
o adotaram. Teste de interação cobre Escape e retorno de foco. Falta validação
manual em viewport mobile e com diálogos aninhados.

### R3-02 — Tornar toasts confiáveis e anunciáveis

Prioridade: P1  
Status: Em validação  
Complementa: UX-02, R2-05

**Evidência.** `ToastContainer` não possui região viva; ações removem o toast
antes de a Promise terminar e não há limite/coalescência para rajadas de eventos
de sessão.

**Melhoria.** Definir um contrato de fila: região `aria-live`, identificador
seguro, limite visível, deduplicação opcional e ação que só fecha após sucesso
ou apresenta falha no próprio item.

**Critérios de aceitação.**

- [ ] Sucesso, erro e ação pendente são anunciados sem roubar foco.
- [ ] Falha de ação preserva contexto e permite nova tentativa.
- [ ] Uma rajada de eventos não cobre controles críticos em desktop ou mobile.

**Implementação 2026-09-14.** Toasts recebem identificador seguro, limite de
quatro mensagens, região viva e ação assíncrona que só fecha no sucesso. O
teste cobre a preservação e o erro de uma ação rejeitada. Falta validar uma
rajada real de eventos de sessão nos dois breakpoints.

### R3-03 — Oferecer atalho para o conteúdo e foco consistente entre rotas

Prioridade: P2  
Status: Em validação  
Complementa: UX-04

**Evidência.** O layout possui header, sidebar e conteúdo, mas não há link para
pular a navegação. Trocas de rota preservam o foco em controles antigos, o que
torna teclado e leitor de tela mais lentos em telas de sessão e compêndio.

**Melhoria.** Incluir skip link, alvo principal nomeado e política pequena de
foco para navegações iniciadas pela interface, sem interferir com links internos
ou com a restauração de foco dos diálogos.

**Critérios de aceitação.**

- [ ] O primeiro Tab expõe “Ir para o conteúdo”.
- [ ] A rota nova tem título e região principal identificáveis.
- [ ] Foco de modal/drawer não é perdido após navegação ou fechamento.

**Implementação 2026-09-14.** O layout oferece o atalho “Ir para o conteúdo
principal”, identifica a região principal e leva foco a ela em troca de rota.
Falta percorrer as rotas autenticadas com teclado e leitor de tela.

### R3-11 — Cobrir interações de acessibilidade transversais

Prioridade: P1  
Status: Em validação  
Complementa: R2-13

**Evidência.** A suíte DOM cobre tabs, seletor e notificações, mas não os
drawers móveis, região de toast ou skip link que esta rodada introduzirá.

**Melhoria.** Acrescentar testes de interação pequenos e reutilizáveis para
camadas, foco, mensagens e navegação por teclado.

**Critérios de aceitação.**

- [ ] Testes validam foco, Escape, clique externo e retorno ao gatilho.
- [ ] Testes validam anúncio/estado de ação de toast sem depender de tempo real.
- [ ] `npm test`, lint e build do frontend seguem aprovados.

**Implementação 2026-09-14.** Foram adicionados testes DOM para drawer e toast;
com os testes de seletor, a execução focal aprovou 3 arquivos/3 testes. Lint e
build do frontend foram aprovados. A suíte completa continua na validação de
publicação do lote.

## Lote 2 — Navegação e escala de dados

### R3-04 — Unificar a busca do índice e a busca do compêndio

Prioridade: P1  
Status: Em validação  
Complementa: R2-08

**Evidência.** A busca global do compêndio já encontra conteúdo, siglas e
trechos; o campo “Buscar neste livro” de `ReaderSidebar` filtra apenas títulos,
resumos e a árvore carregada no navegador. A mesma intenção produz resultados
diferentes.

**Melhoria.** Fazer o campo do leitor encaminhar para a busca paginada já
existente, pré-filtrada pelo livro, e deixar o filtro local explicitamente
rotulado como navegação no índice quando ele permanecer útil.

**Critérios de aceitação.**

- [ ] Termos presentes só no corpo do artigo são encontrados a partir do leitor.
- [ ] Siglas oficiais continuam aceitas.
- [ ] Resultado preserva livro, termo, paginação e caminho do artigo.

**Implementação 2026-09-14.** O índice passou a reutilizar `CompendioSearch`
com o código do livro, encaminhando a busca para a rota paginada que já encontra
conteúdo, siglas e trechos. Lint, testes focais e build do frontend aprovaram;
falta validar termos no corpo de artigos e navegação mobile em produção.

### R3-05 — Preservar filtros e paginação em URLs compartilháveis

Prioridade: P2  
Status: Pendente  
Complementa: R2-01, R2-07

**Evidência.** NPCs, anotações, homebrews e outras listas mantêm filtros e
página apenas em estado local. Atualizar, voltar/avançar ou compartilhar uma
URL perde o contexto de trabalho.

**Melhoria.** Criar um helper de parâmetros tipados e migrar primeiro as listas
de NPCs, anotações e homebrews, com reset de página apenas quando um filtro
realmente muda.

**Critérios de aceitação.**

- [ ] URL restaura filtros, busca e página sem consulta duplicada.
- [ ] Voltar/avançar do navegador mantém o estado correto.
- [ ] Valores inválidos são normalizados sem quebrar a listagem.

### R3-06 — Consultar grupos de NPCs sem baixar o catálogo inteiro

Prioridade: P1  
Status: Em validação  
Complementa: ARQ-02

**Evidência.** A página de NPCs pagina a lista visível em 12 itens, mas
`carregarTodosNpcsAmeacas` percorre todas as páginas de 100 registros para
resolver grupos no cliente. Quanto maior o acervo, maior o custo inicial.

**Melhoria.** Acrescentar filtro/consulta paginada por grupo no backend e usar
o mesmo envelope de paginação da lista normal; a edição de grupo recebe seleção
pesquisável e paginada.

**Critérios de aceitação.**

- [ ] Abrir a lista não consulta todas as páginas de NPCs.
- [ ] Grupo preserva busca, filtros e paginação no servidor.
- [ ] Criar/editar grupo continua permitindo selecionar todos os NPCs elegíveis.

**Implementação 2026-09-14.** A listagem aceita `grupoId` no contrato e aplica
o filtro relacional no backend, preservando dono, paginação e demais filtros.
A página de NPCs deixou de baixar todas as páginas durante a abertura; o
catálogo integral é carregado somente ao abrir o editor de grupo, com estado de
carregamento explícito. Teste de serviço, build backend e build frontend foram
aprovados. Falta validar grupos grandes na interface autenticada.

### R3-07 — Padronizar catálogos grandes em seleção incremental

Prioridade: P2  
Status: Pendente  
Complementa: COD-04, UX-03

**Evidência.** Há chamadas com `limit: 100` para entidades vinculadas e para a
inclusão de NPCs em sessão. O limite arbitrário pode ocultar opções ou aumentar
o tempo inicial conforme os catálogos crescem.

**Melhoria.** Reutilizar seletores de catálogo pesquisáveis com carregamento
incremental e informar claramente fonte, permissões e ausência de resultado.

**Critérios de aceitação.**

- [ ] Mais de 100 opções continua selecionável sem campo de ID.
- [ ] Apenas entidades permitidas aparecem para o papel atual.
- [ ] Busca, carregamento, erro e seleção atual têm estados explícitos.

## Lote 3 — Sessão operacional

### R3-08 — Expor permissões operacionais antes da ação

Prioridade: P1  
Status: Pendente  
Complementa: COD-03, UX-06

**Evidência.** `SessionItemsPanel` usa inicialmente apenas “sessão encerrada”
para liberar a criação/ações e ajusta detalhes depois do retorno de permissões.
Isso pode oferecer controles que o servidor recusará para determinados papéis.

**Melhoria.** Centralizar capacidades retornadas pelo backend e renderizar cada
ação de item, transferência, NPC e personagem somente quando ela for permitida;
quando útil, exibir o motivo em leitura.

**Critérios de aceitação.**

- [ ] Jogador, observador, controlador delegado e mestre veem ações coerentes com o backend.
- [ ] Nenhum controle visível gera erro previsível apenas por falta de permissão.
- [ ] O backend permanece a autoridade e testes de acesso direto continuam negados.

### R3-09 — Adaptar a densidade da sessão ao contexto do usuário

Prioridade: P2  
Status: Pendente  
Complementa: UX-06, R2-11

**Evidência.** A sessão reúne roster, iniciativa, chat, itens, técnicas,
condições, fichas e controles em uma página extensa. Abas melhoraram a
descoberta, mas o usuário ainda precisa atravessar conteúdo irrelevante para
encontrar sua próxima ação, sobretudo em mobile.

**Melhoria.** Criar uma visão operacional priorizada por papel e turno, com
atalhos para “minha ficha”, “minha vez”, pendências e chat, preservando a visão
completa do mestre.

**Critérios de aceitação.**

- [ ] Jogador encontra ação, recursos e chat sem percorrer o painel do mestre.
- [ ] Mestre mantém acesso a todos os controles sem perder contexto.
- [ ] Desktop e mobile mostram a mesma prioridade de informação sem duplicar estado.

### R3-10 — Consolidar recuperação de falhas em tempo real na sessão

Prioridade: P2  
Status: Pendente  
Complementa: ARQ-02, R2-14

**Evidência.** Socket.IO e polling possuem contingência e telemetria, mas o
estado dessa recuperação aparece de maneiras diferentes nos painéis. O usuário
nem sempre sabe se está vendo dados atuais, cache ou tentativa de reconexão.

**Melhoria.** Expor um único indicador discreto de sincronização da sessão,
com última atualização, reconexão em andamento, ação de atualizar e tratamento
coerente de falha.

**Critérios de aceitação.**

- [ ] Estado conectado, contingência, atualização e falha é compreensível sem abrir o console.
- [ ] Dados já carregados permanecem utilizáveis durante recuperação.
- [ ] Polling não duplica ações nem reinicia edições locais.

## Acompanhamento e rodada 4

### R3-12 — Encerrar a rodada com decisões operacionais explícitas

Prioridade: P2  
Status: Pendente  
Complementa: OPS-01 a OPS-04

**Melhoria.** Ao concluir os três lotes, registrar a bateria manual consolidada
e criar a rodada 4 apenas para os quatro compromissos operacionais já
identificados, sem reabrir UI/UX por conveniência.

**Critérios de aceitação.**

- [ ] Resultado manual das rodadas 1–3 está registrado por cenário.
- [ ] Backlog da rodada 4 contém somente Prisma, observabilidade, migrations e recuperação/desempenho.
- [ ] Não há item de produto ou UI sem dono entre as rodadas.

## Histórico

| Data | Registro | Evidência | Próxima ação |
| --- | --- | --- | --- |
| 2026-09-14 | Auditoria criada com 12 achados novos e três lotes. | Revisão estática de `AppShell`, `ReaderSidebar`, `ToastContext`, `ToastContainer`, `SessionItemsPanel`, página de NPCs, buscas e chamadas de catálogo. | Implementar lote 1 sem alterar regras de negócio. |
| 2026-09-14 | R3-01, R3-02, R3-03, R3-04, R3-06 e R3-11 implementados. | Testes focais de drawer/toast/seletor e serviço de NPCs aprovados; builds frontend/backend aprovados. | Commitar, publicar e executar a validação manual acumulada. |
