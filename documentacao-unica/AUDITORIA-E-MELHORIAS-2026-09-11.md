# Auditoria e acompanhamento de melhorias

Atualizado em: 2026-09-11

## 1. Objetivo

Este documento registra a auditoria transversal de UI/UX, frontend, backend, design system, deploy, banco remoto, documentação e organização do AssistenteRPG.

Ele também é o acompanhamento vivo das melhorias identificadas. Os identificadores são estáveis: uma implementação, revisão ou publicação deve atualizar o item correspondente, sem substituir o diagnóstico original.

## 2. Contexto, escopo e limites

- Commit auditado: `92ff815977bb9c1cc7ae50358ff9286e35d480a8`.
- Frontend: Vercel, deployment de produção `READY` no commit auditado.
- Backend: endpoint público respondeu HTTP 200 durante a auditoria.
- Banco: TiDB remoto `test`, validado por conexão segura e `prisma migrate status`.
- Escopo: leitura de código, componentes compartilhados, contratos, documentação, configurações de CI/CD, resultados locais de validação e verificações remotas não mutáveis.
- Limites: esta auditoria não substitui teste exploratório autenticado em desktop/mobile, análise de métricas internas do Render/Vercel, nem ensaio de restauração de backup.
- Não foram aplicados código, migrations, seeds, alterações remotas, commits ou deploys como parte da auditoria.

## 3. Resultados registrados em 2026-09-11

| Verificação | Resultado |
| --- | --- |
| Testes frontend | 60 arquivos; 368 testes aprovados |
| Testes backend | 123 suítes; 868 testes aprovados |
| Build frontend | Aprovado |
| Build backend | Aprovado |
| Lint frontend | 1 erro e 3 avisos |
| Lint backend sem escrita | 814 erros de formatação e 10 avisos; não equivale a 814 falhas funcionais |
| `prisma validate` remoto | Aprovado |
| `prisma migrate status` remoto | 99 migrations locais; schema remoto atualizado |
| TiDB remoto | 113 tabelas; validações selecionadas do compêndio aprovadas |
| Vercel | Produção `READY`; sem erros de runtime de servidor nos últimos 7 dias |
| Auditoria de dependências frontend | 1 crítica, 8 altas e 1 moderada |
| Auditoria de dependências backend | 12 altas, 2 moderadas e 1 baixa |
| Integridade do worktree ao término | `git diff --check` aprovado; sem alterações de código da auditoria |

### Atualização de implementação em 2026-09-12

| Verificação | Resultado |
| --- | --- |
| Auditoria de dependências frontend | 0 vulnerabilidades reportadas após atualização controlada |
| Auditoria de dependências backend | 3 alertas altos remanescentes, todos na cadeia de ferramentas Prisma 6; sem correção compatível sugerida pelo auditor |
| Lint frontend | Aprovado sem avisos |
| Lint backend | Aprovado sem avisos |
| Testes frontend | 60 arquivos; 368 testes aprovados |
| Testes backend | 123 suítes; 868 testes aprovados |
| Build frontend | Aprovado com Next 16.3.5 |
| Build backend | Aprovado |
| `prisma validate` local | Aprovado |
| Instalações limpas | `npm ci` aprovado nos dois projetos; backend gera o Prisma Client antes do lint |

### Conclusões

1. A base de testes e as validações de build estão funcionais, mas não são executadas integralmente pelo CI versionado.
2. Os maiores ganhos imediatos vêm de confiabilidade dos componentes transversais — modais, formulários, feedback assíncrono e acessibilidade — antes de uma reformulação visual ampla.
3. A atualização controlada de dependências e a observabilidade de erros no navegador são prioridades operacionais.
4. Refatorações de sessão devem ser incrementais, preservando contratos, regras autoritativas e cobertura existente.

## 4. Convenções de acompanhamento

### Estados permitidos

- `Pendente`: ainda não iniciado.
- `Em andamento`: há trabalho ativo; registrar progresso e bloqueios.
- `Bloqueado`: depende de decisão, acesso, evidência ou ação externa.
- `Em validação`: implementação concluída, aguardando evidências de aceite.
- `Concluído`: todos os critérios aplicáveis verificados e evidenciados.

### Regras de atualização

- Estado inicial: **0/23 melhorias concluídas**.
- Progresso atual: **1/23 melhorias concluídas**.
- Não marcar como concluído somente por haver código ou commit: registrar testes, build, revisão e publicação quando aplicável.
- Itens não aplicáveis devem ser marcados como `Não aplicável`, com justificativa datada no histórico do item.
- Não renomear ou reutilizar IDs. Novas descobertas devem usar novos IDs, mantendo este conjunto preservado.
- Ao interromper um item, preencher `Pendências e próxima ação` com a condição exata de retomada.
- Registrar links de PR, commits, logs, deploys, migrations e capturas apenas quando disponíveis e sem inserir segredos.

## 5. Painel de progresso

| ID | Área | Prioridade | Status | Dependências | Próxima ação |
| --- | --- | --- | --- | --- | --- |
| UX-01 | UI/UX | P1 | Em validação | DS-02 | Executar bateria manual de pilha, foco e camadas |
| UX-02 | UI/UX | P1 | Em validação | UX-01 | Executar bateria manual de confirmações assíncronas |
| UX-03 | UI/UX | P1 | Em andamento | COD-03 | Migrar os demais cadastros de catálogo e os requisitos estruturados |
| UX-04 | UI/UX | P1 | Em andamento | DS-02 | Cobrir IDs explícitos e descrições acessíveis com testes |
| UX-05 | UI/UX | P2 | Em validação | ARQ-02 | Executar bateria manual de falha, conteúdo preservado e repetição contextual |
| UX-06 | UI/UX | P2 | Em validação | Validação autenticada | Executar bateria manual por papel, desktop e mobile |
| COD-01 | Código | P1 | Em validação | Política de proteção da branch | Definir checks obrigatórios para `main` |
| COD-02 | Código | P1 | Concluído | — | — |
| COD-03 | Código | P1 | Em validação | UX-03 | Confirmar os papéis autenticados na bateria manual final |
| COD-04 | Código | P2 | Pendente | DS-02 | Projetar seletor comum de catálogo |
| ARQ-01 | Arquitetura | P2 | Pendente | COD-03 | Delimitar primeira extração da sessão |
| ARQ-02 | Arquitetura | P2 | Pendente | Observabilidade | Medir polling e requisições redundantes |
| ARQ-03 | Arquitetura | P2 | Pendente | COD-03 | Mapear contratos duplicados front/back |
| DS-01 | Design system | P1 | Em andamento | DS-02 | Medir contraste e revisar estados além do primário |
| DS-02 | Design system | P2 | Pendente | UX-01 | Consolidar catálogo e testes de componentes |
| DS-03 | Design system | P2 | Pendente | DS-02 | Organizar tokens e estilos por domínio |
| OPS-01 | Operação e segurança | P1 | Em andamento | COD-01 | Planejar upgrade compatível da cadeia Prisma |
| OPS-02 | Operação e segurança | P1 | Pendente | Acesso de observabilidade | Instrumentar erros de navegador e saúde |
| OPS-03 | Operação e banco | P2 | Pendente | Ambiente descartável | Fortalecer validação de migrations |
| OPS-04 | Operação e banco | P2 | Pendente | Ambiente de restauração | Ensaiar recuperação e medir desempenho |
| DOC-01 | Documentação | P2 | Pendente | — | Separar referência atual de histórico |
| DOC-02 | Documentação | P2 | Pendente | COD-01 | Fixar ambiente e consolidar Prisma |
| DOC-03 | Documentação | P3 | Pendente | DOC-01 | Validar comandos, links e exemplos |

