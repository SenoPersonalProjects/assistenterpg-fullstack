# Epifania e Domínio Incompleto — acompanhamento

Status: Em validação

## Escopo

- [x] Persistir tentativas, DT e resultado por personagem e cena.
- [x] Resolver a Rolagem de Epifania no servidor: `1d20` cru contra DT 20, reduzida em 1 a cada falha na mesma cena.
- [x] Autorizar a tentativa pelo mestre e impedir uma segunda manifestação na mesma cena.
- [x] Criar Domínio Incompleto sem Acerto Garantido, com atributo escolhido, bônus de Jujutsu/Luta e bônus de dado de efeito auditáveis.
- [x] Aplicar quatro rodadas de Esgotamento da Técnica ao término do Domínio Incompleto; interrupção mantém uma rodada.
- [x] Exibir o estado e abrir o fluxo guiado de Epifania no painel de Domínios do mestre.
- [x] Permitir que o mestre configure custos, estrutura e grau de barreira antes da rolagem, com validação local e no servidor.
- [x] Neutralizar Acerto Garantido dos Domínios participantes para os alvos explicitamente incluídos em uma disputa ativa.
- [x] Integrar os bônus de atributo, Jujutsu/Luta e dados de efeito ao resolvedor universal de rolagens/efeitos de Técnica Inata.
- [x] Validações automáticas de tipo, compilação, Prisma e documentação registradas.
- [ ] Bateria manual.

## Limites deliberados

O mestre define quando a situação narrativa permite uma tentativa. A interface atual permite configurar nome, atributo, custos, estrutura e grau de barreira; a escolha de alvos e a descrição avançada seguem o fluxo de Domínios completo. Os bônus universais são calculados pelo servidor enquanto o Domínio Incompleto estiver ativo: `+5` em Jujutsu/Luta, `+1d20` no atributo escolhido e `+1` ou `+2` dados nos efeitos estruturados de dano ou cura da Técnica Inata.

## Pontos ainda parciais da regra 1.4

- [ ] O Refinamento precisa migrar para uma rolagem estruturada para aplicar literalmente os `-2d20` de Domínio Incompleto; o resolvedor atual de disputa ainda usa valores técnicos agregados.
- [ ] Quando existir uma Expansão completa cadastrada na ficha, a Epifania deve herdar automaticamente seu custo-base. Enquanto esse vínculo não existe, o mestre informa os custos antes da rolagem.
- [ ] A Epifania manifesta o Domínio diretamente quando obtém sucesso; ainda não há uma janela própria de abertura/interrupção entre a rolagem e a formação para aplicar o caso específico de interrupção antecipada.

## Evidências automáticas

- 2026-09-16 — commit `9fa8020` adicionou a neutralização de Acerto Garantido para alvos de uma disputa ativa, com teste de regressão no serviço de sessão.
- 2026-09-16 — os workflows **Quality Gate** (`35108684993`) e **Error Code Coverage** (`35108684985`) concluíram com sucesso: lint, testes e builds de frontend/backend, Prisma e validação da documentação.
- 2026-09-16 — TiDB remoto `test`: backup prévio gerado, migration Prisma aplicada sem pendências e seed `compendio` concluído. A validação oficial confirmou 120 tabelas, 111 migrations registradas e o conteúdo esperado do compêndio.

## Bateria manual pendente

- [ ] Falhar duas vezes e confirmar DT 20 → 19 → 18 na mesma cena.
- [ ] Manifestar com sucesso normal e por margem de 10; confirmar +1/+2 dados de efeito no histórico e cartão.
- [ ] Tentar novamente após manifestar; confirmar bloqueio.
- [ ] Encerrar e interromper o Domínio Incompleto; conferir respectivamente 4 e 1 rodadas de Esgotamento da Técnica.
- [ ] Criar disputa com Domínio Incompleto e confirmar ausência de Acerto Garantido próprio.
- [ ] Criar disputa com dois Domínios e alvos definidos; confirmar que o Acerto Garantido não dispara até a disputa encerrar.
- [ ] Confirmar que custos, estrutura e grau escolhidos são persistidos, cobrados e exibidos no cartão.
