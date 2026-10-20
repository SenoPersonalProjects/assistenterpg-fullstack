# Importação Haeinsa

## Destino e conteúdo

Importador: `assistenterpg-back/scripts/importar-haeinsa.ts` (`npm run import:haeinsa`). Sem `--apply`, apenas consulta e valida.

- Conta de destino: único administrador; prévia remota conferida na conta `seno`.
- Personagem-base: Takaramono Zenin, nível 18, Shikigami efetivo 4; componentes do bônus ficam para auditoria.
- NPCs: Daigo Shiranui, Mika Kurobane, Seo Min-jun e Tobari Sōma. PE 0 para os três primeiros; Tobari 55.
- Nenhuma campanha ou sessão é escolhida pelo importador. O mestre associa as fichas e delega os controladores pela interface existente.
- Catálogo global: Dez Sombras, seus 18 templates, Jardim das Sombras, Emoção da Flor Caída e Dadao Negro. Kit de Medicina mantém seu espaço global; só a instância de Takaramono ocupa zero.

Os seis documentos originais e seus SHA-256 ficam em `assistenterpg-back/prisma/seeds/haeinsa/fontes/`. As decisões posteriores do mestre estão em `revisao.ts`, no catálogo tipado e em `texto-revisado.ts`. O texto publicado das Dez Sombras recebe essas correções; a fonte arquivada permanece intacta.

## Operação da sessão

1. Adicione Takaramono à campanha e à cena. Adicione os NPCs pelo catálogo.
   Ao trocar de cena, apenas personagens e NPCs presentes na cena anterior acompanham a transição. Removidos e participantes de cenas antigas permanecem fora até inclusão manual; uma cena vazia continua vazia.
2. Em controle do elenco, delegue Takaramono e os três NPCs aos respectivos jogadores. Mantenha Tobari com o mestre.
3. O controlador edita atributos, perícias e habilidades na campanha. O modelo original permanece com o administrador. Revogar a delegação revoga o acesso.
   Ocultar um NPC dos jogadores preserva a ficha para o mestre e seu controlador autorizado; os demais jogadores não o veem. As ações dos NPCs permanecem na própria ficha, sem painéis extras de escolha de alvos. A resolução fica com a mesa. Passivas contêm apenas traços permanentes, sem cópia integral dos documentos.
   Na aba **Ações**, **Usar habilidade** paga o custo de PE/EA e registra a sustentação; os botões de rolagem são independentes. **Encerrar sustentação** interrompe as cobranças futuras. O custo de abertura é imediato e a sustentação é cobrada nas rodadas seguintes com turnos ativos, uma vez por rodada. Em modo livre/BASE não há cobrança por passagem de tempo nem bloqueio por orçamento de Padrão/Movimento/Reação. A economia geral de ações fica com a mesa, inclusive no combate. Frequências explícitas por rodada continuam valendo com turnos ativos.
   O controlador autorizado também pode consultar no histórico suas rolagens de NPC oculto. Revogar o controle volta a ocultar esses resultados.
4. Na ficha de Takaramono, abra a aba **Vinculados**, a mesma usada pelos demais invocadores. O seletor e os controles **Invocar/Liberar**, estado e PV são compartilhados com os shikigamis comuns. As opções de Comandar, movimento, habilidades, Carga, fusões e herança são a extensão das Dez Sombras dentro dessa aba. A Carga é independente de descontos de EA; as sombras acompanham o turno do usuário.
   A aba fica disponível para mestre e controlador mesmo quando a técnica tem uma cópia editável na campanha. A API informa `possuiDezSombras` pela configuração mecânica e pela técnica de origem, sem depender do código gerado para a cópia. Invocar cria o shikigami na cena sob controle do dono; invocação, custos próprios e sustentação são descontados dos recursos desse personagem.
   Os limites específicos da técnica, como um Comandar e a Reação compartilhada, continuam ativos em combate. Em modo livre/BASE, os marcadores de ação não bloqueiam usos posteriores; PV, destruição, custos e condições são preservados.
