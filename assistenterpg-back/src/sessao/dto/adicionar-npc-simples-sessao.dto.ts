import { Transform, Type } from 'class-transformer';
import {
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
  TamanhoNpcAmeaca,
} from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function toNullableInt(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return Number(value);
}

export class AdicionarNpcSimplesSessaoDto {
  @IsString()
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsEnum(TipoFichaNpcAmeaca)
  fichaTipo?: TipoFichaNpcAmeaca;

  @IsOptional()
  @IsEnum(TipoNpcAmeaca)
  tipo?: TipoNpcAmeaca;

  @IsOptional()
  @IsEnum(TamanhoNpcAmeaca)
  tamanho?: TamanhoNpcAmeaca;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  vd?: number;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-999)
  @Max(999)
  iniciativaValor?: number | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500)
  defesa!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  pontosVidaMax!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99999)
  pontosVidaAtual?: number;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(0)
  @Max(99999)
  sanAtual?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(0)
  @Max(99999)
  sanMax?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(0)
  @Max(99999)
  eaAtual?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(0)
  @Max(99999)
  eaMax?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(0)
  @Max(99999)
  machucado?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500)
  deslocamentoMetros?: number;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-5)
  @Max(10)
  agilidade?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-5)
  @Max(10)
  forca?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-5)
  @Max(10)
  intelecto?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-5)
  @Max(10)
  presenca?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-5)
  @Max(10)
  vigor?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  percepcao?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  iniciativa?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  fortitude?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  reflexos?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  vontade?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  luta?: number | null;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-99)
  @Max(99)
  jujutsu?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasCena?: string;
}
