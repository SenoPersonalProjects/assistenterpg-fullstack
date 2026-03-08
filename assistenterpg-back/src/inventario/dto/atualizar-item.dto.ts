// src/inventario/dto/atualizar-item.dto.ts
import { IsInt, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

function parseIntSemFallback(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10);
  return value;
}

function parseBooleanSemFallback(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return undefined;
  return value;
}

export class AtualizarItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseIntSemFallback(value))
  quantidade?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => parseBooleanSemFallback(value))
  equipado?: boolean;

  @IsOptional()
  @IsString()
  nomeCustomizado?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
