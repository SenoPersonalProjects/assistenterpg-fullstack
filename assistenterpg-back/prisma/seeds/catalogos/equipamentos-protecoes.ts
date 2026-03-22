// prisma/seeds/catalogos/equipamentos-protecoes.ts

import type { PrismaClient } from '@prisma/client';
import { 
  TipoEquipamento, 
  ProficienciaProtecao, 
  TipoProtecao, 
  TipoReducaoDano, 
  TipoAmaldicoado, 
  TipoUsoEquipamento,
  CategoriaEquipamento,
  TipoFonte,
} from '@prisma/client';

// ========================================
// ✅ TIPOS AUXILIARES PARA SEED
// ========================================

interface ReducaoDanoProtecao {
  tipoReducao: TipoReducaoDano;
  valor: number;
}

interface EquipamentoProtecaoSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  proficienciaProtecao: ProficienciaProtecao;
  tipoProtecao: TipoProtecao;
  bonusDefesa: number;
  penalidadeCarga: number;
  reducoesDano: ReducaoDanoProtecao[];
  tipoUso: TipoUsoEquipamento;
  tipoAmaldicoado?: TipoAmaldicoado | null;
}

// ========================================
// ✅ REDUÇÕES DE DANO PARA PROTEÇÕES
// ========================================

// ✅ Usando termo guarda-chuva FISICO (engloba BALISTICO, CORTE, IMPACTO e PERFURACAO)
const reducaoPesada: ReducaoDanoProtecao[] = [
  { tipoReducao: TipoReducaoDano.FISICO, valor: 2 },
];

// ========================================
// ✅ CATÁLOGO DE PROTEÇÕES - SEEDS
// ========================================

export const equipamentosProtecoesSeed: EquipamentoProtecaoSeed[] = [
  {
    codigo: 'PROTECAO_LEVE',
    nome: 'Proteção Leve',
    descricao: 'Jaqueta de couro pesada ou um colete de kevlar. Tipicamente usada por seguranças e policiais. Fornece +5 na defesa.',
    tipo: TipoEquipamento.PROTECAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaProtecao: ProficienciaProtecao.LEVE,
    tipoProtecao: TipoProtecao.VESTIVEL,
    bonusDefesa: 5,
    penalidadeCarga: 0,
    reducoesDano: [],
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    tipoAmaldicoado: null,
  },
  {
    codigo: 'PROTECAO_PESADA',
    nome: 'Proteção Pesada',
    descricao: 'Equipamento usado por forças especiais da polícia e pelo exército. Consiste de capacete, ombreiras, joelheiras e caneleiras, além de um colete com várias camadas de kevlar. Fornece resistência a dano físico 2, além de +10 na defesa. Impõe –5 em testes de perícias que sofrem penalidade de carga.',
    tipo: TipoEquipamento.PROTECAO,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 5,
    proficienciaProtecao: ProficienciaProtecao.PESADA,
    tipoProtecao: TipoProtecao.VESTIVEL,
    bonusDefesa: 10,
    penalidadeCarga: -5,
    reducoesDano: reducaoPesada,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    tipoAmaldicoado: null,
  },
  {
    codigo: 'ESCUDO',
    nome: 'Escudo',
    descricao: 'Um escudo medieval ou moderno, como aqueles usados por tropas de choque. Precisa ser empunhado em uma mão e fornece Defesa +2. Bônus na Defesa fornecido por um escudo acumula com o de uma proteção.',
    tipo: TipoEquipamento.PROTECAO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    proficienciaProtecao: ProficienciaProtecao.PESADA,
    tipoProtecao: TipoProtecao.EMPUNHAVEL,
    bonusDefesa: 2,
    penalidadeCarga: 0,
    reducoesDano: [],
    tipoUso: TipoUsoEquipamento.GERAL,
    tipoAmaldicoado: null,
  },
];

// ========================================
// ✅ FUNÇÃO SEED - PROTEÇÕES E REDUÇÕES
// ========================================

export async function seedEquipamentosProtecoes(prisma: PrismaClient) {
  console.log('📌 Cadastrando equipamentos de proteções...');

  for (const protecaoData of equipamentosProtecoesSeed) {
    const { reducoesDano, ...equipamentoData } = protecaoData;

    // 1️⃣ Criar ou atualizar o equipamento
    const equipamento = await prisma.equipamentoCatalogo.upsert({
      where: { codigo: protecaoData.codigo },
      update: {
        ...equipamentoData,
        categoria: equipamentoData.categoria as CategoriaEquipamento,
        
        // ✅ Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...equipamentoData,
        categoria: equipamentoData.categoria as CategoriaEquipamento,
        
        // ✅ Fonte e suplemento
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });

    // 2️⃣ Deletar reduções de dano antigas (para evitar duplicatas)
    await prisma.equipamentoReducaoDano.deleteMany({
      where: { equipamentoId: equipamento.id },
    });

    // 3️⃣ Criar novos registros de redução de dano
    for (const reducao of reducoesDano) {
      await prisma.equipamentoReducaoDano.create({
        data: {
          equipamentoId: equipamento.id,
          tipoReducao: reducao.tipoReducao,
          valor: reducao.valor,
        },
      });
    }

    console.log(`  ✓ ${protecaoData.nome}`);
  }

  console.log(`✅ ${equipamentosProtecoesSeed.length} proteções cadastradas!\n`);
}
