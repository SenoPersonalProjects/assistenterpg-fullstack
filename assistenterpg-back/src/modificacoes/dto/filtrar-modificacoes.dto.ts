// src/modificacoes/dto/filtrar-modificacoes.dto.ts

import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TipoModificacao, TipoFonte } from '@prisma/client';

export class FiltrarModificacoesDto {
  @IsOptional()
  @IsEnum(TipoModificacao)
  tipo?: TipoModificacao;

  // ✅ NOVO: Filtrar por fontes múltiplas
  @IsOptional()
  @IsArray()
  @IsEnum(TipoFonte, { each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  fontes?: TipoFonte[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  suplementoId?: number;

  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pagina?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limite?: number = 50;
}
