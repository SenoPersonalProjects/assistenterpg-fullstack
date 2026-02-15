import { StatusPublicacao } from '@prisma/client';
export declare class CreateHomebrewBaseDto {
    nome: string;
    descricao?: string;
    status?: StatusPublicacao;
    tags?: string[];
    versao?: string;
}
