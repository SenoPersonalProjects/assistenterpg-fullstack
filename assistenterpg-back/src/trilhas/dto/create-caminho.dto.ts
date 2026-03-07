// src/trilhas/dto/create-caminho.dto.ts

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

export class HabilidadeCaminhoDto {
  @IsInt()
  @IsNotEmpty()
  habilidadeId: number;

  @IsInt()
  @IsNotEmpty()
  nivelConcedido: number;
}

export class CreateCaminhoDto {
  @IsInt()
  @IsNotEmpty()
  trilhaId: number;

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
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  suplementoId?: number;

  // Habilidades especificas do caminho (opcional)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeCaminhoDto)
  habilidades?: HabilidadeCaminhoDto[];
}
