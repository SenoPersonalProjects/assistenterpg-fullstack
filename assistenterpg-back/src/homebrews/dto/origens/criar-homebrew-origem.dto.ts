// src/homebrews/dto/origens/criar-homebrew-origem.dto.ts

import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';

/**
 * DTO para homebrews de ORIGEM
 * Estrutura: { pericias: string[], habilidades: any[] }
 */
export class HomebrewOrigemDto {
  @IsNotEmpty()
  @IsArray()
  pericias: string[]; // Ex: ["Atletismo", "Percepção"]

  @IsOptional()
  @IsArray()
  habilidades?: any[]; // Habilidades especiais da origem
}
