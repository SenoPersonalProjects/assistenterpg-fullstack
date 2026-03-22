import { Prisma } from '@prisma/client';
import { EngineParams, EngineResult, HabilidadeComEfeitos, ModDerivados, PrismaLike, ItemInventarioCalculado } from './personagem-base.engine.types';
type BuscarHabilidadesFn = (params: {
    nivel: number;
    origemId: number;
    classeId: number;
    trilhaId?: number | null;
    caminhoId?: number | null;
    tecnicaInataId?: number | null;
    estudouEscolaTecnica: boolean;
    poderesGenericos?: PoderGenericoNormalizado[];
}, prisma: PrismaLike) => Promise<HabilidadeComEfeitos>;
type CalcularModsDerivadosFn = (habilidades: HabilidadeComEfeitos, nivel: number) => ModDerivados;
type PoderGenericoNormalizado = {
    habilidadeId: number;
    config: Prisma.JsonValue;
};
export declare function calcularEstadoFinalPersonagemBase(params: EngineParams & {
    prisma: PrismaLike;
    buscarHabilidadesPersonagem: BuscarHabilidadesFn;
    calcularModsDerivadosPorHabilidades?: CalcularModsDerivadosFn;
    itensInventarioCalculados?: ItemInventarioCalculado[];
}): Promise<EngineResult>;
export {};
