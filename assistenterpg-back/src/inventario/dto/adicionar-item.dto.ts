// src/inventario/dto/adicionar-item.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

function parseIntComFallback(value: unknown, fallback: number): unknown {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized === '') return fallback;
    if (!/^[+-]?\d+$/.test(normalized)) return value;
    return parseInt(normalized, 10);
  }
  return value;
}

function parseBooleanComFallbackFalse(value: unknown): unknown {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '' || normalized === 'false' || normalized === '0') {
      return false;
    }
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    return value;
  }
  if (typeof value === 'number') {
    if (value === 0) return false;
    if (value === 1) return true;
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return false;
  return value;
}

export class AdicionarItemDto {
  @IsInt()
  personagemBaseId: number;

  @IsInt()
  equipamentoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(
    ({ value, obj }: { value: unknown; obj?: { quantidade?: unknown } }) =>
      parseIntComFallback(obj?.quantidade ?? value, 1),
  )
  quantidade?: number = 1;

  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value, obj }: { value: unknown; obj?: { equipado?: unknown } }) =>
      parseBooleanComFallbackFalse(obj?.equipado ?? value),
  )
  equipado?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  modificacoes?: number[];

  // ✅ CORRIGIDO: Aceitar null
  @IsOptional()
  @IsString()
  nomeCustomizado?: string | null;

  // ✅ CORRIGIDO: Aceitar null
  @IsOptional()
  @IsString()
  notas?: string | null;

  @IsOptional()
  @IsBoolean()
  @Transform(
    ({
      value,
      obj,
    }: {
      value: unknown;
      obj?: { ignorarLimitesGrauXama?: unknown };
    }) => parseBooleanComFallbackFalse(obj?.ignorarLimitesGrauXama ?? value),
  )
  ignorarLimitesGrauXama?: boolean = false;
}
