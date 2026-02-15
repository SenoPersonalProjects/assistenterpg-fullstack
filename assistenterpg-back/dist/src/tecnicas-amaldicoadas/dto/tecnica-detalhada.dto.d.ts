import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client';
export declare class ClaResumoDto {
    id: number;
    nome: string;
    grandeCla: boolean;
}
export declare class HabilidadeVariacaoDto {
    id: number;
    nome: string;
    descricao: string;
    substituiCustos: boolean;
    custoPE?: number;
    custoEA?: number;
    execucao?: string;
    area?: string;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    resistencia?: string;
    dtResistencia?: string;
    criticoValor?: number;
    criticoMultiplicador?: number;
    danoFlat?: number;
    danoFlatTipo?: string;
    dadosDano?: any;
    escalonaPorGrau?: boolean;
    escalonamentoCustoEA?: number;
    escalonamentoDano?: any;
    efeitoAdicional?: string;
    requisitos?: any;
    ordem: number;
}
export declare class HabilidadeTecnicaDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string;
    requisitos?: any;
    execucao: string;
    area?: string;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    resistencia?: string;
    dtResistencia?: string;
    custoPE: number;
    custoEA: number;
    testesExigidos?: any;
    criticoValor?: number;
    criticoMultiplicador?: number;
    danoFlat?: number;
    danoFlatTipo?: string;
    dadosDano?: any;
    escalonaPorGrau: boolean;
    grauTipoGrauCodigo?: string;
    escalonamentoCustoEA: number;
    escalonamentoDano?: any;
    efeito: string;
    ordem: number;
    variacoes?: HabilidadeVariacaoDto[];
}
export declare class TecnicaDetalhadaDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string;
    tipo: TipoTecnicaAmaldicoada;
    hereditaria: boolean;
    linkExterno?: string;
    fonte: TipoFonte;
    suplementoId?: number;
    requisitos?: any;
    clasHereditarios?: ClaResumoDto[];
    habilidades?: HabilidadeTecnicaDto[];
    criadoEm: Date;
    atualizadoEm: Date;
}
