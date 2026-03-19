import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

function toNullableInt(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return Number(value);
}

export class AdicionarPersonagemSessaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  personagemCampanhaId!: number;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt()
  @Min(-999)
  @Max(999)
  iniciativaValor?: number | null;
}
