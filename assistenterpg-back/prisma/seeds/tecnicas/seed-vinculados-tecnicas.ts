import { PrismaClient } from '@prisma/client';
import { seedConfiguracoesVinculadosTecnicas } from './vinculados-tecnicas';

const prisma = new PrismaClient();

seedConfiguracoesVinculadosTecnicas(prisma)
  .then(() => console.log('Configuracoes de vinculados por tecnica atualizadas.'))
  .finally(() => prisma.$disconnect());
