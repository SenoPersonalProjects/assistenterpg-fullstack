import { TipoFonte } from '@prisma/client';
export declare class CreateClaDto {
    nome: string;
    descricao?: string;
    grandeCla: boolean;
    fonte?: TipoFonte;
    suplementoId?: number;
    tecnicasHereditariasIds?: number[];
}
