import { TipoEquipamento, TipoProtecao, TipoArma, SubtipoArmaDistancia, ProficienciaArma, ProficienciaProtecao, AlcanceArma, EmpunhaduraArma, ComplexidadeMaldicao } from '@prisma/client';
export interface RestricoesModificacao {
    tiposEquipamento?: TipoEquipamento[];
    categoriaMinima?: number;
    categoriaMaxima?: number;
    tiposProtecao?: TipoProtecao[];
    tiposArma?: TipoArma[];
    subtiposArmaDistancia?: SubtipoArmaDistancia[];
    proficienciasArma?: ProficienciaArma[];
    proficienciasProtecao?: ProficienciaProtecao[];
    apenasAmaldicoados?: boolean;
    apenasMundanos?: boolean;
    complexidadeMinima?: ComplexidadeMaldicao;
    complexidadeMaxima?: ComplexidadeMaldicao;
    codigosIncompativeis?: string[];
    codigosRequeridos?: string[];
    limiteMaximoGlobal?: number;
    alcancesPermitidos?: AlcanceArma[];
    empunhadurasPermitidas?: EmpunhaduraArma[];
    excluiEscudos?: boolean;
    outros?: {
        requereEmpunhadura?: boolean;
        apenasMunicao?: boolean;
        apenasExplosivos?: boolean;
        proficienciaProtecao?: string;
        [key: string]: any;
    };
}
export interface ResultadoValidacaoRestricoes {
    valido: boolean;
    erros: string[];
}
