export const TRILHA_CORPO_AMALDICOADO_INDEPENDENTE = {
  descricao: `Voce nao e humano. Alguem (ou alguma coisa) com um conhecimento proibido te deu a capacidade de pensar, se mover e, finalmente, produzir energia amaldicoada. E recomendado que essa trilha seja definida desde o nivel 1, mesmo que normalmente a escolha de trilhas seja feita a partir do nivel 2.

Voce possui 3 nucleos internos que sustentam sua existencia e permitem alterar seu estilo de combate conforme a necessidade. Em combate, voce pode alternar entre diferentes nucleos, cada um representando uma configuracao distinta de energia amaldicoada dentro do seu corpo.

Via de regra para escolher essa trilha, o personagem precisa ser "Sem tecnica amaldicoada". Ou, converse com o mestre para que um dos nucleos tenha uma tecnica amaldicoada, mais do que isso as coisas podem ficar complicadas demais.

Voce nao pode ser restaurado com Energia Amaldicoada Positiva.`,
  habilidades: {
    blefeMortal: `Sua vida e dividida em 3, 1/3 para cada nucleo. Sempre que perder toda a vida de um dos nucleos e cair morrendo, pode sacrificar o nucleo atual (ou gastar 3 PE para sacrificar outro nucleo) da condicao e se levantar sozinho. Ficando sem um dos nucleos (ou seja, perdendo os bonus dele tambem), e podendo repetir o processo ate finalmente ficar sem nucleos disponiveis.

Caso te tirem da condicao morrendo da forma padrao, voce nao perde o nucleo, e ele volta com 1 de vida. Um nucleo perdido se recupera apenas com 1 dia de descanso ou apos o fim da missao.`,
    nucleos: `Seu corpo possui tres nucleos internos de energia amaldicoada. Como acao de movimento, pode alternar o nucleo ativo entre os seguintes:

**Nucleo do Equilibrio**
Recebe +2 na Defesa e +2 em testes de ataque.

**Nucleo do Poder**
Recebe +1 dado de dano em ataques corpo a corpo e +5 em testes de manobras de combate. Ignora 2 de RD com esse estilo. Esse nucleo e sustentado (1 EA por rodada).

**Nucleo do Impulso**
Recebe +3 m de deslocamento e +5 em Iniciativa.

So um nucleo pode estar ativo por vez.

Alem disso, recebe +2 PV por nivel, pois sua estrutura corporal e inumana.`,
    adaptatividade: `Seus varios nucleos reagem alem da sua percepcao de combate, permitindo decisoes importantes em momentos criticos. Uma vez por rodada, quando for sofrer dano, pode gastar 2 PE para ativar imediatamente um nucleo diferente como reacao, recebendo tambem um dos efeitos abaixo, dependendo do nucleo escolhido:

**Nucleo do Equilibrio**
Recebe RD 5 para esse ataque.

**Nucleo do Poder**
Pode realizar imediatamente uma manobra "Empurrar" ou "Derrubar" contra o atacante como acao livre se ele estiver no alcance.

**Nucleo do Impulso**
Recebe +2 na Defesa contra esse ataque e pode se deslocar ate metade do seu deslocamento.`,
    despertar: `Seus nucleos despertam, alcancando um novo nivel de poder e consciencia. Ao ativar um nucleo, pode escolher gastar 2 PE para receber um dos seguintes bonus:

**Nucleo do Equilibrio**
Ate o inicio do seu proximo turno, recebe +5 na Defesa e e considerado Grande ao sofrer ou realizar manobras.

**Nucleo do Poder**
Seu proximo ataque corpo a corpo causa +2 dados de dano.

**Nucleo do Impulso**
Pode se deslocar ate o dobro do seu deslocamento como acao livre, inclusive saltando para passar sobre objetos.

So um nucleo pode estar ativo por vez.`,
    estabilidade: `Seu corpo atinge estabilidade perfeita entre os nucleos, voce tem uma boa relacao com eles, todos se protegem.

Agora voce pode gastar 4 EA para manter dois nucleos ativos ao mesmo tempo, sustentando 1 PE por rodada. Se um dos nucleos ativos for o Nucleo do Poder, a sustentacao passa a ser 1 PE e 1 EA por rodada.

Enquanto estiver com dois nucleos ativos, recebe +2 na Defesa, +2 em testes de ataque, +2 no dano corpo a corpo e RD 2.

Alem disso, recebe 30 PV.`,
  },
};

