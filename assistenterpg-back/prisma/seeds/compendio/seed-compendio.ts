// prisma/seeds/compendio/seed-compendio-standalone-corrigido.ts
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const prisma = new PrismaClient();

type NivelDificuldade = 'iniciante' | 'intermediario' | 'avancado';

type ArtigoDef = {
  codigo: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  tags: string[];
  palavrasChave: string;
  nivelDificuldade: NivelDificuldade;
  ordem: number;
  destaque?: boolean;
};

type SubcategoriaDef = {
  codigo: string;
  nome: string;
  ordem: number;
  artigos: ArtigoDef[];
};

type CategoriaDef = {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: number;
  subcategorias: SubcategoriaDef[];
};

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function clampResumo(text: string, max = 180): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}
function chunkTexto(text: string, maxChars = 50000): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [''];
  if (cleaned.length <= maxChars) return [cleaned];

  const partes: string[] = [];
  const blocos = cleaned.split(/\n\s*\n/);
  let atual = '';

  for (const bloco of blocos) {
    const b = bloco.trim();
    if (!b) continue;
    const candidato = atual ? `${atual}\n\n${b}` : b;
    if (candidato.length <= maxChars) {
      atual = candidato;
      continue;
    }
    if (atual) {
      partes.push(atual);
      atual = '';
    }
    if (b.length <= maxChars) {
      atual = b;
      continue;
    }
    for (let i = 0; i < b.length; i += maxChars) {
      partes.push(b.slice(i, i + maxChars));
    }
  }
  if (atual) partes.push(atual);
  return partes;
}


async function extrairTextoStandalone(pdfPath: string): Promise<string> {
  // Evita depend??ncia fixa: falha com mensagem clara se pdf-parse n??o estiver instalado.
  let pdfParse: any;
  try {
    const mod = await import('pdf-parse');
    pdfParse = (mod as any).default ?? (mod as any).pdfParse ?? (mod as any);
  } catch {
    throw new Error(
      'Depend??ncia ausente: instale "pdf-parse" para ingest??o do Standalone (ex.: npm i pdf-parse).'
    );
  }

  if (typeof pdfParse !== 'function') {
    try {
      const require = createRequire(__filename);
      const modRequire = require('pdf-parse');
      pdfParse = modRequire?.default ?? modRequire?.pdfParse ?? modRequire;
    } catch {
      // ignore; handled below
    }
  }

  const buf = await fs.readFile(pdfPath);

  let text = '';
  if (typeof pdfParse === 'function') {
    const out = await pdfParse(buf);
    text = (out?.text ?? '').toString();
  } else if (pdfParse?.PDFParse) {
    const parser = new pdfParse.PDFParse({ data: buf });
    const out = await parser.getText();
    text = (out?.text ?? '').toString();
  } else {
    throw new Error(
      'Falha ao carregar "pdf-parse": export inv??lido. Verifique a vers??o instalada.'
    );
  }

  if (!text.trim()) throw new Error('Extra????o do PDF retornou texto vazio. Verifique o arquivo.');
  return text;
}

function splitCapitulosStandalone(texto: string): Array<{ cap: number; titulo: string; corpo: string }> {
  const lines = texto.split(/\r?\n/);

  // Heurística: capítulo é linha como "10. REGRAS GERAIS" (título em CAIXA ALTA).
  const capRe = /^(\d{1,2})\.\s+([A-ZÁÂÃÉÍÓÔÕÚÇ0-9][A-ZÁÂÃÉÍÓÔÕÚÇ0-9\s\-]+)$/;

  const indices: Array<{ idx: number; cap: number; titulo: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const m = capRe.exec(lines[i].trim());
    if (!m) continue;

    const cap = Number(m[1]);
    const titulo = m[2].trim();
    if (Number.isNaN(cap) || cap < 1 || cap > 99) continue;

    indices.push({ idx: i, cap, titulo });
  }

  // Se falhar a segmentação, cai para um único “capítulo”.
  if (indices.length < 2) {
    return [{ cap: 0, titulo: 'Standalone (texto integral)', corpo: texto.trim() }];
  }

  const capitulos: Array<{ cap: number; titulo: string; corpo: string }> = [];
  for (let j = 0; j < indices.length; j++) {
    const start = indices[j].idx;
    const end = j + 1 < indices.length ? indices[j + 1].idx : lines.length;

    const header = indices[j];
    const corpo = lines.slice(start + 1, end).join('\n').trim();

    capitulos.push({
      cap: header.cap,
      titulo: header.titulo,
      corpo,
    });
  }

  return capitulos;
}

