import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client';
export declare class FiltrarTecnicasDto {
    nome?: string;
    codigo?: string;
    tipo?: TipoTecnicaAmaldicoada;
    hereditaria?: boolean;
    claId?: number;
    claNome?: string;
    fonte?: TipoFonte;
    suplementoId?: number;
    incluirHabilidades?: boolean;
    incluirClas?: boolean;
}