export const TRILHA_RECEPTACULO = {
  descricao: `Talvez voce tenha participado de algum ritual, condenado no nascimento ou consumido algo que nao deveria, mas o que importa e que dentro de voce existe uma entidade poderosa, uma maldicao, deidade, feiticeiro ancestral ou algo desconhecido. As intencoes dela sao nebulosas, mas talvez voce tambem se beneficie disso, se a entidade cooperar com voce, ou ela pode decidir apenas domina-lo.

Alem disso, e importante definir quem exatamente era essa entidade, se ela tinha uma tecnica amaldicoada, e qual seria.

Para escolher essa trilha, o personagem precisa ser "Sem tecnica amaldicoada".

**Livrando-se da entidade**
Relatos contam que e possivel se livrar da entidade que habita seu corpo, voce pode tentar com experimentacao, ou ir atras dos meios necessarios. Mas, e claro dizer que nao sera uma tarefa simples.

Personagens que se "Livrarem da entidade" poderao escolher "recomecar" com outra trilha, e perder 1+1d4 niveis de personagem ao fazer isso.

**Afinidade**
Exclusivo para o caminho da Convergencia, o personagem comeca com zero, e sempre que interage diretamente com a entidade ou age de acordo com os interesses dela, existe a chance de ganhar uma carga de Afinidade, a criterio do mestre.

Um Favor representa um momento em que a entidade interfere diretamente na realidade para ajuda-lo. Gastar um Favor ativa o efeito descrito na habilidade correspondente.

Cada carga de afinidade concede direito a 1 "favor" da entidade.`,
  caminhos: {
    supressao:
      'Voce luta constantemente para manter a entidade sob controle, normalmente arrancando poder dela a forca.',
    convergencia:
      'Voce e a entidade, por algum motivo, coexistem em harmonia, ou pelo menos em neutralidade. Ela nao quer (ou nao pode) tentar sobrescrever sua alma.',
  },
  habilidades: {
    destino: `Recebe +1 grau de aprimoramento em Tecnica Amaldicoada, e sua presenca fica naturalmente um pouco mais perturbadora, recebe +5 em Intimidacao e -5 em Diplomacia.

Alem disso, deve aceitar seu destino entre o caminho da Supressao ou o caminho da Convergencia (converse com seu mestre da mesa).`,
    supressao8: `Uma vez por rodada, quando acerta um ataque ou conjura um feitico, pode gastar 2 PE para usurpar poder da entidade e conseguir um dos efeitos:

- Realizar um ataque adicional
- Aumentar o dano em +2 dados
- Ignorar 6 de RD

Apos usar essa habilidade, sofra 1d6 de dano na sanidade (sem reducao).

Caso se livre da entidade nesse ponto, a tecnica amaldicoada dela pode ficar gravada em voce. Role 1d20; se o valor for 19 ou 20, voce fica com a tecnica. (Leia Livrando-se da entidade.)`,
    supressao13: `**Manifestacao Parcial**
Pode permitir que a entidade se manifeste brevemente, ainda suprimindo ela. Uma vez por cena, por 6 PE pode entrar em Manifestacao Parcial por 3 rodadas.

Durante esse tempo, recebe:

- +2 dados de dano de energia amaldicoada.
- +3m de deslocamento.
- +5 na defesa.
- +2 de RD.
- Pode usar ate uma habilidade da tecnica amaldicoada da entidade.

**Manifestacao Completa**
Pode permitir que a entidade se manifeste totalmente, sendo incapaz de suprimir ela. Uma vez por cena, por 10 EA e 2 PE pode entrar em Manifestacao Completa por 3 rodadas.

Durante esse tempo, recebe:

- +4 dados de dano de energia amaldicoada.
- +6m de deslocamento.
- +8 na defesa.
- +5 de RD.
- Pode usar ate 3 das habilidades da Tecnica Amaldicoada Inata da Entidade.

Ao fim do efeito, role 1d6. Com resultado 3 ou menos, a entidade assume o controle total do seu corpo, que passa a ser controlado pelo mestre, ate cair Morrendo, ser nocauteado ou ate voce retomar o controle com um teste de Vontade DT 35 no inicio de cada rodada.

Quando retoma o controle, fica Fatigado e Alquebrado ate o fim da cena. Alem disso, perde 1d3 de Sanidade permanente. Vontade DT 25 + quantidade de rodadas usando a manifestacao + quantidade de rodadas que a entidade assumiu o controle ameniza para atual.

Alem disso, caso se livre da entidade nesse ponto, a tecnica amaldicoada dela pode ficar gravada em voce. Role 1d20; se o valor for 8 ou maior, voce fica com a tecnica. (Leia Livrando-se da entidade.)`,
    supressao20: `Quando usa Concessao desesperada, na manifestacao parcial nao fica mais fatigado, nem corre o risco de ser dominado pela entidade. Alem disso, a tecnica amaldicoada da entidade agora esta gravada na sua alma, permitindo usar sua propria versao dela, mesmo sem usar Concessao desesperada.

Quando usa a manifestacao completa, nao fica mais Fatigado e Alquebrado e reduz o risco de perder o controle para 1 no d6 apenas.

Caso se livre da entidade nesse ponto, a tecnica amaldicoada dela ainda fica gravada em voce de forma garantida. (Leia Livrando-se da entidade.)`,
    convergencia8: `Sempre que conjura um feitico ou usa uma tecnica, pode receber ajuda da entidade que te habita gastando 1 PE para receber um desses efeitos:

- +5 na DT da habilidade.
- +1 dado no efeito da tecnica (dano, cura, etc).
- +5 na defesa ate o proximo turno.

**Favor:** A Entidade concede mais poder, permitindo voce escolher 2 efeitos ao inves de 1.

Caso se livre da entidade nesse ponto, a tecnica amaldicoada dela pode ficar gravada em voce. Role 1d20; se o valor for 19 ou 20, voce fica com a tecnica. (Leia Livrando-se da entidade.)`,
    convergencia13: `**Manifestacao Parcial**
A entidade pede para te apoiar, e voce manifesta parcialmente as capacidades dela. Uma vez por cena, por 6 PE pode entrar em Manifestacao Parcial por 3 rodadas.

Durante esse tempo, voce recebe:

- +1 em Presenca e Vigor.
- +1 dado de dano de energia amaldicoada.
- +2 de RD.
- +2 na Defesa.
- +3m de deslocamento.
- +1 no limite de PE/EA.
- Pode usar uma das habilidades da Tecnica Amaldicoada Inata da Entidade.

**Favor:** A entidade concede 1d6 de EA temporario ate o fim da manifestacao.

Ao fim do efeito, fica Alquebrado por 1d3 rodadas.

**Manifestacao Completa**
Voce permite a entidade assumir o controle quase completamente, para lidar com uma situacao. Uma vez por cena, por 8 EA e 4 PE pode entrar em Manifestacao Completa por 3 rodadas.

Durante esse tempo, voce recebe:

- +1 em todos os Atributos.
- +2 dados de dano de energia amaldicoada.
- +4 de RD.
- +5 na Defesa.
- +6 m de deslocamento.
- +3 no limite de PE/EA.
- Pode usar ate 3 das habilidades da Tecnica Amaldicoada Inata da Entidade.

**Favor:** A entidade concede 2d6 de EA temporario ate o fim da manifestacao.

Ao fim do efeito, fica Alquebrado e Fatigado ate o fim da cena.

Alem disso, caso se livre da entidade nesse ponto, a tecnica amaldicoada dela pode ficar gravada em voce. Role 1d20; se o valor for 8 ou maior, voce fica com a tecnica. (Leia Livrando-se da entidade.)`,
    convergencia20: `Quando usa Concessao assistida, na manifestacao parcial nao fica mais Alquebrado. Alem disso, a tecnica amaldicoada da entidade agora esta gravada na sua alma, permitindo usar sua propria versao dela, mesmo sem usar Concessao assistida. Quando usa a manifestacao completa, nao fica mais Fatigado e Alquebrado.

Tambem recebe 5 de RD para dano Amaldicoado passivamente.

**Favor:** A entidade permite que as informacoes da alma dela sejam sobrescritas pelas suas. Te dando 30 PV e EA temporario ate o fim da cena; apos isso, voce se livrou da entidade. Voce tambem pode pedir para a entidade sobrescrever seu corpo, voce perde o personagem, mas a entidade atende seu ultimo desejo (ou tenta).

Caso se livre da entidade nesse ponto, a tecnica amaldicoada dela ainda fica gravada em voce de forma garantida. (Leia Livrando-se da entidade.)`,
  },
};

