import { TipoModificacao, TipoFonte } from '@prisma/client';
export declare class FiltrarModificacoesDto {
    tipo?: TipoModificacao;
    fontes?: TipoFonte[];
    suplementoId?: number;
    busca?: string;
    pagina?: number;
    limite?: number;
}
