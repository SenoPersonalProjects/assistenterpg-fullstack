import { TipoHomebrewConteudo, StatusPublicacao } from '@prisma/client';
export declare class FiltrarHomebrewsDto {
    nome?: string;
    tipo?: TipoHomebrewConteudo;
    status?: StatusPublicacao;
    usuarioId?: number;
    apenasPublicados?: boolean;
    pagina?: number;
    limite?: number;
}
