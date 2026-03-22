import { TipoAcessorio } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
export declare class HomebrewAcessorioDto extends EquipamentoBaseDto {
    tipoAcessorio: TipoAcessorio;
    periciaBonificada?: string;
    bonusPericia?: number;
    requereEmpunhar?: boolean;
    efeito?: string;
    maxVestimentas?: number;
}
