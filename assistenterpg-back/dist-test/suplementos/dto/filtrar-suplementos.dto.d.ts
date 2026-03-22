import { StatusPublicacao } from '@prisma/client';
export declare class FiltrarSuplementosDto {
    nome?: string;
    codigo?: string;
    status?: StatusPublicacao;
    autor?: string;
    apenasAtivos?: boolean;
}
