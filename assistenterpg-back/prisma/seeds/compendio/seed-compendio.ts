import { PrismaClient } from '@prisma/client';
import { seedCompendioLivros } from './livros';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed idempotente do compendio...');
  await seedCompendioLivros(prisma);
  console.log('Seed do compendio finalizado.');
}

main()
  .catch((error) => {
    console.error('Falha na execucao do seed do compendio:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
