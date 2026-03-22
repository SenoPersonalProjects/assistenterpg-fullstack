import { StatusPublicacao } from '@prisma/client';
export declare class SuplementoCatalogoDto {
    id: number;
    codigo: string;
    nome: string;
    descricao?: string;
    versao: string;
    status: StatusPublicacao;
    icone?: string;
    banner?: string;
    tags?: string[];
    autor?: string;
    ativo?: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
}