## 6. UI/UX

### UX-01 — Comportamento compartilhado dos modais

Prioridade: P1  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: DS-02

#### Diagnóstico e evidência

`Modal` e `ConfirmDialog` controlam bloqueio de rolagem e `Escape` de forma independente. Em diálogos aninhados, um fechamento pode liberar a rolagem ou fechar mais de uma camada. A base também não cobre de modo uniforme foco, retorno de foco e semântica acessível.

Arquivos de referência: `assistenterpg-front/src/components/ui/Modal.tsx` e `assistenterpg-front/src/components/ui/ConfirmDialog.tsx`.

#### Melhoria proposta

Criar uma infraestrutura única de diálogos com portal, pilha de camadas, fechamento apenas da camada superior, foco administrado e bloqueio de rolagem centralizado.

#### Critérios de aceitação

- [ ] Modal simples, seletor e confirmação podem coexistir sem desbloquear a página indevidamente.
- [ ] `Escape` fecha apenas o diálogo superior permitido.
- [ ] O foco entra no diálogo, permanece nele e retorna ao gatilho ao fechar.
- [ ] Diálogos têm nome acessível e botão de fechar acessível.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [x] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: DialogProvider, Modal, ConfirmDialog, useConfirm e dialog-layer.
- Testes e resultados: dialog-layer.test.ts (2 cenários), lint, 374 testes e build do frontend aprovados em 2026-09-12.
- Commit: 1918046 feat(ui): centraliza camadas de diálogo.
- Deploy/migration, se aplicável: sem migration ou seed; publicação pendente de validação automática.
- Pendências e próxima ação: validar foco, camadas e retorno ao gatilho em cenário manual com diálogos aninhados.

#### Atualização 2026-09-12

DialogProvider agora mantém a ordem de abertura sem re-registrar camadas existentes quando uma camada nova aparece. Modal e ConfirmDialog recebem z-index determinístico por camada, bloqueiam fechamento fora da camada superior e restauram foco apenas quando o gatilho original continua no documento. O bloqueio de rolagem fica ativo até a última camada encerrar.

#### Validação manual acumulada

- [ ] Abrir modal, seletor e confirmação aninhados; confirmar que o último fica acima e o fundo permanece bloqueado.
- [ ] Testar Escape e clique no fundo: apenas a camada superior permitida deve fechar.
- [ ] Conferir foco inicial, contenção de Tab e retorno ao controle que abriu o diálogo.

### UX-02 — Envio assíncrono e fechamento de formulários

Prioridade: P1  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: UX-01

#### Diagnóstico e evidência

Confirmações e algumas seleções limpam estado ou fecham antes da resposta autoritativa da API, dificultando recuperação após falha.

#### Melhoria proposta

Padronizar estado de envio, prevenção de duplicidade, sucesso, erro contextual e fechamento somente após confirmação bem-sucedida.

#### Critérios de aceitação

- [ ] O formulário conserva dados quando a API falha.
- [ ] O usuário recebe erro próximo à ação que falhou.
- [ ] Não há envio duplicado durante processamento.
- [ ] O diálogo fecha apenas após sucesso ou cancelamento explícito.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: ConfirmDialog e useConfirm.
- Testes e resultados: dialog-layer.test.ts (2 cenários), lint, 374 testes e build do frontend aprovados em 2026-09-12.
- Commit: 1918046 feat(ui): centraliza camadas de diálogo.
- Deploy/migration, se aplicável: sem migration ou seed; publicação pendente de validação automática.
- Pendências e próxima ação: executar falhas reais de confirmação na bateria manual e adicionar testes de interação quando houver infraestrutura DOM.

#### Atualização 2026-09-12

ConfirmDialog passa a ser o único responsável por fechar a confirmação após o sucesso. Durante uma Promise pendente, os botões, Escape e o fundo não descartam o diálogo; falhas mantêm o conteúdo aberto e exibem erro junto à ação. useConfirm não fecha mais antecipadamente ou duas vezes.

#### Validação manual acumulada

- [ ] Em uma exclusão e em uma ação de rede, simular falha e confirmar que o diálogo conserva o contexto e mostra o erro.
- [ ] Durante uma confirmação lenta, tentar confirmar novamente, cancelar, usar Escape e clicar no fundo.
- [ ] Confirmar que uma operação bem-sucedida fecha o diálogo uma única vez.

### UX-03 — Remoção de campos técnicos dos cadastros

Prioridade: P1  
Status: Em andamento  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: COD-03

#### Diagnóstico e evidência

Painéis administrativos ainda expõem IDs CSV, códigos obrigatórios e JSON como fluxo comum, apesar da diretriz de seleção guiada. Foram identificados, entre outros, os painéis de classes, técnicas, equipamentos, proficiências e tipos de grau.

#### Melhoria proposta

Concluir seletores pesquisáveis, geração de código no backend e editores estruturados de requisitos; limitar JSON aos fluxos avançados de importação/exportação.

#### Critérios de aceitação

