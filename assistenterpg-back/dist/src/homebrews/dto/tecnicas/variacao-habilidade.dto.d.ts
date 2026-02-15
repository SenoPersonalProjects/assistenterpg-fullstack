import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';
import { DadoDanoDto, EscalonamentoDanoDto } from './shared-tecnica.dto';
export declare class VariacaoHabilidadeDto {
    nome: string;
    descricao: string;
    substituiCustos?: boolean;
    custoPE?: number;
    custoEA?: number;
    execucao?: TipoExecucao;
    area?: AreaEfeito;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    resistencia?: string;
    dtResistencia?: string;
    criticoValor?: number;
    criticoMultiplicador?: number;
    danoFlat?: number;
    danoFlatTipo?: TipoDano;
    dadosDano?: DadoDanoDto[];
    escalonaPorGrau?: boolean;
    escalonamentoCustoEA?: number;
    escalonamentoDano?: EscalonamentoDanoDto;
    efeitoAdicional?: string;
    requisitos?: any;
    ordem?: number;
}
