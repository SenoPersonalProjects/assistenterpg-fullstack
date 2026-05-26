import { PrismaClient } from '@prisma/client';
import { seedTecnicasNaoInatas } from './tecnicas-nao-inatas';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando seed isolado de técnicas não inatas...');
    await seedTecnicasNaoInatas(prisma);
    console.log('Seed isolado de técnicas não inatas concluído.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro ao executar seed isolado de técnicas não inatas.');
  console.error(error);
  process.exit(1);
});
