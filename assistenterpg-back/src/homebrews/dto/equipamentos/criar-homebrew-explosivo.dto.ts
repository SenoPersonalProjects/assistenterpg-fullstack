// src/homebrews/dto/equipamentos/criar-homebrew-explosivo.dto.ts

import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { TipoExplosivo } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de EXPLOSIVO
 */
export class HomebrewExplosivoDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(TipoExplosivo)
  tipoExplosivo: TipoExplosivo; // GRANADA_ATORDOAMENTO, GRANADA_FRAGMENTACAO, etc.

  @IsNotEmpty()
  @IsString()
  efeito: string; // Descrição do efeito (ex: "Atordoar inimigos em raio de 6m")
}
