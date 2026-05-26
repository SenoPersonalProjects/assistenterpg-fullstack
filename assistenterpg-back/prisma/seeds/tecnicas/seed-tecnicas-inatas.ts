import { PrismaClient } from '@prisma/client';
import { seedTecnicasInatas } from './tecnicas-inatas';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando seed isolado de técnicas inatas...');
    await seedTecnicasInatas(prisma);
    console.log('Seed isolado de técnicas inatas concluído.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro ao executar seed isolado de técnicas inatas.');
  console.error(error);
  process.exit(1);
});
