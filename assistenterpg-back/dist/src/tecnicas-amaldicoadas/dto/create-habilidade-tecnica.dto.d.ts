import { TipoExecucao, AreaEfeito, TipoDano } from '@prisma/client';
export declare class CreateHabilidadeTecnicaDto {
    tecnicaId: number;
    codigo: string;
    nome: string;
    descricao: string;
    requisitos?: any;
    execucao: TipoExecucao;
    area?: AreaEfeito;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    resistencia?: string;
    dtResistencia?: string;
    custoPE?: number;
    custoEA?: number;
    testesExigidos?: any;
    criticoValor?: number;
    criticoMultiplicador?: number;
    danoFlat?: number;
    danoFlatTipo?: TipoDano;
    dadosDano?: any;
    escalonaPorGrau?: boolean;
    grauTipoGrauCodigo?: string;
    escalonamentoCustoEA?: number;
    escalonamentoDano?: any;
    efeito: string;
    ordem?: number;
}
