// src/homebrews/dto/clas/criar-homebrew-cla.dto.ts

import { IsNotEmpty, IsArray, IsOptional, IsInt } from 'class-validator';

/**
 * DTO para homebrews de CLÃ
 */
export class HomebrewClaDto {
  @IsOptional()
  @IsInt()
  tecnicaInataId?: number; // ID da técnica hereditária (opcional)

  @IsOptional()
  @IsArray()
  caracteristicas?: any[]; // Características do clã

  @IsOptional()
  requisitos?: any; // JSON livre
}