async function seedCategoriasCuradas(): Promise<CategoriaDef[]> {
  // Observação: conteúdo curado é resumido e padronizado, mas as regras divergentes
  // foram corrigidas para refletir o Standalone.

  const categorias: CategoriaDef[] = [
    {
      codigo: 'regras-basicas',
      nome: 'Regras Básicas',
      descricao: 'Fundamentos do sistema: atributos, perícias, testes e características derivadas',
      icone: 'rules',
      cor: 'blue',
      ordem: 1,
      subcategorias: [
        {
          codigo: 'atributos-testes',
          nome: 'Atributos e Testes',
          ordem: 1,
          artigos: [
            {
              codigo: 'atributos-base',
              titulo: 'Atributos Base',
              resumo: 'Os 5 atributos fundamentais (0–7) e suas funções no sistema',
              conteudo: `# Atributos Base

Os atributos representam as capacidades físicas, mentais e sociais básicas do personagem, usadas em praticamente todos os testes.

## Os 5 atributos

- **Agilidade (AGI)**: coordenação motora, velocidade de reação e destreza manual.  
- **Força (FOR)**: potência muscular e impacto em ataques corpo a corpo.  
- **Intelecto (INT)**: raciocínio, memória, conhecimento e análise.  
- **Presença (PRE)**: força de vontade, carisma, percepção intuitiva e sensibilidade à EA.  
- **Vigor (VIG)**: saúde física, resistência e capacidade de suportar esforço.

## Escala e criação

- Escala típica: **0 a 7**  
- Criação: começa com **1 em cada atributo**  
- Regra base de nível 1: recebe **4 pontos adicionais** para distribuir (o mestre pode ajustar).`,
              tags: ['iniciante', 'criacao-personagem', 'atributos'],
              palavrasChave: 'agi for int pre vig atributos escala 0-7',
              nivelDificuldade: 'iniciante',
              ordem: 1,
              destaque: true,
            },
            {
              codigo: 'passivas-atributos',
              titulo: 'Passivas de Atributos',
              resumo: 'Passivas desbloqueadas por atributos altos e suas limitações',
              conteudo: `# Passivas de Atributos

Quando certas pontuações são atingidas, o personagem pode desbloquear passivas ligadas a atributos.

## Limitações

- Máximo de **2 passivas por atributo**
- Máximo de **2 atributos** com passivas no total
- A segunda versão de uma passiva **substitui** a anterior (não soma)

## Lista (síntese)

- **Agilidade I**: +6 m de deslocamento  
- **Agilidade II**: +9 m de deslocamento e +1 reação por rodada  
- **Força I**: aumenta o dano corpo a corpo em 1 passo  
- **Força II**: +1 passo adicional e +1 dado de dano em ataques que usam Força  
- **Intelecto I**: +1 perícia ou proficiência extra e aumenta o treinamento de uma perícia  
- **Intelecto II**: +2 perícias/proficiências, aumenta o treinamento e +1 grau de aprimoramento (com restrições do mestre)  
- **Presença I**: +1 rodada antes de sucumbir ao Enlouquecendo  
- **Presença II**: +1 rodada adicional em Enlouquecendo, +6 PE, +6 EA e +3 no limite de PE/EA  
- **Vigor I**: +1 rodada antes de morrer ao entrar em Morrendo  
- **Vigor II**: +1 rodada adicional em Morrendo e soma o limite de PE/EA na vida máxima`,
              tags: ['intermediario', 'passivas', 'atributos'],
              palavrasChave: 'passiva atributo deslocamento reacao limite pe ea',
              nivelDificuldade: 'intermediario',
              ordem: 2,
              destaque: true,
            },
            {
              codigo: 'testes-sistema',
              titulo: 'Sistema de Testes',
              resumo: 'Testes com d20 (melhor resultado), desvantagem e testes unidos',
              conteudo: `# Sistema de Testes

## Testes básicos

1. Role um número de **d20** igual ao atributo ligado à perícia
2. Fique com o **melhor resultado**
3. Some o **bônus de treinamento** e outros modificadores
4. Compare com a **DT**
5. Se o resultado for **≥ DT**, você teve sucesso

## Desvantagem

Desvantagem reduz a rolagem em **-1d20** (ex.: AGI 3 vira 2d20).

## Rolagens zeradas ou negativas

- **0 dados**: role 2d20 e fique com o **pior**
- **-1 dados**: role 3d20 e fique com o **pior**
- E assim por diante

## Testes unidos

Quando uma ação depende de duas ou mais perícias:

- Some os dados de cada perícia
- Divida pela quantidade de perícias (arredonde para baixo)  
- Faça o mesmo com os bônus`,
              tags: ['iniciante', 'testes', 'mecanicas'],
              palavrasChave: 'teste pericia d20 dt desvantagem testes unidos',
              nivelDificuldade: 'iniciante',
              ordem: 3,
            },
          ],
        },
        {
          codigo: 'pericias',
          nome: 'Perícias',
          ordem: 2,
          artigos: [
            {
              codigo: 'lista-pericias-completa',
              titulo: 'Lista Completa de Perícias',
              resumo: 'Perícias do sistema (atributo base, necessidade de treinamento, kit e carga)',
              conteudo: `# Lista Completa de Perícias (síntese)

A ficha/Standalone traz a lista completa com atributo base, se é **somente treinada**, se sofre penalidade por **carga** e se exige **kit**.

> Observação: esta página é uma síntese. O texto integral por perícia está disponível na categoria “Standalone (texto integral)”.

## Combate
- **Luta (FOR)** — não é somente treinada  
- **Pontaria (AGI)** — não é somente treinada  
- **Jujutsu (INT)** — **somente treinada**

## Físicas
- **Acrobacia (AGI)** — carga  
- **Atletismo (FOR)**  
- **Fortitude (VIG)**  
- **Furtividade (AGI)** — carga  
- **Reflexos (AGI)**

## Mentais
- **Atualidades (INT)**
- **Ciências (INT)** — somente treinada
- **Investigação (INT)**
- **Intuição (PRE)**
- **Percepção (PRE)**
- **Tática (INT)** — somente treinada

## Sociais
- **Artes (PRE)** — somente treinada  
- **Diplomacia (PRE)**  
- **Enganação (PRE)** — pode exigir kit (p.ex., disfarce/falsificação)  
- **Intimidação (PRE)**

## Especiais
- **Adestramento (PRE)** — somente treinada  
- **Crime (AGI)** — somente treinada, carga e kit  
- **Medicina (INT)** — pode exigir kit  
- **Pilotagem (AGI)**
- **Profissão (INT)** — somente treinada  
- **Religião (PRE)** — somente treinada  
- **Sobrevivência (INT)**
- **Tecnologia (INT)** — somente treinada e kit  
- **Vontade (PRE)**

## Iniciativa
- **Iniciativa (AGI)** — determina a ordem de turno no combate`,
              tags: ['iniciante', 'referencia', 'pericias'],
              palavrasChave: 'pericia lista atributos kit carga somente treinada',
              nivelDificuldade: 'iniciante',
              ordem: 1,
              destaque: true,
            },
            {
              codigo: 'graus-treinamento',
              titulo: 'Graus de Treinamento',
              resumo: 'Bônus (+0/+5/+10/+15/+20) e níveis mínimos (1/3/9/16)',
              conteudo: `# Graus de Treinamento

## Bônus por grau (Standalone)

- Não Treinado: **+0**
- Treinado: **+5** (nível 1+)
- Graduado: **+10** (nível 3+)
- Veterano: **+15** (nível 9+)
- Expert: **+20** (nível 16+)

## Aumentos por nível

Nos níveis **3, 7, 11 e 16**, você escolhe até **2 + INT** perícias treinadas para ganhar +1 grau.

## Origens

Cada origem concede **duas perícias treinadas**, além de uma habilidade de origem.`,
              tags: ['iniciante', 'pericias', 'progressao'],
              palavrasChave: 'grau treinamento bonus treinado graduado veterano expert',
              nivelDificuldade: 'iniciante',
              ordem: 2,
            },
          ],
        },
        {
          codigo: 'caracteristicas-derivadas',
          nome: 'Características Derivadas',
          ordem: 3,
          artigos: [
            {
              codigo: 'pv-pe-ea-san-completo',
              titulo: 'PV, PE, EA e SAN',
              resumo: 'Fórmulas por classe e características derivadas essenciais',
              conteudo: `# Características Derivadas

## PV (Pontos de Vida)

| Classe | PV iniciais | PV por nível |
|:--|:--|:--|
| Combatente | 20 + VIG | 4 + VIG |
| Sentinela | 16 + VIG | 2 + VIG |
| Especialista | 16 + VIG | 3 + VIG |

## PE (Pontos de Esforço)

- Iniciais: **3 + PRE**
- Por nível: **3 + PRE**

## EA (Energia Amaldiçoada)

| Classe | EA iniciais | EA por nível | Observação |
|:--|:--|:--|:--|
| Combatente | 3 + (INT ou PRE) | 3 + (INT ou PRE) | escolha na criação |
| Sentinela | 4 + (INT ou PRE) | 4 + (INT ou PRE) | escolha na criação |
| Especialista | 4 + (INT ou PRE) | 4 + (INT ou PRE) | escolha na criação |

## SAN (Sanidade)

| Classe | SAN iniciais | SAN por nível |
|:--|:--:|:--:|
| Combatente | 12 | 3 |
| Sentinela | 12 | 4 |
| Especialista | 16 | 4 |

## Defesa

**Defesa = 10 + AGI + modificadores**

## Deslocamento

Padrão: **9 m** (6 quadrados) por ação de movimento (pode ser modificado por passivas e técnicas).

## Reações

- **Padrão**: **2 reações por rodada** (regra base do Standalone).
- Passivas/técnicas podem aumentar.

### Reações especiais de defesa (importante)

O Standalone define reações especiais de defesa que exigem treinamento e têm limite próprio (por padrão, você só pode usar uma dessas por rodada):

- **Bloqueio** (treinado em Fortitude): recebe RD igual ao bônus de Fortitude contra um ataque corpo a corpo.
- **Esquiva** (treinado em Reflexos): soma bônus de Reflexos à Defesa contra um ataque.
- **Contra-ataque** (treinado em Luta): se o atacante errar um ataque corpo a corpo, você pode retaliar com um ataque.

## Limite de PE/EA por turno

O limite cresce com o nível (ex.: nível 7 → limite 7).`,
              tags: ['iniciante', 'pv', 'pe', 'ea', 'san'],
              palavrasChave: 'pv pe ea san defesa deslocamento reacoes limite',
              nivelDificuldade: 'iniciante',
              ordem: 1,
              destaque: true,
            },
          ],
        },
      ],
    },

    {
      codigo: 'combate',
      nome: 'Combate e Ações',
      descricao: 'Estrutura do combate, iniciativa, ações, manobras, dano e reações',
      icone: 'campaign',
      cor: 'red',
      ordem: 2,
      subcategorias: [
        {
          codigo: 'combate-basico',
          nome: 'Combate Básico',
          ordem: 1,
          artigos: [
            {
              codigo: 'iniciativa-turnos-rodadas',
              titulo: 'Iniciativa, Turnos e Rodadas',
              resumo: 'Ordem de ação, estrutura de turno e regras-chave de iniciativa e reações',
              conteudo: `# Iniciativa, Turnos e Rodadas

## Rodada e turno

- Uma **rodada** representa cerca de **seis segundos** no mundo do jogo.
- Cada participante age uma vez por rodada: isso é o seu **turno**.

## Iniciativa

No início do combate:
- Cada jogador faz um **teste de Iniciativa**.
- O mestre faz **um único teste para todos os inimigos**. Se houver inimigos com bônus diferentes, use o **menor bônus** como referência para esse teste.
- A ordem se mantém durante todo o combate (não há “rerrolagem” por rodada).
- Em caso de empate, os empatados **rolam entre si** para desempatar.

## Ações no turno

No seu turno, você pode fazer:
- **1 ação padrão + 1 ação de movimento**, em qualquer ordem; ou
- **2 ações de movimento** (trocando a ação padrão por movimento); ou
- **1 ação completa** (abrindo mão de padrão e movimento).
Você também pode executar ações livres e reações, respeitando seus limites.

## Reações

- **Padrão**: **2 reações por rodada**.

### Reações especiais de defesa

Por padrão, você só pode usar **uma** destas reações especiais de defesa por rodada, e deve declarar antes do inimigo rolar o ataque:
- **Bloqueio** (treinado em Fortitude): ganha **RD = bônus de Fortitude** contra um ataque corpo a corpo.
- **Esquiva** (treinado em Reflexos): soma **bônus de Reflexos à sua Defesa** contra um ataque.
- **Contra-ataque** (treinado em Luta): quando o atacante errar um ataque corpo a corpo, você pode atacar de volta.`,
              tags: ['combate', 'iniciante', 'turnos'],
              palavrasChave: 'iniciativa turno rodada combate acao reacao',
              nivelDificuldade: 'iniciante',
              ordem: 1,
              destaque: true,
            },

            {
              codigo: 'manobras-combate',
              titulo: 'Manobras de Combate',
              resumo: 'Agarrar, derrubar, desarmar, empurrar, quebrar e ações relacionadas',
              conteudo: `# Manobras de Combate

Uma **manobra** é um ataque corpo a corpo para fazer algo diferente de causar dano (ex.: empurrar, desarmar).

## Regra base de manobra

- Não é possível fazer manobras com ataques à distância.
- Faça um **teste de manobra** (um teste de ataque corpo a corpo).
- O alvo se defende com um **teste oposto**. Mesmo que esteja usando arma à distância, ele usa **bônus de Luta**.
- Em caso de empate, outro teste deve ser feito.

## Agarrar

- O alvo fica **desprevenido e imóvel**, sofre **-1d20** nos ataques e só pode atacar com **armas leves**.
- Para se soltar: ação padrão e vencer um teste de manobra oposto.
- Enquanto agarra, você fica com uma mão ocupada e move-se com metade do deslocamento (arrastando o alvo).
- Só é possível agarrar com ataque desarmado.
- Ataques à distância contra um alvo envolvido em agarrar têm **50% de chance** de acertar o alvo errado.

## Derrubar

- Deixa o alvo **caído** (normalmente sem dano).
- Se você vencer o teste oposto por **5+**, além de derrubar, **empurra 1 quadrado** (1,5 m).
- Se isso o jogar além de um parapeito/precipício, o alvo pode fazer **Reflexos DT 20** para se agarrar.

## Desarmar

- Derruba um item que o alvo esteja segurando (normalmente cai no mesmo lugar do alvo).
- Se vencer por **5+**, o item também é **empurrado 1 quadrado**.

## Empurrar

- Empurra o alvo **1,5 m**.
- Para cada **5 pontos** de diferença entre os testes, empurra **+1,5 m**.
- Você pode gastar uma ação de movimento para avançar junto com o alvo (até seu limite de deslocamento).

## Quebrar

- Você atinge um item que o alvo esteja segurando.
- Use as regras de “quebrando objetos” conforme o Standalone.

## Atropelar (ação padrão durante movimento)

- Durante um movimento, você pode usar uma ação padrão para atropelar.
- O alvo pode dar passagem (sem teste) ou resistir; se resistir, faça teste de manobra oposto:
  - Se você vencer: deixa o alvo caído e continua.
  - Se o alvo vencer: impede seu avanço.

## Fintar (ação padrão)

- Faça um teste de **Enganação** oposto a **Reflexos** do alvo em alcance curto.
- Se vencer, o alvo fica **desprevenido contra seu próximo ataque** até o fim do seu próximo turno.`,
              tags: ['combate', 'intermediario', 'manobras'],
              palavrasChave: 'manobra lutar agarrar derrubar desarmar empurrar fintar atropelar',
              nivelDificuldade: 'intermediario',
              ordem: 2,
              destaque: true,
            },

            {
              codigo: 'dano-tipos-condicoes',
              titulo: 'Dano, Tipos e Estados Críticos',
              resumo: 'Tipos de dano, críticos, morrendo, dano massivo e dano não letal',
              conteudo: `# Dano, Tipos e Estados Críticos

## Dano (rolagem)

- Ao acertar um ataque, role dano conforme a arma.
- Em ataques corpo a corpo e arremesso, some **FOR** no dano (armas Ágeis podem usar AGI).
- O tipo de dano interage com resistências específicas do alvo.

## Tipos de dano (lista do Standalone)

- **Balístico**
- **Corte**
- **Eletricidade**
- **Fogo**
- **Frio**
- **Impacto**
- **Mental** (contra personagens reduz SAN)
- **Amaldiçoado (Jujutsu)**
- **Perfuração**
- **Químico**

## Acertos críticos

- Você faz acerto crítico ao rolar um valor **igual ou maior** que a **margem de ameaça** da arma.
- Multiplica **os dados de dano da arma** pelo multiplicador.
- Bônus numéricos e dados extras não são multiplicados.

## Machucado e Morrendo

- **Machucado**: metade ou menos dos PV totais (serve como gatilho, sem penalidade automática).
- **Morrendo**: ao chegar a 0 PV, você fica inconsciente e morrendo. Se iniciar três turnos morrendo na mesma cena, morre.

## Dano massivo

Se sofrer dano **≥ metade** dos PV totais de uma só vez e não cair a 0 PV:
- Faça Fortitude com **DT 15 + 2 para cada 10 pontos de dano sofridos**.
- Se falhar, role 1d6 e aplique a consequência:

| d6 | Consequência |
|:--:|:--|
| 1 | -1 VIG (até ser tratado) **e** decepamento (perde membro/parte relevante) |
| 2 | -1 AGI (até ser tratado) **e** perde metade do deslocamento |
| 3 | -1 FOR (até ser tratado) **e** perde 1 dado de dano em ataques corpo a corpo ou de disparo |
| 4 | -1 INT (até ser tratado) **e** -5 em rolagens de INT |
| 5 | -1 PRE **e** perde 1d6 PE e 1d6 SAN |
| 6 | Nada acontece |

## Dano não letal

- Soma com dano letal para inconsciência, mas não para ficar morrendo.
- Cura primeiro o dano não letal.
- Por padrão, dano é letal.
- Para causar dano não letal com arma corpo a corpo: **-5 no teste de ataque** (e o inverso também).`,
              tags: ['combate', 'iniciante', 'dano'],
              palavrasChave: 'dano tipos critico morrendo machucado dano massivo nao letal',
              nivelDificuldade: 'iniciante',
              ordem: 3,
            },
          ],
        },
      ],
    },

    {
      codigo: 'classes',
      nome: 'Classes',
      descricao: 'Combatente, Sentinela e Especialista',
      icone: 'school',
      cor: 'purple',
      ordem: 3,
      subcategorias: [
        {
          codigo: 'classes-base',
          nome: 'Classes Base',
          ordem: 1,
          artigos: [
            // Mantém estes textos conforme seu seed original, pois a base está alinhada ao Standalone.
            // Você pode expandi-los depois, mas o conteúdo integral está no Standalone importado.
            {
              codigo: 'combatente-completo',
              titulo: 'Combatente',
              resumo: 'Classe focada em confronto direto e amplificação de ataques via PE',
              conteudo: `# Combatente

Classe focada em confronto direto, amplificando ataques por meio de PE.

## Recurso de classe: Ataque Especial

Em um ataque, você pode gastar PE para receber bônus no teste de ataque **ou** na rolagem de dano:
- Nível 1: 2 PE → +5
- Nível 5: 3 PE → +10
- Nível 11: 4 PE → +15
- Nível 17: 5 PE → +20`,
              tags: ['classes', 'intermediario'],
              palavrasChave: 'combatente ataque especial pe',
              nivelDificuldade: 'intermediario',
              ordem: 1,
              destaque: true,
            },
            {
              codigo: 'sentinela-completo',
              titulo: 'Sentinela',
              resumo: 'Classe tática que aumenta temporariamente graus de aprimoramento',
              conteudo: `# Sentinela

Classe tática que controla o campo e aprimora técnicas.

## Recurso de classe: Aprimorado

Gasta PE para ganhar graus temporários (até o fim da cena):
- Nível 1: 2 PE → +1 grau
- Nível 5: 3 PE → +2 graus
- Nível 11: 4 PE → +3 graus
- Nível 17: 5 PE → +4 graus

> Observação: o Standalone também menciona “limite de no máximo 2 graus temporários na mesma técnica”.`,
              tags: ['classes', 'intermediario'],
              palavrasChave: 'sentinela aprimorado grau temporario',
              nivelDificuldade: 'intermediario',
              ordem: 2,
              destaque: true,
            },
            {
              codigo: 'especialista-completo',
              titulo: 'Especialista',
              resumo: 'Classe flexível com foco em perícias e resultados extremos fora do combate direto',
              conteudo: `# Especialista

Classe flexível, com recursos focados em perícias e versatilidade.

## Recurso de classe: Perito

Escolha perícias treinadas e gaste PE para somar dado extra ao resultado (ver Standalone para progressão e detalhes).`,
              tags: ['classes', 'intermediario'],
              palavrasChave: 'especialista perito pericia',
              nivelDificuldade: 'intermediario',
              ordem: 3,
              destaque: true,
            },
          ],
        },
      ],
    },

    {
      codigo: 'energia-amaldicoada',
      nome: 'Energia Amaldiçoada',
      descricao: 'Técnicas não inatas, feitiços básicos, barreiras e domínios (síntese)',
      icone: 'auto_fix_high',
      cor: 'green',
      ordem: 4,
      subcategorias: [
        {
          codigo: 'feiticos-basicos',
          nome: 'Feitiços Básicos',
          ordem: 1,
          artigos: [
            {
              codigo: 'revestimento-completo',
              titulo: 'Revestimento de Energia Amaldiçoada',
              resumo: 'Revestimento ofensivo/defensivo, variações e nota importante sobre sustentação',
              conteudo: `# Revestimento de Energia Amaldiçoada

Revestir corpo/armas com energia amaldiçoada para melhorar capacidades e permitir ferir maldições.

## Nota importante (sustentação)

O Standalone afirma que, em revestimentos sustentados, o **custo de sustentação é 1 EA por turno independente dos stacks**.
Além disso, sustentar **vários revestimentos** pode aumentar o custo total por turno.

## Revestimento ofensivo (sustentado)

- Execução: ação padrão
- Duração: sustentado
- Custo: 2 EA
- Efeito: **+1d6 de dano** OU **+3 no teste de ataque**
- Acumulável **mais 4 vezes** conforme grau de aprimoramento (aumenta custo inicial).

### Variação – Revestimento ofensivo momentâneo
- Execução: no ataque
- Duração: instantânea
- Custo: 1 EA

### Variação – Revestimento em munição
- Custo dobrado (2 EA por d6)
- Permite ferir maldições com tiros

## Revestimento defensivo (sustentado)

- Execução: ação padrão
- Duração: sustentado
- Custo: 2 EA
- Efeito: **+2 Defesa** OU **+2 RD**
- Acumulável até mais 4 vezes conforme grau (custo adicional conforme o Standalone).

### Variação – Revestimento defensivo momentâneo
- Execução: na reação
- Duração: instantânea
- Custo: 1 EA`,
              tags: ['jujutsu', 'iniciante', 'energia-amaldicoada'],
              palavrasChave: 'revestimento energia amaldiçoada ea rd defesa',
              nivelDificuldade: 'iniciante',
              ordem: 1,
              destaque: true,
            },
            {
              codigo: 'velocidade-amaldicoada-completa',
              titulo: 'Velocidade Amaldiçoada',
              resumo: 'Aumenta deslocamento e concede reação especial (acumulável)',
              conteudo: `# Velocidade Amaldiçoada

Canaliza energia amaldiçoada para potencializar velocidade e reação do corpo.

- Execução: ação padrão
- Alcance: pessoal
- Duração: sustentada
- Custo: **1 EA + 1 PE**
- Efeito: **+3 m** de deslocamento por rodada e **+1 reação especial**.
Cada acúmulo adiciona +3 m e +1 reação especial (até 5 acúmulos conforme grau).`,
              tags: ['jujutsu', 'iniciante', 'energia-amaldicoada'],
              palavrasChave: 'velocidade amaldiçoada deslocamento reacao especial',
              nivelDificuldade: 'iniciante',
              ordem: 2,
            },
            {
              codigo: 'fulgor-negro-completo',
              titulo: 'Fulgor Negro (Kokusen)',
              resumo: 'Fenômeno de amplificação em crítico, com custo em PE e recuperação de EA',
              conteudo: `# Fulgor Negro (Kokusen)

Fenômeno que amplifica o golpe quando a energia amaldiçoada é aplicada dentro de um milionésimo de segundo.

- Execução: no ataque corpo a corpo
- Duração: instantânea
- Custo: **2 PE**
- Efeito: se acertar um **crítico** no ataque em que ativou o Kokusen, você:
  - adiciona **+2 dados de dano** (ex.: 1d6 vira 3d6),
  - aumenta o multiplicador de crítico em **+1 passo** (ex.: 19×2 vira 19×3),
  - recupera **1 EA**.
Você precisa gastar os PE **antes** de saber se vai acertar o crítico.

## Poder genérico: Gênio do Kokusen

Todos os acertos críticos naturais se tornam Kokusen, drenando automaticamente 3 PE ao acertar.
Pré‑requisito: Treinado em Jujutsu e grau 2 em Técnica Amaldiçoada.`,
              tags: ['jujutsu', 'intermediario', 'energia-amaldicoada'],
              palavrasChave: 'kokusen fulgor negro critico pe ea',
              nivelDificuldade: 'intermediario',
              ordem: 3,
              destaque: true,
            },
          ],
        },
        {
          codigo: 'tecnicas-barreira',
          nome: 'Técnicas de Barreira',
          ordem: 2,
          artigos: [
            {
              codigo: 'cortina-barreira-simples',
              titulo: 'Barreira Simples e Cortina',
              resumo: 'Barreira com regras simples e variação Cortina (sem concentração)',
              conteudo: `# Barreira Simples e Cortina

## Barreira Simples

Erguer uma barreira com regras simples para ocultar, conter ou impedir entrada.

- Execução: ação completa
- Alcance: área adjacente (varia conforme tamanho)
- Duração: sustentado (**requer concentração**)
- Custo: **2 EA mínimo**; aumenta conforme complexidade e tamanho (regras simultâneas dependem do grau)
- Efeito: define regras simples (ex.: impedir entrada de seres específicos, ocultar de não‑feiticeiros, revelar maldições).

## Variação – Cortina

- **Não exige concentração**
- Barreira vasta e esférica cuja casca externa oculta o que está dentro da visão externa.
- Execução: ação completa (mesma base da Barreira Simples, salvo ajuste do mestre).`,
              tags: ['dominio', 'intermediario', 'barreira'],
              palavrasChave: 'cortina barreira simples tecnica de barreira concentracao',
              nivelDificuldade: 'intermediario',
              ordem: 1,
              destaque: true,
            },
            {
              codigo: 'expansao-dominio-completa',
              titulo: 'Expansão de Domínio',
              resumo: 'Pré-requisitos, custo base e efeito de acerto garantido',
              conteudo: `# Expansão de Domínio

Manifestar o domínio inato dentro de uma barreira.

## Pré-requisitos (síntese)

- Técnica inata
- Domínio inato (paisagem mental)
- Mudra pessoal
- Grau mínimo em Técnica de Barreira (grau 2 para expansão padrão; variantes têm requisitos adicionais)

## Execução e custo

- Execução: ação completa
- Alcance: raio de alcance curto
- Duração: sustentado
- Custo: **mínimo 6 EA + 2 PE** (pode subir em domínios avançados)
- Sustentação: varia; padrão citado: **2 EA** após erguer

## Efeito principal — Acerto garantido

Dentro do domínio, técnicas podem atingir automaticamente (sem teste), conforme as regras do usuário e do tipo de domínio.

## Tipos (síntese)

- Letal
- Aperfeiçoador
- Restritivo

> Para regras completas (colisão de domínios, domínio aberto, etc.), veja o Standalone (texto integral).`,
              tags: ['dominio', 'avancado', 'barreira'],
              palavrasChave: 'expansao dominio acerto garantido barreira',
              nivelDificuldade: 'avancado',
              ordem: 2,
              destaque: true,
            },
          ],
        },
      ],
    },
  ];

  return categorias;
}

