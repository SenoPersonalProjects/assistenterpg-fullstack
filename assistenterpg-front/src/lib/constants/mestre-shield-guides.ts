export type MestreShieldGuideSection = {
  id: string;
  titulo: string;
  conteudoMarkdown: string;
};

export const MESTRE_SHIELD_GUIDES: MestreShieldGuideSection[] = [
  {
    id: 'pericias',
    titulo: 'Lista completa de pericias',
    conteudoMarkdown: `| Pericia       | Atributo base | Somente treinada? | Penalidade por carga? | Precisa de kit? |
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
    conteudoMarkdown: `- **Abalado**: -1d20 em testes; em novo abalado vira Apavorado (medo).
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
    conteudoMarkdown: `## Colisao de dominios (cabo de guerra)

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
    conteudoMarkdown: `## Primeira expansao (preparada)

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
    conteudoMarkdown: `| Tarefa | DT | Exemplo |
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
    conteudoMarkdown: `Quando uma unica acao depende de varias pericias ao mesmo tempo, use **teste unido**.

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
    conteudoMarkdown: `- Balistico
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
    conteudoMarkdown: `## Acoes padrao
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
    conteudoMarkdown: `## PV, 0 PV e Morrendo
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
    conteudoMarkdown: `- Dano mental reduz **SAN**.
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
    conteudoMarkdown: `## Camuflagem
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
    conteudoMarkdown: `## Conceito de horda
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
    conteudoMarkdown: `Cenas de interludio sao intervalos entre acao/investigacao para descanso, planejamento e recuperacao.

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
    conteudoMarkdown: `## Rodadas de investigacao
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
    conteudoMarkdown: `## Regra simples
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
    conteudoMarkdown: `## Estrutura basica
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
    conteudoMarkdown: `Aspectos congenitos sao tracos raros e estruturais do personagem.

Categorias:
- **Dons especiais**: talentos inatos sobrenaturais (percepcao de energia, custo/limite de EA, etc.), com custos e restricoes.
- **Restricoes congenitas/celestiais**: perde algo muito relevante em troca de ganhos extremos.

Arquetipos de referencia:
- Corpo fragil com energia amaldicoada poderosa.
- Sem energia amaldicoada com corpo poderoso.

> Aplicacao final depende da mesa e do material completo do capitulo 12.`,
  },
]
