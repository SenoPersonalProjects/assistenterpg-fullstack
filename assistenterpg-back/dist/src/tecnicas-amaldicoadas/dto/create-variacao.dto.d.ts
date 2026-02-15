import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';
export declare class CreateVariacaoHabilidadeDto {
    habilidadeTecnicaId: number;
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
    dadosDano?: any;
    escalonaPorGrau?: boolean;
    escalonamentoCustoEA?: number;
    escalonamentoDano?: any;
    efeitoAdicional?: string;
    requisitos?: any;
    ordem?: number;
}
