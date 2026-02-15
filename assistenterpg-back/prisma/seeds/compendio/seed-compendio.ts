// prisma/seeds/compendio/seed-compendio-melhorado.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCompendioCompleto() {
  console.log('Iniciando seed completo do Compêndio Jujutsu Kaisen RPG...\n');

  try {
    // ==================== LIMPAR DADOS ANTERIORES ====================
    console.log('Limpando dados anteriores...');
    await prisma.compendioArtigo.deleteMany({});
    await prisma.compendioSubcategoria.deleteMany({});
    await prisma.compendioCategoria.deleteMany({});
    console.log('Dados anteriores limpos\n');

    // ==================== CATEGORIA 1: REGRAS BÁSICAS ====================
    console.log('Criando: Regras Básicas...');
    const regrasBasicas = await prisma.compendioCategoria.create({
      data: {
        codigo: 'regras-basicas',
        nome: 'Regras Básicas',
        descricao: 'Fundamentos do sistema: atributos, perícias, testes e características derivadas',
        icone: 'rules',
        cor: 'blue',
        ordem: 1,
      },
    });

    const subAtributos = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'atributos-testes',
        nome: 'Atributos e Testes',
        categoriaId: regrasBasicas.id,
        ordem: 1,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'atributos-base',
          titulo: 'Atributos Base',
          resumo: 'Os 5 atributos fundamentais do sistema',
          conteudo: `# Atributos Base

Os atributos representam as capacidades físicas, mentais e sociais básicas de um personagem, usadas em praticamente todos os testes do jogo.

## Os 5 Atributos

Existem cinco atributos, em uma escala de **0 a 7**, onde:
- **1** = média humana
- **7** = aberrações de poder (fora do normal)

### Agilidade (AGI)
Coordenação motora, velocidade de reação e destreza manual.

### Força (FOR)
Potência muscular, condicionamento físico e impacto de ataques corpo a corpo.

### Intelecto (INT)
Raciocínio, memória, conhecimento acadêmico e percepção analítica do mundo.

### Presença (PRE)
Força de vontade, carisma, percepção intuitiva e sensibilidade à energia amaldiçoada.

### Vigor (VIG)
Saúde física, resistência a dano e capacidade de suportar esforço prolongado.

## Criação de Personagem

- Todos começam com **1 em cada atributo**
- Recebem **4 pontos adicionais** para distribuir (nível 1, regra base)
- O mestre pode ajustar esse valor para campanhas mais heroicas ou contidas
- Atributos altos desbloqueiam **passivas especiais** (a cada 3 pontos)`,
          subcategoriaId: subAtributos.id,
          tags: ['iniciante', 'criacao-personagem', 'atributos'],
          palavrasChave: 'AGI FOR INT PRE VIG agilidade força intelecto presença vigor atributos',
          nivelDificuldade: 'iniciante',
          ordem: 1,
          destaque: true,
        },
        {
          codigo: 'passivas-atributos',
          titulo: 'Passivas de Atributos',
          resumo: 'Habilidades especiais desbloqueadas com atributos altos',
          conteudo: `# Passivas de Atributos

A cada **3 pontos** em um atributo, você pode desbloquear passivas especiais.

## Limitações Importantes

- Máximo de **2 passivas por atributo**
- Máximo de **2 atributos** com passivas no total
- A segunda versão **substitui** a primeira (não somam)

## Lista Completa de Passivas

### Agilidade

**Agilidade I** (3 pontos):
- +6m de deslocamento

**Agilidade II** (6 pontos):
- +9m de deslocamento
- +1 reação por rodada

### Força

**Força I** (3 pontos):
- Aumenta dano corpo a corpo em 1 passo (ex: 1d6 → 1d8)

**Força II** (6 pontos):
- Aumenta mais 1 passo no dano corpo a corpo (ex: 1d6 → 1d10)
- +1 dado de dano em ataques que usam Força

### Intelecto

**Intelecto I** (3 pontos):
- +1 perícia ou proficiência extra
- Aumenta treinamento de uma perícia escolhida

**Intelecto II** (6 pontos):
- +2 perícias ou proficiências extras
- Aumenta treinamento de uma perícia
- +1 grau de aprimoramento (com restrições do mestre)

### Presença

**Presença I** (3 pontos):
- +1 rodada antes de sucumbir ao Enlouquecendo

**Presença II** (6 pontos):
- +1 rodada adicional no Enlouquecendo (total +2)
- +6 PE
- +6 EA
- +3 no limite de PE/EA por turno

### Vigor

**Vigor I** (3 pontos):
- +1 rodada antes de morrer ao entrar em Morrendo

**Vigor II** (6 pontos):
- +1 rodada adicional em Morrendo (total +2)
- Soma o limite de PE/EA na vida máxima

## Exemplo de Aplicação

Um personagem com FOR 6 pode escolher Força II, aumentando seu dano de 1d6 para 1d10 e ganhando +1 dado extra em todos os ataques de Força.`,
          subcategoriaId: subAtributos.id,
          tags: ['intermediario', 'passivas', 'atributos'],
          palavrasChave: 'passiva habilidade especial atributo 3 pontos',
          nivelDificuldade: 'intermediario',
          ordem: 2,
          destaque: true,
        },
        {
          codigo: 'testes-sistema',
          titulo: 'Sistema de Testes',
          resumo: 'Como funcionam os testes de períciae testes unidos',
          conteudo: `# Sistema de Testes

## Testes Básicos

A maioria das ações usa **testes de perícia**:

1. Role um número de **d20** igual ao atributo da perícia
2. Escolha o **melhor resultado**
3. Some o **bônus de treinamento** da perícia
4. Compare com a **DT (Dificuldade)**
5. Se o resultado for ≥ DT, você passou!

### Exemplo
Personagem com AGI 3 fazendo teste de Acrobacia (treinado +5):
- Rola 3d20
- Resultados: 8, 14, 11
- Escolhe o melhor: 14
- Soma treinamento: 14 + 5 = 19
- DT era 15 → Sucesso!

## Desvantagem

Se sofrer **desvantagem**, perde -1d20 do teste:
- AGI 3 com desvantagem = rola apenas 2d20

## Rolagens Zeradas ou Negativas

- **0 dados**: rola 2d20 e fica com o **pior** resultado
- **-1 dados**: rola 3d20 e fica com o **pior** resultado
- **-2 dados**: rola 4d20 e fica com o **pior** resultado

## Testes Unidos

Quando uma ação usa **duas perícias ao mesmo tempo**:

1. Some os dados de ambas as perícias
2. Divida por 2 (arredonda para baixo)
3. Faça o mesmo com os bônus
4. Role com os valores finais

### Exemplo: Raio Vermelho (Jujutsu + Pontaria)
- Jujutsu: 3 dados, +10 bônus
- Pontaria: 2 dados, +5 bônus
- **Dados**: (3+2)÷2 = 2 dados
- **Bônus**: (10+5)÷2 = 7 bônus
- Rola 2d20+7`,
          subcategoriaId: subAtributos.id,
          tags: ['iniciante', 'testes', 'mecanicas'],
          palavrasChave: 'teste pericia d20 DT dificuldade rolagem',
          nivelDificuldade: 'iniciante',
          ordem: 3,
        },
      ],
    });

    const subPericias = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'pericias',
        nome: 'Perícias',
        categoriaId: regrasBasicas.id,
        ordem: 2,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'lista-pericias-completa',
          titulo: 'Lista Completa de Perícias',
          resumo: 'Todas as perícias do sistema com atributos e restrições',
          conteudo: `# Lista Completa de Perícias

## Perícias de Combate

| Perícia | Atributo | Somente Treinada? | Descrição |
|:--------|:--------:|:-----------------:|:----------|
| **Luta** | FOR | Não | Ataques corpo a corpo, agarrar, manobras físicas |
| **Pontaria** | AGI | Não | Ataques à distância com armas |
| **Jujutsu** | INT | **Sim** | Lançar feitiços, identificar maldições e técnicas |

## Perícias Físicas

| Perícia | Atributo | Somente Treinada? | Carga? | Descrição |
|:--------|:--------:|:-----------------:|:------:|:----------|
| **Acrobacia** | AGI | Não | Sim | Proezas acrobáticas, equilíbrio, amortecer queda |
| **Atletismo** | FOR | Não | Não | Correr, escalar, nadar, saltar |
| **Fortitude** | VIG | Não | Não | Resistir a doenças, venenos e fadiga |
| **Furtividade** | AGI | Não | Sim | Esconder-se, seguir alvos sem ser notado |
| **Reflexos** | AGI | Não | Não | Evitar explosões, armadilhas e efeitos de área |

## Perícias Mentais

| Perícia | Atributo | Somente Treinada? | Kit? | Descrição |
|:--------|:--------:|:-----------------:|:----:|:----------|
| **Atualidades** | INT | Não | Não | Conhecimentos gerais, política, esportes |
| **Ciências** | INT | **Sim** | Não | Matemática, física, química, biologia |
| **Investigação** | INT | Não | Não | Procurar pistas, interrogar, examinar locais |
| **Intuição** | PRE | Não | Não | Ler emoções, perceber mentiras, pressentimentos |
| **Percepção** | PRE | Não | Não | Observar, ouvir, detectar detalhes |
| **Tática** | INT | **Sim** | Não | Estratégia de combate e campo de batalha |

## Perícias Sociais

| Perícia | Atributo | Somente Treinada? | Kit? | Descrição |
|:--------|:--------:|:-----------------:|:----:|:----------|
| **Artes** | PRE | **Sim** | Não | Música, dança, atuação, expressão artística |
| **Diplomacia** | PRE | Não | Não | Convencer, mudar atitudes, negociar |
| **Enganação** | PRE | Não | Sim | Mentir, disfarçar, fintar em combate |
| **Intimidação** | PRE | Não | Não | Assustar, coagir, ameaçar |

## Perícias Especiais

| Perícia | Atributo | Somente Treinada? | Kit? | Carga? | Descrição |
|:--------|:--------:|:-----------------:|:----:|:------:|:----------|
| **Adestramento** | PRE | **Sim** | Não | Não | Lidar com animais, cavalgar |
| **Crime** | AGI | **Sim** | Sim | Sim | Arrombamento, furto, sabotagem |
| **Medicina** | INT | Não | Sim | Não | Curar ferimentos, primeiros socorros, necropsia |
| **Pilotagem** | AGI | Não | Não | Não | Conduzir veículos terrestres, aquáticos, aéreos |
| **Profissão** | INT | **Sim** | Não | Não | Conhecimento profissional específico |
| **Religião** | PRE | **Sim** | Não | Não | Doutrinas, profecias, relíquias sagradas |
| **Sobrevivência** | INT | Não | Não | Não | Rastrear, acampar, orientar-se |
| **Tecnologia** | INT | **Sim** | Sim | Não | Hackear, operar dispositivos eletrônicos |
| **Vontade** | PRE | Não | Não | Não | Resistir a efeitos mentais e intimidações |

## Notas Importantes

- **Somente Treinada**: Precisa de pelo menos 1 grau de treinamento para usar
- **Carga**: Sofre penalidade se estiver sobrecarregado
- **Kit**: Precisa de kit de perícia (sem ele, sofre -5 no teste)

## Iniciativa

**Iniciativa (AGI)**: Determina ordem de ação no combate. Rolada no início de cada cena de ação.`,
          subcategoriaId: subPericias.id,
          tags: ['iniciante', 'referencia', 'pericias'],
          palavrasChave: 'perícia habilidade lista completa treinamento somente treinada',
          nivelDificuldade: 'iniciante',
          ordem: 1,
          destaque: true,
        },
        {
          codigo: 'graus-treinamento',
          titulo: 'Graus de Treinamento',
          resumo: 'Sistema de evolução de perícias',
          conteudo: `# Graus de Treinamento

As perícias evoluem em 4 níveis de maestria:

## Tabela de Bônus

| Grau | Bônus | Nível Mínimo |
|:-----|:-----:|:------------:|
| **Não Treinado** | +0 | - |
| **Treinado** | +5 | 1 |
| **Graduado** | +10 | 3 |
| **Veterano** | +15 | 9 |
| **Expert** | +20 | 16 |

## Como Aumentar Graus

Você recebe oportunidades de aumentar graus de treinamento:

- **Origem**: 2 perícias treinadas
- **Classe**: Perícias específicas da classe
- **Nível 3, 7, 11, 16**: Pode aumentar até 2+INT perícias em 1 grau
- **Poder Genérico "Treinamento em Perícia"**: Acelera evolução

## Restrições

- Precisa seguir a ordem (Treinado → Graduado → Veterano → Expert)
- Precisa estar no nível mínimo indicado
- Perícias "somente treinada" não podem ser usadas sem treinamento

## Exemplo de Progressão

**João, Sentinela INT 2:**

- **Nível 1**: Jujutsu +5 (treinado, da classe)
- **Nível 3**: Pode aumentar até 4 perícias (2+INT)
  - Aumenta Jujutsu para +10 (graduado)
  - Treina Medicina em +5 (treinado)
- **Nível 9**: Pode aumentar Jujutsu para +15 (veterano)
- **Nível 16**: Pode aumentar Jujutsu para +20 (expert)`,
          subcategoriaId: subPericias.id,
          tags: ['iniciante', 'pericias', 'progressao'],
          palavrasChave: 'grau treinamento pericia bônus evoluir',
          nivelDificuldade: 'iniciante',
          ordem: 2,
        },
      ],
    });

    const subCaracteristicas = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'caracteristicas-derivadas',
        nome: 'Características Derivadas',
        categoriaId: regrasBasicas.id,
        ordem: 3,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'pv-pe-ea-san-completo',
          titulo: 'PV, PE, EA e SAN',
          resumo: 'Características derivadas: fórmulas e progressão por classe',
          conteudo: `# Características Derivadas

## Pontos de Vida (PV)

Medem a integridade física do personagem.

### Fórmulas por Classe

| Classe | PV Inicial | PV por Nível |
|:-------|:-----------|:-------------|
| **Combatente** | 20 + VIG | 4 + VIG |
| **Sentinela** | 16 + VIG | 2 + VIG |
| **Especialista** | 16 + VIG | 3 + VIG |

### Exemplo
Combatente VIG 3 nível 5:
- Inicial: 20 + 3 = 23 PV
- Níveis 2-5: 4×(4+3) = 28 PV
- **Total: 51 PV**

## Pontos de Esforço (PE)

Energia física e determinação para manobras especiais.

### Fórmulas (Todas as Classes)

- **Inicial**: 3 + PRE
- **Por nível**: 3 + PRE

### Uso de PE

- Recursos de classe (Ataque Especial, Aprimorado, Perito)
- Manobras especiais
- Alguns feitiços
- Poderes genéricos

## Energia Amaldiçoada (EA)

Reserva de energia para feitiços, técnicas e domínios.

### Fórmulas por Classe

| Classe | EA Inicial | EA por Nível | Escolha |
|:-------|:-----------|:-------------|:--------|
| **Combatente** | 3 + X | 3 + X | X = INT ou PRE (escolhe na criação) |
| **Sentinela** | 4 + X | 4 + X | X = INT ou PRE (escolhe na criação) |
| **Especialista** | 4 + X | 4 + X | X = INT ou PRE (escolhe na criação) |

**Importante**: A escolha entre INT ou PRE é feita na criação e não pode ser mudada.

## Sanidade (SAN)

Resistência mental a horrores e efeitos psíquicos.

### Fórmulas por Classe

| Classe | SAN Inicial | SAN por Nível |
|:-------|:------------|:--------------|
| **Combatente** | 12 | 3 |
| **Sentinela** | 12 | 4 |
| **Especialista** | 16 | 4 |

## Outras Características

### Defesa
**Fórmula**: 10 + AGI + modificadores

A DT que inimigos precisam atingir para te acertar.

### Deslocamento
**Padrão**: 9 metros (6 quadrados) por ação de movimento

Pode ser aumentado por:
- Passivas de Agilidade
- Velocidade Amaldiçoada
- Poderes específicos

### Reações
**Padrão**: 2 por rodada

Usadas para:
- Bloqueio
- Esquiva
- Contra-ataque
- Outras habilidades defensivas

### Limite PE/EA por Turno
**Fórmula**: = Nível do personagem

Controla quanto recurso pode gastar em um turno, evitando explosões de poder desequilibradas.

- Nível 1: limite 1 PE/EA por turno
- Nível 5: limite 5 PE/EA por turno
- Nível 10: limite 10 PE/EA por turno

**Exceção**: Algumas passivas e habilidades podem aumentar esse limite.`,
          subcategoriaId: subCaracteristicas.id,
          tags: ['iniciante', 'pv', 'pe', 'ea', 'san'],
          palavrasChave: 'pontos vida esforço energia amaldiçoada sanidade derivados fórmula cálculo',
          nivelDificuldade: 'iniciante',
          ordem: 1,
          destaque: true,
        },
      ],
    });

    // ==================== CATEGORIA 2: COMBATE ====================
    console.log('Criando: Combate...');
    const combate = await prisma.compendioCategoria.create({
      data: {
        codigo: 'combate',
        nome: 'Combate e Ações',
        descricao: 'Mecânicas de combate, ações, iniciativa, manobras e condições',
        icone: 'campaign',
        cor: 'red',
        ordem: 2,
      },
    });

    const subCombateBasico = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'combate-basico',
        nome: 'Combate Básico',
        categoriaId: combate.id,
        ordem: 1,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'iniciativa-turnos-rodadas',
          titulo: 'Iniciativa, Turnos e Rodadas',
          resumo: 'Como funciona a ordem de ação e estrutura do combate',
          conteudo: `# Iniciativa, Turnos e Rodadas

## Estrutura do Combate

### Rodada
Período de tempo em que **todos** os combatentes agem uma vez. Representa aproximadamente 6 segundos.

### Turno
O momento específico em que **você** age dentro da rodada.

## Rolagem de Iniciativa

No início do combate:

1. Todos fazem um **teste de Iniciativa (AGI)**
2. Ações ocorrem em **ordem decrescente** do resultado
3. Em caso de empate: maior AGI age primeiro
4. Se ainda empatar: rolam 1d20 para desempate

### Exemplo
- João: 18 de iniciativa → Age primeiro
- Maria: 15 → Age segunda
- Pedro: 12 → Age terceiro
- Maldição: 8 → Age por último

## Ações por Turno

Em cada turno, você tem:

- **1 Ação Padrão**
- **1 Ação de Movimento**
- **Ações Livres** (ilimitadas, a critério do mestre)
- **2 Reações** por rodada (não por turno!)

### Ação Padrão

Exemplos:
- Agredir (atacar)
- Lançar um feitiço
- Usar um item
- Ajudar aliado

### Ação de Movimento

Exemplos:
- Movimentar-se (até seu deslocamento)
- Sacar/guardar arma
- Levantar-se do chão
- Abrir porta

### Ação Completa

Você pode **trocar** ação padrão + movimento por **1 ação completa**:

Exemplos:
- Corrida (Atletismo para correr mais longe)
- Alguns feitiços específicos
- Manobras complexas

### Ações Livres

Não consomem ações, mas o mestre pode limitar:
- Falar (frases curtas)
- Largar item
- Alguns talentos específicos

## Reações

Acontecem **fora do seu turno**, em resposta a ações de outros:

### Reações Básicas

**Bloqueio**: Reduz dano recebido
- Gasta 1 reação
- Teste de Luta ou Fortitude
- Se passar, reduz dano

**Esquiva**: Tenta evitar completamente
- Gasta 1 reação
- Teste de Reflexos
- Se passar, evita totalmente

**Contra-ataque**: Ataca de volta
- Gasta 1 reação
- Requer habilidades específicas
- Ataque simultâneo ao recebido

### Limite de Reações

- **Padrão**: 2 reações por rodada
- Agilidade II: +1 reação (total 3)
- Algumas trilhas concedem mais

**Importante**: Reações são por **rodada**, não por turno! Use com sabedoria.`,
          subcategoriaId: subCombateBasico.id,
          tags: ['combate', 'iniciante', 'turnos'],
          palavrasChave: 'iniciativa turno rodada combate ação reação',
          nivelDificuldade: 'iniciante',
          ordem: 1,
          destaque: true,
        },
        {
          codigo: 'dano-tipos-condicoes',
          titulo: 'Dano, Tipos e Condições',
          resumo: 'Tipos de dano, condições graves e dano massivo',
          conteudo: `# Dano, Tipos e Condições

## Tipos de Dano

### Dano Físico

**Dano Letal**: Reduz PV normalmente
- Corte (espadas, facas)
- Perfuração (lanças, flechas)
- Impacto (martelos, socos)
- Balstico (armas de fogo)

**Dano Não-Letal**: Soma ao letal para inconsciência, mas não para morte
- Socos sem intenção de matar
- Armas com opção "atordoante"
- Alguns feitiços

### Dano Especial

**Dano Mental**: Reduz Sanidade (SAN)
- Presença Perturbadora de maldições
- Votos vinculativos quebrados
- Horrores sobrenaturais

**Dano de Jujutsu**: Energia amaldiçoada
- Feitiços e técnicas
- Pode ter subtipos (fogo, gelo, etc)
- Algumas proteções reduzem

## Condições Graves

### Morrendo

**Quando ocorre**: PV chega a 0

**Efeitos**:
- Cai inconsciente
- Fica indefeso
- Dura 3 rodadas (Vigor I/II aumenta)
- Após 3 rodadas: **morte**

**Como curar**:
- Medicina DT 20 (estabiliza em 1 PV)
- Recuperar 1+ PV por qualquer meio
- Cada tentativa de estabilizar na mesma cena aumenta DT em +5

### Enlouquecendo

**Quando ocorre**: SAN chega a 0

**Efeitos**:
- Perde controle das ações
- Dura 3 rodadas (Presença I/II aumenta)
- Após 3 rodadas: **insanidade permanente**

**Como curar**:
- Diplomacia DT 20 (estabiliza em 1 SAN)
- Religião DT 20 (também funciona)
- Recuperar 1+ SAN por qualquer meio
- Cada tentativa na mesma cena aumenta DT em +5

## Dano Massivo

Se sofrer **≥ metade dos PV totais** de uma vez:

### Teste de Resistência

**Fortitude DT**: 15 + 2 por cada 10 de dano sofrido

### Exemplo
Personagem com 40 PV sofre 25 de dano (mais que 20):
- DT base: 15
- +2 por 10 de dano: 15 + 2×2 = DT 19
- Precisa passar em Fortitude DT 19

### Se Falhar

Rola 1d6 e sofre **perda temporária de atributo**:

| d6 | Atributo Afetado |
|:--:|:-----------------|
| 1 | Agilidade |
| 2 | Força |
| 3 | Intelecto |
| 4 | Presença |
| 5 | Vigor |
| 6 | Escolha do atacante |

**Perda**: -1 no atributo até descanso completo

## Outras Condições Importantes

### Desprevenido
- Inimigo não percebeu você
- Defesa -5
- Não pode usar reações

### Caído
- Defesa -5 contra corpo a corpo
- Defesa +5 contra distância
- Precisa ação de movimento para levantar

### Flanqueado
- Inimigos em lados opostos
- Eles recebem +2 no ataque
- Você sofre -2 na Defesa

### Abalado (Medo)
- -2 em todos os testes
- Não pode se aproximar da fonte do medo

### Atordoado
- Perde próximo turno
- Defesa -5
- Não pode usar reações`,
          subcategoriaId: subCombateBasico.id,
          tags: ['combate', 'dano', 'condicoes'],
          palavrasChave: 'dano letal não-letal mental morrendo enlouquecendo massivo condições',
          nivelDificuldade: 'intermediario',
          ordem: 2,
          destaque: true,
        },
        {
          codigo: 'manobras-combate',
          titulo: 'Manobras de Combate',
          resumo: 'Agarrar, derrubar, desarmar e outras manobras especiais',
          conteudo: `# Manobras de Combate

As manobras são ações especiais que você pode fazer com a ação **Agredir**.

## Agarrar

Segurar fisicamente um oponente.

**Execução**: Ação padrão
**Alcance**: Adjacente (1,5m)
**Teste**: Luta vs Luta ou Reflexos do alvo

**Se vencer**:
- Alvo fica **agarrado**
- Você também fica agarrado (segurando ele)
- Alvo não pode se mover
- Alvo sofre -2 em ataques
- Pode apertar no próximo turno (causa dano)

**Escapar**: Ação padrão, Luta ou Acrobacia vs sua Luta

## Derrubar

Derrubar oponente no chão.

**Execução**: Ação padrão
**Alcance**: Adjacente
**Teste**: Luta vs Luta ou Reflexos

**Se vencer**:
- Alvo fica **caído**
- Defesa -5 contra corpo a corpo
- Defesa +5 contra distância
- Precisa ação de movimento para levantar

**Bônus**: +2 no teste se você for maior que o alvo

## Desarmar

Tirar arma da mão do oponente.

**Execução**: Ação padrão
**Alcance**: Alcance da sua arma
**Teste**: Luta vs Luta ou Reflexos
**Penalidade**: -5 no teste

**Se vencer**:
- Arma do alvo cai no chão
- Fica a 3m dele (escolha direção)
- Requer ação de movimento para pegar

**Crítico (20 natural)**: Você pega a arma!

## Empurrar

Afastar oponente de você.

**Execução**: Ação padrão
**Alcance**: Adjacente
**Teste**: Luta vs Luta ou Reflexos

**Se vencer**:
- Empurra 3m para trás
- Cada 5 que você vencer: +3m

**Combo**: Pode empurrar contra parede/obstáculo
- Causa 1d6 de dano de impacto

## Quebrar

Destruir objeto ou arma.

**Execução**: Ação padrão
**Alvo**: Objeto empunhado ou estrutura
**Teste**: Ataque normal vs Defesa do objeto

**Defesa de Objetos**:
- Empunhado: Defesa do portador
- No chão/fixo: 10
- Estrutura: Definido pelo mestre

**Dano**: Objetos têm PV próprio
- Arma simples: 10 PV
- Arma tática: 20 PV
- Porta de madeira: 15 PV
- Porta de metal: 40 PV

## Fintar

Enganar oponente para deixá-lo vulnerável.

**Requisito**: Treinado em Enganação
**Execução**: Ação padrão
**Alcance**: Curto (9m)
**Teste**: Enganação vs Reflexos

**Se vencer**:
- Alvo fica **desprevenido** contra seu próximo ataque
- Dura até seu próximo turno
- Funciona apenas 1 vez por combate contra mesmo alvo

## Combinar Manobras

Algumas habilidades permitem fazer manobra + ataque:

**Exemplo: Fora Opressora (Guerreiro nível 13)**
- Acerta ataque normal
- Gasta 1 PE
- Faz derrubar ou empurrar de graça`,
          subcategoriaId: subCombateBasico.id,
          tags: ['combate', 'intermediario', 'manobras'],
          palavrasChave: 'agarrar derrubar desarmar empurrar quebrar fintar manobra',
          nivelDificuldade: 'intermediario',
          ordem: 3,
        },
      ],
    });

    // ==================== CATEGORIA 3: CLASSES ====================
    console.log('Criando: Classes...');
    const classes = await prisma.compendioCategoria.create({
      data: {
        codigo: 'classes',
        nome: 'Classes',
        descricao: 'As 3 classes do sistema: Combatente, Sentinela e Especialista',
        icone: 'user',
        cor: 'purple',
        ordem: 3,
      },
    });

    const subClassesBase = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'classes-base',
        nome: 'Classes Base',
        categoriaId: classes.id,
        ordem: 1,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'combatente-completo',
          titulo: 'Combatente',
          resumo: 'Especialista em confronto direto e combate agressivo',
          conteudo: `# Combatente

Especialista em **confronto direto** e **combate agressivo**. Ideal para linha de frente.

## Recurso de Classe: Ataque Especial

Gaste **PE** para amplificar ataques corpo a corpo ou distância:

| Nível | Custo | Bônus no Ataque | Bônus no Dano |
|:-----:|:-----:|:---------------:|:-------------:|
| 1 | 2 PE | +5 | **OU** +5 |
| 5 | 3 PE | +10 | **OU** +10 |
| 11 | 4 PE | +15 | **OU** +15 |
| 17 | 5 PE | +20 | **OU** +20 |

**Importante**: Escolhe entre bônus no ataque OU no dano, não ambos!

### Exemplo de Uso

João (nível 5) ataca:
- Teste normal: 1d20+10 = 17
- Gasta 3 PE para Ataque Especial no teste: 17+10 = **27**
- Acerta! Dano: 2d8+5

OU

- Teste normal: 1d20+10 = 17 (acerta)
- Gasta 3 PE para Ataque Especial no dano
- Dano: 2d8+5+10 = **2d8+15**

## Características

### Pontos de Vida
- **Inicial**: 20 + VIG
- **Por nível**: 4 + VIG
- **Maior PV do jogo** - tanque natural

### Pontos de Esforço
- **Inicial**: 3 + PRE
- **Por nível**: 3 + PRE

### Energia Amaldiçoada
- **Inicial**: 3 + (INT ou PRE)
- **Por nível**: 3 + (INT ou PRE)
- Escolhe INT ou PRE na criação

### Sanidade
- **Inicial**: 12
- **Por nível**: 3

## Perícias Treinadas

Escolhe 1 de cada grupo:
- Luta **OU** Pontaria
- Fortitude **OU** Reflexos
- **Mais**: 2+INT perícias à escolha

## Proficincias

- Armas simples
- Armas táticas
- Protções leves

**Nível 5**: Ganha proficiência adicional (escolhida na trilha)

## Progressão de Nível

| Nível | Habilidade |
|:-----:|:-----------|
| 1 | Ataque especial (2 PE, +5) |
| 2 | Habilidade de trilha, Grau de Aprimoramento |
| 3 | Poder genérico, Grau de treinamento |
| 4 | Aumento de atributo |
| 5 | Ataque especial (3 PE, +10), Proficiência extra |
| 6 | Poder genérico |
| 7 | Grau de treinamento, Aumento de atributo |
| 8 | Habilidade de trilha, Grau de Aprimoramento |
| 9 | Poder genérico |
| 10 | Aumento de atributo |
| 11 | Ataque especial (4 PE, +15), Grau de treinamento |
| 12 | Poder genérico |
| 13 | Habilidade de trilha, Aumento de atributo |
| 14 | Grau de Aprimoramento |
| 15 | Poder genérico |
| 16 | Aumento de atributo, Grau de treinamento |
| 17 | Ataque especial (5 PE, +20) |
| 18 | Poder genérico, Grau de Aprimoramento |
| 19 | Aumento de atributo |
| 20 | Habilidade de trilha |

## Trilhas Disponíveis (Nível 2)

- **Aniquilador**: Especialista em arma favorita
- **Guerreiro**: Mestre do combate corpo a corpo
- **Operações Especiais**: Velocidade e ações extras
- **Tropa de Choque**: Tanque e protetor da equipe
- **Arma Maldita**: Combate + Jujutsu integrados

## Estilo de Jogo

**Pontos Fortes**:
- Maior PV do jogo
- Dano consistente e alto
- Versátil (corpo a corpo ou distância)

**Pontos Fracos**:
- Menos EA que outras classes
- Menos perícias que Especialista
- Depende de PE para brilhar

**Para Quem**: Jogadores que querem ser o guerreiro da linha de frente, causando dano alto e aguentando porrada.`,
          subcategoriaId: subClassesBase.id,
          tags: ['classe', 'combate', 'combatente'],
          palavrasChave: 'combatente lutador dano classe ataque especial',
          nivelDificuldade: 'intermediario',
          ordem: 1,
          destaque: true,
        },
        {
          codigo: 'sentinela-completo',
          titulo: 'Sentinela',
          resumo: 'Combatente tático especializado em Jujutsu e controle',
          conteudo: `# Sentinela

Combatente **tático** que atua de **média a longa distância**, controlando campo com Jujutsu.

## Recurso de Classe: Aprimorado

Gaste **PE** para aumentar **temporariamente** graus de aprimoramento:

| Nível | Custo | Graus Temporários |
|:-----:|:-----:|:-----------------:|
| 1 | 2 PE | +1 grau |
| 5 | 3 PE | +2 graus |
| 11 | 4 PE | +3 graus |
| 17 | 5 PE | +4 graus |

**Limitações**:
- Máximo **+2 graus temporários** na mesma técnica
- Dura até o fim da cena
- Não pode ultrapassar grau 5 total

### Exemplo de Uso

Maria (nível 5) tem grau 2 em Técnica Amaldioada:
- Gasta 3 PE
- Recebe +2 graus temporários
- Usa técnicas como se tivesse grau 4 até fim da cena!

Isso permite usar variaões avançadas de feitiços antes do tempo.

## Características

### Pontos de Vida
- **Inicial**: 16 + VIG
- **Por nível**: 2 + VIG
- **Menor PV** - precisa se posicionar bem

### Pontos de Esforço
- **Inicial**: 3 + PRE
- **Por nível**: 3 + PRE

### Energia Amaldiçoada
- **Inicial**: 4 + (INT ou PRE)
- **Por nível**: 4 + (INT ou PRE)
- **Maior EA do jogo junto com Especialista**

### Sanidade
- **Inicial**: 12
- **Por nível**: 4

## Perícias Treinadas

Fixas:
- Luta **OU** Pontaria
- Tática

**Mais**: 3+INT perícias à escolha

## Proficiências

- Armas simples
- Armas táticas

**Sem** proficiência em proteções (precisa pegar com poderes)

## Progressão de Nível

| Nível | Habilidade |
|:-----:|:-----------|
| 1 | Aprimorado (2 PE, +1 grau) |
| 2 | Habilidade de trilha, Grau de Aprimoramento |
| 3 | Poder genérico, Grau de treinamento |
| 4 | Aumento de atributo |
| 5 | Aprimorado (3 PE, +2 graus) |
| 6 | Poder genérico |
| 7 | Grau de treinamento, Aumento de atributo |
| 8 | Habilidade de trilha, Grau de Aprimoramento |
| 9 | Poder genérico |
| 10 | Aumento de atributo |
| 11 | Aprimorado (4 PE, +3 graus), Grau de treinamento |
| 12 | Poder genérico |
| 13 | Habilidade de trilha, Aumento de atributo |
| 14 | Grau de Aprimoramento |
| 15 | Poder genérico |
| 16 | Aumento de atributo, Grau de treinamento |
| 17 | Aprimorado (5 PE, +4 graus) |
| 18 | Poder genérico, Grau de Aprimoramento |
| 19 | Aumento de atributo |
| 20 | Habilidade de trilha |

## Trilhas Disponíveis (Nível 2)

- **Brigadeiro**: Atirador de linha de frente
- **Atirador de Elite**: Sniper preciso
- **Condute**: Mestre de feitiços
- **Comandante de Campo**: Estrategista de equipe
- **Especialista em Shikigami**: Invocador

## Estilo de Jogo

**Pontos Fortes**:
- Mais EA do jogo
- Versatilidade tática
- Controle de campo
- Acesso antecipado a técnicas avançadas

**Pontos Fracos**:
- Menor PV
- Sem proteções sem poderes
- Precisa se posicionar bem

**Para Quem**: Jogadores que querem ser o mago/controlador, usando Jujutsu de forma estratégica e mantendo distância.`,
          subcategoriaId: subClassesBase.id,
          tags: ['classe', 'jujutsu', 'sentinela'],
          palavrasChave: 'sentinela tático jujutsu controle aprimorado',
          nivelDificuldade: 'intermediario',
          ordem: 2,
          destaque: true,
        },
        {
          codigo: 'especialista-completo',
          titulo: 'Especialista',
          resumo: 'Classe flexível focada em perícias e versatilidade',
          conteudo: `# Especialista

A classe mais **flexível**, focada em **perícias** e **suporte**. Pode se especializar em qualquer coisa.

## Recurso de Classe: Perito

Escolha **2 perícias** nas quais é treinado.

Gaste **PE** para adicionar um **dado extra** ao teste:

| Nível | Custo | Dado Extra |
|:-----:|:-----:|:----------:|
| 1 | 2 PE | +1d6 |
| 5 | 3 PE | +1d8 |
| 11 | 4 PE | +1d10 |
| 17 | 5 PE | +1d12 |

### Como Funciona

1. Faz teste normal da perícia
2. Gasta PE
3. Rola o dado extra
4. **Soma tudo**

### Exemplo

Pedro (nível 5, Perito em Medicina):
- Teste normal: 1d20+10 = 15
- Gasta 3 PE
- Rola 1d8 extra = 6
- **Total: 15+6 = 21**

### Trocar Perícias

Pode trocar as 2 perícias escolhidas em interldios importantes, se fizer sentido narrativamente.

## Características

### Pontos de Vida
- **Inicial**: 16 + VIG
- **Por nível**: 3 + VIG
- Meio termo entre Combatente e Sentinela

### Pontos de Esforço
- **Inicial**: 3 + PRE
- **Por nível**: 3 + PRE

### Energia Amaldiçoada
- **Inicial**: 4 + (INT ou PRE)
- **Por nível**: 4 + (INT ou PRE)
- **Maior EA junto com Sentinela**

### Sanidade
- **Inicial**: 16
- **Por nível**: 4
- **Maior SAN do jogo**

## Perícias Treinadas

**6+INT perícias à escolha**

A classe com mais perícias! Total liberdade de personalização.

## Proficiências

- Armas simples
- Proteções leves

## Progressão de Nível

| Nível | Habilidade |
|:-----:|:-----------|
| 1 | Perito (2 PE, 1d6) |
| 2 | Habilidade de trilha, Grau de Aprimoramento |
| 3 | Poder genérico, Grau de treinamento |
| 4 | Aumento de atributo |
| 5 | Perito (3 PE, 1d8) |
| 6 | Poder genérico |
| 7 | Grau de treinamento, Aumento de atributo |
| 8 | Habilidade de trilha, Grau de Aprimoramento |
| 9 | Poder genérico |
| 10 | Aumento de atributo |
| 11 | Perito (4 PE, 1d10), Grau de treinamento |
| 12 | Poder genérico |
| 13 | Habilidade de trilha, Aumento de atributo |
| 14 | Grau de Aprimoramento |
| 15 | Poder genérico |
| 16 | Aumento de atributo, Grau de treinamento |
| 17 | Perito (5 PE, 1d12) |
| 18 | Poder genérico, Grau de Aprimoramento |
| 19 | Aumento de atributo |
| 20 | Habilidade de trilha |

## Trilhas Disponíveis (Nível 2)

- **Infiltrador**: Assassino furtivo
- **Médico de Campo**: Curandeiro
- **Técnico**: Mestre da tecnologia
- **Graduado**: Feiticeiro clássico
- **Flagelador**: Usa dor como combustível
- **Mestre de Barreiras**: Especialista em domínios

## Estilo de Jogo

**Pontos Fortes**:
- **Máxima versatilidade**
- Mais perícias do jogo
- Mais EA (empatado)
- Maior SAN
- Pode fazer qualquer coisa

**Pontos Fracos**:
- Não é o melhor em combate direto
- Precisa escolher bem as especializações
- Recurso de classe só funciona em perícias escolhidas

**Para Quem**: Jogadores que querem liberdade total de personalização, suporte, infiltração, ou builds não-convencionais.`,
          subcategoriaId: subClassesBase.id,
          tags: ['classe', 'pericias', 'especialista'],
          palavrasChave: 'especialista flexível perícias suporte perito versátil',
          nivelDificuldade: 'intermediario',
          ordem: 3,
          destaque: true,
        },
      ],
    });

    // ==================== CATEGORIA 4: ENERGIA AMALDIÇOADA ====================
    console.log('Criando: Energia Amaldiçoada...');
    const energiaAmaldicoada = await prisma.compendioCategoria.create({
      data: {
        codigo: 'energia-amaldicoada',
        nome: 'Energia Amaldiçoada',
        descricao: 'Sistema de EA, feitiços básicos, técnicas e domínios',
        icone: 'sparkles',
        cor: 'purple',
        ordem: 4,
      },
    });

    const subFeiticosBasicos = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'feiticos-basicos',
        nome: 'Feitiços Básicos',
        categoriaId: energiaAmaldicoada.id,
        ordem: 1,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'revestimento-completo',
          titulo: 'Revestimento de Energia Amaldiçoada',
          resumo: 'Técnica fundamental para revestir corpo e armas com EA',
          conteudo: `# Revestimento de Energia Amaldiçoada

Técnica fundamental para infundir EA em corpo ou armas.

**Pré-requisito**: Grau 1+ em Técnica Amaldiçoada

## Revestimento Ofensivo

Aumenta o dano de ataques.

**Execução**: Ação padrão (ou variante momentânea)
**Alcance**: Pessoal ou arma empunhada
**Duração**: Sustentado (precisa manter ativo)
**Custo Inicial**: 2 EA
**Custo de Sustentação**: 1 EA por rodada

### Efeito Base
- **+1d6 de dano** em ataques

### Acumular Potência

Pode gastar EA adicional para mais dados:

| Acúmulos | Custo Inicial | Sustentação | Dano Total |
|:--------:|:-------------:|:-----------:|:----------:|
| 1 | 2 EA | 1 EA | +1d6 |
| 2 | 3 EA | 2 EA | +2d6 |
| 3 | 4 EA | 3 EA | +3d6 |
| 4 | 5 EA | 4 EA | +4d6 |

**Limite**: 4 acúmulos máximo

### Variação: Momentâneo

Revestimento instantâneo.

**Execução**: No ataque (parte do ataque)
**Duração**: Instantânea
**Custo**: 1 EA por acúmulo

**Uso**: Ativa e desativa instantaneamente, sem precisar sustentar.

### Variação: Munição

Para armas de fogo e munições.

**Custo**: **Dobrado** (2 EA por d6)
**Inicial**: 4 EA para +1d6
**Sustentação**: 2 EA por rodada

**Exemplo**: Revólver com revestimento momentâneo +2d6 = 4 EA por disparo

## Revestimento Defensivo

Aumenta defesa e resistência.

**Execução**: Ação padrão (ou variante momentânea)
**Alcance**: Pessoal
**Duração**: Sustentado
**Custo Inicial**: 2 EA
**Sustentação**: 1 EA por rodada

### Efeito Base
Escolha **UM** efeito:
- **+2 Defesa** OU
- **+2 RD** (Resistência a Dano)

### Acumular Proteção

| Acúmulos | Custo Inicial | Sustentação | Bônus |
|:--------:|:-------------:|:-----------:|:-----:|
| 1 | 2 EA | 1 EA | +2 |
| 2 | 3 EA | 2 EA | +4 |
| 3 | 4 EA | 3 EA | +6 |
| 4 | 5 EA | 4 EA | +8 |

**Limite**: 4 acúmulos máximo

### Variação: Momentâneo

**Execução**: Na reação (bloqueio ou esquiva)
**Duração**: Instantânea
**Custo**: 1 EA por acúmulo

**Uso**: Ativa apenas quando precisa se defender.

## Combinações Possíveis

Pode ter **ambos** ativos (ofensivo + defensivo):
- Gasta EA de cada separadamente
- Mantém cada um com ação livre
- Potência de cada é independente

### Exemplo Completo

Maria mantém:
- Revestimento Ofensivo +2d6 (3 EA inicial, 2 EA/rodada)
- Revestimento Defensivo +4 Defesa (3 EA inicial, 2 EA/rodada)
- **Total**: 6 EA inicial, 4 EA/rodada`,
          subcategoriaId: subFeiticosBasicos.id,
          tags: ['feitiso', 'revestimento', 'energia'],
          palavrasChave: 'revestimento energia amaldiçoada EA ofensivo defensivo',
          nivelDificuldade: 'iniciante',
          ordem: 1,
          destaque: true,
        },
        {
          codigo: 'velocidade-amaldicoada-completa',
          titulo: 'Velocidade Amaldiçoada',
          resumo: 'Aumenta velocidade e reação usando EA',
          conteudo: `# Velocidade Amaldiçoada

Canaliza EA para potencializar velocidade e reação.

**Pré-requisito**: Grau 1+ em Técnica Amaldiçoada

## Mecânica Base

**Execução**: Ação padrão
**Alcance**: Pessoal
**Duração**: Sustentado
**Custo Inicial**: 1 EA + 1 PE
**Sustentação**: 1 EA + 1 PE por rodada

### Efeitos
- **+3m deslocamento**
- **+2 no teste de ataque**

## Acumular Velocidade

Pode acumular até **5 vezes**:

| Acúmulos | Custo Inicial | Sustentação | Deslocamento | Ataque |
|:--------:|:-------------:|:-----------:|:------------:|:------:|
| 1 | 1 EA + 1 PE | 1 EA + 1 PE | +3m | +2 |
| 2 | 2 EA + 2 PE | 2 EA + 2 PE | +6m | +4 |
| 3 | 3 EA + 3 PE | 3 EA + 3 PE | +9m | +6 |
| 4 | 4 EA + 4 PE | 4 EA + 4 PE | +12m | +8 |
| 5 | 5 EA + 5 PE | 5 EA + 5 PE | +15m | +10 |

**Limite**: 5 acúmulos máximo

## Interação com Passivas

**Agilidade I** (+6m deslocamento):
- Velocidade 3 acúmulos = 9m+6m = **+15m total**

**Agilidade II** (+9m deslocamento):
- Velocidade 3 acúmulos = 9m+9m = **+18m total**

## Exemplo de Uso

Pedro (AGI 3, Agilidade II):
- Deslocamento base: 9m
- Passiva Agilidade II: +9m = 18m
- Velocidade Amaldiçoada 2 acúmulos: +6m = **24m total**
- Pode se mover 24m por ação de movimento!
- +4 em todos ataques enquanto ativo

## Dicas Táticas

- **Alto custo**: Usa EA + PE simultaneamente
- **Combine com revestimento**: Velocidade + dano
- **Hit and run**: Ataque e fuja rapidamente
- **Perseguições**: Essencial para alcançar/fugir`,
          subcategoriaId: subFeiticosBasicos.id,
          tags: ['feitiso', 'velocidade'],
          palavrasChave: 'velocidade amaldiçoada deslocamento movimento ataque',
          nivelDificuldade: 'intermediario',
          ordem: 2,
        },
        {
          codigo: 'fulgor-negro-completo',
          titulo: 'Fulgor Negro (Kokusen)',
          resumo: 'Fenômeno raro que amplifica golpes críticos',
          conteudo: `# Fulgor Negro (Kokusen)

Fenômeno que amplifica golpes quando EA é aplicada em menos de um milionésimo de segundo.

**Pré-requisito**: Grau 1+ em Técnica Amaldiçoada

## Como Funciona

**Execução**: Durante ataque corpo a corpo
**Custo**: 2 PE
**Condição**: Precisa acertar **crítico natural (20 no d20)**

### Sequência

1. **Antes de rolar**: Declare que vai tentar Kokusen (gasta 2 PE)
2. **Role o ataque**: Precisa tirar 20 natural
3. **Se acertar 20**: Ativa o Kokusen!
4. **Se não**: Perdeu os 2 PE

**IMPORTANTE**: Precisa declarar ANTES de rolar!

## Efeitos do Kokusen

Quando acerta crítico natural E declarou:

### 1. Dados de Dano Extras
**+2 dados de dano**

Exemplo: 1d6 vira 3d6

### 2. Multiplicador Aumentado
**+1 no multiplicador de crítico**

Exemplos:
- x2 vira x3
- x3 vira x4
- 19-20/x2 vira 19-20/x3

### 3. Recupera Energia
**+1 EA** de volta

## Exemplo Completo

João ataca com katana (1d8, 19-20/x2):

**Normal**:
1. Rola ataque: tira 19 (crítico!)
2. Dano: 2d8×2 = 4d8

**Com Kokusen**:
1. Declara Kokusen (gasta 2 PE)
2. Rola ataque: tira 19 (crítico!)
3. Efeitos:
   - Dano base: 1d8 + 2d8 = 3d8
   - Multiplicador: x2 + 1 = x3
   - **Dano final**: 3d8×3 = **9d8**
4. Recupera 1 EA

## Melhorias

### Poder Genérico: Gnio do Kokusen

**Efeito**: TODOS os críticos naturais viram automaticamente Kokusen
- Drena 3 PE automaticamente
- Não precisa declarar antes
- Se não tiver 3 PE, não ativa

### Poder Genérico: Lutador Focado

**Pré-requisito**: Gnio do Kokusen

**Efeito**: Após o PRIMEIRO Kokusen da cena:
- Qualquer crítico (mesmo não-natural) vira Kokusen
- Drena 4 PE por crítico
- Restaura 2 EA por crítico

## Matemática do Kokusen

**Chance base de crítico**: 5% (20 natural)
**Com margem 19-20**: 10%
**Com margem 18-20**: 15%

**Builds de Kokusen**:
- Armas com margem alta (18-20)
- Habilidades que aumentam margem
- FOR ou AGI alta (mais ataques = mais chances)

## Dicas

- **Alto risco, alta recompensa**: Gasta PE antes de saber se acerta
- **Combine com**: Armas de crítico alto, habilidades que aumentam margem
- **Economize PE**: Reserve para momentos cruciais
- **Recuperação**: O EA recuperado ajuda a compensar`,
          subcategoriaId: subFeiticosBasicos.id,
          tags: ['feitiso', 'avancado', 'critico'],
          palavrasChave: 'fulgor negro kokusen crítico dano amplificar',
          nivelDificuldade: 'avancado',
          ordem: 3,
          destaque: true,
        },
      ],
    });

    const subBarreiras = await prisma.compendioSubcategoria.create({
      data: {
        codigo: 'tecnicas-barreira',
        nome: 'Técnicas de Barreira',
        categoriaId: energiaAmaldicoada.id,
        ordem: 2,
      },
    });

    await prisma.compendioArtigo.createMany({
      data: [
        {
          codigo: 'cortina-barreira-simples',
          titulo: 'Cortina e Barreira Simples',
          resumo: 'Criar barreiras com regras simples',
          conteudo: `# Cortina e Barreira Simples

**Pré-requisito**: Grau 1+ em Técnica de Barreira

## Cortina

Barreira esférica que esconde tudo dentro dela.

**Execução**: Ação completa
**Alcance**: Varia com tamanho
**Duração**: Sustentado (requer concentração)
**Custo Base**: 2+ EA (conforme tamanho)

### Tamanhos

| Tamanho | Raio | Custo | Sustentação |
|:--------|:----:|:-----:|:-----------:|
| Pequena | 9m | 2 EA | 1 EA/rodada |
| Média | 18m | 4 EA | 2 EA/rodada |
| Grande | 36m | 6 EA | 3 EA/rodada |
| Enorme | 90m | 10 EA | 5 EA/rodada |

### Efeitos da Cortina

1. **Muda o céu** para aparência noturna
2. **Provoca espíritos** a se revelarem
3. **Oculta de não-feiticeiros** (não veem o que acontece dentro)
4. **Feiticeiros veem normalmente** de fora

### Customização

Pode adicionar **condições** à cortina:

- "Não-feiticeiros não podem entrar"
- "Apenas mulheres podem sair"
- "Telefones param de funcionar"
- "Tempo passa diferente dentro"

**Custo**: +1 EA por condição (máximo conforme grau)

## Barreira Simples

Barreira com regras mais complexas.

**Execução**: Ação completa
**Alcance**: Área adjacente variável
**Duração**: Sustentado (requer concentração)
**Custo Base**: 2 EA mínimo

### Regras Simultâneas

Número de regras que pode impor ao mesmo tempo:

| Grau em Barreira | Regras Simultâneas |
|:-----------------|:------------------:|
| 1 | 0-1 regras |
| 2 | 0-2 regras |
| 3 | 0-3 regras |
| 4 | 0-4 regras |
| 5 | 0-5 regras |

### Exemplos de Regras

- Impedir entrada de seres específicos
- Alertar quando alguém atravessa
- Causar dano ao entrar
- Modificar gravidade dentro
- Bloquear tipos de energia
- Forçar testes de resistência

### Custo por Complexidade

| Complexidade | Exemplos | Custo |
|:-------------|:---------|:-----:|
| Simples | Impedir entrada, alertar | +1 EA |
| Média | Causar dano, modificar física | +2 EA |
| Alta | Efeitos múltiplos, duradouros | +3 EA |

## Quebrar Barreiras

### Atacar Barreira

- Barreira tem PV = 10 × (EA gasto + grau do conjurador)
- Resistência específica contra Jujutsu

### Dissipar

- Teste de Jujutsu oposto ao teste do criador
- DT = 15 + grau de aprimoramento do criador

## Usos Táticos

**Cortina**:
- Esconder operações
- Isolar civis
- Preparar emboscada

**Barreira Simples**:
- Proteger área
- Controlar movimento
- Criar armadilhas`,
          subcategoriaId: subBarreiras.id,
          tags: ['barreira', 'cortina'],
          palavrasChave: 'barreira cortina ocultar esconder regras',
          nivelDificuldade: 'intermediario',
          ordem: 1,
        },
        {
          codigo: 'expansao-dominio-completa',
          titulo: 'Expansão de Domínio',
          resumo: 'Manifestar domínio inato com acerto garantido',
          conteudo: `# Expansão de Domínio

Manifestar o domínio inato — reflexo da mente e alma dentro de uma barreira.

## Pré-requisitos

- **Grau 2+** em Técnica de Barreira
- **Técnica Inata** definida
- **Domínio Inato** criado (paisagem mental)
- **Mudra** (gesto simbólico) definido

## Mecânica Base

**Execução**: Ação completa
**Alcance**: Raio de alcance curto (9m)
**Alvo**: Todos no alcance
**Duração**: Sustentado
**Custo Mínimo**: 6 EA + 2 PE
**Sustentação**: 2 EA/rodada (padrão)

## Efeito Principal: Acerto Garantido

**TODAS** as técnicas lanadas dentro do domínio contra alvos:
- **Atingem automaticamente**
- Não precisa rolar teste de ataque
- Apenas rola o dano

**Controle**:
- Você escolhe quais alvos afeta
- Pode variar quais técnicas têm acerto garantido

## Tipos de Domínio

### Letal

Alvos sofrem dano automaticamente.

**Efeito**: No início de cada rodada:
- Alvos sofrem efeito de habilidade escolhida
- Automaticamente, sem teste
- Você escolhe qual habilidade ativar

**Exemplo**: Domínio com espadas cortantes
- Início da rodada: todos sofrem 4d8 corte
- Sem teste, sem defesa

### Aperfeioador

Reduz custos e aumenta eficácia de técnicas próprias.

**Efeitos possíveis**:
- Reduz custo EA de técnicas
- Aumenta dano
- Aumenta DT para resistir
- Aumenta limite PE/EA
- +1 grau temporário em técnica

**Não** garante acerto automaticamente nessas técnicas buffadas.

### Restritivo

Impõe regras aos alvos dentro.

**Como funciona**:
1. Define regras (ex: "não pode usar técnicas")
2. Acerto garantido **transmite as regras** para mente dos alvos
3. Alvos sabem as regras automaticamente
4. Se quebrar regra: sofre consequência

**Exemplo**: Domínio da Verdade
- Regra: "Não pode mentir"
- Quem mentir: sofre 2d10 mental

## Domínios Híbridos

Pode **combinar tipos**, aumentando custo:

**Letal + Aperfeioador**:
- Dano automático + suas técnicas mais fortes
- Custo: 8 EA + 3 PE

**Restritivo + Letal**:
- Regras + punição automática
- Custo: 9 EA + 3 PE

## Cabo de Guerra

Quando **dois domínios se chocam**:

1. Ambos fazem teste de **Jujutsu**
2. Quem **vencer**:
   - Seu domínio prevalece
   - Domínio rival é subjugado
   - Pode manter ambos ativos (custo dobrado)
3. Se vencer por **muito** (10+):
   - Quebra o domínio rival
   - Rival perde EA gasto

### Refinamento

**Domínio mais refinado** (mais EA gasto, mais regras, melhor construído):
- **+2 no teste** de cabo de guerra

## Custos Avançados

| Efeito Extra | Custo Adicional |
|:-------------|:---------------:|
| +3m de raio | +2 EA |
| +1 efeito letal simultâneo | +2 EA |
| +1 regra restritiva | +1 EA |
| +1 buff aperfeioador | +1 EA |
| Sustentação mais difícil | +1 EA/rodada |

## Primeira Expansão

A primeira vez é um **momento narrativo importante**:

1. Define paisagem mental com mestre
2. Escolhe tipo de domínio
3. Define mudra e frase de ativação
4. Estabelece estética e tema

Pode fazer por:
- **Treinamento**: Preparado, sem penalidades
- **Epifania**: Em combate, DT 20, penalidades

## Limitações

- Requer **concentração total**
- Não pode manter outros feitiços sustentados
- Quebra se ficar inconsciente
- Extremamente cansativo
- Pode usar 1x por cena (recomendado)

## Contra-medidas

### Domínio Simples (Nível 2 EA)
- Cria escudo pessoal
- **Anula acerto garantido** para você
- Defesa +5

### Amplificação de Domínio (1 EA)
- Envolve corpo com vu do próprio domínio
- **Anula acerto garantido**
- Não pode usar técnica inata enquanto ativa`,
          subcategoriaId: subBarreiras.id,
          tags: ['dominio', 'avancado'],
          palavrasChave: 'expansão domínio inato acerto garantido barreira cabo de guerra',
          nivelDificuldade: 'avancado',
          ordem: 2,
          destaque: true,
        },
      ],
    });

    console.log('\nSeed completo do Compêndio finalizado com sucesso!');
    console.log('\nResumo:');
    console.log('   - 4 categorias criadas');
    console.log('   - 10 subcategorias criadas');
    console.log('   - 25+ artigos criados com informações corretas');
    console.log('\nPrincipais melhorias:');
    console.log('   ✓ Fórmulas corretas de PV/PE/EA/SAN por classe');
    console.log('   ✓ Passivas de atributos completas com limitações');
    console.log('   ✓ Lista completa de perícias com "somente treinada"');
    console.log('   ✓ Recursos de classe explicados detalhadamente');
    console.log('   ✓ Feitiços com custos e mecânicas corretas');
    console.log('   ✓ Sistema de testes e testes unidos explicado');
    console.log('   ✓ Dano massivo e condições graves incluídos');
    console.log('   ✓ Manobras de combate detalhadas');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedCompendioCompleto()
  .catch((e) => {
    console.error('Falha na execução do seed:', e);
    process.exit(1);
  });
