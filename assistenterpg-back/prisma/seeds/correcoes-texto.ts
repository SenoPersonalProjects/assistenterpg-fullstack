import { PrismaClient } from '@prisma/client';

import { seedCondicoes } from './catalogos/condicoes';
import { seedEquipamentosArmas } from './catalogos/equipamentos-armas';
import { seedFerramentasAmaldicoadas } from './catalogos/equipamentos-ferramentas-amaldicoadas';
import { seedHabilidadesEfeitosGrau } from './habilidades/hab-efeitos-grau';
import { seedHabilidadeEscolaTecnica } from './habilidades/hab-escola-tecnica';
import { seedEquipamentosModificacoesAplicaveis } from './relacoes/equipamentos-modificacoes-aplicaveis';

const prisma = new PrismaClient();

async function main() {
  console.log('Aplicando correções textuais em catálogos e habilidades...');

  await seedCondicoes(prisma);
  await seedEquipamentosArmas(prisma);
  await seedFerramentasAmaldicoadas(prisma);
  await seedHabilidadeEscolaTecnica(prisma);
  await seedHabilidadesEfeitosGrau(prisma);
  await seedEquipamentosModificacoesAplicaveis(prisma);

  console.log('Correções textuais aplicadas.');
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
