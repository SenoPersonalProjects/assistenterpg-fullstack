import type { PrismaClient } from '@prisma/client';
import type { SeedAlinhamento } from '../_types';

export const alinhamentosSeed: SeedAlinhamento[] = [
  {
    nome: 'Leal e Bom (LB)',
    descricao:
      'Pessoas leais e bondosas que valorizam a justiça, respeitam a lei e se sacrificam para ajudar os necessitados, cumprindo promessas e dizendo a verdade.',
  },
  {
    nome: 'Neutro e Bom (NB)',
    descricao:
      'Indivíduos de bom coração que sentem prazer com a felicidade dos outros e colocam ajudar o próximo acima de seguir ordens ou leis rígidas.',
  },
  {
    nome: 'Caótico e Bom (CB)',
    descricao:
      'Espíritos livres que promovem o bem seguindo seus próprios instintos, dispostos a burlar regras e até trapacear para proteger e alegrar os menos afortunados.',
  },
  {
    nome: 'Leal e Neutro (LN)',
    descricao:
      'Pessoas metódicas e disciplinadas que obedecem leis e cumprem promessas a qualquer custo, priorizando ordem e dever acima de considerações pessoais.',
  },
  {
    nome: 'Neutro (N)',
    descricao:
      'Indivíduos que buscam equilíbrio ou simplesmente seguem o bom senso, sem fortes inclinações para bem, mal, lei ou caos, preferindo conviver com pessoas justas.',
  },
  {
    nome: 'Caótico e Neutro (CN)',
    descricao:
      'Pessoas impulsivas que fazem o que querem quando querem, valorizando a própria liberdade acima de regras ou expectativas alheias, muitas vezes imprevisíveis.',
  },
  {
    nome: 'Leal e Mau (LM)',
    descricao:
      'Vilões que acreditam que ordem, tradição e códigos de conduta importam mais que liberdade ou dignidade, seguindo regras rígidas mesmo quando causam sofrimento.',
  },
  {
    nome: 'Neutro e Mau (NM)',
    descricao:
      'Egoístas que colocam sempre a si mesmos em primeiro lugar, roubando, enganando ou traindo aliados sempre que isso lhes traz vantagem pessoal.',
  },
  {
    nome: 'Caótico e Mau (CM)',
    descricao:
      'Criaturas verdadeiramente cruéis que sentem prazer no sofrimento alheio, inclinadas a violência gratuita e destruição, quase incapazes de viver em sociedade.',
  },
];

export async function seedAlinhamentos(prisma: PrismaClient) {
  console.log('Cadastrando alinhamentos...');
  for (const data of alinhamentosSeed) {
    await prisma.alinhamento.upsert({
      where: { nome: data.nome },
      update: { descricao: data.descricao ?? null },
      create: { ...data, descricao: data.descricao ?? null },
    });
  }
}
