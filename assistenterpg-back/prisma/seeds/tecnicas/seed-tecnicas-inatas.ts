import { PrismaClient } from '@prisma/client';
import { seedTecnicasInatas } from './tecnicas-inatas';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando seed isolado de tecnicas inatas...');
    await seedTecnicasInatas(prisma);
    console.log('Seed isolado de tecnicas inatas concluido.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro ao executar seed isolado de tecnicas inatas.');
  console.error(error);
  process.exit(1);
});
