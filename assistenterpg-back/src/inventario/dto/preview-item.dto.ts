// src/inventario/dto/preview-item.dto.ts
import { IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PreviewItemDto {
  @IsInt()
  personagemBaseId: number;

  @IsInt()
  equipamentoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantidade?: number = 1;

  // ✅ NOVO: Array de IDs de modificações (opcional, para preview com mods)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  modificacoes?: number[];
}
