import { StatusPublicacao } from '@prisma/client';
export declare class CreateSuplementoDto {
    codigo: string;
    nome: string;
    descricao?: string;
    versao?: string;
    status?: StatusPublicacao;
    icone?: string;
    banner?: string;
    tags?: string[];
    autor?: string;
}
