// src/inventario/dto/atualizar-item.dto.ts
import { IsInt, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AtualizarItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return parseInt(value);
  })
  quantidade?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  equipado?: boolean;

  @IsOptional()
  @IsString()
  nomeCustomizado?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
