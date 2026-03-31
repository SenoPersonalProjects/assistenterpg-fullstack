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

export class AdicionarItemInventarioCampanhaDto {
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

  @IsOptional()
  @IsString()
  nomeCustomizado?: string | null;

  @IsOptional()
  @IsString()
  notas?: string | null;
}

export class AtualizarItemInventarioCampanhaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(
    ({ value, obj }: { value: unknown; obj?: { quantidade?: unknown } }) =>
      parseIntComFallback(obj?.quantidade ?? value, 1),
  )
  quantidade?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value, obj }: { value: unknown; obj?: { equipado?: unknown } }) =>
      parseBooleanComFallbackFalse(obj?.equipado ?? value),
  )
  equipado?: boolean;

  @IsOptional()
  @IsString()
  nomeCustomizado?: string | null;

  @IsOptional()
  @IsString()
  notas?: string | null;
}

export class AplicarModificacaoInventarioCampanhaDto {
  @IsInt()
  modificacaoId: number;
}