- [ ] Nenhum cadastro comum pede IDs, CSV ou código técnico manual.
- [ ] Relações existentes são selecionadas por nome, descrição e fonte.
- [ ] JSON avançado tem preview, validação e contexto explícito.
- [ ] Códigos existentes permanecem imutáveis e compatíveis.

#### Checklist

- [x] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `TecnicasAdminPanel`, `ClasAdminPanel`, `ProficienciasAdminPanel`, `EquipamentosAdminPanel`, `TiposGrauAdminPanel`, `ModalHabilidadeAdminForm`, `TecnicaHabilidadesModal`, `RequisitosEstruturadosEditor`, `CaracteristicasEstruturadasEditor`, `MecanicasEstruturadasEditor`, DTOs e serviços de catálogo.
- Testes e resultados: frontend — lint, 370 testes e build aprovados; backend — 8 suítes/24 testes direcionados, lint, build e `prisma validate` aprovados em 2026-09-12. Os Quality Gates remotos dos lotes publicados foram aprovados.
- Commit: `e7a76a5 feat(catalogo): simplifica cadastro de técnicas`; correção de formatação `968f89d`; `cccee52 feat(catalogo): guia técnicas hereditárias`; `88a2f2d feat(homebrew): guia requisitos de conteúdo`; `7d32606 feat(homebrew): estrutura características de clãs`; `22f951d feat(homebrew): guia mecânicas de poderes`; `1fe1161 feat(homebrew): guia requisitos de variações`; `7ec969a feat(catalogo): automatiza códigos de proficiências`; `a795b9f feat(catalogo): automatiza códigos de cadastros`; `4bde960 feat(catalogo): guia habilidades e escalonamentos`.
- Deploy/migration, se aplicável: sem migration ou seed; publicação automática confirmada por resposta HTTP 200 da produção.
- Pendências e próxima ação: migrar os demais painéis de catálogo e substituir o editor textual de requisitos por controles estruturados, preservando JSON apenas para importação/exportação avançada.

#### Atualização 2026-09-12

O cadastro comum de técnicas não solicita mais código: o backend deriva um código estável do nome e acrescenta sufixo em colisões. A relação de clãs hereditários deixou de usar CSV e agora é selecionada por nome. O campo de requisitos passou a orientar texto legível; valores JSON antigos continuam aceitos para compatibilidade.

O cadastro de clãs também deixou de solicitar IDs de técnicas em CSV. Ele agora apresenta somente técnicas hereditárias, com nome e descrição, e mantém a persistência pelos IDs do contrato existente.

Os formulários reutilizados de técnica, clã, caminho, poder genérico e variação de técnica agora compartilham um editor de requisitos. Ele oferece regras conhecidas e “Outro”, preserva valores estruturados existentes e deixa a descrição livre como opção padrão. As características de clã também deixaram o array JSON e ganharam editor de nome e descrição, preservando propriedades adicionais dos registros legados. Poderes genéricos agora possuem editor guiado de mecânicas especiais para custos, dano, alcance, duração, limite de uso e efeitos contínuos. Os cadastros de proficiências, equipamentos, tipos de grau e habilidades gerais não exigem mais código técnico manual: o backend o gera a partir do nome, acrescenta sufixo seguro em colisões e preserva os códigos persistidos nas edições. Habilidades de técnica também deixaram de pedir o código interno do tipo de grau: o vínculo é escolhido por nome e descrição no catálogo.

#### Validação manual acumulada

- [ ] Criar equipamento e tipo de grau sem informar código e confirmar a geração automática.
- [ ] Criar nomes equivalentes e confirmar o sufixo único, sem alterar o código do registro original.
- [ ] Editar registros existentes e confirmar que seus códigos permanecem imutáveis.
- [ ] Confirmar que importadores administrativos com código explícito seguem compatíveis.
- [ ] Criar e editar uma habilidade geral, preenchendo requisitos e mecânicas pelo editor guiado.
- [ ] Criar habilidade de técnica com escalonamento e confirmar a escolha do tipo de grau por nome.

### UX-04 — Acessibilidade dos campos básicos

Prioridade: P1  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: DS-02

#### Diagnóstico e evidência

Os componentes de entrada não associam de forma uniforme rótulo, ID, ajuda e erro. Em especial, IDs fornecidos ao `Input` podem divergir do `htmlFor` gerado; o `Select` não cria a associação automaticamente.

#### Melhoria proposta

Unificar o contrato acessível de `Input`, `Select`, `Textarea` e controles equivalentes.

#### Critérios de aceitação

- [x] Rótulos acionam o respectivo campo inclusive com ID explícito.
- [x] Campos inválidos expõem aria-invalid e descrição de erro associada.
- [x] Ajuda, obrigatoriedade e erro são anunciáveis por leitor de tela.
- [ ] Testes de interação cobrem IDs explícitos e gerados.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: Input, Select, Textarea, Checkbox, DateTimePicker e field-accessibility.
- Testes e resultados: field-accessibility.test.ts (2 cenários), lint, 372 testes e build do frontend aprovados em 2026-09-12.
- Commit: 1dd2a61 feat(ui): unifica acessibilidade dos campos; c0ee6a8 fix(ui): corrige semântica do seletor de data.
- Deploy/migration, se aplicável: sem migration ou seed; publicação pendente de validação automática.
- Pendências e próxima ação: executar a verificação manual acumulada com leitor de tela e adicionar teste de interação de componente quando houver infraestrutura DOM.

#### Atualização 2026-09-12

Os campos-base compartilham um único resolvedor de acessibilidade. IDs explícitos e gerados produzem IDs distintos para ajuda e erro; mensagens externas, ajuda e erro são combinados em aria-describedby. Campos nativos também expõem aria-errormessage, e todo erro usa role="alert". Ajuda deixa de desaparecer quando há erro. O seletor de data/hora e o checkbox adotaram o mesmo contrato de descrição, sem aplicar atributos inválidos ao botão do seletor.

#### Validação manual acumulada

- [ ] Com leitor de tela, confirmar anúncio de rótulo, ajuda e erro em um campo de cada tipo.
- [ ] Confirmar que clicar no rótulo com ID explícito focaliza Input, Select, Textarea, checkbox e seletor de data/hora.
- [ ] Confirmar que o botão de ícone de um Input possui nome acessível no contexto de uso.

### UX-05 — Estados de dados remotos coerentes

