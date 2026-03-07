// src/suplementos/dto/create-suplemento.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsArray,
} from 'class-validator';
import { StatusPublicacao } from '@prisma/client';

export class CreateSuplementoDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  versao?: string; // Default: "1.0.0"

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao; // Default: RASCUNHO

  @IsOptional()
  @IsUrl()
  icone?: string;

  @IsOptional()
  @IsUrl()
  banner?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Convertido para JSON no service

  @IsOptional()
  @IsString()
  autor?: string;
}