async function aplicarSeedEstruturado(categorias: CategoriaDef[]) {
  let categoriasCriadas = 0;
  let subcategoriasCriadas = 0;
  let artigosCriados = 0;

  for (const catDef of categorias) {
    const cat = await prisma.compendioCategoria.create({
      data: {
        codigo: catDef.codigo,
        nome: catDef.nome,
        descricao: catDef.descricao,
        icone: catDef.icone,
        cor: catDef.cor,
        ordem: catDef.ordem,
      },
    });
    categoriasCriadas++;

    for (const subDef of catDef.subcategorias) {
      const sub = await prisma.compendioSubcategoria.create({
        data: {
          codigo: subDef.codigo,
          nome: subDef.nome,
          categoriaId: cat.id,
          ordem: subDef.ordem,
        },
      });
      subcategoriasCriadas++;

      await prisma.compendioArtigo.createMany({
        data: subDef.artigos.map((a) => ({
          codigo: a.codigo,
          titulo: a.titulo,
          resumo: a.resumo,
          conteudo: a.conteudo,
          subcategoriaId: sub.id,
          tags: uniq(a.tags),
          palavrasChave: a.palavrasChave,
          nivelDificuldade: a.nivelDificuldade,
          ordem: a.ordem,
          destaque: a.destaque ?? false,
        })),
      });

      artigosCriados += subDef.artigos.length;
    }
  }

  return { categoriasCriadas, subcategoriasCriadas, artigosCriados };
}

