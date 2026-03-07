// src/homebrews/dto/equipamentos/criar-homebrew-acessorio.dto.ts

import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { TipoAcessorio } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de ACESSÓRIO
 */
export class HomebrewAcessorioDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoAcessorio)
  tipoAcessorio: TipoAcessorio; // KIT_PERICIA, UTENSILIO, VESTIMENTA

  @IsOptional()
  @IsString()
  periciaBonificada?: string; // Ex: "Atletismo", "Furto ou Sobrevivência"

  @IsOptional()
  @IsInt()
  bonusPericia?: number; // Ex: 2, 5

  @IsOptional()
  @IsBoolean()
  requereEmpunhar?: boolean; // true para utensílios que precisam ser empunhados

  @IsOptional()
  @IsString()
  efeito?: string; // Descrição do efeito

  @IsOptional()
  @IsInt()
  maxVestimentas?: number; // Quantas vestimentas podem ser usadas simultaneamente (padrão: 2)
}
