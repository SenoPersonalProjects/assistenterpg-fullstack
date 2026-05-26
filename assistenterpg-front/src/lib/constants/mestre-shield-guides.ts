export type MestreShieldGuideSection = {
  id: string;
  titulo: string;
  resumoMarkdown: string;
  detalhadoMarkdown?: string;
};

export const MESTRE_SHIELD_GUIDES: MestreShieldGuideSection[] = [
  {
    id: 'pericias',
    titulo: 'Lista completa de perícias',
    resumoMarkdown: `| Perícia       | Atributo base | Somente treinada? | Penalidade por carga? | Precisa de kit? |
| ------------- | ------------- | ----------------- | --------------------- | --------------- |
| Acrobacia     | Agilidade     | Não               | Sim                   | Não             |
| Adestramento  | Presenca      | Sim               | Não                   | Não             |
| Artes         | Presenca      | Sim               | Não                   | Não             |
| Atletismo     | Forca         | Não               | Não                   | Não             |
| Atualidades   | Intelecto     | Não               | Não                   | Não             |
| Ciências      | Intelecto     | Sim               | Não                   | Não             |
| Crime         | Agilidade     | Sim               | Sim                   | Sim             |
| Diplomacia    | Presenca      | Não               | Não                   | Não             |
| Enganação     | Presenca      | Não               | Não                   | Sim             |
| Fortitude     | Vigor         | Não               | Não                   | Não             |
| Furtividade   | Agilidade     | Não               | Sim                   | Não             |
| Iniciativa    | Agilidade     | Não               | Não                   | Não             |
| Intimidação   | Presenca      | Não               | Não                   | Não             |
| Intuicao      | Presenca      | Não               | Não                   | Não             |
| Investigação  | Intelecto     | Não               | Não                   | Não             |
| Luta          | Forca         | Não               | Não                   | Não             |
| Medicina      | Intelecto     | Não               | Não                   | Sim             |
| Jujutsu       | Intelecto     | Sim               | Não                   | Não             |
| Percepção     | Presença      | Não               | Não                   | Não             |
| Pontaria      | Agilidade     | Não               | Não                   | Não             |
| Profissao     | Intelecto     | Sim               | Não                   | Não             |
| Reflexos      | Agilidade     | Não               | Não                   | Não             |
| Religiao      | Presenca      | Sim               | Não                   | Não             |
| Tatica        | Intelecto     | Sim               | Não                   | Não             |
| Tecnologia    | Intelecto     | Sim               | Não                   | Sim             |
| Sobrevivência | Intelecto     | Não               | Não                   | Não             |
| Vontade       | Presenca      | Não               | Não                   | Não             |
| Pilotagem     | Agilidade     | Não               | Não                   | Não             |`,
  },
  {
    id: 'condicoes',
    titulo: 'Lista completa de condicoes',
    resumoMarkdown: `- **Abalado**: -1d20 em testes; em novo abalado vira Apavorado (medo).
- **Agarrado**: desprevenido é imovel, -1d20 em ataques, so arma leve; tiros na dupla podem errar alvo (50%).
- **Alquebrado**: custo em PE das habilidades/rituais +1. Condição mental.
- **Apavorado**: -2d20 em pericias é deve fugir da fonte do medo.
- **Asfixiado**: sem respirar; após fôlego, testa Fortitude por rodada ou cai inconsciente é perde 1d6 PV por rodada.
- **Atordoado**: desprevenido é sem ações. Condição mental.
- **Caído**: no chão; -2d20 em ataques corpo a corpo, deslocamento 1,5m; Defesa -5 contra corpo a corpo e +5 contra distância.
- **Cego**: desprevenido é lento, -2d20 em pericias de Forca/Agilidade, alvos com camuflagem total.
- **Confuso**: comportamento aleatorio por d6 no início do turno.
- **Debilitado**: -2d20 em Agilidade, Forca é Vigor; se repetir, fica Inconsciente.
- **Desprevenido**: Defesa -5 é -1d20 em Reflexos.
- **Doente**: sob efeito da doença específica.
- **Em Chámas**: 1d6 fogo no início do turno até apagar.
- **Enjoado**: so ação padrão ou movimento por rodada.
- **Enlouquecendo**: 3 turnos na mesma cena gera insanidade permanente; pode encerrar com Diplomacia ou cura SAN.
- **Enredado**: lento, vulneravel é -1d20 em ataques.
- **Envenenado**: efeito varia por veneno.
- **Esmorecido**: -2d20 em Intelecto é Presenca.
- **Exausto**: Debilitado, Lento é Vulneravel; se repetir, Inconsciente.
- **Fascinado**: foco total; -2d20 em Percepção e não age além de observar.
- **Fatigado**: Fraco é Vulneravel; se repetir, Exausto.
- **Fraco**: -1d20 em Agilidade, Forca é Vigor; se repetir, Debilitado.
- **Frustrado**: -1d20 em Intelecto é Presenca; se repetir, Esmorecido.
- **Imovel**: deslocamento 0m.
- **Inconsciente**: indefeso, sem ações/reações.
- **Indefeso**: desprevenido, Defesa -10, falha em Reflexos e pode sofrer golpe de misericórdia.
- **Lento**: deslocamentos pela metade, sem correr/investida.
- **Machucado**: metade ou menos dos PV.
- **Morrendo**: com 0 PV; 3 turnos Morrendo na cena = morte.
- **Ofuscado**: -1d20 em ataques e Percepção.
- **Paralisado**: imovel é indefeso; so ações mentais.
- **Pasmo**: sem ações.
- **Perturbado**: primeira vez na cena gera 1 efeito de insanidade (temporaria).
- **Petrificado**: Inconsciente é RD 10.
- **Sangrando**: testa Vigor DT 20 por turno; se falhár perde 1d6 PV.
- **Silenciado**: sem habilidades que exijam fala/encantamento.
- **Surdo**: sem Percepção auditiva, -2d20 Iniciativa.
- **Surpreendido**: desprevenido é sem agir.
- **Vulneravel**: -2 na Defesa.`,
  },
  {
    id: 'conflito-dominios',
    titulo: 'Regra de conflito de domínios',
    resumoMarkdown: `## Colisao de domínios (cabo de guerra)

Quando alguém expande um Domínio contra outro, o alvo pode reagir expandindo o próprio Domínio como reação.

Penalidade no primeiro teste de Jujutsu da reação:
- **-5** no valor total do teste.
- **-1d20** na quantidade de dados.

Disputa por rodada (1 teste de Jujutsu de cada lado):
- Diferenca 0: sem ponto.
- Vitoria por até 5: **+1 ponto**.
- Vitoria por até 10: **+2 pontos**.
- Vitoria por 11+: **+3 pontos**.

Vence quem abrir **3 pontos de vantagem**.

Enquanto não houver vencedor:
- Barreiras ativas.
- Acerto garantido dos dois lados fica anulado na zona de disputa.

## Expandir um Domínio dentro de outro

Opcao 1: **abrir buraco de fuga**
- Rola 2 testes de Jujutsu contra o oponente.
- Se não perder por 10+ em nenhum, abre fenda na borda.
- Passa 1 criatura por rodada.
- Acerto garantido inimigo fica anulado enquanto houver fenda.

Opcao 2: **iniciar novo cabo de guerra**
- Usa as mesmas regras de colisao.
- Primeiro teste de quem reagiu de dentro entra com **-1d20**.`,
  },
  {
    id: 'primeira-expansao',
    titulo: 'Regra de primeira expansão de domínios',
    resumoMarkdown: `## Primeira expansão (preparada)

Antes da sessão, mestre e jogador definem:
- Forma, estetica é paisagem mental.
- Tipo principal: letal, aperfeicoador, restritivo ou combinado.
- Custos base em EA/PE para abrir é sustentar.

O mestre pode pedir testes de refinamento:
- Ciências, Vontade, Tática, Intuição e Jujutsu.

Se houver ritual/plano/ajuda, use **teste unido** para representar esforco conjunto.

## Epifania em combate

Dominio cru sem ritual previo:
- Teste de Epifania com **DT inicial 20**.
- A cada falha, DT reduz em 1 até sucesso ou fim da cena.

Limitações:
- **-2d20** no teste de Jujutsu da expansão.
- Custo extra de EA/PE (definido pelo mestre).
- Efeitos mais simples que um Dominio refinado.`,
  },
  {
    id: 'dificuldades',
    titulo: 'Tabela de guia de dificuldades',
    resumoMarkdown: `| Tarefa | DT | Exemplo |
| --- | --- | --- |
| Fácil | 5 | Escutar conversa atrás da porta (Percepção) |
| Media | 10 | Subir um barranco (Atletismo) |
| Dificil | 15 | Montar acampamento no campo (Sobrevivência) |
| Muito difícil | 20 | Estancar sangramento fatal (Medicina) |
| Formidavel | 25 | Hackear servidor (Tecnologia) |
| Heroica | 30 | Decifrar maldição antiga (Jujutsu) |
| Quase impossível | 35 | Convencer inimigo a te proteger (Diplomacia) |
| Apenas o honrado | 40 | Evitar habilidade de maldição de divindade (Vontade) |

> Recomendação: não pedir rolagem para tarefas triviais.`,
  },
  {
    id: 'teste-unido',
    titulo: 'Regra de testes com várias perícias',
    resumoMarkdown: `Quando uma única ação depende de várias perícias ao mesmo tempo, use **teste unido**.

Passos:
1. Para cada perícia, anote quantos d20 ela rolaria.
2. Some os dados, divida pelo número de perícias e arredonde para baixo.
3. Some os bônus das perícias, divida pelo número de perícias e arredonde para baixo.
4. Rola-se **um único teste** com esse pool médio e bônus médio.

Use para casos como técnica que mistura Jujutsu + Pontaria.

> Isso é diferente de testes estendidos (várias rolagens ao longo do tempo).`,
  },
  {
    id: 'tipos-dano',
    titulo: 'Tipos de dano',
    resumoMarkdown: `- Balistico
- Corte
- Eletricidade
- Fogo
- Frio
- Impacto
- Mental
- Amaldiçoado / Jujutsu
- Perfuração
- Quimico

O tipo de dano é usado para resistências, vulnerabilidades é efeitos específicos.`,
  },
  {
    id: 'tipos-acoes',
    titulo: 'Tipos de ações',
    resumoMarkdown: `## Ações padrão
- **Agredir** (corpo a corpo ou distância; tiro em alvo engajado pode impor -1d20).
- **Manobra de combate** (agarrar, quebrar, atropelar).
- **Conjurar encantamento**.
- **Fintar** (Enganação vs Reflexos).
- **Preparar** ação com gatilho.
- **Usar habilidade/item** com custo de padrão.

## Ações de movimento
- Levantar-se.
- Manipular item.
- Mirar.
- Movimentar-se.
- Sacar/guardar item.

## Ações completas
- Corrida.
- Golpe de misericórdia.
- Investida.
- Conjuração longa.

## Ações livres
- Atrasar.
- Falar (regra sugerida: até 20 palavras por rodada).
- Jogar-se no chão.
- Largar item.

> Reações especiais (bloqueio/esquiva) seguem exceções da mesa/sistema.`,
  },
  {
    id: 'ferimentos-morte',
    titulo: 'Ferimentos é morte',
    resumoMarkdown: `## PV, 0 PV é Morrendo
- Com PV > 0: age normalmente.
- Metade ou menos dos PV: **Machucado**.
- Em 0 PV: **Inconsciente + Morrendo**.
- Se iniciar 3 turnos Morrendo na mesma cena: morte.

Como encerrar Morrendo:
- Medicina DT 20 (+5 por estabilização anterior na cena).
- Efeitos que estabilizam/curam.

## Dano massivo
Quando um único ataque causa metade ou mais dos PV totais, ocorre teste de Fortitude conforme a regra de dano massivo.

## Dano não letal
- Soma com letal para cair inconsciente, mas não para entrar em Morrendo.
- Curas removem primeiro dano não letal.
- Ataques corpo a corpo podem virar não letal com penalidade de ataque.`,
  },
  {
    id: 'insanidade-loucura',
    titulo: 'Insanidade é loucura',
    resumoMarkdown: `- Dano mental reduz **SAN**.
- Com menos da metade da SAN total: **Perturbado**.
- Primeira vez por cena em Perturbado: 1 efeito temporario de insanidade.
- Em 0 SAN: **Enlouquecendo**.
- Se iniciar 3 turnos Enlouquecendo na mesma cena: ganhá insanidade permanente.

Encerrar Enlouquecendo:
- Diplomacia (Acalmar) DT 20 (+5 por acalmada previa na cena).
- Curar ao menos 1 ponto de SAN.

Pode háver perdas permanentes de SAN por efeitos específicos.`,
  },
  {
    id: 'situações-especiais',
    titulo: 'Situações especiais',
    resumoMarkdown: `## Camuflagem
- **Leve**: 20% de falha (1-2 em d10).
- **Total**: 50% de falha (1-5 em d10).

## Cobertura
- **Leve**: +5 Defesa.
- **Total**: alvo não pode ser atacado.

## Modificadores rápidos
- Ofuscado: -1d20 no ataque.
- Alvo caído: Defesa -5 corpo a corpo / +5 distância.
- Alvo cego: Defesa -5.
- Alvo desprevenido: Defesa -5.
- Camuflagem leve/total é cobertura leve/total conforme acima.`,
  },
  {
    id: 'multidoes',
    titulo: 'Mecânica de multidões',
    resumoMarkdown: `## Conceito de horda
Horda é tratada como um único inimigo, com:
- PV totais.
- PV por indivíduo.
- Individuos atuais (PV total / PV individual).
- Defesa, RD, tamanho é ações.

## Dano em hordas
### Regra padrão
- Alvo único: dano em um indivíduo, overkill perdido.
- Área: dano total na horda; mortos = dano / PV por indivíduo.

### Regra alternativa
- Alvo único: dano entra no PV total, overkill mantido.
- Área: afeta cada indivíduo dentro da área.

## Comportamento
- Tamanho define área ocupada.
- Defesa/RD podem cair conforme baixa de indivíduos.
- Horda pode usar ataque único representando vários golpes.`,
  },
  {
    id: 'interludio',
    titulo: 'Mecânica de interlúdio',
    resumoMarkdown: `Cenas de interlúdio são intervalos entre ação/investigação para descanso, planejamento é recuperação.

Regras base:
- Mestre define início/fim.
- Sem local minimamente seguro, não há interlúdio.
- Cada personagem pode fazer **até 2 ações** por interlúdio.

Ações do interlúdio:
- **Alimentar-se** (prato favorito, nutritivo, energético, rápido).
- **Dormir** (normal, precária, confortável, luxuosa).
- **Exercitar-se** (+1d6 para testes físicos até fim da missão).
- **Ler** (+1d6 para testes mentais/sociais até fim da missão).
- **Manutenção** (conserta item).
- **Relaxar** (recupera SAN; bônus coletivo por grupo que relaxa).
- **Revisar caso** (teste para puxar pista complementar de investigação).
- **Meditar** (aumenta recuperação de EA em um nível).`,
  },
  {
    id: 'investigacao',
    titulo: 'Mecânica de investigação',
    resumoMarkdown: `## Rodadas de investigação
- Cada cena usa rodadas abstratas.
- Cada personagem faz 1 ação principal por rodada.

## Ações
- **Procurar pistas**: descreve abordagem e perícia.
- **Facilitar investigação**: ajuda aliados (+2 no próximo procurar pistas; não cumulativo).
- **Usar habilidades/itens**: conforme descrição específica.

## DT sugerida
- 15: simples é coerente.
- 20: plausivel, mas complexa.
- 25+: muito complexa ou abordagem vaga.

## Urgência
Rodadas disponíveis por urgência:
- Muito baixo: 6
- Baixo: 5
- Medio: 4
- Alto: 3
- Muito alto: 2`,
  },
  {
    id: 'furtividade',
    titulo: 'Mecânica de furtividade',
    resumoMarkdown: `## Regra simples
Teste oposto: **Furtividade vs Percepção**.

## Regra avancada (visibilidade)
- Todos comecam em Visibilidade 0.
- Ação comum: +1 visibilidade.
- Ação discreta: +0.
- Ação arriscada/barulhenta: pode subir mais (ex.: +2, critério do mestre).
- Esconder-se conscientemente pode reduzir visibilidade.

## Ações específicas
- **Distrair**: Enganação DT 15; se passar reduz visibilidade (1), se falhár aumenta (1). Uso repetido aumenta DT em +5.
- **Chamar atenção**: +2 visibilidade própria e -1 em aliado próximo.

## Eventos de furtividade
No início da rodada rola-se 1d20 para eventos de pressão (aproximação, busca intensa, etc.).`,
  },
  {
    id: 'perseguicao',
    titulo: 'Mecânica de perseguição',
    resumoMarkdown: `## Estrutura básica
Perseguicao usa teste estendido:
- Acumular 3 sucessos antes de 3 falhas.
- Caçador vence: alcança presa.
- Presa vence: escapa.

Perícias:
- A pe: Atletismo.
- Motorizada/montaria: Pilotagem ou Adestramento.

## Ações especiais
- **Cortar caminho**: -2d20 no teste, mas sucesso vale 2 sucessos.
- **Esforço extra**: +1d20 e dano em PV cumulativo por uso.
- **Criar obstáculo**: reduz DT da rodada em 5 se passar no teste auxiliar.
- **Despistar**: troca Atletismo por Furtividade; sucesso vale 2 sucessos, falha vale 2 falhas.
- **Sacrifício**: falha própria automática, mas dá +1d20 aos aliados.
- **Atrapalhár**: presa atrapalhá outra presa (ação anti-heroica, contextual).`,
  },
  {
    id: 'aspectos-congenitos',
    titulo: 'Aspectos congênitos',
    resumoMarkdown: `Aspectos congênitos são traços raros e estruturais do personagem.

Catégorias:
- **Dons especiais**: talentos inatos sobrenaturais (percepcao de energia, custo/limite de EA, etc.), com custos é restrições.
- **Restrições congenitas/celestiais**: perde algo muito relevante em troca de ganhos extremos.

Arquétipos de referência:
- Corpo fragil com energia amaldiçoada poderosa.
- Sem energia amaldiçoada com corpo poderoso.

> Aplicação final depende da mesa é do matérial completo do capitulo 12.`,
    detalhadoMarkdown: `## Aspectos congênitos

Alguns feiticeiros nascem com aspectos peculiares e raros que não são técnicas amaldiçoadas, mas sim características fisiológicas e espirituais do corpo e da alma, como os famosos Seis Olhos.

Esses aspectos podem entrar na roleta de sorteio junto com técnicas inatas ou podem ser simplesmente definidos pelo grupo de forma arbitraria, se o mestre permitir.

Cada aspecto é descrito individualmente é dividido em duas catégorias:
- Dons Especiais
- Restrições Celestiais (ou Congenitas)

## Dons Especiais

Dons Especiais são características únicas gravadas na linhagem ou no indivíduo, mas que não funcionam como técnicas amaldiçoadas ativas.

Em vez de conceder novos feitiços, eles alteram como o personagem percebe e manipula energia amaldiçoada, e são inatos e permanentes (não podem ser "desligados").

### Seis Olhos

**Requisitos:** ser do Cla Gojo ou do Cla Okkotsu.

Olhos especiais que concedem percepcao extrema do fluxo de energia amaldiçoada, leitura precisa de técnicas é eficiencia absurda no gasto de EA, funcionando como um amplificador em vez de uma técnica ofensiva.

**Beneficios:**
- Recebe +10 em Percepção.
- Recebe +10 em Reflexos.
- Recebe +6 em Jujutsu.
- Recebe +1 em Presenca.
- Reduz o custo de todas as Técnicas Amaldiçoadas (Inatas e Não Inatas) pela metade, nunca abaixo de 1; arredonda para baixo se necessário.

**Desvantagem - Cansaco Mental**

Dependendo da situação (muita informação, presenca de maldicoes absurdas, cenas caoticas), o mestre pode pedir um teste de Vontade ou Fortitude.

Se falhár:
- sofre 1d6 de dano de Sanidade.

A DT base sugerida é 35 para tomar metade do dano em caso de sucesso (o mestre pode ajustar conforme o ambiente).

**Mitigando o excesso de percepcao**

O usuário dos Seis Olhos enxerga o fluxo de energia amaldiçoada mesmo vendado, então cobrir a visão não "desliga" o dom, apenas amortece.

Opcoes sugeridas:

**Oculos muito escuros**
-5 na DT do teste de Cansaco Mental.
-5 em Percepção.

**Venda completa (sem visão básica)**
-10 na DT do teste de Cansaco Mental.
-8 em Percepção.

Com os olhos cobertos, o portador pode ser alvo de fintas é manobras de enganação por oponentes experientes com mais facilidade, sendo possivel trata-lo como Desprevenido em algumas situações, a critério do mestre.

### Receptaculo do Plasma Estelar

**Requisitos:** ser mulher jovem.

Mulheres jovens com o potencial necessário para renovar a técnica inata da Imortalidade, fundindo-se com o usuario dessa técnica.

Alguns Receptáculos têm mais potencial do que outros e podem se comunicar entre si, mesmo que uma delas já tenha se fundido com o imortal.

O usuário da técnica de Imortalidade não pode se comunicar com aquelas que já se tornaram parte dele; essa comunicação acontece apenas entre os receptáculos.

(É um aspecto principalmente narrativo, mas pode ser usado como gatilho para votos vinculativos, benefícios de suporte, etc., se você quiser expandir.)

### Compensação

**Requisito:** não receber uma técnica inata.

O personagem é "compensado" por não ter técnica inata, recebendo um reforco direto no crescimento das técnicas não-inatas:

Ganhá 1 grau de aprimoramento extra nos níveis 4, 10 é 16, para distribuir em técnicas amaldiçoadas (não-inatas), respeitando os limites normais de grau.

## Restrições Celestiais (Restrições Congenitas)

Também chámadas de Restrições Congenitas, são "votos de nascimento": limitações gravadas no corpo que trocam algo fundamental por um benefício gigantesco em outro ponto.

Diferem de votos vinculativos comuns porque não foram escolhidas pelo personagem; nasceram com ele.

O sistema resume as Restrições Celestiais em dois arquétipos principais, cada um com um "caso extremo" sugerido como referência de poder máximo.

### Arquétipo: Corpo Frágil, Energia Amaldiçoada Poderosa

Nesse arquetipo o personagem possui limitações físicas severas, como:
- Pele extremamente sensivel.
- Membros faltando (braço, perna etc.).
- Problemas cardio-respiratorios.
- Outras deficiências físicas importantes.

Essas limitações podem ser cumulativas (ganho de poder maior) ou apenas algumas (ganho menor). A diferenca de poder entre "algumas limitações" é "limitações extremas" é gritante.

#### Caso Extremo - Corpo Frágil, EA Poderosa

**Limitações:**
- Pele ultra sensivel.
- Membros faltando.
- Corpo tao fragil que mal se mantem em pe (pode exigir cadeiras de rodas, apoio constante, etc.).

**Ganhos:**
- Energia Amaldiçoada dobrada (EA máxima x2).
- Limite de EA por rodada aumentado (o quanto pode gastar por turno sobe um patamar, definido com o mestre).
- Atributos de Presença e Intelecto maiores (valores específicos a combinar na mesa, mas acima da curva normal).
- Perícias de Vontade e Jujutsu, e mais uma perícia baseada em Intelecto ou Presença à escolha do usuário, recebem +10 cada.
- Outros bônus específicos ligados a Técnica Inata do personagem (por exemplo, facilitar complexidade, aumentar DT para resistir aos feitiços, ampliar alcance/dano em certas variações), discutidos com o mestre caso a caso.

### Arquétipo: Sem Energia Amaldiçoada, Corpo Poderoso

Aqui o personagem possui quase nenhuma ou nenhuma EA. Em troca, ganha proezas físicas absurdas: força, velocidade, resistência, reflexos e sentidos muito acima do normal.

Assim como no arquétipo anterior, isso é um espectro: a diferença entre "quase nenhuma EA" e "zero EA total" é enorme; o caso extremo aqui é literalmente sem EA nenhuma.

#### Caso Extremo - Sem EA, Corpo Poderoso

**Limitações:**
- Nenhuma energia amaldiçoada.
- Sem técnicas inatas ou não-inatas.
- Incapaz de possuir a perícia Jujutsu (não pode aprender nem usar).

**Ganhos:**
- Atributos de Forca, Agilidade é Vigor maiores (acima da curva, definidos com o mestre).
- Perícias Acrobacia, Atletismo, Luta, Pontaria, Reflexos e Fortitude recebem +10 cada.
- Recebe +1 dado de dano em todas as rolagens de ataque corpo a corpo (por exemplo, 1d8 vira 2d8 antes de considerar críticos).
- Aumenta o tipo de dado dos ataques corpo a corpo em um passo na escala:
  d4 -> d6 -> d8 -> d10 -> d12 -> d16 -> d20.
- Recebe +1 na margem de ameaça de todos os ataques (corpo a corpo e, se o mestre permitir, também disparo físico).
- Deslocamento aumentado em 50% (ex.: 9m vira ~13,5m por ação de movimento; arredondamento a combinar).
- +1 Ação Completa por turno (além da padrão).
- +1 Reação especial por turno (pode fazer mais uma reação além do limite padrão de reações).`,
  },
]

