import { PrismaClient } from '@prisma/client';

// =======================
// Catálogos Base
// =======================
import { seedAlinhamentos } from './seeds/catalogos/alinhamentos';
import { seedClas } from './seeds/catalogos/clas';
import { seedClasses } from './seeds/catalogos/classes';
import { seedOrigens } from './seeds/catalogos/origens';
import { seedPericias } from './seeds/catalogos/pericias';
import { seedProficiencias } from './seeds/catalogos/proficiencias';
import { seedResistencias } from './seeds/catalogos/resistencias';
import { seedTiposGrau } from './seeds/catalogos/tipos-graus';
import { seedCondicoes } from './seeds/catalogos/condicoes';

// =======================
// Catálogos de Equipamentos
// =======================
import { seedEquipamentosArmas } from './seeds/catalogos/equipamentos-armas';
import { seedEquipamentosMunicoes } from './seeds/catalogos/equipamentos-municoes';
import { seedEquipamentosProtecoes } from './seeds/catalogos/equipamentos-protecoes';
import { seedEquipamentosUtilitarios } from './seeds/catalogos/equipamentos-utilitarios';
import { seedFerramentasAmaldicoadas } from './seeds/catalogos/equipamentos-ferramentas-amaldicoadas';

// =======================
// Catálogos de Modificações e Graus
// =======================
import { seedModificacoes } from './seeds/catalogos/modificacoes';
import { seedXamaGraus } from './seeds/catalogos/graus-xama';
import { seedEquipamentosModificacoesAplicaveis } from './seeds/relacoes/equipamentos-modificacoes-aplicaveis';

// =======================
// Técnicas Amaldiçoadas (✅ NOVO)
// =======================
import { seedTecnicasInatas } from './seeds/tecnicas/tecnicas-inatas';
import { seedTecnicasNaoInatas } from './seeds/tecnicas/tecnicas-nao-inatas';

// =======================
// Habilidades
// =======================
import { seedHabilidadesEfeitosGrau } from './seeds/habilidades/hab-efeitos-grau';
import { seedHabilidadeEscolaTecnica } from './seeds/habilidades/hab-escola-tecnica';
import { seedHabilidadesMecanicasEspeciais } from './seeds/habilidades/hab-mecanicas-especiais';
import { seedHabilidadesOrigem } from './seeds/habilidades/hab-origem';
import { seedHabilidadesPoderesGenericos } from './seeds/habilidades/hab-poderes-genericos';
import { seedHabilidadesRecursosClasse } from './seeds/habilidades/hab-recursos-classe';
import { seedHabilidadesTrilha } from './seeds/habilidades/hab-trilha';
import { seedAmeacasSagami } from './seeds/npcs-ameacas/sagami';
import { seedSobrevivendoAoJujutsu } from './seeds/suplementos/sobrevivendo-ao-jujutsu';

// =======================
// Personagem (catálogo)
// =======================
import { seedPassivasAtributos } from './seeds/personagem/passivas-atributos';

