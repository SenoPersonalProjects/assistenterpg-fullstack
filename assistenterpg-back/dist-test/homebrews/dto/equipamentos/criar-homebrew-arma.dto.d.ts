import { ProficienciaArma, EmpunhaduraArma, TipoArma, SubtipoArmaDistancia, AlcanceArma, TipoDano } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
export declare class DanoArmaDto {
    empunhadura?: EmpunhaduraArma;
    tipoDano: TipoDano;
    rolagem: string;
    valorFlat?: number;
}
export declare class HomebrewArmaDto extends EquipamentoBaseDto {
    proficienciaArma: ProficienciaArma;
    empunhaduras: EmpunhaduraArma[];
    tipoArma: TipoArma;
    subtipoDistancia?: SubtipoArmaDistancia;
    agil: boolean;
    danos: DanoArmaDto[];
    criticoValor: number;
    criticoMultiplicador: number;
    alcance: AlcanceArma;
    tipoMunicaoCodigo?: string;
    habilidadeEspecial?: string;
}
