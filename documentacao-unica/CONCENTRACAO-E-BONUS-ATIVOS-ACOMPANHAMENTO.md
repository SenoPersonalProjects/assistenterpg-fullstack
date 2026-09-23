# Concentração e bônus ativos — acompanhamento

Status: Em validação

## Escopo implementado

- [x] Centralizar os bônus de Domínio Incompleto ativo na sessão para perícias e ataques estruturados: `+5` em Jujutsu/Luta e `+1d20` no atributo escolhido.
- [x] Aplicar o bônus de dados de efeito em rolagens estruturadas de dano da Técnica Inata e registrar os ajustes no histórico da rolagem.
- [x] Persistir se uma sustentação exige Concentração, sem alterar sustentações legadas.
- [x] Resolver automaticamente o teste de Vontade quando um personagem que mantém uma sustentação concentrada perde PV por ajuste de recursos na sessão.
- [x] Encerrar a sustentação e suas condições vinculadas em falha, com eventos auditáveis de teste e encerramento.
- [x] Exibir o requisito de Concentração antes de ativar a habilidade e na lista de sustentações ativas.
- [x] Marcar no catálogo Produção Concentrada, Cura Sustentada e Empatia — Cura Sustentada como efeitos que exigem Concentração.

## Regras aplicadas

- DT de Concentração: `15 + 3` para cada grupo completo de 10 PV de dano do mesmo ajuste.
- Uma falha encerra todos os efeitos sustentados daquele personagem que exigem Concentração; as demais sustentações continuam ativas.
- Rolagens livres de fórmula não recebem bônus automáticos: não possuem participante, perícia ou origem mecânica verificável pelo servidor.
- Bônus de Domínio Incompleto são restritos à cena e ao personagem que o manifestou; não dependem de valores enviados pelo cliente.

## Validação manual pendente

- [ ] Ativar Produção Concentrada, sofrer 10 e 20 PV de dano e conferir respectivamente DT 18 e 21 no histórico.
- [ ] Falhar no teste e confirmar a remoção da sustentação e da condição Produção Acelerada.
- [ ] Passar no teste e confirmar que a sustentação permanece ativa.
- [ ] Manifestar Domínio Incompleto com atributo PRE, rolar Jujutsu, Luta e uma perícia de PRE; conferir os bônus no resultado e histórico.
- [ ] Rolar dano estruturado de Técnica Inata durante Epifania e confirmar o dado adicional; repetir com técnica não inata e confirmar que ela não recebe o benefício.
- [ ] Conferir em desktop e mobile o aviso de Concentração na técnica e na aba de sustentações.

## Limites deliberados

## Registro de aplicação — 2026-09-16

- Migration `20260916110000_concentracao_sustentacoes` aplicada no TiDB remoto `test`; a validação posterior confirmou 112 migrations registradas.
- Seed idempotente `tecnicas-nao-inatas` executado após a migration para atualizar os metadados de Concentração no catálogo.
- Testes focados de sessão: 3 suites, 150 testes aprovados. A simulação incremental de recursos agora inclui explicitamente o repositório de sustentações, cobrindo o novo ponto de consulta sem acessar banco real.
- Builds de backend e frontend executados localmente; o build do frontend concluiu sem erros de TypeScript.
- A bateria manual acima continua acumulada para a validação final em sessão autenticada.

Concentração é processada no ponto autoritativo de ajuste de PV do personagem. Integrações futuras de dano automático que alterem PV diretamente devem reutilizar esse mesmo fluxo, em vez de atualizar o recurso fora da sessão. Dano de uma única ação igual ou superior a 50% dos PV máximos agora torna um Domínio Instável automaticamente; se ele já estiver Instável, colapsa.
