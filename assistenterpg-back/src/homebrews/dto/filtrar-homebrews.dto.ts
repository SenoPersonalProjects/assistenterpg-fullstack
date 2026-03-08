// src/homebrews/dto/filtrar-homebrews.dto.ts

import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoHomebrewConteudo, StatusPublicacao } from '@prisma/client';

const parseBooleanQueryValue = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return value;
};

export class FiltrarHomebrewsDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEnum(TipoHomebrewConteudo)
  tipo?: TipoHomebrewConteudo;

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  usuarioId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  apenasPublicados?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pagina?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limite?: number;
}
