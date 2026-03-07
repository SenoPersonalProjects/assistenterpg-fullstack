// src/inventario/engine/inventario.types.ts
import { Prisma } from '@prisma/client';
import { GrauFeiticeiro, TipoEquipamento } from '@prisma/client';

/**
 * Item do inventário com equipamento e modificações carregados
 */
export interface ItemInventarioComDados {
  id: number;
  equipamentoId: number;
  quantidade: number;
  equipado: boolean;
  nomeCustomizado?: string | null;
  notas?: string | null;
  categoriaCalculada?: string | null; // ✅ NOVO

  equipamento: {
    id: number;
    codigo: string;
    nome: string;
    tipo: TipoEquipamento;
    categoria: string;
    espacos: number;
    complexidadeMaldicao: string;

    // Campos específicos
    bonusDefesa?: number | null;
    penalidadeCarga?: number | null;
    tipoAcessorio?: string | null; // ✅ NOVO (para detectar VESTIMENTA)
    efeito?: string | null; // ✅ NOVO (para detectar Mochila)

    danos?: Array<{
      empunhadura: string | null;
      tipoDano: string;
      rolagem: string;
      valorFlat: number;
    }> | null;

    reducesDano?: Array<{
      tipoReducao: string;
      valor: number;
    }> | null;
  };

  modificacoes: Array<{
    modificacao: {
      id: number;
      codigo: string;
      nome: string;
      descricao?: string | null;
      incrementoEspacos: number;
      efeitosMecanicos: Prisma.JsonValue | null;
    };
  }>;
}

/**
 * Stats calculados dos equipamentos equipados
 */
export interface StatsEquipados {
  defesaTotal: number;
  danosTotais: Array<{
    tipoDano: string;
    empunhadura?: string | null;
    rolagem: string;
    flat: number;
  }>;
  reducoesDano: Array<{
    tipoReducao: string;
    valor: number;
  }>;
  penalidadeCarga: number;
}

/**
 * Resultado do cálculo de espaços
 */
export interface ResultadoEspacos {
  espacosTotal: number;
  espacosOcupados: number;
  espacosDisponiveis: number;
  sobrecarregado: boolean;
}

/**
 * ✅ NOVO: Validação do sistema de vestir
 */
export interface ValidacaoVestir {
  valido: boolean;
  erros: string[];
  totalVestiveis: number;
  totalVestimentas: number;
  limiteVestiveis: number; // 5
  limiteVestimentas: number; // 2
}

/**
 * Resposta completa do preview adicionar item
 */
export interface PreviewAdicionarItemResponse {
  espacos: ResultadoEspacos;
  grauXama: {
    valido: boolean;
    erros: string[];
    grauAtual: GrauFeiticeiro;
    limitesAtuais: Record<string, number>;
    itensPorCategoriaAtual: Record<string, number>;
  };
  stats: Partial<StatsEquipados>;
}

/**
 * Validação específica de Grau Xamã
 */
export interface ValidacaoGrauXama {
  valido: boolean;
  erros: string[];
  grauAtual: GrauFeiticeiro;
  limitesAtuais: Record<string, number>;
  itensPorCategoriaAtual: Record<string, number>;
}

/**
 * Informações resumidas do inventário por categoria
 */
export interface ResumoInventarioPorCategoria {
  categoria: string;
  quantidadeItens: number;
  quantidadeTotal: number;
  limiteGrauXama: number;
  podeAdicionarMais: boolean;
}

/**
 * Resumo completo do inventário com validações
 */
export interface ResumoInventarioCompleto {
  espacos: ResultadoEspacos;
  grauXama: {
    grauAtual: GrauFeiticeiro;
    prestigioMinimoRequisito: number;
  };
  resumoPorCategoria: ResumoInventarioPorCategoria[];
  podeAdicionarCategoria0: boolean;
  statsEquipados: StatsEquipados;
}
