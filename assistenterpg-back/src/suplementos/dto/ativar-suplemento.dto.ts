// src/suplementos/dto/ativar-suplemento.dto.ts

import { IsInt } from 'class-validator';

export class AtivarSuplementoDto {
  @IsInt()
  suplementoId: number;
}
