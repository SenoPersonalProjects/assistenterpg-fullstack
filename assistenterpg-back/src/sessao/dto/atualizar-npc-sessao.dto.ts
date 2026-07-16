import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
  TamanhoNpcAmeaca,
} from '@prisma/client';
import { AdicionarNpcSessaoDto } from './adicionar-npc-sessao.dto';

function toNullableInt(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return Number(value);
}

export class AtualizarNpcSessaoDto extends PartialType(
  OmitType(AdicionarNpcSessaoDto, ['npcAmeacaId'] as const),
) {
  @IsOptional()
  @IsInt()
  @Min(0)
  pontosVidaAtualEsperado?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sanAtualEsperado?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  eaAtualEsperado?: number;

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
}
