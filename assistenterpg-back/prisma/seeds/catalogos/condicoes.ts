import type { PrismaClient } from '@prisma/client';
import type { SeedCondicao } from '../_types';

const CONDICOES_ICONES: Record<string, string> = {
  Abalado: 'warning',
  Agarrado: 'link',
  Alquebrado: 'bolt',
  Apavorado: 'error',
  Asfixiado: 'volume-off',
  Atordoado: 'status',
  Caido: 'minimize',
  Cego: 'eyeOff',
  Confuso: 'shuffle',
  Debilitado: 'fail',
  Desprevenido: 'warning',
  Doente: 'beaker',
  'Em Chamas': 'fire',
  Enjoado: 'status',
  Enlouquecendo: 'spirit',
  Enredado: 'link',
  Envenenado: 'beaker',
  Esmorecido: 'fail',
  Exausto: 'minus',
  Fascinado: 'sparkles',
  Fatigado: 'minus',
  Fraco: 'minus',
  Frustrado: 'error',
  Imovel: 'lock',
  Inconsciente: 'moon',
  Indefeso: 'shield-defense',
  'Cura Acelerada': 'heart',
  Lento: 'minimize',
  Machucado: 'heart',
  Morrendo: 'warning',
  Ofuscado: 'sun',
  Paralisado: 'lock',
  Pasmo: 'status',
  Perturbado: 'spirit',
  Petrificado: 'stop',
  'Producao Acelerada': 'bolt',
  Sangrando: 'heart',
  Silenciado: 'volume-off',
  Surdo: 'volume-off',
  Surpreendido: 'warning',
  Vulneravel: 'target',
  Insano: 'spirit',
  Morto: 'error',
};

