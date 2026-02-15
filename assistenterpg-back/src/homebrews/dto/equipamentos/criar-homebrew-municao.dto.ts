// src/homebrews/dto/equipamentos/criar-homebrew-municao.dto.ts.dto.ts

import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de MUNIÇÃO
 */
export class HomebrewMunicaoDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsInt()
  duracaoCenas: number; // Quantas cenas dura (1, 2, 3)

  @IsNotEmpty()
  @IsBoolean()
  recuperavel: boolean; // true para flechas, false para balas
}
