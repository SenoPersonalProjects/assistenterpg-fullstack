import { ProficienciaProtecao, TipoProtecao, TipoReducaoDano } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
export declare class ReducaoDanoDto {
    tipoReducao: TipoReducaoDano;
    valor: number;
}
export declare class HomebrewProtecaoDto extends EquipamentoBaseDto {
    proficienciaProtecao: ProficienciaProtecao;
    tipoProtecao: TipoProtecao;
    bonusDefesa: number;
    penalidadeCarga: number;
    reducoesDano: ReducaoDanoDto[];
}
