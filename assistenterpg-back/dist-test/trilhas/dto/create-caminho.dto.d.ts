import { TipoFonte } from '@prisma/client';
export declare class HabilidadeCaminhoDto {
    habilidadeId: number;
    nivelConcedido: number;
}
export declare class CreateCaminhoDto {
    trilhaId: number;
    nome: string;
    descricao?: string;
    fonte?: TipoFonte;
    suplementoId?: number;
    habilidades?: HabilidadeCaminhoDto[];
}
