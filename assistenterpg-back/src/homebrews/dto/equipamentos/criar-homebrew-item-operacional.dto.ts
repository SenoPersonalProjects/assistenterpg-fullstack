// src/homebrews/dto/equipamentos/criar-homebrew-item-operacional.dto.ts

import { IsOptional, IsString, IsInt } from 'class-validator';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * DTO para homebrews de ITEM OPERACIONAL
 * Equipamentos táticos e de utilidade geral
 * Ex: Algemas, Corda, Óculos de Visão Térmica, Mochila Militar
 */
export class HomebrewItemOperacionalDto extends EquipamentoBaseDto {
  @IsOptional()
  @IsString()
  periciaBonificada?: string; // Ex: "Atletismo", "Percepção", "Força"

  @IsOptional()
  @IsInt()
  bonusPericia?: number; // Ex: 2, 5, 10

  @IsOptional()
  @IsString()
  efeito?: string; // Descrição do efeito (ex: "Elimina penalidade de camuflagem")
}
