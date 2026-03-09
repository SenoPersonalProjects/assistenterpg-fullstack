import { IsOptional, IsString } from 'class-validator';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de EQUIPAMENTO GENERICO
 */
export class HomebrewEquipamentoGenericoDto extends EquipamentoBaseDto {
  @IsOptional()
  @IsString()
  efeito?: string;
}
