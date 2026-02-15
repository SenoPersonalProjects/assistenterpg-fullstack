import type { PrismaClient } from '@prisma/client';
import type { SeedResistenciaTipo } from '../_types';

export const resistenciasTipoSeed: SeedResistenciaTipo[] = [
  {
    codigo: 'DANO',
    nome: 'Dano',
    descricao: 'Termo guarda-chuva para todos os danos fora Mental.',
  },
  {
    codigo: 'BALISTICO',
    nome: 'Balístico',
    descricao: 'Dano de tiros, disparos de armas de fogo no geral.',
  },
  {
    codigo: 'IMPACTO',
    nome: 'Impacto',
    descricao: 'Dano de pancadas, quedas, marretas, explosões sem estilhaços.',
  },
  { codigo: 'CORTE', 
    nome: 'Corte', 
    descricao: 'Dano de lâminas e golpes que rasgam ou decepam.' 
  },
  {
    codigo: 'PERFURACAO',
    nome: 'Perfuração',
    descricao: 'Dano de lanças, projéteis perfurantes, facas e estilhaços.',
  },
  { codigo: 'FOGO', 
    nome: 'Fogo', 
    descricao: 'Dano de chamas, calor intenso e técnicas pirotécnicas.' },
  {
    codigo: 'ELETRICIDADE',
    nome: 'Eletricidade',
    descricao: 'Dano de choques, relâmpagos e técnicas elétricas.',
  },
  { codigo: 'FRIO', nome: 'Frio', descricao: 'Dano causado por gelo extremo ou redução brutal de temperatura.' },
  {
    codigo: 'ENERGIA_AMALDICOADA',
    nome: 'Energia Amaldiçoada',
    descricao: 'Dano direto de Jujutsu e de técnicas que canalizam maldições.',
  },
  {
    codigo: 'ENERGIA_POSITIVA',
    nome: 'Energia Positiva',
    descricao:
      'Dano ou efeito de técnicas de cura e purificação quando usadas ofensivamente contra maldições.',
  },
  {
    codigo: 'MENTAL',
    nome: 'Mental',
    descricao: 'Dano de sanidade, pânico, terror psíquico e outras agressões à mente.',
  },
  {
    codigo: 'FISICO',
    nome: 'Físico',
    descricao: 'Termo guarda-chuva para danos do tipo BALÍSTICO, IMPACTO, CORTE e PERFURAÇÃO.',
  },
  {
    codigo: 'SOBRENATURAL',
    nome: 'Dano sobrenatural',
    descricao: 'Termo guarda-chuva para danos do tipo ENERGIA AMALDIÇOADA (JUJUTSU) ou ENERGIA POSITIVA.',
  },
  {
    codigo: 'MUNDANO',
    nome: 'Mundano',
    descricao: 'Termo guarda-chuva para danos do tipo ELÉTRICO, FRIO, FOGO.',
  },

];

export async function seedResistencias(prisma: PrismaClient) {
  console.log('Cadastrando tipos de resistência...');
  for (const data of resistenciasTipoSeed) {
    await prisma.resistenciaTipo.upsert({
      where: { codigo: data.codigo },
      update: { nome: data.nome, descricao: data.descricao ?? null },
      create: { ...data, descricao: data.descricao ?? null },
    });
  }
}