export const condicoesSeed: SeedCondicao[] = [
  {
    nome: 'Abalado',
    descricao:
      'Sofre -1d20 em testes. Se ficar abalado novamente, em vez disso fica Apavorado. Condicao de medo.',
  },
  {
    nome: 'Agarrado',
    descricao:
      'Fica desprevenido e imovel, sofre -1d20 em testes de ataque e so pode atacar com armas leves. Ataques a distancia contra alvos envolvidos em agarrar podem acertar o alvo errado (50%). Condicao de paralisia.',
  },
  {
    nome: 'Alquebrado',
    descricao:
      'O custo em pontos de esforco das habilidades e dos rituais aumenta em +1. Condicao mental.',
  },
  {
    nome: 'Apavorado',
    descricao:
      'Sofre -2d20 em testes de pericia e deve fugir da fonte do medo da maneira mais eficiente possivel. Condicao de medo.',
  },
  {
    nome: 'Asfixiado',
    descricao:
      'Nao pode respirar. Pode prender a respiracao por Vigor rodadas; depois testa Fortitude por rodada (DT 5 +5 cumulativa). Se falhar, cai inconsciente e perde 1d6 PV por rodada ate respirar novamente ou morrer.',
  },
  {
    nome: 'Atordoado',
    descricao: 'Fica desprevenido e nao pode fazer acoes. Condicao mental.',
  },
  {
    nome: 'Caido',
    descricao:
      'No chao. Sofre -2d20 em ataques corpo a corpo e deslocamento reduzido a 1,5m; Defesa -5 contra corpo a corpo e +5 contra distancia.',
  },
  {
    nome: 'Cego',
    descricao:
      'Fica desprevenido e lento, nao observa com Percepcao, sofre -2d20 em pericias de Forca/Agilidade e todos os alvos tem camuflagem total. Condicao de sentidos.',
  },
  {
    nome: 'Confuso',
    descricao:
      'No inicio do turno, role 1d6 para comportamento aleatorio: mover aleatorio, nao agir, atacar o mais proximo, ou sair da condicao. Condicao mental.',
  },
  {
    nome: 'Debilitado',
    descricao:
      'Sofre -2d20 em testes de Agilidade, Forca e Vigor. Se ficar Debilitado novamente, fica Inconsciente.',
  },
  {
    nome: 'Desprevenido',
    descricao: 'Sofre -5 na Defesa e -1d20 em Reflexos.',
  },
  {
    nome: 'Doente',
    descricao: 'Sob efeito de uma doenca.',
  },
  {
    nome: 'Em Chamas',
    descricao:
      'No inicio dos turnos sofre 1d6 de dano de fogo ate apagar as chamas (acao padrao) ou por imersao em agua.',
  },
  {
    nome: 'Enjoado',
    descricao:
      'So pode realizar acao padrao ou de movimento por rodada (nao ambas).',
  },
  {
    nome: 'Enlouquecendo',
    descricao:
      'Se iniciar 3 turnos Enlouquecendo na mesma cena, fica Insano. Pode encerrar com Diplomacia (DT 20 +5 por acalmada na cena) ou cura de pelo menos 1 SAN.',
  },
  {
    nome: 'Enredado',
    descricao:
      'Fica lento, vulneravel e sofre -1d20 em testes de ataque. Condicao de paralisia.',
  },
  {
    nome: 'Envenenado',
    descricao:
      'Efeito varia por veneno: pode impor outra condicao ou dano recorrente; duracao definida pelo veneno (padrao: cena).',
  },
  {
    nome: 'Esmorecido',
    descricao:
      'Sofre -2d20 em testes de Intelecto e Presenca. Condicao mental.',
  },
  {
    nome: 'Exausto',
    descricao:
      'Fica Debilitado, Lento e Vulneravel; se receber novamente, fica Inconsciente. Condicao de fadiga.',
  },
  {
    nome: 'Fascinado',
    descricao:
      'A atencao fica presa no foco; sofre -2d20 em Percepcao e nao pode agir alem de observar o foco. Acao hostil quebra a condicao. Condicao mental.',
  },
  {
    nome: 'Fatigado',
    descricao:
      'Fica Fraco e Vulneravel; se receber novamente, vira Exausto. Condicao de fadiga.',
  },
  {
    nome: 'Fraco',
    descricao:
      'Sofre -1d20 em testes de Agilidade, Forca e Vigor; se receber novamente, vira Debilitado.',
  },
  {
    nome: 'Frustrado',
    descricao:
      'Sofre -1d20 em testes de Intelecto e Presenca; se receber novamente, vira Esmorecido. Condicao mental.',
  },
  {
    nome: 'Imovel',
    descricao: 'Todas as formas de deslocamento vao para 0m. Condicao de paralisia.',
  },
  {
    nome: 'Inconsciente',
    descricao: 'Fica indefeso e nao pode fazer acoes, incluindo reacoes.',
  },
  {
    nome: 'Indefeso',
    descricao:
      'E considerado desprevenido, sofre -10 na Defesa, falha automaticamente em Reflexos e pode sofrer golpe de misericordia.',
  },
  {
    nome: 'Cura Acelerada',
    descricao:
      'No inicio de cada turno do alvo, recupera PV igual ao valor atual de acumulos desta condicao. Nao possui limite global; limites podem ser definidos por fonte.',
  },
  {
    nome: 'Lento',
    descricao:
      'Todas as formas de deslocamento ficam pela metade; nao pode correr ou investir. Condicao de paralisia.',
  },
  {
    nome: 'Machucado',
    descricao: 'Metade ou menos dos pontos de vida totais.',
  },
  {
    nome: 'Morrendo',
    descricao:
      'Com 0 PV. Se iniciar 3 turnos Morrendo na mesma cena, morre. Pode ser encerrada com Medicina (DT 20 +5 por estabilizacao na cena) ou efeitos especificos.',
  },
  {
    nome: 'Ofuscado',
    descricao:
      'Sofre -1d20 em testes de ataque e de Percepcao. Condicao de sentidos.',
  },
  {
    nome: 'Paralisado',
    descricao:
      'Fica imovel e indefeso e so pode realizar acoes puramente mentais. Condicao de paralisia.',
  },
  {
    nome: 'Pasmo',
    descricao: 'Nao pode fazer acoes. Condicao mental.',
  },
  {
    nome: 'Perturbado',
    descricao:
      'Na primeira vez em cada cena em que isso acontece, recebe um efeito de insanidade.',
  },
  {
    nome: 'Petrificado',
    descricao: 'Fica Inconsciente e recebe resistencia a dano 10.',
  },
  {
    nome: 'Producao Acelerada',
    descricao:
      'No inicio de cada turno do alvo, recupera EA igual ao valor atual de acumulos desta condicao. Pela fonte Kokusen, acumula ate Producao Acelerada 5.',
  },
  {
    nome: 'Sangrando',
    descricao:
      'No inicio do turno testa Vigor (DT 20): se passar estabiliza; se falhar perde 1d6 PV e continua sangrando. Medicina (acao completa, DT 20) tambem estabiliza.',
  },
  {
    nome: 'Silenciado',
    descricao:
      'Nao pode usar habilidades que exigem fala/encantamento. Pode usar subtracao nas tecnicas.',
  },
  {
    nome: 'Surdo',
    descricao:
      'Nao faz testes de Percepcao para ouvir, sofre -2d20 em Iniciativa e e considerado ruim para rituais. Condicao de sentidos.',
  },
  {
    nome: 'Surpreendido',
    descricao:
      'Nao ciente dos inimigos; fica Desprevenido e nao pode agir.',
  },
  {
    nome: 'Vulneravel',
    descricao: 'Sofre -2 na Defesa.',
  },
  {
    nome: 'Insano',
    descricao:
      'Resultado de iniciar turnos suficientes em Enlouquecendo na mesma cena.',
  },
  {
    nome: 'Morto',
    descricao:
      'Resultado de iniciar turnos suficientes em Morrendo na mesma cena.',
  },
];

export async function seedCondicoes(prisma: PrismaClient) {
  console.log('Cadastrando condicoes...');

  for (const data of condicoesSeed) {
    const icone = data.icone ?? CONDICOES_ICONES[data.nome] ?? 'status';
    await prisma.condicao.upsert({
      where: { nome: data.nome },
      update: { descricao: data.descricao, icone },
      create: { ...data, icone },
    });
  }
}
