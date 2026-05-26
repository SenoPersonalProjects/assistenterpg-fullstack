import { PrismaClient } from '@prisma/client';

import { seedEquipamentosArmas } from './equipamentos-armas';
import { seedFerramentasAmaldicoadas } from './equipamentos-ferramentas-amaldicoadas';
import { seedEquipamentosMunicoes } from './equipamentos-municoes';
import { seedEquipamentosProtecoes } from './equipamentos-protecoes';
import { seedEquipamentosUtilitarios } from './equipamentos-utilitarios';
import { seedEquipamentosSobrevivendoAoJujutsu } from '../suplementos/sobrevivendo-ao-jujutsu';

const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando catálogo de equipamentos...');

  await seedEquipamentosArmas(prisma);
  await seedEquipamentosMunicoes(prisma);
  await seedEquipamentosProtecoes(prisma);
  await seedEquipamentosUtilitarios(prisma);
  await seedFerramentasAmaldicoadas(prisma);
  await seedEquipamentosSobrevivendoAoJujutsu(prisma);

  console.log('Catálogo de equipamentos atualizado.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
