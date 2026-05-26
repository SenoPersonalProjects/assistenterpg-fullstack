export const TRILHA_CORPO_AMALDICOADO_INDEPENDENTE = {
  descricao: `Você não é humano. Alguém (ou alguma coisa) com um conhecimento proibido te deu a capacidade de pensar, se mover e, finalmente, produzir energia amaldiçoada. É recomendado que essa trilha seja definida desde o nível 1, mesmo que normalmente a escolha de trilhas seja feita a partir do nível 2.

Você possui 3 núcleos internos que sustentam sua existência e permitem alterar seu estilo de combate conforme a necessidade. Em combate, você pode alternar entre diferentes núcleos, cada um representando uma configuração distinta de energia amaldiçoada dentro do seu corpo.

Via de regra para escolher essa trilha, o personagem precisa ser "Sem técnica amaldiçoada". Ou, converse com o mestre para que um dos núcleos tenha uma técnica amaldiçoada, mais do que isso as coisas podem ficar complicadas demais.

Você não pode ser restaurado com Energia Amaldiçoada Positiva.`,
  habilidades: {
    blefeMortal: `Sua vida é dividida em 3, 1/3 para cada núcleo. Sempre que perder toda a vida de um dos núcleos e cair morrendo, pode sacrificar o núcleo atual (ou gastar 3 PE para sacrificar outro núcleo) da condição e se levantar sozinho. Ficando sem um dos núcleos (ou seja, perdendo os bônus dele também), e podendo repetir o processo até finalmente ficar sem núcleos disponíveis.

Caso te tirem da condição morrendo da forma padrão, você não perde o núcleo, e ele volta com 1 de vida. Um núcleo perdido se recupera apenas com 1 dia de descanso ou após o fim da missão.`,
    nucleos: `Seu corpo possui três núcleos internos de energia amaldiçoada. Como ação de movimento, pode alternar o núcleo ativo entre os seguintes:

**Núcleo do Equilíbrio**
Recebe +2 na Defesa e +2 em testes de ataque.

**Núcleo do Poder**
Recebe +1 dado de dano em ataques corpo a corpo e +5 em testes de manobras de combate. Ignora 2 de RD com esse estilo. Esse núcleo é sustentado (1 EA por rodada).

**Núcleo do Impulso**
Recebe +3 m de deslocamento e +5 em Iniciativa.

Só um núcleo pode estar ativo por vez.

Além disso, recebe +2 PV por nível, pois sua estrutura corporal é inumana.`,
    adaptatividade: `Seus vários núcleos reagem além da sua percepção de combate, permitindo decisões importantes em momentos críticos. Uma vez por rodada, quando for sofrer dano, pode gastar 2 PE para ativar imediatamente um núcleo diferente como reação, recebendo também um dos efeitos abaixo, dependendo do núcleo escolhido:

**Núcleo do Equilíbrio**
Recebe RD 5 para esse ataque.

**Núcleo do Poder**
Pode realizar imediatamente uma manobra "Empurrar" ou "Derrubar" contra o atacante como ação livre se ele estiver no alcance.

**Núcleo do Impulso**
Recebe +2 na Defesa contra esse ataque e pode se deslocar até metade do seu deslocamento.`,
    despertar: `Seus núcleos despertam, alcançando um novo nível de poder e consciência. Ao ativar um núcleo, pode escolher gastar 2 PE para receber um dos seguintes bônus:

**Núcleo do Equilíbrio**
Até o início do seu próximo turno, recebe +5 na Defesa e é considerado Grande ao sofrer ou realizar manobras.

**Núcleo do Poder**
Seu próximo ataque corpo a corpo causa +2 dados de dano.

**Núcleo do Impulso**
Pode se deslocar até o dobro do seu deslocamento como ação livre, inclusive saltando para passar sobre objetos.

Só um núcleo pode estar ativo por vez.`,
    estabilidade: `Seu corpo atinge estabilidade perfeita entre os núcleos, você tem uma boa relação com eles, todos se protegem.

Agora você pode gastar 4 EA para manter dois núcleos ativos ao mesmo tempo, sustentando 1 PE por rodada. Se um dos núcleos ativos for o Núcleo do Poder, a sustentação passa a ser 1 PE e 1 EA por rodada.

Enquanto estiver com dois núcleos ativos, recebe +2 na Defesa, +2 em testes de ataque, +2 no dano corpo a corpo e RD 2.

Além disso, recebe 30 PV.`,
  },
};

