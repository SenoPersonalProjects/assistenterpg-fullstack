import { TipoModificacao, TipoFonte } from '@prisma/client';
import { RestricoesModificacao } from '../types/restricoes.types';
export declare class ModificacaoDetalhadaDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: TipoModificacao;
    incrementoEspacos: number;
    restricoes: RestricoesModificacao | null;
    efeitosMecanicos: unknown;
    fonte: TipoFonte;
    suplementoId: number | null;
    equipamentosCompatíveis?: Array<{
        id: number;
        codigo: string;
        nome: string;
        tipo: string;
    }>;
    quantidadeUsos?: {
        itensBase: number;
        itensCampanha: number;
        total: number;
    };
}
