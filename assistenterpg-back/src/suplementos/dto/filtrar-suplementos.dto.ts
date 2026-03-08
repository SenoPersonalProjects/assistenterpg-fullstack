// src/suplementos/dto/filtrar-suplementos.dto.ts

import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusPublicacao } from '@prisma/client';

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

export class FiltrarSuplementosDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsEnum(StatusPublicacao)
  status?: StatusPublicacao;

  @IsOptional()
  @IsString()
  autor?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(parseBooleanQueryValue)
  apenasAtivos?: boolean;
}
