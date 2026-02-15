import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
export declare class HomebrewItemAmaldicoadoDto extends EquipamentoBaseDto {
    tipoAmaldicoado: TipoAmaldicoado;
    efeito: string;
}
