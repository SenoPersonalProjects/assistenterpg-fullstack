import { PrismaClient } from '@prisma/client';
import { seedSobrevivendoAoJujutsu } from './sobrevivendo-ao-jujutsu';
import { seedEquipamentosModificacoesAplicaveis } from '../relacoes/equipamentos-modificacoes-aplicaveis';

async function main() {
  const prisma = new PrismaClient();

  try {
    await seedSobrevivendoAoJujutsu(prisma);
    await seedEquipamentosModificacoesAplicaveis(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Falha ao executar seed do suplemento Sobrevivendo ao Jujutsu.');
  console.error(error);
  process.exit(1);
});
