import { TipoFonte } from '@prisma/client';
import { TipoHabilidade } from './create-habilidade.dto';
export declare class FilterHabilidadeDto {
    tipo?: TipoHabilidade;
    origem?: string;
    fonte?: TipoFonte;
    suplementoId?: number;
    busca?: string;
    pagina?: number;
    limite?: number;
}
