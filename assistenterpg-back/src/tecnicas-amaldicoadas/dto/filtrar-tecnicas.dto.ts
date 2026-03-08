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