export const TRILHA_RECEPTACULO = {
  descricao: `Talvez você tenha participado de algum ritual, condenado no nascimento ou consumido algo que não deveria, mas o que importa é que dentro de você existe uma entidade poderosa, uma maldição, deidade, feiticeiro ancestral ou algo desconhecido. As intenções dela são nebulosas, mas talvez você também se beneficie disso, se a entidade cooperar com você, ou ela pode decidir apenas dominá-lo.

Além disso, é importante definir quem exatamente era essa entidade, se ela tinha uma técnica amaldiçoada, e qual seria.

Para escolher essa trilha, o personagem precisa ser "Sem técnica amaldiçoada".

**Livrando-se da entidade**
Relatos contam que é possível se livrar da entidade que habita seu corpo, você pode tentar com experimentação, ou ir atrás dos meios necessários. Mas, é claro dizer que não será uma tarefa simples.

Personagens que se "Livrarem da entidade" poderão escolher "recomeçar" com outra trilha, e perder 1+1d4 níveis de personagem ao fazer isso.

**Afinidade**
Exclusivo para o caminho da Convergência, o personagem começa com zero, e sempre que interage diretamente com a entidade ou age de acordo com os interesses dela, existe a chance de ganhar uma carga de Afinidade, a critério do mestre.

Um Favor representa um momento em que a entidade interfere diretamente na realidade para ajudá-lo. Gastar um Favor ativa o efeito descrito na habilidade correspondente.

Cada carga de afinidade concede direito a 1 "favor" da entidade.`,
  caminhos: {
    supressao:
      'Você luta constantemente para manter a entidade sob controle, normalmente arrancando poder dela à força.',
    convergencia:
      'Você e a entidade, por algum motivo, coexistem em harmonia, ou pelo menos em neutralidade. Ela não quer (ou não pode) tentar sobrescrever sua alma.',
  },
  habilidades: {
    destino: `Recebe +1 grau de aprimoramento em Técnica Amaldiçoada, e sua presença fica naturalmente um pouco mais perturbadora, recebe +5 em Intimidação e -5 em Diplomacia.

Além disso, deve aceitar seu destino entre o caminho da Supressão ou o caminho da Convergência (converse com seu mestre da mesa).`,
    supressao8: `Uma vez por rodada, quando acerta um ataque ou conjura um feitiço, pode gastar 2 PE para usurpar poder da entidade e conseguir um dos efeitos:

- Realizar um ataque adicional
- Aumentar o dano em +2 dados
- Ignorar 6 de RD

Após usar essa habilidade, sofra 1d6 de dano na sanidade (sem redução).

Caso se livre da entidade nesse ponto, a técnica amaldiçoada dela pode ficar gravada em você. Role 1d20; se o valor for 19 ou 20, você fica com a técnica. (Leia Livrando-se da entidade.)`,
    supressao13: `**Manifestação Parcial**
Pode permitir que a entidade se manifeste brevemente, ainda suprimindo ela. Uma vez por cena, por 6 PE pode entrar em Manifestação Parcial por 3 rodadas.

Durante esse tempo, recebe:

- +2 dados de dano de energia amaldiçoada.
- +3m de deslocamento.
- +5 na defesa.
- +2 de RD.
- Pode usar até uma habilidade da técnica amaldiçoada da entidade.

**Manifestação Completa**
Pode permitir que a entidade se manifeste totalmente, sendo incapaz de suprimir ela. Uma vez por cena, por 10 EA e 2 PE pode entrar em Manifestação Completa por 3 rodadas.

Durante esse tempo, recebe:

- +4 dados de dano de energia amaldiçoada.
- +6m de deslocamento.
- +8 na defesa.
- +5 de RD.
- Pode usar até 3 das habilidades da Técnica Amaldiçoada Inata da Entidade.

Ao fim do efeito, role 1d6. Com resultado 3 ou menos, a entidade assume o controle total do seu corpo, que passa a ser controlado pelo mestre, até cair Morrendo, ser nocauteado ou até você retomar o controle com um teste de Vontade DT 35 no início de cada rodada.

Quando retoma o controle, fica Fatigado e Alquebrado até o fim da cena. Além disso, perde 1d3 de Sanidade permanente. Vontade DT 25 + quantidade de rodadas usando a manifestação + quantidade de rodadas que a entidade assumiu o controle ameniza para atual.

Além disso, caso se livre da entidade nesse ponto, a técnica amaldiçoada dela pode ficar gravada em você. Role 1d20; se o valor for 8 ou maior, você fica com a técnica. (Leia Livrando-se da entidade.)`,
    supressao20: `Quando usa Concessão desesperada, na manifestação parcial não fica mais fatigado, nem corre o risco de ser dominado pela entidade. Além disso, a técnica amaldiçoada da entidade agora está gravada na sua alma, permitindo usar sua própria versão dela, mesmo sem usar Concessão desesperada.

Quando usa a manifestação completa, não fica mais Fatigado e Alquebrado e reduz o risco de perder o controle para 1 no d6 apenas.

Caso se livre da entidade nesse ponto, a técnica amaldiçoada dela ainda fica gravada em você de forma garantida. (Leia Livrando-se da entidade.)`,
    convergencia8: `Sempre que conjura um feitiço ou usa uma técnica, pode receber ajuda da entidade que te habita gastando 1 PE para receber um desses efeitos:

- +5 na DT da habilidade.
- +1 dado no efeito da técnica (dano, cura, etc).
- +5 na defesa até o próximo turno.

**Favor:** A Entidade concede mais poder, permitindo você escolher 2 efeitos ao invés de 1.

Caso se livre da entidade nesse ponto, a técnica amaldiçoada dela pode ficar gravada em você. Role 1d20; se o valor for 19 ou 20, você fica com a técnica. (Leia Livrando-se da entidade.)`,
    convergencia13: `**Manifestação Parcial**
A entidade pede para te apoiar, e você manifesta parcialmente as capacidades dela. Uma vez por cena, por 6 PE pode entrar em Manifestação Parcial por 3 rodadas.

Durante esse tempo, você recebe:

- +1 em Presença e Vigor.
- +1 dado de dano de energia amaldiçoada.
- +2 de RD.
- +2 na Defesa.
- +3m de deslocamento.
- +1 no limite de PE/EA.
- Pode usar uma das habilidades da Técnica Amaldiçoada Inata da Entidade.

**Favor:** A entidade concede 1d6 de EA temporário até o fim da manifestação.

Ao fim do efeito, fica Alquebrado por 1d3 rodadas.

**Manifestação Completa**
Você permite a entidade assumir o controle quase completamente, para lidar com uma situação. Uma vez por cena, por 8 EA e 4 PE pode entrar em Manifestação Completa por 3 rodadas.

Durante esse tempo, você recebe:

- +1 em todos os Atributos.
- +2 dados de dano de energia amaldiçoada.
- +4 de RD.
- +5 na Defesa.
- +6 m de deslocamento.
- +3 no limite de PE/EA.
- Pode usar até 3 das habilidades da Técnica Amaldiçoada Inata da Entidade.

**Favor:** A entidade concede 2d6 de EA temporário até o fim da manifestação.

Ao fim do efeito, fica Alquebrado e Fatigado até o fim da cena.

Além disso, caso se livre da entidade nesse ponto, a técnica amaldiçoada dela pode ficar gravada em você. Role 1d20; se o valor for 8 ou maior, você fica com a técnica. (Leia Livrando-se da entidade.)`,
    convergencia20: `Quando usa Concessão assistida, na manifestação parcial não fica mais Alquebrado. Além disso, a técnica amaldiçoada da entidade agora está gravada na sua alma, permitindo usar sua própria versão dela, mesmo sem usar Concessão assistida. Quando usa a manifestação completa, não fica mais Fatigado e Alquebrado.

Também recebe 5 de RD para dano Amaldiçoado passivamente.

**Favor:** A entidade permite que as informações da alma dela sejam sobrescritas pelas suas. Te dando 30 PV e EA temporário até o fim da cena; após isso, você se livrou da entidade. Você também pode pedir para a entidade sobrescrever seu corpo, você perde o personagem, mas a entidade atende seu último desejo (ou tenta).

Caso se livre da entidade nesse ponto, a técnica amaldiçoada dela ainda fica gravada em você de forma garantida. (Leia Livrando-se da entidade.)`,
  },
};

