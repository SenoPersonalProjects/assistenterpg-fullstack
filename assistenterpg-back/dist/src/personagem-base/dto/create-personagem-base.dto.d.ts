import { AtributoBaseEA, AtributoBase } from '@prisma/client';
export type AtributoBaseCodigo = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';
export type AtributoBaseEACodigo = AtributoBaseEA;
export declare class GrauAprimoramentoDto {
    tipoGrauCodigo: string;
    valor: number;
}
export declare class MelhoriaTreinamentoDto {
    periciaCodigo: string;
    grauAnterior: number;
    grauNovo: number;
}
export declare class GrauTreinamentoDto {
    nivel: number;
    melhorias: MelhoriaTreinamentoDto[];
}
export declare class PoderGenericoInstanciaDto {
    habilidadeId: number;
    config?: any;
}
export declare class PassivaIntelectoConfigDto {
    periciasCodigos?: string[];
    proficienciasCodigos?: string[];
    periciaCodigoTreino?: string;
    tipoGrauCodigoAprimoramento?: string;
}
export declare class PassivasAtributoConfigDto {
    INT_I?: PassivaIntelectoConfigDto;
    INT_II?: PassivaIntelectoConfigDto;
}
export declare class ItemInventarioDto {
    equipamentoId: number;
    quantidade: number;
    equipado?: boolean;
    modificacoesIds?: number[];
    nomeCustomizado?: string | null;
    notas?: string | null;
}
export declare class CreatePersonagemBaseDto {
    nome: string;
    nivel: number;
    claId: number;
    origemId: number;
    classeId: number;
    trilhaId?: number | null;
    caminhoId?: number | null;
    agilidade: number;
    forca: number;
    intelecto: number;
    presenca: number;
    vigor: number;
    estudouEscolaTecnica: boolean;
    idade?: number | null;
    prestigioBase?: number;
    prestigioClaBase?: number | null;
    alinhamentoId?: number | null;
    background?: string | null;
    atributoChaveEa: AtributoBaseEACodigo;
    tecnicaInataId?: number | null;
    proficienciasCodigos: string[];
    grausAprimoramento: GrauAprimoramentoDto[];
    grausTreinamento?: GrauTreinamentoDto[];
    poderesGenericos?: PoderGenericoInstanciaDto[];
    passivasAtributoIds?: number[];
    passivasAtributosAtivos?: AtributoBase[];
    passivasAtributosConfig?: PassivasAtributoConfigDto;
    periciasClasseEscolhidasCodigos: string[];
    periciasOrigemEscolhidasCodigos: string[];
    periciasLivresCodigos: string[];
    periciasLivresExtras?: number;
    itensInventario?: ItemInventarioDto[];
}
