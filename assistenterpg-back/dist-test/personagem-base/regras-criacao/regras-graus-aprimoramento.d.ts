import { PassivasAtributoConfigDto } from '../dto/create-personagem-base.dto';
export declare function calcularGrausLivresMax(nivel: number): number;
export type GrauLivre = {
    tipoGrauCodigo: string;
    valor: number;
};
export interface EfeitoGrauHabilidade {
    tipoGrauCodigo: string;
    valor: number;
    escalonamentoPorNivel?: {
        niveis: number[];
    } | null;
}
export interface MecanicasEspeciaisHabilidade {
    graus_livres?: {
        quantidade: number;
        escalonamentoPorNivel?: {
            niveis: number[];
        } | null;
        escolhas_permitidas?: string[];
    };
    escolha?: {
        tipo: string;
        [key: string]: unknown;
    };
    acoes?: Record<string, string>;
    itens?: Record<string, number>;
    escolhas?: Record<string, boolean>;
    inventario?: {
        espacosExtra?: number;
        somarIntelecto?: boolean;
    };
}
export interface HabilidadePersonagem {
    habilidadeId: number;
    habilidade: {
        nome: string;
        tipo?: string;
        efeitosGrau: EfeitoGrauHabilidade[];
        mecanicasEspeciais?: MecanicasEspeciaisHabilidade | null;
    };
}
export declare function calcularGrausLivresExtras(habilidades: HabilidadePersonagem[], nivelPersonagem: number, passivasAtributosConfig?: PassivasAtributoConfigDto | null): {
    deHabilidades: number;
    deIntelecto: number;
    totalExtras: number;
};
export declare function calcularBonusGrausDePoderesGenericos(poderes: Array<{
    habilidadeId: number;
    config?: unknown;
}>, habilidades: HabilidadePersonagem[]): Map<string, number>;
export declare function aplicarRegrasDeGraus(params: {
    nivel: number;
    habilidades: HabilidadePersonagem[];
    poderes?: Array<{
        habilidadeId: number;
        config?: unknown;
    }>;
    passivasAtributosConfig?: PassivasAtributoConfigDto | null;
}, grausLivres: GrauLivre[]): GrauLivre[];
