// src/homebrews/dto/equipamentos/criar-homebrew-protecao.dto.ts

import { IsNotEmpty, IsEnum, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProficienciaProtecao, TipoProtecao, TipoReducaoDano } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';

/**
 * Redução de dano
 */
export class ReducaoDanoDto {
  @IsNotEmpty()
  @IsEnum(TipoReducaoDano)
  tipoReducao: TipoReducaoDano; // FISICO, BALISTICO, ENERGIA_AMALDICOADA, etc.

  @IsNotEmpty()
  @IsInt()
  valor: number; // Ex: 2, 5
}

/**
 * DTO para homebrews de PROTEÇÃO
 */
export class HomebrewProtecaoDto extends EquipamentoBaseDto {
  @IsNotEmpty()
  @IsEnum(ProficienciaProtecao)
  proficienciaProtecao: ProficienciaProtecao; // LEVE, PESADA

  @IsNotEmpty()
  @IsEnum(TipoProtecao)
  tipoProtecao: TipoProtecao; // VESTIVEL, EMPUNHAVEL

  @IsNotEmpty()
  @IsInt()
  bonusDefesa: number;

  @IsNotEmpty()
  @IsInt()
  penalidadeCarga: number; // Geralmente 0 ou negativo (-5)

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReducaoDanoDto)
  reducoesDano: ReducaoDanoDto[]; // Pode ser array vazio []
}
