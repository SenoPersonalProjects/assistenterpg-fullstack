// src/tecnicas-amaldicoadas/dto/filtrar-tecnicas.dto.ts

import {
  IsOptional,
  IsBoolean,
  IsString,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client';

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

export class FiltrarTecnicasDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsEnum(TipoTecnicaAmaldicoada)
  tipo?: TipoTecnicaAmaldicoada;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  hereditaria?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  claId?: number;

  @IsOptional()
  @IsString()
  claNome?: string;

  @IsOptional()
  @IsEnum(TipoFonte)
  fonte?: TipoFonte;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  suplementoId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  incluirHabilidades?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  incluirClas?: boolean;
}
