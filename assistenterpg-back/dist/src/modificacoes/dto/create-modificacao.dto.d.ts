import { TipoModificacao, TipoFonte } from '@prisma/client';
import type { RestricoesModificacao } from '../types/restricoes.types';
export declare class CreateModificacaoDto {
    codigo: string;
    nome: string;
    descricao?: string;
    tipo: TipoModificacao;
    incrementoEspacos: number;
    restricoes?: RestricoesModificacao;
    efeitosMecanicos?: any;
    fonte?: TipoFonte;
    suplementoId?: number;
    equipamentosCompatíveisIds?: number[];
}