5. Escolha o Aspecto Vinculado na aba Vinculados antes de abrir o Jardim pelo controle normal de habilidades. O mestre confirma a formação no painel de Domínios. Aplique o Acerto Garantido a um alvo por rodada.
6. Para Seo, **Usar habilidade** no Domínio Simples registra os 2 EA de abertura e 1 EA/rodada de sustentação. A mesa resolve a proteção de todos os ocupantes a até 3m, inclusive inimigos, e a Integridade 4. O registro de uso não exige seleção de alvos nem cria efeitos automaticamente.

Ao desfazer uma troca de cena, a cena restaurada volta a ser a atual para fichas, ações, condições e novas transições. O histórico permanece preservado.

Ataques, danos e resistências usam as rolagens da sessão. O mestre decide alcance, posição, observação, espaço e efeitos narrativos. A aplicação de dano aos PV usa o controle normal da sessão, após resolver as defesas. O veneno gera a rolagem de 2d8 no início do turno e solicita Fortitude DT30 no fim; registre o sucesso para encerrá-lo. Condições de Nue são aplicadas após confirmar a falha na resistência e expiram no fim do próximo turno do alvo.

Liberar e reinvocar conserva PV e condições. Dormir recupera sombras não destruídas e libera a preparação diária dos Aspectos. O sacrifício manual de Madoka o indisponibiliza até Dormir; não o destrói. Takaramono não recebe o disparo automático por voto.

A Emoção da Flor Caída tem abertura normal e variação de Reação Especial. Com ela sustentada, o painel registra o gasto de 1–3 EA por ocorrência de dano direto de Acerto Garantido e informa a RD correspondente. Registrar deslocamento voluntário consome Movimento e a encerra.

## Publicação no online

Use o procedimento de [operação vigente](OPERACAO-E-AMBIENTE.md) e o [guia TiDB](GUIA-SCRIPTS-TIDB.md), com as credenciais do `PRIVATE-OPS.md` não versionado. Não altere o `.env` local para apontar ao remoto.

Ordem: backup remoto verificável → migration aditiva `20261018120000_haeinsa_dez_sombras` → publicação do backend e frontend compatíveis → seed `haeinsa` → verificação das cinco fichas na conta de destino.

Prévia remota sem escrita:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File documentacao-unica/update-tidb.ps1 -OpsFile documentacao-unica/PRIVATE-OPS.md -RemoteDatabase test -BackDir assistenterpg-back -Seeds haeinsa -HaeinsaPreview
```

O script aborta em fonte alterada, catálogo obrigatório ausente, administrador ambíguo ou ficha homônima de outra origem. A aplicação usa uma transação. Reexecutar atualiza os registros desta importação sem duplicá-los; não a reexecute para substituir alterações posteriores do jogador no modelo-base sem revisar o diff.

## Validação

O script `scripts/testar-haeinsa-integracao.ts` só aceita MySQL local e cria um banco isolado próprio. Exercita a importação duas vezes, delegação/revogação, conservação de PV, carga/rollback, Coelho, destruição, condições, veneno, Domínio Simples, edição de NPC, Dadao, Jardim, Flor Caída e penalidade de Defesa de Daigo.
Também cobre usos consecutivos em modo livre/combate, idempotência e recursos insuficientes, sustentação/encerramento, histórico de rolagens ocultas por controlador, transição/desfazer de cena e limites específicos das Dez Sombras.

```powershell
cd assistenterpg-back
node -r ts-node/register -r tsconfig-paths/register scripts/testar-haeinsa-integracao.ts
npm run lint:check
npm test -- --runInBand
npm run build
```

Na interface local, o jogador delegado já foi verificado invocando, comandando, usando habilidade e liberando Gama, além de salvar uma habilidade de Seo na campanha. O editor de campanha também foi verificado no painel do jogador: criação/remoção de habilidade personalizada e aplicação/desfazer de ajuste de atributo, preservando o modelo-base.