Prioridade: P2  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: ARQ-02

#### Diagnóstico e evidência

Falhas de atualização podem ser apresentadas como listas vazias; por exemplo, o contador de notificações passa a zero quando as duas consultas falham.

#### Melhoria proposta

Padronizar os estados carregando, vazio, erro, conteúdo anterior e desatualizado em painéis que dependem da API.

#### Critérios de aceitação

- [ ] Erro de rede não é exibido como ausência de dados.
- [ ] Último resultado válido é preservado quando apropriado.
- [ ] O usuário pode repetir a tentativa no próprio contexto.
- [ ] O padrão é reutilizado em notificações, inventário, catálogos, chat e sessão onde aplicável.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `src/lib/ui/remote-data.ts`, `src/hooks/useRemoteData.ts`, `usePendingNotifications`, `PendingNotificationsPanel`, `CampaignNextSessionBanner` e `SessionItemsPanel`.
- Testes e resultados: frontend — 2 testes unitários do estado remoto, suíte completa com 63 arquivos/376 testes, lint e build aprovados em 2026-09-12. Quality Gate remoto com frontend e backend aprovados.
- Commit: `bb28de8 feat(ui): preserva dados remotos em falhas`; documentação inicial `1a3fee9`.
- Deploy/migration, se aplicável: sem migration ou seed; [Quality Gate 34730804299](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34730804299) aprovado e produção HTTP 200 confirmada.
- Pendências e próxima ação: em uma conta autenticada, simular falha de rede no sino, no resumo de sessão e nos itens da sessão; confirmar conteúdo preservado, mensagem clara e repetição contextual.

#### Atualização 2026-09-12

Foi criado um estado remoto reutilizável que separa primeira carga, atualização e erro. Ao falhar uma atualização, ele preserva os dados anteriores e identifica que a tela está desatualizada, em vez de substituir conteúdo por lista vazia.

O contador da topbar não zera mais por falha transitória. O painel de notificações, o resumo de sessões da campanha e os itens da sessão agora mostram erro contextual, preservam o último resultado conhecido quando houver um e oferecem “Tentar novamente” no próprio local.

#### Validação manual acumulada

- [ ] Com dados já carregados, bloquear temporariamente a rede e atualizar notificações: o contador e a lista devem permanecer visíveis, com aviso de desatualização.
- [ ] Sem dados carregados, bloquear a rede e abrir notificações: deve aparecer erro e “Tentar novamente”, nunca “nenhuma notificação”.
- [ ] Repetir a falha/recuperação no resumo de próxima sessão e nos itens da sessão, confirmando que o conteúdo anterior não some e a tentativa contextual recarrega os dados.

### UX-06 — Descoberta de ações na sessão

Prioridade: P2  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-13  
Dependências: Validação autenticada

#### Diagnóstico e evidência

A sessão reúne permissões, controle delegado, recursos e efeitos complexos. Há oportunidade de tornar mais visíveis o controlador atual, a origem de bloqueios e o estado de salvamento.

#### Melhoria proposta

Revisar os fluxos por papel e viewport, priorizando orientação contextual sem reescrever a interface da sessão.

#### Critérios de aceitação

- [ ] Mestre, dono, controlador delegado, observador e terceiro entendem suas ações disponíveis.
- [ ] Estados salvando, salvo, conflito e indisponível são claros.
- [ ] Recursos atuais, máximos e bônus são distinguíveis.
- [ ] Revisão manual cobre desktop e mobile autenticados.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `SessionAccessNotice`, `SessionPlayerSummaryPanel` e página da sessão.
- Testes e resultados: frontend — lint, suíte completa com 63 arquivos/376 testes e build aprovados em 2026-09-13.
- Commit: pendente de publicação deste lote.
- Deploy/migration, se aplicável: sem migration ou seed; deploy pendente deste lote.
- Pendências e próxima ação: validar a comunicação de acesso em contas de mestre, jogador dono, controlador delegado, observador e terceiro.

#### Atualização 2026-09-13

Jogadores agora veem um aviso de acesso no próprio painel da sessão. Ele identifica papel, modo de elenco do mestre, sessão encerrada e os personagens/NPCs delegados ao usuário, explicando que recursos, habilidades, ações e rolagens são operacionais enquanto edição estrutural, condições e composição da cena continuam com o mestre.

Quando o personagem exibido foi delegado, o painel deixa de chamá-lo de “Meu personagem” e passa a usar “Personagem sob seu controle”. O painel de NPCs delegados já existente continua sendo apresentado no centro da sessão, sem liberar botões estruturais.

#### Validação manual acumulada

- [ ] Mestre: confirmar painel de elenco, delegações e controles estruturais em desktop e mobile.
- [ ] Jogador com personagem próprio: confirmar resumo “Meu personagem”, recursos e ações disponíveis.
- [ ] Jogador com personagem/NPC delegado: confirmar aviso, rótulo “Personagem sob seu controle”, recursos, ações e rolagens; edição estrutural deve continuar ausente.
- [ ] Observador e membro sem delegação: confirmar aviso de modo leitura/aguardo e ausência de ações operacionais.
- [ ] Sessão encerrada: confirmar aviso de modo leitura e controles desabilitados.

## 7. Código e qualidade

### COD-01 — CI obrigatório de qualidade

Prioridade: P1  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: Ambientes CI

#### Diagnóstico e evidência

O workflow versionado valida cobertura de códigos de erro, mas não executa integralmente testes, lint e builds de frontend e backend.

#### Melhoria proposta

Criar pipeline obrigatório e reproduzível que execute instalação limpa, verificações estáticas, testes e builds de ambos os projetos.

#### Critérios de aceitação

