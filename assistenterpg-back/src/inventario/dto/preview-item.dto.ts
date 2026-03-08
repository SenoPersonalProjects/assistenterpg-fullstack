// src/inventario/dto/preview-item.dto.ts
import { IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';

function parseIntComFallback(value: unknown, fallback: number): unknown {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10);
  return value;
}

export class PreviewItemDto {
  @IsInt()
  personagemBaseId: number;

  @IsInt()
  equipamentoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseIntComFallback(value, 1))
  quantidade?: number = 1;

  // ✅ NOVO: Array de IDs de modificações (opcional, para preview com mods)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  modificacoes?: number[];
}
