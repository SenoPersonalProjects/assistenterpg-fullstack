import { PrismaClient } from '@prisma/client';
import { seedCompendioLivros } from './livros';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed idempotente do compêndio...');
  await seedCompendioLivros(prisma);
  console.log('Seed do compêndio finalizado.');
}

main()
  .catch((error) => {
    console.error('Falha na execução do seed do compêndio:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
