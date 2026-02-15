import { AreaEfeito, Prisma, TipoDano, TipoExecucao } from '@prisma/client';
export declare class UpdateVariacaoHabilidadeDto {
    nome?: string;
    descricao?: string;
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
    dadosDano?: Prisma.InputJsonValue;
    escalonaPorGrau?: boolean;
    escalonamentoCustoEA?: number;
    escalonamentoDano?: Prisma.InputJsonValue;
    efeitoAdicional?: string;
    requisitos?: Prisma.InputJsonValue;
    ordem?: number;
}
