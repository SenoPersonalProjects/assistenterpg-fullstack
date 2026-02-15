// src/homebrews/dto/trilhas/criar-homebrew-trilha.dto.ts

import { IsNotEmpty, IsInt, IsArray, IsOptional } from 'class-validator';

/**
 * DTO para homebrews de TRILHA
 * Estrutura: { classeId: number, nivelRequisito: number, habilidades: any[] }
 */
export class HomebrewTrilhaDto {
  @IsNotEmpty()
  @IsInt()
  classeId: number; // ID da classe (ex: 1 = Feiticeiro)

  @IsOptional()
  @IsInt()
  nivelRequisito?: number; // Nível mínimo necessário (default: 1)

  @IsNotEmpty()
  @IsArray()
  habilidades: any[]; // Habilidades da trilha por nível
}
