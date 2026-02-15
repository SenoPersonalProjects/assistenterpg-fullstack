// prisma/seeds/catalogos/equipamentos-municoes.ts

import type { PrismaClient } from '@prisma/client';
import { 
  TipoEquipamento, 
  TipoUsoEquipamento, 
  CategoriaEquipamento,
  TipoFonte, // ✅ NOVO
} from '@prisma/client';

// ========================================
// ✅ TIPOS AUXILIARES PARA SEED
// ========================================

interface EquipamentoMunicaoSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  duracaoCenas: number;
  recuperavel: boolean;
  tipoUso: TipoUsoEquipamento;
}

// ========================================
// ✅ CATÁLOGO DE MUNIÇÕES - SEEDS
// ========================================

export const equipamentosMunicoesSeed: EquipamentoMunicaoSeed[] = [
  // ============================================================
  // MUNIÇÕES - ARMAS DE FOGO (Categoria 0-1)
  // ============================================================
  {
    codigo: 'BALAS_CURTAS',
    nome: 'Balas Curtas',
    descricao: 'Munição básica usada em pistolas, revólveres e submetralhadoras. Cada pacote dura duas cenas.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    duracaoCenas: 2,
    recuperavel: false,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'BALAS_LONGAS',
    nome: 'Balas Longas',
    descricao: 'Munição mais poderosa, usada em fuzis e metralhadoras. Cada pacote dura uma cena.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    duracaoCenas: 1,
    recuperavel: false,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'CARTUCHOS',
    nome: 'Cartuchos',
    descricao: 'Munição usada em espingardas, normalmente carregada com esferas de chumbo. Cada pacote dura uma cena.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    duracaoCenas: 1,
    recuperavel: false,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },

  // ============================================================
  // MUNIÇÕES - LANÇADORES (Categoria 4)
  // ============================================================
  {
    codigo: 'COMBUSTIVEL',
    nome: 'Combustível',
    descricao: 'Tanque de combustível específico para lança-chamas. Cada tanque dura uma cena.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    duracaoCenas: 1,
    recuperavel: false,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'FOGUETE',
    nome: 'Foguete',
    descricao: 'Munição disparada por bazucas. Ao contrário das demais, cada foguete é consumido em um único disparo, exigindo múltiplos foguetes para fazer vários ataques.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    duracaoCenas: 1,
    recuperavel: false,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },

  // ============================================================
  // MUNIÇÕES - ARCOS (Categoria 0)
  // ============================================================
  {
    codigo: 'FLECHAS_ARCO',
    nome: 'Flechas',
    descricao: 'Munição para arcos e bestas, podendo ser recuperada após os confrontos. Um pacote dura uma missão inteira.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    duracaoCenas: 3,
    recuperavel: true,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'FLECHAS_BESTA',
    nome: 'Flechas de Besta',
    descricao: 'Munição para bestas, podendo ser recuperada após os confrontos. Um pacote dura uma missão inteira.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    duracaoCenas: 3,
    recuperavel: true,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'FLECHAS_BALESTRA',
    nome: 'Projéteis de Balestra',
    descricao: 'Munição para balestraspesadas, podendo ser recuperada após os confrontos. Um pacote dura uma missão inteira.',
    tipo: TipoEquipamento.MUNICAO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    duracaoCenas: 3,
    recuperavel: true,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
];

// ========================================
// ✅ FUNÇÃO SEED - MUNIÇÕES
// ========================================

export async function seedEquipamentosMunicoes(prisma: PrismaClient) {
  console.log('📌 Cadastrando equipamentos de munições...');

  for (const data of equipamentosMunicoesSeed) {
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...data,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        
        // ✅ NOVO: Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });

    console.log(`  ✓ ${data.nome}`);
  }

  console.log(`✅ ${equipamentosMunicoesSeed.length} munições cadastradas!\n`);
}
