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
  'Produção Acelerada': 'bolt',
  Sangrando: 'heart',
  Silenciado: 'volume-off',
  Surdo: 'volume-off',
  Surpreendido: 'warning',
  Vulnerável: 'target',
  Insano: 'spirit',
  Morto: 'error',
};

export const condicoesSeed: SeedCondicao[] = [
  {
    nome: 'Abalado',
    descricao:
      'Sofre -1d20 em testes. Se ficar abalado novamente, em vez disso fica Apavorado. Condição de medo.',
  },
  {
    nome: 'Agarrado',
    descricao:
      'Fica desprevenido e imóvel, sofre -1d20 em testes de ataque e só pode atacar com armas leves. Ataques á distância contra alvos envolvidos em agarrar podem acertar o alvo errado (50%). Condição de paralisia.',
  },
  {
    nome: 'Alquebrado',
    descricao:
      'O custo em pontos de esforço das habilidades e dos rituais aumenta em +1. Condição mental.',
  },
  {
    nome: 'Apavorado',
    descricao:
      'Sofre -2d20 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível. Condição de medo.',
  },
  {
    nome: 'Asfixiado',
    descricao:
      'Não pode respirar. Pode prender a respiracao por Vigor rodadas; depois testa Fortitude por rodada (DT 5 +5 cumulativa). Se falhar, cai inconsciente e perde 1d6 PV por rodada até respirar novamente ou morrer.',
  },
  {
    nome: 'Atordoado',
    descricao: 'Fica desprevenido e não pode fazer ações. Condição mental.',
  },
  {
    nome: 'Caido',
    descricao:
      'No chao. Sofre -2d20 em ataques corpo a corpo e deslocamento reduzido a 1,5m; Defesa -5 contra corpo a corpo e +5 contra distancia.',
  },
  {
    nome: 'Cego',
    descricao:
      'Fica desprevenido e lento, não observa com Percepção, sofre -2d20 em perícias de Força/Agilidade e todos os alvos têm camuflagem total. Condição de sentidos.',
  },
  {
    nome: 'Confuso',
    descricao:
    'No início do turno, role 1d6 para comportamento aleatório: mover aleatório, não agir, atacar o mais próximo, ou sair da condição. Condição mental.',
  },
  {
    nome: 'Debilitado',
    descricao:
      'Sofre -2d20 em testes de Agilidade, Força e Vigor. Se ficar Debilitado novamente, fica Inconsciente.',
  },
  {
    nome: 'Desprevenido',
    descricao: 'Sofre -5 na Defesa e -1d20 em Reflexos.',
  },
  {
    nome: 'Doente',
    descricao: 'Sob efeito de uma doença.',
  },
  {
    nome: 'Em Chamas',
    descricao:
      'No início dos turnos sofre 1d6 de dano de fogo até apagar as chamas (ação padrão) ou por imersão em água.',
  },
  {
    nome: 'Enjoado',
    descricao:
      'Só pode realizar ação padrão ou de movimento por rodada (não ambas).',
  },
  {
    nome: 'Enlouquecendo',
    descricao:
      'Se iniciar 3 turnos Enlouquecendo na mesma cena, fica Insano. Pode encerrar com Diplomacia (DT 20 +5 por acalmada na cena) ou cura de pelo menos 1 SAN.',
  },
  {
    nome: 'Enredado',
    descricao:
      'Fica lento, vulnerável e sofre -1d20 em testes de ataque. Condição de paralisia.',
  },
  {
    nome: 'Envenenado',
    descricao:
    'Efeito varia por veneno: pode impor outra condição ou dano recorrente; duração definida pelo veneno (padrão: cena).',
  },
  {
    nome: 'Esmorecido',
    descricao:
      'Sofre -2d20 em testes de Intelecto e Presença. Condição mental.',
  },
  {
    nome: 'Exausto',
    descricao:
      'Fica Debilitado, Lento e Vulnerável; se receber novamente, fica Inconsciente. Condição de fadiga.',
  },
  {
    nome: 'Fascinado',
    descricao:
      'A atenção fica presa no foco; sofre -2d20 em Percepção e não pode agir além de observar o foco. Ação hostil quebra a condição. Condição mental.',
  },
  {
    nome: 'Fatigado',
    descricao:
      'Fica Fraco e Vulnerável; se receber novamente, vira Exausto. Condição de fadiga.',
  },
  {
    nome: 'Fraco',
    descricao:
      'Sofre -1d20 em testes de Agilidade, Força e Vigor; se receber novamente, vira Debilitado.',
  },
  {
    nome: 'Frustrado',
    descricao:
      'Sofre -1d20 em testes de Intelecto e Presença; se receber novamente, vira Esmorecido. Condição mental.',
  },
  {
    nome: 'Imovel',
    descricao: 'Todas as formas de deslocamento vão para 0m. Condição de paralisia.',
  },
  {
    nome: 'Inconsciente',
    descricao: 'Fica indefeso e não pode fazer ações, incluindo reações.',
  },
  {
    nome: 'Indefeso',
    descricao:
      'É considerado desprevenido, sofre -10 na Defesa, falha automaticamente em Reflexos e pode sofrer golpe de misericórdia.',
  },
  {
    nome: 'Cura Acelerada',
    descricao:
    'No início de cada turno do alvo, recupera PV igual ao valor atual de acúmulos desta condição. Não possui limite global; limites podem ser definidos por fonte.',
  },
  {
    nome: 'Lento',
    descricao:
      'Todas as formas de deslocamento ficam pela metade; não pode correr ou investir. Condição de paralisia.',
  },
  {
    nome: 'Machucado',
    descricao: 'Metade ou menos dos pontos de vida totais.',
  },
  {
    nome: 'Morrendo',
    descricao:
      'Com 0 PV. Se iniciar 3 turnos Morrendo na mesma cena, morre. Pode ser encerrada com Medicina (DT 20 +5 por estabilização na cena) ou efeitos específicos.',
  },
  {
    nome: 'Ofuscado',
    descricao:
      'Sofre -1d20 em testes de ataque e de Percepção. Condição de sentidos.',
  },
  {
    nome: 'Paralisado',
    descricao:
      'Fica imóvel e indefeso e só pode realizar ações puramente mentais. Condição de paralisia.',
  },
  {
    nome: 'Pasmo',
    descricao: 'Não pode fazer ações. Condição mental.',
  },
  {
    nome: 'Perturbado',
    descricao:
      'Na primeira vez em cada cena em que isso acontece, recebe um efeito de insanidade.',
  },
  {
    nome: 'Petrificado',
    descricao: 'Fica Inconsciente e recebe resistência a dano 10.',
  },
  {
    nome: 'Produção Acelerada',
    descricao:
    'No início de cada turno do alvo, recupera EA igual ao valor atual de acúmulos desta condição. Pela fonte Kokusen, acumula até Produção Acelerada 5.',
  },
  {
    nome: 'Sangrando',
    descricao:
      'No início do turno testa Vigor (DT 20): se passar estabiliza; se falhar perde 1d6 PV e continua sangrando. Medicina (ação completa, DT 20) também estabiliza.',
  },
  {
    nome: 'Silenciado',
    descricao:
      'Não pode usar habilidades que exigem fala/encantamento. Pode usar subtração nas técnicas.',
  },
  {
    nome: 'Surdo',
    descricao:
      'Não faz testes de Percepção para ouvir, sofre -2d20 em Iniciativa e é considerado ruim para rituais. Condição de sentidos.',
  },
  {
    nome: 'Surpreendido',
    descricao:
      'Não ciente dos inimigos; fica Desprevenido e não pode agir.',
  },
  {
    nome: 'Vulnerável',
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

  const producaoAceleradaCanonica = await prisma.condicao.findUnique({
    where: { nome: 'Produção Acelerada' },
    select: { id: true },
  });
  if (!producaoAceleradaCanonica) {
    await prisma.condicao.updateMany({
      where: { nome: 'Produção Acelerada' },
      data: { nome: 'Produção Acelerada' },
    });
  }

  for (const data of condicoesSeed) {
    const icone = data.icone ?? CONDICOES_ICONES[data.nome] ?? 'status';
    await prisma.condicao.upsert({
      where: { nome: data.nome },
      update: { descricao: data.descricao, icone },
      create: { ...data, icone },
    });
  }
}