const MESTRE_SHIELD_GUIDES_DETALHADOS: Partial<Record<string, string>> = {
  pericias: `## Lista completa de perícias

| Perícia       | Atributo base | Somente treinada? | Penalidade por carga? | Precisa de kit? |
| ------------- | ------------- | ----------------- | --------------------- | --------------- |
| Acrobacia     | Agilidade     | Não               | Sim                   | Não             |
| Adestramento  | Presenca      | Sim               | Não                   | Não             |
| Artes         | Presenca      | Sim               | Não                   | Não             |
| Atletismo     | Forca         | Não               | Não                   | Não             |
| Atualidades   | Intelecto     | Não               | Não                   | Não             |
| Ciências      | Intelecto     | Sim               | Não                   | Não             |
| Crime         | Agilidade     | Sim               | Sim                   | Sim             |
| Diplomacia    | Presenca      | Não               | Não                   | Não             |
| Enganação     | Presenca      | Não               | Não                   | Sim             |
| Fortitude     | Vigor         | Não               | Não                   | Não             |
| Furtividade   | Agilidade     | Não               | Sim                   | Não             |
| Iniciativa    | Agilidade     | Não               | Não                   | Não             |
| Intimidação   | Presenca      | Não               | Não                   | Não             |
| Intuicao      | Presenca      | Não               | Não                   | Não             |
| Investigação  | Intelecto     | Não               | Não                   | Não             |
| Luta          | Forca         | Não               | Não                   | Não             |
| Medicina      | Intelecto     | Não               | Não                   | Sim             |
| Jujutsu       | Intelecto     | Sim               | Não                   | Não             |
| Percepção     | Presença      | Não               | Não                   | Não             |
| Pontaria      | Agilidade     | Não               | Não                   | Não             |
| Profissao     | Intelecto     | Sim               | Não                   | Não             |
| Reflexos      | Agilidade     | Não               | Não                   | Não             |
| Religiao      | Presenca      | Sim               | Não                   | Não             |
| Tatica        | Intelecto     | Sim               | Não                   | Não             |
| Tecnologia    | Intelecto     | Sim               | Não                   | Sim             |
| Sobrevivência | Intelecto     | Não               | Não                   | Não             |
| Vontade       | Presenca      | Não               | Não                   | Não             |
| Pilotagem     | Agilidade     | Não               | Não                   | Não             |

## Regra de rolagem por atributo base

- O atributo base define a quantidade de d20.
- Exemplo: Pilotagem (base Agilidade).
  - Agilidade 2: rola 2d20, pega o melhor e soma o bônus da perícia.
  - Agilidade 3: rola 3d20, pega o melhor e soma o bônus.
- Para atributo 0 ou negativo:
  - atributo 0: rola 2d20 é pega o pior.
  - atributo -1: rola 3d20 é pega o pior.
  - é assim por diante.

## Observação operacional

Para NPCs, o valor sugerido pode vir automaticamente do atributo base, mas o mestre pode sobrescrever quantidade de dados e bônus livremente quando for necessário para a narrativa da cena.`,
  condicoes: `## Lista completa de condicoes

- **Abalado**: -1d20 em testes; em novo abalado vira Apavorado (medo).
- **Agarrado**: desprevenido é imovel, -1d20 em ataques, so arma leve; tiros na dupla podem errar alvo (50%).
- **Alquebrado**: custo em PE das habilidades/rituais +1. Condição mental.
- **Apavorado**: -2d20 em pericias é deve fugir da fonte do medo; não pode se aproximar voluntariamente.
- **Asfixiado**: sem respirar; após segurar o fôlego, testa Fortitude por rodada ou cai inconsciente é perde 1d6 PV por rodada.
- **Atordoado**: desprevenido é sem ações. Condição mental.
- **Caído**: no chão; -2d20 em ataques corpo a corpo, deslocamento 1,5m; Defesa -5 contra corpo a corpo e +5 contra distância.
- **Cego**: desprevenido e lento; sem Percepção visual; -2d20 em perícias de Força/Agilidade; alvos com camuflagem total.
- **Confuso**: comportamento aleatorio por d6 no início do turno.
- **Debilitado**: -2d20 em Agilidade, Forca é Vigor; se repetir, fica Inconsciente.
- **Desprevenido**: Defesa -5 é -1d20 em Reflexos.
- **Doente**: sob efeito da doença específica.
- **Em Chámas**: 1d6 fogo no início do turno até apagar.
- **Enjoado**: so ação padrão ou movimento por rodada.
- **Enlouquecendo**: 3 turnos na mesma cena gera insanidade permanente; pode encerrar com Diplomacia ou cura de SAN.
- **Enredado**: lento, vulneravel é -1d20 em ataques.
- **Envenenado**: efeito varia por veneno.
- **Esmorecido**: -2d20 em Intelecto é Presenca.
- **Exausto**: Debilitado, Lento é Vulneravel; se repetir, Inconsciente.
- **Fascinado**: foco total; -2d20 em Percepção e não age além de observar.
- **Fatigado**: Fraco é Vulneravel; se repetir, Exausto.
- **Fraco**: -1d20 em Agilidade, Forca é Vigor; se repetir, Debilitado.
- **Frustrado**: -1d20 em Intelecto é Presenca; se repetir, Esmorecido.
- **Imovel**: deslocamento 0m.
- **Inconsciente**: indefeso, sem ações/reações.
- **Indefeso**: desprevenido, Defesa -10, falha em Reflexos e pode sofrer golpe de misericórdia.
- **Lento**: deslocamentos pela metade, sem correr/investida.
- **Machucado**: metade ou menos dos PV.
- **Morrendo**: com 0 PV; 3 turnos Morrendo na cena = morte.
- **Ofuscado**: -1d20 em ataques e Percepção.
- **Paralisado**: imovel é indefeso; so ações mentais.
- **Pasmo**: sem ações.
- **Perturbado**: primeira vez na cena gera 1 efeito de insanidade (temporaria).
- **Petrificado**: Inconsciente é RD 10.
- **Sangrando**: testa Vigor DT 20 por turno; se falhár perde 1d6 PV.
- **Silenciado**: sem habilidades que exijam fala/encantamento.
- **Surdo**: sem Percepção auditiva, -2d20 Iniciativa.
- **Surpreendido**: desprevenido é sem agir.
- **Vulneravel**: -2 na Defesa.`,
  'conflito-dominios': `## Regra de conflito de domínios

### Colisao de Domínios - "cabo de guerra"

Quando alguém expande um Domínio diretamente contra outro, o alvo pode reagir expandindo o próprio Domínio como reação.

Essa reação tem penalidade no primeiro teste de Jujutsu da disputa:
- -5 no valor total do teste.
- -1d20 (desvantagem) na quantidade de dados rolados.

A disputa é uma corrida de pontos. Em cada rodada, cada lado faz 1 teste de Jujutsu é compara os resultados:
- Diferenca 0: ninguem ganhá ponto.
- Vitoria por até 5 pontos: +1 ponto.
- Vitoria por até 10 pontos: +2 pontos.
- Vitoria por 11+ pontos: +3 pontos.

A disputa continua até que um dos domínios abra 3 pontos de vantagem é subjuga o adversario.

Enquanto não houver vencedor (ou até um Domínio ser desfeito voluntariamente):
- as barreiras continuam existindo;
- o Acerto Garantido de ambos é anulado na zona de disputa (as técnicas não acertam automaticamente).

### Expandir um Domínio dentro de outro

Um feiticeiro preso num Domínio hostil pode tentar expandir o próprio Domínio de dentro. Ao fazer isso, escolhe:

#### 1) Abrir um buraco de fuga

- Rola dois testes de Jujutsu contra o oponente.
- Se em nenhum deles perder por 10+ pontos, abre uma fenda na borda do Domínio inimigo.
- A fenda permite que 1 criatura por rodada atravesse, criando rota de fuga.
- Enquanto o buraco existir, o Acerto Garantido do Domínio inimigo é anulado.

#### 2) Iniciar um novo cabo de guerra

- Comeca uma disputa de Domínios usando as mesmas regras de Colisao.
- O primeiro teste de Jujutsu de quem reagiu de dentro entra com desvantagem (-1d20), por estar reagindo preso no Domínio inimigo.`,
  'primeira-expansao': `## Regra de primeira expansão de domínios

### Primeira expansão de Domínio (preparada)

A primeira vez que um personagem expande um Dominio deve ser tratada como momento-cháve da campanhá.

Antes da sessão, mestre e jogador definem:
- forma, estetica é paisagem mental do Dominio;
- tipo principal (letal, aperfeicoador, restritivo ou combinação);
- custos base em EA/PE para abrir é sustentar, dentro das faixas do capitulo de barreiras.

O mestre pode pedir vários testes durante criação e refinamento, por exemplo:
- Ciências;
- Vontade;
- Tatica;
- Intuicao;
- Jujutsu.

Se a cena envolver ritual, planejamento ou ajuda de outros personagens, o recomendado é usar testes unidos para representar esforco conjunto.

### Epifania é Dominio em combate

Em casos raros, o feiticeiro pode ter uma epifania em combate é tentar expandir um Dominio cru, sem ritual previo.

Usa-se uma Rolagem de Epifania:
- teste cru, sem bônus especiais além do que o mestre permitir;
- DT inicial sugerida: 20;
- a cada falha, a DT diminui em 1 até conseguir ou até a cena acabar.

Limitações mecanicas de um Dominio por epifania:
- penalidade de -2d20 no teste de Jujutsu da expansão (controle precário);
- custo extra em EA/PE definido pelo mestre, além do custo base da expansão;
- efeitos dentro do Dominio mais simples/reduzidos em comparação a um Dominio refinado.`,
  dificuldades: `## Tabela guia de dificuldades

| Tarefa | DT | Exemplo |
| --- | --- | --- |
| Fácil | 5 | Escutar conversa atrás da porta (Percepção) |
| Media | 10 | Subir um barranco (Atletismo) |
| Dificil | 15 | Montar acampamento no campo (Sobrevivência) |
| Muito difícil | 20 | Estancar sangramento fatal (Medicina) |
| Formidavel | 25 | Hackear servidor (Tecnologia) |
| Heroica | 30 | Decifrar maldição antiga (Jujutsu) |
| Quase impossível | 35 | Convencer inimigo a te proteger (Diplomacia) |
| Apenas o honrado | 40 | Evitar habilidade de maldição de divindade (Vontade) |

Observação: em tarefas triviais, o recomendado é não pedir rolagem.`,
  'teste-unido': `## Regra de testes com várias perícias (teste unido)

Quando uma única ação depende claramente de duas ou mais perícias ao mesmo tempo, usa-se teste unido.

Passo a passo:

1. Para cada perícia envolvida, veja quantos d20 o personagem rolaria (pelo atributo base).
2. Some esses números de dados, divida pela quantidade de perícias e arredonde para baixo.
3. Repita o processo para os bônus das perícias (soma, divide, arredonda para baixo).
4. Rola-se um único teste com esse pool médio e bônus médio.

Esse único resultado é comparado com a DT definida pelo mestre ou pela técnica (ex.: ação que mistura Jujutsu + Pontaria).

Observações:
- essa é a regra única de rolagem única envolvendo várias perícias ao mesmo tempo;
- testes estendidos continuam existindo para várias rolagens em etapas, mas são outro fluxo.`,
  'tipos-dano': `## Tipos de dano

- **Balistico**: projeteis de armas de fogo é similares.
- **Corte**: laminas, garras é armas cortantes.
- **Eletricidade**: choques, raios é efeitos eletricos.
- **Fogo**: calor é chámas naturais ou jujutsu.
- **Frio**: gelo, congelamento é clima severo.
- **Impacto**: contusao, socos, explosoes é quedas.
- **Mental**: dano psiquico; normalmente afeta SAN.
- **Amaldiçoado/Jujutsu**: técnicas, espiritos é itens amaldiçoados.
- **Perfuração**: objetos pontiagudos.
- **Quimico**: acidos, toxinas é compostos corrosivos.

O tipo de dano é base para resistências, vulnerabilidades é efeitos que citam dano específico.`,
  'tipos-acoes': `## Tipos de ações

### Ações padrão

- **Agredir**: ataque com arma corpo a corpo ou a distância.
  - Corpo a corpo: ataca alvos adjacentes (1,5m).
  - Distância: alvo dentro do alcance da arma (ou até o dobro, com -5 no ataque).
  - Atirando em combate corpo a corpo: se atacar a distância um alvo engajado, sofre -1d20 no teste.
- **Manobra de combate**: ataque corpo a corpo especial (não pode ser a distância), com teste oposto.
  - Manobras listadas: Agarrar, Quebrar, Atropelar.
- **Conjurar encantamento**: maioria usa ação padrão.
- **Fintar**: Enganação oposta a Reflexos de alvo em alcance curto; se passar, alvo fica desprevenido contra seu próximo ataque até fim do próximo turno.
- **Preparar**: declara ação + gatilho; executa como reação antes do próximo turno quando gatilho ocorrer.
- **Usar habilidade ou item**: qualquer descrição que diga "ação padrão".

### Atropelar (especial)

Pode ser usado durante movimento para atravessar espaço de criatura.
- Se alvo der passagem, atravessa sem teste.
- Se resistir, faz teste oposto:
  - se vencer: alvo fica caído e você continua;
  - se perder: alvo bloqueia passagem.
- Também pode ser tentado como ação livre durante investida.

### Ações de movimento

- Levantar-se.
- Manipular item.
- Mirar:
  - remove penalidade de -1d20 em Pontaria contra alvo engajado em corpo a corpo até o fim do próximo turno;
  - exige treinamento em Pontaria.
- Movimentar-se.
- Sacar/guardar item.

### Ações completas

- **Corrida**.
- **Golpe de misericórdia**:
  - alvo adjacente é indefeso;
  - acerto critico automatico;
  - chánce de morte instantanea conforme importancia do alvo.
- **Investida**:
  - move até o dobro do deslocamento em linhá reta é ataca no final;
  - +1d20 no ataque é -5 na Defesa até o próximo turno;
  - não pode em terreno difícil.
- **Conjuração longa**: ação completa por rodada de conjuração.

### Ações livres

- Atrasar.
- Falar (regra sugerida: até 20 palavras por rodada).
- Jogar-se no chão.
- Largar item.

Observação: reações especiais (bloqueio/esquiva e afins) seguem exceções da regra geral.`,
  'ferimentos-morte': `## Ferimentos é morte

### PV, 0 PV é Morrendo

- Enquanto PV > 0, personagem age normalmente.
- Ao chegar na metade ou menos dos PV totais, entra em Machucado.
- Ao ser reduzido a 0 PV:
  - ganhá Inconsciente é Morrendo;
  - se iniciar 3 turnos Morrendo na mesma cena, morre.

Encerrar Morrendo:
- Medicina DT 20, com +5 na DT para cada vez que ja foi estabilizado na mesma cena;
- habilidades/efeitos específicos que estabilizam ou curam.

Inconsciente termina ao recuperar ao menos 1 PV.

### Dano massivo

Quando um único ataque causa pelo menos metade dos PV totais, ocorre teste de Fortitude conforme regra de dano massivo.

Em falha, aplica-se tabela de consequências (a mesa usa a tabela oficial em vigor).

### Dano não letal

- Dano não letal soma com letal apenas para decidir quando cai inconsciente.
- Dano não letal não conta para entrar em Morrendo.
- Curas removem primeiro dano não letal.
- Ataques corpo a corpo podem causar dano não letal com penalidade de -5 no ataque.
- Ataques desarmados é algumas armas são naturalmente não letais, mas podem ser letais com -5 no ataque.`,
  'insanidade-loucura': `## Insanidade é loucura

- Dano mental reduz SAN em vez de PV.
- Com menos da metade da SAN total: personagem fica Perturbado.
- Primeira vez por cena em Perturbado: recebe efeito temporario de insanidade.
- Em 0 SAN: personagem entra em Enlouquecendo.
- Se iniciar 3 turnos Enlouquecendo na mesma cena: ganhá insanidade permanente.

Encerrar Enlouquecendo:
- Diplomacia (Acalmar) DT 20, com +5 por acalmada previa na cena.
- qualquer efeito que cure ao menos 1 SAN.

Observação: certas perdas de SAN podem ser permanentes, conforme efeito/narrativa.`,
  'situações-especiais': `## Situações especiais

### Camuflagem

- **Camuflagem leve**:
  - ataques contra o alvo têm 20% de falha;
  - rola-se 1d10 junto com o d20; em 1-2, ataque erra independentemente do teste.
- **Camuflagem total**:
  - ataques contra o alvo têm 50% de falha;
  - erro em 1-5 no d10.

### Cobertura

- **Cobertura leve**: +5 na Defesa.
- **Cobertura total**: alvo não pode ser atacado.

### Tabela de modificadores rápidos

- Ofuscado: atacante sofre -1d20 no ataque.
- Alvo caído: Defesa -5 contra corpo a corpo e +5 contra distância.
- Alvo cego: Defesa -5.
- Alvo desprevenido: Defesa -5.
- Camuflagem leve/total é cobertura leve/total conforme regras acima.`,
  multidoes: `## Mecânica de multidões

### Conceito de horda

Uma Horda é tratada como um único inimigo, representando vários indivíduos.

A Horda tem:
- PV totais;
- PV por indivíduo;
- indivíduos atuais (PV totais / PV por indivíduo, arredondando para baixo);
- Defesa;
- RD;
- tamanho (normalmente Grande ou maior);
- habilidades/ataques por rodada.

### Dano e mortes na multidão

#### Regra padrão (combate mais duradouro)

- Ataques de alvo único:
  - causam dano apenas ao indivíduo atingido;
  - overkill é perdido.
- Ataques de área:
  - causam dano total na Horda;
  - indivíduos mortos = dano causado / PV por indivíduo (arredonda para baixo).

Acertos críticos multiplicam dano normalmente.

Pode-se ignorar dano massivo individual; opcionalmente, se um ataque causar >= metade dos PV totais da Horda, ela pode testar Fortitude para não se dispersar.

#### Regra alternativa (combate mais dinâmico)

- Ataques de alvo único:
  - causam dano nos PV totais da Horda;
  - overkill é mantido.
- Ataques de área:
  - afetam cada indivíduo dentro da área.

### Comportamento é tamanho

- Tamanho tipico sugerido:
  - pequena: 2x2 quadrados;
  - media: 3x3;
  - grande: 4x4 ou mais.
- Em vez de usar muitos modificadores de tamanho, pode-se reduzir Defesa/RD conforme baixa de indivíduos.

### Ataques da Horda

- Horda faz um único teste de ataque por rodada, representando vários golpes.
- O dano pode escalar com número de indivíduos e pode ser distribuído entre vários alvos.
- Técnicas de área, Dominios é granadas aplicam dano conforme a regra escolhida (padrão ou alternativa).`,
  interludio: `## Cenas de interlúdio

Momentos de paz são raros na vida de um feiticeiro jujutsu, mas existem. As cenas sem combate/investigação ativa são interludios.

Servem para:
- descansar;
- acalmar os animos;
- revisar pistas;
- planejar próximos passos.

Regras base:
- mestre define início é fim;
- requer local minimamente seguro (ao relento, sem estrutura, não há interlúdio);
- forçar muitos interludios pode aumentar urgência futura, a critério do mestre;
- cada personagem pode realizar até 2 ações no interlúdio.

### Ações de interlúdio

#### Alimentar-se

Escolha um prato é ganhe efeito:
- **Prato Favorito**: se também Relaxar, recupera +2 SAN adicional.
- **Prato Nutritivo**: se também Dormir, melhora recuperação de PV em um nível.
- **Prato Energetico**: se também Dormir, melhora recuperação de PE em um nível.
- **Prato Rapido**: se também Revisar Caso, recebe +5 no teste.

Um personagem so se beneficia de 1 refeicao por interlúdio, é precisa de acesso plausivel a refeicao.

#### Dormir

Recupera PV, PE e EA conforme condição de descanso:
- **Precaria**: metade.
- **Normal**: valor base.
- **Confortavel**: dobro.
- **Luxuosa**: triplo.

Só pode dormir 1 vez por interlúdio.

#### Exercitar-se

Ganhá +1d6 em um teste baseado em Agilidade, Forca ou Vigor até o fim da missão.
- acumulo máximo: Vigor;
- uso: 1 bônus por teste.

#### Ler

Ganhá +1d6 em um teste baseado em Intelecto ou Presenca até o fim da missão.
- acumulo máximo: Intelecto;
- uso: 1 bônus por teste.

#### Manutenção

Conserta item quebrado, restaurando status/PV do item.

#### Relaxar

Recupera SAN como Dormir recupera PV/PE/EA.

Bonus coletivo:
- para cada personagem que também Relaxar no mesmo interlúdio, todos participantes de Relaxar recuperam +1 SAN adicional.

Só pode Relaxar 1 vez por interlúdio.

#### Revisar Caso

Escolha uma cena de investigação já ocorrida, descreva a abordagem e faça um teste de perícia adequado.

Se passar:
- recebe pista complementar perdida daquela cena;
- se não houver mais pistas complementares, o mestre confirma cena esgotada.

Pode repetir Revisar Caso no mesmo interlúdio (critério do mestre).

#### Meditar

Aumenta recuperação de EA em um nível.
- normalmente é combinada com Dormir no mesmo interlúdio.`,
  investigacao: `## Mecânica de investigação

### Rodadas de investigação

Cada cena de investigação é dividida em rodadas abstratas (minutos, horas ou escala narrativa).

Em cada rodada, cada personagem escolhe 1 ação principal; quando todos agem, rodada termina.

### Ações em investigação

#### Procurar Pistas

Jogador escolhe uma perícia e descreve a abordagem (ex.: Diplomacia para testemunha, Tecnologia para logs, Percepção para varredura visual).

DT sugerida:
- 15: ação simples é adequada;
- 20: plausivel, mas complexa;
- 25+: muito complexa ou abordagem vaga.

Mestre decide se a ação tem chánce real de gerar pista.

#### Facilitar Investigação

Em vez de buscar pista direto, personagem melhora o contexto para aliados (organizar documentos, melhorar iluminação, isolar local etc.).

Se passar no teste:
- cada aliado recebe +2 no próximo teste de Procurar Pistas da cena;
- bônus não cumulativo.

#### Usar Habilidades é Itens

Recursos que tenham descrição específica para investigação aplicam conforme seu texto.

### Urgência da investigação

Cada cena pode ter grau de urgência com numero máximo de rodadas:
- Muito baixo: 6
- Baixo: 5
- Médio: 4
- Alto: 3
- Muito alto: 2

Ao esgotar tempo, mestre aplica consequências (inimigo mais forte, reforco, perda de descanso, agravamento da situação etc.).`,
  furtividade: `## Mecânica de furtividade

### Regra simples

Para cenas de baixa complexidade:
- teste oposto de Furtividade (personagem) vs Percepção (algoz).

### Regra avancada - Visibilidade

Visibilidade mede o quao perto de ser detectado o personagem esta.

Base:
- todos comecam com Visibilidade 0.

Ajustes usuais:
- ação comum: +1 visibilidade;
- ação discreta: +0;
- ação arriscada/barulhenta: tende a subir mais (ex.: +2), a critério do mestre;
- esconder-se conscientemente pode reduzir visibilidade (normalmente com teste de Furtividade).

Mestre pode monitorar visibilidade de grupo para deteccao coletiva.

### Ações específicas

#### Distrair

Teste de Enganação DT 15:
- sucesso: reduz visibilidade em 1 (própria ou de aliado);
- falha: aumenta visibilidade em 1.

Limites:
- apenas 1 personagem pode usar essa ação por rodada;
- cada uso adicional na mesma cena aumenta DT em +5.

#### Chámar Atencao

Personagem puxa foco para proteger aliado:
- +2 visibilidade própria;
- -1 visibilidade de um aliado próximo.

### Eventos de furtividade

No início de cada rodada, alguém rola 1d20 e o mestre aplica evento de pressão (aproximação extrema, busca implacável, deslocamento agressivo do algoz, etc.).`,
  perseguicao: `## Mecânica de perseguição

### Estrutura básica

Perseguicoes usam teste estendido:
- cada personagem precisa acumular 3 sucessos antes de 3 falhas.
- caçador que vence alcança a presa.
- presa que vence escapa.

Perícia principal:
- a pé: Atletismo.
- motorizada/montaria: Pilotagem ou Adestramento.

DT é definida pelo mestre conforme vantagem de velocidade e contexto.

### Ações especiais em perseguição

#### Cortar Caminho

- sofre -2d20 no teste de Atletismo;
- se passar, ganhá 2 sucessos.

Mestre pode vetar se não houver rota plausivel.

#### Esforco Extra

- recebe +1d20 no teste de Atletismo;
- sofre dano em PV cumulativo por uso na cena.

#### Criar Obstaculo (presa)

- sofre -1d20 no próprio teste;
- realiza teste auxiliar (Força ou perícia adequada).
- se passar, reduz DT do Atletismo da rodada em 5 para todos.

Apenas 1 personagem por rodada pode usar.

#### Despistar (presa)

- exige ao menos 1 sucesso acumulado;
- troca teste de Atletismo por Furtividade;
- se passar: ganhá 2 sucessos;
- se falhar: recebe 2 falhas.

#### Sacrifício

- falha automaticamente no próprio teste;
- concede +1d20 aos testes dos aliados.

#### Atrapalhár (presa vs presa)

- usada para sabotar outra presa;
- sofre -1d20 no próprio teste;
- faz teste oposto para impor penalidade ao alvo.

E uma ação anti-heroica é situacional.

### Opcoes avancadas

- testes opostos em vez de DT fixa;
- eventos de perseguição por tabela (piso escorregadio, multidão, entulho, atalho, porta trancada etc.).`,
}

for (const secao of MESTRE_SHIELD_GUIDES) {
  if (!secao.detalhadoMarkdown) {
    const detalhádo = MESTRE_SHIELD_GUIDES_DETALHADOS[secao.id]
    if (detalhádo) {
      secao.detalhadoMarkdown = detalhádo
    }
  }
}

