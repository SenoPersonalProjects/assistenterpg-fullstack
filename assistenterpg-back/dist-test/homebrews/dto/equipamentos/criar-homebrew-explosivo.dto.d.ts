import { TipoExplosivo } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
export declare class HomebrewExplosivoDto extends EquipamentoBaseDto {
    tipoExplosivo: TipoExplosivo;
    efeito: string;
}
