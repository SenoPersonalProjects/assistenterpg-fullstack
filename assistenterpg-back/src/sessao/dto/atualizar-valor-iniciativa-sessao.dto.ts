import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

function toNullableInt(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return Number(value);
}

export class AtualizarValorIniciativaSessaoDto {
  @IsIn(['PERSONAGEM', 'NPC'], {
    message: 'tipoParticipante deve ser PERSONAGEM ou NPC',
  })
  tipoParticipante!: 'PERSONAGEM' | 'NPC';

  @Type(() => Number)
  @IsInt({ message: 'id deve ser inteiro' })
  @Min(1, { message: 'id deve ser maior que zero' })
  id!: number;

  @IsOptional()
  @Transform(({ value }) => toNullableInt(value))
  @IsInt({ message: 'valorIniciativa deve ser inteiro' })
  @Min(-999, { message: 'valorIniciativa muito baixo' })
  @Max(999, { message: 'valorIniciativa muito alto' })
  valorIniciativa?: number | null;
}
