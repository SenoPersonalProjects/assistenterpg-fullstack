import { TipoFonte } from '@prisma/client';
export declare class HabilidadeTrilhaDto {
    habilidadeId: number;
    nivelConcedido: number;
    caminhoId?: number;
}
export declare class CreateTrilhaDto {
    classeId: number;
    nome: string;
    descricao?: string;
    requisitos?: any;
    fonte?: TipoFonte;
    suplementoId?: number;
    habilidades?: HabilidadeTrilhaDto[];
}
