import { Prisma } from '@prisma/client';
import { GrauFeiticeiro, TipoEquipamento } from '@prisma/client';
export interface ItemInventarioComDados {
    id: number;
    equipamentoId: number;
    quantidade: number;
    equipado: boolean;
    nomeCustomizado?: string | null;
    notas?: string | null;
    categoriaCalculada?: string | null;
    equipamento: {
        id: number;
        codigo: string;
        nome: string;
        tipo: TipoEquipamento;
        categoria: string;
        espacos: number;
        complexidadeMaldicao: string;
        bonusDefesa?: number | null;
        penalidadeCarga?: number | null;
        tipoAcessorio?: string | null;
        efeito?: string | null;
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
export interface ResultadoEspacos {
    espacosTotal: number;
    espacosOcupados: number;
    espacosDisponiveis: number;
    sobrecarregado: boolean;
}
export interface ValidacaoVestir {
    valido: boolean;
    erros: string[];
    totalVestiveis: number;
    totalVestimentas: number;
    limiteVestiveis: number;
    limiteVestimentas: number;
}
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
export interface ValidacaoGrauXama {
    valido: boolean;
    erros: string[];
    grauAtual: GrauFeiticeiro;
    limitesAtuais: Record<string, number>;
    itensPorCategoriaAtual: Record<string, number>;
}
export interface ResumoInventarioPorCategoria {
    categoria: string;
    quantidadeItens: number;
    quantidadeTotal: number;
    limiteGrauXama: number;
    podeAdicionarMais: boolean;
}
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