export const TRILHA_AMALDICOADO = {
  descricao: `Maldições surgem dos sentimentos humanos, e você entende isso muito bem.

Um amor profundo, um ódio impossível de esquecer, culpa esmagadora ou uma promessa que nunca deveria ter sido feita podem ter te amaldiçoado com uma presença sombria.

Essa maldição não é um Shikigami, você não construiu ela, mas ela está vinculada a você, então, por que não usar isso?

**Maldição Vinculada**
Ao escolher essa trilha, o personagem possui uma Maldição Vinculada. Ele precisa carregar um item amaldiçoado categoria 0, espaço 1 que representa esse vínculo.

Essa maldição acompanha o personagem, reage a emoções fortes, pode se manifestar para ajuda e até perder o controle em momentos críticos. É uma trilha bem narrativa; o mestre e o jogador devem definir a aparência do espírito amaldiçoado, personalidade, emoção que a originou, etc.

A técnica amaldiçoada da maldição é a mesma técnica do personagem, representando que o vínculo entre ambos amplifica esse poder.

Além disso, a maldição está associada à alma de alguém morto.

**Instabilidade**
Sempre que a maldição se manifesta totalmente, quando o personagem recebe dano extremo, fica numa situação de estresse emocional, etc, existe um risco de perda de controle. O jogador precisa usar a narrativa e um teste de instabilidade, usando perícias como Diplomacia, Enganação ou Intimidação (ou o que ele convencer), para tentar acalmar a maldição. Caso não consiga, a maldição vai se tornar imprevisível, agindo de forma perigosa; o mestre assume o controle dela nesse ponto.

Para cada elo do Enigma Amaldiçoado quebrado, o personagem recebe +2 em testes de Instabilidade ao tentar controlar a maldição.

**Enigma Amaldiçoado**
Toda maldição vinculada possui um Enigma Amaldiçoado, que consiste na seguinte mecânica: o enigma possui de 3 a 5 elos que mantêm a maldição presa ao personagem, cada elo representando algo como uma memória, promessa, emoção ou evento do passado.

O mestre deve definir esses elos em segredo, e conforme o personagem descobre e resolve esses aspectos, os elos são quebrados.

Recomendamos que você associe cada elo a uma recompensa, como:

- Reduzir a DT para convencer a maldição.
- Aumentar a duração da manifestação.
- Melhorar o dano da maldição.
- Comunicação mais clara com a maldição.

Ao fim de todos os elos, o personagem pode escolher libertar ela totalmente e talvez até reconstruí-la como Shikigami a partir dos resquícios da energia amaldiçoada, mas com a alma liberta. Nesse caso, não é mais necessário fazer testes de instabilidade; o agora shikigami segue seus comandos naturalmente.`,
  habilidades: {
    presenca: `A maldição que te acompanha reage instintivamente a situações intensas.

Sempre que você sofrer dano significativo, sofrer dano mental, reduzir um inimigo a 0 PV ou entrar em uma situação de perigo, o mestre pode pedir um teste de manifestação da maldição (1d6).

**Resultado**

- **1-3: manifestação abstrata.** Uma voz pode ser ouvida, talvez um sussurro irritado, um rosnado ou um calafrio.
- **4-5: manifestação leve.** Pode surgir apenas os braços da maldição de uma forma meio espectral por cima dos seus. Escolha um efeito, dependendo da situação e da aprovação do mestre: causar +1d6 amaldiçoado, RD 5 para um ataque ou empurrar o inimigo 3 m.
- **6: manifestação violenta.** Um fragmento da maldição se manifesta de forma mais física, atrás de você talvez, à sua frente. Escolha um efeito: +2 dados de dano no ataque ou RD 10 contra o dano recebido.

O mestre pode negar o teste se a situação não envolver emoções ou perigo real.`,
    ligacao: `Você e a maldição já estão ligados o suficiente para a energia amaldiçoada de vocês se interconectar. Você pode permitir que o espírito amaldiçoado interfira na sua técnica.

Pode utilizar a sua técnica amaldiçoada a partir da sua maldição, ou com o apoio da presença dela, podendo ganhar efeitos com a presença dela em troca do risco dela se descontrolar. Sempre que utilizar essa ligação inata, precisa fazer um teste de instabilidade.

Sugestão de efeitos:

- +1 dado no efeito da técnica.
- +5 na DT da técnica.
- Aumenta um passo do alcance do efeito da técnica.
- Aplica alguma condição benéfica para o jogador.
- Remove uma restrição simples da técnica.`,
    conexao: `Seu vínculo com a maldição se fortaleceu o suficiente para permitir que ela se manifestasse fisicamente ao seu lado por curtos períodos.

Uma vez por cena, como ação padrão, você pode gastar 4 PE e 2 EA para invocar a maldição por 1 + 1d3 rodadas. A maldição surge em um espaço livre adjacente a você, e pode se mover em até alcance curto.

Enquanto a maldição estiver manifestada:

- Você recebe todos os bônus de Ligação Inata.
- Não precisa realizar testes de Instabilidade ao usar Ligação Inata.

**Ações da Maldição**
Durante o seu turno, uma vez por rodada, você pode comandar a maldição para realizar uma ação e/ou se movimentar por até 9m.

Escolha uma das opções:

- **Ataque Amaldiçoado:** A maldição realiza uma agressão contra o alvo, causando 2d6 de dano amaldiçoado.
- **Proteção Instintiva:** A maldição protege você ou um aliado em alcance curto, concedendo RD 10 contra um ataque.
- **Manobra Fantasmagórica:** A maldição realiza uma manobra de combate contra o alvo, levando em consideração o tamanho dela.
- **Amplificação Amaldiçoada:** A maldição amplifica sua técnica amaldiçoada, concedendo +1 dado adicional no efeito da técnica.

Quando a manifestação termina, faça um teste de Instabilidade.

Falha significa que a maldição continua manifestada fora de controle por 1+1d3 rodadas, sob controle do mestre, podendo atacar tudo e todos (inclusive aliados).`,
    vinculo: `Seu vínculo com o espírito amaldiçoado atinge o ápice. Agora você pode permitir que ele se manifeste como uma entidade completa.

Além disso, uma vez por cena pode, como ação padrão, gastar 6 EA e 1 PE para invocar a maldição completamente por 3 rodadas.

**Espírito Amaldiçoado Manifesto**
A maldição passa a agir como um segundo personagem na iniciativa. Ela possui:

- sua própria iniciativa;
- deslocamento próprio;
- acesso à ficha completa da maldição.

O mestre e o jogador devem construir essa ficha juntos. Mas considera-se que, via de regra, essa maldição é de nível especial.

Enquanto a maldição estiver manifestada:

- você recebe +2 dados no efeito de técnicas amaldiçoadas;
- recebe +3 na Defesa;
- recebe 2 de RD jujutsu;
- não precisa realizar testes de instabilidade até o fim dos 3 turnos;
- recebe +4 no limite de PE/EA.

Além disso, a maldição possui um reservatório próprio de energia amaldiçoada, que pode ser utilizado para realizar as técnicas associadas à ela.

Quando a manifestação termina, faça um teste de Instabilidade.

Falha significa que a maldição permanece na cena por 1 rodada adicional, agindo conforme sua natureza e sendo controlada pelo mestre.`,
  },
};

export const TRILHAS_SOBREVIVENDO_TEXTOS = {
  corpoAmaldicoadoIndependente: TRILHA_CORPO_AMALDICOADO_INDEPENDENTE,
  receptaculo: TRILHA_RECEPTACULO,
  amaldicoado: TRILHA_AMALDICOADO,
} as const;