export const TRILHA_AMALDICOADO = {
  descricao: `Maldicoes surgem dos sentimentos humanos, e voce entende isso muito bem.

Um amor profundo, um odio impossivel de esquecer, culpa esmagadora ou uma promessa que nunca deveria ter sido feita podem ter te amaldicoado com uma presenca sombria.

Essa maldicao nao e um Shikigami, voce nao construiu ela, mas ela esta vinculada a voce, entao, por que nao usar isso?

**Maldicao Vinculada**
Ao escolher essa trilha, o personagem possui uma Maldicao Vinculada. Ele precisa carregar um item amaldicoado categoria 0 espaco 1 que representa esse vinculo.

Essa maldicao acompanha o personagem, reage a emocoes fortes, pode se manifestar para ajuda e ate perder o controle em momentos criticos. E uma trilha bem narrativa; o mestre e o jogador devem definir a aparencia do espirito amaldicoado, personalidade, emocao que a originou, etc.

A tecnica amaldicoada da maldicao e a mesma tecnica do personagem, representando que o vinculo entre ambos amplifica esse poder.

Alem disso, a maldicao esta associada a alma de alguem morto.

**Instabilidade**
Sempre que a maldicao se manifesta totalmente, quando o personagem recebe dano extremo, fica numa situacao de estresse emocional, etc, existe um risco de perda de controle. O jogador precisa usar a narrativa e um teste de instabilidade, usando pericias como Diplomacia, Enganacao ou Intimidacao (ou o que ele convencer), para tentar acalmar a maldicao. Caso nao consiga, a maldicao vai se tornar imprevisivel, agindo de forma perigosa; o mestre assume o controle dela nesse ponto.

Para cada elo do Enigma Amaldicoado quebrado, o personagem recebe +2 em testes de Instabilidade ao tentar controlar a maldicao.

**Enigma Amaldicoado**
Toda maldicao vinculada possui um Enigma Amaldicoado, que consiste na seguinte mecanica: o enigma possui de 3 a 5 elos que mantem a maldicao presa ao personagem, cada elo representando algo como uma memoria, promessa, emocao ou evento do passado.

O mestre deve definir esses elos em segredo, e conforme o personagem descobre e resolve esses aspectos, os elos sao quebrados.

Recomendamos que voce associe cada elo a uma recompensa, como:

- Reduzir a DT para convencer a maldicao.
- Aumentar a duracao da manifestacao.
- Melhorar o dano da maldicao.
- Comunicacao mais clara com a maldicao.

Ao fim de todos os elos, o personagem pode escolher libertar ela totalmente e talvez ate reconstrui-la como Shikigami a partir dos resquicios da energia amaldicoada, mas com a alma liberta. Nesse caso, nao e mais necessario fazer testes de instabilidade; o agora shikigami segue seus comandos naturalmente.`,
  habilidades: {
    presenca: `A maldicao que te acompanha reage instintivamente a situacoes intensas.

Sempre que voce sofrer dano significativo, sofrer dano mental, reduzir um inimigo a 0 PV ou entrar em uma situacao de perigo, o mestre pode pedir um teste de manifestacao da maldicao (1d6).

**Resultado**

- **1-3: manifestacao abstrata.** Uma voz pode ser ouvida, talvez um sussurro irritado, um rosnado ou um calafrio.
- **4-5: manifestacao leve.** Pode surgir apenas os bracos da maldicao de uma forma meio espectral por cima dos seus. Escolha um efeito, dependendo da situacao e da aprovacao do mestre: causar +1d6 amaldicoado, RD 5 para um ataque ou empurrar o inimigo 3 m.
- **6: manifestacao violenta.** Um fragmento da maldicao se manifesta de forma mais fisica, atras de voce talvez, a sua frente. Escolha um efeito: +2 dados de dano no ataque ou RD 10 contra o dano recebido.

O mestre pode negar o teste se a situacao nao envolver emocoes ou perigo real.`,
    ligacao: `Voce e a maldicao ja estao ligados o suficiente para a energia amaldicoada de voces se interconectar. Voce pode permitir que o espirito amaldicoado interfira na sua tecnica.

Pode utilizar a sua tecnica amaldicoada a partir da sua maldicao, ou com o apoio da presenca dela, podendo ganhar efeitos com a presenca dela em troca do risco dela se descontrolar. Sempre que utilizar essa ligacao inata, precisa fazer um teste de instabilidade.

Sugestao de efeitos:

- +1 dado no efeito da tecnica.
- +5 na DT da tecnica.
- Aumenta um passo do alcance do efeito da tecnica.
- Aplica alguma condicao benefica para o jogador.
- Remove uma restricao simples da tecnica.`,
    conexao: `Seu vinculo com a maldicao se fortaleceu o suficiente para permitir que ela se manifestasse fisicamente ao seu lado por curtos periodos.

Uma vez por cena, como acao padrao, voce pode gastar 4 PE e 2 EA para invocar a maldicao por 1 + 1d3 rodadas. A maldicao surge em um espaco livre adjacente a voce, e pode se mover em ate alcance curto.

Enquanto a maldicao estiver manifestada:

- Voce recebe todos os bonus de Ligacao Inata.
- Nao precisa realizar testes de Instabilidade ao usar Ligacao Inata.

**Acoes da Maldicao**
Durante o seu turno, uma vez por rodada, voce pode comandar a maldicao para realizar uma acao e/ou se movimentar por ate 9m.

Escolha uma das opcoes:

- **Ataque Amaldicoado:** A maldicao realiza uma agressao contra o alvo, causando 2d6 de dano amaldicoado.
- **Protecao Instintiva:** A maldicao protege voce ou um aliado em alcance curto, concedendo RD 10 contra um ataque.
- **Manobra Fantasmagorica:** A maldicao realiza uma manobra de combate contra o alvo, levando em consideracao o tamanho dela.
- **Amplificacao Amaldicoada:** A maldicao amplifica sua tecnica amaldicoada, concedendo +1 dado adicional no efeito da tecnica.

Quando a manifestacao termina, faca um teste de Instabilidade.

Falha significa que a maldicao continua manifestada fora de controle por 1+1d3 rodadas, sob controle do mestre, podendo atacar tudo e todos (inclusive aliados).`,
    vinculo: `Seu vinculo com o espirito amaldicoado atinge o apice. Agora voce pode permitir que ele se manifeste como uma entidade completa.

Alem disso, uma vez por cena pode, como acao padrao, gastar 6 EA e 1 PE para invocar a maldicao completamente por 3 rodadas.

**Espirito Amaldicoado Manifesto**
A maldicao passa a agir como um segundo personagem na iniciativa. Ela possui:

- sua propria iniciativa;
- deslocamento proprio;
- acesso a ficha completa da maldicao.

O mestre e o jogador devem construir essa ficha juntos. Mas considera-se que, via de regra, essa maldicao e de nivel especial.

Enquanto a maldicao estiver manifestada:

- voce recebe +2 dados no efeito de tecnicas amaldicoadas;
- recebe +3 na Defesa;
- recebe 2 de RD jujutsu;
- nao precisa realizar testes de instabilidade ate o fim dos 3 turnos;
- recebe +4 no limite de PE/EA.

Alem disso, a maldicao possui um reservatorio proprio de energia amaldicoada, que pode ser utilizado para realizar as tecnicas associadas a ela.

Quando a manifestacao termina, faca um teste de Instabilidade.

Falha significa que a maldicao permanece na cena por 1 rodada adicional, agindo conforme sua natureza e sendo controlada pelo mestre.`,
  },
};

export const TRILHAS_SOBREVIVENDO_TEXTOS = {
  corpoAmaldicoadoIndependente: TRILHA_CORPO_AMALDICOADO_INDEPENDENTE,
  receptaculo: TRILHA_RECEPTACULO,
  amaldicoado: TRILHA_AMALDICOADO,
} as const;
