import { Transform, Type } from 'class-transformer';
import {
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

export class AdicionarNpcSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  npcAmeacaId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nomeExibicao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  vd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500)
  defesa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  pontosVidaMax?: number;

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
  machucado?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(500)
  deslocamentoMetros?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasCena?: string;
}