async function seedStandaloneTextoIntegral(pdfPath: string) {
  const texto = await extrairTextoStandalone(pdfPath);
  const capitulos = splitCapitulosStandalone(texto);

  const catStandalone = await prisma.compendioCategoria.create({
    data: {
      codigo: 'standalone-texto-integral',
      nome: 'Standalone (texto integral)',
      descricao: 'Conteúdo extraído do PDF Standalone, segmentado por capítulo (fonte da verdade)',
      icone: 'picture_as_pdf',
      cor: 'gray',
      ordem: 5,
    },
  });

  let subCriadas = 0;
  let artCriados = 0;

  for (const c of capitulos) {
    const capNum = c.cap === 0 ? 'geral' : String(c.cap).padStart(2, '0');
    const subCodigo = `standalone-capitulo-${capNum}`;
    const subNome = c.cap === 0 ? 'Texto integral' : `Capítulo ${c.cap} — ${c.titulo}`;

    const sub = await prisma.compendioSubcategoria.create({
      data: {
        codigo: subCodigo,
        nome: subNome,
        categoriaId: catStandalone.id,
        ordem: c.cap === 0 ? 1 : c.cap,
      },
    });
    subCriadas++;

    const corpo = c.corpo || '(Sem texto extraido para este capitulo.)';
    const partes = chunkTexto(corpo, 50000);
    const codigoBase = `standalone-capitulo-${capNum}-texto`;

    for (let idx = 0; idx < partes.length; idx++) {
      const parte = partes[idx];
      const sufixo = partes.length > 1 ? `-parte-${idx + 1}` : '';
      const artigoCodigo = `${codigoBase}${sufixo}`;
      const tituloParte = partes.length > 1 ? `${subNome} - Parte ${idx + 1}/${partes.length}` : subNome;
      const md = `# ${tituloParte}\n\n${parte}`;

      await prisma.compendioArtigo.create({
        data: {
          codigo: artigoCodigo,
          titulo: tituloParte,
          resumo: clampResumo(parte || 'Conteudo extraido do Standalone.'),
          conteudo: md,
          subcategoriaId: sub.id,
          tags: ['standalone', 'texto-integral', 'fonte-da-verdade'],
          palavrasChave: slugify(subNome).replace(/-/g, ' '),
          nivelDificuldade: 'iniciante',
          ordem: idx + 1,
          destaque: false,
        },
      });
      artCriados++;
    }
  }

  return { subCriadas, artCriados };
}

