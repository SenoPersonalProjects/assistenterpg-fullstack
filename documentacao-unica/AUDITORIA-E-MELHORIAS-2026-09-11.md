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
| UX-01 | UI/UX | P1 | Em andamento | DS-02 | Cobrir pilha de diálogos com testes de foco e camadas |
| UX-02 | UI/UX | P1 | Em andamento | UX-01 | Migrar confirmações críticas e cobrir falhas assíncronas |
| UX-03 | UI/UX | P1 | Pendente | COD-03 | Mapear todos os campos técnicos expostos |
| UX-04 | UI/UX | P1 | Em andamento | DS-02 | Cobrir IDs explícitos e descrições acessíveis com testes |
| UX-05 | UI/UX | P2 | Pendente | ARQ-02 | Definir estados comuns de dados remotos |
| UX-06 | UI/UX | P2 | Pendente | Validação autenticada | Revisar fluxos de sessão por papel e viewport |
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
Status: Em andamento  
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

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados: lint, 368 testes e build do frontend aprovados em 2026-09-12.
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: validar foco, camadas e retorno ao gatilho em cenário manual com diálogos aninhados; migrar os diálogos especializados gradualmente.

### UX-02 — Envio assíncrono e fechamento de formulários

Prioridade: P1  
Status: Em andamento  
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

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados: lint, 368 testes e build do frontend aprovados em 2026-09-12; consumidores que descartavam Promises de confirmação foram migrados.
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: migrar confirmações críticas para retorno assíncrono e adicionar testes de falha sem fechamento.

### UX-03 — Remoção de campos técnicos dos cadastros

Prioridade: P1  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
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

- [ ] Solução definida.
- [ ] Implementação concluída.
- [ ] Critérios de aceitação verificados.
- [ ] Testes e validações aplicáveis registrados.
- [ ] Documentação atualizada.
- [ ] Publicação validada, quando aplicável.

#### Evidências

- Arquivos/PR:
- Testes e resultados: lint, 368 testes e build do frontend aprovados em 2026-09-12.
- Commit:
- Deploy/migration, se aplicável:
- Pendências e próxima ação: Inventariar campos técnicos restantes e priorizar por frequência de uso.

### UX-04 — Acessibilidade dos campos básicos

Prioridade: P1  
Status: Em andamento  
Responsável: A definir  
Última atualização: 2026-09-12  
Dependências: DS-02

#### Diagnóstico e evidência

Os componentes de entrada não associam de forma uniforme rótulo, ID, ajuda e erro. Em especial, IDs fornecidos ao `Input` podem divergir do `htmlFor` gerado; o `Select` não cria a associação automaticamente.

#### Melhoria proposta

Unificar o contrato acessível de `Input`, `Select`, `Textarea` e controles equivalentes.

#### Critérios de aceitação

- [ ] Rótulos acionam o respectivo campo inclusive com ID explícito.
- [ ] Campos inválidos expõem `aria-invalid` e descrição de erro associada.
- [ ] Ajuda, obrigatoriedade e erro são anunciáveis por leitor de tela.
- [ ] Testes cobrem IDs explícitos e gerados.

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
- Pendências e próxima ação: adicionar testes de IDs explícitos/gerados e revisar controles especializados.

### UX-05 — Estados de dados remotos coerentes

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
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
- Pendências e próxima ação: Levantar padrões atuais de carregamento e erro por módulo.

### UX-06 — Descoberta de ações na sessão

Prioridade: P2  
Status: Pendente  
Responsável: A definir  
Última atualização: —  
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
- Pendências e próxima ação: Agendar roteiro de teste exploratório por papel.

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
- Testes e resultados: frontend — `sessao-atualizacoes.test.ts` (7 testes), suíte completa (60 arquivos, 370 testes), lint e build aprovados; backend — `sessao.service.spec.ts` (137 testes), lint, build e `prisma validate` aprovados. CI remoto será registrado após a publicação.
- Commit: pendente deste lote.
- Deploy/migration, se aplicável: sem migration ou seed; deploy pendente.
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
| 2026-09-12 | COD-01, COD-02 | O Quality Gate remoto foi aprovado após incluir a geração isolada do Prisma Client no backend. | [Run #34674029929](https://github.com/SenoPersonalProjects/assistenterpg-fullstack/actions/runs/34674029929): frontend e backend aprovados. | COD-02 concluído; COD-01 aguarda decisão de proteção obrigatória para `main`. |
| 2026-09-12 | COD-03 | Contratos de NPC da sessão passaram a distinguir visão operacional e resumo público; o backend passou a emitir `condicoesAtivas: []` também no resumo. | Testes focais front/back aprovados; publicação e bateria autenticada pendentes. | Publicar, acompanhar o Quality Gate e executar a bateria por papel. |

## 14. Próxima priorização recomendada

1. `OPS-01`: triar e corrigir dependências expostas com validação completa.
2. `COD-01` e `COD-02`: tornar a qualidade verificável antes da publicação.
3. `DS-01`, `UX-01`, `UX-02` e `UX-04`: corrigir componentes compartilhados de alto alcance.
4. `COD-03` e `OPS-02`: fortalecer contratos, permissões e diagnóstico de falhas reais.
5. `UX-03`, `COD-04`, `ARQ-01` a `ARQ-03`: evoluir formulários e arquitetura de forma incremental.