// =======================
// Relações
// =======================
import { seedCaminhos } from './seeds/relacoes/caminhos';
import { seedClassesPericias } from './seeds/relacoes/classes-pericias';
import { seedClassesProficiencias } from './seeds/relacoes/classes-proficiencias';
import { seedHabilidadesOrigemVinculos } from './seeds/relacoes/habilidades-origem-vinculos';
import { seedOrigemPericias } from './seeds/relacoes/origem-pericias';
import { seedTrilhas } from './seeds/relacoes/trilhas';
import { seedTrilhasRequisitos } from './seeds/relacoes/trilhas-requisitos';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================
  // 1️⃣ CATÁLOGOS BASE
  // ============================================================
  console.log('📚 [1/8] Cadastrando catálogos base...');
  await seedClasses(prisma);
  await seedClas(prisma);
  await seedOrigens(prisma);
  await seedProficiencias(prisma);
  await seedTiposGrau(prisma);
  await seedResistencias(prisma);
  await seedPericias(prisma);
  await seedCondicoes(prisma);
  await seedAlinhamentos(prisma);
  await seedPassivasAtributos(prisma);
  console.log('✅ Catálogos base concluídos!\n');

  // ============================================================
  // 2️⃣ CATÁLOGOS DE EQUIPAMENTOS E GRAUS
  // ============================================================
  console.log('⚔️  [2/8] Cadastrando equipamentos, modificações e graus...');
  
  // Ordem de execução:
  // 1. Graus de Xama (independente)
  await seedXamaGraus(prisma);
  
  // 2. Equipamentos base (armas, munições, proteções, utilitários)
  await seedEquipamentosArmas(prisma);
  await seedEquipamentosMunicoes(prisma);
  await seedEquipamentosProtecoes(prisma);
  await seedEquipamentosUtilitarios(prisma);
  
  // 3. Equipamentos amaldiçoados (podem depender de equipamentos base)
  await seedFerramentasAmaldicoadas(prisma);
  
  // 4. Modificações (podem referenciar equipamentos)
  await seedModificacoes(prisma);

  // 5. Vinculos de modificacoes aplicaveis por equipamento
  await seedEquipamentosModificacoesAplicaveis(prisma);
  
  console.log('✅ Equipamentos, modificações e graus concluídos!\n');

  // ============================================================
  // 3️⃣ TÉCNICAS AMALDIÇOADAS (✅ NOVO)
  // ============================================================
  console.log('🔥 [3/8] Cadastrando tecnicas amaldicoadas (inatas + nao-inatas)...');
  await seedTecnicasInatas(prisma);
  await seedTecnicasNaoInatas(prisma);
  console.log('✅ Tecnicas amaldicoadas concluidas!\n');

  // ============================================================
  // 4️⃣ TRILHAS E CAMINHOS
  // ============================================================
  console.log('🛤️  [4/8] Cadastrando trilhas e caminhos...');
  await seedTrilhas(prisma);
  await seedTrilhasRequisitos(prisma);
  await seedCaminhos(prisma);
  console.log('✅ Trilhas e caminhos concluídos!\n');

  // ============================================================
  // 5️⃣ RELAÇÕES (CLASSE/ORIGEM)
  // ============================================================
  console.log('🔗 [5/8] Cadastrando relações de classes e origens...');
  await seedOrigemPericias(prisma);
  await seedClassesPericias(prisma);
  await seedClassesProficiencias(prisma);
  console.log('✅ Relações de classes e origens concluídas!\n');

  // ============================================================
  // 6️⃣ HABILIDADES (CATÁLOGO)
  // ============================================================
  console.log('✨ [6/8] Cadastrando habilidades...');
  await seedHabilidadesOrigem(prisma);
  await seedHabilidadeEscolaTecnica(prisma);
  await seedHabilidadesRecursosClasse(prisma);
  await seedHabilidadesPoderesGenericos(prisma);
  await seedAmeacasSagami(prisma);
  console.log('✅ Habilidades concluídas!\n');

  // ============================================================
  // 7️⃣ RELAÇÕES (HABILIDADES)
  // ============================================================
  console.log('🔗 [7/8] Cadastrando relações de habilidades...');
  await seedHabilidadesOrigemVinculos(prisma);
  await seedHabilidadesTrilha(prisma);
  console.log('✅ Relações de habilidades concluídas!\n');

  // ============================================================
  // 8️⃣ PÓS-PROCESSAMENTOS
  // ============================================================
  console.log('⚙️  [8/8] Executando pós-processamentos...');
  await seedHabilidadesEfeitosGrau(prisma);
  await seedHabilidadesMecanicasEspeciais(prisma);
  console.log('✅ Pós-processamentos concluídos!\n');

  console.log('[Extra] Cadastrando suplementos oficiais...');
  await seedSobrevivendoAoJujutsu(prisma);
  await seedEquipamentosModificacoesAplicaveis(prisma);
  console.log('Suplementos oficiais concluidos!\n');

  // ============================================================
  // RESUMO FINAL
  // ============================================================
  console.log('🎉 ============================================');
  console.log('🎉 SEED COMPLETO - RESUMO:');
  console.log('🎉 ============================================');
  console.log('✅ Catálogos base (classes, clãs, origens, perícias, etc.)');
  console.log('✅ Graus de Xama (6 graus com limitações)');
  console.log('✅ Equipamentos:');
  console.log('   • Armas');
  console.log('   • Munições');
  console.log('   • Proteções');
  console.log('   • Utilitários');
  console.log('   • Ferramentas Amaldiçoadas (40 itens)');
  console.log('✅ Modificações de equipamentos (21 modificações)');
  console.log('✅ Tecnicas Amaldicoadas (inatas + nao-inatas basicas)');
  console.log('✅ Trilhas, caminhos e relações');
  console.log('✅ Habilidades e vínculos');
  console.log('✅ Pós-processamentos');
  console.log('🎉 ============================================\n');
}

main()
  .then(async () => {
    console.log('✅ Seed executado com sucesso!');
    console.log('📊 Banco de dados populado e pronto para uso.\n');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ ============================================');
    console.error('❌ ERRO NO SEED:');
    console.error('❌ ============================================');
    console.error(e);
    console.error('❌ ============================================\n');
    await prisma.$disconnect();
    process.exit(1);
  });
