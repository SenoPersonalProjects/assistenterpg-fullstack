export type MestreShieldGuideSection = {
  id: string;
  titulo: string;
  resumoMarkdown: string;
  detalhadoMarkdown?: string;
};

export const MESTRE_SHIELD_GUIDES: MestreShieldGuideSection[] = [
  {
    id: 'pericias',
    titulo: 'Lista completa de pericias',
    resumoMarkdown: `| Pericia       | Atributo base | Somente treinada? | Penalidade por carga? | Precisa de kit? |
| ------------- | ------------- | ----------------- | --------------------- | --------------- |
| Acrobacia     | Agilidade     | Nao               | Sim                   | Nao             |
| Adestramento  | Presenca      | Sim               | Nao                   | Nao             |
| Artes         | Presenca      | Sim               | Nao                   | Nao             |
| Atletismo     | Forca         | Nao               | Nao                   | Nao             |
| Atualidades   | Intelecto     | Nao               | Nao                   | Nao             |
| Ciencias      | Intelecto     | Sim               | Nao                   | Nao             |
| Crime         | Agilidade     | Sim               | Sim                   | Sim             |
| Diplomacia    | Presenca      | Nao               | Nao                   | Nao             |
| Enganacao     | Presenca      | Nao               | Nao                   | Sim             |
| Fortitude     | Vigor         | Nao               | Nao                   | Nao             |
| Furtividade   | Agilidade     | Nao               | Sim                   | Nao             |
| Iniciativa    | Agilidade     | Nao               | Nao                   | Nao             |
| Intimidacao   | Presenca      | Nao               | Nao                   | Nao             |
| Intuicao      | Presenca      | Nao               | Nao                   | Nao             |
| Investigacao  | Intelecto     | Nao               | Nao                   | Nao             |
| Luta          | Forca         | Nao               | Nao                   | Nao             |
| Medicina      | Intelecto     | Nao               | Nao                   | Sim             |
| Jujutsu       | Intelecto     | Sim               | Nao                   | Nao             |
| Percepcao     | Presenca      | Nao               | Nao                   | Nao             |
| Pontaria      | Agilidade     | Nao               | Nao                   | Nao             |
| Profissao     | Intelecto     | Sim               | Nao                   | Nao             |
| Reflexos      | Agilidade     | Nao               | Nao                   | Nao             |
| Religiao      | Presenca      | Sim               | Nao                   | Nao             |
| Tatica        | Intelecto     | Sim               | Nao                   | Nao             |
| Tecnologia    | Intelecto     | Sim               | Nao                   | Sim             |
| Sobrevivencia | Intelecto     | Nao               | Nao                   | Nao             |
| Vontade       | Presenca      | Nao               | Nao                   | Nao             |
| Pilotagem     | Agilidade     | Nao               | Nao                   | Nao             |`,
  },
  {
    id: 'condicoes',
    titulo: 'Lista completa de condicoes',
    resumoMarkdown: `- **Abalado**: -1d20 em testes; em novo abalado vira Apavorado (medo).
- **Agarrado**: desprevenido e imovel, -1d20 em ataques, so arma leve; tiros na dupla podem errar alvo (50%).
- **Alquebrado**: custo em PE das habilidades/rituais +1. Condicao mental.
- **Apavorado**: -2d20 em pericias e deve fugir da fonte do medo.
- **Asfixiado**: sem respirar; apos folego, testa Fortitude por rodada ou cai inconsciente e perde 1d6 PV por rodada.
- **Atordoado**: desprevenido e sem acoes. Condicao mental.
- **Caido**: no chao; -2d20 em ataques corpo a corpo, deslocamento 1,5m; Defesa -5 contra corpo a corpo e +5 contra distancia.
- **Cego**: desprevenido e lento, -2d20 em pericias de Forca/Agilidade, alvos com camuflagem total.
- **Confuso**: comportamento aleatorio por d6 no inicio do turno.
- **Debilitado**: -2d20 em Agilidade, Forca e Vigor; se repetir, fica Inconsciente.
- **Desprevenido**: Defesa -5 e -1d20 em Reflexos.
- **Doente**: sob efeito da doenca especifica.
- **Em Chamas**: 1d6 fogo no inicio do turno ate apagar.
- **Enjoado**: so acao padrao ou movimento por rodada.
- **Enlouquecendo**: 3 turnos na mesma cena gera insanidade permanente; pode encerrar com Diplomacia ou cura SAN.
- **Enredado**: lento, vulneravel e -1d20 em ataques.
- **Envenenado**: efeito varia por veneno.
- **Esmorecido**: -2d20 em Intelecto e Presenca.
- **Exausto**: Debilitado, Lento e Vulneravel; se repetir, Inconsciente.
- **Fascinado**: foco total; -2d20 em Percepcao e nao age alem de observar.
- **Fatigado**: Fraco e Vulneravel; se repetir, Exausto.
- **Fraco**: -1d20 em Agilidade, Forca e Vigor; se repetir, Debilitado.
- **Frustrado**: -1d20 em Intelecto e Presenca; se repetir, Esmorecido.
- **Imovel**: deslocamento 0m.
- **Inconsciente**: indefeso, sem acoes/reacoes.
- **Indefeso**: desprevenido, Defesa -10, falha em Reflexos e pode sofrer golpe de misericordia.
- **Lento**: deslocamentos pela metade, sem correr/investida.
- **Machucado**: metade ou menos dos PV.
- **Morrendo**: com 0 PV; 3 turnos Morrendo na cena = morte.
- **Ofuscado**: -1d20 em ataques e Percepcao.
- **Paralisado**: imovel e indefeso; so acoes mentais.
- **Pasmo**: sem acoes.
- **Perturbado**: primeira vez na cena gera 1 efeito de insanidade (temporaria).
- **Petrificado**: Inconsciente e RD 10.
- **Sangrando**: testa Vigor DT 20 por turno; se falhar perde 1d6 PV.
- **Silenciado**: sem habilidades que exijam fala/encantamento.
- **Surdo**: sem Percepcao auditiva, -2d20 Iniciativa.
- **Surpreendido**: desprevenido e sem agir.
- **Vulneravel**: -2 na Defesa.`,
  },
  {
    id: 'conflito-dominios',
    titulo: 'Regra de conflito de dominios',
    resumoMarkdown: `## Colisao de dominios (cabo de guerra)

Quando alguem expande um Dominio contra outro, o alvo pode reagir expandindo o proprio Dominio como reacao.

Penalidade no primeiro teste de Jujutsu da reacao:
- **-5** no valor total do teste.
- **-1d20** na quantidade de dados.

Disputa por rodada (1 teste de Jujutsu de cada lado):
- Diferenca 0: sem ponto.
- Vitoria por ate 5: **+1 ponto**.
- Vitoria por ate 10: **+2 pontos**.
- Vitoria por 11+: **+3 pontos**.

Vence quem abrir **3 pontos de vantagem**.

Enquanto nao houver vencedor:
- Barreiras ativas.
- Acerto garantido dos dois lados fica anulado na zona de disputa.

## Expandir um Dominio dentro de outro

Opcao 1: **abrir buraco de fuga**
- Rola 2 testes de Jujutsu contra o oponente.
- Se nao perder por 10+ em nenhum, abre fenda na borda.
- Passa 1 criatura por rodada.
- Acerto garantido inimigo fica anulado enquanto houver fenda.

Opcao 2: **iniciar novo cabo de guerra**
- Usa as mesmas regras de colisao.
- Primeiro teste de quem reagiu de dentro entra com **-1d20**.`,
  },
  {
    id: 'primeira-expansao',
    titulo: 'Regra de primeira expansao de dominios',
    resumoMarkdown: `## Primeira expansao (preparada)

Antes da sessao, mestre e jogador definem:
- Forma, estetica e paisagem mental.
- Tipo principal: letal, aperfeicoador, restritivo ou combinado.
- Custos base em EA/PE para abrir e sustentar.

O mestre pode pedir testes de refinamento:
- Ciencias, Vontade, Tatica, Intuicao e Jujutsu.

Se houver ritual/plano/ajuda, use **teste unido** para representar esforco conjunto.

## Epifania em combate

Dominio cru sem ritual previo:
- Teste de Epifania com **DT inicial 20**.
- A cada falha, DT reduz em 1 ate sucesso ou fim da cena.

Limitacoes:
- **-2d20** no teste de Jujutsu da expansao.
- Custo extra de EA/PE (definido pelo mestre).
- Efeitos mais simples que um Dominio refinado.`,
  },
  {
    id: 'dificuldades',
    titulo: 'Tabela de guia de dificuldades',
    resumoMarkdown: `| Tarefa | DT | Exemplo |
| --- | --- | --- |
| Facil | 5 | Escutar conversa atras da porta (Percepcao) |
| Media | 10 | Subir um barranco (Atletismo) |
| Dificil | 15 | Montar acampamento no campo (Sobrevivencia) |
| Muito dificil | 20 | Estancar sangramento fatal (Medicina) |
| Formidavel | 25 | Hackear servidor (Tecnologia) |
| Heroica | 30 | Decifrar maldicao antiga (Jujutsu) |
| Quase impossivel | 35 | Convencer inimigo a te proteger (Diplomacia) |
| Apenas o honrado | 40 | Evitar habilidade de maldicao de divindade (Vontade) |

> Recomendacao: nao pedir rolagem para tarefas triviais.`,
  },
  {
    id: 'teste-unido',
    titulo: 'Regra de testes com varias pericias',
    resumoMarkdown: `Quando uma unica acao depende de varias pericias ao mesmo tempo, use **teste unido**.

Passos:
1. Para cada pericia, anote quantos d20 ela rolaria.
2. Some os dados, divida pelo numero de pericias e arredonde para baixo.
3. Some os bonus das pericias, divida pelo numero de pericias e arredonde para baixo.
4. Rola-se **um unico teste** com esse pool medio e bonus medio.

Use para casos como tecnica que mistura Jujutsu + Pontaria.

> Isso e diferente de testes estendidos (varias rolagens ao longo do tempo).`,
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
- Amaldicoado / Jujutsu
- Perfuracao
- Quimico

O tipo de dano e usado para resistencias, vulnerabilidades e efeitos especificos.`,
  },
  {
    id: 'tipos-acoes',
    titulo: 'Tipos de acoes',
    resumoMarkdown: `## Acoes padrao
- **Agredir** (corpo a corpo ou distancia; tiro em alvo engajado pode impor -1d20).
- **Manobra de combate** (agarrar, quebrar, atropelar).
- **Conjurar encantamento**.
- **Fintar** (Enganacao vs Reflexos).
- **Preparar** acao com gatilho.
- **Usar habilidade/item** com custo de padrao.

## Acoes de movimento
- Levantar-se.
- Manipular item.
- Mirar.
- Movimentar-se.
- Sacar/guardar item.

## Acoes completas
- Corrida.
- Golpe de misericordia.
- Investida.
- Conjuracao longa.

## Acoes livres
- Atrasar.
- Falar (regra sugerida: ate 20 palavras por rodada).
- Jogar-se no chao.
- Largar item.

> Reacoes especiais (bloqueio/esquiva) seguem excecoes da mesa/sistema.`,
  },
  {
    id: 'ferimentos-morte',
    titulo: 'Ferimentos e morte',
    resumoMarkdown: `## PV, 0 PV e Morrendo
- Com PV > 0: age normalmente.
- Metade ou menos dos PV: **Machucado**.
- Em 0 PV: **Inconsciente + Morrendo**.
- Se iniciar 3 turnos Morrendo na mesma cena: morte.

Como encerrar Morrendo:
- Medicina DT 20 (+5 por estabilizacao anterior na cena).
- Efeitos que estabilizam/curam.

## Dano massivo
Quando um unico ataque causa metade ou mais dos PV totais, ocorre teste de Fortitude conforme a regra de dano massivo.

## Dano nao letal
- Soma com letal para cair inconsciente, mas nao para entrar em Morrendo.
- Curas removem primeiro dano nao letal.
- Ataques corpo a corpo podem virar nao letal com penalidade de ataque.`,
  },
  {
    id: 'insanidade-loucura',
    titulo: 'Insanidade e loucura',
    resumoMarkdown: `- Dano mental reduz **SAN**.
- Com menos da metade da SAN total: **Perturbado**.
- Primeira vez por cena em Perturbado: 1 efeito temporario de insanidade.
- Em 0 SAN: **Enlouquecendo**.
- Se iniciar 3 turnos Enlouquecendo na mesma cena: ganha insanidade permanente.

Encerrar Enlouquecendo:
- Diplomacia (Acalmar) DT 20 (+5 por acalmada previa na cena).
- Curar ao menos 1 ponto de SAN.

Pode haver perdas permanentes de SAN por efeitos especificos.`,
  },
  {
    id: 'situacoes-especiais',
    titulo: 'Situacoes especiais',
    resumoMarkdown: `## Camuflagem
- **Leve**: 20% de falha (1-2 em d10).
- **Total**: 50% de falha (1-5 em d10).

## Cobertura
- **Leve**: +5 Defesa.
- **Total**: alvo nao pode ser atacado.

## Modificadores rapidos
- Ofuscado: -1d20 no ataque.
- Alvo caido: Defesa -5 corpo a corpo / +5 distancia.
- Alvo cego: Defesa -5.
- Alvo desprevenido: Defesa -5.
- Camuflagem leve/total e cobertura leve/total conforme acima.`,
  },
  {
    id: 'multidoes',
    titulo: 'Mecanica de multidoes',
    resumoMarkdown: `## Conceito de horda
Horda e tratada como um unico inimigo, com:
- PV totais.
- PV por individuo.
- Individuos atuais (PV total / PV individual).
- Defesa, RD, tamanho e acoes.

## Dano em hordas
### Regra padrao
- Alvo unico: dano em um individuo, overkill perdido.
- Area: dano total na horda; mortos = dano / PV por individuo.

### Regra alternativa
- Alvo unico: dano entra no PV total, overkill mantido.
- Area: afeta cada individuo dentro da area.

## Comportamento
- Tamanho define area ocupada.
- Defesa/RD podem cair conforme baixa de individuos.
- Horda pode usar ataque unico representando varios golpes.`,
  },
  {
    id: 'interludio',
    titulo: 'Mecanica de interludio',
    resumoMarkdown: `Cenas de interludio sao intervalos entre acao/investigacao para descanso, planejamento e recuperacao.

Regras base:
- Mestre define inicio/fim.
- Sem local minimamente seguro, nao ha interludio.
- Cada personagem pode fazer **ate 2 acoes** por interludio.

Acoes do interludio:
- **Alimentar-se** (prato favorito, nutritivo, energetico, rapido).
- **Dormir** (normal, precaria, confortavel, luxuosa).
- **Exercitar-se** (+1d6 para testes fisicos ate fim da missao).
- **Ler** (+1d6 para testes mentais/sociais ate fim da missao).
- **Manutencao** (conserta item).
- **Relaxar** (recupera SAN; bonus coletivo por grupo que relaxa).
- **Revisar caso** (teste para puxar pista complementar de investigacao).
- **Meditar** (aumenta recuperacao de EA em um nivel).`,
  },
  {
    id: 'investigacao',
    titulo: 'Mecanica de investigacao',
    resumoMarkdown: `## Rodadas de investigacao
- Cada cena usa rodadas abstratas.
- Cada personagem faz 1 acao principal por rodada.

## Acoes
- **Procurar pistas**: descreve abordagem e pericia.
- **Facilitar investigacao**: ajuda aliados (+2 no proximo procurar pistas; nao cumulativo).
- **Usar habilidades/itens**: conforme descricao especifica.

## DT sugerida
- 15: simples e coerente.
- 20: plausivel, mas complexa.
- 25+: muito complexa ou abordagem vaga.

## Urgencia
Rodadas disponiveis por urgencia:
- Muito baixo: 6
- Baixo: 5
- Medio: 4
- Alto: 3
- Muito alto: 2`,
  },
  {
    id: 'furtividade',
    titulo: 'Mecanica de furtividade',
    resumoMarkdown: `## Regra simples
Teste oposto: **Furtividade vs Percepcao**.

## Regra avancada (visibilidade)
- Todos comecam em Visibilidade 0.
- Acao comum: +1 visibilidade.
- Acao discreta: +0.
- Acao arriscada/barulhenta: pode subir mais (ex.: +2, criterio do mestre).
- Esconder-se conscientemente pode reduzir visibilidade.

## Acoes especificas
- **Distrair**: Enganacao DT 15; se passar reduz visibilidade (1), se falhar aumenta (1). Uso repetido aumenta DT em +5.
- **Chamar atencao**: +2 visibilidade propria e -1 em aliado proximo.

## Eventos de furtividade
No inicio da rodada rola-se 1d20 para eventos de pressao (aproximacao, busca intensa, etc.).`,
  },
  {
    id: 'perseguicao',
    titulo: 'Mecanica de perseguicao',
    resumoMarkdown: `## Estrutura basica
Perseguicao usa teste estendido:
- Acumular 3 sucessos antes de 3 falhas.
- Cacador vence: alcanca presa.
- Presa vence: escapa.

Pericias:
- A pe: Atletismo.
- Motorizada/montaria: Pilotagem ou Adestramento.

## Acoes especiais
- **Cortar caminho**: -2d20 no teste, mas sucesso vale 2 sucessos.
- **Esforco extra**: +1d20 e dano em PV cumulativo por uso.
- **Criar obstaculo**: reduz DT da rodada em 5 se passar no teste auxiliar.
- **Despistar**: troca Atletismo por Furtividade; sucesso vale 2 sucessos, falha vale 2 falhas.
- **Sacrificio**: falha propria automatica, mas da +1d20 aos aliados.
- **Atrapalhar**: presa atrapalha outra presa (acao anti-heroica, contextual).`,
  },
  {
    id: 'aspectos-congenitos',
    titulo: 'Aspectos congenitos',
    resumoMarkdown: `Aspectos congenitos sao tracos raros e estruturais do personagem.

Categorias:
- **Dons especiais**: talentos inatos sobrenaturais (percepcao de energia, custo/limite de EA, etc.), com custos e restricoes.
- **Restricoes congenitas/celestiais**: perde algo muito relevante em troca de ganhos extremos.

Arquetipos de referencia:
- Corpo fragil com energia amaldicoada poderosa.
- Sem energia amaldicoada com corpo poderoso.

> Aplicacao final depende da mesa e do material completo do capitulo 12.`,
    detalhadoMarkdown: `## Aspectos congenitos

Alguns feiticeiros nascem com aspectos peculiares e raros que nao sao tecnicas amaldicoadas, mas sim caracteristicas fisiologicas e espirituais do corpo e da alma, como os famosos Seis Olhos.

Esses aspectos podem entrar na roleta de sorteio junto com tecnicas inatas ou podem ser simplesmente definidos pelo grupo de forma arbitraria, se o mestre permitir.

Cada aspecto e descrito individualmente e dividido em duas categorias:
- Dons Especiais
- Restricoes Celestiais (ou Congenitas)

## Dons Especiais

Dons Especiais sao caracteristicas unicas gravadas na linhagem ou no individuo, mas que nao funcionam como tecnicas amaldicoadas ativas.

Em vez de conceder novos feiticos, eles alteram como o personagem percebe e manipula energia amaldicoada, e sao inatos e permanentes (nao podem ser "desligados").

### Seis Olhos

**Requisitos:** ser do Cla Gojo ou do Cla Okkotsu.

Olhos especiais que concedem percepcao extrema do fluxo de energia amaldicoada, leitura precisa de tecnicas e eficiencia absurda no gasto de EA, funcionando como um amplificador em vez de uma tecnica ofensiva.

**Beneficios:**
- Recebe +10 em Percepcao.
- Recebe +10 em Reflexos.
- Recebe +6 em Jujutsu.
- Recebe +1 em Presenca.
- Reduz o custo de todas as Tecnicas Amaldicoadas (Inatas e Nao-Inatas) pela metade, nunca abaixo de 1; arredonda para baixo se necessario.

**Desvantagem - Cansaco Mental**

Dependendo da situacao (muita informacao, presenca de maldicoes absurdas, cenas caoticas), o mestre pode pedir um teste de Vontade ou Fortitude.

Se falhar:
- sofre 1d6 de dano de Sanidade.

A DT base sugerida e 35 para tomar metade do dano em caso de sucesso (o mestre pode ajustar conforme o ambiente).

**Mitigando o excesso de percepcao**

O usuario dos Seis Olhos enxerga o fluxo de energia amaldicoada mesmo vendado, entao cobrir a visao nao "desliga" o dom, apenas amortece.

Opcoes sugeridas:

**Oculos muito escuros**
-5 na DT do teste de Cansaco Mental.
-5 em Percepcao.

**Venda completa (sem visao basica)**
-10 na DT do teste de Cansaco Mental.
-8 em Percepcao.

Com os olhos cobertos, o portador pode ser alvo de fintas e manobras de enganacao por oponentes experientes com mais facilidade, sendo possivel trata-lo como Desprevenido em algumas situacoes, a criterio do mestre.

### Receptaculo do Plasma Estelar

**Requisitos:** ser mulher jovem.

Mulheres jovens com o potencial necessario para renovar a tecnica inata da Imortalidade, fundindo-se com o usuario dessa tecnica.

Alguns Receptaculos tem mais potencial do que outros, e podem se comunicar entre si, mesmo que uma delas ja tenha se fundido com o imortal.

O usuario da tecnica de Imortalidade nao pode se comunicar com aquelas que ja se tornaram parte dele; essa comunicacao acontece apenas entre os receptaculos.

(E um aspecto principalmente narrativo, mas pode ser usado como gatilho para votos vinculativos, beneficios de suporte, etc., se voce quiser expandir.)

### Compensacao

**Requisito:** nao receber uma tecnica inata.

O personagem e "compensado" por nao ter tecnica inata, recebendo um reforco direto no crescimento das tecnicas nao-inatas:

Ganha 1 grau de aprimoramento extra nos niveis 4, 10 e 16, para distribuir em tecnicas amaldicoadas (nao-inatas), respeitando os limites normais de grau.

## Restricoes Celestiais (Restricoes Congenitas)

Tambem chamadas de Restricoes Congenitas, sao "votos de nascimento": limitacoes gravadas no corpo que trocam algo fundamental por um beneficio gigantesco em outro ponto.

Diferem de votos vinculativos comuns porque nao foram escolhidas pelo personagem; nasceram com ele.

O sistema resume as Restricoes Celestiais em dois arquetipos principais, cada um com um "caso extremo" sugerido como referencia de poder maximo.

### Arquetipo: Corpo Fragil, Energia Amaldicoada Poderosa

Nesse arquetipo o personagem possui limitacoes fisicas severas, como:
- Pele extremamente sensivel.
- Membros faltando (braco, perna etc.).
- Problemas cardio-respiratorios.
- Outras deficiencias fisicas importantes.

Essas limitacoes podem ser cumulativas (ganho de poder maior) ou apenas algumas (ganho menor). A diferenca de poder entre "algumas limitacoes" e "limitacoes extremas" e gritante.

#### Caso Extremo - Corpo Fragil, EA Poderosa

**Limitacoes:**
- Pele ultra sensivel.
- Membros faltando.
- Corpo tao fragil que mal se mantem em pe (pode exigir cadeiras de rodas, apoio constante, etc.).

**Ganhos:**
- Energia Amaldicoada dobrada (EA maxima x2).
- Limite de EA por rodada aumentado (o quanto pode gastar por turno sobe um patamar, definido com o mestre).
- Atributos de Presenca e Intelecto maiores (valores especificos a combinar na mesa, mas acima da curva normal).
- Pericias de Vontade e Jujutsu, e mais uma pericia baseada em Intelecto ou Presenca a escolha do usuario, recebem +10 cada.
- Outros bonus especificos ligados a Tecnica Inata do personagem (por exemplo, facilitar complexidade, aumentar DT para resistir aos feiticos, ampliar alcance/dano em certas variacoes), discutidos com o mestre caso a caso.

### Arquetipo: Sem Energia Amaldicoada, Corpo Poderoso

Aqui o personagem possui quase nenhuma ou nenhuma EA. Em troca, ganha proezas fisicas absurdas: forca, velocidade, resistencia, reflexos e sentidos muito acima do normal.

Assim como no arquetipo anterior, isso e um espectro: a diferenca entre "quase nenhuma EA" e "zero EA total" e enorme; o caso extremo aqui e literalmente sem EA nenhuma.

#### Caso Extremo - Sem EA, Corpo Poderoso

**Limitacoes:**
- Nenhuma energia amaldicoada.
- Sem tecnicas inatas ou nao-inatas.
- Incapaz de possuir a pericia Jujutsu (nao pode aprender nem usar).

**Ganhos:**
- Atributos de Forca, Agilidade e Vigor maiores (acima da curva, definidos com o mestre).
- Pericias Acrobacia, Atletismo, Luta, Pontaria, Reflexos e Fortitude recebem +10 cada.
- Recebe +1 dado de dano em todas as rolagens de ataque corpo a corpo (por exemplo, 1d8 vira 2d8 antes de considerar criticos).
- Aumenta o tipo de dado dos ataques corpo a corpo em um passo na escala:
  d4 -> d6 -> d8 -> d10 -> d12 -> d16 -> d20.
- Recebe +1 na margem de ameaca de todos os ataques (corpo a corpo e, se o mestre permitir, tambem disparo fisico).
- Deslocamento aumentado em 50% (ex.: 9m vira ~13,5m por acao de movimento; arredondamento a combinar).
- +1 Acao Completa por turno (alem da padrao).
- +1 Reacao especial por turno (pode fazer mais uma reacao alem do limite padrao de reacoes).`,
  },
]

const MESTRE_SHIELD_GUIDES_DETALHADOS: Partial<Record<string, string>> = {
  pericias: `## Lista completa de pericias

| Pericia       | Atributo base | Somente treinada? | Penalidade por carga? | Precisa de kit? |
| ------------- | ------------- | ----------------- | --------------------- | --------------- |
| Acrobacia     | Agilidade     | Nao               | Sim                   | Nao             |
| Adestramento  | Presenca      | Sim               | Nao                   | Nao             |
| Artes         | Presenca      | Sim               | Nao                   | Nao             |
| Atletismo     | Forca         | Nao               | Nao                   | Nao             |
| Atualidades   | Intelecto     | Nao               | Nao                   | Nao             |
| Ciencias      | Intelecto     | Sim               | Nao                   | Nao             |
| Crime         | Agilidade     | Sim               | Sim                   | Sim             |
| Diplomacia    | Presenca      | Nao               | Nao                   | Nao             |
| Enganacao     | Presenca      | Nao               | Nao                   | Sim             |
| Fortitude     | Vigor         | Nao               | Nao                   | Nao             |
| Furtividade   | Agilidade     | Nao               | Sim                   | Nao             |
| Iniciativa    | Agilidade     | Nao               | Nao                   | Nao             |
| Intimidacao   | Presenca      | Nao               | Nao                   | Nao             |
| Intuicao      | Presenca      | Nao               | Nao                   | Nao             |
| Investigacao  | Intelecto     | Nao               | Nao                   | Nao             |
| Luta          | Forca         | Nao               | Nao                   | Nao             |
| Medicina      | Intelecto     | Nao               | Nao                   | Sim             |
| Jujutsu       | Intelecto     | Sim               | Nao                   | Nao             |
| Percepcao     | Presenca      | Nao               | Nao                   | Nao             |
| Pontaria      | Agilidade     | Nao               | Nao                   | Nao             |
| Profissao     | Intelecto     | Sim               | Nao                   | Nao             |
| Reflexos      | Agilidade     | Nao               | Nao                   | Nao             |
| Religiao      | Presenca      | Sim               | Nao                   | Nao             |
| Tatica        | Intelecto     | Sim               | Nao                   | Nao             |
| Tecnologia    | Intelecto     | Sim               | Nao                   | Sim             |
| Sobrevivencia | Intelecto     | Nao               | Nao                   | Nao             |
| Vontade       | Presenca      | Nao               | Nao                   | Nao             |
| Pilotagem     | Agilidade     | Nao               | Nao                   | Nao             |

## Regra de rolagem por atributo base

- O atributo base define a quantidade de d20.
- Exemplo: Pilotagem (base Agilidade).
  - Agilidade 2: rola 2d20, pega o melhor e soma o bonus da pericia.
  - Agilidade 3: rola 3d20, pega o melhor e soma o bonus.
- Para atributo 0 ou negativo:
  - atributo 0: rola 2d20 e pega o pior.
  - atributo -1: rola 3d20 e pega o pior.
  - e assim por diante.

## Observacao operacional

Para NPCs, o valor sugerido pode vir automaticamente do atributo base, mas o mestre pode sobrescrever quantidade de dados e bonus livremente quando for necessario para a narrativa da cena.`,
  condicoes: `## Lista completa de condicoes

- **Abalado**: -1d20 em testes; em novo abalado vira Apavorado (medo).
- **Agarrado**: desprevenido e imovel, -1d20 em ataques, so arma leve; tiros na dupla podem errar alvo (50%).
- **Alquebrado**: custo em PE das habilidades/rituais +1. Condicao mental.
- **Apavorado**: -2d20 em pericias e deve fugir da fonte do medo; nao pode se aproximar voluntariamente.
- **Asfixiado**: sem respirar; apos segurar o folego, testa Fortitude por rodada ou cai inconsciente e perde 1d6 PV por rodada.
- **Atordoado**: desprevenido e sem acoes. Condicao mental.
- **Caido**: no chao; -2d20 em ataques corpo a corpo, deslocamento 1,5m; Defesa -5 contra corpo a corpo e +5 contra distancia.
- **Cego**: desprevenido e lento; sem Percepcao visual; -2d20 em pericias de Forca/Agilidade; alvos com camuflagem total.
- **Confuso**: comportamento aleatorio por d6 no inicio do turno.
- **Debilitado**: -2d20 em Agilidade, Forca e Vigor; se repetir, fica Inconsciente.
- **Desprevenido**: Defesa -5 e -1d20 em Reflexos.
- **Doente**: sob efeito da doenca especifica.
- **Em Chamas**: 1d6 fogo no inicio do turno ate apagar.
- **Enjoado**: so acao padrao ou movimento por rodada.
- **Enlouquecendo**: 3 turnos na mesma cena gera insanidade permanente; pode encerrar com Diplomacia ou cura de SAN.
- **Enredado**: lento, vulneravel e -1d20 em ataques.
- **Envenenado**: efeito varia por veneno.
- **Esmorecido**: -2d20 em Intelecto e Presenca.
- **Exausto**: Debilitado, Lento e Vulneravel; se repetir, Inconsciente.
- **Fascinado**: foco total; -2d20 em Percepcao e nao age alem de observar.
- **Fatigado**: Fraco e Vulneravel; se repetir, Exausto.
- **Fraco**: -1d20 em Agilidade, Forca e Vigor; se repetir, Debilitado.
- **Frustrado**: -1d20 em Intelecto e Presenca; se repetir, Esmorecido.
- **Imovel**: deslocamento 0m.
- **Inconsciente**: indefeso, sem acoes/reacoes.
- **Indefeso**: desprevenido, Defesa -10, falha em Reflexos e pode sofrer golpe de misericordia.
- **Lento**: deslocamentos pela metade, sem correr/investida.
- **Machucado**: metade ou menos dos PV.
- **Morrendo**: com 0 PV; 3 turnos Morrendo na cena = morte.
- **Ofuscado**: -1d20 em ataques e Percepcao.
- **Paralisado**: imovel e indefeso; so acoes mentais.
- **Pasmo**: sem acoes.
- **Perturbado**: primeira vez na cena gera 1 efeito de insanidade (temporaria).
- **Petrificado**: Inconsciente e RD 10.
- **Sangrando**: testa Vigor DT 20 por turno; se falhar perde 1d6 PV.
- **Silenciado**: sem habilidades que exijam fala/encantamento.
- **Surdo**: sem Percepcao auditiva, -2d20 Iniciativa.
- **Surpreendido**: desprevenido e sem agir.
- **Vulneravel**: -2 na Defesa.`,
  'conflito-dominios': `## Regra de conflito de dominios

### Colisao de Dominios - "cabo de guerra"

Quando alguem expande um Dominio diretamente contra outro, o alvo pode reagir expandindo o proprio Dominio como reacao.

Essa reacao tem penalidade no primeiro teste de Jujutsu da disputa:
- -5 no valor total do teste.
- -1d20 (desvantagem) na quantidade de dados rolados.

A disputa e uma corrida de pontos. Em cada rodada, cada lado faz 1 teste de Jujutsu e compara os resultados:
- Diferenca 0: ninguem ganha ponto.
- Vitoria por ate 5 pontos: +1 ponto.
- Vitoria por ate 10 pontos: +2 pontos.
- Vitoria por 11+ pontos: +3 pontos.

A disputa continua ate que um dos dominios abra 3 pontos de vantagem e subjuga o adversario.

Enquanto nao houver vencedor (ou ate um Dominio ser desfeito voluntariamente):
- as barreiras continuam existindo;
- o Acerto Garantido de ambos e anulado na zona de disputa (as tecnicas nao acertam automaticamente).

### Expandir um Dominio dentro de outro

Um feiticeiro preso num Dominio hostil pode tentar expandir o proprio Dominio de dentro. Ao fazer isso, escolhe:

#### 1) Abrir um buraco de fuga

- Rola dois testes de Jujutsu contra o oponente.
- Se em nenhum deles perder por 10+ pontos, abre uma fenda na borda do Dominio inimigo.
- A fenda permite que 1 criatura por rodada atravesse, criando rota de fuga.
- Enquanto o buraco existir, o Acerto Garantido do Dominio inimigo e anulado.

#### 2) Iniciar um novo cabo de guerra

- Comeca uma disputa de Dominios usando as mesmas regras de Colisao.
- O primeiro teste de Jujutsu de quem reagiu de dentro entra com desvantagem (-1d20), por estar reagindo preso no Dominio inimigo.`,
  'primeira-expansao': `## Regra de primeira expansao de dominios

### Primeira expansao de Dominio (preparada)

A primeira vez que um personagem expande um Dominio deve ser tratada como momento-chave da campanha.

Antes da sessao, mestre e jogador definem:
- forma, estetica e paisagem mental do Dominio;
- tipo principal (letal, aperfeicoador, restritivo ou combinacao);
- custos base em EA/PE para abrir e sustentar, dentro das faixas do capitulo de barreiras.

O mestre pode pedir varios testes durante criacao e refinamento, por exemplo:
- Ciencias;
- Vontade;
- Tatica;
- Intuicao;
- Jujutsu.

Se a cena envolver ritual, planejamento ou ajuda de outros personagens, o recomendado e usar testes unidos para representar esforco conjunto.

### Epifania e Dominio em combate

Em casos raros, o feiticeiro pode ter uma epifania em combate e tentar expandir um Dominio cru, sem ritual previo.

Usa-se uma Rolagem de Epifania:
- teste cru, sem bonus especiais alem do que o mestre permitir;
- DT inicial sugerida: 20;
- a cada falha, a DT diminui em 1 ate conseguir ou ate a cena acabar.

Limitacoes mecanicas de um Dominio por epifania:
- penalidade de -2d20 no teste de Jujutsu da expansao (controle precario);
- custo extra em EA/PE definido pelo mestre, alem do custo base da expansao;
- efeitos dentro do Dominio mais simples/reduzidos em comparacao a um Dominio refinado.`,
  dificuldades: `## Tabela guia de dificuldades

| Tarefa | DT | Exemplo |
| --- | --- | --- |
| Facil | 5 | Escutar conversa atras da porta (Percepcao) |
| Media | 10 | Subir um barranco (Atletismo) |
| Dificil | 15 | Montar acampamento no campo (Sobrevivencia) |
| Muito dificil | 20 | Estancar sangramento fatal (Medicina) |
| Formidavel | 25 | Hackear servidor (Tecnologia) |
| Heroica | 30 | Decifrar maldicao antiga (Jujutsu) |
| Quase impossivel | 35 | Convencer inimigo a te proteger (Diplomacia) |
| Apenas o honrado | 40 | Evitar habilidade de maldicao de divindade (Vontade) |

Observacao: em tarefas triviais, o recomendado e nao pedir rolagem.`,
  'teste-unido': `## Regra de testes com varias pericias (teste unido)

Quando uma unica acao depende claramente de duas ou mais pericias ao mesmo tempo, usa-se teste unido.

Passo a passo:

1. Para cada pericia envolvida, veja quantos d20 o personagem rolaria (pelo atributo base).
2. Some esses numeros de dados, divida pela quantidade de pericias e arredonde para baixo.
3. Repita o processo para os bonus das pericias (soma, divide, arredonda para baixo).
4. Rola-se um unico teste com esse pool medio e bonus medio.

Esse unico resultado e comparado com a DT definida pelo mestre ou pela tecnica (ex.: acao que mistura Jujutsu + Pontaria).

Observacoes:
- essa e a regra unica de rolagem unica envolvendo varias pericias ao mesmo tempo;
- testes estendidos continuam existindo para varias rolagens em etapas, mas sao outro fluxo.`,
  'tipos-dano': `## Tipos de dano

- **Balistico**: projeteis de armas de fogo e similares.
- **Corte**: laminas, garras e armas cortantes.
- **Eletricidade**: choques, raios e efeitos eletricos.
- **Fogo**: calor e chamas naturais ou jujutsu.
- **Frio**: gelo, congelamento e clima severo.
- **Impacto**: contusao, socos, explosoes e quedas.
- **Mental**: dano psiquico; normalmente afeta SAN.
- **Amaldicoado/Jujutsu**: tecnicas, espiritos e itens amaldicoados.
- **Perfuracao**: objetos pontiagudos.
- **Quimico**: acidos, toxinas e compostos corrosivos.

O tipo de dano e base para resistencias, vulnerabilidades e efeitos que citam dano especifico.`,
  'tipos-acoes': `## Tipos de acoes

### Acoes padrao

- **Agredir**: ataque com arma corpo a corpo ou a distancia.
  - Corpo a corpo: ataca alvos adjacentes (1,5m).
  - Distancia: alvo dentro do alcance da arma (ou ate o dobro, com -5 no ataque).
  - Atirando em combate corpo a corpo: se atacar a distancia um alvo engajado, sofre -1d20 no teste.
- **Manobra de combate**: ataque corpo a corpo especial (nao pode ser a distancia), com teste oposto.
  - Manobras listadas: Agarrar, Quebrar, Atropelar.
- **Conjurar encantamento**: maioria usa acao padrao.
- **Fintar**: Enganacao oposta a Reflexos de alvo em alcance curto; se passar, alvo fica desprevenido contra seu proximo ataque ate fim do proximo turno.
- **Preparar**: declara acao + gatilho; executa como reacao antes do proximo turno quando gatilho ocorrer.
- **Usar habilidade ou item**: qualquer descricao que diga "acao padrao".

### Atropelar (especial)

Pode ser usado durante movimento para atravessar espaco de criatura.
- Se alvo der passagem, atravessa sem teste.
- Se resistir, faz teste oposto:
  - se vencer: alvo fica caido e voce continua;
  - se perder: alvo bloqueia passagem.
- Tambem pode ser tentado como acao livre durante investida.

### Acoes de movimento

- Levantar-se.
- Manipular item.
- Mirar:
  - remove penalidade de -1d20 em Pontaria contra alvo engajado em corpo a corpo ate o fim do proximo turno;
  - exige treinamento em Pontaria.
- Movimentar-se.
- Sacar/guardar item.

### Acoes completas

- **Corrida**.
- **Golpe de misericordia**:
  - alvo adjacente e indefeso;
  - acerto critico automatico;
  - chance de morte instantanea conforme importancia do alvo.
- **Investida**:
  - move ate o dobro do deslocamento em linha reta e ataca no final;
  - +1d20 no ataque e -5 na Defesa ate o proximo turno;
  - nao pode em terreno dificil.
- **Conjuracao longa**: acao completa por rodada de conjuracao.

### Acoes livres

- Atrasar.
- Falar (regra sugerida: ate 20 palavras por rodada).
- Jogar-se no chao.
- Largar item.

Observacao: reacoes especiais (bloqueio/esquiva e afins) seguem excecoes da regra geral.`,
  'ferimentos-morte': `## Ferimentos e morte

### PV, 0 PV e Morrendo

- Enquanto PV > 0, personagem age normalmente.
- Ao chegar na metade ou menos dos PV totais, entra em Machucado.
- Ao ser reduzido a 0 PV:
  - ganha Inconsciente e Morrendo;
  - se iniciar 3 turnos Morrendo na mesma cena, morre.

Encerrar Morrendo:
- Medicina DT 20, com +5 na DT para cada vez que ja foi estabilizado na mesma cena;
- habilidades/efeitos especificos que estabilizam ou curam.

Inconsciente termina ao recuperar ao menos 1 PV.

### Dano massivo

Quando um unico ataque causa pelo menos metade dos PV totais, ocorre teste de Fortitude conforme regra de dano massivo.

Em falha, aplica-se tabela de consequencias (a mesa usa a tabela oficial em vigor).

### Dano nao letal

- Dano nao letal soma com letal apenas para decidir quando cai inconsciente.
- Dano nao letal nao conta para entrar em Morrendo.
- Curas removem primeiro dano nao letal.
- Ataques corpo a corpo podem causar dano nao letal com penalidade de -5 no ataque.
- Ataques desarmados e algumas armas sao naturalmente nao letais, mas podem ser letais com -5 no ataque.`,
  'insanidade-loucura': `## Insanidade e loucura

- Dano mental reduz SAN em vez de PV.
- Com menos da metade da SAN total: personagem fica Perturbado.
- Primeira vez por cena em Perturbado: recebe efeito temporario de insanidade.
- Em 0 SAN: personagem entra em Enlouquecendo.
- Se iniciar 3 turnos Enlouquecendo na mesma cena: ganha insanidade permanente.

Encerrar Enlouquecendo:
- Diplomacia (Acalmar) DT 20, com +5 por acalmada previa na cena.
- qualquer efeito que cure ao menos 1 SAN.

Observacao: certas perdas de SAN podem ser permanentes, conforme efeito/narrativa.`,
  'situacoes-especiais': `## Situacoes especiais

### Camuflagem

- **Camuflagem leve**:
  - ataques contra o alvo tem 20% de falha;
  - rola-se 1d10 junto com o d20; em 1-2, ataque erra independentemente do teste.
- **Camuflagem total**:
  - ataques contra o alvo tem 50% de falha;
  - erro em 1-5 no d10.

### Cobertura

- **Cobertura leve**: +5 na Defesa.
- **Cobertura total**: alvo nao pode ser atacado.

### Tabela de modificadores rapidos

- Ofuscado: atacante sofre -1d20 no ataque.
- Alvo caido: Defesa -5 contra corpo a corpo e +5 contra distancia.
- Alvo cego: Defesa -5.
- Alvo desprevenido: Defesa -5.
- Camuflagem leve/total e cobertura leve/total conforme regras acima.`,
  multidoes: `## Mecanica de multidoes

### Conceito de horda

Uma Horda e tratada como um unico inimigo, representando varios individuos.

A Horda tem:
- PV totais;
- PV por individuo;
- individuos atuais (PV totais / PV por individuo, arredondando para baixo);
- Defesa;
- RD;
- tamanho (normalmente Grande ou maior);
- habilidades/ataques por rodada.

### Dano e mortes na multidao

#### Regra padrao (combate mais duradouro)

- Ataques de alvo unico:
  - causam dano apenas ao individuo atingido;
  - overkill e perdido.
- Ataques de area:
  - causam dano total na Horda;
  - individuos mortos = dano causado / PV por individuo (arredonda para baixo).

Acertos criticos multiplicam dano normalmente.

Pode-se ignorar dano massivo individual; opcionalmente, se um ataque causar >= metade dos PV totais da Horda, ela pode testar Fortitude para nao se dispersar.

#### Regra alternativa (combate mais dinamico)

- Ataques de alvo unico:
  - causam dano nos PV totais da Horda;
  - overkill e mantido.
- Ataques de area:
  - afetam cada individuo dentro da area.

### Comportamento e tamanho

- Tamanho tipico sugerido:
  - pequena: 2x2 quadrados;
  - media: 3x3;
  - grande: 4x4 ou mais.
- Em vez de usar muitos modificadores de tamanho, pode-se reduzir Defesa/RD conforme baixa de individuos.

### Ataques da Horda

- Horda faz um unico teste de ataque por rodada, representando varios golpes.
- O dano pode escalar com numero de individuos e pode ser distribuido entre varios alvos.
- Tecnicas de area, Dominios e granadas aplicam dano conforme a regra escolhida (padrao ou alternativa).`,
  interludio: `## Cenas de interludio

Momentos de paz sao raros na vida de um feiticeiro jujutsu, mas existem. As cenas sem combate/investigacao ativa sao interludios.

Servem para:
- descansar;
- acalmar os animos;
- revisar pistas;
- planejar proximos passos.

Regras base:
- mestre define inicio e fim;
- requer local minimamente seguro (ao relento, sem estrutura, nao ha interludio);
- forcar muitos interludios pode aumentar urgencia futura, a criterio do mestre;
- cada personagem pode realizar ate 2 acoes no interludio.

### Acoes de interludio

#### Alimentar-se

Escolha um prato e ganhe efeito:
- **Prato Favorito**: se tambem Relaxar, recupera +2 SAN adicional.
- **Prato Nutritivo**: se tambem Dormir, melhora recuperacao de PV em um nivel.
- **Prato Energetico**: se tambem Dormir, melhora recuperacao de PE em um nivel.
- **Prato Rapido**: se tambem Revisar Caso, recebe +5 no teste.

Um personagem so se beneficia de 1 refeicao por interludio, e precisa de acesso plausivel a refeicao.

#### Dormir

Recupera PV, PE e EA conforme condicao de descanso:
- **Precaria**: metade.
- **Normal**: valor base.
- **Confortavel**: dobro.
- **Luxuosa**: triplo.

So pode dormir 1 vez por interludio.

#### Exercitar-se

Ganha +1d6 em um teste baseado em Agilidade, Forca ou Vigor ate o fim da missao.
- acumulo maximo: Vigor;
- uso: 1 bonus por teste.

#### Ler

Ganha +1d6 em um teste baseado em Intelecto ou Presenca ate o fim da missao.
- acumulo maximo: Intelecto;
- uso: 1 bonus por teste.

#### Manutencao

Conserta item quebrado, restaurando status/PV do item.

#### Relaxar

Recupera SAN como Dormir recupera PV/PE/EA.

Bonus coletivo:
- para cada personagem que tambem Relaxar no mesmo interludio, todos participantes de Relaxar recuperam +1 SAN adicional.

So pode Relaxar 1 vez por interludio.

#### Revisar Caso

Escolha uma cena de investigacao ja ocorrida, descreva abordagem e faca um teste de pericia adequado.

Se passar:
- recebe pista complementar perdida daquela cena;
- se nao houver mais pistas complementares, o mestre confirma cena esgotada.

Pode repetir Revisar Caso no mesmo interludio (criterio do mestre).

#### Meditar

Aumenta recuperacao de EA em um nivel.
- normalmente e combinada com Dormir no mesmo interludio.`,
  investigacao: `## Mecanica de investigacao

### Rodadas de investigacao

Cada cena de investigacao e dividida em rodadas abstratas (minutos, horas ou escala narrativa).

Em cada rodada, cada personagem escolhe 1 acao principal; quando todos agem, rodada termina.

### Acoes em investigacao

#### Procurar Pistas

Jogador escolhe uma pericia e descreve a abordagem (ex.: Diplomacia para testemunha, Tecnologia para logs, Percepcao para varredura visual).

DT sugerida:
- 15: acao simples e adequada;
- 20: plausivel, mas complexa;
- 25+: muito complexa ou abordagem vaga.

Mestre decide se a acao tem chance real de gerar pista.

#### Facilitar Investigacao

Em vez de buscar pista direto, personagem melhora o contexto para aliados (organizar documentos, melhorar iluminacao, isolar local etc.).

Se passar no teste:
- cada aliado recebe +2 no proximo teste de Procurar Pistas da cena;
- bonus nao cumulativo.

#### Usar Habilidades e Itens

Recursos que tenham descricao especifica para investigacao aplicam conforme seu texto.

### Urgencia da investigacao

Cada cena pode ter grau de urgencia com numero maximo de rodadas:
- Muito baixo: 6
- Baixo: 5
- Medio: 4
- Alto: 3
- Muito alto: 2

Ao esgotar tempo, mestre aplica consequencias (inimigo mais forte, reforco, perda de descanso, agravamento da situacao etc.).`,
  furtividade: `## Mecanica de furtividade

### Regra simples

Para cenas de baixa complexidade:
- teste oposto de Furtividade (personagem) vs Percepcao (algoz).

### Regra avancada - Visibilidade

Visibilidade mede o quao perto de ser detectado o personagem esta.

Base:
- todos comecam com Visibilidade 0.

Ajustes usuais:
- acao comum: +1 visibilidade;
- acao discreta: +0;
- acao arriscada/barulhenta: tende a subir mais (ex.: +2), a criterio do mestre;
- esconder-se conscientemente pode reduzir visibilidade (normalmente com teste de Furtividade).

Mestre pode monitorar visibilidade de grupo para deteccao coletiva.

### Acoes especificas

#### Distrair

Teste de Enganacao DT 15:
- sucesso: reduz visibilidade em 1 (propria ou de aliado);
- falha: aumenta visibilidade em 1.

Limites:
- apenas 1 personagem pode usar essa acao por rodada;
- cada uso adicional na mesma cena aumenta DT em +5.

#### Chamar Atencao

Personagem puxa foco para proteger aliado:
- +2 visibilidade propria;
- -1 visibilidade de um aliado proximo.

### Eventos de furtividade

No inicio de cada rodada, alguem rola 1d20 e mestre aplica evento de pressao (aproximacao extrema, busca implacavel, deslocamento agressivo do algoz, etc.).`,
  perseguicao: `## Mecanica de perseguicao

### Estrutura basica

Perseguicoes usam teste estendido:
- cada personagem precisa acumular 3 sucessos antes de 3 falhas.
- cacador que vence alcanca a presa.
- presa que vence escapa.

Pericia principal:
- a pe: Atletismo.
- motorizada/montaria: Pilotagem ou Adestramento.

DT e definida pelo mestre conforme vantagem de velocidade e contexto.

### Acoes especiais em perseguicao

#### Cortar Caminho

- sofre -2d20 no teste de Atletismo;
- se passar, ganha 2 sucessos.

Mestre pode vetar se nao houver rota plausivel.

#### Esforco Extra

- recebe +1d20 no teste de Atletismo;
- sofre dano em PV cumulativo por uso na cena.

#### Criar Obstaculo (presa)

- sofre -1d20 no proprio teste;
- realiza teste auxiliar (Forca ou pericia adequada).
- se passar, reduz DT do Atletismo da rodada em 5 para todos.

Apenas 1 personagem por rodada pode usar.

#### Despistar (presa)

- exige ao menos 1 sucesso acumulado;
- troca teste de Atletismo por Furtividade;
- se passar: ganha 2 sucessos;
- se falhar: recebe 2 falhas.

#### Sacrificio

- falha automaticamente no proprio teste;
- concede +1d20 aos testes dos aliados.

#### Atrapalhar (presa vs presa)

- usada para sabotar outra presa;
- sofre -1d20 no proprio teste;
- faz teste oposto para impor penalidade ao alvo.

E uma acao anti-heroica e situacional.

### Opcoes avancadas

- testes opostos em vez de DT fixa;
- eventos de perseguicao por tabela (piso escorregadio, multidao, entulho, atalho, porta trancada etc.).`,
}

for (const secao of MESTRE_SHIELD_GUIDES) {
  if (!secao.detalhadoMarkdown) {
    const detalhado = MESTRE_SHIELD_GUIDES_DETALHADOS[secao.id]
    if (detalhado) {
      secao.detalhadoMarkdown = detalhado
    }
  }
}

