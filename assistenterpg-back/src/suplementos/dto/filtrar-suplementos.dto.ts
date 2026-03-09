// src/suplementos/dto/filtrar-suplementos.dto.ts

import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusPublicacao } from '@prisma/client';

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