- [ ] Pull requests e `main` executam verificações dos dois projetos.
- [ ] Falhas de lint, teste ou build impedem a promoção definida pela equipe.
- [ ] O pipeline usa versão de Node declarada e cache seguro.
- [ ] Resultados ficam vinculados ao commit publicado.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Execução remota do workflow verificada.
- [ ] Proteção de branch e checks obrigatórios configurados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [x] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `.github/workflows/quality.yml`; scripts `lint:check` nos dois `package.json`; geração explícita do Prisma Client antes do lint do backend, com URL inerte exclusiva do CI para carregar o schema sem acessar banco remoto.
- Testes e resultados: lint, testes e builds locais aprovados em 2026-09-12; workflow remoto [Quality Gate #34674029929](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34674029929) aprovado para frontend e backend.
- Commit: `513e1de`.
- Deploy/migration, se aplicável: não aplicável.
- Pendências e próxima ação: `main` não possui proteção de branch; definir os checks obrigatórios da equipe antes de marcar este item como concluído.

### COD-02 — Lint verificável sem escrita

Prioridade: P1  
Status: Concluído  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: COD-01

#### Diagnóstico e evidência

O lint do backend incorpora `--fix`, tornando uma verificação aparentemente somente leitura capaz de alterar arquivos. A execução sem escrita revelou erros de formatação e avisos de tipagem.

#### Melhoria proposta

Separar comandos `lint:check` e `lint:fix`; resolver os problemas existentes em mudança controlada e sem misturá-los com alterações funcionais.

#### Critérios de aceitação

- [ ] O lint de CI não grava arquivos.
- [ ] O lint local de correção é explícito.
- [ ] A execução de verificação passa sem erros e sem avisos aceitos indevidamente.
- [ ] Alterações mecânicas de formatação são isoladas em commit próprio, quando viável.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [x] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [x] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `assistenterpg-back/package.json`, `assistenterpg-front/package.json`, `assistenterpg-back/src/auth/jwt.strategy.ts` e formatação mecânica de arquivos apontados pelo lint.
- Testes e resultados: `npm run lint:check` aprovado sem avisos em frontend e backend; suites e builds também aprovados em 2026-09-12; [Quality Gate #34674029929](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34674029929) aprovou ambos os jobs.
- Commit: `e1241bb`, `d546539`, `24eac1e` e `513e1de`.
- Deploy/migration, se aplicável: não aplicável.
- Pendências e próxima ação: —

### COD-03 — Contratos e permissões entre frontend e backend

Prioridade: P1  
Status: Em validação  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: UX-03

#### Diagnóstico e evidência

Existem respostas completas, resumidas e delegadas de sessão. Falhas anteriores mostraram que o frontend pode presumir campos omitidos legitimamente pelo backend.

#### Melhoria proposta

Ampliar testes de contrato e de permissões por papel, normalizando respostas na fronteira da API.

#### Critérios de aceitação

- [x] Matriz mestre, dono, delegado, observador e terceiro é coberta por testes unitários de controle.
- [x] Respostas parciais não causam exceção no frontend.
- [x] Recursos privados não são serializados para atores sem permissão.
- [x] Alterações de contratos exigem testes front e back correspondentes.

#### Checklist

- [x] Solução definida.
- [x] Implementação concluída.
- [x] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `assistenterpg-back/src/sessao/sessao.service.ts`, `assistenterpg-front/src/lib/types/campanha.types.ts`, `assistenterpg-front/src/lib/campanha/sessao-atualizacoes.ts`, cartões e painéis de NPC da sessão.
- Testes e resultados: frontend — `sessao-atualizacoes.test.ts` (7 testes), suíte completa (60 arquivos, 370 testes), lint e build aprovados; backend — `sessao.service.spec.ts` (137 testes), lint, build e `prisma validate` aprovados; [Quality Gate #34689342139](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34689342139) aprovado.
- Commit: `afecca2`.
- Deploy/migration, se aplicável: sem migration ou seed; produção em `https://assistenterpg-fullstack.vercel.app/` respondeu HTTP 200 em 2026-09-12.
- Pendências e próxima ação: executar a bateria manual autenticada dos papéis após o deploy e registrar resultado.

### COD-04 — Seletores reutilizáveis de catálogo

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: DS-02

#### Diagnóstico e evidência

Seletores semelhantes mantêm buscas, descrições, fontes e estados de seleção de maneiras diferentes.

#### Melhoria proposta

Definir componente e contrato comuns para seleção pesquisável de catálogo, com chips, detalhes e configuração contextual.

#### Critérios de aceitação

- [ ] Busca considera nome, descrição e fonte de maneira consistente.
- [ ] Edição mantém seleção existente sem exigir nova escolha.
- [ ] Erro, carregamento, vazio e seleção incompatível têm comportamento uniforme.
- [ ] O componente atende catálogos sem expor valores técnicos ao usuário comum.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Comparar seletores existentes e extrair interface mínima comum.

## 8. Arquitetura e desempenho

### ARQ-01 — Extração incremental das responsabilidades da sessão

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: COD-03

#### Diagnóstico e evidência

`SessaoService` concentra regras de sessão em aproximadamente 19 mil linhas; a página de sessão no frontend concentra aproximadamente 4,6 mil linhas.

#### Melhoria proposta

Extrair casos de uso por domínio — recursos, turnos, habilidades, elenco, condições e sincronização — de forma incremental e protegida por testes.

#### Critérios de aceitação

- [ ] Cada extração possui contrato, testes e responsabilidade delimitada.
- [ ] Não há mudança involuntária em permissões, regras autoritativas ou payloads.
- [ ] Arquivos concentradores diminuem sem introduzir camadas duplicadas.
- [ ] A rota de sessão mantém builds, testes e smoke aplicáveis aprovados.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Selecionar o primeiro domínio com menor acoplamento e maior cobertura.

### ARQ-02 — Sincronização e polling eficientes

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: Observabilidade

#### Diagnóstico e evidência

Sessão, roleta e notificações combinam realtime com polling. O fallback é importante, mas pode produzir consultas redundantes, inclusive em abas ocultas.

#### Melhoria proposta

Medir chamadas e latência antes de consolidar solicitações, cancelar respostas obsoletas e adaptar comportamento à visibilidade da aba.

#### Critérios de aceitação

- [ ] Há métricas de frequência, falha e latência por fluxo.
- [ ] Fallback continua recuperando falhas de WebSocket.
- [ ] Abas em segundo plano não geram polling desnecessário.
- [ ] Não há atualização concorrente que reverta estado otimista validado.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Coletar baseline de polling e chamadas por sessão aberta.

### ARQ-03 — Contratos compartilhados e validação de fronteira

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: COD-03

#### Diagnóstico e evidência

Tipos de API extensos são mantidos em frontend e backend separadamente, elevando o risco de divergência com payloads parciais.

#### Melhoria proposta

Mapear contratos duplicados e estabelecer geração, validação ou testes de compatibilidade na fronteira HTTP/WebSocket.

#### Critérios de aceitação

- [ ] Contratos críticos possuem fonte de verdade ou teste de compatibilidade definido.
- [ ] Dados externos são normalizados antes de chegar aos componentes.
- [ ] Uniões discriminadas de visibilidade permanecem explícitas.
- [ ] A estratégia não quebra contratos públicos existentes.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Levantar tipos duplicados nas APIs de campanha e sessão.

## 9. Design system

### DS-01 — Contraste dos botões por tema

Prioridade: P1  
Status: Em andamento  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: DS-02

#### Diagnóstico e evidência

O botão primário aplica texto branco sobre o ciano principal `#4fd6ff`; o contraste calculado para essa combinação é aproximadamente 1,69:1.

#### Melhoria proposta

Criar token de texto sobre cor primária por tema e revisar variantes críticas mantendo a identidade visual.

#### Critérios de aceitação

- [ ] Texto de ações primárias atende contraste aplicável em todos os temas.
- [ ] Variantes destrutiva, aviso e desabilitada são revisadas.
- [ ] Nenhuma tela depende diretamente de cor fixa para texto sobre token de ação.
- [ ] Catálogo de componentes demonstra os estados revisados.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Definir tokens e medir contraste das variantes.

### DS-02 — Catálogo de componentes como referência operacional

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: UX-01

#### Diagnóstico e evidência

Já existe uma rota de catálogo de componentes, mas ela não consolida todos os estados e cenários responsáveis por regressões.

#### Melhoria proposta

Ampliar o catálogo com estados de erro, carregamento, desabilitado, conteúdo longo, viewport estreita, teclado e camadas sobrepostas.

#### Critérios de aceitação

- [ ] Componentes fundamentais têm demonstração de estados relevantes.
- [ ] Os cenários de modal, notificações e formulários são reproduzíveis localmente.
- [ ] Novos componentes compartilham tokens, nomenclatura e testes mínimos.
- [ ] A rota é acessível apenas no contexto previsto para desenvolvimento.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Inventariar componentes e seus estados críticos.

### DS-03 — Organização de tokens e estilos por domínio

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: DS-02

#### Diagnóstico e evidência

`globals.css` concentra aproximadamente 3,3 mil linhas, inclusive estilos específicos de sessão e seletores repetidos. Campos visuais equivalentes também divergem em acabamento.

#### Melhoria proposta

Separar tokens globais de estilos de domínio e normalizar espaçamentos, bordas, tamanhos e camadas de sobreposição.

#### Critérios de aceitação

- [ ] Tokens globais possuem local e convenção definidos.
- [ ] Estilos de sessão e domínios não permanecem concentrados indevidamente no global.
- [ ] Não há seletor duplicado com regra conflitante.
- [ ] `Input`, `Select`, `Textarea` e controles relacionados seguem o mesmo padrão visual.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Mapear tokens, estilos de sessão e duplicações sem alterar comportamento.

## 10. Operação, segurança e banco

### OPS-01 — Atualização controlada de dependências

Prioridade: P1  
Status: Em andamento  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: COD-01

#### Diagnóstico e evidência

As auditorias de dependências apontaram alertas críticos, altos e moderados. O frontend usa Next 16.2.6, que consta em avisos críticos corrigidos na linha 16 a partir de 16.3.3. A aplicabilidade concreta depende do ambiente e dos recursos utilizados.

#### Melhoria proposta

Triar a exposição real e atualizar dependências em lotes pequenos, com lockfile, testes, builds e observação após publicação.

#### Critérios de aceitação

- [ ] Cada alerta tem classificação de exposição, correção e risco de compatibilidade.
- [ ] Dependências críticas expostas são atualizadas ou mitigadas com justificativa.
- [ ] Não é usado `npm audit fix --force` sem revisão.
- [ ] Testes, builds e deploy de cada lote ficam registrados.

#### Checklist

- [x] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [x] Testes e validações aplicáveis registrados.
- [x] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR: `assistenterpg-front/package.json`, `assistenterpg-back/package.json` e respectivos lockfiles.
- Testes e resultados: frontend sem vulnerabilidades reportadas pelo `npm audit --omit=dev`; backend com 3 alertas altos restantes em `prisma` -> `@prisma/config` -> `deepmerge-ts`. Lint, testes, builds e `prisma validate` aprovados.
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: avaliar upgrade compatível para Prisma 7/8 em lote próprio. A sugestão automática atual aponta para downgrade a 6.12.0 e não deve ser usada.

### OPS-02 — Observabilidade de cliente e saúde do backend

Prioridade: P1  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: Acesso de observabilidade

#### Diagnóstico e evidência

Logs de runtime de servidor não cobrem exceções JavaScript no navegador. O endpoint raiz do backend comprova resposta HTTP, mas não disponibilidade de dependências críticas.

#### Melhoria proposta

Instrumentar erros de cliente com contexto sanitizado, health/readiness do backend, versão do deploy e métricas de falha/latência.

#### Critérios de aceitação

- [ ] Erros de navegador têm correlação com versão e rota sem incluir segredos.
- [ ] Backend expõe saúde e prontidão adequadas para monitoramento.
- [ ] Alertas distinguem indisponibilidade, falha de autenticação e falha de realtime.
- [ ] Equipe consegue correlacionar incidente, commit e deployment.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Definir ferramenta, retenção, campos sanitizados e alertas mínimos.

### OPS-03 — Validação robusta de migrations

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: Ambiente descartável

#### Diagnóstico e evidência

O procedimento atual valida conexão, Prisma e contagens; `prisma migrate status` confirmou schema atualizado. Ainda assim, contagem de migrations não substitui checagem contínua de histórico, checksums, compatibilidade e reconstrução.

#### Melhoria proposta

Fortalecer o procedimento de validação com status completo, verificações de histórico e ensaio em ambiente descartável compatível com TiDB.

#### Critérios de aceitação

- [ ] Pipeline verifica migrations pendentes e histórico inválido.
- [ ] Migrations são testadas em banco descartável antes do remoto produtivo.
- [ ] Compatibilidade MySQL/TiDB é validada para SQL específico.
- [ ] Procedimento registra backup, aplicação e validação posterior quando houver mutação.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Definir ambiente descartável e ampliar script de validação somente leitura.

### OPS-04 — Recuperação e desempenho operacional

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: Ambiente de restauração

#### Diagnóstico e evidência

Há procedimento de backup, mas a auditoria não realizou ensaio de restauração nem teve acesso a métricas e planos de execução suficientes para diagnosticar gargalos.

#### Melhoria proposta

Ensaiar recuperação isolada, definir objetivos de recuperação e medir consultas lentas antes de qualquer mudança de infraestrutura ou índices.

#### Critérios de aceitação

- [ ] Backup é restaurado com sucesso em ambiente isolado.
- [ ] Tempo e integridade de restauração são registrados.
- [ ] Consultas críticas possuem baseline de latência e volume.
- [ ] Mudanças de índice ou capacidade são justificadas por medição.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Definir política de backup, ambiente isolado e roteiro de restauração.

## 11. Documentação e organização

### DOC-01 — Referência atual separada de histórico

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: —

#### Diagnóstico e evidência

O README consolidado da documentação reúne aproximadamente 2,1 mil linhas de referência, decisões e histórico, dificultando localizar a orientação vigente.

#### Melhoria proposta

Manter índice e referência operacional curtos, deslocando histórico e decisões para documentos específicos por domínio.

#### Critérios de aceitação

- [ ] A orientação atual é localizável por tarefa e domínio.
- [ ] Decisões relevantes têm contexto, data e consequência documentados.
- [ ] Histórico não compete com contrato operacional atual.
- [ ] Índice aponta para todos os documentos vivos relevantes.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Propor mapa de documentação por domínio e por tipo de decisão.

### DOC-02 — Ambiente reproduzível e configuração Prisma consolidada

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: COD-01

#### Diagnóstico e evidência

Há diferenças entre versões locais, CI e Vercel; os pacotes não declaram `engines`. Prisma informa configuração legada em `package.json` coexistindo com `prisma.config.ts`.

#### Melhoria proposta

Declarar ambiente suportado, alinhar CI/build e consolidar a configuração Prisma sem quebrar geração ou seeds.

#### Critérios de aceitação

- [ ] Versão de Node suportada é declarada e usada localmente, no CI e no deploy.
- [ ] Instalação limpa reproduz build e testes documentados.
- [ ] Aviso de configuração Prisma legada é removido de forma compatível.
- [ ] Seeds e migrations continuam executáveis pelo procedimento oficial.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Definir versão-alvo de Node e plano de remoção da configuração Prisma legada.

### DOC-03 — Comandos, links e exemplos verificáveis

Prioridade: P3  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
Dependências: DOC-01

#### Diagnóstico e evidência

Foi encontrado comando documentado com grafia divergente do script real de seed de modificações aplicáveis. Inconsistências semelhantes podem tornar o ambiente difícil de reproduzir.

#### Melhoria proposta

Validar comandos, caminhos e links internos automaticamente ou em checklist de documentação.

#### Critérios de aceitação

- [ ] Comandos documentados existem e podem ser executados no contexto informado.
- [ ] Links Markdown internos são válidos.
- [ ] Exemplos mínimos têm pré-requisitos e resultado esperado.
- [ ] Inclusão ou alteração de script atualiza a documentação associada.

#### Checklist

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados:
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Corrigir o comando divergente e criar inventário verificável de scripts documentados.

## 12. Bateria consolidada de validação manual

Executar ao final dos lotes, em desktop e mobile autenticados, registrando data, navegador, papel e resultado em cada item.

### UI/UX — diálogos, formulários e contraste

- [ ] Abrir um `Modal`, abrir uma confirmação sobreposta e fechar com `Escape`: somente a camada superior fecha e a rolagem permanece bloqueada até o último diálogo.
- [ ] Confirmar e cancelar diálogos por teclado: foco entra no diálogo, fica contido nele e retorna ao gatilho após fechar.
- [ ] Forçar falha em uma confirmação assíncrona: o diálogo permanece aberto, preserva o contexto e exibe o erro junto à ação.
- [ ] Conferir `Input`, `Select` e `Textarea` com ID explícito e gerado: rótulo aciona o campo; ajuda/erro são anunciados e o estado inválido é exposto.
- [ ] Criar uma técnica sem informar código: conferir o código automático, a seleção de clãs por nome, a rejeição de técnica hereditária sem clã e a preservação de importações legadas com código explícito.
- [ ] Criar e editar um clã: selecionar técnicas hereditárias por nome, remover todas para limpar os vínculos e confirmar que técnicas não hereditárias não aparecem na lista.
- [ ] Criar e editar conteúdo de suplemento: informar requisitos livres e estruturados, alternar entre os dois formatos e confirmar a preservação de requisitos legados.
- [ ] Criar e editar um clã com características livres e estruturadas: adicionar, remover, alternar os formatos e confirmar a preservação de dados legados.
- [ ] Criar e editar poder genérico: informar mecânicas livres e estruturadas, incluindo “Outro”, e confirmar a preservação de dados legados.
- [ ] Criar e editar uma variação de técnica: informar requisitos livres e estruturados e confirmar que eles se aplicam apenas à variação.
- [ ] Criar proficiência sem código: confirmar a geração automática, a estabilidade do código existente ao editar e a compatibilidade de importação com código explícito.
- [ ] Conferir botões e badges primários, destrutivos, de aviso e desabilitados nos temas padrão, roxo, vermelho e verde, claro e escuro.

### Registro da bateria

| Data | Ambiente/papel | Itens executados | Resultado | Evidência/pendência |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

### Sessão — contratos, privacidade e controle delegado

- [ ] Como mestre, abrir uma sessão com personagens e NPCs: todos os cartões operacionais, recursos e ações devem estar disponíveis.
- [ ] Como dono do personagem e como controlador delegado, confirmar acesso completo somente ao participante sob seu controle e ajuste de recursos atuais.
- [ ] Como jogador sem delegação e como observador, confirmar que personagens de terceiros exibem apenas o resumo permitido e NPCs exibem somente nome/tipo, sem recursos, ações, atributos ou condições privadas.
- [ ] Atualizar a sessão por polling e, quando disponível, Socket.IO enquanto há um cartão resumido: a tela não pode desmontar nem apresentar exceção no console.

## 13. Histórico de acompanhamento

| Data | IDs | Alteração | Evidência | Próxima etapa |
| --- | --- | --- | --- | --- |
| 2026-09-11 | Todos | Auditoria criada; 23 melhorias registradas como pendentes. | Testes, builds, lint, Vercel e TiDB descritos na seção 3. | Priorizar P1: OPS-01, COD-01, COD-02, DS-01, UX-01 a UX-04, COD-03 e OPS-02. |
| 2026-09-12 | OPS-01, COD-01, COD-02 | Atualizadas dependências compatíveis, scripts de lint e workflow de qualidade; ajustados fixtures expostos pelo novo typecheck. | Frontend: audit 0, lint, 368 testes e build aprovados. Backend: lint, 868 testes, build e Prisma aprovados; 3 alertas Prisma permanecem. | Publicar e validar o workflow remoto; tratar Prisma em upgrade dedicado. |
| 2026-09-12 | UX-03 | Cadastro de técnica migrou código automático e seleção de clãs por nome; requisitos comuns ganharam orientação textual. | `e7a76a5`, `968f89d`; [Quality Gate 34697036630](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34697036630) aprovado e produção HTTP 200. | Seguir com outros cadastros de catálogo. |
| 2026-09-12 | UX-03 | Cadastro de clãs migrou técnicas hereditárias de IDs CSV para seleção guiada. | `cccee52`; [Quality Gate 34697548021](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34697548021) aprovado e produção HTTP 200. | Seguir com requisitos estruturados e outros catálogos. |
| 2026-09-12 | UX-03 | Técnica, clã, caminho e poder genérico passaram a compartilhar editor guiado de requisitos. | `88a2f2d`; [Quality Gate 34697902665](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34697902665) aprovado e produção HTTP 200. | Revisar características e mecânicas avançadas. |
| 2026-09-12 | UX-03 | Características de clã migraram de array JSON para editor visual de nome e descrição. | `7d32606`; [Quality Gate 34699031514](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34699031514) aprovado e produção HTTP 200. | Revisar mecânicas avançadas. |
| 2026-09-12 | UX-03 | Mecânicas especiais de poderes migraram de JSON para editor guiado. | `22f951d`; [Quality Gate 34699473681](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34699473681) aprovado e produção HTTP 200. | Revisar formulários restantes. |
| 2026-09-12 | UX-03 | Requisitos específicos de variações de técnica migraram de JSON para editor guiado. | `1fe1161`; [Quality Gate 34699914529](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34699914529) aprovado e produção HTTP 200. | Revisar formulários restantes. |
| 2026-09-12 | UX-03 | Cadastro de proficiências deixou de exigir código técnico manual. | `7ec969a`; validações locais direcionadas registradas em UX-03. | Publicar e validar o gate remoto; seguir para equipamentos e tipos de grau. |
| 2026-09-12 | UX-03 | Cadastros de equipamentos e tipos de grau deixaram de exigir código técnico manual; o backend gera código estável e acrescenta sufixo em colisões. | `a795b9f`; frontend: lint, 370 testes e build; backend: 5 suítes/12 testes, lint, build e Prisma validate; [Quality Gate 34704638121](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34704638121) aprovado. | Manter a bateria manual acumulada e migrar os painéis restantes. |
| 2026-09-12 | UX-03 | Habilidades gerais migraram requisitos e mecânicas de JSON manual para editores guiados; habilidades de técnica passaram a selecionar o tipo de grau pelo catálogo. | `4bde960`; frontend: lint, 370 testes e build; backend: 8 suítes/24 testes, lint, build e Prisma validate. | Publicar, acompanhar o Quality Gate e seguir com os cadastros relacionais restantes. |
| 2026-09-12 | UX-04 | Campos-base passaram a compor rótulo, ajuda, erro e descrições externas pelo mesmo contrato acessível; o seletor de data/hora foi ajustado para manter semântica válida de botão. | `1dd2a61`, `c0ee6a8`; 2 testes focados, lint, 372 testes e build do frontend aprovados. | Publicar, acompanhar o Quality Gate e executar a bateria manual com leitor de tela. |
| 2026-09-12 | UX-01, UX-02 | Diálogos agora compartilham pilha, foco, rolagem e z-index; confirmações aguardam a operação autoritativa antes de fechar. | `1918046`; 2 testes focados, lint, 374 testes e build do frontend aprovados. | Publicar, acompanhar o Quality Gate e executar a bateria manual de modais e falhas assíncronas. |
| 2026-09-12 | UX-05 | Dados remotos passaram a preservar conteúdo válido durante falhas e a oferecer repetição contextual em notificações, resumo de sessão e itens da sessão. | `bb28de8`, `1a3fee9`; 2 testes focados; frontend: lint, 376 testes e build; [Quality Gate 34730804299](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34730804299) aprovado; produção HTTP 200. | Executar a bateria manual de rede acumulada. |
| 2026-09-13 | UX-06 | A sessão passou a comunicar papel, elenco do mestre, modo leitura e participantes delegados; o resumo diferencia personagem próprio de delegado. | Frontend: lint, 376 testes e build aprovados. | Publicar, acompanhar o Quality Gate e executar a bateria manual por papel e viewport. |
| 2026-09-12 | COD-01, COD-02 | O Quality Gate remoto foi aprovado após incluir a geração isolada do Prisma Client no backend. | [Run #34674029929](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34674029929): frontend e backend aprovados. | COD-02 concluído; COD-01 aguarda decisão de proteção obrigatória para `main`. |
| 2026-09-12 | COD-03 | Contratos de NPC da sessão passaram a distinguir visão operacional e resumo público; o backend passou a emitir `condicoesAtivas: []` também no resumo. | Testes focais front/back aprovados; publicação e bateria autenticada pendentes. | Publicar, acompanhar o Quality Gate e executar a bateria por papel. |
| 2026-09-12 | COD-03 | Publicação concluída e evidências automáticas registradas. | Commit `afecca2`; [Quality Gate #34689342139](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34689342139) aprovado; produção HTTP 200. | Executar a bateria manual autenticada acumulada antes de concluir o item. |

## 14. Próxima priorização recomendada

1. `OPS-01`: triar e corrigir dependências expostas com validação completa.
2. `COD-01` e `COD-02`: tornar a qualidade verificável antes da publicação.
3. `DS-01`, `UX-01`, `UX-02` e `UX-04`: corrigir componentes compartilhados de alto alcance.
4. `COD-03` e `OPS-02`: fortalecer contratos, permissões e diagnóstico de falhas reais.
5. `UX-03`, `COD-04`, `ARQ-01` a `ARQ-03`: evoluir formulários e arquitetura de forma incremental.
