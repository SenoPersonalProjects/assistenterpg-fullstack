import { TipoFonte } from '@prisma/client';
export declare class CreateClasseDto {
    nome: string;
    descricao?: string | null;
    fonte?: TipoFonte;
    suplementoId?: number;
}
