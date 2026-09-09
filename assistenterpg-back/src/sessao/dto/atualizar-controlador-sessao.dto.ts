import { Transform } from 'class-transformer';
import { IsDefined, IsInt, Min, ValidateIf } from 'class-validator';

function normalizarControlador(value: unknown): unknown {
  if (value === null || value === '') return null;
  return Number(value);
}

export class AtualizarControladorSessaoDto {
  @IsDefined()
  @Transform(({ value }) => normalizarControlador(value))
  @ValidateIf((_obj, value) => value !== null)
  @IsInt()
  @Min(1)
  controladorUsuarioId!: number | null;
}
