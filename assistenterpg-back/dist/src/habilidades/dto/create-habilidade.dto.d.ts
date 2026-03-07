import { TipoFonte } from '@prisma/client';
export declare enum TipoHabilidade {
    RECURSO_CLASSE = "RECURSO_CLASSE",
    EFEITO_GRAU = "EFEITO_GRAU",
    PODER_GENERICO = "PODER_GENERICO",
    MECANICA_ESPECIAL = "MECANICA_ESPECIAL",
    HABILIDADE_ORIGEM = "HABILIDADE_ORIGEM",
    HABILIDADE_TRILHA = "HABILIDADE_TRILHA",
    ESCOLA_TECNICA = "ESCOLA_TECNICA"
}
export declare class EfeitoGrauDto {
    tipoGrauCodigo: string;
    valor?: number;
    escalonamentoPorNivel?: any;
}
export declare class CreateHabilidadeDto {
    nome: string;
    descricao?: string;
    tipo: TipoHabilidade;
    origem?: string;
    requisitos?: any;
    mecanicasEspeciais?: any;
    fonte?: TipoFonte;
    suplementoId?: number;
    efeitosGrau?: EfeitoGrauDto[];
}
