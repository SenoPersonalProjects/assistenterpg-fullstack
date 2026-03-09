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

const parseBooleanQueryValue = ({
  value,
  obj,
  key,
}: {
  value: unknown;
  obj?: Record<string, unknown>;
  key?: string;
}): unknown => {
  const rawValue =
    obj && typeof key === 'string' && key.length > 0 ? obj[key] : value;

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return rawValue;
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
