// src/inventario/dto/atualizar-item.dto.ts
import { IsInt, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

function parseIntSemFallback(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized === '') return undefined;
    if (!/^[+-]?\d+$/.test(normalized)) return value;
    return parseInt(normalized, 10);
  }
  return value;
}

function parseBooleanSemFallback(value: unknown): unknown {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '') return undefined;
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return value;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return undefined;
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
