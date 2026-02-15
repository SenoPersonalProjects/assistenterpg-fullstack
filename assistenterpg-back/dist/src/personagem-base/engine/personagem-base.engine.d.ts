import { EngineParams, EngineResult, HabilidadeComEfeitos, ModDerivados, PrismaLike, ItemInventarioCalculado } from './personagem-base.engine.types';
type BuscarHabilidadesFn = (params: {
    nivel: number;
    origemId: number;
    classeId: number;
    trilhaId?: number | null;
    caminhoId?: number | null;
    tecnicaInataId?: number | null;
    estudouEscolaTecnica: boolean;
    poderesGenericos?: Array<{
        habilidadeId: number;
        config?: any;
    }>;
}, prisma: PrismaLike) => Promise<HabilidadeComEfeitos>;
type CalcularModsDerivadosFn = (habilidades: Array<{
    habilidade: {
        nome: string;
        mecanicasEspeciais?: any;
    };
}>, nivel: number) => ModDerivados;
export declare function calcularEstadoFinalPersonagemBase(params: EngineParams & {
    prisma: PrismaLike;
    buscarHabilidadesPersonagem: BuscarHabilidadesFn;
    calcularModsDerivadosPorHabilidades?: CalcularModsDerivadosFn;
    itensInventarioCalculados?: ItemInventarioCalculado[];
}): Promise<EngineResult>;
export {};
