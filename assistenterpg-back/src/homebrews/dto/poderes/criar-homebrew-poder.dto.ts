// src/homebrews/dto/poderes/criar-homebrew-poder.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO para homebrews de PODER GENÉRICO
 * Estrutura: { requisitos: any, efeitos: string, mecanicas: any }
 */
export class HomebrewPoderDto {
  @IsOptional()
  requisitos?: any; // JSON livre

  @IsNotEmpty()
  @IsString()
  efeitos: string; // Descrição dos efeitos

  @IsOptional()
  mecanicas?: any; // JSON com mecânicas (custos, dano, etc.)
}
