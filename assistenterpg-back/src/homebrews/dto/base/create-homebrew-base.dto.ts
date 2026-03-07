// src/homebrews/dto/base/create-homebrew-base.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { StatusPublicacao } from '@prisma/client';

/**
 * DTO Base para criação de homebrews
 * Todos os homebrews compartilham estes campos
 */
export class CreateHomebrewBaseDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao; // Default: RASCUNHO

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  versao?: string; // Default: "1.0.0"
}
