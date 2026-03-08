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
  if (typeof value === 'string') return parseInt(value, 10);
  return value;
}

function parseBooleanComFallbackFalse(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return false;
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
  @Transform(({ value }: { value: unknown }) => parseIntComFallback(value, 1))
  quantidade?: number = 1;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) =>
    parseBooleanComFallbackFalse(value),
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
  @Transform(({ value }: { value: unknown }) =>
    parseBooleanComFallbackFalse(value),
  )
  ignorarLimitesGrauXama?: boolean = false;
}
