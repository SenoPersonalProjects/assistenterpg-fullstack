// src/homebrews/dto/caminhos/criar-homebrew-caminho.dto.ts

import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';

/**
 * DTO para homebrews de CAMINHO
 * Similar à Trilha, mas para subclasses específicas
 */
export class HomebrewCaminhoDto {
  @IsOptional()
  requisitos?: any; // JSON livre

  @IsNotEmpty()
  @IsArray()
  habilidades: any[]; // Habilidades do caminho
}
