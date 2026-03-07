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

export class AdicionarItemDto {
  @IsInt()
  personagemBaseId: number;

  @IsInt()
  equipamentoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantidade?: number = 1;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value ?? false;
  })
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value ?? false;
  })
  ignorarLimitesGrauXama?: boolean = false;
}