async function main() {
  console.log('Iniciando seed do Compêndio (corrigido) baseado no Standalone...\n');

  const pdfPath =
    process.env.STANDALONE_PDF_PATH ||
    'prisma/seeds/compendio/assets/Jujutsu Kaisen RPG - Standalone.pdf';

  try {
    console.log('Limpando dados anteriores...');
    await prisma.compendioArtigo.deleteMany({});
    await prisma.compendioSubcategoria.deleteMany({});
    await prisma.compendioCategoria.deleteMany({});
    console.log('Dados anteriores limpos.\n');

    console.log('Criando categorias curadas...');
    const categoriasCuradas = await seedCategoriasCuradas();
    const resCurado = await aplicarSeedEstruturado(categoriasCuradas);

    console.log('Importando Standalone (texto integral)...');
    const resStandalone = await seedStandaloneTextoIntegral(pdfPath);

    const totalCategorias = resCurado.categoriasCriadas + 1; // + standalone
    const totalSubcats = resCurado.subcategoriasCriadas + resStandalone.subCriadas;
    const totalArtigos = resCurado.artigosCriados + resStandalone.artCriados;

    console.log('\nSeed finalizado com sucesso!');
    console.log('Resumo:');
    console.log(`- Categorias: ${totalCategorias}`);
    console.log(`- Subcategorias: ${totalSubcats}`);
    console.log(`- Artigos: ${totalArtigos}`);
    console.log('\nObservação: o conteúdo integral está em "Standalone (texto integral)".');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Falha na execução do seed:', e);
  process.exit(1);
});
