import { TipoEquipamento, ComplexidadeMaldicao, ProficienciaArma, ProficienciaProtecao, AlcanceArma, TipoAcessorio } from '@prisma/client';
export declare class FiltrarEquipamentosDto {
    tipo?: TipoEquipamento;
    complexidadeMaldicao?: ComplexidadeMaldicao;
    proficienciaArma?: ProficienciaArma;
    proficienciaProtecao?: ProficienciaProtecao;
    alcance?: AlcanceArma;
    tipoAcessorio?: TipoAcessorio;
    categoria?: number;
    apenasAmaldicoados?: boolean;
    busca?: string;
    pagina?: number;
    limite?: number;
}
