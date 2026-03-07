// src/trilhas/dto/create-trilha.dto.ts

import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoFonte } from '@prisma/client';

// DTO para habilidades da trilha (opcional na criacao)
export class HabilidadeTrilhaDto {
  @IsInt()
  @IsNotEmpty()
  habilidadeId: number;

  @IsInt()
  @IsNotEmpty()
  nivelConcedido: number;

  @IsOptional()
  @IsInt()
  caminhoId?: number; // Se for habilidade especifica de um caminho
}

export class CreateTrilhaDto {
  @IsInt()
  @IsNotEmpty()
  classeId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no maximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Descricao deve ter no maximo 1000 caracteres' })
  descricao?: string;

  @IsOptional()
  requisitos?: any; // JSON livre (ex: nivel minimo, atributos, etc)

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // Habilidades da trilha (opcional na criacao)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeTrilhaDto)
  habilidades?: HabilidadeTrilhaDto[];
}
